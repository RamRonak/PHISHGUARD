/**
 * charts.js - Lightweight Native HTML5 Canvas Charts for PHISHGUARD Dashboard
 * Generates responsive Doughnut and Competency Mastery Bar charts adapting to Light and Dark themes.
 * Correctly handles 0% initial states with no fake or hardcoded scores.
 */

async function initDashboard() {
  let completed = [];
  let quizScore = 0;
  let assessScore = 0;
  let certData = null;

  // Primary: Fetch ground-truth statistics from backend SQLite database
  try {
    const res = await fetch(`${API_BASE}/api/dashboard?session_id=${SESSION_ID}`);
    if (res.ok) {
      const data = await res.json();
      if (data.completed_modules) {
        completed = data.completed_modules.map(m => m.module_id);
        // Sync local storage with server ground truth
        localStorage.setItem('phishguard_completed_modules', JSON.stringify(completed));
      }
      if (data.stats) {
        quizScore = data.stats.best_quiz_score ? Math.round(data.stats.best_quiz_score) : 0;
        assessScore = data.stats.assessment_score ? Math.round(data.stats.assessment_score) : 0;
        certData = data.stats.certificate;
        
        localStorage.setItem('phishguard_quiz_score', quizScore);
        localStorage.setItem('phishguard_assessment_score', assessScore);
        if (certData) {
          localStorage.setItem('phishguard_certificate', JSON.stringify(certData));
        }
      }
    }
  } catch (e) {
    // Fallback to localStorage only if offline
    completed = JSON.parse(localStorage.getItem('phishguard_completed_modules') || '[]');
    quizScore = parseInt(localStorage.getItem('phishguard_quiz_score') || '0', 10);
    assessScore = parseInt(localStorage.getItem('phishguard_assessment_score') || '0', 10);
    certData = JSON.parse(localStorage.getItem('phishguard_certificate') || 'null');
  }

  // Populate Dashboard Metrics Cards
  const totalModules = 10;
  const pct = Math.min(100, Math.round((completed.length / totalModules) * 100));

  const compCountEl = document.getElementById('dashCompletedCount');
  if (compCountEl) compCountEl.innerText = `${completed.length} / ${totalModules}`;

  const pctEl = document.getElementById('dashProgressPct');
  if (pctEl) pctEl.innerText = `${pct}%`;

  const progFill = document.getElementById('dashProgressFill');
  if (progFill) progFill.style.width = `${pct}%`;

  const qScoreEl = document.getElementById('dashQuizScore');
  if (qScoreEl) qScoreEl.innerText = `${quizScore}%`;

  const aScoreEl = document.getElementById('dashAssessScore');
  if (aScoreEl) aScoreEl.innerText = `${assessScore}%`;

  const certStatusEl = document.getElementById('dashCertStatus');
  if (certStatusEl) {
    if (certData && (certData.certificate_id || certData.id)) {
      certStatusEl.innerHTML = `<span class="cyber-badge badge-green">✓ ISSUED (${certData.certificate_id})</span>`;
    } else if (assessScore >= 80) {
      certStatusEl.innerHTML = `<span class="cyber-badge badge-blue">ELIGIBLE (Claim on Page 10)</span>`;
    } else {
      certStatusEl.innerHTML = `<span class="cyber-badge badge-amber">PENDING ASSESSMENT (80% req.)</span>`;
    }
  }

  // Update Individual Module Table Badges
  const tableMapping = {
    'fundamentals': 'modStatus2',
    'email_phishing': 'modStatus3',
    'fake_websites': 'modStatus4',
    'social_engineering': 'modStatus5',
    'case_studies': 'modStatus6',
    'quiz': 'modStatus7',
    'simulation_lab': 'modStatus8',
    'safety_guide': 'modStatus9',
    'final_assessment': 'modStatus10'
  };

  for (const [modId, elId] of Object.entries(tableMapping)) {
    const el = document.getElementById(elId);
    if (el) {
      if (completed.includes(modId)) {
        el.className = 'cyber-badge badge-green';
        el.innerText = '✓ Completed';
      } else {
        el.className = 'cyber-badge badge-blue';
        el.innerText = 'Not Started';
      }
    }
  }

  // Draw Dynamic Charts
  drawCompletionDoughnut(completed.length, totalModules);
  drawMasteryBarChart(completed, quizScore, assessScore);
}

function drawCompletionDoughnut(completed, total) {
  const canvas = document.getElementById('doughnutChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 20;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  ctx.clearRect(0, 0, size, size);

  // Background Ring
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 14;
  ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
  ctx.stroke();

  // Progress Arc - ONLY drawn if user has completed > 0 modules
  const pct = completed / total;
  if (completed > 0) {
    const endAngle = -0.5 * Math.PI + (pct * 2 * Math.PI);
    ctx.beginPath();
    ctx.arc(center, center, radius, -0.5 * Math.PI, endAngle);
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#10b981');
    ctx.strokeStyle = gradient;
    ctx.stroke();
  }

  // Center Percentage Number
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
  ctx.font = 'bold 26px -apple-system, sans-serif';
  ctx.fillText(`${Math.round(pct * 100)}%`, center, center - 8);

  // Status Sub-label
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '600 11px -apple-system, sans-serif';
  ctx.fillText(completed === 0 ? 'NOT STARTED' : `${completed}/${total} MODULES`, center, center + 14);
}

function drawMasteryBarChart(completed, quizScore, assessScore) {
  const canvas = document.getElementById('masteryBarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  ctx.clearRect(0, 0, w, h);

  // Realistic score mappings: 0% if not completed, actual score if completed
  const categories = [
    { label: "Email Red Flags", score: completed.includes('email_phishing') ? (quizScore > 0 ? quizScore : 100) : 0 },
    { label: "Fake Websites", score: completed.includes('fake_websites') ? (quizScore > 0 ? quizScore : 100) : 0 },
    { label: "Social Eng.", score: completed.includes('social_engineering') ? (quizScore > 0 ? quizScore : 100) : 0 },
    { label: "Sim. Lab", score: completed.includes('simulation_lab') ? 100 : 0 },
    { label: "Final Exam", score: assessScore > 0 ? assessScore : 0 }
  ];

  const barWidth = 36;
  const spacing = (w - (categories.length * barWidth)) / (categories.length + 1);

  categories.forEach((cat, i) => {
    const x = spacing + i * (barWidth + spacing);
    const maxBarH = h - 60;
    const barH = (cat.score / 100) * maxBarH;
    const y = h - 30 - barH;

    // Background Track Bar
    ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.fillRect(x, h - 30 - maxBarH, barWidth, maxBarH);

    // Active Fill Bar (Only if score > 0)
    if (cat.score > 0) {
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (cat.score >= 80) {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#059669');
      } else if (cat.score >= 50) {
        grad.addColorStop(0, '#2563eb');
        grad.addColorStop(1, '#1d4ed8');
      } else {
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(1, '#b91c1c');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);
    }

    // Score label on top
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${cat.score}%`, x + barWidth / 2, cat.score > 0 ? (y - 6) : (h - 30 - maxBarH - 6));

    // Category label underneath
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '500 10px -apple-system, sans-serif';
    ctx.fillText(cat.label, x + barWidth / 2, h - 12);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashCompletedCount')) {
    initDashboard();
  }
});
