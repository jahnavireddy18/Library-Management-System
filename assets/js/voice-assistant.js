/**
 * ============================================
 *  SMART LIBRARY – AI VOICE ASSISTANT
 *  100% Offline  |  Web Speech API
 *  Page navigation, search, theme, scroll & more
 * ============================================
 */
(function () {
  'use strict';

  /* ── Guard: only init once ── */
  if (window.__VA_INIT) return;
  window.__VA_INIT = true;

  /* ── Detect browser support ── */
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('[VA] Speech Recognition not supported');
    return;
  }

  /* ═══════════════════════════════
     1.  BUILD THE DOM
     ═══════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('va-css-link')) return;
    const link = document.createElement('link');
    link.id = 'va-css-link';
    link.rel = 'stylesheet';
    link.href = 'assets/css/voice-assistant.css';
    document.head.appendChild(link);
  }

  function buildUI() {
    /* Floating action button */
    const fab = document.createElement('button');
    fab.className = 'va-fab';
    fab.id = 'vaFab';
    fab.title = 'AI Voice Assistant (offline)';
    fab.setAttribute('aria-label', 'Open voice assistant');
    fab.innerHTML = '<i class="fas fa-microphone"></i>';
    document.body.appendChild(fab);

    /* Full‑screen overlay panel */
    const overlay = document.createElement('div');
    overlay.className = 'va-overlay';
    overlay.id = 'vaOverlay';
    overlay.innerHTML = `
      <div class="va-panel">
        <button class="va-close" id="vaClose" aria-label="Close assistant"><i class="fas fa-times"></i></button>

        <div class="va-orb-wrap" id="vaOrbWrap">
          <div class="va-ring"></div>
          <div class="va-ring"></div>
          <div class="va-ring"></div>
          <div class="va-orb" id="vaOrb"><i class="fas fa-microphone"></i></div>
        </div>

        <div class="va-wave" id="vaWave">
          <div class="bar"></div><div class="bar"></div><div class="bar"></div>
          <div class="bar"></div><div class="bar"></div><div class="bar"></div>
          <div class="bar"></div><div class="bar"></div><div class="bar"></div>
        </div>

        <div class="va-status" id="vaStatus">Tap the orb to speak</div>
        <div class="va-sub" id="vaSub">Fully offline · No internet needed</div>

        <div class="va-transcript" id="vaTranscript"></div>
        <div class="va-response" id="vaResponse"></div>

        <div class="va-hints" id="vaHints">
          <span class="va-hint" data-cmd="go to home">🏠 Home</span>
          <span class="va-hint" data-cmd="go to login">🔑 Login</span>
          <span class="va-hint" data-cmd="open admin dashboard">👤 Admin</span>
          <span class="va-hint" data-cmd="open library">📚 Library</span>
          <span class="va-hint" data-cmd="toggle theme">🌙 Theme</span>
          <span class="va-hint" data-cmd="help">❓ Help</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    /* Toast container */
    const toast = document.createElement('div');
    toast.className = 'va-toast';
    toast.id = 'vaToast';
    document.body.appendChild(toast);
  }

  /* ═══════════════════════════════
     2.  SPEECH ENGINE
     ═══════════════════════════════ */
  let recognition = null;
  let isListening = false;
  let navigateTimeout = null;

  function createRecognition() {
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.maxAlternatives = 1;

    r.onstart = () => {
      isListening = true;
      setUI('listening');
    };

    r.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const transcript = document.getElementById('vaTranscript');
      if (transcript) {
        transcript.textContent = final || interim;
      }
      if (final) {
        handleCommand(final.trim().toLowerCase());
      }
    };

    r.onerror = (e) => {
      console.warn('[VA] Error:', e.error);
      if (e.error === 'not-allowed') {
        setUI('idle');
        showResponse('Microphone access denied. Please allow mic permissions.');
      } else if (e.error !== 'aborted') {
        setUI('idle');
        showResponse("Didn't catch that. Try again!");
      }
      isListening = false;
    };

    r.onend = () => {
      isListening = false;
      setUI('idle');
    };

    return r;
  }

  function startListening() {
    if (isListening) { stopListening(); return; }
    if (!recognition) recognition = createRecognition();
    try {
      const transcript = document.getElementById('vaTranscript');
      if (transcript) transcript.textContent = '';
      hideResponse();
      recognition.start();
    } catch (_) { /* already started */ }
  }

  function stopListening() {
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    isListening = false;
    setUI('idle');
  }

  /* ═══════════════════════════════
     3.  UI STATE
     ═══════════════════════════════ */
  function setUI(state) {
    const fab = document.getElementById('vaFab');
    const orb = document.getElementById('vaOrb');
    const orbWrap = document.getElementById('vaOrbWrap');
    const wave = document.getElementById('vaWave');
    const status = document.getElementById('vaStatus');
    const sub = document.getElementById('vaSub');

    if (state === 'listening') {
      fab && fab.classList.add('listening');
      orb && orb.classList.add('listening');
      orbWrap && orbWrap.classList.add('listening');
      wave && wave.classList.add('active');
      if (status) status.textContent = 'Listening...';
      if (sub) sub.textContent = 'Speak your command now';
    } else {
      fab && fab.classList.remove('listening');
      orb && orb.classList.remove('listening');
      orbWrap && orbWrap.classList.remove('listening');
      wave && wave.classList.remove('active');
      if (status) status.textContent = 'Tap the orb to speak';
      if (sub) sub.textContent = 'Fully offline · No internet needed';
    }
  }

  function openPanel() {
    const o = document.getElementById('vaOverlay');
    if (o) o.classList.add('active');
  }

  function closePanel() {
    stopListening();
    const o = document.getElementById('vaOverlay');
    if (o) o.classList.remove('active');
  }

  function showResponse(text) {
    const el = document.getElementById('vaResponse');
    if (el) { el.textContent = text; el.classList.add('visible'); }
  }
  function hideResponse() {
    const el = document.getElementById('vaResponse');
    if (el) { el.textContent = ''; el.classList.remove('visible'); }
  }

  function showToast(text, icon) {
    const t = document.getElementById('vaToast');
    if (!t) return;
    t.innerHTML = `<i class="fas fa-${icon || 'robot'}"></i> ${text}`;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* ═══════════════════════════════
     4.  TEXT‑TO‑SPEECH (offline)
     ═══════════════════════════════ */
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1;
    u.volume = 1;
    // Prefer an offline English voice
    const voices = window.speechSynthesis.getVoices();
    const eng = voices.find(v => v.lang.startsWith('en') && v.localService) || voices.find(v => v.lang.startsWith('en'));
    if (eng) u.voice = eng;
    window.speechSynthesis.speak(u);
  }

  /* ═══════════════════════════════
     5.  COMMAND HANDLER
     ═══════════════════════════════ */

  /* Detect current page */
  function currentPage() {
    const p = window.location.pathname.split('/').pop() || 'index.html';
    return p.toLowerCase();
  }

  /* Navigate with a small delay so the user hears the response */
  function navigateTo(page, label) {
    speak('Navigating to ' + label);
    showResponse('🚀 Going to ' + label + '...');
    showToast('Navigating to ' + label, 'route');
    clearTimeout(navigateTimeout);
    navigateTimeout = setTimeout(() => { window.location.href = page; }, 1200);
  }

  /* Scroll to a section on the current page */
  function scrollToSection(id, label) {
    const el = document.getElementById(id) || document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      speak('Scrolling to ' + label);
      showResponse('📍 Scrolled to ' + label);
    } else {
      speak('Section not found on this page.');
      showResponse('Section "' + label + '" not found here.');
    }
  }

  function handleCommand(cmd) {
    console.log('[VA] Command:', cmd);

    /* ── Navigation commands ── */
    const navMap = [
      { keys: ['go to home', 'open home', 'home page', 'main page', 'go home'],                       page: 'index.html',              label: 'Home' },
      { keys: ['go to login', 'open login', 'sign in', 'login page'],                                  page: 'role.html',               label: 'Login' },
      { keys: ['role', 'select role', 'role page', 'choose role', 'go to role'],                        page: 'role.html',               label: 'Role Selection' },
      { keys: ['student dashboard', 'student page', 'open student', 'go to student'],                   page: 'student_dashboard.html',  label: 'Student Dashboard' },
      { keys: ['teacher dashboard', 'teacher page', 'open teacher', 'go to teacher'],                   page: 'teacher_dashboard.html',  label: 'Teacher Dashboard' },
      { keys: ['librarian dashboard', 'librarian page', 'open librarian', 'go to librarian'],           page: 'librarian_dashboard.html',label: 'Librarian Dashboard' },
      { keys: ['admin dashboard', 'admin page', 'open admin', 'go to admin', 'admin panel'],            page: 'admin_dashboard.html',    label: 'Admin Dashboard' },
      { keys: ['library', 'books page', 'open library', 'go to library', 'book list', 'view books'],    page: 'library.html',            label: 'Library' },
      { keys: ['reports', 'report page', 'analytics', 'open reports', 'go to reports'],                  page: 'reports.html',            label: 'Reports' },
      { keys: ['backup', 'back up', 'backup page', 'open backup', 'go to backup'],                      page: 'backup.html',             label: 'Backup' },
    ];

    for (const n of navMap) {
      if (n.keys.some(k => cmd.includes(k))) {
        navigateTo(n.page, n.label);
        return;
      }
    }

    /* ── Scroll commands (index.html sections) ── */
    if (cmd.includes('scroll to books') || cmd.includes('show books') || cmd.includes('books section')) {
      scrollToSection('books', 'Books Section'); return;
    }
    if (cmd.includes('scroll to services') || cmd.includes('services section') || cmd.includes('show services')) {
      scrollToSection('services', 'Services Section'); return;
    }
    if (cmd.includes('scroll to contact') || cmd.includes('contact section') || cmd.includes('contact us')) {
      scrollToSection('contact', 'Contact Section'); return;
    }
    if (cmd.includes('scroll to top') || cmd === 'top' || cmd.includes('go to top') || cmd.includes('back to top')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      speak('Scrolled to top'); showResponse('⬆️ Scrolled to top'); return;
    }
    if (cmd.includes('scroll down') || cmd.includes('go down')) {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      speak('Scrolling down'); showResponse('⬇️ Scrolling down'); return;
    }
    if (cmd.includes('scroll up') || cmd.includes('go up')) {
      window.scrollBy({ top: -500, behavior: 'smooth' });
      speak('Scrolling up'); showResponse('⬆️ Scrolling up'); return;
    }

    /* ── Search ── */
    if (cmd.includes('search') || cmd.includes('find')) {
      const term = cmd.replace(/search|find|for/gi, '').trim();
      if (term) {
        const inp = document.getElementById('searchInput')
                 || document.querySelector('input[type="search"]')
                 || document.querySelector('input[placeholder*="earch"]')
                 || document.querySelector('.search');
        if (inp) {
          inp.value = term;
          inp.focus();
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('keyup', { bubbles: true }));
          const btn = document.getElementById('searchBtn');
          if (btn) btn.click();
          speak('Searching for ' + term);
          showResponse('🔍 Searching: "' + term + '"');
        } else {
          speak('No search box on this page.');
          showResponse('Search not available on this page.');
        }
      } else {
        speak('What would you like to search for?');
        showResponse('Say "search" followed by your query.');
      }
      return;
    }

    /* ── Theme toggle ── */
    if (cmd.includes('theme') || cmd.includes('dark mode') || cmd.includes('light mode') || cmd.includes('toggle theme') || (cmd.includes('dark') && !cmd.includes('dashboard')) || (cmd.includes('light') && !cmd.includes('dashboard'))) {
      const toggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
      if (toggle) {
        toggle.click();
        speak('Theme toggled');
        showResponse('🎨 Theme toggled');
      } else {
        document.body.classList.toggle('light');
        speak('Theme toggled');
        showResponse('🎨 Theme toggled');
      }
      return;
    }

    /* ── Logout ── */
    if (cmd.includes('logout') || cmd.includes('sign out') || cmd.includes('log out')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window.logout === 'function') {
        window.logout();
      }
      speak('Logging out');
      showResponse('👋 Logging out...');
      navigateTimeout = setTimeout(() => { window.location.href = 'role.html'; }, 1200);
      return;
    }

    /* ── Go back ── */
    if (cmd.includes('go back') || cmd.includes('previous page') || cmd === 'back') {
      speak('Going back');
      showResponse('⬅️ Going back...');
      setTimeout(() => history.back(), 800);
      return;
    }

    /* ── Refresh ── */
    if (cmd.includes('refresh') || cmd.includes('reload')) {
      speak('Refreshing page');
      showResponse('🔄 Refreshing...');
      setTimeout(() => location.reload(), 800);
      return;
    }

    /* ── Time ── */
    if (cmd.includes('what time') || cmd.includes('current time') || cmd.includes('tell me the time')) {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      speak('The current time is ' + now);
      showResponse('🕐 ' + now);
      return;
    }

    /* ── Date ── */
    if (cmd.includes('what date') || cmd.includes('today') || cmd.includes("today's date") || cmd.includes('current date')) {
      const d = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      speak('Today is ' + d);
      showResponse('📅 ' + d);
      return;
    }

    /* ── Where am I ── */
    if (cmd.includes('where am i') || cmd.includes('current page') || cmd.includes('which page')) {
      const page = currentPage().replace('.html', '').replace(/_/g, ' ');
      speak('You are on the ' + page + ' page');
      showResponse('📍 Current page: ' + page);
      return;
    }

    /* ── Close assistant ── */
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('bye') || cmd.includes('goodbye') || cmd.includes('stop')) {
      speak('Goodbye!');
      showResponse('👋 Goodbye!');
      setTimeout(closePanel, 1000);
      return;
    }

    /* ── Help ── */
    if (cmd.includes('help') || cmd.includes('commands') || cmd.includes('what can you do')) {
      const helpText = 'You can say: Go to Home, Login, Student Dashboard, Admin Dashboard, Library, Reports. Also: search for a book, toggle theme, scroll up or down, go back, refresh, what time is it, or logout.';
      speak(helpText);
      showResponse('📖 ' + helpText);
      return;
    }

    /* ── Hello / greeting ── */
    if (cmd.includes('hello') || cmd.includes('hi') || cmd.includes('hey') || cmd.includes('good morning') || cmd.includes('good afternoon') || cmd.includes('good evening')) {
      const hour = new Date().getHours();
      let greeting = 'Hello!';
      if (hour < 12) greeting = 'Good morning!';
      else if (hour < 17) greeting = 'Good afternoon!';
      else greeting = 'Good evening!';
      speak(greeting + ' How can I help you with the library today?');
      showResponse('👋 ' + greeting + ' How can I help?');
      return;
    }

    /* ── Thank you ── */
    if (cmd.includes('thank') || cmd.includes('thanks')) {
      speak("You're welcome! Happy to help.");
      showResponse("😊 You're welcome!");
      return;
    }

    /* ── Fallback ── */
    speak("Sorry, I didn't understand that. Say help for available commands.");
    showResponse("❓ Didn't understand. Say \"help\" for commands.");
  }

  /* ═══════════════════════════════
     6.  INIT
     ═══════════════════════════════ */
  function init() {
    injectCSS();
    buildUI();

    /* Preload voices */
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    /* Fab → open panel + start listening */
    document.getElementById('vaFab').addEventListener('click', () => {
      openPanel();
      setTimeout(startListening, 350);
    });

    /* Orb → toggle listening */
    document.getElementById('vaOrb').addEventListener('click', (e) => {
      e.stopPropagation();
      startListening();
    });

    /* Close button */
    document.getElementById('vaClose').addEventListener('click', closePanel);

    /* Overlay backdrop click */
    document.getElementById('vaOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'vaOverlay') closePanel();
    });

    /* Hint chips */
    document.querySelectorAll('.va-hint').forEach(h => {
      h.addEventListener('click', () => {
        const cmd = h.getAttribute('data-cmd');
        const transcript = document.getElementById('vaTranscript');
        if (transcript) transcript.textContent = cmd;
        handleCommand(cmd);
      });
    });

    /* Keyboard: Escape to close */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });

    /* Hide old voice button if any */
    const old = document.getElementById('voiceBtn');
    if (old) old.style.display = 'none';
  }

  /* Wait for DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();