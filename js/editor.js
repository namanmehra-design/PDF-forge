/* ============================================================
   PDFForge v6 — PDF Editor (editor.js)
   Canvas-based annotation editor with working drawing tools.
   Uses HTML5 Canvas for both PDF rendering AND annotations.
   ============================================================ */

const PDFEditor = (function() {

  let pdfDoc = null;     // pdf.js document
  let curPage = 0;       // 0-indexed
  let totalPages = 0;
  let scale = 1.5;
  let tool = 'text';
  let annots = {};       // {pageNum: [annotation, ...]}
  let drawing = false;
  let startX, startY;
  let currentAnnot = null;
  let fileBytes = null;

  async function init(file) {
    const area = document.getElementById('editArea');
    area.innerHTML = `
      <div class="editor">
        <div class="ed-toolbar">
          <button class="on" data-t="text" onclick="PDFEditor.setTool('text')">Text</button>
          <button data-t="rect" onclick="PDFEditor.setTool('rect')">Rect</button>
          <button data-t="circle" onclick="PDFEditor.setTool('circle')">Circle</button>
          <button data-t="line" onclick="PDFEditor.setTool('line')">Line</button>
          <button data-t="arrow" onclick="PDFEditor.setTool('arrow')">Arrow</button>
          <button data-t="draw" onclick="PDFEditor.setTool('draw')">Draw</button>
          <button data-t="highlight" onclick="PDFEditor.setTool('highlight')">Highlight</button>
          <button data-t="whiteout" onclick="PDFEditor.setTool('whiteout')">Erase</button>
          <div class="sep"></div>
          <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text2)">
            Color <input type="color" id="edColor" value="#ff0000" style="width:26px;height:26px;border:none;cursor:pointer;border-radius:4px">
          </label>
          <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text2)">
            Size <input type="range" id="edSize" min="1" max="8" value="2" style="width:60px;accent-color:var(--accent)">
          </label>
          <div class="sep"></div>
          <button onclick="PDFEditor.undo()">Undo</button>
          <div style="flex:1"></div>
          <button onclick="PDFEditor.prevPg()">Prev</button>
          <span id="edPgInfo" style="color:var(--text2);font-size:12px;padding:6px 8px">1 / 1</span>
          <button onclick="PDFEditor.nextPg()">Next</button>
        </div>
        <div class="ed-canvas-wrap" id="edWrap">
          <canvas id="edCanvas"></canvas>
        </div>
      </div>
      <button class="btn btn-accent" onclick="PDFEditor.save()">Save Edited PDF</button>`;

    fileBytes = await PF.readBuf(file);
    pdfDoc = await pdfjsLib.getDocument({data: fileBytes}).promise;
    totalPages = pdfDoc.numPages;
    curPage = 0;
    annots = {};
    tool = 'text';
    await renderPage();
    setupCanvas();
  }

  async function renderPage() {
    const page = await pdfDoc.getPage(curPage + 1);
    const viewport = page.getViewport({scale});
    const canvas = document.getElementById('edCanvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    // Render PDF
    await page.render({canvasContext: ctx, viewport}).promise;

    // Draw saved annotations for this page
    (annots[curPage] || []).forEach(a => drawAnnot(ctx, a));

    document.getElementById('edPgInfo').textContent = `${curPage+1} / ${totalPages}`;
  }

  function drawAnnot(ctx, a) {
    ctx.save();
    ctx.strokeStyle = a.color || '#ff0000';
    ctx.fillStyle = a.color || '#ff0000';
    ctx.lineWidth = a.lw || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch(a.type) {
      case 'text':
        ctx.font = `${a.fs || 16}px 'DM Sans', sans-serif`;
        ctx.fillText(a.text, a.x, a.y);
        break;

      case 'rect':
        ctx.strokeRect(a.x, a.y, a.w, a.h);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.ellipse(a.x + a.w/2, a.y + a.h/2, Math.abs(a.w/2), Math.abs(a.h/2), 0, 0, Math.PI*2);
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
        ctx.stroke();
        break;

      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
        ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(a.y2-a.y1, a.x2-a.x1);
        const hl = 12;
        ctx.beginPath();
        ctx.moveTo(a.x2, a.y2);
        ctx.lineTo(a.x2 - hl*Math.cos(angle-0.5), a.y2 - hl*Math.sin(angle-0.5));
        ctx.moveTo(a.x2, a.y2);
        ctx.lineTo(a.x2 - hl*Math.cos(angle+0.5), a.y2 - hl*Math.sin(angle+0.5));
        ctx.stroke();
        break;

      case 'draw':
        if (a.pts && a.pts.length > 1) {
          ctx.beginPath();
          ctx.moveTo(a.pts[0].x, a.pts[0].y);
          for (let i=1;i<a.pts.length;i++) ctx.lineTo(a.pts[i].x, a.pts[i].y);
          ctx.stroke();
        }
        break;

      case 'highlight':
        ctx.globalAlpha = 0.3;
        ctx.fillRect(a.x, a.y, a.w, a.h);
        ctx.globalAlpha = 1;
        break;

      case 'whiteout':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(a.x, a.y, a.w, a.h);
        break;
    }
    ctx.restore();
  }

  function getCanvasPos(e) {
    const canvas = document.getElementById('edCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    ];
  }

  function setupCanvas() {
    const canvas = document.getElementById('edCanvas');

    canvas.onmousedown = function(e) {
      const [mx, my] = getCanvasPos(e);
      startX = mx; startY = my;

      const color = document.getElementById('edColor').value;
      const lw = parseInt(document.getElementById('edSize').value);

      if (tool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          if (!annots[curPage]) annots[curPage] = [];
          annots[curPage].push({type:'text', x:mx, y:my, text, color, fs: 14 + lw*2});
          renderPage();
        }
        return;
      }

      drawing = true;

      if (tool === 'draw') {
        currentAnnot = {type:'draw', pts:[{x:mx, y:my}], color, lw};
      } else if (tool === 'line' || tool === 'arrow') {
        currentAnnot = {type:tool, x1:mx, y1:my, x2:mx, y2:my, color, lw};
      } else {
        currentAnnot = {type:tool, x:mx, y:my, w:0, h:0, color, lw};
      }
    };

    canvas.onmousemove = function(e) {
      if (!drawing || !currentAnnot) return;
      const [mx, my] = getCanvasPos(e);

      if (tool === 'draw') {
        currentAnnot.pts.push({x:mx, y:my});
      } else if (tool === 'line' || tool === 'arrow') {
        currentAnnot.x2 = mx;
        currentAnnot.y2 = my;
      } else {
        currentAnnot.x = Math.min(startX, mx);
        currentAnnot.y = Math.min(startY, my);
        currentAnnot.w = Math.abs(mx - startX);
        currentAnnot.h = Math.abs(my - startY);
      }

      // Re-render page + existing annots + current live annotation
      renderPage().then(() => {
        const ctx = document.getElementById('edCanvas').getContext('2d');
        drawAnnot(ctx, currentAnnot);
      });
    };

    canvas.onmouseup = function() {
      if (drawing && currentAnnot) {
        // Only save if there's meaningful content
        let valid = true;
        if (tool === 'draw' && currentAnnot.pts.length < 2) valid = false;
        if ((tool === 'rect' || tool === 'circle' || tool === 'highlight' || tool === 'whiteout') && Math.abs(currentAnnot.w) < 3 && Math.abs(currentAnnot.h) < 3) valid = false;

        if (valid) {
          if (!annots[curPage]) annots[curPage] = [];
          annots[curPage].push(currentAnnot);
        }
        currentAnnot = null;
      }
      drawing = false;
      renderPage();
    };

    // Touch support
    canvas.ontouchstart = function(e) {
      e.preventDefault();
      const touch = e.touches[0];
      canvas.onmousedown({clientX: touch.clientX, clientY: touch.clientY});
    };
    canvas.ontouchmove = function(e) {
      e.preventDefault();
      const touch = e.touches[0];
      canvas.onmousemove({clientX: touch.clientX, clientY: touch.clientY});
    };
    canvas.ontouchend = function(e) {
      e.preventDefault();
      canvas.onmouseup();
    };
  }

  function setTool(t) {
    tool = t;
    document.querySelectorAll('.ed-toolbar button[data-t]').forEach(b => {
      b.classList.toggle('on', b.dataset.t === t);
    });
    const canvas = document.getElementById('edCanvas');
    canvas.style.cursor = (t === 'text') ? 'text' : 'crosshair';
  }

  function undo() {
    const a = annots[curPage];
    if (a && a.length) { a.pop(); renderPage(); }
  }

  function prevPg() { if (curPage > 0) { curPage--; renderPage().then(setupCanvas); } }
  function nextPg() { if (curPage < totalPages-1) { curPage++; renderPage().then(setupCanvas); } }

  // ===== Save to PDF =====
  async function save() {
    PF.showProg(10);
    try {
      const doc = await PDFLib.PDFDocument.load(fileBytes);
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const s = 1 / scale; // Convert canvas coords back to PDF coords

      for (const [pageIdx, pageAnnots] of Object.entries(annots)) {
        const page = doc.getPage(parseInt(pageIdx));
        const {width, height} = page.getSize();

        pageAnnots.forEach(a => {
          const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1,3),16)/255;
            const g = parseInt(hex.slice(3,5),16)/255;
            const b = parseInt(hex.slice(5,7),16)/255;
            return PDFLib.rgb(r, g, b);
          };
          const color = hexToRgb(a.color || '#ff0000');

          switch(a.type) {
            case 'text':
              page.drawText(a.text, {
                x: a.x * s, y: height - a.y * s,
                size: (a.fs || 16) * s, font, color
              });
              break;
            case 'rect':
              page.drawRectangle({
                x: a.x * s, y: height - (a.y + a.h) * s,
                width: a.w * s, height: a.h * s,
                borderColor: color, borderWidth: (a.lw||2) * s
              });
              break;
            case 'circle':
              page.drawEllipse({
                x: (a.x + a.w/2) * s, y: height - (a.y + a.h/2) * s,
                xScale: Math.abs(a.w/2) * s, yScale: Math.abs(a.h/2) * s,
                borderColor: color, borderWidth: (a.lw||2) * s
              });
              break;
            case 'line': case 'arrow':
              page.drawLine({
                start: {x: a.x1*s, y: height - a.y1*s},
                end: {x: a.x2*s, y: height - a.y2*s},
                color, thickness: (a.lw||2) * s
              });
              break;
            case 'draw':
              if (a.pts && a.pts.length > 1) {
                for (let i=1;i<a.pts.length;i++) {
                  page.drawLine({
                    start: {x: a.pts[i-1].x*s, y: height - a.pts[i-1].y*s},
                    end: {x: a.pts[i].x*s, y: height - a.pts[i].y*s},
                    color, thickness: (a.lw||2) * s
                  });
                }
              }
              break;
            case 'highlight':
              page.drawRectangle({
                x: a.x*s, y: height - (a.y+a.h)*s,
                width: a.w*s, height: a.h*s,
                color, opacity: 0.3
              });
              break;
            case 'whiteout':
              page.drawRectangle({
                x: a.x*s, y: height - (a.y+a.h)*s,
                width: a.w*s, height: a.h*s,
                color: PDFLib.rgb(1,1,1)
              });
              break;
          }
        });
      }

      PF.showProg(80);
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`PDF saved - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'edited.pdf');
    } catch(e) { PF.toast('Error: ' + e.message); }
    PF.hideProg();
  }

  return { init, setTool, undo, prevPg, nextPg, save };

})();
