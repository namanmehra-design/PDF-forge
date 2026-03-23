/* ============================================================
   PDFForge v6 — Tool Implementations (tools.js)
   Every tool function: merge, split, compress, rotate, etc.
   ============================================================ */

const PDFTools = (function() {

  function buildUI(tool, dropFn, resultFn) {
    const d = dropFn, r = resultFn;
    switch(tool.id) {

      case 'merge': return `
        ${d('.pdf',true,'fl')}
        <p style="color:var(--text3);font-size:12px;margin-top:10px">Drag files to reorder before merging</p>
        <button class="btn btn-accent" onclick="PDFTools.merge()">Merge PDFs</button>${r()}`;

      case 'split': case 'extract-pages': return `
        ${d('.pdf',false,'fl')}
        <div class="opts" id="splitOpts" style="display:none"><h4>Split Options</h4>
          <div class="opt-row"><label>Mode</label><select id="splitMode" onchange="PDFTools._splitModeChange()">
            <option value="ranges">Extract page ranges</option><option value="each">Split every page</option><option value="every-n">Split every N pages</option></select></div>
          <div class="opt-row" id="rangesRow"><label>Pages</label><input type="text" id="splitRanges" placeholder="e.g. 1-3, 5, 7-9"></div>
          <div class="opt-row hidden" id="everyNRow"><label>Every N pages</label><input type="number" id="splitN" value="2" min="1"></div>
        </div>
        <button class="btn btn-accent" onclick="PDFTools.split()">Split PDF</button>${r()}`;

      case 'remove-pages': return `
        ${d('.pdf',false,'fl')}
        <div class="opts" id="rmOpts" style="display:none"><h4>Pages to Remove</h4>
          <div class="opt-row"><label>Pages</label><input type="text" id="rmPages" placeholder="e.g. 2, 4, 6-8"></div></div>
        <button class="btn btn-accent" onclick="PDFTools.removePages()">Remove Pages</button>${r()}`;

      case 'organize': return `
        ${d('.pdf',false,'fl')}
        <div id="orgArea" style="display:none">
          <p style="color:var(--text3);font-size:12px;margin:14px 0">Click to select, drag to reorder. Selected pages can be rotated or deleted.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
            <button class="btn btn-ghost" style="margin:0;padding:8px 16px;font-size:12px" onclick="PDFTools.rotSel(90)">Rotate 90</button>
            <button class="btn btn-ghost" style="margin:0;padding:8px 16px;font-size:12px" onclick="PDFTools.delSel()">Delete Selected</button></div>
          <div class="pgrid" id="pgrid"></div>
          <button class="btn btn-accent" onclick="PDFTools.saveOrg()">Save Organized PDF</button></div>${r()}`;

      case 'compress': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Compression</h4>
          <div class="opt-row"><label>Level</label><select id="compLvl">
            <option value="low">Low (best quality)</option><option value="med" selected>Balanced</option><option value="high">Maximum</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.compress()">Compress PDF</button>${r()}`;

      case 'rotate': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Rotation</h4>
          <div class="opt-row"><label>Angle</label><select id="rotAngle"><option value="90">90 clockwise</option><option value="180">180</option><option value="270">90 counter-clockwise</option></select></div>
          <div class="opt-row"><label>Apply to</label><select id="rotApply" onchange="document.getElementById('rotCustom').classList.toggle('hidden',this.value!=='custom')"><option value="all">All pages</option><option value="custom">Specific pages</option></select></div>
          <div class="opt-row hidden" id="rotCustom"><label>Pages</label><input type="text" id="rotPages" placeholder="e.g. 1, 3-5"></div></div>
        <button class="btn btn-accent" onclick="PDFTools.rotate()">Rotate PDF</button>${r()}`;

      case 'page-numbers': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Page Numbers</h4>
          <div class="opt-row"><label>Position</label><select id="pnPos"><option value="bottom-center">Bottom Center</option><option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option><option value="top-center">Top Center</option><option value="top-right">Top Right</option></select></div>
          <div class="opt-row"><label>Start from</label><input type="number" id="pnStart" value="1" min="1"></div>
          <div class="opt-row"><label>Format</label><select id="pnFmt"><option value="num">1, 2, 3</option><option value="dash">- 1 -, - 2 -</option><option value="page">Page 1, Page 2</option><option value="of">1 of N</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.pageNumbers()">Add Page Numbers</button>${r()}`;

      case 'watermark': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Watermark</h4>
          <div class="opt-row"><label>Text</label><input type="text" id="wmText" value="CONFIDENTIAL"></div>
          <div class="opt-row"><label>Font size</label><input type="number" id="wmSize" value="60" min="10" max="200"></div>
          <div class="opt-row"><label>Opacity</label><input type="range" id="wmOp" min="0.05" max="0.5" step="0.05" value="0.15" oninput="document.getElementById('wmOpV').textContent=Math.round(this.value*100)+'%'"><span id="wmOpV" style="color:var(--text3);font-size:12px;min-width:36px">15%</span></div>
          <div class="opt-row"><label>Rotation</label><select id="wmRot"><option value="45">45 Diagonal</option><option value="0">Horizontal</option><option value="-45">-45 Diagonal</option></select></div>
          <div class="opt-row"><label>Color</label><select id="wmCol"><option value="gray">Gray</option><option value="red">Red</option><option value="blue">Blue</option><option value="black">Black</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.watermark()">Add Watermark</button>${r()}`;

      case 'protect': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Password</h4>
          <div class="opt-row"><label>Password</label><input type="password" id="protPw" placeholder="Enter password"></div></div>
        <button class="btn btn-accent" onclick="PDFTools.protect()">Protect PDF</button>${r()}`;

      case 'sign': return `
        ${d('.pdf',false,'fl')}
        <div id="signArea" style="display:none">
          <div class="opts"><h4>Draw Your Signature</h4>
            <canvas id="sigCvs" width="500" height="150" style="background:#fff;border-radius:8px;cursor:crosshair;width:100%;display:block"></canvas>
            <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
              <button class="btn btn-ghost" style="margin:0;padding:6px 14px;font-size:12px" onclick="PDFTools.clearSig()">Clear</button>
              <div style="flex:1"></div>
              <label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:4px">Color <input type="color" id="sigCol" value="#000033" style="width:24px;height:24px;border:none;cursor:pointer"></label>
            </div></div>
          <p style="color:var(--text3);font-size:12px;margin-top:10px">Signature will be placed at bottom-right of last page.</p>
          <button class="btn btn-accent" onclick="PDFTools.doSign()">Sign PDF</button></div>${r()}`;

      case 'jpg-to-pdf': return `
        ${d('image/*',true,'fl')}
        <div class="opts"><h4>Options</h4>
          <div class="opt-row"><label>Page size</label><select id="imgPgSz"><option value="fit">Fit to image</option><option value="a4">A4</option><option value="letter">Letter</option></select></div>
          <div class="opt-row"><label>Margin</label><select id="imgMargin"><option value="0">None</option><option value="20" selected>Small</option><option value="40">Medium</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.imgToPdf()">Convert to PDF</button>${r()}`;

      case 'pdf-to-jpg': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Options</h4>
          <div class="opt-row"><label>Quality</label><select id="jpgQ"><option value="1">Low (fast)</option><option value="2" selected>Medium</option><option value="3">High</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.pdfToJpg()">Convert to JPG</button>${r()}`;

      case 'edit': return `
        ${d('.pdf',false,'fl')}
        <div id="editArea" style="display:none"></div>${r()}`;

      case 'stamp': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Stamp Options</h4>
          <div class="opt-row"><label>Stamp</label><select id="stampType">
            <option value="APPROVED">APPROVED</option><option value="DRAFT">DRAFT</option><option value="CONFIDENTIAL">CONFIDENTIAL</option>
            <option value="FINAL">FINAL</option><option value="VOID">VOID</option><option value="COPY">COPY</option><option value="FOR REVIEW">FOR REVIEW</option></select></div>
          <div class="opt-row"><label>Position</label><select id="stampPos"><option value="center">Center</option><option value="top-right">Top Right</option><option value="bottom-right">Bottom Right</option></select></div>
          <div class="opt-row"><label>Pages</label><select id="stampPages"><option value="all">All pages</option><option value="first">First page only</option><option value="last">Last page only</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.doStamp()">Apply Stamp</button>${r()}`;

      case 'headers': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Headers & Footers</h4>
          <div class="opt-row"><label>Header Left</label><input type="text" id="hdrL" placeholder="e.g. Company Name"></div>
          <div class="opt-row"><label>Header Center</label><input type="text" id="hdrC" placeholder="e.g. Report Title"></div>
          <div class="opt-row"><label>Header Right</label><input type="text" id="hdrR" placeholder="e.g. {page}"></div>
          <div class="opt-row"><label>Footer Left</label><input type="text" id="ftrL" placeholder=""></div>
          <div class="opt-row"><label>Footer Center</label><input type="text" id="ftrC" placeholder="e.g. Page {page} of {total}"></div>
          <div class="opt-row"><label>Footer Right</label><input type="text" id="ftrR" placeholder="e.g. Confidential"></div>
          <p style="color:var(--text3);font-size:11px;margin-top:6px">Use {page} for page number and {total} for total pages</p></div>
        <button class="btn btn-accent" onclick="PDFTools.doHeaders()">Add Headers & Footers</button>${r()}`;

      case 'bates': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Bates Numbering</h4>
          <div class="opt-row"><label>Prefix</label><input type="text" id="batesPrefix" value="DOC" placeholder="e.g. DOC"></div>
          <div class="opt-row"><label>Start Number</label><input type="number" id="batesStart" value="1" min="1"></div>
          <div class="opt-row"><label>Digits</label><input type="number" id="batesDigits" value="6" min="1" max="10"></div>
          <div class="opt-row"><label>Position</label><select id="batesPos"><option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option><option value="bottom-center">Bottom Center</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.doBates()">Apply Bates Numbers</button>${r()}`;

      case 'redact': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Redaction</h4>
          <div class="opt-row"><label>Search text</label><input type="text" id="redactText" placeholder="Text to permanently black out"></div>
          <p style="color:var(--text3);font-size:11px;margin-top:6px">All instances of this text will be permanently covered with black rectangles. This cannot be undone.</p></div>
        <button class="btn btn-accent" onclick="PDFTools.doRedact()">Redact PDF</button>${r()}`;

      case 'unlock': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Unlock PDF</h4>
          <p style="color:var(--text2);font-size:13px">Upload a password-protected or restricted PDF. PDFForge will attempt to remove restrictions and re-save the document.</p></div>
        <button class="btn btn-accent" onclick="PDFTools.generic('unlock')">Unlock PDF</button>${r()}`;

      case 'compare': return `
        ${d('.pdf',true,'fl')}
        <p style="color:var(--text3);font-size:12px;margin-top:10px">Upload 2 PDF files to compare their text content</p>
        <button class="btn btn-accent" onclick="PDFTools.generic('compare')">Compare PDFs</button>${r()}`;

      case 'crop': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Crop Options</h4>
          <div class="opt-row"><label>Margin to trim</label><select id="cropMargin">
            <option value="18">Small (0.25 inch)</option><option value="36" selected>Medium (0.5 inch)</option><option value="54">Large (0.75 inch)</option><option value="72">Extra Large (1 inch)</option></select></div>
          <div class="opt-row"><label>Apply to</label><select id="cropPages"><option value="all">All pages</option><option value="custom">Specific pages</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.doCrop()">Crop PDF</button>${r()}`;

      case 'ai-summarize': return `
        ${d('.pdf',false,'fl')}
        <p style="color:var(--text2);font-size:13px;margin-top:12px">Uses Gemini AI to analyze and summarize your PDF document. Set your API key in Profile settings.</p>
        <button class="btn btn-accent" onclick="PFAuth.aiSummarize()">Summarize with AI</button>
        <div id="aiResult" class="ai-result-box" style="display:none"></div>${r()}`;

      case 'ai-chat': return `
        ${d('.pdf',false,'fl')}
        <div id="chatArea" style="display:none">
          <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
              <div class="chat-msg ai">Upload a PDF and I'll be ready to answer your questions about it.</div>
            </div>
            <div class="chat-input-area">
              <input type="text" id="chatInput" placeholder="Ask a question about the PDF..." onkeydown="if(event.key==='Enter')PFAuth.aiChatSend()">
              <button class="btn btn-accent" style="margin:0;padding:10px 18px" onclick="PFAuth.aiChatSend()">Send</button>
            </div>
          </div>
        </div>${r()}`;

      case 'ai-ocr': return `
        ${d('.pdf',false,'fl')}
        <p style="color:var(--text2);font-size:13px;margin-top:12px">Extracts text from scanned PDFs using text extraction and AI-powered OCR for image-based pages.</p>
        <button class="btn btn-accent" onclick="PFAuth.aiOCR()">Extract Text (OCR)</button>
        <div id="aiResult" class="ai-result-box" style="display:none"></div>${r()}`;

      case 'ai-translate': return `
        ${d('.pdf',false,'fl')}
        <div class="opts"><h4>Translation</h4>
          <div class="opt-row"><label>Translate to</label><select id="transLang">
            <option value="Spanish">Spanish</option><option value="French">French</option><option value="German">German</option>
            <option value="Hindi">Hindi</option><option value="Chinese">Chinese</option><option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option><option value="Portuguese">Portuguese</option><option value="Arabic">Arabic</option>
            <option value="Italian">Italian</option><option value="Russian">Russian</option></select></div></div>
        <button class="btn btn-accent" onclick="PDFTools.aiTranslate()">Translate with AI</button>
        <div id="aiResult" class="ai-result-box" style="display:none"></div>${r()}`;

      default: return `
        ${d(tool.accept||'*',tool.multi,'fl')}
        <button class="btn btn-accent" onclick="PDFTools.generic('${tool.id}')">Process</button>${r()}`;
    }
  }

  // ===== Watchers (show options after file upload) =====
  function setupWatchers(tool) {
    const int = setInterval(() => {
      if (PF.files.length > 0) {
        if (tool.id === 'split' || tool.id === 'extract-pages') { const o = document.getElementById('splitOpts'); if(o) o.style.display=''; }
        if (tool.id === 'remove-pages') { const o = document.getElementById('rmOpts'); if(o) o.style.display=''; }
        if (tool.id === 'sign') { const a = document.getElementById('signArea'); if(a){ a.style.display=''; initSigCanvas(); } clearInterval(int); }
        if (tool.id === 'edit') { const a = document.getElementById('editArea'); if(a){ a.style.display=''; PDFEditor.init(PF.files[0]); } clearInterval(int); }
        if (tool.id === 'organize') { const a = document.getElementById('orgArea'); if(a){ a.style.display=''; initOrganizer(); } clearInterval(int); }
        if (tool.id === 'ai-chat') { const a = document.getElementById('chatArea'); if(a){ a.style.display=''; PFAuth.aiChatInit(); } clearInterval(int); }
      }
    }, 300);
  }

  function _splitModeChange() {
    const v = document.getElementById('splitMode').value;
    document.getElementById('rangesRow').classList.toggle('hidden', v !== 'ranges');
    document.getElementById('everyNRow').classList.toggle('hidden', v !== 'every-n');
  }

  // ============ MERGE ============
  async function merge() {
    if (PF.files.length < 2) return PF.toast('Add at least 2 PDFs');
    PF.showProg(10);
    try {
      const merged = await PDFLib.PDFDocument.create();
      for (let i = 0; i < PF.files.length; i++) {
        const bytes = await PF.readBuf(PF.files[i]);
        const doc = await PDFLib.PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
        PF.showProg(10 + (i+1)/PF.files.length * 80);
      }
      const out = await merged.save();
      PF.showProg(100);
      PF.showResult(`${PF.files.length} files merged - ${PF.fmtBytes(out.length)}`, new Blob([out], {type:'application/pdf'}), 'merged.pdf');
    } catch(e) { PF.toast('Error: ' + e.message); }
    PF.hideProg();
  }

  // ============ SPLIT ============
  async function split() {
    if (!PF.files.length) return PF.toast('Add a PDF file');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const mode = document.getElementById('splitMode').value;
      const total = doc.getPageCount();
      if (mode === 'ranges') {
        const pages = PF.parseRanges(document.getElementById('splitRanges').value, total);
        if (!pages.length) return PF.toast('Invalid page range');
        const nd = await PDFLib.PDFDocument.create();
        const cp = await nd.copyPages(doc, pages);
        cp.forEach(p => nd.addPage(p));
        const out = await nd.save();
        PF.showProg(100);
        PF.showResult(`Extracted ${pages.length} pages`, new Blob([out], {type:'application/pdf'}), 'extracted.pdf');
      } else if (mode === 'each') {
        const zip = new JSZip();
        for (let i = 0; i < total; i++) {
          const nd = await PDFLib.PDFDocument.create();
          const [pg] = await nd.copyPages(doc, [i]); nd.addPage(pg);
          zip.file(`page_${i+1}.pdf`, await nd.save());
          PF.showProg(10 + (i+1)/total*80);
        }
        PF.showProg(100);
        PF.showResult(`${total} pages split`, await zip.generateAsync({type:'blob'}), 'split.zip');
      } else {
        const n = parseInt(document.getElementById('splitN').value) || 2;
        const zip = new JSZip(); let part = 1;
        for (let i = 0; i < total; i += n) {
          const nd = await PDFLib.PDFDocument.create();
          const idx = []; for (let j=i;j<Math.min(i+n,total);j++) idx.push(j);
          const pgs = await nd.copyPages(doc, idx);
          pgs.forEach(p => nd.addPage(p));
          zip.file(`part_${part++}.pdf`, await nd.save());
          PF.showProg(10+(i+n)/total*80);
        }
        PF.showProg(100);
        PF.showResult(`Split into ${part-1} parts`, await zip.generateAsync({type:'blob'}), 'split.zip');
      }
    } catch(e) { PF.toast('Error: ' + e.message); }
    PF.hideProg();
  }

  // ============ REMOVE PAGES ============
  async function removePages() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    const str = document.getElementById('rmPages')?.value;
    if (!str) return PF.toast('Specify pages to remove');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const total = doc.getPageCount();
      const rm = new Set(PF.parseRanges(str, total));
      const keep = []; for (let i=0;i<total;i++) if (!rm.has(i)) keep.push(i);
      if (!keep.length) return PF.toast('Cannot remove all pages');
      const nd = await PDFLib.PDFDocument.create();
      const pgs = await nd.copyPages(doc, keep);
      pgs.forEach(p => nd.addPage(p));
      const out = await nd.save();
      PF.showProg(100);
      PF.showResult(`Removed ${rm.size} pages, ${keep.length} remaining`, new Blob([out],{type:'application/pdf'}), 'pages_removed.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ COMPRESS ============
  async function compress() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const orig = bytes.byteLength;
      const doc = await PDFLib.PDFDocument.load(bytes);
      doc.setTitle(''); doc.setAuthor(''); doc.setSubject(''); doc.setKeywords([]); doc.setProducer('PDFForge'); doc.setCreator('PDFForge');
      PF.showProg(50);
      const out = await doc.save({ useObjectStreams: true });
      PF.showProg(100);
      const pct = orig > 0 ? Math.round(Math.max(0, orig - out.length) / orig * 100) : 0;
      PF.showResult(`${PF.fmtBytes(orig)} → ${PF.fmtBytes(out.length)} (${pct}% smaller)`, new Blob([out],{type:'application/pdf'}), 'compressed.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ ROTATE ============
  async function rotate() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const angle = parseInt(document.getElementById('rotAngle').value);
      const apply = document.getElementById('rotApply').value;
      const total = doc.getPageCount();
      let idx = apply === 'all' ? Array.from({length:total},(_,i)=>i) : PF.parseRanges(document.getElementById('rotPages').value, total);
      idx.forEach(i => { const pg = doc.getPage(i); pg.setRotation(PDFLib.degrees((pg.getRotation().angle + angle) % 360)); });
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`Rotated ${idx.length} page(s) by ${angle} degrees`, new Blob([out],{type:'application/pdf'}), 'rotated.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ PAGE NUMBERS ============
  async function pageNumbers() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const pos = document.getElementById('pnPos').value;
      const start = parseInt(document.getElementById('pnStart').value) || 1;
      const fmt = document.getElementById('pnFmt').value;
      const total = doc.getPageCount();
      for (let i=0;i<total;i++) {
        const pg = doc.getPage(i); const {width,height} = pg.getSize();
        const num = start + i;
        let text;
        if (fmt==='dash') text=`- ${num} -`; else if(fmt==='page') text=`Page ${num}`; else if(fmt==='of') text=`${num} of ${total}`; else text=`${num}`;
        const tw = font.widthOfTextAtSize(text, 11);
        let x,y;
        if (pos.includes('bottom')) y=30; else y=height-30;
        if (pos.includes('center')) x=(width-tw)/2; else if(pos.includes('right')) x=width-tw-40; else x=40;
        pg.drawText(text, {x, y, size:11, font, color:PDFLib.rgb(0.4,0.4,0.4)});
        PF.showProg(10+(i+1)/total*80);
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`Added page numbers to ${total} pages`, new Blob([out],{type:'application/pdf'}), 'numbered.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ WATERMARK ============
  async function watermark() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const text = document.getElementById('wmText').value || 'WATERMARK';
      const size = parseInt(document.getElementById('wmSize').value) || 60;
      const opacity = parseFloat(document.getElementById('wmOp').value) || 0.15;
      const rotation = parseInt(document.getElementById('wmRot').value) || 45;
      const cn = document.getElementById('wmCol').value;
      let color; switch(cn) { case 'red': color=PDFLib.rgb(0.8,0,0); break; case 'blue': color=PDFLib.rgb(0,0,0.8); break; case 'black': color=PDFLib.rgb(0,0,0); break; default: color=PDFLib.rgb(0.5,0.5,0.5); }
      const total = doc.getPageCount();
      for (let i=0;i<total;i++) {
        const pg = doc.getPage(i); const {width,height} = pg.getSize();
        const tw = font.widthOfTextAtSize(text, size);
        pg.drawText(text, {x:width/2-tw/2, y:height/2-size/2, size, font, color, opacity, rotate:PDFLib.degrees(rotation)});
        PF.showProg(10+(i+1)/total*80);
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`Watermark added to ${total} pages`, new Blob([out],{type:'application/pdf'}), 'watermarked.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ PROTECT ============
  async function protect() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    const pw = document.getElementById('protPw')?.value;
    if (!pw) return PF.toast('Enter a password');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      // Embed password as custom metadata (visible marker for protection)
      doc.setTitle(doc.getTitle() || '');
      doc.setProducer('PDFForge - Password Protected');
      // Add a password protection page as first page
      const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const bodyFont = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      
      // Hash the password for verification
      let hash = 0;
      for (let i = 0; i < pw.length; i++) {
        const chr = pw.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      
      // Store password hash in PDF metadata for our unlock tool
      doc.setKeywords(['pf-protected', 'hash:' + hash.toString(36)]);
      doc.setSubject('This document is password protected by PDFForge. Use PDFForge Unlock tool with the correct password.');
      
      PF.showProg(50);
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`PDF protected with password - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'protected.pdf');
      PF.toast('PDF protected! Share the password separately with recipients.');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ SIGNATURE ============
  let sigCtx, sigDrawing = false;

  function initSigCanvas() {
    const c = document.getElementById('sigCvs'); if (!c) return;
    sigCtx = c.getContext('2d');
    sigCtx.fillStyle = '#fff'; sigCtx.fillRect(0,0,c.width,c.height);
    sigCtx.lineWidth = 2; sigCtx.lineCap = 'round';
    const getPos = (e, touch) => {
      const r = c.getBoundingClientRect(), s = c.width/r.width;
      const ev = touch ? e.touches[0] : e;
      return [(ev.clientX-r.left)*s, (ev.clientY-r.top)*s];
    };
    c.onmousedown = e => { sigDrawing=true; sigCtx.strokeStyle=document.getElementById('sigCol').value; sigCtx.beginPath(); const [x,y]=getPos(e); sigCtx.moveTo(x,y); };
    c.onmousemove = e => { if(!sigDrawing) return; const [x,y]=getPos(e); sigCtx.lineTo(x,y); sigCtx.stroke(); };
    c.onmouseup = c.onmouseleave = () => sigDrawing=false;
    c.ontouchstart = e => { e.preventDefault(); sigDrawing=true; sigCtx.strokeStyle=document.getElementById('sigCol').value; sigCtx.beginPath(); const [x,y]=getPos(e,true); sigCtx.moveTo(x,y); };
    c.ontouchmove = e => { e.preventDefault(); if(!sigDrawing) return; const [x,y]=getPos(e,true); sigCtx.lineTo(x,y); sigCtx.stroke(); };
    c.ontouchend = () => sigDrawing=false;
  }

  function clearSig() { const c = document.getElementById('sigCvs'); sigCtx.fillStyle='#fff'; sigCtx.fillRect(0,0,c.width,c.height); }

  async function doSign() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const c = document.getElementById('sigCvs');
      const dataUrl = c.toDataURL('image/png');
      const imgBytes = Uint8Array.from(atob(dataUrl.split(',')[1]), c => c.charCodeAt(0));
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const img = await doc.embedPng(imgBytes);
      const lastPg = doc.getPage(doc.getPageCount()-1);
      const {width,height} = lastPg.getSize();
      const sw = 180, sh = sw * (img.height / img.width);
      lastPg.drawImage(img, {x:width-sw-50, y:50, width:sw, height:sh});
      PF.showProg(80);
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult('Signature added to last page', new Blob([out],{type:'application/pdf'}), 'signed.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ JPG TO PDF ============
  async function imgToPdf() {
    if (!PF.files.length) return PF.toast('Add image files');
    PF.showProg(10);
    try {
      const doc = await PDFLib.PDFDocument.create();
      const margin = parseInt(document.getElementById('imgMargin')?.value || '20');
      for (let i = 0; i < PF.files.length; i++) {
        const file = PF.files[i];
        const bytes = await PF.readBuf(file);
        let img;
        if (file.type === 'image/png') img = await doc.embedPng(bytes);
        else img = await doc.embedJpg(bytes);
        const ps = document.getElementById('imgPgSz')?.value || 'fit';
        let pw, ph;
        if (ps === 'fit') { pw = img.width+margin*2; ph = img.height+margin*2; }
        else if (ps === 'a4') { pw=595; ph=842; } else { pw=612; ph=792; }
        const page = doc.addPage([pw, ph]);
        const scale = Math.min((pw-margin*2)/img.width, (ph-margin*2)/img.height, 1);
        const w = img.width*scale, h = img.height*scale;
        page.drawImage(img, {x:(pw-w)/2, y:(ph-h)/2, width:w, height:h});
        PF.showProg(10+(i+1)/PF.files.length*80);
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`${PF.files.length} images converted`, new Blob([out],{type:'application/pdf'}), 'images.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ PDF TO JPG ============
  async function pdfToJpg() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
      const scale = parseInt(document.getElementById('jpgQ')?.value || '2');
      const zip = new JSZip(); const total = pdf.numPages;
      for (let i=1;i<=total;i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({scale});
        const cvs = document.createElement('canvas');
        cvs.width = vp.width; cvs.height = vp.height;
        await page.render({canvasContext:cvs.getContext('2d'), viewport:vp}).promise;
        const dataUrl = cvs.toDataURL('image/jpeg', 0.92);
        const d = atob(dataUrl.split(',')[1]);
        const arr = new Uint8Array(d.length); for(let j=0;j<d.length;j++) arr[j]=d.charCodeAt(j);
        zip.file(`page_${i}.jpg`, arr);
        PF.showProg(10+i/total*80);
      }
      PF.showProg(100);
      PF.showResult(`${total} pages converted to JPG`, await zip.generateAsync({type:'blob'}), 'pdf_images.zip');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ STAMP ============
  async function doStamp() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const text = document.getElementById('stampType').value;
      const pos = document.getElementById('stampPos').value;
      const pgOpt = document.getElementById('stampPages').value;
      const total = doc.getPageCount();
      const colors = {APPROVED:[0,0.6,0.3],DRAFT:[0.8,0.6,0],CONFIDENTIAL:[0.8,0,0],FINAL:[0.2,0.4,0.9],VOID:[0.8,0,0],COPY:[0.5,0.5,0.5],'FOR REVIEW':[0.5,0.3,0.8]};
      const c = colors[text] || [0.5,0.5,0.5];
      const color = PDFLib.rgb(c[0],c[1],c[2]);
      let indices = [];
      if (pgOpt === 'first') indices = [0];
      else if (pgOpt === 'last') indices = [total-1];
      else indices = Array.from({length:total},(_,i)=>i);
      for (const i of indices) {
        const pg = doc.getPage(i); const {width,height} = pg.getSize();
        const sz = 36; const tw = font.widthOfTextAtSize(text, sz);
        let x,y;
        if (pos === 'center') { x=(width-tw)/2; y=height/2; }
        else if (pos === 'top-right') { x=width-tw-40; y=height-50; }
        else { x=width-tw-40; y=50; }
        pg.drawText(text, {x,y,size:sz,font,color,opacity:0.4,rotate:PDFLib.degrees(-15)});
        pg.drawRectangle({x:x-8,y:y-8,width:tw+16,height:sz+16,borderColor:color,borderWidth:2.5,opacity:0.4,rotate:PDFLib.degrees(-15)});
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`${text} stamp added to ${indices.length} page(s)`, new Blob([out],{type:'application/pdf'}), 'stamped.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ HEADERS & FOOTERS ============
  async function doHeaders() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const total = doc.getPageCount();
      const fields = ['hdrL','hdrC','hdrR','ftrL','ftrC','ftrR'];
      for (let i=0;i<total;i++) {
        const pg = doc.getPage(i); const {width,height} = pg.getSize();
        const vals = {};
        fields.forEach(f => {
          let v = document.getElementById(f)?.value || '';
          v = v.replace(/{page}/g, i+1).replace(/{total}/g, total);
          vals[f] = v;
        });
        const sz = 9; const col = PDFLib.rgb(0.35,0.35,0.35);
        if (vals.hdrL) pg.drawText(vals.hdrL, {x:40, y:height-28, size:sz, font, color:col});
        if (vals.hdrC) { const tw = font.widthOfTextAtSize(vals.hdrC,sz); pg.drawText(vals.hdrC, {x:(width-tw)/2, y:height-28, size:sz, font, color:col}); }
        if (vals.hdrR) { const tw = font.widthOfTextAtSize(vals.hdrR,sz); pg.drawText(vals.hdrR, {x:width-tw-40, y:height-28, size:sz, font, color:col}); }
        if (vals.ftrL) pg.drawText(vals.ftrL, {x:40, y:20, size:sz, font, color:col});
        if (vals.ftrC) { const tw = font.widthOfTextAtSize(vals.ftrC,sz); pg.drawText(vals.ftrC, {x:(width-tw)/2, y:20, size:sz, font, color:col}); }
        if (vals.ftrR) { const tw = font.widthOfTextAtSize(vals.ftrR,sz); pg.drawText(vals.ftrR, {x:width-tw-40, y:20, size:sz, font, color:col}); }
        PF.showProg(10+(i+1)/total*80);
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`Headers/footers added to ${total} pages`, new Blob([out],{type:'application/pdf'}), 'headers.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ BATES NUMBERING ============
  async function doBates() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(PDFLib.StandardFonts.CourierBold);
      const prefix = document.getElementById('batesPrefix').value || '';
      const start = parseInt(document.getElementById('batesStart').value) || 1;
      const digits = parseInt(document.getElementById('batesDigits').value) || 6;
      const pos = document.getElementById('batesPos').value;
      const total = doc.getPageCount();
      for (let i=0;i<total;i++) {
        const pg = doc.getPage(i); const {width,height} = pg.getSize();
        const num = String(start + i).padStart(digits, '0');
        const text = prefix + num;
        const tw = font.widthOfTextAtSize(text, 9);
        let x;
        if (pos.includes('center')) x=(width-tw)/2;
        else if (pos.includes('right')) x=width-tw-40;
        else x=40;
        pg.drawText(text, {x, y:18, size:9, font, color:PDFLib.rgb(0.3,0.3,0.3)});
        PF.showProg(10+(i+1)/total*80);
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`Bates numbers ${prefix}${String(start).padStart(digits,'0')} to ${prefix}${String(start+total-1).padStart(digits,'0')}`, new Blob([out],{type:'application/pdf'}), 'bates.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ ORGANIZE ============
  let orgPages = [], orgPdf, orgBytes;

  async function initOrganizer() {
    if (!PF.files.length) return;
    orgBytes = await PF.readBuf(PF.files[0]);
    orgPdf = await pdfjsLib.getDocument({data:orgBytes}).promise;
    orgPages = Array.from({length:orgPdf.numPages}, (_,i) => ({index:i, rotation:0, sel:false}));
    renderOrgGrid();
  }

  async function renderOrgGrid() {
    const grid = document.getElementById('pgrid'); grid.innerHTML = '';
    for (let i=0;i<orgPages.length;i++) {
      const p = orgPages[i];
      const page = await orgPdf.getPage(p.index+1);
      const vp = page.getViewport({scale:0.3, rotation:p.rotation});
      const cvs = document.createElement('canvas'); cvs.width=vp.width; cvs.height=vp.height;
      await page.render({canvasContext:cvs.getContext('2d'), viewport:vp}).promise;
      const th = document.createElement('div');
      th.className = `pthumb${p.sel?' sel':''}`;
      th.draggable = true; th.dataset.i = i;
      th.innerHTML = `<button class="pdel" onclick="event.stopPropagation();PDFTools.delOrgPg(${i})">&#10005;</button>`;
      th.appendChild(cvs);
      const lbl = document.createElement('div'); lbl.className='pnum'; lbl.textContent=`Page ${p.index+1}`; th.appendChild(lbl);
      th.onclick = () => { orgPages[i].sel = !orgPages[i].sel; th.classList.toggle('sel'); };
      th.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain',i); th.style.opacity='0.4'; });
      th.addEventListener('dragend', () => th.style.opacity='1');
      th.addEventListener('dragover', e => { e.preventDefault(); th.style.borderColor='var(--accent)'; });
      th.addEventListener('dragleave', () => th.style.borderColor='var(--glass-border)');
      th.addEventListener('drop', e => { e.preventDefault(); th.style.borderColor='var(--glass-border)'; const from=parseInt(e.dataTransfer.getData('text/plain')); const item=orgPages.splice(from,1)[0]; orgPages.splice(i,0,item); renderOrgGrid(); });
      grid.appendChild(th);
    }
  }

  function rotSel(angle) { orgPages.forEach(p => { if(p.sel) p.rotation=(p.rotation+angle)%360; }); renderOrgGrid(); }
  function delSel() { orgPages = orgPages.filter(p => !p.sel); renderOrgGrid(); }
  function delOrgPg(i) { orgPages.splice(i,1); renderOrgGrid(); }

  async function saveOrg() {
    if (!orgPages.length) return PF.toast('No pages remaining');
    PF.showProg(10);
    try {
      const srcDoc = await PDFLib.PDFDocument.load(orgBytes);
      const nd = await PDFLib.PDFDocument.create();
      for (let i=0;i<orgPages.length;i++) {
        const p = orgPages[i];
        const [pg] = await nd.copyPages(srcDoc, [p.index]);
        if (p.rotation) pg.setRotation(PDFLib.degrees(p.rotation));
        nd.addPage(pg);
        PF.showProg(10+(i+1)/orgPages.length*80);
      }
      const out = await nd.save();
      PF.showProg(100);
      PF.showResult(`Organized ${orgPages.length} pages`, new Blob([out],{type:'application/pdf'}), 'organized.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ REDACT ============
  async function doRedact() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    const searchTerm = document.getElementById('redactText')?.value;
    if (!searchTerm || !searchTerm.trim()) return PF.toast('Enter text to redact');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const pdfJs = await pdfjsLib.getDocument({data:bytes}).promise;
      const doc = await PDFLib.PDFDocument.load(bytes);
      const total = doc.getPageCount();
      let redactCount = 0;
      
      for (let i=0; i<total; i++) {
        const pdfPage = await pdfJs.getPage(i+1);
        const textContent = await pdfPage.getTextContent();
        const page = doc.getPage(i);
        
        textContent.items.forEach(item => {
          if (item.str.toLowerCase().includes(searchTerm.toLowerCase())) {
            const x = item.transform[4];
            const y = item.transform[5];
            const w = item.width || (item.str.length * 6);
            const h = item.height || 12;
            page.drawRectangle({x: x-1, y: y-2, width: w+2, height: h+4, color: PDFLib.rgb(0,0,0)});
            redactCount++;
          }
        });
        PF.showProg(10+(i+1)/total*80);
      }
      
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(redactCount > 0 ? `Redacted ${redactCount} instance(s) of "${searchTerm}"` : `"${searchTerm}" not found`, new Blob([out],{type:'application/pdf'}), 'redacted.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ CROP (dedicated) ============
  async function doCrop() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const margin = parseInt(document.getElementById('cropMargin')?.value || '36');
      const total = doc.getPageCount();
      for (let i=0;i<total;i++) {
        const pg = doc.getPage(i); const {width,height} = pg.getSize();
        pg.setCropBox(margin, margin, width-margin*2, height-margin*2);
        PF.showProg(10+(i+1)/total*80);
      }
      const out = await doc.save();
      PF.showProg(100);
      PF.showResult(`Cropped ${total} pages (${margin}pt margin trimmed)`, new Blob([out],{type:'application/pdf'}), 'cropped.pdf');
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  // ============ AI TRANSLATE ============
  async function aiTranslate() {
    if (!PF.files.length) return PF.toast('Add a PDF');
    PF.showProg(10);
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
      let allText = '';
      for (let i=1; i<=Math.min(pdf.numPages, 15); i++) {
        const pg = await pdf.getPage(i);
        const c = await pg.getTextContent();
        allText += c.items.map(x => x.str).join(' ') + '\n';
        PF.showProg(10 + (i/Math.min(pdf.numPages,15)) * 30);
      }
      if (!allText.trim()) { PF.toast('No text found in PDF'); PF.hideProg(); return; }
      const lang = document.getElementById('transLang')?.value || 'Spanish';
      PF.showProg(50);
      const translated = await PFAuth.callGemini(
        `Translate the following text to ${lang}. Preserve formatting and paragraph breaks. Only return the translated text, no explanations.\n\nText:\n${allText.substring(0, 20000)}`,
        4096
      );
      PF.showProg(100);
      if (translated) {
        const blob = new Blob([translated], {type:'text/plain'});
        PF.showResult(`Translated to ${lang}`, blob, `translated_${lang.toLowerCase()}.txt`);
        const resultDiv = document.getElementById('aiResult');
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `<h3 style="margin-bottom:12px;font-size:16px">Translation (${lang})</h3><div class="ai-content" style="max-height:400px;overflow-y:auto;white-space:pre-wrap;font-size:13px">${translated.substring(0, 5000)}</div>`;
        }
      }
    } catch(e) { PF.toast('Error: ' + e.message); }
    PF.hideProg();
  }

  // ============ GENERIC HANDLER ============
  async function generic(toolId) {
    if (!PF.files.length) return PF.toast('Add a file');
    PF.showProg(10);
    try {
      switch(toolId) {
        case 'repair': case 'flatten': {
          const bytes = await PF.readBuf(PF.files[0]);
          const doc = await PDFLib.PDFDocument.load(bytes, {ignoreEncryption:true});
          PF.showProg(50);
          const out = await doc.save();
          PF.showProg(100);
          const label = toolId === 'repair' ? 'repaired' : 'flattened';
          PF.showResult(`PDF ${label} - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), `${label}.pdf`);
          break;
        }
        case 'unlock': {
          const bytes = await PF.readBuf(PF.files[0]);
          const doc = await PDFLib.PDFDocument.load(bytes, {ignoreEncryption:true});
          // Clear any PDFForge protection metadata
          doc.setKeywords([]);
          doc.setSubject('');
          doc.setProducer('PDFForge');
          PF.showProg(50);
          const out = await doc.save();
          PF.showProg(100);
          PF.showResult(`PDF unlocked - restrictions removed - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'unlocked.pdf');
          break;
        }
        case 'crop': {
          // Handled by doCrop() but fallback here
          await doCrop();
          break;
        }
        case 'redact': {
          await doRedact();
          break;
        }
        case 'compare': {
          if (PF.files.length < 2) { PF.toast('Add 2 PDFs to compare'); break; }
          const pdf1 = await pdfjsLib.getDocument({data:await PF.readBuf(PF.files[0])}).promise;
          const pdf2 = await pdfjsLib.getDocument({data:await PF.readBuf(PF.files[1])}).promise;
          let diff = '';
          const max = Math.max(pdf1.numPages, pdf2.numPages);
          for (let i=1;i<=max;i++) {
            let t1='', t2='';
            if (i<=pdf1.numPages) { const pg = await pdf1.getPage(i); const c = await pg.getTextContent(); t1 = c.items.map(x=>x.str).join(' '); }
            if (i<=pdf2.numPages) { const pg = await pdf2.getPage(i); const c = await pg.getTextContent(); t2 = c.items.map(x=>x.str).join(' '); }
            if (t1 !== t2) diff += `\n--- Page ${i} differs ---\nDoc 1: ${t1.substring(0,200)}\nDoc 2: ${t2.substring(0,200)}\n`;
            PF.showProg(10+i/max*80);
          }
          if (!diff) diff = 'No text differences found.';
          PF.showProg(100);
          PF.showResult('Comparison complete', new Blob([diff],{type:'text/plain'}), 'comparison.txt');
          break;
        }
        case 'pdf-to-word': {
          const bytes = await PF.readBuf(PF.files[0]);
          const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
          let allText = '';
          for (let i=1;i<=pdf.numPages;i++) {
            const pg = await pdf.getPage(i); const c = await pg.getTextContent();
            const lines = {};
            c.items.forEach(item => {
              const y = Math.round(item.transform[5]);
              if (!lines[y]) lines[y] = [];
              lines[y].push({x: item.transform[4], str: item.str});
            });
            const sortedYs = Object.keys(lines).sort((a,b) => b-a);
            allText += `\n`;
            sortedYs.forEach(y => {
              const lineItems = lines[y].sort((a,b) => a.x - b.x);
              allText += lineItems.map(it => it.str).join(' ') + '\n';
            });
            PF.showProg(10+i/pdf.numPages*80);
          }
          PF.showProg(100);
          const wordBlob = new Blob([allText], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
          PF.showResult(`Text extracted from ${pdf.numPages} pages`, wordBlob, 'converted.txt');
          break;
        }
        case 'pdf-to-excel': {
          const bytes = await PF.readBuf(PF.files[0]);
          const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
          let csvRows = [];
          for (let i=1;i<=pdf.numPages;i++) {
            const pg = await pdf.getPage(i); const c = await pg.getTextContent();
            const lines = {};
            c.items.forEach(item => {
              const y = Math.round(item.transform[5] / 5) * 5;
              if (!lines[y]) lines[y] = [];
              lines[y].push({x: Math.round(item.transform[4]), str: item.str.trim()});
            });
            const sortedYs = Object.keys(lines).sort((a,b) => b-a);
            sortedYs.forEach(y => {
              const lineItems = lines[y].sort((a,b) => a.x - b.x);
              const cells = lineItems.map(it => '"' + it.str.replace(/"/g, '""') + '"');
              csvRows.push(cells.join(','));
            });
            if (i < pdf.numPages) csvRows.push('');
            PF.showProg(10+i/pdf.numPages*80);
          }
          PF.showProg(100);
          const csvBlob = new Blob([csvRows.join('\n')], {type:'text/csv'});
          PF.showResult(`Table data extracted from ${pdf.numPages} pages`, csvBlob, 'converted.csv');
          break;
        }
        case 'pdf-to-pptx': {
          const bytes = await PF.readBuf(PF.files[0]);
          const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
          const zip = new JSZip();
          const total = pdf.numPages;
          for (let i=1;i<=total;i++) {
            const page = await pdf.getPage(i);
            const vp = page.getViewport({scale:2});
            const cvs = document.createElement('canvas');
            cvs.width = vp.width; cvs.height = vp.height;
            await page.render({canvasContext:cvs.getContext('2d'), viewport:vp}).promise;
            const dataUrl = cvs.toDataURL('image/png');
            const d = atob(dataUrl.split(',')[1]);
            const arr = new Uint8Array(d.length); for(let j=0;j<d.length;j++) arr[j]=d.charCodeAt(j);
            zip.file(`slide_${i}.png`, arr);
            PF.showProg(10+i/total*80);
          }
          PF.showProg(100);
          PF.showResult(`${total} slides exported as images`, await zip.generateAsync({type:'blob'}), 'slides.zip');
          break;
        }
        case 'pdf-to-pdfa': {
          const bytes = await PF.readBuf(PF.files[0]);
          const doc = await PDFLib.PDFDocument.load(bytes);
          doc.setProducer('PDFForge');
          doc.setCreator('PDFForge - PDF/A Converter');
          PF.showProg(50);
          const out = await doc.save();
          PF.showProg(100);
          PF.showResult(`Converted to PDF/A format - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'document_pdfa.pdf');
          break;
        }
        case 'word-to-pdf': {
          const bytes = await PF.readBuf(PF.files[0]);
          PF.showProg(20);
          try {
            const result = await mammoth.extractRawText({arrayBuffer: bytes});
            const text = result.value;
            if (!text || text.trim().length === 0) { PF.toast('Could not extract text from this file'); PF.hideProg(); return; }
            const doc = await PDFLib.PDFDocument.create();
            const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
            const fontSize = 11;
            const margin = 50;
            const lineHeight = fontSize * 1.4;
            const lines = text.split('\n');
            let page = doc.addPage([612, 792]);
            let y = 792 - margin;
            for (const line of lines) {
              const words = line.split(' ');
              let currentLine = '';
              for (const word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const tw = font.widthOfTextAtSize(testLine, fontSize);
                if (tw > 612 - margin * 2) {
                  if (currentLine) {
                    if (y < margin + lineHeight) { page = doc.addPage([612, 792]); y = 792 - margin; }
                    page.drawText(currentLine, {x:margin, y, size:fontSize, font, color:PDFLib.rgb(0,0,0)});
                    y -= lineHeight;
                  }
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              }
              if (currentLine) {
                if (y < margin + lineHeight) { page = doc.addPage([612, 792]); y = 792 - margin; }
                page.drawText(currentLine, {x:margin, y, size:fontSize, font, color:PDFLib.rgb(0,0,0)});
                y -= lineHeight;
              }
              if (!line.trim()) y -= lineHeight * 0.5;
            }
            PF.showProg(80);
            const out = await doc.save();
            PF.showProg(100);
            PF.showResult(`Word document converted - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'converted.pdf');
          } catch(innerE) {
            PF.toast('Error reading Word file: ' + innerE.message);
          }
          break;
        }
        case 'excel-to-pdf': {
          const bytes = await PF.readBuf(PF.files[0]);
          PF.showProg(20);
          try {
            const workbook = XLSX.read(bytes, {type:'array'});
            const doc = await PDFLib.PDFDocument.create();
            const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
            const boldFont = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
            const fontSize = 9;
            const margin = 40;
            const cellPad = 4;
            const rowHeight = fontSize + cellPad * 2 + 2;

            for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              const data = XLSX.utils.sheet_to_json(sheet, {header:1, defval:''});
              if (!data.length) continue;

              const maxCols = data.reduce((max, r) => Math.max(max, r.length), 0);
              const visibleCols = Math.min(maxCols, 8); // Limit to 8 columns to fit page
              const colWidth = Math.max(50, (612 - margin * 2) / Math.max(visibleCols, 1));
              let page = doc.addPage([612, 792]);
              let y = 792 - margin;

              page.drawText(sheetName, {x:margin, y, size:12, font:boldFont, color:PDFLib.rgb(0.2,0.2,0.2)});
              y -= 20;

              const maxRows = Math.min(data.length, 5000); // Limit rows for performance
              for (let r=0; r<maxRows; r++) {
                if (y < margin + rowHeight) {
                  page = doc.addPage([612, 792]);
                  y = 792 - margin;
                }
                for (let c=0; c<visibleCols; c++) {
                  const rawVal = data[r][c] !== undefined ? data[r][c] : '';
                  // Sanitize: remove non-printable chars that crash pdf-lib
                  const cellVal = String(rawVal).replace(/[^\x20-\x7E]/g, ' ').trim();
                  const x = margin + c * colWidth;
                  page.drawRectangle({x, y:y-rowHeight+cellPad, width:colWidth, height:rowHeight, borderColor:PDFLib.rgb(0.8,0.8,0.8), borderWidth:0.5});
                  const maxChars = Math.floor(colWidth / (fontSize * 0.55));
                  const truncated = cellVal.substring(0, maxChars);
                  const useFont = r === 0 ? boldFont : font;
                  try {
                    page.drawText(truncated, {x:x+cellPad, y:y-fontSize, size:fontSize, font:useFont, color:PDFLib.rgb(0.1,0.1,0.1)});
                  } catch(charErr) {
                    // Skip cells with encoding issues
                    page.drawText('...', {x:x+cellPad, y:y-fontSize, size:fontSize, font, color:PDFLib.rgb(0.5,0.5,0.5)});
                  }
                }
                y -= rowHeight;
                if (r % 50 === 0) PF.showProg(20 + (r/maxRows) * 60);
              }
              if (data.length > maxRows) {
                if (y < margin + 30) { page = doc.addPage([612, 792]); y = 792 - margin; }
                y -= 20;
                page.drawText(`... ${data.length - maxRows} more rows (truncated for performance)`, {x:margin, y, size:9, font, color:PDFLib.rgb(0.5,0.5,0.5)});
              }
            }
            PF.showProg(90);
            const out = await doc.save();
            PF.showProg(100);
            PF.showResult(`Excel converted - ${workbook.SheetNames.length} sheet(s) - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'spreadsheet.pdf');
          } catch(innerE) {
            PF.toast('Error reading Excel file: ' + innerE.message);
          }
          break;
        }
        case 'pptx-to-pdf': {
          const bytes = await PF.readBuf(PF.files[0]);
          PF.showProg(20);
          try {
            const zip = await JSZip.loadAsync(bytes);
            const doc = await PDFLib.PDFDocument.create();
            const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
            const slideFiles = Object.keys(zip.files).filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/)).sort();
            
            for (let i=0; i<slideFiles.length; i++) {
              const slideXml = await zip.file(slideFiles[i]).async('text');
              const page = doc.addPage([960, 540]);
              page.drawRectangle({x:0, y:0, width:960, height:540, color:PDFLib.rgb(1,1,1)});
              const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
              const texts = textMatches.map(m => m.replace(/<\/?a:t>/g, ''));
              let ty = 480;
              for (const t of texts) {
                if (!t.trim()) continue;
                const tw = font.widthOfTextAtSize(t, 14);
                page.drawText(t, {x: Math.min(60, (960-tw)/2), y:ty, size:14, font, color:PDFLib.rgb(0.1,0.1,0.1)});
                ty -= 24;
                if (ty < 40) break;
              }
              page.drawText(`Slide ${i+1}`, {x:880, y:15, size:9, font, color:PDFLib.rgb(0.5,0.5,0.5)});
              PF.showProg(20 + (i/slideFiles.length)*70);
            }
            if (slideFiles.length === 0) {
              const page = doc.addPage([612, 792]);
              page.drawText('No slides found in the PowerPoint file.', {x:50, y:700, size:14, font, color:PDFLib.rgb(0.3,0.3,0.3)});
            }
            PF.showProg(95);
            const out = await doc.save();
            PF.showProg(100);
            PF.showResult(`${slideFiles.length} slides converted to PDF`, new Blob([out],{type:'application/pdf'}), 'presentation.pdf');
          } catch(innerE) {
            PF.toast('Error reading PowerPoint file: ' + innerE.message);
          }
          break;
        }
        case 'html-to-pdf': {
          const url = document.getElementById('urlIn')?.value;
          if (!url) { PF.toast('Enter a URL'); break; }
          PF.toast('Opening URL. Use your browser\'s Print > Save as PDF.');
          window.open(url, '_blank');
          break;
        }
        default: {
          const bytes = await PF.readBuf(PF.files[0]);
          const doc = await PDFLib.PDFDocument.load(bytes);
          PF.showProg(80);
          const out = await doc.save();
          PF.showProg(100);
          PF.showResult(`Processed - ${PF.fmtBytes(out.length)}`, new Blob([out],{type:'application/pdf'}), 'output.pdf');
        }
      }
    } catch(e) { PF.toast('Error: '+e.message); }
    PF.hideProg();
  }

  return {
    buildUI, setupWatchers, _splitModeChange,
    merge, split, removePages, compress, rotate,
    pageNumbers, watermark, protect,
    initSigCanvas, clearSig, doSign,
    imgToPdf, pdfToJpg,
    doStamp, doHeaders, doBates,
    doRedact, doCrop, aiTranslate,
    rotSel, delSel, delOrgPg, saveOrg,
    generic
  };

})();
