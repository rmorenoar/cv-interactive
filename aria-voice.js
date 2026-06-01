/**
 * Aria Voice Widget - Browser-based voice conversation
 * Like a Meet/Teams call but with Aria AI
 * Uses: Web Speech API (STT) + Bedrock Lambda (AI) + Speech Synthesis (TTS)
 * Author: Roberto Moreno Araneda
 */
(function() {
'use strict';

const ARIA_API_URL = "https://87kqwpwsvj.execute-api.ap-southeast-2.amazonaws.com/prod/chat";

// State
let isListening = false;
let isAriaSpeaking = false;
let recognition = null;
let speechSynth = window.speechSynthesis;
let ariaVoice = null;
let callActive = false;
let callDuration = 0;
let callTimer = null;
let micStream = null;
let audioContext = null;
let analyser = null;
let levelRAF = null;

// Find best Aria-like voice (NZ/AU/UK English female)
function findAriaVoice() {
  const voices = speechSynth.getVoices();
  // Priority: NZ > AU > UK > US female
  const priorities = [
    v => v.lang === 'en-NZ' && v.name.toLowerCase().includes('female'),
    v => v.lang === 'en-NZ',
    v => v.lang === 'en-AU' && v.name.toLowerCase().includes('female'),
    v => v.lang === 'en-AU',
    v => v.lang === 'en-GB' && v.name.toLowerCase().includes('female'),
    v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'),
    v => v.lang.startsWith('en'),
  ];
  for (const test of priorities) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0] || null;
}

// Initialize speech recognition
function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-US';
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    console.log('[Aria] Recognition started');
    isListening = true;
  };

  rec.onaudiostart = () => console.log('[Aria] 🎙️ Audio capture started');
  rec.onsoundstart = () => console.log('[Aria] 🔊 Sound detected');
  rec.onspeechstart = () => console.log('[Aria] 🗣️ Speech detected!');
  rec.onspeechend = () => console.log('[Aria] Speech ended');

  rec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    console.log('[Aria] Heard:', transcript, '| final:', result.isFinal);
    updateTranscript(transcript, result.isFinal);
    if (result.isFinal && transcript.trim()) {
      handleUserSpeech(transcript.trim());
    }
  };

  rec.onend = () => {
    console.log('[Aria] Recognition ended. callActive:', callActive, 'speaking:', isAriaSpeaking);
    isListening = false;
    // Auto-restart listening if call is active and Aria isn't speaking
    if (callActive && !isAriaSpeaking) {
      setTimeout(() => {
        if (callActive && !isAriaSpeaking) startListening();
      }, 300);
    }
  };

  rec.onerror = (event) => {
    console.warn('[Aria] Recognition error:', event.error);
    isListening = false;
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      updateStatus('error');
      const el = document.getElementById('aria-call-status');
      if (el) el.textContent = '🚫 Microphone blocked. Allow mic access and reload.';
    } else if (event.error === 'no-speech' || event.error === 'aborted') {
      // Normal — onend will handle restart
    } else {
      updateStatus('error');
    }
  };

  return rec;
}

function startListening() {
  if (!recognition || isAriaSpeaking || isListening) return;
  try {
    recognition.start();
    updateStatus('listening');
  } catch (e) {
    console.warn('[Aria] start() failed:', e.message);
    // If already started, that's fine
  }
}

function stopListening() {
  if (!recognition) return;
  try { recognition.stop(); } catch(e) {}
  isListening = false;
}

// Handle user's spoken input
async function handleUserSpeech(text) {
  stopListening();
  updateStatus('thinking');
  addToLog('You', text);

  try {
    const response = await fetch(ARIA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const ariaResponse = data.response || "I'm sorry, I didn't catch that. Could you repeat?";

    addToLog('Aria', ariaResponse);
    await speakAria(ariaResponse);

  } catch (error) {
    console.error('API error:', error);
    const fallback = "I'm having a moment — could you try again?";
    addToLog('Aria', fallback);
    await speakAria(fallback);
  }
}

// Aria speaks
function speakAria(text) {
  return new Promise((resolve) => {
    isAriaSpeaking = true;
    stopListening();  // Stop mic so Aria doesn't hear herself
    speechSynth.cancel();  // Clear any queued speech
    updateStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = ariaVoice;
    utterance.lang = ariaVoice ? ariaVoice.lang : 'en-NZ';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    utterance.onend = () => {
      isAriaSpeaking = false;
      if (callActive) {
        // Small delay so the mic doesn't catch the tail of Aria's voice
        setTimeout(() => {
          if (callActive && !isAriaSpeaking) {
            updateStatus('listening');
            startListening();
          }
        }, 400);
      }
      resolve();
    };

    utterance.onerror = () => {
      isAriaSpeaking = false;
      if (callActive) startListening();
      resolve();
    };

    speechSynth.speak(utterance);
  });
}

// Live volume meter — shows if the mic is actually capturing sound
function setupVolumeMeter(stream) {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      const pct = Math.min(100, Math.round((avg / 128) * 100));
      const bar = document.getElementById('aria-mic-level-bar');
      if (bar) bar.style.width = pct + '%';
      levelRAF = requestAnimationFrame(tick);
    }
    tick();
    console.log('[Aria] Volume meter active');
  } catch (e) {
    console.warn('[Aria] Could not set up volume meter:', e);
  }
}

function stopVolumeMeter() {
  if (levelRAF) cancelAnimationFrame(levelRAF);
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  if (audioContext) audioContext.close().catch(() => {});
  micStream = null; audioContext = null; analyser = null; levelRAF = null;
}

// Start call
async function startCall() {
  recognition = initRecognition();

  if (!recognition) {
    alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
    return;
  }

  // Request microphone permission explicitly first
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Set up a live volume meter so we can SEE if the mic captures sound
    setupVolumeMeter(micStream);
  } catch (e) {
    console.error('[Aria] Mic permission denied:', e);
    alert('Aria needs microphone access to talk. Please allow microphone permission and try again.');
    return;
  }

  callActive = true;
  callDuration = 0;

  // Load voices
  ariaVoice = findAriaVoice();
  if (!ariaVoice) {
    speechSynth.onvoiceschanged = () => { ariaVoice = findAriaVoice(); };
  }

  showCallUI();
  startTimer();

  // Aria greets first, then starts listening (handled in speakAria.onend)
  const greeting = "Kia ora! I'm Aria, Roberto's AI assistant. How can I help you today?";
  addToLog('Aria', greeting);
  await speakAria(greeting);
}

// End call
function endCall() {
  callActive = false;
  stopListening();
  stopVolumeMeter();
  speechSynth.cancel();
  clearInterval(callTimer);
  isAriaSpeaking = false;

  // Aria says goodbye
  const bye = "Nga mihi! Thanks for chatting. Have a great day!";
  addToLog('Aria', bye);
  const utterance = new SpeechSynthesisUtterance(bye);
  utterance.voice = ariaVoice;
  utterance.rate = 0.95;
  utterance.onend = () => hideCallUI();
  speechSynth.speak(utterance);
}

// Timer
function startTimer() {
  callTimer = setInterval(() => {
    callDuration++;
    const min = Math.floor(callDuration / 60).toString().padStart(2, '0');
    const sec = (callDuration % 60).toString().padStart(2, '0');
    const el = document.getElementById('aria-call-timer');
    if (el) el.textContent = `${min}:${sec}`;
  }, 1000);
}

// UI helpers
function updateStatus(status) {
  const el = document.getElementById('aria-call-status');
  if (!el) return;
  const labels = {
    listening: '🎤 Listening... (speak now)',
    thinking: '💭 Thinking...',
    speaking: '🔊 Aria is speaking...',
    error: '⚠️ Something went wrong',
    idle: '⏸ Muted'
  };
  el.textContent = labels[status] || '';
  el.className = `aria-call-status ${status}`;
}

function updateTranscript(text, isFinal) {
  const el = document.getElementById('aria-call-transcript');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = isFinal ? '1' : '0.6';
}

function addToLog(speaker, text) {
  const log = document.getElementById('aria-call-log');
  if (!log) return;
  const entry = document.createElement('div');
  entry.className = `aria-log-entry ${speaker.toLowerCase()}`;
  entry.innerHTML = `<strong>${speaker}:</strong> ${text}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// Create UI
function showCallUI() {
  // Remove existing
  const existing = document.getElementById('aria-voice-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'aria-voice-panel';
  panel.innerHTML = `
    <div class="aria-call-header">
      <div class="aria-call-avatar">A</div>
      <div class="aria-call-info">
        <h3>Aria - Voice Call</h3>
        <span id="aria-call-timer">00:00</span>
      </div>
      <button id="aria-call-end" title="End call">✕</button>
    </div>
    <div id="aria-call-status" class="aria-call-status listening">🎤 Listening...</div>
    <div class="aria-mic-level"><div id="aria-mic-level-bar"></div></div>
    <div id="aria-call-transcript" class="aria-call-transcript"></div>
    <div id="aria-call-log" class="aria-call-log"></div>
    <div class="aria-call-controls">
      <button id="aria-call-mute" class="aria-ctrl-btn" title="Mute">🎤</button>
      <button id="aria-call-hangup" class="aria-ctrl-btn hangup" title="Hang up">📞</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Events
  document.getElementById('aria-call-end').onclick = endCall;
  document.getElementById('aria-call-hangup').onclick = endCall;
  document.getElementById('aria-call-mute').onclick = toggleMute;
}

function hideCallUI() {
  const panel = document.getElementById('aria-voice-panel');
  if (panel) {
    panel.style.animation = 'aria-slide-down 0.3s ease-in forwards';
    setTimeout(() => panel.remove(), 300);
  }
}

function toggleMute() {
  if (isListening) {
    stopListening();
    updateStatus('idle');
    document.getElementById('aria-call-mute').textContent = '🔇';
  } else {
    startListening();
    document.getElementById('aria-call-mute').textContent = '🎤';
  }
}

// Create the "Call Aria" button
function createCallButton() {
  const btn = document.createElement('button');
  btn.id = 'aria-voice-toggle';
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;
  btn.title = 'Call Aria (voice)';
  document.body.appendChild(btn);
  btn.onclick = startCall;
}

// Inject styles
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #aria-voice-toggle {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 24px rgba(34, 197, 94, 0.4);
      z-index: 9997;
      transition: all 0.3s;
    }
    #aria-voice-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 32px rgba(34, 197, 94, 0.6);
    }

    #aria-voice-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-width: 95vw;
      height: 600px;
      max-height: 90vh;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 20px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.7);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: aria-slide-up 0.3s ease-out;
    }
    @keyframes aria-slide-up {
      from { opacity: 0; transform: translate(-50%, -45%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes aria-slide-down {
      from { opacity: 1; transform: translate(-50%, -50%); }
      to { opacity: 0; transform: translate(-50%, -55%); }
    }

    .aria-call-header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 2px solid #22c55e;
    }
    .aria-call-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
      color: white;
    }
    .aria-call-info h3 {
      margin: 0;
      color: white;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
    }
    .aria-call-info span {
      color: #22c55e;
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
    }
    #aria-call-end {
      margin-left: auto;
      background: none;
      border: none;
      color: #64748b;
      font-size: 22px;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
    }
    #aria-call-end:hover { color: #ef4444; }

    .aria-call-status {
      text-align: center;
      padding: 12px;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      color: #94a3b8;
      border-bottom: 1px solid #1e293b;
    }
    .aria-call-status.listening { color: #22c55e; }
    .aria-call-status.thinking { color: #f59e0b; }
    .aria-call-status.speaking { color: #3b82f6; }

    .aria-call-transcript {
      text-align: center;
      padding: 8px 16px;
      font-size: 13px;
      color: #cbd5e1;
      font-style: italic;
      min-height: 24px;
      font-family: 'Inter', sans-serif;
    }

    .aria-mic-level {
      height: 6px;
      margin: 0 16px 4px;
      background: #1e293b;
      border-radius: 3px;
      overflow: hidden;
    }
    #aria-mic-level-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #22c55e, #4ade80);
      transition: width 0.08s linear;
    }

    .aria-call-log {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .aria-call-log::-webkit-scrollbar { width: 4px; }
    .aria-call-log::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    .aria-log-entry {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      font-family: 'Inter', sans-serif;
      max-width: 90%;
    }
    .aria-log-entry.aria {
      align-self: flex-start;
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
    }
    .aria-log-entry.you {
      align-self: flex-end;
      background: #22c55e;
      color: white;
    }
    .aria-log-entry strong {
      display: block;
      font-size: 11px;
      margin-bottom: 4px;
      opacity: 0.7;
    }

    .aria-call-controls {
      padding: 20px;
      display: flex;
      justify-content: center;
      gap: 24px;
      background: #0f172a;
      border-top: 1px solid #1e293b;
    }
    .aria-ctrl-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      font-size: 24px;
      cursor: pointer;
      background: #1e293b;
      transition: all 0.2s;
    }
    .aria-ctrl-btn:hover { background: #334155; transform: scale(1.05); }
    .aria-ctrl-btn.hangup {
      background: #ef4444;
      transform: rotate(135deg);
    }
    .aria-ctrl-btn.hangup:hover { background: #dc2626; }
  `;
  document.head.appendChild(style);
}

// Init
function init() {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Aria Voice: Speech Recognition not supported in this browser');
    return;
  }

  injectStyles();
  createCallButton();

  // Preload voices
  if (speechSynth.getVoices().length) {
    ariaVoice = findAriaVoice();
  } else {
    speechSynth.onvoiceschanged = () => { ariaVoice = findAriaVoice(); };
  }
}

// Start when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
