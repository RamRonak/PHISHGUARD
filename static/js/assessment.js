/**
 * assessment.js - Final Capstone Assessment & Verifiable Certificate Generator
 * Enforces 80% passing threshold for verifiable certificate generation.
 * Full scenario-based 10-question final exam with detailed question-by-question review.
 */

const assessmentQuestions = [
  {
    scenario: "Scenario 1: Payroll Redirection",
    question: "You receive an email from your company HR director asking you to click an external link and re-enter your banking direct deposit details within 3 hours to avoid missing Friday's paycheck. What is your safest course of action?",
    options: [
      "Click the link immediately to ensure your paycheck is not delayed.",
      "Reply to the email with your routing and account number directly to be helpful.",
      "Do not click the link; contact HR independently via phone or corporate chat to verify.",
      "Forward the email to your personal Gmail account and click it there."
    ],
    answer: 2,
    explanation: "Any sudden demand for direct deposit banking updates accompanied by an aggressive deadline is a high-risk Business Email Compromise (BEC) red flag. Always verify out-of-band via an established HR contact channel."
  },
  {
    scenario: "Scenario 2: Deceptive Domain Analysis",
    question: "Examine the following destination URL: 'https://security.chase.com.account-update-portal.org/login'. Who is the actual owner of this website?",
    options: [
      "Chase Bank (chase.com)",
      "account-update-portal.org",
      "security.chase.com",
      "Both Chase and the portal organization jointly"
    ],
    answer: 1,
    explanation: "The domain owner is determined strictly by the Second-Level Domain and Top-Level Domain preceding the first forward slash. In this case, that is 'account-update-portal.org'. 'security.chase.com' is merely a misleading subdomain prefix."
  },
  {
    scenario: "Scenario 3: Delivery Alert Smishing",
    question: "You receive a text message: 'USPS: Your package has a damaged barcode. Pay $1.85 re-delivery fee at usps-ship-fix.online within 24h.' Why is this suspicious?",
    options: [
      "USPS never ships packages with barcodes.",
      "The fee is too cheap to be a legitimate government service.",
      "USPS uses official domains (usps.com), does not use lookalike domains, and does not charge small fees via unsolicited texts.",
      "Text messages cannot be sent by postal couriers."
    ],
    answer: 2,
    explanation: "Attackers use low-dollar amounts ($1-$2) to lower victims' guard. The fake domain 'usps-ship-fix.online' is designed to harvest credit card numbers, CVVs, and mobile numbers."
  },
  {
    scenario: "Scenario 4: Adversary-in-the-Middle (AitM)",
    question: "An employee logs into what looks like their Microsoft 365 portal, enters their password, and successfully approves their Authenticator push notification. Later that evening, an unauthorized login occurs without triggering another MFA prompt. What occurred?",
    options: [
      "The attacker guessed the user's password using brute force.",
      "An Adversary-in-the-Middle reverse proxy captured the user's authenticated session cookie during legitimate MFA completion.",
      "The user's smartphone was infected with physical radiation.",
      "The Microsoft server had a hardware failure."
    ],
    answer: 1,
    explanation: "AitM reverse proxies (like Evilginx) intercept the post-authentication session cookie. Once an attacker possesses the valid session token, they can impersonate the user without needing the password or 2FA again."
  },
  {
    scenario: "Scenario 5: Vishing & Pretexting",
    question: "A caller claiming to be an internal IT technician calls your desk phone saying they detected malware on your workstation and need your two-factor SMS passcode to clean it. What should you do?",
    options: [
      "Read them the code quickly so your computer stays secure.",
      "Refuse to provide the code; legitimate IT staff will never ask for your private MFA codes or passwords.",
      "Ask them to call back in 10 minutes when you are less busy.",
      "Give them a fake code to see what they do."
    ],
    answer: 1,
    explanation: "Golden rule of identity security: Legitimate administrators, technicians, and banking representatives will NEVER ask you to disclose a two-factor passcode or password."
  },
  {
    scenario: "Scenario 6: Macro-Enabled Document",
    question: "You download an emailed vendor invoice 'Invoice_Nov26.docm'. When opened, Word displays a yellow banner: 'Macros have been disabled. Click Enable Content to view invoice.' What should you do?",
    options: [
      "Click 'Enable Content' so the invoice numbers calculate properly.",
      "Do NOT enable content; close the file and verify the invoice with the vendor via phone.",
      "Convert the file to a plain text file using notepad.",
      "Email the file to a friend to see if it opens for them."
    ],
    answer: 1,
    explanation: "VBA macros in Office documents can execute arbitrary malicious code, download ransomware, or install keyloggers. Standard invoices do not require macros to be viewed."
  },
  {
    scenario: "Scenario 7: QR Code Security (Quishing)",
    question: "A flyer posted in the company elevator claims to be an employee satisfaction survey with a QR code offering a free coffee voucher. What security risk does this present?",
    options: [
      "QR codes can overheat your phone's camera.",
      "The QR code could direct users to a credential-harvesting phishing site or malicious APK download.",
      "Elevator magnetic fields interfere with QR reading.",
      "Surveys are legally prohibited in elevators."
    ],
    answer: 1,
    explanation: "Quishing exploits the opacity of QR codes. Users cannot preview the full URL before pointing their camera, making it an increasingly popular vector for physical and digital attacks."
  },
  {
    scenario: "Scenario 8: Password Manager Defense",
    question: "Why does using a reputable browser password manager protect you against lookalike domain phishing (such as 'paypa1.com')?",
    options: [
      "The password manager contacts law enforcement automatically.",
      "The password manager evaluates the strict domain origin and will refuse to auto-fill credentials on lookalike domains.",
      "The password manager encrypts your monitor screen.",
      "Password managers only work on verified government portals."
    ],
    answer: 1,
    explanation: "Password managers evaluate the exact cryptographic domain URI. Even if a human cannot spot the difference between 'paypa1.com' and 'paypal.com', the password manager will never auto-fill."
  },
  {
    scenario: "Scenario 9: The HTTPS Padlock",
    question: "A shopping website displays 'https://' with a valid lock icon. Does this confirm the store is a legitimate, certified business that will not steal your money?",
    options: [
      "Yes, HTTPS certificates are only issued to audited, registered corporations.",
      "No, HTTPS only means the connection is encrypted; malicious sites can easily obtain free SSL certificates.",
      "Yes, the padlock is guaranteed by the Federal Trade Commission.",
      "No, because HTTPS is an outdated technology replaced by HTTP3."
    ],
    answer: 1,
    explanation: "Encryption ensures that third parties on the same Wi-Fi cannot eavesdrop on your data in transit. However, it does not guarantee that the recipient operating the server is trustworthy."
  },
  {
    scenario: "Scenario 10: Post-Click Response Protocol",
    question: "You realize you accidentally submitted your enterprise password on a suspicious external site 60 seconds ago. What is the correct priority order of response?",
    options: [
      "1. Disconnect network/Wi-Fi -> 2. Notify IT Security/SOC -> 3. Change password from a safe device.",
      "1. Delete your browser cookies -> 2. Turn off the computer -> 3. Wait until tomorrow.",
      "1. Email all colleagues -> 2. Call local police -> 3. Install new antivirus.",
      "1. Do nothing unless unauthorized transactions appear on your account."
    ],
    answer: 0,
    explanation: "Disconnecting prevents active sessions or malware lateral movement, notifying IT Security allows session revocation and monitoring, and resetting credentials from a known clean device stops unauthorized access."
  }
];

let assessCurrentIdx = 0;
let assessScore = 0;
let assessAnswers = [];
let assessAnswered = false;

function initAssessment() {
  assessCurrentIdx = 0;
  assessScore = 0;
  assessAnswers = [];
  assessAnswered = false;

  document.getElementById('assessIntroBox').style.display = 'block';
  document.getElementById('assessExamBox').style.display = 'none';
  document.getElementById('assessResultsBox').style.display = 'none';
  document.getElementById('printableCertificate').style.display = 'none';
}

function startAssessment() {
  document.getElementById('assessIntroBox').style.display = 'none';
  document.getElementById('assessExamBox').style.display = 'block';
  renderAssessmentQuestion();
}

function renderAssessmentQuestion() {
  assessAnswered = false;
  const q = assessmentQuestions[assessCurrentIdx];

  document.getElementById('assessProgressText').innerText = `Question ${assessCurrentIdx + 1} of ${assessmentQuestions.length}`;
  document.getElementById('assessScenarioTag').innerText = q.scenario;
  document.getElementById('assessQuestionText').innerText = q.question;

  const progPct = Math.round(((assessCurrentIdx) / assessmentQuestions.length) * 100);
  document.getElementById('assessProgressBar').style.width = progPct + '%';

  const container = document.getElementById('assessOptionsContainer');
  const letters = ['A', 'B', 'C', 'D'];
  container.innerHTML = q.options.map((opt, i) => `
    <button class="quiz-option-card" onclick="selectAssessmentAnswer(${i}, this)">
      <span class="quiz-option-letter">${letters[i]}</span>
      <span style="font-size: 0.95rem; font-weight: 500;">${opt}</span>
    </button>
  `).join('');

  document.getElementById('assessFeedbackBox').style.display = 'none';
  document.getElementById('assessNextBtn').style.display = 'none';
}

function selectAssessmentAnswer(idx, btnEl) {
  if (assessAnswered) return;
  assessAnswered = true;

  const q = assessmentQuestions[assessCurrentIdx];
  const isCorrect = (idx === q.answer);
  assessAnswers.push({
    question: q.question,
    scenario: q.scenario,
    selected: q.options[idx],
    correctOption: q.options[q.answer],
    isCorrect: isCorrect,
    explanation: q.explanation
  });

  const allBtns = document.querySelectorAll('#assessOptionsContainer .quiz-option-card');
  allBtns.forEach(btn => btn.disabled = true);

  const fbBox = document.getElementById('assessFeedbackBox');

  if (isCorrect) {
    assessScore++;
    playCyberTone('success');
    btnEl.classList.add('correct');
    fbBox.style.display = 'block';
    fbBox.style.background = 'rgba(16, 185, 129, 0.15)';
    fbBox.style.border = '1px solid #10b981';
    fbBox.style.color = '#a7f3d0';
    fbBox.innerHTML = `<strong>✅ Correct:</strong> ${q.explanation}`;
  } else {
    playCyberTone('alert');
    btnEl.classList.add('incorrect');
    allBtns[q.answer].classList.add('correct');
    fbBox.style.display = 'block';
    fbBox.style.background = 'rgba(239, 68, 68, 0.15)';
    fbBox.style.border = '1px solid #ef4444';
    fbBox.style.color = '#fca5a5';
    fbBox.innerHTML = `<strong>❌ Incorrect:</strong> ${q.explanation}`;
  }

  const nextBtn = document.getElementById('assessNextBtn');
  nextBtn.style.display = 'inline-block';
  if (assessCurrentIdx === assessmentQuestions.length - 1) {
    nextBtn.innerText = 'Calculate Final Score & Certification Status →';
  } else {
    nextBtn.innerText = 'Next Question →';
  }
}

function handleNextAssessmentQuestion() {
  if (assessCurrentIdx < assessmentQuestions.length - 1) {
    assessCurrentIdx++;
    renderAssessmentQuestion();
  } else {
    finishAssessment();
  }
}

async function finishAssessment() {
  document.getElementById('assessExamBox').style.display = 'none';
  const resBox = document.getElementById('assessResultsBox');
  resBox.style.display = 'block';

  const pct = Math.round((assessScore / assessmentQuestions.length) * 100);
  const passed = pct >= 80;

  document.getElementById('assessFinalPct').innerText = `${pct}%`;
  document.getElementById('assessScoreDetail').innerText = `${assessScore} / ${assessmentQuestions.length} Correct Responses`;

  const statusBadge = document.getElementById('assessStatusBadge');
  const actionContainer = document.getElementById('assessCertActionArea');

  if (passed) {
    playCyberTone('success');
    statusBadge.innerText = "PASSED - CERTIFICATION ELIGIBLE";
    statusBadge.className = "cyber-badge badge-green";
    actionContainer.style.display = 'block';
    markModuleCompleted('final_assessment');
  } else {
    playCyberTone('alert');
    statusBadge.innerText = "NOT PASSED - MINIMUM 80% REQUIRED";
    statusBadge.className = "cyber-badge badge-red";
    actionContainer.style.display = 'none';
  }

  // Render question-by-question review
  const reviewContainer = document.getElementById('assessReviewContainer');
  reviewContainer.innerHTML = assessAnswers.map((item, idx) => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; border-left: 4px solid ${item.isCorrect ? '#10b981' : '#ef4444'};">
      <div style="font-size: 0.8rem; font-weight: 700; color: ${item.isCorrect ? '#10b981' : '#ef4444'}; text-transform: uppercase;">
        ${item.isCorrect ? '✓ Correct' : '✕ Incorrect'} • ${item.scenario}
      </div>
      <div style="font-size: 0.95rem; font-weight: 600; color: #fff; margin: 0.25rem 0;">${item.question}</div>
      <div style="font-size: 0.85rem; color: #cbd5e1;">Your Choice: <em>${item.selected}</em></div>
      ${!item.isCorrect ? `<div style="font-size: 0.85rem; color: #34d399;">Correct Answer: <strong>${item.correctOption}</strong></div>` : ''}
      <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.35rem;">Rationale: ${item.explanation}</div>
    </div>
  `).join('');

  // Submit assessment score to backend
  try {
    await fetch(`${API_BASE}/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
      },
      body: JSON.stringify({
        session_id: SESSION_ID,
        quiz_type: 'final_assessment',
        score: assessScore,
        total_questions: assessmentQuestions.length
      })
    });
  } catch (err) {
    console.warn('API sync unavailable.');
  }

  localStorage.setItem('phishguard_assessment_score', pct);
  resBox.scrollIntoView({ behavior: 'smooth' });
}

// Generate the printable educational certificate
async function generateCertificate() {
  const nameInput = document.getElementById('certLearnerNameInput');
  const recipientName = (nameInput.value.trim()) || "Cybersecurity Defender";
  const pct = Math.round((assessScore / assessmentQuestions.length) * 100);

  if (pct < 80) {
    alert("A minimum score of 80% is required to generate a certificate.");
    return;
  }

  // Generate verifiable certificate ID
  let certId = `PG-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Call API to persist certificate in SQLite
  try {
    const res = await fetch(`${API_BASE}/api/certificate/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
      },
      body: JSON.stringify({
        session_id: SESSION_ID,
        recipient_name: recipientName,
        score_percentage: pct
      })
    });
    const data = await res.json();
    if (data.certificate) {
      certId = data.certificate.certificate_id;
    }
  } catch (e) {
    console.warn("Generating certificate in offline mode:", e);
  }

  // Populate Certificate View
  document.getElementById('certDisplayName').innerText = recipientName;
  document.getElementById('certDisplayScore').innerText = `${pct}%`;
  document.getElementById('certDisplayId').innerText = certId;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('certDisplayDate').innerText = dateStr;

  const certContainer = document.getElementById('printableCertificate');
  certContainer.style.display = 'block';
  certContainer.scrollIntoView({ behavior: 'smooth' });

  // Store in localStorage for dashboard display
  localStorage.setItem('phishguard_certificate', JSON.stringify({
    certificate_id: certId,
    recipient_name: recipientName,
    score_percentage: pct,
    issued_at: dateStr
  }));

  playCyberTone('success');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('assessIntroBox')) {
    initAssessment();
  }
});

