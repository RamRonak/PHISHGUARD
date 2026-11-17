/**
 * app.js - Core State Management & Navigation Helper for PHISHGUARD
 * Manages user sessions, tracks module completions via REST API and localStorage,
 * updates global indicators, and controls the Light/Dark theme engine.
 */

// --- THEME MANAGEMENT ENGINE ---
function getStoredTheme() {
  return localStorage.getItem('phishguard_theme') || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (document.body) {
    document.body.setAttribute('data-theme', theme);
  }
  localStorage.setItem('phishguard_theme', theme);

  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    if (theme === 'dark') {
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> <span>Light</span>`;
    } else {
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> <span>Dark</span>`;
    }
  }

  // If dashboard charts are active, re-render them with appropriate colors
  if (typeof initDashboard === 'function' && document.getElementById('dashCompletedCount')) {
    initDashboard();
  }
}

function togglePhishGuardTheme() {
  const current = getStoredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Immediate theme execution to prevent flash
(function() {
  const t = getStoredTheme();
  document.documentElement.setAttribute('data-theme', t);
})();

// --- PERSISTENT USER SESSION ---
function getSessionId() {
  let sid = localStorage.getItem('phishguard_session_id');
  if (!sid) {
    sid = 'pg_user_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('phishguard_session_id', sid);
  }
  return sid;
}

const API_BASE = window.location.origin;
const SESSION_ID = getSessionId();

// --- MODULE PROGRESSION ---
async function markModuleCompleted(moduleId) {
  let completed = JSON.parse(localStorage.getItem('phishguard_completed_modules') || '[]');
  if (!completed.includes(moduleId)) {
    completed.push(moduleId);
    localStorage.setItem('phishguard_completed_modules', JSON.stringify(completed));
  }

  try {
    const res = await fetch(`${API_BASE}/api/progress/module`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
      },
      body: JSON.stringify({
        session_id: SESSION_ID,
        module_id: moduleId
      })
    });
    if (res.ok) {
      console.log(`[PHISHGUARD] Module ${moduleId} synced to SQLite.`);
    }
  } catch (err) {
    console.warn('[PHISHGUARD] Offline or standalone mode. Progress stored in localStorage.');
  }

  updateNavbarProgress();
}

function updateNavbarProgress() {
  const completed = JSON.parse(localStorage.getItem('phishguard_completed_modules') || '[]');
  const total = 10;
  const pct = Math.min(100, Math.round((completed.length / total) * 100));
  
  const progFill = document.getElementById('navProgressFill');
  const progText = document.getElementById('navProgressText');
  if (progFill) progFill.style.width = pct + '%';
  if (progText) progText.innerText = `${pct}% Complete (${completed.length}/${total})`;
}

async function resetAllProgress() {
  if (!confirm("Are you sure you want to reset all your training progress and scores?")) {
    return;
  }
  
  localStorage.removeItem('phishguard_completed_modules');
  localStorage.removeItem('phishguard_quiz_score');
  localStorage.removeItem('phishguard_assessment_score');
  localStorage.removeItem('phishguard_certificate');
  
  try {
    await fetch(`${API_BASE}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: SESSION_ID })
    });
  } catch (e) {
    console.warn("Backend reset skipped:", e);
  }
  
  window.location.reload();
}

// Audio synthesis via Web Audio API
function playCyberTone(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio context suppressed
  }
}

async function syncProgressWithServer() {
  try {
    const res = await fetch(`${API_BASE}/api/progress?session_id=${SESSION_ID}`);
    if (res.ok) {
      const data = await res.json();
      if (data.completed_modules) {
        const modIds = data.completed_modules.map(m => m.module_id);
        localStorage.setItem('phishguard_completed_modules', JSON.stringify(modIds));
        updateNavbarProgress();
      }
    }
  } catch (e) {
    // Offline or standalone mode
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply current theme to DOM elements
  applyTheme(getStoredTheme());
  syncProgressWithServer();

  // Adapt file:// protocol links if running directly from filesystem
  if (window.location.protocol === 'file:') {
    const routeMap = {
      '/': 'index.html',
      '/fundamentals': 'fundamentals.html',
      '/emails': 'email_phishing.html',
      '/fake-websites': 'fake_websites.html',
      '/social-engineering': 'social_engineering.html',
      '/case-studies': 'case_studies.html',
      '/quiz': 'quiz.html',
      '/simulation-lab': 'simulation_lab.html',
      '/safety-guide': 'safety_guide.html',
      '/final-assessment': 'final_assessment.html',
      '/dashboard': 'dashboard.html'
    };
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && routeMap[href]) {
        a.setAttribute('href', routeMap[href]);
      }
    });
  }

  updateNavbarProgress();
  
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-item-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (currentPath === '/' && href === '/'))) {
      link.classList.add('active');
    }
  });
});
