/**
 * lab.js - Phishing Simulation Learning Lab
 * Safe, offline educational sandbox allowing learners to inspect realistic fictional emails,
 * toggle red-flag hotspots, and test their verdict with detailed forensic breakdowns.
 */

const simScenarios = [
  {
    id: "sim_m365_doc",
    title: "Scenario 1: Microsoft 365 Shared Document",
    senderDisplay: "Microsoft SharePoint Notifications",
    senderEmail: "no-reply@sharepoint-cloud-verify.net",
    replyTo: "inbox-harvest@attacker-auth.org",
    to: "user@enterprise-corp.com",
    subject: "Security Notification: [Confidential] Q4 Financial Audit Report Shared With You",
    isPhishing: true,
    logoIcon: "📄",
    logoName: "Microsoft 365 Cloud",
    logoColor: "#00a4ef",
    bodyHtml: `
      <p>Hello,</p>
      <p><strong>CFO Financial Office</strong> has shared a sensitive document with your organization account:</p>
      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin: 1rem 0; display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 2rem;">📊</span>
        <div>
          <div style="font-weight: 700; color: #fff;">Q4_Audit_Executive_Summary_2026.pdf</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Encrypted PDF Document • 3.2 MB</div>
        </div>
      </div>
      <p>To access this restricted corporate file, please authenticate your credentials on our secure gateway within <strong>24 hours</strong>:</p>
      <p style="margin: 1.5rem 0;">
        <a href="javascript:void(0)" class="sim-hover-link" data-url="https://login.microsoft.com.account-verify-portal.net/auth">
          Access SharePoint Document Now
        </a>
      </p>
      <p style="font-size: 0.8rem; color: var(--text-muted);">This is an automated notification. Microsoft respects your corporate privacy.</p>
    `,
    redFlags: [
      { element: "Sender Domain", desc: "Originates from 'sharepoint-cloud-verify.net' instead of the authentic 'sharepoint.com' or 'microsoft.com'." },
      { element: "Mismatched Reply-To", desc: "The Reply-To address routes to 'inbox-harvest@attacker-auth.org'." },
      { element: "Subdomain Deception in Link", desc: "The link destination has 'login.microsoft.com' as a subdomain, but the actual domain is 'account-verify-portal.net'." },
      { element: "Artificial Time Limit", desc: "24-hour expiration creates urgency to rush users past inspection." }
    ],
    explanation: "This is a high-frequency credential harvesting attack. Attackers mimic legitimate document-sharing platforms (OneDrive, SharePoint, Google Drive) to bait victims into logging into a counterfeit Microsoft authentication portal."
  },
  {
    id: "sim_dhl_fee",
    title: "Scenario 2: DHL Express Customs Clearance",
    senderDisplay: "DHL Express Global Dispatch",
    senderEmail: "dispatch-notice@dhl-express-tracking24.info",
    replyTo: "dispatch-notice@dhl-express-tracking24.info",
    to: "victim@enterprise-corp.com",
    subject: "Action Required: Parcel #DH-901842-US On Hold for Customs Duty ($2.75)",
    isPhishing: true,
    logoIcon: "📦",
    logoName: "DHL EXPRESS",
    logoColor: "#ffcc00",
    bodyHtml: `
      <p>Dear Customer,</p>
      <p>Your incoming package tracking number <strong>#DH-901842-US</strong> cannot be released from the central logistics depot due to an unpaid customs tariff of <strong>$2.75 USD</strong>.</p>
      <p>Failure to settle this fee within 48 hours will result in the shipment being returned to sender or destroyed according to international customs regulations.</p>
      <p style="margin: 1.5rem 0;">
        <a href="javascript:void(0)" class="sim-hover-link" data-url="https://dhl.com.package-dispatch-fee.online/pay">
          Pay Fee & Schedule Immediate Re-Delivery
        </a>
      </p>
      <p style="font-size: 0.8rem; color: var(--text-muted);">DHL International GmbH. All rights reserved.</p>
    `,
    redFlags: [
      { element: "Generic Greeting", desc: "Addressed impersonally to 'Dear Customer' rather than your real name." },
      { element: "Deceptive TLD & Domain", desc: "Sender domain uses '.info' and 'dhl-express-tracking24', which is not owned by DHL." },
      { element: "Micro-Fee Lure", desc: "Asking for a small $2.75 fee disarms suspicion, but the payment page captures credit card numbers, expiration dates, and CVVs." },
      { element: "Phishing URL", desc: "Link redirects to 'package-dispatch-fee.online'." }
    ],
    explanation: "Smishing and package delivery phishing rely on low-friction lures ($1-$3 fees) to prompt users to surrender payment details and personal information."
  },
  {
    id: "sim_ceo_wire",
    title: "Scenario 3: Executive Wire Transfer (Whaling / BEC)",
    senderDisplay: "Mark Vance (Chief Executive Officer)",
    senderEmail: "mark.vance@enterprise-corp.co",
    replyTo: "ceo.markvance.private@gmail.com",
    to: "accounting-lead@enterprise-corp.com",
    subject: "CONFIDENTIAL / IMMEDIATE: Urgent Escrow Deposit for German Acquisition",
    isPhishing: true,
    logoIcon: "💼",
    logoName: "EXECUTIVE OFFICE",
    logoColor: "#f59e0b",
    bodyHtml: `
      <p>Hi Sarah,</p>
      <p>I am currently boarding an international flight to Munich for confidential acquisition negotiations and have extremely limited cell service.</p>
      <p>We need an immediate wire transfer of <strong>$84,500.00 USD</strong> dispatched to the German escrow account before European banking cutoff at 4:00 PM CET, or the acquisition deal will fall through.</p>
      <p>Wire instructions are in the password-protected attachment. Password is 'Escrow2026'. Proceed immediately and reply with the wire confirmation number.</p>
      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); padding: 0.85rem; border-radius: 8px; margin: 1rem 0; max-width: 400px; display: flex; align-items: center; justify-content: space-between;">
        <span>Attachment: Wire_Routing_Instructions_Confidential.zip</span>
        <span style="color: #ef4444; font-size: 0.75rem; font-weight: bold;">PASSWORD PROTECTED</span>
      </div>
      <p>Thanks,<br><strong>Mark Vance</strong><br>CEO, Enterprise Corp</p>
    `,
    redFlags: [
      { element: "Lookalike Domain (.co vs .com)", desc: "The sender uses '@enterprise-corp.co' instead of authentic '@enterprise-corp.com'." },
      { element: "Reply-To to Gmail", desc: "Replies are directed to 'ceo.markvance.private@gmail.com'." },
      { element: "Communication Barrier", desc: "The sender explicitly states they cannot be called ('boarding a flight') to prevent phone verification." },
      { element: "Password-Protected ZIP", desc: "Encrypted archives prevent security gateways from inspecting for embedded malware or macro scripts." }
    ],
    explanation: "This is a quintessential Business Email Compromise (BEC) whaling attack. The attacker exploits executive authority, confidentiality, and time pressure to bypass accounting dual-control procedures."
  },
  {
    id: "sim_legit_it",
    title: "Scenario 4: Routine IT Maintenance (Legitimate Email)",
    senderDisplay: "Enterprise IT Support Operations",
    senderEmail: "it-support@enterprise-corp.com",
    replyTo: "it-support@enterprise-corp.com",
    to: "all-employees@enterprise-corp.com",
    subject: "Scheduled Maintenance Notice: Intranet & VPN Services (Saturday 2:00 AM EST)",
    isPhishing: false,
    logoIcon: "🛠️",
    logoName: "ENTERPRISE CORP IT",
    logoColor: "#10b981",
    bodyHtml: `
      <p>Dear Colleagues,</p>
      <p>This is a routine notification that IT Infrastructure will perform scheduled database maintenance this <strong>Saturday between 2:00 AM and 4:00 AM EST</strong>.</p>
      <p>During this two-hour maintenance window, internal VPN connections and the local intranet portal may experience brief intermittent outages. Email (Outlook) and Microsoft Teams will remain fully operational.</p>
      <p>No action is required on your part. For any concerns, you can verify this maintenance schedule on our internal IT knowledge base:</p>
      <p style="margin: 1.5rem 0;">
        <a href="javascript:void(0)" class="sim-hover-link" data-url="https://enterprise-corp.sharepoint.com/sites/it/maintenance-calendar">
          🔗 View Maintenance Schedule on SharePoint Intranet
        </a>
      </p>
      <p>Best regards,<br><strong>Enterprise IT Operations Team</strong><br>Internal Extension: 4100</p>
    `,
    redFlags: [],
    explanation: "This is a completely legitimate internal communication. The sender domain matches the official enterprise domain, replies go to the verified internal queue, links point to the authentic internal SharePoint tenant, and no passwords or urgent credentials are requested."
  }
];

let currentSimIndex = 0;
let showDetectiveHotspots = false;

function loadSimScenario(idx) {
  currentSimIndex = idx;
  showDetectiveHotspots = false;
  
  // Update scenario tabs
  document.querySelectorAll('.sim-tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  const s = simScenarios[idx];
  
  // Header & Meta
  document.getElementById('simSubjectLine').innerText = s.subject;
  document.getElementById('simSenderDisplay').innerText = s.senderDisplay;
  document.getElementById('simSenderEmail').innerText = `<${s.senderEmail}>`;
  document.getElementById('simReplyTo').innerText = s.replyTo;
  document.getElementById('simRecipient').innerText = s.to;

  // Highlight if reply-to mismatch
  const replyEl = document.getElementById('simReplyTo');
  if (s.replyTo !== s.senderEmail) {
    replyEl.innerHTML = `<span style="color: #f87171; font-weight: bold;">${s.replyTo} (MISMATCH!)</span>`;
  }

  // Render Body
  document.getElementById('simBodyArea').innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; color: ${s.logoColor}; font-weight: 800; font-size: 1.25rem; margin-bottom: 1.25rem;">
      <span>${s.logoIcon}</span>
      <span>${s.logoName}</span>
    </div>
    ${s.bodyHtml}
  `;

  // Attach hover URL tooltips to links
  setupLinkHovers();

  // Reset feedback & button text
  document.getElementById('simFeedbackPanel').style.display = 'none';
  document.getElementById('simHotspotToggleBtn').innerText = "Inspect Indicator Highlights";
}

function setupLinkHovers() {
  document.querySelectorAll('.sim-hover-link').forEach(link => {
    const targetUrl = link.getAttribute('data-url');
    link.style.position = 'relative';
    link.style.color = '#38bdf8';
    link.style.textDecoration = 'underline';
    link.style.cursor = 'pointer';

    link.addEventListener('mouseenter', () => {
      let tip = document.getElementById('simUrlTooltip');
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'simUrlTooltip';
        tip.style.position = 'absolute';
        tip.style.bottom = 'calc(100% + 6px)';
        tip.style.left = '0';
        tip.style.background = '#091122';
        tip.style.color = '#f87171';
        tip.style.border = '1px solid #ef4444';
        tip.style.padding = '0.35rem 0.65rem';
        tip.style.borderRadius = '4px';
        tip.style.fontSize = '0.8rem';
        tip.style.fontFamily = 'monospace';
        tip.style.zIndex = '100';
        tip.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        link.appendChild(tip);
      }
      tip.innerText = `True Destination: ${targetUrl}`;
      tip.style.display = 'block';
    });

    link.addEventListener('mouseleave', () => {
      const tip = document.getElementById('simUrlTooltip');
      if (tip) tip.style.display = 'none';
    });
  });
}

function toggleHotspots() {
  showDetectiveHotspots = !showDetectiveHotspots;
  const s = simScenarios[currentSimIndex];
  const btn = document.getElementById('simHotspotToggleBtn');

  if (!showDetectiveHotspots) {
    btn.innerText = "Inspect Indicator Highlights";
    loadSimScenario(currentSimIndex);
    return;
  }

  btn.innerText = "Hide Indicator Highlights";

  if (!s.isPhishing) {
    alert("Analysis: No suspicious indicators detected. This email originates from the legitimate corporate domain and follows standard protocols.");
    return;
  }

  // Inject red flags box
  const flagsHtml = `
    <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 8px; padding: 1.25rem; margin-top: 1.5rem; animation: fadeIn 0.3s ease;">
      <div style="font-weight: 800; color: #f87171; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>Suspicious Indicators Identified:</span>
      </div>
      <ul style="padding-left: 1.25rem; color: #fee2e2; font-size: 0.9rem; line-height: 1.6;">
        ${s.redFlags.map(rf => `<li><strong>${rf.element}:</strong> ${rf.desc}</li>`).join('')}
      </ul>
    </div>
  `;
  document.getElementById('simBodyArea').insertAdjacentHTML('beforeend', flagsHtml);
}

async function submitSimVerdict(userChoice) {
  const s = simScenarios[currentSimIndex];
  const isCorrect = (userChoice === 'phish' && s.isPhishing) || (userChoice === 'safe' && !s.isPhishing);
  const fb = document.getElementById('simFeedbackPanel');
  fb.style.display = 'block';

  if (isCorrect) {
    playCyberTone('success');
    fb.style.background = 'rgba(16, 185, 129, 0.15)';
    fb.style.border = '1px solid #10b981';
    fb.style.color = '#a7f3d0';
    fb.innerHTML = `
      <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">
        Correct Assessment.
      </div>
      <p style="font-size: 0.95rem; margin: 0;">${s.explanation}</p>
    `;
  } else {
    playCyberTone('alert');
    fb.style.background = 'rgba(239, 68, 68, 0.15)';
    fb.style.border = '1px solid #ef4444';
    fb.style.color = '#fca5a5';
    fb.innerHTML = `
      <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">
        Incorrect Assessment.
      </div>
      <p style="font-size: 0.95rem; margin: 0;">${s.explanation}</p>
    `;
  }

  // Log to backend & mark completed
  markModuleCompleted('simulation_lab');
  try {
    await fetch(`${API_BASE}/api/simulation/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
      },
      body: JSON.stringify({
        session_id: SESSION_ID,
        scenario_id: s.id,
        user_verdict: userChoice,
        is_correct: isCorrect
      })
    });
  } catch (e) {
    // offline
  }

  fb.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('simBodyArea')) {
    loadSimScenario(0);
  }
});

