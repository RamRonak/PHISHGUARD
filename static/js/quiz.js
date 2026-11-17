/**
 * quiz.js - Interactive 15-Question Phishing Awareness Quiz Engine
 * Features:
 * - 15 Comprehensive Questions (Beginner, Intermediate, Advanced)
 * - Immediate tactical feedback & detailed explanation after every choice
 * - Real-time score calculation and progress indicator
 * - Final diagnostic breakdown and performance grading
 * - Syncs attempt to SQLite DB & localStorage
 */

const quizData = [
  // BEGINNER QUESTIONS (1 - 5)
  {
    level: "Beginner",
    question: "1. What is the primary purpose of a standard phishing email?",
    options: [
      "To test your internet connection speed.",
      "To trick you into revealing sensitive credentials, installing malware, or sending money.",
      "To automatically optimize your operating system updates.",
      "To subscribe you to legitimate promotional newsletters."
    ],
    answer: 1,
    explanation: "Phishing is social engineering delivered digitally, aimed at deceiving individuals into surrendering confidential passwords, downloading malicious payloads, or transferring unauthorized funds."
  },
  {
    level: "Beginner",
    question: "2. You receive an email claiming to be from your university or employer IT team from 'support-desk@gmail.com'. What should you immediately notice?",
    options: [
      "The message uses a friendly tone.",
      "The email was sent during regular business hours.",
      "The sender domain is @gmail.com rather than the organization's official domain name.",
      "The email does not have a high-resolution logo."
    ],
    answer: 2,
    explanation: "Legitimate institutional IT departments never send official account administration warnings from free public webmail addresses like Gmail, Yahoo, or Outlook.com."
  },
  {
    level: "Beginner",
    question: "3. When an unexpected email contains a hyperlink, what is the safest immediate action before clicking?",
    options: [
      "Click the link immediately to see if the page looks genuine.",
      "Hover your mouse cursor over the link to preview the actual destination URL.",
      "Forward the link to all your coworkers to ask if they received it.",
      "Copy the link and paste it into a social media post."
    ],
    answer: 1,
    explanation: "Hovering over a link (or long-pressing on mobile) reveals the true destination URL in your browser status bar, allowing you to verify the actual domain before connecting."
  },
  {
    level: "Beginner",
    question: "4. What does the green padlock icon (HTTPS) in the browser address bar actually mean?",
    options: [
      "The website has been certified completely safe and trustworthy by law enforcement.",
      "The communication between your browser and the website is encrypted.",
      "The company operating the site is a verified legitimate business.",
      "The website is physically impossible for cybercriminals to operate."
    ],
    answer: 1,
    explanation: "The padlock only signifies transport-layer encryption (SSL/TLS). Anyone, including cybercriminals, can obtain a free SSL certificate. Over 80% of active phishing sites now display a valid HTTPS padlock!"
  },
  {
    level: "Beginner",
    question: "5. What is 'Smishing'?",
    options: [
      "Phishing attacks conducted through SMS text messages.",
      "Stealing hard drives from unattended servers.",
      "Sending physical letters with malicious thumb drives.",
      "Intercepting Wi-Fi signals in coffee shops."
    ],
    answer: 0,
    explanation: "Smishing (SMS + Phishing) uses urgent text messages—such as fake delivery alerts, toll notices, or bank fraud warnings—to trick victims into clicking deceptive mobile links."
  },

  // INTERMEDIATE QUESTIONS (6 - 10)
  {
    level: "Intermediate",
    question: "6. In the URL 'https://login.microsoft.com.account-verify-portal.net/auth', what is the actual destination domain?",
    options: [
      "microsoft.com",
      "login.microsoft.com",
      "account-verify-portal.net",
      "auth.net"
    ],
    answer: 2,
    explanation: "Web browsers resolve domains from right to left. The true registered domain is 'account-verify-portal.net' (immediately before the first single forward slash '/'). The 'login.microsoft.com' part is merely a deceitful subdomain prefix."
  },
  {
    level: "Intermediate",
    question: "7. Why do attackers frequently inject extreme urgency into phishing messages (e.g. 'Account suspended in 60 minutes!')?",
    options: [
      "Email servers reject messages that do not specify a time limit.",
      "Urgency short-circuits critical rational thinking and provokes an impulsive panic reaction.",
      "It allows the email to bypass spam filters more easily.",
      "It speeds up internet packet routing."
    ],
    answer: 1,
    explanation: "Artificial urgency induces cognitive overload and anxiety, driving victims to act quickly before checking sender headers or consulting IT security."
  },
  {
    level: "Intermediate",
    question: "8. An executive receives an email from someone claiming to be their CEO, directing an urgent confidential wire transfer to an unknown overseas vendor. What attack type is this?",
    options: [
      "Adware spam",
      "Whaling / Business Email Compromise (BEC)",
      "Distributed Denial of Service (DDoS)",
      "Cross-Site Scripting (XSS)"
    ],
    answer: 1,
    explanation: "Whaling and Business Email Compromise (BEC) target executives or finance personnel, impersonating high-level leadership to authorize fraudulent financial transactions or sensitive data releases."
  },
  {
    level: "Intermediate",
    question: "9. Why are password-protected ZIP or 7-Zip files frequently used by attackers to deliver malware?",
    options: [
      "Zip files run much faster on the victim's CPU.",
      "The encryption prevents automated email gateway scanners and antivirus from inspecting the contents.",
      "Zip archives cannot be logged by network firewalls.",
      "Windows requires all email attachments to be compressed."
    ],
    answer: 1,
    explanation: "Automated antivirus filters cannot decrypt and inspect password-protected archives without the password. Attackers provide the password in the email body so the human victim opens the uninspected payload."
  },
  {
    level: "Intermediate",
    question: "10. What is an IDN Homoglyph (or Homograph) attack?",
    options: [
      "Overloading a web server with repetitive HTTP requests.",
      "Registering domain names using visually identical foreign or Cyrillic characters to spoof trusted brands.",
      "Stealing session cookies using cross-site scripts.",
      "Using stolen passwords to access multiple unrelated online accounts."
    ],
    answer: 1,
    explanation: "Homoglyph attacks exploit lookalike characters from international alphabets (such as Cyrillic 'а' U+0430 for Latin 'a' U+0061). To human eyes 'apple.com' appears identical, but the browser navigates to a completely distinct Punycode domain."
  },

  // ADVANCED QUESTIONS (11 - 15)
  {
    level: "Advanced",
    question: "11. How do modern 'Adversary-in-the-Middle' (AitM) phishing toolkits (e.g., Evilginx) successfully bypass standard Multi-Factor Authentication (MFA)?",
    options: [
      "They guess the victim's 6-digit OTP code using supercomputers.",
      "They proxy live requests to the authentic login server and intercept the authenticated session cookie once MFA succeeds.",
      "They disable multi-factor authentication inside the victim's phone hardware.",
      "They decrypt RSA tokens using quantum algorithms."
    ],
    answer: 1,
    explanation: "AitM reverse proxies sit between the user and the real authentication server. The user completes legitimate MFA, but the proxy captures the resulting session cookie, allowing the attacker to hijack the session without ever needing the MFA code again."
  },
  {
    level: "Advanced",
    question: "12. What technology provides the strongest, phishing-resistant defense against Adversary-in-the-Middle (AitM) reverse proxy phishing?",
    options: [
      "SMS one-time text message passcodes (OTP).",
      "Email verification codes.",
      "FIDO2 / WebAuthn hardware security keys (e.g. YubiKeys) or Passkeys.",
      "Security questions regarding childhood pets."
    ],
    answer: 2,
    explanation: "FIDO2 / WebAuthn cryptographic passkeys cryptographically bind the credential to the exact registered domain name in the browser address bar. If you are on an attacker's proxy domain, the hardware key will not sign the challenge."
  },
  {
    level: "Advanced",
    question: "13. What is 'Quishing' and why has it become an emerging cybersecurity hazard?",
    options: [
      "Phishing via voice synthesizers.",
      "Using malicious QR codes in emails or physical spaces to bypass text-based email security scanners.",
      "Intercepting satellite transmissions.",
      "Phishing conducted exclusively on quantum computers."
    ],
    answer: 1,
    explanation: "Quishing embeds malicious URLs inside QR codes. Because standard email security filters scan ASCII/UTF text rather than decoding embedded images, the phishing link slips past automated corporate gateways."
  },
  {
    level: "Advanced",
    question: "14. What does 'Out-of-Band (OOB) Verification' mandate when you receive an unusual request to change payment banking details?",
    options: [
      "Reply directly to the email asking the sender to confirm.",
      "Contact the requester using an independently verified, pre-existing communication channel (such as a known phone number).",
      "Wait 7 days before processing the payment.",
      "Forward the email to external law enforcement before responding."
    ],
    answer: 1,
    explanation: "Out-of-band verification means validating the request through a completely separate, trusted medium. Never verify a transaction using contact numbers or email reply addresses supplied in the suspicious message itself."
  },
  {
    level: "Advanced",
    question: "15. If an employee realizes they mistakenly entered their corporate login credentials into a fraudulent website 2 minutes ago, what is the best immediate response?",
    options: [
      "Keep quiet to avoid getting in trouble with management.",
      "Immediately disconnect network/Wi-Fi and report the incident to IT Security / SOC.",
      "Shut down the monitor and hope the browser forgets the input.",
      "Send an email to the whole company warning them not to open it."
    ],
    answer: 1,
    explanation: "Immediate reporting enables IT Security to instantly revoke active session tokens, invalidate stolen passwords, and block malicious IPs before attackers can establish persistence. A rapid response often completely neutralizes the threat."
  }
];

let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let hasAnswered = false;

function initQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  hasAnswered = false;
  
  document.getElementById('quizActiveArea').style.display = 'block';
  document.getElementById('quizResultsArea').style.display = 'none';
  
  renderQuestion();
}

function renderQuestion() {
  hasAnswered = false;
  const q = quizData[currentQuestion];
  
  // Progress tracker
  document.getElementById('quizProgressText').innerText = `Question ${currentQuestion + 1} of ${quizData.length}`;
  document.getElementById('quizScoreText').innerText = `Score: ${score}`;
  
  const progPct = Math.round(((currentQuestion) / quizData.length) * 100);
  document.getElementById('quizProgressBar').style.width = progPct + '%';
  
  // Difficulty Tag
  const badgeEl = document.getElementById('quizLevelBadge');
  badgeEl.innerText = q.level;
  badgeEl.className = 'cyber-badge ' + (
    q.level === 'Beginner' ? 'badge-green' :
    q.level === 'Intermediate' ? 'badge-amber' : 'badge-red'
  );

  // Question Text
  document.getElementById('quizQuestionText').innerText = q.question;

  // Render 4 Options
  const container = document.getElementById('quizOptionsContainer');
  const letters = ['A', 'B', 'C', 'D'];
  container.innerHTML = q.options.map((opt, idx) => `
    <button class="quiz-option-card" onclick="selectAnswer(${idx}, this)">
      <span class="quiz-option-letter">${letters[idx]}</span>
      <span style="font-size: 0.95rem; font-weight: 500;">${opt}</span>
    </button>
  `).join('');

  // Hide explanation and Next button
  const expBox = document.getElementById('quizExplanationBox');
  expBox.style.display = 'none';
  expBox.className = 'quiz-explanation-box';
  
  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.style.display = 'none';
}

function selectAnswer(choiceIdx, btnEl) {
  if (hasAnswered) return;
  hasAnswered = true;

  const q = quizData[currentQuestion];
  const isCorrect = (choiceIdx === q.answer);
  userAnswers.push({ questionIdx: currentQuestion, choice: choiceIdx, isCorrect: isCorrect });

  // Disable all options
  const allBtns = document.querySelectorAll('.quiz-option-card');
  allBtns.forEach(btn => btn.disabled = true);

  const expBox = document.getElementById('quizExplanationBox');

  if (isCorrect) {
    score++;
    playCyberTone('success');
    btnEl.classList.add('correct');
    expBox.style.display = 'block';
    expBox.style.background = 'rgba(16, 185, 129, 0.15)';
    expBox.style.border = '1px solid #10b981';
    expBox.style.color = '#a7f3d0';
    expBox.innerHTML = `<strong>Correct.</strong> ${q.explanation}`;
  } else {
    playCyberTone('alert');
    btnEl.classList.add('incorrect');
    allBtns[q.answer].classList.add('correct');
    expBox.style.display = 'block';
    expBox.style.background = 'rgba(239, 68, 68, 0.15)';
    expBox.style.border = '1px solid #ef4444';
    expBox.style.color = '#fca5a5';
    expBox.innerHTML = `<strong>Incorrect.</strong> ${q.explanation}`;
  }

  document.getElementById('quizScoreText').innerText = `Score: ${score}`;
  
  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.style.display = 'inline-block';
  if (currentQuestion === quizData.length - 1) {
    nextBtn.innerText = 'View Complete Diagnostic Results →';
  } else {
    nextBtn.innerText = 'Next Question →';
  }
}

function handleNextQuestion() {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

async function finishQuiz() {
  document.getElementById('quizActiveArea').style.display = 'none';
  const resArea = document.getElementById('quizResultsArea');
  resArea.style.display = 'block';

  const pct = Math.round((score / quizData.length) * 100);
  document.getElementById('finalScorePct').innerText = `${pct}%`;
  document.getElementById('finalScoreFraction').innerText = `${score} out of ${quizData.length} questions correct`;

  // Grade & Assessment
  let gradeText = "";
  let gradeBadge = "";
  if (pct >= 85) {
    gradeText = "Excellent Performance. You demonstrated thorough, mature defensive awareness across all phishing vectors.";
    gradeBadge = "badge-green";
  } else if (pct >= 70) {
    gradeText = "Good Awareness. You recognized the majority of common threats, but review advanced concepts such as reverse proxy techniques and lookalike domains.";
    gradeBadge = "badge-cyan";
  } else {
    gradeText = "Needs Improvement. Review the core modules, especially domain structure analysis and sender verification, and retake the quiz.";
    gradeBadge = "badge-red";
  }

  const badgeEl = document.getElementById('finalGradeBadge');
  badgeEl.innerText = `${pct}% Mastery Rating`;
  badgeEl.className = `cyber-badge ${gradeBadge}`;
  document.getElementById('finalGradeExplanation').innerText = gradeText;

  // Store locally
  localStorage.setItem('phishguard_quiz_score', pct);
  markModuleCompleted('quiz');

  // Submit to Backend API
  try {
    await fetch(`${API_BASE}/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
      },
      body: JSON.stringify({
        session_id: SESSION_ID,
        quiz_type: 'practice_quiz',
        score: score,
        total_questions: quizData.length
      })
    });
  } catch (err) {
    console.warn('API submission failed or running standalone.');
  }

  playCyberTone(pct >= 70 ? 'success' : 'alert');
  resArea.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quizActiveArea')) {
    initQuiz();
  }
});

