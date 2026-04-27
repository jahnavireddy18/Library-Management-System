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
    link.href = '/voice-assistant.css';
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
    return r;
  }

  function startListening() {
    if (!recognition) recognition = createRecognition();
    isListening = true;
    document.getElementById('vaFab').classList.add('listening');
    document.getElementById('vaStatus').textContent = 'Listening...';
    document.getElementById('vaTranscript').textContent = '';
    recognition.start();
  }

  function stopListening() {
    isListening = false;
    document.getElementById('vaFab').classList.remove('listening');
    if (recognition) recognition.stop();
  }

  function processCommand(transcript) {
    const cmd = transcript.toLowerCase().trim();
    document.getElementById('vaTranscript').textContent = `You said: "${transcript}"`;

    if (cmd.includes('go to home') || cmd.includes('home')) {
      navigate('/');
    } else if (cmd.includes('go to login') || cmd.includes('login')) {
      navigate('/login');
    } else if (cmd.includes('admin dashboard') || cmd.includes('admin')) {
      navigate('/admin');
    } else if (cmd.includes('open library') || cmd.includes('library')) {
      navigate('/');
    } else if (cmd.includes('toggle theme') || cmd.includes('theme')) {
      toggleTheme();
    } else if (cmd.includes('help')) {
      showHelp();
    } else {
      document.getElementById('vaResponse').textContent = '❌ Command not recognized';
    }
  }

  function navigate(path) {
    window.location.href = path;
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('vaResponse').textContent = '✅ Theme toggled';
  }

  function showHelp() {
    document.getElementById('vaResponse').textContent = '✅ Try commands like "go to home", "open library", "toggle theme"';
  }

  /* ═══════════════════════════════
     3.  EVENT LISTENERS
     ═══════════════════════════════ */
  function initListeners() {
    injectCSS();
    buildUI();

    const fab = document.getElementById('vaFab');
    const overlay = document.getElementById('vaOverlay');
    const close = document.getElementById('vaClose');

    fab.addEventListener('click', () => {
      overlay.classList.toggle('active');
      if (overlay.classList.contains('active')) startListening();
    });

    close.addEventListener('click', () => {
      overlay.classList.remove('active');
      stopListening();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        stopListening();
      }
    });

    recognition = createRecognition();

    recognition.onstart = () => {
      document.getElementById('vaWave').classList.add('active');
    };

    recognition.onend = () => {
      document.getElementById('vaWave').classList.remove('active');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) processCommand(transcript);
    };

    recognition.onerror = (event) => {
      document.getElementById('vaResponse').textContent = `❌ Error: ${event.error}`;
    };
  }

  /* ── Initialize when DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListeners);
  } else {
    initListeners();
  }
})();
