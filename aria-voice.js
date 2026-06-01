/**
 * Aria Voice Widget - Browser-based voice conversation (Push-to-Talk)
 * Like a Meet/Teams call but with Aria AI
 * Uses: Web Speech API (STT) + Bedrock Lambda (AI) + Speech Synthesis (TTS)
 * Author: Roberto Moreno Araneda
 */
(function() {
'use strict';

const ARIA_API_URL = "https://87kqwpwsvj.execute-api.ap-southeast-2.amazonaws.com/prod/chat";

// State
let recognition = null;
let speechSynth = window.speechSynthesis;
let ariaVoice = null;
let callActive = false;
let callDuration = 0;
let callTimer = null;
let isRecording = false;
let isAriaSpeaking = false;
let finalTranscript = '';

// Find best Aria-like voice (NZ/AU/UK English female)
function findAriaVoice() {
  const voices = speechSynth.getVoices();
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

// Initialize speech recognition (push-to-talk: short bursts)
function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous = false;       // single utterance per press
  rec.interimResults = true;
  rec.lang = 'en-US';
  rec.maxAlternatives = 1;

  rec.onstart = () => console.log('[Aria] 🎙️ Recording started');
  rec.onspeechstart = () => console.log('[Aria] 🗣️ Speech detected');

  rec.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += t + ' ';
      } else {
        interim += t;
      }
    }
    updateTranscript(finalTranscript + interim);
  };

  rec.onerror = (event) => {
    console.warn('[Aria] Recognition error:', event.error);
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      updateStatus('error', '🚫 Microphone blocked. Allow mic access and reload.');
    } else if (event.error === 'no-speech') {
      updateStatus('idle', '🤔 Didn\'t catch that — hold the button and try again.');
    }
  };

  rec.onend = () => {
    console.log('[Aria] Recording ended. Final:', finalTranscript.trim());
    isRecording = false;
    updateMicButton(false);
    const text = finalTranscript.trim();
    if (text) {
      handleUserSpeech(text);
    } else if (callActive) {
      updateStatus('idle', '🎤 Hold the button to speak');
    }
  };

  return rec;
}

// Push-to-talk: start recording
function startRecording() {
  if (!recognition || isAriaSpeaking || isRecording) return;
  // Stop Aria if she's talking (user wants to interrupt)
  speechSynth.cancel();
  isAriaSpeaking = false;
  finalTranscript = '';
  isRecording = true;
  updateMicButton(true);
  updateStatus('listening', '🎤 Listening... (release when done)');
  updateTranscript('');
  try {
    recognition.start();
  } catch (e) {
    console.warn('[Aria] start failed:', e.message);
    isRecording = false;
    updateMicButton(false);
  }
}

// Push-to-talk: stop recording
function stopRecording() {
  if (!recognition || !isRecording) return;
  try {
    recognition.stop();
  } catch (e) {}
}

// Handle user's spoken input
async function handleUserSpeech(text) {
  updateStatus('thinking', '💭 Thinking...');
  addToLog('You', text);
  updateTranscript('');

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
    speakAria(ariaResponse);
  } catch (error) {
    console.error('[Aria] API error:', error);
    const fallback = "I'm having a moment — could you try again?";
    addToLog('Aria', fallback);
    speakAria(fallback);
  }
}

// Aria speaks
function speakAria(text) {
  isAriaSpeaking = true;
  speechSynth.cancel();
  updateStatus('speaking', '🔊 Aria is speaking...');

  // Split into sentences for more reliable playback on long text
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = ariaVoice;
  utterance.lang = ariaVoice ? ariaVoice.lang : 'en-NZ';
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;

  utterance.onend = () => {
    isAriaSpeaking = false;
    if (callActive) updateStatus('idle', '🎤 Hold the button to speak');
  };
  utterance.onerror = () => {
    isAriaSpeaking = false;
    if (callActive) updateStatus('idle', '🎤 Hold the button to speak');
  };

  speechSynth.speak(utterance);
}

// Start call
async function startCall() {
  recognition = initRecognition();
  if (!recognition) {
    alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
    return;
  }

  // Request mic permission (then release immediately — recognition opens its own)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
  } catch (e) {
    console.error('[Aria] Mic permission denied:', e);
    alert('Aria needs microphone access. Please allow it and try again.');
    return;
  }

  callActive = true;
  callDuration = 0;
  ariaVoice = findAriaVoice();
  if (!ariaVoice) speechSynth.onvoiceschanged = () => { ariaVoice = findAriaVoice(); };

  showCallUI();
  startTimer();

  const greeting = "Kia ora! I'm Aria, Roberto's AI assistant. Hold the green button to talk to me. How can I help you today?";
  addToLog('Aria', greeting);
  speakAria(greeting);
}

// End call
function endCall() {
  callActive = false;
  stopRecording();
  speechSynth.cancel();
  clearInterval(callTimer);
  isAriaSpeaking = false;

  const bye = "Nga mihi! Thanks for chatting. Have a great day!";
  addToLog('Aria', bye);
  const utterance = new SpeechSynthesisUtterance(bye);
  utterance.voice = ariaVoice;
  utterance.rate = 0.95;
  utterance.onend = () => hideCallUI();
  utterance.onerror = () => hideCallUI();
  speechSynth.speak(utterance);
  // Safety: hide after 4s regardless
  setTimeout(hideCallUI, 4000);
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
function updateStatus(status, text) {
  const el = document.getElementById('aria-call-status');
  if (!el) return;
  el.textContent = text || '';
  el.className = `aria-call-status ${status}`;
}

function updateTranscript(text) {
  const el = document.getElementById('aria-call-transcript');
  if (el) el.textContent = text;
}

function updateMicButton(recording) {
  const btn = document.getElementById('aria-ptt-btn');
  if (!btn) return;
  if (recording) {
    btn.classList.add('recording');
    btn.textContent = '🔴';
  } else {
    btn.classList.remove('recording');
    btn.textContent = '🎤';
  }
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
    <div id="aria-call-status" class="aria-call-status idle">🎤 Hold the button to speak</div>
    <div id="aria-call-transcript" class="aria-call-transcript"></div>
    <div id="aria-call-log" class="aria-call-log"></div>
    <div class="aria-call-controls">
      <button id="aria-ptt-btn" class="aria-ptt-btn" title="Hold to talk">🎤</button>
      <button id="aria-call-hangup" class="aria-ctrl-btn hangup" title="Hang up">📞</button>
    </div>
    <div class="aria-ptt-hint">Hold the mic button while you speak, release when done</div>
  `;
  document.body.appendChild(panel);

  document.getElementById('aria-call-end').onclick = endCall;
  document.getElementById('aria-call-hangup').onclick = endCall;

  const ptt = document.getElementById('aria-ptt-btn');
  // Mouse
  ptt.addEventListener('mousedown', (e) => { e.preventDefault(); startRecording(); });
  ptt.addEventListener('mouseup', (e) => { e.preventDefault(); stopRecording(); });
  ptt.addEventListener('mouseleave', () => { if (isRecording) stopRecording(); });
  // Touch
  ptt.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
  ptt.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });
  // Spacebar push-to-talk
  document.addEventListener('keydown', spacebarDown);
  document.addEventListener('keyup', spacebarUp);
}

function spacebarDown(e) {
  if (e.code === 'Space' && callActive && !isRecording && !e.repeat) {
    e.preventDefault();
    startRecording();
  }
}
function spacebarUp(e) {
  if (e.code === 'Space' && callActive && isRecording) {
    e.preventDefault();
    stopRecording();
  }
}

function hideCallUI() {
  document.removeEventListener('keydown', spacebarDown);
  document.removeEventListener('keyup', spacebarUp);
  const panel = document.getElementById('aria-voice-panel');
  if (panel) {
    panel.style.animation = 'aria-slide-down 0.3s ease-in forwards';
    setTimeout(() => panel.remove(), 300);
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
      position: fixed; bottom: 100px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border: none; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(34, 197, 94, 0.4);
      z-index: 9997; transition: all 0.3s;
    }
    #aria-voice-toggle:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(34, 197, 94, 0.6); }

    #aria-voice-panel {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 420px; max-width: 95vw; height: 600px; max-height: 90vh;
      background: #0f172a; border: 1px solid #334155;
      border-radius: 20px; box-shadow: 0 40px 80px rgba(0,0,0,0.7);
      z-index: 10000; display: flex; flex-direction: column;
      overflow: hidden; animation: aria-slide-up 0.3s ease-out;
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
      padding: 20px; display: flex; align-items: center; gap: 14px;
      border-bottom: 2px solid #22c55e;
    }
    .aria-call-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 900; color: white;
    }
    .aria-call-info h3 { margin: 0; color: white; font-size: 16px; font-family: 'Inter', sans-serif; }
    .aria-call-info span { color: #22c55e; font-size: 14px; font-family: monospace; }
    #aria-call-end {
      margin-left: auto; background: none; border: none;
      color: #64748b; font-size: 22px; cursor: pointer; padding: 6px;
    }
    #aria-call-end:hover { color: #ef4444; }
    .aria-call-status {
      text-align: center; padding: 12px; font-size: 14px;
      font-family: 'Inter', sans-serif; color: #94a3b8;
      border-bottom: 1px solid #1e293b;
    }
    .aria-call-status.listening { color: #22c55e; }
    .aria-call-status.thinking { color: #f59e0b; }
    .aria-call-status.speaking { color: #3b82f6; }
    .aria-call-status.error { color: #ef4444; }
    .aria-call-transcript {
      text-align: center; padding: 8px 16px; font-size: 13px;
      color: #cbd5e1; font-style: italic; min-height: 24px;
      font-family: 'Inter', sans-serif;
    }
    .aria-call-log {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .aria-call-log::-webkit-scrollbar { width: 4px; }
    .aria-call-log::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .aria-log-entry {
      padding: 10px 14px; border-radius: 12px; font-size: 13px;
      line-height: 1.5; font-family: 'Inter', sans-serif; max-width: 90%;
    }
    .aria-log-entry.aria { align-self: flex-start; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
    .aria-log-entry.you { align-self: flex-end; background: #22c55e; color: white; }
    .aria-log-entry strong { display: block; font-size: 11px; margin-bottom: 4px; opacity: 0.7; }
    .aria-call-controls {
      padding: 16px 20px 8px; display: flex; justify-content: center;
      gap: 24px; background: #0f172a; border-top: 1px solid #1e293b;
    }
    .aria-ptt-btn {
      width: 72px; height: 72px; border-radius: 50%; border: none;
      font-size: 30px; cursor: pointer;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 4px 16px rgba(34,197,94,0.4);
      transition: all 0.15s; user-select: none;
    }
    .aria-ptt-btn:hover { transform: scale(1.05); }
    .aria-ptt-btn.recording {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 0 0 8px rgba(239,68,68,0.3);
      animation: aria-pulse-rec 1s infinite;
    }
    @keyframes aria-pulse-rec {
      0%,100% { box-shadow: 0 0 0 8px rgba(239,68,68,0.3); }
      50% { box-shadow: 0 0 0 16px rgba(239,68,68,0.1); }
    }
    .aria-ctrl-btn {
      width: 56px; height: 56px; border-radius: 50%; border: none;
      font-size: 24px; cursor: pointer; background: #1e293b;
      transition: all 0.2s; align-self: center;
    }
    .aria-ctrl-btn.hangup { background: #ef4444; transform: rotate(135deg); }
    .aria-ctrl-btn.hangup:hover { background: #dc2626; }
    .aria-ptt-hint {
      text-align: center; padding: 0 16px 16px; font-size: 11px;
      color: #64748b; font-family: 'Inter', sans-serif;
    }
  `;
  document.head.appendChild(style);
}

// Init
function init() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Aria Voice: Speech Recognition not supported in this browser');
    return;
  }
  injectStyles();
  createCallButton();
  if (speechSynth.getVoices().length) {
    ariaVoice = findAriaVoice();
  } else {
    speechSynth.onvoiceschanged = () => { ariaVoice = findAriaVoice(); };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
