# PHISHGUARD – Phishing Awareness & Cybersecurity Training Platform

```
  ____  _   _ ___ ____  _   _  ____ _   _    _    ____  ____  
 |  _ \| | | |_ _/ ___|| | | |/ ___| | | |  / \  |  _ \|  _ \ 
 | |_) | |_| || |\___ \| |_| | |  _| | | | / _ \ | |_) | | | |
 |  __/|  _  || | ___) |  _  | |_| | |_| |/ ___ \|  _ <| |_| |
 |_|   |_| |_|___|____/|_| |_|\____|\___//_/   \_\_| \_\____/ 
       THINK BEFORE YOU CLICK • ZERO-TRUST DEFENSE TRAINING
```

[![Platform](https://img.shields.io/badge/Platform-Web%20Application-2563eb?style=flat-square)](#)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square)](#)
[![Database](https://img.shields.io/badge/Database-SQLite3-10b981?style=flat-square)](#)
[![UI](https://img.shields.io/badge/UI-Bootstrap%205%20%2B%20EnterpriseDark-2563eb?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Educational%20Use-slate?style=flat-square)](#)

---

## 1. Project Overview

**PHISHGUARD** is an interactive, full-stack cybersecurity educational and awareness training platform designed to equip students, corporate employees, and general web users with the knowledge and practical skills required to recognize, analyze, resist, and report sophisticated phishing attacks and social engineering deception.

Traditional perimeter defenses (firewalls, endpoint security agents, intrusion prevention systems) are rendered ineffective when an authorized human keyholder is deceived into surrendering credentials or approving unauthorized multi-factor access. **PHISHGUARD transforms human users into active, resilient "Human Firewalls" through structured lessons, interactive forensics labs, realistic sandbox simulations, and verifiable certification.**

This is a **strictly defensive, educational project**. It features zero weaponized exploit tools, captures zero real-world passwords or OTPs, sends zero live emails, and operates 100% safely both online and offline.

---

## 2. Project Objectives

1. **Foundational Education:** Demystify the end-to-end phishing attack lifecycle, attacker economic incentives, and the taxonomy of modern social engineering.
2. **Email Forensic Recognition:** Train learners to spot the 7 cardinal red flags of deceptive emails (display name spoofing, artificial panic, lookalike domains, macro payloads).
3. **URL & Domain Analysis:** Dissect complex URLs (subdomains vs. registered domains, typosquatting, IDN homoglyphs, and the HTTPS padlock fallacy).
4. **Psychological Inoculation:** Expose the cognitive triggers weaponized by threat actors (Urgency, Fear, Authority, Greed, Curiosity, Pretexting, Sympathy).
5. **Hands-On Sandbox Simulation:** Provide a harmless offline environment to inspect emails, toggle detective red-flag hotspots, and test decision-making.
6. **Defensive Best Practices & Runbooks:** Deliver actionable corporate security habits (S.L.A.M. method, out-of-band telephone verification, phishing-resistant FIDO2 MFA).
7. **Verifiable Capstone Certification:** Evaluate competence via a 15-question diagnostic quiz and a 10-question final exam, generating an official, tamper-evident educational Certificate of Completion.

---

## 3. Technology Stack

| Layer | Technologies Used | Details |
|---|---|---|
| **Frontend Framework** | HTML5, CSS3, JavaScript (ES6+) | Semantic layout, interactive DOM manipulation, responsive flexbox/grid |
| **UI Design System** | Bootstrap 5 + Enterprise Security Dark Theme | Refined slate-navy background (`#0b0f19`, `#111827`, `#151e32`), royal blue accents (`#2563eb`, `#3b82f6`), emerald verification (`#10b981`), crimson alert (`#ef4444`), subtle slate borders (`#243048`) |
| **Visual Charts** | Native HTML5 Canvas API | Zero-dependency responsive Doughnut Chart & Competency Mastery Bar Chart |
| **Audio Synthesis** | Web Audio API | Client-side synthesized auditory feedback (positive chime, alert tone, click) |
| **Backend Web Server** | Python 3 Standard Library (`http.server`) | **Zero external pip dependencies required!** Runs out-of-the-box on any standard Python 3.8+ system |
| **Alternative Server** | Python with Flask (`flask_app.py`) | Provided for environments where standard Flask is installed (`pip install flask`) |
| **Database & Storage** | SQLite 3 (`phishguard.db`) + LocalStorage | Schema constraints, transaction management, persistence for modules, quiz attempts, and certificates |
| **API Architecture** | RESTful JSON API | Standard HTTP GET/POST endpoints with security headers (`X-Frame-Options`, `X-Content-Type-Options`, CORS) |

---

## 4. Project Folder Structure

```
Cybersecurity_Tasks/
│
├── app.py                      # Standalone zero-dependency Python web server & REST API
├── flask_app.py                # Optional Flask backend alternative
├── database.py                 # SQLite database manager & CRUD operations
├── phishguard.db               # SQLite database file (auto-generated)
├── checklist.txt               # Downloadable plain-text cybersecurity defense checklist
├── run.bat                     # Windows one-click launcher
├── README.md                   # Comprehensive project documentation
│
├── static/
│   ├── css/
│   │   ├── bootstrap.min.css   # Offline Bootstrap 5 core grid & utility styles
│   │   └── phishguard.css      # Professional security theme, subtle borders, card styling, print CSS
│   ├── js/
│   │   ├── app.js              # State manager, session ID, global navbar progress ticker
│   │   ├── quiz.js             # 15-question interactive quiz engine with immediate rationales
│   │   ├── assessment.js       # 10-question capstone exam with 80% passing threshold
│   │   ├── lab.js              # Simulation lab with clickable hotspot inspector & verdicts
│   │   ├── urldecoder.js       # Safe URL deconstruction & deceptive domain analysis
│   │   └── charts.js           # HTML5 Canvas doughnut and mastery bar charts
│   └── images/                 # SVG icons, official seals, and illustrations
│
├── templates/
│   ├── index.html              # Page 1: Home / Landing Page ("Think Before You Click")
│   ├── fundamentals.html       # Page 2: Phishing Fundamentals & 6 Core Types
│   ├── email_phishing.html     # Page 3: Recognizing Phishing Emails & 5 Case Studies
│   ├── fake_websites.html      # Page 4: Fake Website Detection & Interactive URL Decoder
│   ├── social_engineering.html # Page 5: Social Engineering Awareness & Cognitive Triggers
│   ├── case_studies.html       # Page 6: Real-World Incident Case Studies
│   ├── quiz.html               # Page 7: 15-Question Interactive Phishing Awareness Quiz
│   ├── simulation_lab.html     # Page 8: Phishing Simulation Learning Lab
│   ├── safety_guide.html       # Page 9: Prevention Guide & Downloadable Checklist
│   ├── final_assessment.html   # Page 10: Capstone Assessment & Official Certificate
│   └── dashboard.html          # Defensive Readiness Dashboard & Verification Tool
│
└── tests/
    └── test_app.py             # Automated unit & integration test suite (10/10 tests)
```

---

## 5. Installation & Quick Start Guide

### Option A: One-Click Windows Launcher (Fastest)
1. Double-click `run.bat` in the project root.
2. The script will automatically verify your Python installation, launch the background server, and open `http://localhost:5000` in your default web browser.

### Option B: Command Line (Standard Python - Zero Dependencies)
No external package installation (`pip`) is required.
```bash
# Navigate to the project directory
cd Cybersecurity_Tasks

# Start the web server
python app.py
```
Open your browser and navigate to: **`http://localhost:5000`**

### Option C: Optional Flask Backend
If you have Flask installed:
```bash
python flask_app.py
```

### Option D: Direct Offline Browser Evaluation
If no Python runtime is available, all 10 pages in the `templates/` folder can be opened directly in any modern browser (e.g. `templates/index.html`). The application gracefully falls back to browser `localStorage` to preserve progress.

---

## 6. Detailed Walkthrough of Pages & Features

### PAGE 1: Home / Landing Page
- **Branding:** Modern PHISHGUARD shield badge with cyan glow.
- **Hero Statement:** *"Think Before You Click."*
- **Illustrative Statistics Banner:**
  - `3.4 Billion` Phishing Emails Dispatched Daily
  - `91%` of Successful Cyberattacks Begin with a Spear-Phish
  - `82%` of Fake Websites Feature Valid SSL/TLS Certificates
  - `$4.88M` Average Organizational Cost of a Data Breach
  - *Prominent Educational Notice:* Metrics clearly identified as illustrative industry benchmarks.
- **Why Attackers Target Humans:** Technical explanation of human vs. algorithmic vulnerability.
- **Curriculum Overview:** One-click navigation cards to all 10 modules.

### PAGE 2: Phishing Fundamentals
- **Core Definition:** High-level and technical explanation of deceptive digital manipulation.
- **The 6-Phase Lifecycle:** Reconnaissance → Weaponization → Delivery → Psychological Trigger → Exploitation → Monetization.
- **Deep-Dive into 6 Core Phishing Types:**
  1. *Standard Email Phishing:* Mass spray-and-pray attacks.
  2. *Spear Phishing:* OSINT-researched attacks targeting specific personnel.
  3. *Whaling / Executive BEC:* Targeting C-suite executives for wire fraud.
  4. *Smishing (SMS Phishing):* Mobile attacks with urgent package or toll alerts.
  5. *Vishing (Voice Phishing):* Phone calls, pretexting, and AI voice cloning.
  6. *Clone Phishing:* Re-sending genuine previous emails with replaced malicious links/attachments.
- Each profile includes: **Definition, Recognition Indicators, Safe Educational Example, and Prevention Tips**.

### PAGE 3: Recognizing Phishing Emails
- **The 7 Cardinal Red Flags:**
  1. Suspicious Senders & Display Name Spoofing
  2. Artificial Urgency & Coercive Deadlines
  3. Dangerous Attachments (`.iso`, password-protected `.zip`, `.docm`, `.xlsm`)
  4. Deceptive Hyperlinks & Mismatched Anchor Text
  5. Unusual Grammar or Formatting Anomalies
  6. Direct Solicitations for Passwords or MFA Codes
  7. Unexpected Financial Routing & Wire Changes
- **5 Interactive Fictional Email Case Studies:**
  - *Case 1:* Microsoft 365 Password Expiration Alert (Helpdesk spoof)
  - *Case 2:* CEO Confidential Wire Transfer Request (Whaling / BEC)
  - *Case 3:* DHL Express Failed Delivery & Customs Fee (Smishing lure)
  - *Case 4:* HR Annual Bonus Matrix (VBA Macro payload)
  - *Case 5:* Bank Security Lockdown Alert (Credential harvesting)
- Dynamic tabs allow inspecting sender headers, Reply-To mismatches, interactive red-flag annotations, and recommended safety actions.

### PAGE 4: Fake Website Detection & Interactive URL Decoder
- **8 Web Deception Techniques:** Typosquatting, lookalike domains, subdomain nesting, IDN homoglyphs, padlock limitations, unexpected login prompts, fake payment gateways, AitM reverse proxies.
- **Interactive Safe URL Decoder Tool:**
  - Accepts any user-entered web address or pre-loaded presets.
  - Automatically deconstructs the URL into **Protocol (`https://`)**, **Subdomain Prefix**, **True Registered Domain (SLD+TLD)**, and **Resource Path**.
  - Evaluates heuristic indicators and flags deceptive subdomains or homoglyphs with clear forensic explanations.

### PAGE 5: Social Engineering Awareness
- **7 Psychological Cognitive Levers:**
  1. *Urgency:* Forcing impulsive reactions under time constraints.
  2. *Fear & Intimidation:* Threats of termination, arrest, or lawsuits.
  3. *Authority Impersonation:* Posing as executives, police, or auditors.
  4. *Curiosity & Intrigue:* Leaked salary documents, lay-off gossip.
  5. *Trust Exploitation (Pretexting):* Compromised vendor email threads.
  6. *Reward & Prize Scams:* Contests you never entered, gift cards.
  7. *Friend/Colleague in Distress:* Impersonating stranded family members.
- Each tactic includes: **Mechanism, Fictional Scenario, Warning Signs, and Safe Response Protocols**.

### PAGE 6: Real-World Case Studies
- **5 In-Depth Forensic Incident Breakdowns:**
  1. *Bank Fraud SMS & Reverse Proxy Interception*
  2. *Courier Package "Customs Fee" Credential Harvesting*
  3. *Remote Work Job Offer & Counterfeit Check Advance Fee Scam*
  4. *University Financial Aid Portal Phishing & Rogue OAuth Consent*
  5. *Search Engine Ad Poisoning & Fake Tech Support Remote Desktop Scam*
- Structured breakdown: **Situation, Attacker's Deception, Warning Signs, Potential Consequences, and Correct Preventive Actions**.

### PAGE 7: Phishing Awareness Quiz
- **15 Scenario-Driven Multiple-Choice Questions:**
  - Questions 1–5: Beginner Awareness
  - Questions 6–10: Intermediate Mechanics
  - Questions 11–15: Advanced Vectors (AitM reverse proxies, FIDO2 passkeys, Quishing, Homoglyphs)
- **Features:**
  - Instant tactical feedback upon selection (Green / Red styling).
  - Detailed educational rationale explaining why the choice is correct or incorrect.
  - Real-time score ticker and progress bar.
  - Final diagnostic score percentage, mastery rating badge, and retake option.
  - Automatically records attempt in SQLite database.

### PAGE 8: Phishing Simulation Learning Lab
- **Safe, Offline Sandbox:**
  - 4 realistic fictional emails (M365 Shared Doc, DHL Customs Fee, Executive Wire Transfer, Routine IT Notice).
  - Hoverable hyperlinks with safe destination previews.
  - **"Toggle Detective Red Flags"** button to uncover hidden structural anomalies.
  - **Verdict Selection:** Submit your evaluation (*Report as Phishing* vs. *Mark as Safe*).
  - Comprehensive forensic explanation provided after every verdict.

### PAGE 9: Prevention & Cyber Safety Guide
- **10 Practical Enterprise Defense Rules:**
  1. Verify the Sender (Expand headers, check Reply-To)
  2. Inspect Links Before Opening (Hover, verify domain before first slash)
  3. Never Share OTPs or Passwords (No legitimate entity requests them)
  4. Enable Multi-Factor Authentication (FIDO2 / Passkeys over SMS)
  5. Use Strong, Unique Passwords (16+ char passphrases)
  6. Keep Software Updated (OS, browser, security agents)
  7. Avoid Unexpected Attachments (Scrutinize archives and macros)
  8. Out-of-Band Verification (Call on established secondary channels)
  9. Report Suspicious Messages (Notify SOC/IT within 5 minutes)
  10. Use a Password Manager (Domain origin matching prevents credential leaks)
- **Downloadable Defense Checklist:** Plain-text checklist available via one-click download (`checklist.txt`) and an interactive on-screen checklist viewer.

### PAGE 10: Final Assessment & Verifiable Certificate
- **10-Question Capstone Exam:** Scenario-based questions covering real-world attack vectors.
- **Question-by-Question Review:** Highlights your selected answer, correct choice, and full explanatory rationale.
- **80% Passing Threshold:** A score of at least 8/10 (80%) is required to earn certification.
- **Verifiable Certificate of Completion:**
  - Displays participant's voluntary name, course title, dynamic issue date, and achieved score.
  - Issues a unique Certificate ID (e.g. `PG-2026-X94B12`) stored in the SQLite database.
  - Includes a tamper-evident SHA-256 verification hash.
  - Clearly identified with an official disclaimer as a self-issued educational certificate.
  - Fully printable via `window.print()` with dedicated high-contrast print CSS.

### DASHBOARD: Defensive Readiness Dashboard
- Aggregated metrics: Total Modules (10), Completed Modules, Quiz Score, Assessment Score, Certificate Status.
- **HTML5 Canvas Doughnut Chart:** Real-time visual representation of completed curriculum.
- **Topic Mastery Bar Chart:** Dynamic performance breakdown across Email Forensics, URL Detection, Social Engineering, Sim Lab, and Final Exam.
- **10-Module Learning Pathway Table:** Visual status tracking with direct module navigation links.
- **Certificate Registry Verification Tool:** Enter any Certificate ID to query the SQLite database and verify its authenticity in real time.
- **Reset Progress:** Easily reset all local and server data to start fresh.

---

## 7. Testing & Quality Assurance

PHISHGUARD includes a comprehensive automated test suite (`tests/test_app.py`) verifying database integrity, HTTP routing, template rendering, and REST API endpoints.

To run the automated test suite:
```bash
python tests/test_app.py
```

### Test Suite Coverage:
```
..........
----------------------------------------------------------------------
Ran 10 tests in 0.230s

OK
```
1. `test_01_user_creation`: User session persistence in SQLite.
2. `test_02_module_progress`: Module completion recording and idempotency.
3. `test_03_quiz_submission`: Quiz scoring and passing threshold calculation.
4. `test_04_certificate_generation_and_verification`: Certificate creation, 80% passing threshold enforcement, and registry lookup.
5. `test_05_dashboard_stats`: Aggregate statistics computation.
6. `test_06_simulation_log`: Logging simulation lab attempts.
7. `test_07_reset`: User progress reset functionality.
8. `test_01_all_10_pages_render`: Verifies that all 10 page routes return HTTP 200 OK and expected HTML content.
9. `test_02_static_assets_serve`: Verifies that all CSS, JS, and checklist assets serve with non-empty payloads.
10. `test_03_rest_api_lifecycle`: Full end-to-end integration test of the REST API.

---

## 8. Defensive Security & Ethical Safeguards

1. **Zero Credential Harvesting:** The platform never collects or stores real-world passwords, OTPs, or payment information. All form fields are purely educational simulations.
2. **Safe Educational Domains:** All sample domains used in examples (e.g., `ms-security-portal-auth.com`, `package-dispatch-fee.online`) are non-routable fictional strings or local placeholders.
3. **No Operational Attack Tools:** The platform contains defensive instructional content only; it includes no weaponized phishing kits, harvesting scripts, or offensive exploits.
4. **Input Sanitization & Security Headers:** All user inputs (such as certificate recipient names) are sanitized and escaped to prevent Cross-Site Scripting (XSS). Server responses include standard security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`).

---

## 9. Future Enhancements

- **SCORM / xAPI Integration:** Export the modules as standardized SCORM 1.2 / 2004 packages for enterprise Learning Management Systems (LMS) such as Moodle and Canvas.
- **AI-Powered Adaptive Phishing Generator:** Dynamic generation of fictional emails based on user industry (Healthcare, Finance, Higher Ed).
- **Gamified Team Leaderboards:** Enterprise multi-tenant mode with department-level phishing resilience scoring and weekly security challenges.
- **Browser Extension Companion:** A lightweight browser plugin that simulates the URL Decoder tool on active browsing sessions.

---

## 10. Project Credits & Information

- **Project Name:** PHISHGUARD – Phishing Awareness & Cybersecurity Training Platform
- **Assignment:** Task 2 – Phishing Awareness Training
- **Academic Context:** Cybersecurity Capstone / College Demonstration Project
- **Date:** November 2026
- **Status:** Complete, Fully Tested, and Ready for Deployment

