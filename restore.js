const fs = require('fs');
const { execSync } = require('child_process');

try {
  let css = execSync('git show HEAD:assets/css/styles.css').toString('utf8');

  // Paso 1: .metric border top
  css = css.replace(
    /\.metric \{\s*padding: 18px;\s*border: 1px solid var\(--line\);\s*border-radius: var\(--radius\);\s*background: #fff;\s*\}/,
    `.metric {
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #fff;
      border-top-width: 3px;
    }
    .metric:nth-child(1) { border-top-color: var(--usmp-red); }
    .metric:nth-child(2) { border-top-color: var(--usmp-gold); }
    .metric:nth-child(3) { border-top-color: var(--warning); }
    .metric:nth-child(4) { border-top-color: var(--success); }`
  );

  // Paso 1: tr hover
  css = css.replace(
    /tr:last-child td \{\s*border-bottom: 0;\s*\}/,
    `tr:hover td {
      background: rgba(178, 34, 34, 0.03);
    }
    
    tr:last-child td {
      border-bottom: 0;
    }`
  );

  // Paso 2: .priority-item hover
  css = css.replace(
    /\.priority-item \{\s*padding: 11px;\s*border: 1px solid var\(--line\);\s*border-radius: 8px;\s*background: #fff;\s*\}/,
    `.priority-item {
      padding: 11px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      transition: box-shadow 180ms ease, transform 180ms ease;
    }
    .priority-item:hover {
      box-shadow: 0 4px 14px rgba(23, 32, 51, 0.08);
      transform: translateY(-1px);
    }`
  );

  // Paso 2: .status-stack height
  css = css.replace(
    /\.status-stack \{\s*display: flex;\s*height: 14px;\s*overflow: hidden;\s*border-radius: 999px;\s*background: #e9edf4;\s*\}/,
    `.status-stack {
      display: flex;
      height: 20px;
      overflow: hidden;
      border-radius: 6px;
      background: #e9edf4;
    }`
  );

  // Paso 2: .admin-action-card hover
  css = css.replace(
    /\.admin-action-card p \{\s*margin: 6px 0 0;\s*color: var\(--muted\);\s*font-size: 12px;\s*line-height: 1\.45;\s*\}/,
    `.admin-action-card p {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .admin-action-card {
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }

    .admin-action-card:hover {
      border-color: rgba(178, 34, 34, 0.3);
      box-shadow: 0 6px 20px rgba(178, 34, 34, 0.08);
    }`
  );

  // Paso 4: #logoutButton
  css = css.replace(
    /\.btn-light:hover \{\s*background: rgba\(178, 34, 34, 0\.08\);\s*color: var\(--usmp-red-strong\);\s*\}/,
    `.btn-light:hover {
      background: rgba(178, 34, 34, 0.08);
      color: var(--usmp-red-strong);
    }

    #logoutButton {
      background: var(--usmp-red);
      color: #fff;
      border-color: var(--usmp-red);
      font-weight: 800;
    }

    #logoutButton:hover {
      background: var(--usmp-red-strong);
      border-color: var(--usmp-red-strong);
    }`
  );

  // UX Polish: .support-tools
  css = css.replace(
    /\.support-tools \{\s*display: grid;\s*grid-template-columns: minmax\(240px, 1fr\) auto auto;\s*gap: 10px;\s*align-items: end;\s*padding: 14px;\s*border-bottom: 1px solid var\(--line\);\s*background: #fbfcff;\s*\}/,
    `.support-tools {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: flex-end;
      padding: 14px;
      border-bottom: 1px solid var(--line);
      background: #fbfcff;
    }`
  );

  // UX Polish: .support-tools .field and #supportExportCsv
  css = css.replace(
    /\.support-tools \.field \{\s*min-width: 0;\s*\}/,
    `.support-tools .field {
      flex: 1 1 180px;
      min-width: 0;
    }

    #supportExportCsv {
      margin-left: auto;
    }`
  );

  // UX Polish: .mini-button.primary and clear filters
  css = css.replace(
    /\.mini-button:hover \{\s*border-color: rgba\(178, 34, 34, 0\.46\);\s*color: var\(--usmp-red-strong\);\s*\}/,
    `.mini-button:hover {
      border-color: rgba(178, 34, 34, 0.46);
      color: var(--usmp-red-strong);
    }

    .mini-button.primary {
      background: var(--usmp-red);
      color: #fff;
      border-color: var(--usmp-red);
    }

    .mini-button.primary:hover {
      background: var(--usmp-red-strong);
      border-color: var(--usmp-red-strong);
      color: #fff;
    }

    #dashboardClearFilters,
    #clearFilters,
    #supportClearFilter {
      background: rgba(23, 32, 51, 0.04);
      color: var(--muted);
      border-color: rgba(23, 32, 51, 0.1);
    }

    #dashboardClearFilters:hover,
    #clearFilters:hover,
    #supportClearFilter:hover {
      background: rgba(23, 32, 51, 0.08);
      color: var(--ink);
    }`
  );

  // Add the staggered fade in animation for numbers (from Paso 1)
  if (!css.includes('@keyframes fadeInNum')) {
      css += `
    @keyframes fadeInNum {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .metric-value, .score-value, .admin-stat-card strong {
      animation: fadeInNum 400ms ease forwards;
    }
    .metric:nth-child(2) .metric-value { animation-delay: 100ms; }
    .metric:nth-child(3) .metric-value { animation-delay: 200ms; }
    .metric:nth-child(4) .metric-value { animation-delay: 300ms; }`;
  }

  fs.writeFileSync('assets/css/styles.css', css);
  console.log('CSS restored and all enhancements applied successfully.');
} catch(e) {
  console.error('Error:', e);
}
