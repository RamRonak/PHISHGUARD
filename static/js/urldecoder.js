/**
 * urldecoder.js - Interactive Safe URL Deconstruction & Deceptive Domain Lab
 * Parses user-supplied or preset URLs into:
 * - Protocol (e.g. https://)
 * - Subdomain prefix (e.g. login.microsoft.com.)
 * - Registered Domain (SLD + TLD) (e.g. account-update.xyz)
 * - Path / Parameters
 * Highlights deceptive subdomains, typosquatting, and IDN homoglyphs.
 */

function runUrlAnalysis(inputUrl) {
  const urlVal = inputUrl || document.getElementById('urlDecoderInput').value.trim();
  if (!urlVal) return;

  try {
    let parsed;
    try {
      parsed = new URL(urlVal);
    } catch (e) {
      parsed = new URL("https://" + urlVal);
    }

    const protocol = parsed.protocol + "//";
    const hostname = parsed.hostname;
    const pathname = parsed.pathname + parsed.search;

    const parts = hostname.split('.');
    let trueDomain = "";
    let subdomain = "";

    if (parts.length >= 2) {
      // Check multi-part TLDs like .co.uk
      if (parts.length >= 3 && ["co.uk", "com.au", "gov.uk", "edu.au"].includes(parts.slice(-2).join('.'))) {
        trueDomain = parts.slice(-3).join('.');
        subdomain = parts.slice(0, -3).join('.');
      } else {
        trueDomain = parts.slice(-2).join('.');
        subdomain = parts.slice(0, -2).join('.');
      }
    } else {
      trueDomain = hostname;
    }

    // Deception heuristics
    let isSuspicious = false;
    let reasons = [];

    // 1. Subdomain brand trick
    const brands = ["microsoft", "paypal", "google", "apple", "amazon", "chase", "bankofamerica", "netflix", "wellsfargo"];
    brands.forEach(b => {
      if (subdomain.toLowerCase().includes(b) && !trueDomain.toLowerCase().includes(b)) {
        isSuspicious = true;
        reasons.push(`Brand Impersonation in Subdomain: The brand name '${b}' is hidden inside the prefix subdomain, but the real destination domain is '${trueDomain}'!`);
      }
    });

    // 2. Typosquatting
    if (trueDomain.includes("1") || trueDomain.includes("0") || trueDomain.includes("paypa1") || trueDomain.includes("micros0ft") || trueDomain.includes("g00gle")) {
      isSuspicious = true;
      reasons.push(`Typosquatting Detected: Numbers replacing letters (e.g. '1' for 'l' or '0' for 'o') in '${trueDomain}'.`);
    }

    // 3. Hyphenated lookalikes
    if ((trueDomain.includes("-login") || trueDomain.includes("-verify") || trueDomain.includes("-security") || trueDomain.includes("-support"))) {
      isSuspicious = true;
      reasons.push(`Suspicious Hyphenated Lookalike: Domain contains security-themed lure words ('-verify', '-security') to mimic an authentic service.`);
    }

    // 4. Non-ASCII IDN Homoglyphs
    if (/[^\u0000-\u007F]/.test(hostname)) {
      isSuspicious = true;
      reasons.push(`IDN Homoglyph / Homograph Attack: Contains foreign/Cyrillic characters that look visually identical to Latin characters!`);
    }

    // Render visual syntax pills
    const segmentsContainer = document.getElementById('urlVisualSegments');
    if (segmentsContainer) {
      segmentsContainer.innerHTML = `
        <span class="url-pill url-pill-protocol" title="Protocol">${protocol}</span>
        ${subdomain ? `<span class="url-pill url-pill-subdomain" title="Subdomain Prefix">${subdomain}.</span>` : ''}
        <span class="url-pill ${isSuspicious ? 'url-pill-domain-bad' : 'url-pill-domain-good'}" title="True Registered Domain">${trueDomain}</span>
        <span class="url-pill url-pill-path" title="Path / Resource">${pathname}</span>
      `;
    }

    // Render Diagnostic Evaluation
    const diagBox = document.getElementById('urlDiagnosticResults');
    if (diagBox) {
      diagBox.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.25rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">True Destination Domain</div>
            <div style="font-size: 1.1rem; color: ${isSuspicious ? '#f87171' : '#34d399'}; font-weight: 800; font-family: monospace;">${trueDomain}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Subdomain (Prefix)</div>
            <div style="font-size: 0.95rem; color: #fbbf24; font-family: monospace;">${subdomain || "None (Root Domain)"}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Safety Evaluation</div>
            <div style="font-size: 0.95rem; font-weight: 800; color: ${isSuspicious ? '#ef4444' : '#10b981'};">
              ${isSuspicious ? '🚨 HIGH PROBABILITY PHISH' : '✅ STANDARD DOMAIN STRUCTURE'}
            </div>
          </div>
        </div>

        ${isSuspicious ? `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 8px; padding: 1rem; margin-top: 1rem; color: #fca5a5;">
            <strong>⚠️ Deceptive Indicators Flagged:</strong>
            <ul style="margin: 0.5rem 0 0 1.25rem; font-size: 0.9rem;">
              ${reasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : `
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 8px; padding: 1rem; margin-top: 1rem; color: #a7f3d0; font-size: 0.9rem;">
            <strong>✓ Structural Analysis:</strong> The registered domain appears consistent with standard naming structures. Always confirm that this matches the expected organizational URL.
          </div>
        `}
      `;
    }

    playCyberTone(isSuspicious ? 'alert' : 'success');
    markModuleCompleted('fake_websites');
  } catch (err) {
    alert("Please enter a valid web URL (e.g. https://login.microsoft.com.account-update.xyz/auth)");
  }
}

function selectPresetUrl(url) {
  const input = document.getElementById('urlDecoderInput');
  if (input) {
    input.value = url;
    runUrlAnalysis(url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('urlDecoderInput')) {
    runUrlAnalysis();
  }
});

