const fs = require('fs');

const extendedDarkMode = `
/* =========================================================
   EXTENDED DARK MODE - FIXING WHITE ELEMENTS
   ========================================================= */

/* Dashboard and Groups */
body.dark-theme .dashboard-group,
body.dark-theme .dashboard-group-feedback,
body.dark-theme .dashboard-controls,
body.dark-theme .filters,
body.dark-theme .panel,
body.dark-theme .metric,
body.dark-theme .feedback-quick-card,
body.dark-theme .insight-item,
body.dark-theme .module-sidebar,
body.dark-theme .public-intro,
body.dark-theme .alert {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4) !important;
}

body.dark-theme .dashboard-group-header h3,
body.dark-theme .panel-title,
body.dark-theme .metric-value,
body.dark-theme .metric-strip strong,
body.dark-theme .feedback-quick-card strong,
body.dark-theme .metric-label {
  color: #f8fafc !important;
}

body.dark-theme .metric-strip div {
  background-color: #0f172a !important;
  border-color: #334155 !important;
}

body.dark-theme .metric-strip span {
  color: #94a3b8 !important;
}

body.dark-theme .ui-icon,
body.dark-theme .heading-icon {
  background-color: #334155 !important;
  color: #7dd3fc !important;
}

body.dark-theme .module-nav-button .nav-icon {
  background-color: #0f172a !important;
}

/* Tabs & Links */
body.dark-theme .insight-tab,
body.dark-theme .metric-link {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #94a3b8 !important;
}

body.dark-theme .insight-tab.is-active {
  background-color: rgba(56, 189, 248, 0.15) !important;
  color: #38bdf8 !important;
  border-color: #38bdf8 !important;
}

/* Malla UI elements */
body.dark-theme .malla-toolbar {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

body.dark-theme .malla-credits-row {
  background-color: #0f172a !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}

body.dark-theme .malla-credits-accum {
  background-color: #334155 !important;
  color: #f8fafc !important;
  border-color: #475569 !important;
}

/* Legend */
body.dark-theme #mallaLegend {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

body.dark-theme .malla-legend-item {
  color: #f1f5f9 !important;
}

body.dark-theme .malla-legend-name {
  color: #f1f5f9 !important;
}

/* Toolbars / Support Tools */
body.dark-theme .support-tools,
body.dark-theme .pagination {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

/* Override background gradient in dark mode */
body.dark-theme {
  background: #0f172a !important;
}
`;

fs.appendFileSync('c:/Proyectos/usmp/assets/css/styles.css', extendedDarkMode, 'utf8');
console.log('Appended Extended CSS correctly!');
