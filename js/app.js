/* ============================================================
   PDFForge v6 — App Core (app.js)
   Tool registry, routing, file handling, workspace generation
   ============================================================ */

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PF = (function() {

  // SVG icon templates (stroke-based, no emoji)
  const IC = {
    merge:     '<path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8Z"/><path d="M16 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/>',
    split:     '<path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8Z"/><path d="M16 3v5h5"/><line x1="8" y1="13" x2="16" y2="13"/>',
    remove:    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    extract:   '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><path d="M9 15l3-3 3 3"/>',
    organize:  '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    compress:  '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    repair:    '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
    rotate:    '<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 11-.57-8.38"/>',
    pagenum:   '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><path d="M10 12h4"/><path d="M10 16h4"/>',
    watermark: '<path d="M12 22c6-3 10-7 10-13a4 4 0 00-8-3 4 4 0 00-8 3c0 6 4 10 10 13z"/>',
    edit:      '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    sign:      '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    protect:   '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
    unlock:    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/>',
    img2pdf:   '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    pdf2img:   '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    word:      '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/>',
    pptx:      '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    excel:     '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13l3 3"/><path d="M11 13l-3 3"/>',
    html:      '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    crop:      '<path d="M6.13 1L6 16a2 2 0 002 2h15"/><path d="M1 6.13L16 6a2 2 0 012 2v15"/>',
    redact:    '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>',
    compare:   '<path d="M18 8V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12c0 1.1.9 2 2 2h2"/><rect x="6" y="8" width="16" height="12" rx="2"/>',
    flatten:   '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><line x1="8" y1="18" x2="16" y2="18"/>',
    stamp:     '<circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/>',
    bates:     '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><path d="M9 17h6"/>',
    header:    '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><line x1="4" y1="8" x2="20" y2="8"/>',
    pdfa:      '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><path d="M9 15h6"/>',
    ai:        '<path d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M6 12a6 6 0 0012 0"/><path d="M12 18v4"/><path d="M8 22h8"/>',
    chat:      '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    ocr:       '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/><circle cx="12" cy="15" r="2"/><path d="M9 15h0"/><path d="M15 15h0"/>',
    translate: '<path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[name] || IC.edit}</svg>`;
  }

  // Tool definitions
  const TOOLS = [
    { id:'merge',         name:'Merge PDF',           desc:'Combine multiple PDFs into one document.',             cat:'organize',     ic:'merge',    accept:'.pdf', multi:true },
    { id:'split',         name:'Split PDF',           desc:'Extract pages or split into separate files.',          cat:'organize',     ic:'split',    accept:'.pdf' },
    { id:'remove-pages',  name:'Remove Pages',        desc:'Delete specific pages from your PDF.',                 cat:'organize',     ic:'remove',   accept:'.pdf' },
    { id:'extract-pages', name:'Extract Pages',       desc:'Extract selected pages into a new PDF.',               cat:'organize',     ic:'extract',  accept:'.pdf' },
    { id:'organize',      name:'Organize PDF',        desc:'Drag and drop to reorder, rotate, or delete pages.',   cat:'organize',     ic:'organize', accept:'.pdf' },
    { id:'compress',      name:'Compress PDF',        desc:'Reduce file size while keeping quality.',              cat:'optimize',     ic:'compress', accept:'.pdf' },
    { id:'repair',        name:'Repair PDF',          desc:'Fix broken or corrupted PDF files.',                   cat:'optimize',     ic:'repair',   accept:'.pdf' },
    { id:'rotate',        name:'Rotate PDF',          desc:'Rotate all or specific pages.',                        cat:'edit',         ic:'rotate',   accept:'.pdf' },
    { id:'page-numbers',  name:'Add Page Numbers',    desc:'Insert page numbers at any position.',                 cat:'edit',         ic:'pagenum',  accept:'.pdf' },
    { id:'watermark',     name:'Add Watermark',       desc:'Stamp text or image watermarks.',                      cat:'edit',         ic:'watermark',accept:'.pdf' },
    { id:'edit',          name:'Edit PDF',            desc:'Add text, shapes, drawings, and annotations.',         cat:'edit',         ic:'edit',     accept:'.pdf' },
    { id:'crop',          name:'Crop PDF',            desc:'Trim margins and crop pages.',                         cat:'edit',         ic:'crop',     accept:'.pdf' },
    { id:'flatten',       name:'Flatten PDF',         desc:'Merge annotations into the document permanently.',     cat:'edit',         ic:'flatten',  accept:'.pdf' },
    { id:'headers',       name:'Headers & Footers',   desc:'Add custom headers and footers to pages.',             cat:'edit',         ic:'header',   accept:'.pdf' },
    { id:'bates',         name:'Bates Numbering',     desc:'Add sequential Bates numbers for legal docs.',         cat:'edit',         ic:'bates',    accept:'.pdf' },
    { id:'stamp',         name:'Stamps',              desc:'Add Approved, Draft, Confidential stamps.',            cat:'edit',         ic:'stamp',    accept:'.pdf' },
    { id:'sign',          name:'Sign PDF',            desc:'Draw, type, or upload your signature.',                cat:'security',     ic:'sign',     accept:'.pdf' },
    { id:'protect',       name:'Protect PDF',         desc:'Encrypt your PDF with a password.',                    cat:'security',     ic:'protect',  accept:'.pdf' },
    { id:'unlock',        name:'Unlock PDF',          desc:'Remove password protection.',                          cat:'security',     ic:'unlock',   accept:'.pdf' },
    { id:'redact',        name:'Redact PDF',          desc:'Permanently remove sensitive content.',                cat:'security',     ic:'redact',   accept:'.pdf' },
    { id:'compare',       name:'Compare PDFs',        desc:'Compare text differences between two PDFs.',           cat:'security',     ic:'compare',  accept:'.pdf', multi:true },
    { id:'jpg-to-pdf',    name:'JPG to PDF',          desc:'Convert images (JPG, PNG, WEBP) to PDF.',             cat:'convert-to',   ic:'img2pdf',  accept:'image/*', multi:true },
    { id:'word-to-pdf',   name:'Word to PDF',         desc:'Convert DOCX documents to PDF.',                      cat:'convert-to',   ic:'word',     accept:'.doc,.docx' },
    { id:'pptx-to-pdf',   name:'PowerPoint to PDF',   desc:'Convert PPTX presentations to PDF.',                  cat:'convert-to',   ic:'pptx',     accept:'.ppt,.pptx' },
    { id:'excel-to-pdf',  name:'Excel to PDF',        desc:'Convert Excel spreadsheets to PDF.',                  cat:'convert-to',   ic:'excel',    accept:'.xls,.xlsx,.csv' },
    { id:'html-to-pdf',   name:'HTML to PDF',         desc:'Convert any webpage URL to PDF.',                     cat:'convert-to',   ic:'html' },
    { id:'pdf-to-jpg',    name:'PDF to JPG',          desc:'Convert each page to a JPG image.',                   cat:'convert-from', ic:'pdf2img',  accept:'.pdf' },
    { id:'pdf-to-word',   name:'PDF to Word',         desc:'Extract text to editable format.',                    cat:'convert-from', ic:'word',     accept:'.pdf' },
    { id:'pdf-to-pptx',   name:'PDF to PowerPoint',   desc:'Convert pages to presentation slides.',               cat:'convert-from', ic:'pptx',     accept:'.pdf' },
    { id:'pdf-to-excel',  name:'PDF to Excel',        desc:'Extract tables from PDF to CSV.',                     cat:'convert-from', ic:'excel',    accept:'.pdf' },
    { id:'pdf-to-pdfa',   name:'PDF to PDF/A',        desc:'Convert to archival-standard format.',                cat:'convert-from', ic:'pdfa',     accept:'.pdf' },
    { id:'ai-summarize',  name:'AI Summarize',        desc:'Get an AI-powered summary of your PDF document.',     cat:'ai',           ic:'ai',       accept:'.pdf' },
    { id:'ai-chat',       name:'Chat with PDF',       desc:'Ask questions about your PDF using AI.',              cat:'ai',           ic:'chat',     accept:'.pdf' },
    { id:'ai-ocr',        name:'OCR (Text Recognition)', desc:'Extract text from scanned PDFs and images.',       cat:'ai',           ic:'ocr',      accept:'.pdf' },
    { id:'ai-translate',  name:'AI Translate',        desc:'Translate PDF text to another language using AI.',     cat:'ai',           ic:'translate', accept:'.pdf' },
  ];

  const CAT_META = {
    'organize':     { label:'Organize',  color:'#3b82f6', cls:'cat-organize' },
    'optimize':     { label:'Optimize',  color:'#06b6d4', cls:'cat-optimize' },
    'convert-to':   { label:'To PDF',    color:'#10b981', cls:'cat-convert-to' },
    'convert-from': { label:'From PDF',  color:'#8b5cf6', cls:'cat-convert-from' },
    'edit':         { label:'Edit',      color:'#f59e0b', cls:'cat-edit' },
    'security':     { label:'Security',  color:'#ef4444', cls:'cat-security' },
    'ai':           { label:'AI',        color:'#f472b6', cls:'cat-ai' },
  };

  let files = [];
  let currentTool = null;
  let _watcherInterval = null;

  // ===== Utilities =====
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 3000);
  }

  function fmtBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(1) + ' MB';
  }

  function readBuf(file) {
    return new Promise((r, j) => { const f = new FileReader(); f.onload = () => r(f.result); f.onerror = j; f.readAsArrayBuffer(file); });
  }

  function readURL(file) {
    return new Promise((r, j) => { const f = new FileReader(); f.onload = () => r(f.result); f.onerror = j; f.readAsDataURL(file); });
  }

  function parseRanges(str, max) {
    const s = new Set();
    str.split(',').forEach(p => {
      p = p.trim();
      if (p.includes('-')) {
        const [a,b] = p.split('-').map(Number);
        for (let i = Math.max(1,a); i <= Math.min(max,b); i++) s.add(i-1);
      } else { const n = parseInt(p); if (n>=1 && n<=max) s.add(n-1); }
    });
    return [...s].sort((a,b)=>a-b);
  }

  function showProg(p) {
    const bar = document.getElementById('pbar'), fill = document.getElementById('pfill');
    if (bar) bar.classList.add('on');
    if (fill) fill.style.width = p + '%';
  }

  function hideProg() { const b = document.getElementById('pbar'); if (b) b.classList.remove('on'); }

  function showResult(info, blob, fname) {
    const sec = document.getElementById('result');
    document.getElementById('rInfo').textContent = info;
    document.getElementById('rBtn').onclick = () => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fname; a.click(); URL.revokeObjectURL(url);
    };
    sec.classList.add('on');
  }

  // ===== Rendering =====
  function renderGrid(flt='all', q='') {
    const grid = document.getElementById('toolGrid');
    grid.innerHTML = '';
    const ql = q.toLowerCase();
    TOOLS.filter(t => {
      if (flt !== 'all') {
        if (flt === 'convert') { if (t.cat !== 'convert-to' && t.cat !== 'convert-from') return false; }
        else if (t.cat !== flt) return false;
      }
      if (ql && !t.name.toLowerCase().includes(ql) && !t.desc.toLowerCase().includes(ql) && !t.id.includes(ql)) return false;
      return true;
    }).forEach(t => {
      const m = CAT_META[t.cat];
      const d = document.createElement('div');
      d.className = `card ${m.cls}`;
      d.onclick = () => openTool(t.id);
      d.innerHTML = `
        <div class="card-icon">${icon(t.ic)}</div>
        <span class="card-badge" style="background:${m.color}18;color:${m.color}">${m.label}</span>
        <h3>${t.name}</h3>
        <p>${t.desc}</p>`;
      grid.appendChild(d);
    });
  }

  function renderFilters() {
    const bar = document.getElementById('filterBar');
    const cats = [
      ['all','All Tools'],['organize','Organize'],['optimize','Optimize'],
      ['convert-to','To PDF'],['convert-from','From PDF'],['edit','Edit'],['security','Security'],['ai','AI']
    ];
    bar.innerHTML = cats.map(([k,v]) =>
      `<button class="fbtn${k==='all'?' on':''}" data-f="${k}" onclick="PF.filter('${k}')">${v}</button>`
    ).join('');
  }

  function filter(f) {
    document.querySelectorAll('.fbtn, .header-nav button').forEach(b => {
      const bf = b.dataset.f;
      b.classList.toggle('on', bf === f || (f === 'convert' && (bf === 'convert-to' || bf === 'convert-from')));
    });
    renderGrid(f, document.getElementById('search')?.value || '');
  }

  function search(val) { renderGrid('all', val); }

  // ===== Navigation =====
  function goHome() {
    document.getElementById('homeView').style.display = '';
    document.getElementById('workspace').classList.remove('open');
    currentTool = null; files = [];
    if (_watcherInterval) { clearInterval(_watcherInterval); _watcherInterval = null; }
  }

  function openTool(id) {
    const tool = TOOLS.find(t => t.id === id);
    if (!tool) return;
    currentTool = tool; files = [];
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('workspace').classList.add('open');
    document.getElementById('wsTitle').textContent = tool.name;
    document.getElementById('wsDesc').textContent = tool.desc;
    window.scrollTo(0, 0);
    buildWorkspace(tool);
  }

  // ===== File handling =====
  function handleFiles(e, listId) {
    const newFiles = Array.from(e.target.files);
    if (currentTool?.multi) files.push(...newFiles);
    else files = newFiles.slice(0,1);
    renderFileList(listId);
    e.target.value = '';
  }

  function renderFileList(id) {
    const c = document.getElementById(id); if (!c) return;
    c.innerHTML = '';
    files.forEach((f, i) => {
      const d = document.createElement('div');
      d.className = 'fitem'; d.draggable = true; d.dataset.idx = i;
      d.innerHTML = `
        <div class="fi-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/></svg></div>
        <div class="fi-info"><div class="fi-name">${f.name}</div><div class="fi-size">${fmtBytes(f.size)}</div></div>
        <button class="fi-rm" onclick="PF.rmFile(${i},'${id}')">&#10005;</button>`;
      // Drag reorder
      d.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', i); d.style.opacity='0.4'; });
      d.addEventListener('dragend', () => d.style.opacity='1');
      d.addEventListener('dragover', e => { e.preventDefault(); d.style.borderColor='var(--accent)'; });
      d.addEventListener('dragleave', () => d.style.borderColor='var(--glass-border)');
      d.addEventListener('drop', e => {
        e.preventDefault(); d.style.borderColor='var(--glass-border)';
        const from = parseInt(e.dataTransfer.getData('text/plain'));
        const item = files.splice(from,1)[0]; files.splice(i,0,item);
        renderFileList(id);
      });
      c.appendChild(d);
    });
  }

  function rmFile(i, id) { files.splice(i,1); renderFileList(id); }

  // ===== Workspace builder =====
  function dropHTML(accept, multi, listId) {
    if (currentTool?.id === 'html-to-pdf') {
      return `<div class="opts"><h4>Enter URL</h4><div class="opt-row"><label>Webpage URL</label><input type="text" id="urlIn" placeholder="https://example.com" style="max-width:100%;flex:1"></div></div>`;
    }
    return `
      <div class="drop" id="dropZone">
        <input type="file" id="fileIn" accept="${accept||'*'}" ${multi?'multiple':''} onchange="PF.handleFiles(event,'${listId}')">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <h3>Drop your file${multi?'s':''} here</h3>
        <p>or click to browse</p>
      </div>
      <div class="flist" id="${listId}"></div>`;
  }

  function resultHTML() {
    return `
      <div class="pbar" id="pbar"><div class="pfill" id="pfill"></div></div>
      <div class="result" id="result">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Done!</h3>
        <p id="rInfo"></p>
        <button class="btn btn-accent" id="rBtn" style="margin-top:14px">Download</button>
      </div>`;
  }

  function buildWorkspace(tool) {
    const b = document.getElementById('wsBody');
    // Use tools.js functions to generate tool-specific UI
    if (typeof PDFTools !== 'undefined' && PDFTools.buildUI) {
      b.innerHTML = PDFTools.buildUI(tool, dropHTML, resultHTML);
      PDFTools.setupWatchers(tool);
    } else {
      b.innerHTML = dropHTML(tool.accept, tool.multi, 'fl') + resultHTML();
    }
  }

  function toggleAuth() { toast('Auth coming soon with Firebase!'); }

  // ===== Init =====
  function init() {
    renderFilters();
    renderGrid();
    // Global drop
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => {
      e.preventDefault();
      if (!currentTool) return;
      const newFiles = Array.from(e.dataTransfer.files);
      if (currentTool.multi) files.push(...newFiles);
      else files = newFiles.slice(0,1);
      const fl = document.querySelector('.flist');
      if (fl) renderFileList(fl.id);
    });
  }

  init();

  // Public API
  return {
    goHome, filter, search, openTool,
    handleFiles, rmFile, toggleAuth,
    toast, fmtBytes, readBuf, readURL, parseRanges,
    showProg, hideProg, showResult,
    get files() { return files; },
    set files(v) { files = v; },
    get currentTool() { return currentTool; },
    icon, dropHTML, resultHTML, TOOLS, CAT_META
  };

})();
