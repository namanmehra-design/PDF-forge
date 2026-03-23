/* ============================================================
   PDFForge v7 — Firebase + AI Integration (firebase.js)
   Auth, Firestore file management, Gemini AI, OCR, Dashboard
   ============================================================ */

const PFAuth = (function() {

  let auth, db, user = null;
  const GEMINI_KEY = ''; // User sets this in settings

  // ===== Firebase Init =====
  function init() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded');
      updateUI(null);
      return;
    }
    
    try {
      firebase.initializeApp({
        apiKey: "AIzaSyBfbAkQOyCmH6L0Sn0_vkGr7u0qU6tyUyc",
        authDomain: "pdf-forge-dcc91.firebaseapp.com",
        projectId: "pdf-forge-dcc91",
        storageBucket: "pdf-forge-dcc91.firebasestorage.app",
        messagingSenderId: "836650786743",
        appId: "1:836650786743:web:64f5d2d93732f1e0b65232"
      });
      
      auth = firebase.auth();
      db = firebase.firestore();
      
      auth.onAuthStateChanged(function(u) {
        user = u;
        updateUI(u);
      });
    } catch(e) {
      console.error('Firebase init error:', e);
      updateUI(null);
    }
  }

  // ===== UI Updates =====
  function updateUI(u) {
    const authArea = document.getElementById('headerAuth');
    const dashNav = document.getElementById('dashNav');
    
    if (u) {
      const name = u.displayName || u.email?.split('@')[0] || 'User';
      const photo = u.photoURL;
      const initial = name.charAt(0).toUpperCase();
      
      if (authArea) authArea.innerHTML = `
        <button class="hdr-btn" onclick="PFAuth.showDashboard()" title="My Files">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <div class="hdr-avatar" onclick="PFAuth.showProfile()" title="${name}">
          ${photo ? '<img src="'+photo+'" alt="">' : '<span>'+initial+'</span>'}
        </div>`;
      if (dashNav) dashNav.style.display = '';
    } else {
      if (authArea) authArea.innerHTML = `
        <button class="hdr-btn signin-btn" onclick="PFAuth.showLogin()">Sign In</button>
        <button class="hdr-btn signup-btn" onclick="PFAuth.showSignup()">Sign Up Free</button>`;
      if (dashNav) dashNav.style.display = 'none';
    }
  }

  // ===== Auth Modals =====
  function showLogin() {
    showAuthModal('login');
  }

  function showSignup() {
    showAuthModal('signup');
  }

  function showAuthModal(mode) {
    let modal = document.getElementById('authModal');
    if (modal) modal.remove();
    
    const isLogin = mode === 'login';
    modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box auth-modal">
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        <div class="auth-header">
          <div class="logo-mark" style="width:40px;height:40px;margin:0 auto 12px"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" style="width:20px;height:20px"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/></svg></div>
          <h2>${isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p style="color:var(--text2);font-size:13px;margin-top:4px">${isLogin ? 'Sign in to access your files and history' : 'Free forever. No credit card required.'}</p>
        </div>
        <div id="authErr" class="auth-err"></div>
        <button class="btn-google" onclick="PFAuth.googleAuth()">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <div class="auth-divider"><span>or</span></div>
        ${!isLogin ? '<div class="auth-field"><label>Full Name</label><input type="text" id="authName" placeholder="Your name"></div>' : ''}
        <div class="auth-field"><label>Email</label><input type="email" id="authEmail" placeholder="you@example.com"></div>
        <div class="auth-field"><label>Password</label><input type="password" id="authPw" placeholder="${isLogin ? 'Your password' : 'Min 6 characters'}"></div>
        <button class="btn btn-accent" style="width:100%;justify-content:center;margin-top:16px" onclick="PFAuth.emailAuth('${mode}')">${isLogin ? 'Sign In' : 'Create Account'}</button>
        <p class="auth-switch">${isLogin ? "Don't have an account?" : 'Already have an account?'} <a onclick="PFAuth.show${isLogin ? 'Signup' : 'Login'}()">${isLogin ? 'Sign up free' : 'Sign in'}</a></p>
      </div>`;
    document.body.appendChild(modal);
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  }

  async function emailAuth(mode) {
    const email = document.getElementById('authEmail')?.value;
    const pw = document.getElementById('authPw')?.value;
    const errEl = document.getElementById('authErr');
    
    if (!email || !pw) { errEl.textContent = 'Fill in all fields'; return; }
    
    try {
      if (mode === 'login') {
        await auth.signInWithEmailAndPassword(email, pw);
      } else {
        const name = document.getElementById('authName')?.value;
        if (!name) { errEl.textContent = 'Enter your name'; return; }
        const cred = await auth.createUserWithEmailAndPassword(email, pw);
        await cred.user.updateProfile({displayName: name});
        // Create user doc in Firestore
        await db.collection('users').doc(cred.user.uid).set({
          name: name,
          email: email,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          plan: 'free'
        });
      }
      document.getElementById('authModal')?.remove();
      PF.toast('Welcome to PDFForge!');
    } catch(e) {
      errEl.textContent = e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '');
    }
  }

  async function googleAuth() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      if (result.additionalUserInfo?.isNewUser) {
        await db.collection('users').doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          plan: 'free'
        });
      }
      document.getElementById('authModal')?.remove();
      PF.toast('Welcome, ' + (result.user.displayName || 'there') + '!');
    } catch(e) {
      const errEl = document.getElementById('authErr');
      if (errEl) errEl.textContent = e.message;
    }
  }

  function signOut() {
    if (auth) auth.signOut();
    PF.goHome();
    PF.toast('Signed out');
  }

  // ===== Dashboard =====
  function showDashboard() {
    if (!user) return showLogin();
    
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('workspace').classList.remove('open');
    
    let dash = document.getElementById('dashView');
    if (!dash) {
      dash = document.createElement('div');
      dash.id = 'dashView';
      document.getElementById('workspace').parentNode.insertBefore(dash, document.getElementById('toast'));
    }
    dash.style.display = 'block';
    dash.className = 'dashboard';
    
    dash.innerHTML = `
      <div class="dash-header">
        <h1>My Files</h1>
        <div class="dash-actions">
          <button class="btn btn-ghost" style="margin:0;padding:8px 14px;font-size:12px" onclick="PFAuth.createFolder()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            New Folder
          </button>
          <button class="btn btn-accent" style="margin:0;padding:8px 14px;font-size:12px" onclick="document.getElementById('dashUpload').click()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload
          </button>
          <input type="file" id="dashUpload" accept=".pdf" multiple style="display:none" onchange="PFAuth.uploadFiles(this.files)">
        </div>
      </div>
      <div class="dash-breadcrumb" id="breadcrumb"></div>
      <div class="dash-grid" id="dashGrid">
        <div class="dash-loading">Loading your files...</div>
      </div>`;
    
    loadFiles();
  }

  let currentFolder = null; // null = root

  async function loadFiles(folderId) {
    currentFolder = folderId || null;
    const grid = document.getElementById('dashGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="dash-loading">Loading...</div>';
    
    // Update breadcrumb
    const bc = document.getElementById('breadcrumb');
    if (bc) {
      let trail = '<a onclick="PFAuth.loadFiles()">My Files</a>';
      if (currentFolder) {
        try {
          const folderDoc = await db.collection('users').doc(user.uid).collection('files').doc(currentFolder).get();
          if (folderDoc.exists) trail += ' / <span>' + folderDoc.data().name + '</span>';
        } catch(e) {}
      }
      bc.innerHTML = trail;
    }
    
    try {
      let query = db.collection('users').doc(user.uid).collection('files')
        .where('parent', '==', currentFolder || 'root')
        .orderBy('created', 'desc');
      
      const snap = await query.get();
      grid.innerHTML = '';
      
      if (snap.empty) {
        grid.innerHTML = `
          <div class="dash-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/></svg>
            <p>No files yet</p>
            <p style="font-size:12px;color:var(--text3)">Upload PDFs or process files to see them here</p>
          </div>`;
        return;
      }
      
      // Folders first, then files
      const folders = [];
      const files = [];
      snap.forEach(doc => {
        const d = {id: doc.id, ...doc.data()};
        if (d.type === 'folder') folders.push(d);
        else files.push(d);
      });
      
      folders.forEach(f => {
        const el = document.createElement('div');
        el.className = 'dash-item dash-folder';
        el.onclick = () => loadFiles(f.id);
        el.innerHTML = `
          <div class="dash-item-icon folder-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          </div>
          <div class="dash-item-name">${f.name}</div>
          <div class="dash-item-meta">${f.count || 0} items</div>
          <button class="dash-item-menu" onclick="event.stopPropagation();PFAuth.fileMenu('${f.id}','folder',event)">...</button>`;
        grid.appendChild(el);
      });
      
      files.forEach(f => {
        const el = document.createElement('div');
        el.className = 'dash-item dash-file';
        el.innerHTML = `
          <div class="dash-item-icon file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div class="dash-item-name">${f.name}</div>
          <div class="dash-item-meta">${f.size ? PF.fmtBytes(f.size) : ''} ${f.tool ? '| ' + f.tool : ''}</div>
          <div class="dash-item-date">${f.created?.toDate ? timeAgo(f.created.toDate()) : ''}</div>
          <button class="dash-item-menu" onclick="event.stopPropagation();PFAuth.fileMenu('${f.id}','file',event)">...</button>`;
        el.onclick = () => downloadFile(f);
        grid.appendChild(el);
      });
      
    } catch(e) {
      grid.innerHTML = '<div class="dash-empty"><p>Error loading files: ' + e.message + '</p></div>';
    }
  }

  function timeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    if (s < 604800) return Math.floor(s/86400) + 'd ago';
    return date.toLocaleDateString();
  }

  // ===== File Operations =====
  async function saveFile(name, blob, toolName) {
    if (!user || !db) return;
    try {
      // Convert blob to base64 for Firestore (files under 1MB)
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      
      await db.collection('users').doc(user.uid).collection('files').add({
        name: name,
        size: blob.size,
        type: 'file',
        mimeType: blob.type,
        tool: toolName || '',
        parent: currentFolder || 'root',
        data: blob.size < 1048576 ? base64 : null, // Only store if under 1MB
        created: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) {
      console.error('Save file error:', e);
    }
  }

  async function uploadFiles(fileList) {
    if (!user) return;
    for (const file of fileList) {
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      
      await db.collection('users').doc(user.uid).collection('files').add({
        name: file.name,
        size: file.size,
        type: 'file',
        mimeType: file.type,
        parent: currentFolder || 'root',
        data: file.size < 1048576 ? base64 : null,
        created: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    PF.toast(fileList.length + ' file(s) uploaded');
    loadFiles(currentFolder);
  }

  async function createFolder() {
    const name = prompt('Folder name:');
    if (!name || !name.trim()) return;
    
    await db.collection('users').doc(user.uid).collection('files').add({
      name: name.trim(),
      type: 'folder',
      parent: currentFolder || 'root',
      count: 0,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });
    PF.toast('Folder created');
    loadFiles(currentFolder);
  }

  async function deleteFile(id) {
    if (!confirm('Delete this item?')) return;
    await db.collection('users').doc(user.uid).collection('files').doc(id).delete();
    PF.toast('Deleted');
    loadFiles(currentFolder);
  }

  async function renameFile(id) {
    const newName = prompt('New name:');
    if (!newName || !newName.trim()) return;
    await db.collection('users').doc(user.uid).collection('files').doc(id).update({name: newName.trim()});
    loadFiles(currentFolder);
  }

  function downloadFile(f) {
    if (f.data) {
      const a = document.createElement('a');
      a.href = f.data;
      a.download = f.name;
      a.click();
    } else {
      PF.toast('File too large to download from cloud. Process it again locally.');
    }
  }

  function fileMenu(id, type, event) {
    // Remove existing menu
    document.querySelectorAll('.ctx-menu').forEach(m => m.remove());
    
    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.innerHTML = `
      <button onclick="PFAuth.renameFile('${id}');this.closest('.ctx-menu').remove()">Rename</button>
      <button onclick="PFAuth.deleteFile('${id}');this.closest('.ctx-menu').remove()" style="color:var(--accent4)">Delete</button>`;
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    document.body.appendChild(menu);
    
    setTimeout(() => {
      document.addEventListener('click', function handler() {
        menu.remove();
        document.removeEventListener('click', handler);
      });
    }, 10);
  }

  // ===== Profile =====
  function showProfile() {
    if (!user) return;
    let modal = document.getElementById('profileModal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box profile-modal">
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        <h2>Profile</h2>
        <div class="profile-info">
          <div class="profile-avatar">${user.photoURL ? '<img src="'+user.photoURL+'">' : '<span>'+((user.displayName||'U').charAt(0).toUpperCase())+'</span>'}</div>
          <div>
            <div class="profile-name">${user.displayName || 'User'}</div>
            <div class="profile-email">${user.email}</div>
            <div class="profile-plan">Free Plan</div>
          </div>
        </div>
        <div class="opts" style="margin-top:20px">
          <h4>Gemini AI Key (Optional)</h4>
          <div class="opt-row"><label>API Key</label><input type="password" id="geminiKey" placeholder="AIza..." value="${localStorage.getItem('pf_gemini_key') || ''}"></div>
          <button class="btn btn-ghost" style="margin:8px 0;padding:6px 14px;font-size:12px" onclick="localStorage.setItem('pf_gemini_key',document.getElementById('geminiKey').value);PF.toast('API key saved')">Save Key</button>
          <p style="color:var(--text3);font-size:11px">Get a free key from <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color:var(--accent)">Google AI Studio</a>. Enables AI Summarize, Chat with PDF, and OCR.</p>
        </div>
        <div style="display:flex;gap:8px;margin-top:20px">
          <button class="btn btn-ghost" style="margin:0;flex:1;justify-content:center" onclick="PFAuth.signOut();this.closest('.modal-overlay').remove()">Sign Out</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  }

  // ===== Gemini AI =====
  async function callGemini(prompt, maxTokens) {
    const key = localStorage.getItem('pf_gemini_key');
    if (!key) {
      PF.toast('Set your Gemini API key in Profile settings');
      return null;
    }
    
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {maxOutputTokens: maxTokens || 2048}
        })
      });
      
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error?.message || 'API error');
      }
      
      const data = await resp.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch(e) {
      PF.toast('Gemini AI error: ' + e.message);
      return null;
    }
  }

  // AI Summarize
  async function aiSummarize() {
    if (!PF.files.length) return PF.toast('Add a PDF file');
    PF.showProg(10);
    
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
      let allText = '';
      
      for (let i=1; i<=Math.min(pdf.numPages, 20); i++) {
        const pg = await pdf.getPage(i);
        const c = await pg.getTextContent();
        allText += c.items.map(x => x.str).join(' ') + '\n';
        PF.showProg(10 + (i/Math.min(pdf.numPages,20)) * 40);
      }
      
      if (!allText.trim()) { PF.toast('No text found in PDF'); PF.hideProg(); return; }
      
      PF.showProg(60);
      const summary = await callGemini(
        `Summarize the following document concisely. Include key points, main topics, and important details. Format with bullet points.\n\nDocument text:\n${allText.substring(0, 30000)}`,
        2048
      );
      
      PF.showProg(100);
      if (summary) {
        const resultDiv = document.getElementById('aiResult');
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `<h3 style="margin-bottom:12px;font-size:16px">AI Summary</h3><div class="ai-content">${summary.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\* /gm, '&bull; ')}</div>`;
        }
      }
    } catch(e) { PF.toast('Error: ' + e.message); }
    PF.hideProg();
  }

  // AI Chat with PDF
  let chatHistory = [];
  let pdfText = '';

  async function aiChatInit() {
    if (!PF.files.length) return PF.toast('Add a PDF file');
    
    const bytes = await PF.readBuf(PF.files[0]);
    const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
    pdfText = '';
    
    for (let i=1; i<=Math.min(pdf.numPages, 30); i++) {
      const pg = await pdf.getPage(i);
      const c = await pg.getTextContent();
      pdfText += c.items.map(x => x.str).join(' ') + '\n';
    }
    
    chatHistory = [];
    const chatArea = document.getElementById('chatMessages');
    if (chatArea) {
      chatArea.innerHTML = '<div class="chat-msg ai">PDF loaded! Ask me anything about this document.</div>';
    }
  }

  async function aiChatSend() {
    const input = document.getElementById('chatInput');
    const question = input?.value?.trim();
    if (!question) return;
    
    input.value = '';
    const chatArea = document.getElementById('chatMessages');
    chatArea.innerHTML += `<div class="chat-msg user">${question}</div>`;
    chatArea.innerHTML += `<div class="chat-msg ai typing">Thinking...</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;
    
    chatHistory.push({role: 'user', text: question});
    
    const contextPrompt = `You are an AI assistant helping the user understand a PDF document. Answer questions based on the document content below. Be concise and helpful.

Document text:
${pdfText.substring(0, 25000)}

Conversation so far:
${chatHistory.map(m => m.role + ': ' + m.text).join('\n')}

Answer the latest question:`;

    const answer = await callGemini(contextPrompt, 1024);
    
    // Remove typing indicator
    const typingEl = chatArea.querySelector('.typing');
    if (typingEl) typingEl.remove();
    
    if (answer) {
      chatHistory.push({role: 'assistant', text: answer});
      chatArea.innerHTML += `<div class="chat-msg ai">${answer.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
    } else {
      chatArea.innerHTML += `<div class="chat-msg ai" style="color:var(--accent4)">Could not get a response. Check your API key in Profile.</div>`;
    }
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // AI OCR
  async function aiOCR() {
    if (!PF.files.length) return PF.toast('Add a PDF file');
    PF.showProg(10);
    
    try {
      const bytes = await PF.readBuf(PF.files[0]);
      const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
      let allText = '';
      const total = pdf.numPages;
      
      // First try normal text extraction
      for (let i=1; i<=total; i++) {
        const pg = await pdf.getPage(i);
        const c = await pg.getTextContent();
        const pageText = c.items.map(x => x.str).join(' ');
        allText += pageText + '\n\n';
        PF.showProg(10 + (i/total)*40);
      }
      
      // If very little text found, it might be a scanned PDF - render and use Gemini vision
      if (allText.trim().length < 100 && total <= 5) {
        PF.showProg(60);
        PF.toast('Scanned PDF detected. Using AI for text recognition...');
        
        // Render first page to image
        const page = await pdf.getPage(1);
        const vp = page.getViewport({scale:2});
        const cvs = document.createElement('canvas');
        cvs.width = vp.width; cvs.height = vp.height;
        await page.render({canvasContext:cvs.getContext('2d'), viewport:vp}).promise;
        
        const imgData = cvs.toDataURL('image/jpeg', 0.9);
        const base64Img = imgData.split(',')[1];
        
        const key = localStorage.getItem('pf_gemini_key');
        if (key) {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              contents: [{parts: [
                {inlineData: {mimeType: 'image/jpeg', data: base64Img}},
                {text: 'Extract all visible text from this image. Preserve the layout and formatting as much as possible. Return only the extracted text.'}
              ]}]
            })
          });
          const data = await resp.json();
          allText = data.candidates?.[0]?.content?.parts?.[0]?.text || allText;
        }
      }
      
      PF.showProg(100);
      const blob = new Blob([allText], {type:'text/plain'});
      PF.showResult(`OCR complete - ${allText.length} characters extracted`, blob, 'ocr_output.txt');
      
      // Show in result area if available
      const resultDiv = document.getElementById('aiResult');
      if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<h3 style="margin-bottom:12px;font-size:16px">Extracted Text</h3><div class="ai-content" style="max-height:400px;overflow-y:auto;white-space:pre-wrap;font-size:13px">${allText.substring(0, 5000)}${allText.length > 5000 ? '\n\n... (truncated, full text in download)' : ''}</div>`;
      }
    } catch(e) { PF.toast('Error: ' + e.message); }
    PF.hideProg();
  }

  // ===== Close Dashboard =====
  function closeDashboard() {
    const dash = document.getElementById('dashView');
    if (dash) dash.style.display = 'none';
    document.getElementById('homeView').style.display = '';
  }

  // ===== Init on load =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init, showLogin, showSignup, emailAuth, googleAuth, signOut,
    showDashboard, closeDashboard, showProfile,
    loadFiles, createFolder, deleteFile, renameFile, fileMenu, uploadFiles,
    saveFile,
    aiSummarize, aiChatInit, aiChatSend, aiOCR, callGemini,
    get user() { return user; }
  };

})();
