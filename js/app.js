/**
 * CIRCULAR — Application Logic & Interactive State Controller
 * Challenge: IMX26-PS07 — CEDA-EPS
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App State
const state = {
  currentTab: 'home',
  checker: {
    step: 1,
    category: 'phone',
    brand: '',
    model: '',
    presetId: null,
    issueId: 'screen',
    customIssue: '',
    age: '1-3',
    powersOn: 'yes',
    batteryCondition: 'normal',
    backupStatus: 'yes',
    diagnosisResult: null
  },
  library: {
    searchQuery: '',
    categoryFilter: 'all',
    difficultyFilter: 'all',
    activeGuide: null,
    activeGuideStep: 1,
    timerSeconds: 0,
    timerInterval: null
  },
  network: {
    searchQuery: '',
    specialtyFilter: 'all',
    verifiedOnly: false,
    selectedShop: null
  },
  lifecycle: {
    activePlatform: 'ios',
    activePath: 'donate',
    checklist: {
      accountUnlink: false,
      twoFactor: false,
      simRemoved: false,
      hardwareClean: false,
      passcodeRemoved: false
    }
  },
  impactCalc: {
    phones: 450,
    laptops: 280,
    tablets: 160,
    recycled: 120
  }
};

/**
 * Initialize Application
 */
function initApp() {
  setupNavigation();
  setupHashRouting();
  renderCheckerCategoryOptions();
  renderLibrary();
  renderNetwork();
  renderSanitizationOS('ios');
  updateImpactCalculator();

  // Attach event listeners for search and filters
  const libSearch = document.getElementById('library-search');
  if (libSearch) {
    libSearch.addEventListener('input', (e) => {
      state.library.searchQuery = e.target.value.toLowerCase();
      renderLibrary();
    });
  }

  const netSearch = document.getElementById('network-search');
  if (netSearch) {
    netSearch.addEventListener('input', (e) => {
      state.network.searchQuery = e.target.value.toLowerCase();
      renderNetwork();
    });
  }

  // Pre-load default state for checker
  selectCheckerCategory('phone');
  selectCheckerIssue('battery-degraded');
}

/**
 * Setup Navigation & URL hash synchronization
 */
function setupNavigation() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    switchTab(hash, false);
  });
}

function setupHashRouting() {
  const hash = window.location.hash.replace('#', '');
  if (hash && ['home', 'checker', 'library', 'network', 'lifecycle', 'about'].includes(hash)) {
    switchTab(hash, false);
  } else {
    switchTab('home', false);
  }
}

/**
 * Switch top-level tabs
 */
function switchTab(tabId, updateHash = true) {
  state.currentTab = tabId;

  // Update URL hash
  if (updateHash) {
    window.location.hash = tabId;
  }

  // Update tab visibility
  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.remove('active');
  });
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Update navigation button active styles
  document.querySelectorAll('.nav-link').forEach((link) => {
    const target = link.getAttribute('data-tab');
    if (target === tabId) {
      link.classList.add('active');
      link.classList.remove('text-brand-text', 'hover:bg-gray-100');
    } else {
      link.classList.remove('active');
      link.classList.add('text-brand-text', 'hover:bg-gray-100');
    }
  });

  // Mobile menu close
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
  }

  // Scroll to top of window smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchTab = switchTab;

/**
 * Mobile Navigation Drawer Toggle
 */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}
window.toggleMobileMenu = toggleMobileMenu;

/**
 * Toast Notification Service
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'alert') {
    toast.style.borderLeftColor = '#DC2626';
  } else if (type === 'success') {
    toast.style.borderLeftColor = '#B8F349';
  }

  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="font-mono text-xs text-lime-300 font-bold">[CIRCULAR]</span>
      <span class="text-xs sm:text-sm font-medium text-white">${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-white text-sm ml-2">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}
window.showToast = showToast;

/* ==========================================================================
   2. DEVICE CHECKER ENGINE (CORE DEMO)
   ========================================================================== */

function renderCheckerCategoryOptions() {
  const container = document.getElementById('checker-category-grid');
  if (!container) return;

  container.innerHTML = CIRCULAR_DATA.deviceCategories.map(cat => `
    <div onclick="selectCheckerCategory('${cat.id}')" 
         id="cat-card-${cat.id}"
         class="card-clean card-interactive p-4 sm:p-5 flex flex-col justify-between border ${state.checker.category === cat.id ? 'card-selected' : ''}">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="p-2 rounded-lg bg-emerald-100 text-brand-forest">
            ${getCategoryIconSvg(cat.id)}
          </span>
          <span class="badge-tech badge-neutral">${cat.id.toUpperCase()}</span>
        </div>
        <h4 class="font-bold text-base sm:text-lg text-brand-forest mb-1">${cat.name}</h4>
        <p class="text-xs text-gray-500 mb-3">${cat.desc}</p>
      </div>
      <div class="pt-2 border-t border-gray-100">
        <span class="text-[11px] font-mono text-gray-400">Common: ${cat.commonFailures[0]}</span>
      </div>
    </div>
  `).join('');
}

function getCategoryIconSvg(catId) {
  switch (catId) {
    case 'phone':
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    case 'laptop':
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>`;
    case 'tablet':
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    default:
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4l3 3"></path></svg>`;
  }
}

function selectCheckerCategory(catId) {
  state.checker.category = catId;
  document.querySelectorAll('[id^="cat-card-"]').forEach(card => {
    card.classList.remove('card-selected');
  });
  const active = document.getElementById(`cat-card-${catId}`);
  if (active) active.classList.add('card-selected');

  renderIssueOptions();
  renderPresetDeviceChips();
}
window.selectCheckerCategory = selectCheckerCategory;

function renderPresetDeviceChips() {
  const container = document.getElementById('preset-device-chips');
  if (!container) return;

  const relevant = CIRCULAR_DATA.presetDevices.filter(d => d.category === state.checker.category);
  container.innerHTML = `
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Demo Presets:</span>
      <span class="text-[11px] font-mono text-emerald-800">1-click specs load</span>
    </div>
    <div class="flex flex-wrap gap-2">
      ${relevant.map(d => `
        <button type="button" onclick="loadDevicePreset('${d.id}')"
          class="px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 text-xs font-medium text-brand-forest transition flex items-center gap-1.5 shadow-sm">
          <span>${d.model}</span>
          <span class="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1 rounded">${d.repairabilityScore}/10</span>
        </button>
      `).join('')}
    </div>
  `;
}

function loadDevicePreset(presetId) {
  const device = CIRCULAR_DATA.presetDevices.find(d => d.id === presetId);
  if (!device) return;

  state.checker.presetId = device.id;
  state.checker.brand = device.brand;
  state.checker.model = device.model;

  const brandInput = document.getElementById('checker-brand-input');
  const modelInput = document.getElementById('checker-model-input');
  if (brandInput) brandInput.value = device.brand;
  if (modelInput) modelInput.value = device.model;

  showToast(`Loaded ${device.model} specifications and repair metrics.`, 'success');
}
window.loadDevicePreset = loadDevicePreset;

function renderIssueOptions() {
  const container = document.getElementById('checker-issue-grid');
  if (!container) return;

  const cat = state.checker.category;
  const issues = CIRCULAR_DATA.issueTaxonomy.filter(i => i.categoryMatch.includes(cat));

  container.innerHTML = issues.map(iss => {
    const isCritical = iss.urgency === 'CRITICAL_SAFETY';
    return `
      <div onclick="selectCheckerIssue('${iss.id}')"
           id="issue-card-${iss.id}"
           class="card-clean card-interactive p-4 border flex flex-col justify-between ${state.checker.issueId === iss.id ? 'card-selected' : ''} ${isCritical ? 'border-amber-400 bg-amber-50/40' : ''}">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm text-brand-forest">${iss.label}</span>
            ${isCritical ? `<span class="badge-tech bg-red-100 text-red-700 border border-red-300">Safety Flag</span>` : ''}
          </div>
          <p class="text-xs text-gray-500 mb-2">${iss.typicalFix}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] font-mono text-gray-400">
          <span>Est. Parts: $${iss.partsEstimatedUsd[0]}–$${iss.partsEstimatedUsd[1]}</span>
          <span>DIY: ~${iss.diyTimeMins[0]}m</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectCheckerIssue(issueId) {
  state.checker.issueId = issueId;
  document.querySelectorAll('[id^="issue-card-"]').forEach(card => {
    card.classList.remove('card-selected');
  });
  const active = document.getElementById(`issue-card-${issueId}`);
  if (active) active.classList.add('card-selected');

  // Trigger safety banner preview if swollen battery selected
  if (issueId === 'battery-swollen') {
    state.checker.batteryCondition = 'swollen';
    showToast('ALERT: Swollen lithium cells require immediate thermal precautions.', 'alert');
  }
}
window.selectCheckerIssue = selectCheckerIssue;

function setCheckerStep(step) {
  // Validate before advancing
  if (step === 3) {
    const brandInput = document.getElementById('checker-brand-input');
    const modelInput = document.getElementById('checker-model-input');
    if (brandInput && brandInput.value) state.checker.brand = brandInput.value;
    if (modelInput && modelInput.value) state.checker.model = modelInput.value;

    if (!state.checker.model) {
      state.checker.model = `${state.checker.brand || 'Generic'} ${state.checker.category.toUpperCase()} Device`;
    }
  }

  if (step === 5) {
    runDiagnosticCalculation();
  }

  state.checker.step = step;

  // Toggle step view panels
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`checker-step-${i}`);
    if (el) {
      if (i === step) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  }

  // Update step indicators
  document.querySelectorAll('.checker-indicator').forEach((ind, index) => {
    const stepNum = index + 1;
    if (stepNum === step) {
      ind.classList.add('bg-brand-forest', 'text-white', 'border-brand-forest');
      ind.classList.remove('bg-gray-100', 'text-gray-500');
    } else if (stepNum < step) {
      ind.classList.add('bg-emerald-100', 'text-brand-forest', 'border-emerald-300');
      ind.classList.remove('bg-brand-forest', 'text-white', 'bg-gray-100', 'text-gray-500');
    } else {
      ind.classList.remove('bg-brand-forest', 'text-white', 'bg-emerald-100', 'border-emerald-300');
      ind.classList.add('bg-gray-100', 'text-gray-500');
    }
  });

  // Scroll to checker container smoothly
  const checkerContainer = document.getElementById('checker-card-main');
  if (checkerContainer) {
    checkerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.setCheckerStep = setCheckerStep;

/**
 * Diagnostic Calculation Engine
 */
function runDiagnosticCalculation() {
  const resultContainer = document.getElementById('checker-step-5');
  if (!resultContainer) return;

  // Show loading skeleton simulation briefly for realism
  resultContainer.innerHTML = `
    <div class="py-12 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-brand-forest rounded-full animate-spin"></div>
      <p class="font-mono text-sm text-brand-forest font-semibold">Triage engine executing hardware telemetry heuristics...</p>
      <p class="text-xs text-gray-500">Cross-referencing open repair schematics & component availability</p>
    </div>
  `;

  setTimeout(() => {
    buildDiagnosticReport();
  }, 450);
}

function buildDiagnosticReport() {
  const resultContainer = document.getElementById('checker-step-5');
  if (!resultContainer) return;

  const { category, brand, model, issueId, powersOn, batteryCondition, age } = state.checker;
  const issue = CIRCULAR_DATA.issueTaxonomy.find(i => i.id === issueId) || CIRCULAR_DATA.issueTaxonomy[0];
  const preset = CIRCULAR_DATA.presetDevices.find(d => d.id === state.checker.presetId);
  const isSwollen = batteryCondition === 'swollen' || issueId === 'battery-swollen';

  // Base score calculation
  let baseScore = preset ? preset.repairabilityScore : 7.2;
  if (issueId === 'screen') baseScore -= 0.5;
  if (issueId === 'liquid-ingress') baseScore -= 2.2;
  if (powersOn === 'no') baseScore -= 1.0;
  baseScore = Math.max(2.1, Math.min(10.0, parseFloat(baseScore.toFixed(1))));

  // Recommended Pathway determination
  let pathwayTitle = "RECOMMENDED: DIY REPAIR VIA OPEN SPEC";
  let pathwayBadge = "DIY Preferred";
  let pathwayDesc = "Component replacement is modular, documented, and requires only accessible standard tools.";
  let pathwayAction = "View Step-by-Step DIY Guide";
  let pathwayActionFn = "openMatchingGuide()";

  if (isSwollen) {
    pathwayTitle = "CRITICAL SAFETY: PROFESSIONAL HAZARD EXTRACTION";
    pathwayBadge = "Safety Advisory";
    pathwayDesc = "Swollen lithium pouches possess elevated thermal runaway risk. Do not compress, recharge, or puncture.";
    pathwayAction = "Find Certified Technician";
    pathwayActionFn = "findMatchingRepairer()";
  } else if (baseScore < 5.5 || issueId === 'liquid-ingress' || powersOn === 'no') {
    pathwayTitle = "RECOMMENDED: VETTED INDEPENDENT TECHNICIAN";
    pathwayBadge = "Professional Bench Needed";
    pathwayDesc = "Complex fault isolation, microsoldering, or delicate adhesive separation makes bench tools highly advisable.";
    pathwayAction = "Find Certified Repairer";
    pathwayActionFn = "findMatchingRepairer()";
  } else if (age === '5+' && powersOn === 'no') {
    pathwayTitle = "RECOMMENDED: DATA PURGE & SECONDARY REUSE / RECOVERY";
    pathwayBadge = "End of Useful Cycle";
    pathwayDesc = "Mainboard hardware has reached obsolescence ceiling; salvage functional peripherals and route core to certified R2 smelter.";
    pathwayAction = "Explore Second Life Pathways";
    pathwayActionFn = "switchTab('lifecycle')";
  }

  // Cost & Carbon estimates
  const partMin = issue.partsEstimatedUsd[0];
  const partMax = issue.partsEstimatedUsd[1];
  const buyNewCost = preset ? preset.avgNewPrice : (category === 'laptop' ? 1100 : 750);
  const moneySaved = buyNewCost - Math.round((partMin + partMax) / 2);

  const lca = CIRCULAR_DATA.impactFactors[category] || CIRCULAR_DATA.impactFactors.phone;
  const carbonAvoided = lca.manufacturingCo2Kg - lca.repairCo2Kg;

  const diagCode = `DIAG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  resultContainer.innerHTML = `
    <div class="space-y-8">
      
      <!-- Critical Swollen Battery Warning Banner (if applicable) -->
      ${isSwollen ? `
        <div class="p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-500 text-red-900 shadow-sm flex flex-col sm:flex-row items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-lg">!</div>
          <div class="flex-grow space-y-1">
            <h4 class="font-bold text-base text-red-950 flex items-center gap-2">
              CRITICAL BATTERY SAFETY WARNING — SWOLLEN CELL DETECTED
            </h4>
            <p class="text-xs sm:text-sm text-red-800 leading-relaxed">
              Your device shows signs of battery pouch gas delamination. <strong>Do NOT plug this device into AC power or apply pressure to the casing.</strong> Discharge the device passively in a fire-safe location (e.g., metal container or ceramic pot away from flammable items). We advise professional extraction rather than DIY prying.
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Top Overview Bar -->
      <div class="bg-brand-forest text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge-tech bg-brand-lime text-brand-forest font-bold">${pathwayBadge}</span>
            <span class="font-mono text-xs text-emerald-300">${diagCode}</span>
            <span class="text-[11px] text-gray-300 font-mono">Demo Telemetry</span>
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight">${model || 'Assessed Device'}</h3>
          <p class="text-xs text-gray-300 mt-1">Issue: ${issue.label} · Age: ${age} years · Boot Status: ${powersOn.toUpperCase()}</p>
        </div>
        <div class="flex items-center gap-4 bg-emerald-950/70 p-4 rounded-xl border border-emerald-800/80">
          <div class="text-center">
            <div class="text-xs uppercase tracking-wider font-bold text-emerald-300">Repairability Score</div>
            <div class="text-3xl font-extrabold text-brand-lime font-mono">${baseScore}<span class="text-base text-gray-300">/10</span></div>
            <div class="text-[10px] text-gray-300">${baseScore >= 7 ? 'High Modularity' : (baseScore >= 5 ? 'Moderate' : 'Challenging')}</div>
          </div>
        </div>
      </div>

      <!-- Recommendation Pathway Card -->
      <div class="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <span class="text-xs uppercase tracking-widest font-bold text-emerald-800">Primary Recommendation</span>
            <h4 class="text-xl font-bold text-brand-forest">${pathwayTitle}</h4>
          </div>
          <button onclick="${pathwayActionFn}" class="px-5 py-2.5 bg-brand-forest text-brand-lime font-semibold rounded-lg hover:bg-brand-forest-light transition text-sm shadow-sm flex items-center gap-2">
            <span>${pathwayAction}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
        <p class="text-sm text-gray-700 leading-relaxed">${pathwayDesc}</p>
      </div>

      <!-- Financial & Environmental Comparison Matrix -->
      <div class="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm">
        <h4 class="font-bold text-base text-brand-forest mb-4 flex items-center justify-between">
          <span>Repair vs Replacement Impact Analysis</span>
          <span class="badge-tech badge-neutral">Demo LCA Modeling</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">Financial Investment</div>
            <div class="text-xl font-bold text-brand-forest font-mono">$${partMin} – $${partMax}</div>
            <p class="text-xs text-emerald-700 mt-1 font-medium">Saves ~$${moneySaved} vs replacement ($${buyNewCost})</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">Embodied Carbon Averted</div>
            <div class="text-xl font-bold text-emerald-800 font-mono">~${carbonAvoided.toFixed(0)} kg CO₂e</div>
            <p class="text-xs text-gray-500 mt-1">Equivalent to driving ~240 km in a gas car</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">Estimated Turnaround</div>
            <div class="text-xl font-bold text-brand-forest font-mono">${issue.diyTimeMins[0]}–${issue.diyTimeMins[1]} mins</div>
            <p class="text-xs text-gray-500 mt-1">Local repair or DIY bench time</p>
          </div>
        </div>
      </div>

      <!-- Parts & Tools Checklist for this Sample Repair -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-5 rounded-2xl border border-gray-200 bg-white">
          <h5 class="font-bold text-sm text-brand-forest uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
            Recommended Tools Kit
          </h5>
          <ul class="text-xs text-gray-600 space-y-2">
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> Precision Bit Driver (${preset ? preset.fasteners : 'Phillips #00 & Pentalobe'})</li>
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> Anti-Static Nylon Spudger (ESD-safe)</li>
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> Suction Cup & Plastic Opening Picks</li>
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> 99% Isopropyl Alcohol (adhesive softening)</li>
          </ul>
        </div>
        <div class="p-5 rounded-2xl border border-gray-200 bg-white">
          <h5 class="font-bold text-sm text-brand-forest uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Replacement Parts Needed
          </h5>
          <ul class="text-xs text-gray-600 space-y-2">
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> 1x ${issue.typicalFix}</li>
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> 1x Pre-cut perimeter water-resistant gasket tape</li>
            <li class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-brand-forest"> Thermal barrier adhesive strips</li>
          </ul>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200">
        <button onclick="setCheckerStep(1)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
          &larr; Start New Assessment
        </button>
        <div class="flex items-center gap-3">
          <button onclick="printDiagnosis()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Print Report</span>
          </button>
          <button onclick="findMatchingRepairer()" class="px-5 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-semibold hover:bg-brand-forest/90 transition shadow-sm">
            Find Nearby Repairer
          </button>
        </div>
      </div>

    </div>
  `;
}

function openMatchingGuide() {
  const cat = state.checker.category;
  const guide = CIRCULAR_DATA.repairGuides.find(g => g.category === cat) || CIRCULAR_DATA.repairGuides[0];
  switchTab('library');
  setTimeout(() => {
    openGuideModal(guide.id);
  }, 100);
}
window.openMatchingGuide = openMatchingGuide;

function findMatchingRepairer() {
  switchTab('network');
  showToast('Filtered local technicians for your specific hardware platform.', 'info');
}
window.findMatchingRepairer = findMatchingRepairer;

function printDiagnosis() {
  window.print();
}
window.printDiagnosis = printDiagnosis;

/* ==========================================================================
   3. REPAIR LIBRARY (SEARCH, FILTERS & INTERACTIVE GUIDE READER)
   ========================================================================== */

function renderLibrary() {
  const container = document.getElementById('library-cards-grid');
  if (!container) return;

  const { searchQuery, categoryFilter, difficultyFilter } = state.library;

  const filtered = CIRCULAR_DATA.repairGuides.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(searchQuery) ||
                        g.device.toLowerCase().includes(searchQuery) ||
                        g.tools.some(t => t.toLowerCase().includes(searchQuery));
    const matchCat = categoryFilter === 'all' || g.category === categoryFilter;
    const matchDiff = difficultyFilter === 'all' || g.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchSearch && matchCat && matchDiff;
  });

  const countBadge = document.getElementById('library-count-badge');
  if (countBadge) countBadge.innerText = `${filtered.length} Guides Available`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
        <p class="text-sm text-gray-500 mb-2">No matching open repair guides found for your filter criteria.</p>
        <button onclick="resetLibraryFilters()" class="text-xs text-emerald-700 underline font-semibold">Reset search & filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(guide => `
    <div class="card-clean card-interactive p-6 flex flex-col justify-between" onclick="openGuideModal('${guide.id}')">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="badge-tech badge-lime">${guide.badge}</span>
          <span class="badge-tech badge-neutral">${guide.difficulty}</span>
        </div>
        <h4 class="font-bold text-lg text-brand-forest mb-2 leading-snug">${guide.title}</h4>
        <p class="text-xs text-gray-500 mb-4 font-mono">Hardware: ${guide.device}</p>
        <div class="flex items-center gap-4 text-xs text-gray-600 mb-4">
          <span class="flex items-center gap-1 font-mono">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${guide.timeEstimate}
          </span>
          <span class="flex items-center gap-1 font-mono">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            ${guide.tools.length} Tools
          </span>
          <span class="font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
            Score: ${guide.repairabilityScore}/10
          </span>
        </div>
      </div>
      <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-forest">
        <span>View teardown instructions</span>
        <span>&rarr;</span>
      </div>
    </div>
  `).join('');
}

function filterLibraryCategory(cat) {
  state.library.categoryFilter = cat;
  document.querySelectorAll('.lib-cat-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === cat) {
      btn.classList.add('bg-brand-forest', 'text-white');
      btn.classList.remove('bg-white', 'text-brand-forest');
    } else {
      btn.classList.remove('bg-brand-forest', 'text-white');
      btn.classList.add('bg-white', 'text-brand-forest');
    }
  });
  renderLibrary();
}
window.filterLibraryCategory = filterLibraryCategory;

function resetLibraryFilters() {
  state.library.searchQuery = '';
  state.library.categoryFilter = 'all';
  state.library.difficultyFilter = 'all';
  const input = document.getElementById('library-search');
  if (input) input.value = '';
  filterLibraryCategory('all');
}
window.resetLibraryFilters = resetLibraryFilters;

/**
 * Open Guide Modal & Interactive Step Tracker
 */
function openGuideModal(guideId) {
  const guide = CIRCULAR_DATA.repairGuides.find(g => g.id === guideId);
  if (!guide) return;

  state.library.activeGuide = guide;
  state.library.activeGuideStep = 1;

  const modal = document.getElementById('guide-modal');
  const content = document.getElementById('guide-modal-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-gray-200 pb-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="badge-tech badge-lime">${guide.badge}</span>
          <span class="badge-tech badge-neutral">${guide.difficulty}</span>
          <span class="badge-tech bg-emerald-100 text-emerald-900">Score: ${guide.repairabilityScore}/10</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-brand-forest">${guide.title}</h3>
        <p class="text-xs text-gray-500 font-mono mt-1">Hardware: ${guide.device} · Est. Duration: ${guide.timeEstimate}</p>
      </div>

      <!-- Safety Alert Box -->
      <div class="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg text-xs leading-relaxed">
        <strong>SAFETY NOTICE:</strong> ${guide.safetyWarning}
      </div>

      <!-- Exploded View Schematic Mockup -->
      <div class="schematic-box p-4 rounded-xl">
        <div class="flex justify-between items-center text-[10px] font-mono text-emerald-400 mb-2">
          <span>// OPEN_CAD_SCHEMATIC: ${guide.id.toUpperCase()}</span>
          <span>LAYER_FPC_REV2</span>
        </div>
        <div class="h-28 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center p-4 relative overflow-hidden">
          <div class="schematic-glow"></div>
          <div class="flex items-center gap-4 text-xs font-mono text-emerald-300 z-10">
            <div class="border border-emerald-500/50 p-2 rounded text-center">
              <span class="block font-bold">CHASSIS</span>
              <span class="text-[9px] text-gray-400">Torx/Pentalobe</span>
            </div>
            <span>&rarr;</span>
            <div class="border border-brand-lime p-2 rounded text-center bg-brand-forest">
              <span class="block font-bold text-brand-lime">LITHIUM MODULE</span>
              <span class="text-[9px] text-brand-lime/80">Discharge &lt; 25%</span>
            </div>
            <span>&rarr;</span>
            <div class="border border-emerald-500/50 p-2 rounded text-center">
              <span class="block font-bold">LOGIC PCB</span>
              <span class="text-[9px] text-gray-400">Disconnect DC Rail</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tools & Parts Lists -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h5 class="text-xs uppercase font-bold text-gray-500 mb-2">Required Tools</h5>
          <ul class="text-xs text-gray-700 space-y-1 list-disc list-inside">
            ${guide.tools.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h5 class="text-xs uppercase font-bold text-gray-500 mb-2">Replacement Parts Needed</h5>
          <ul class="text-xs text-gray-700 space-y-1 list-disc list-inside">
            ${guide.parts.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Step by step instructions with Checkmarks -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-base text-brand-forest">Step-by-Step Instructions</h4>
          <span class="text-xs font-mono text-emerald-800" id="steps-progress-counter">0 / ${guide.steps.length} completed</span>
        </div>
        <div class="space-y-3">
          ${guide.steps.map(step => `
            <div class="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition" id="guide-step-card-${step.num}">
              <div class="flex items-start gap-3">
                <input type="checkbox" onchange="toggleGuideStep(${step.num}, ${guide.steps.length})" class="mt-1 rounded text-brand-forest focus:ring-emerald-500 w-4 h-4">
                <div class="flex-grow">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono text-xs font-bold text-emerald-700">STEP 0${step.num}</span>
                    <h5 class="font-bold text-sm text-brand-forest">${step.title}</h5>
                  </div>
                  <p class="text-xs text-gray-600 leading-relaxed mb-2">${step.desc}</p>
                  <div class="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block">
                    PRO TIP: ${step.tip}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="pt-4 border-t border-gray-200 flex items-center justify-between">
        <span class="text-xs text-gray-400">Demo guide for evaluation purposes.</span>
        <button onclick="closeGuideModal()" class="px-5 py-2 bg-brand-forest text-white rounded-lg text-sm font-semibold hover:bg-brand-forest/90 transition">
          Done / Close Guide
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}
window.openGuideModal = openGuideModal;

function closeGuideModal() {
  const modal = document.getElementById('guide-modal');
  if (modal) modal.classList.add('hidden');
}
window.closeGuideModal = closeGuideModal;

function toggleGuideStep(stepNum, totalSteps) {
  const checkboxes = document.querySelectorAll('#guide-modal-content input[type="checkbox"]');
  let checkedCount = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) checkedCount++;
  });

  const counter = document.getElementById('steps-progress-counter');
  if (counter) counter.innerText = `${checkedCount} / ${totalSteps} completed`;

  if (checkedCount === totalSteps) {
    showToast('Congratulations! All teardown & installation steps completed.', 'success');
  }
}
window.toggleGuideStep = toggleGuideStep;

/* ==========================================================================
   4. REPAIR NETWORK (DIRECTORY, BOOKINGS & REGISTRATION)
   ========================================================================== */

function renderNetwork() {
  const container = document.getElementById('network-cards-grid');
  if (!container) return;

  const { searchQuery, specialtyFilter, verifiedOnly } = state.network;

  const filtered = CIRCULAR_DATA.repairDirectory.filter(shop => {
    const matchSearch = shop.name.toLowerCase().includes(searchQuery) ||
                        shop.city.toLowerCase().includes(searchQuery) ||
                        shop.specialty.some(s => s.toLowerCase().includes(searchQuery));
    const matchSpecialty = specialtyFilter === 'all' || shop.specialty.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
    const matchVerified = !verifiedOnly || shop.verified;
    return matchSearch && matchSpecialty && matchVerified;
  });

  const countBadge = document.getElementById('network-count-badge');
  if (countBadge) countBadge.innerText = `${filtered.length} Vetted Workshops`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
        <p class="text-sm text-gray-500 mb-2">No repair workshops match your filter criteria.</p>
        <button onclick="resetNetworkFilters()" class="text-xs text-emerald-700 underline font-semibold">Reset filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(shop => `
    <div class="card-clean p-6 flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-3">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-lg text-brand-forest">${shop.name}</h4>
              ${shop.verified ? `<span class="badge-tech badge-lime" title="Verified Repair Provider">Verified</span>` : ''}
            </div>
            <p class="text-xs text-gray-500 font-mono mt-0.5">${shop.city} · ${shop.distance}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded font-mono">★ ${shop.rating}</span>
            <span class="block text-[10px] text-gray-400 mt-0.5">(${shop.reviewCount} reviews)</span>
          </div>
        </div>

        <p class="text-xs text-gray-600 mb-4 leading-relaxed">${shop.bio}</p>

        <!-- Specialties Tags -->
        <div class="flex flex-wrap gap-1.5 mb-4">
          ${shop.specialty.map(s => `<span class="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">${s}</span>`).join('')}
        </div>

        <!-- Indicative Pricing & Turnaround -->
        <div class="p-3 bg-gray-50 rounded-lg text-xs space-y-1 mb-4 border border-gray-100">
          <div class="flex justify-between">
            <span class="text-gray-500">Indicative Pricing:</span>
            <span class="font-mono font-medium text-brand-forest">${shop.pricingLevel}</span>
          </div>
          <div class="text-[11px] text-gray-500 font-mono">${shop.indicativePricing}</div>
          <div class="flex justify-between pt-1 border-t border-gray-200">
            <span class="text-gray-500">Avg Turnaround:</span>
            <span class="font-semibold text-emerald-800 font-mono">${shop.turnaround}</span>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <a href="mailto:${shop.email}" class="text-xs font-mono text-gray-500 hover:text-brand-forest truncate">
          ${shop.email}
        </a>
        <button onclick="openBookingModal('${shop.id}')" class="px-4 py-2 bg-brand-forest text-brand-lime text-xs font-semibold rounded-lg hover:bg-brand-forest/90 transition shadow-sm whitespace-nowrap">
          Inquire / Book
        </button>
      </div>
    </div>
  `).join('');
}

function filterNetworkSpecialty(spec) {
  state.network.specialtyFilter = spec;
  document.querySelectorAll('.net-spec-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === spec) {
      btn.classList.add('bg-brand-forest', 'text-white');
      btn.classList.remove('bg-white', 'text-brand-forest');
    } else {
      btn.classList.remove('bg-brand-forest', 'text-white');
      btn.classList.add('bg-white', 'text-brand-forest');
    }
  });
  renderNetwork();
}
window.filterNetworkSpecialty = filterNetworkSpecialty;

function toggleVerifiedOnly() {
  state.network.verifiedOnly = !state.network.verifiedOnly;
  const btn = document.getElementById('btn-verified-toggle');
  if (btn) {
    if (state.network.verifiedOnly) {
      btn.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-900');
    } else {
      btn.classList.remove('bg-emerald-100', 'border-emerald-500', 'text-emerald-900');
    }
  }
  renderNetwork();
}
window.toggleVerifiedOnly = toggleVerifiedOnly;

function resetNetworkFilters() {
  state.network.searchQuery = '';
  state.network.specialtyFilter = 'all';
  state.network.verifiedOnly = false;
  const input = document.getElementById('network-search');
  if (input) input.value = '';
  filterNetworkSpecialty('all');
}
window.resetNetworkFilters = resetNetworkFilters;

function openBookingModal(shopId) {
  const shop = CIRCULAR_DATA.repairDirectory.find(s => s.id === shopId);
  if (!shop) return;

  state.network.selectedShop = shop;
  const modal = document.getElementById('booking-modal');
  const content = document.getElementById('booking-modal-content');
  if (!modal || !content) return;

  const currentDevice = state.checker.model || 'Assessed Device';
  const currentIssue = CIRCULAR_DATA.issueTaxonomy.find(i => i.id === state.checker.issueId)?.label || 'Hardware Assessment';

  content.innerHTML = `
    <div class="space-y-4">
      <div>
        <span class="badge-tech badge-lime mb-1">Direct Workshop Dispatch</span>
        <h3 class="text-xl font-bold text-brand-forest">Book Service Inquiry with ${shop.name}</h3>
        <p class="text-xs text-gray-500 font-mono">${shop.city} · Certified: ${shop.certifications.join(', ')}</p>
      </div>

      <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-brand-forest space-y-1">
        <div class="font-bold">Attached Device Telemetry:</div>
        <div class="font-mono">Device: ${currentDevice}</div>
        <div class="font-mono">Symptom: ${currentIssue}</div>
      </div>

      <form onsubmit="submitBookingInquiry(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name</label>
          <input type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Alex Morgan">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Email / Phone</label>
          <input type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="alex@example.com">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Repair Notes or Preferred Date</label>
          <textarea rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Screen cracked along lower right corner; touch still registers..."></textarea>
        </div>
        <div class="pt-2 flex justify-end gap-2">
          <button type="button" onclick="closeBookingModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-brand-forest text-brand-lime font-bold rounded-lg text-sm hover:bg-brand-forest/90">
            Submit Inquiry
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}
window.openBookingModal = openBookingModal;

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('hidden');
}
window.closeBookingModal = closeBookingModal;

function submitBookingInquiry(e) {
  e.preventDefault();
  closeBookingModal();
  const ticketId = `TICKET-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  showToast(`Inquiry dispatched to ${state.network.selectedShop?.name}! Confirmation ID: ${ticketId}`, 'success');
}
window.submitBookingInquiry = submitBookingInquiry;

/**
 * Register New Repair Service Modal
 */
function openRegisterShopModal() {
  const modal = document.getElementById('register-shop-modal');
  if (modal) modal.classList.remove('hidden');
}
window.openRegisterShopModal = openRegisterShopModal;

function closeRegisterShopModal() {
  const modal = document.getElementById('register-shop-modal');
  if (modal) modal.classList.add('hidden');
}
window.closeRegisterShopModal = closeRegisterShopModal;

function submitRegisterShop(e) {
  e.preventDefault();
  const name = document.getElementById('reg-shop-name').value;
  const city = document.getElementById('reg-shop-city').value;
  const spec = document.getElementById('reg-shop-specialty').value;

  closeRegisterShopModal();
  const regCode = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  showToast(`Application received for ${name} (${city})! Pending review: ${regCode}`, 'success');
}
window.submitRegisterShop = submitRegisterShop;

/* ==========================================================================
   5. SECOND LIFE & SECURE SANITIZATION
   ========================================================================== */

function switchLifecyclePath(path) {
  state.lifecycle.activePath = path;
  document.querySelectorAll('.lifecycle-path-btn').forEach(btn => {
    if (btn.getAttribute('data-path') === path) {
      btn.classList.add('bg-brand-forest', 'text-white');
      btn.classList.remove('bg-white', 'text-brand-forest');
    } else {
      btn.classList.remove('bg-brand-forest', 'text-white');
      btn.classList.add('bg-white', 'text-brand-forest');
    }
  });

  const descriptions = {
    donate: {
      title: "Donate to Students & Community Digital Equity",
      text: "Functional devices (even older dual-core systems) can provide invaluable digital access for coding, schoolwork, and civic tasks when wiped and running lightweight Linux or ChromeOS Flex."
    },
    sell: {
      title: "Trade-in or Resell for Hardware Residual Value",
      text: "Devices under 4 years old retain considerable secondary market value. Selling directly to repairers or through circular refurbishers keeps devices out of municipal landfills."
    },
    refurbish: {
      title: "Repurpose into Dedicated Secondary Nodes",
      text: "An old smartphone makes an exceptional low-power octoprint 3D printer monitor or home security camera. An old laptop makes a silent, battery-backed Home Assistant or media server."
    },
    recycle: {
      title: "Responsible E-Waste Recovery (Certified Smelting of Last Resort)",
      text: "When a motherboard SoC is fried or physically shattered, certified R2v3 and e-Stewards refiners extract gold, copper, cobalt, and rare earths without illegal transboundary dumping."
    }
  };

  const infoEl = document.getElementById('lifecycle-path-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <h4 class="text-xl font-bold text-brand-forest mb-2">${descriptions[path].title}</h4>
      <p class="text-sm text-gray-700 leading-relaxed">${descriptions[path].text}</p>
    `;
  }
}
window.switchLifecyclePath = switchLifecyclePath;

function renderSanitizationOS(osId) {
  state.lifecycle.activePlatform = osId;
  const container = document.getElementById('sanitization-steps-container');
  if (!container) return;

  document.querySelectorAll('.os-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-os') === osId) {
      btn.classList.add('border-brand-forest', 'bg-emerald-50', 'text-brand-forest');
      btn.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
    } else {
      btn.classList.remove('border-brand-forest', 'bg-emerald-50', 'text-brand-forest');
      btn.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
    }
  });

  const osData = CIRCULAR_DATA.sanitizationOS.find(o => o.id === osId) || CIRCULAR_DATA.sanitizationOS[0];

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-gray-200">
        <h5 class="font-bold text-sm uppercase tracking-wider text-brand-forest">${osData.name} Sanitization Protocol</h5>
        <span class="badge-tech badge-lime">NIST 800-88 Compliant</span>
      </div>
      <div class="space-y-3">
        ${osData.steps.map((st, i) => `
          <div class="p-3.5 rounded-xl border border-gray-200 bg-white">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-5 h-5 rounded-full bg-brand-forest text-white font-mono text-xs flex items-center justify-center font-bold">${i + 1}</span>
              <span class="font-bold text-sm text-brand-forest">${st.title}</span>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed pl-7">${st.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
window.renderSanitizationOS = renderSanitizationOS;

function toggleHandoffCheck(itemKey) {
  state.lifecycle.checklist[itemKey] = !state.lifecycle.checklist[itemKey];
}
window.toggleHandoffCheck = toggleHandoffCheck;

function generateHandoffCert() {
  const allChecked = Object.values(state.lifecycle.checklist).every(Boolean);
  if (!allChecked) {
    showToast('Notice: Some sanitization items remain unconfirmed.', 'alert');
  }
  showToast('Hardware Data Sanitization Certificate exported to printer view.', 'success');
  window.print();
}
window.generateHandoffCert = generateHandoffCert;

function searchDropOffCenters() {
  const query = document.getElementById('dropoff-query-input')?.value || 'local';
  const container = document.getElementById('dropoff-results-container');
  if (!container) return;

  container.innerHTML = CIRCULAR_DATA.dropOffLocations.map(loc => `
    <div class="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
      <div class="flex justify-between items-start">
        <h5 class="font-bold text-sm text-brand-forest">${loc.name}</h5>
        <span class="badge-tech badge-lime">${loc.certification}</span>
      </div>
      <p class="text-xs text-gray-500 font-mono">${loc.address} · ${loc.distance}</p>
      <div class="text-[11px] text-gray-600">
        <strong>Accepted:</strong> ${loc.accepted.join(', ')}
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
        <span class="font-mono text-gray-400">${loc.hours}</span>
        <a href="tel:${loc.phone}" class="font-bold text-emerald-800 hover:underline">${loc.phone}</a>
      </div>
    </div>
  `).join('');

  showToast(`Located 3 certified R2v3 / e-Stewards drop-off stations near "${query}".`, 'success');
}
window.searchDropOffCenters = searchDropOffCenters;

/* ==========================================================================
   6. IMPACT CALCULATOR & ABOUT BRIEF
   ========================================================================== */

function updateImpactCalculator() {
  const phoneSlider = document.getElementById('calc-phones');
  const laptopSlider = document.getElementById('calc-laptops');
  const tabletSlider = document.getElementById('calc-tablets');
  const recycleSlider = document.getElementById('calc-recycled');

  if (phoneSlider) state.impactCalc.phones = parseInt(phoneSlider.value);
  if (laptopSlider) state.impactCalc.laptops = parseInt(laptopSlider.value);
  if (tabletSlider) state.impactCalc.tablets = parseInt(tabletSlider.value);
  if (recycleSlider) state.impactCalc.recycled = parseInt(recycleSlider.value);

  // Update slider value labels
  const pLabel = document.getElementById('calc-phones-val');
  const lLabel = document.getElementById('calc-laptops-val');
  const tLabel = document.getElementById('calc-tablets-val');
  const rLabel = document.getElementById('calc-recycled-val');

  if (pLabel) pLabel.innerText = state.impactCalc.phones;
  if (lLabel) lLabel.innerText = state.impactCalc.laptops;
  if (tLabel) tLabel.innerText = state.impactCalc.tablets;
  if (rLabel) rLabel.innerText = state.impactCalc.recycled;

  // Perform Calculations based on LCA factors
  const { phone, laptop, tablet } = CIRCULAR_DATA.impactFactors;

  const co2AvoidedKg = 
    (state.impactCalc.phones * (phone.manufacturingCo2Kg - phone.repairCo2Kg)) +
    (state.impactCalc.laptops * (laptop.manufacturingCo2Kg - laptop.repairCo2Kg)) +
    (state.impactCalc.tablets * (tablet.manufacturingCo2Kg - tablet.repairCo2Kg)) +
    (state.impactCalc.recycled * 14); // rough smelting carbon credit

  const co2AvoidedMetricTons = (co2AvoidedKg / 1000).toFixed(1);

  const ewasteKg = (
    (state.impactCalc.phones * phone.ewasteGrams) +
    (state.impactCalc.laptops * laptop.ewasteGrams) +
    (state.impactCalc.tablets * tablet.ewasteGrams)
  ) / 1000;

  const cobaltKg = (
    (state.impactCalc.phones * phone.cobaltGrams) +
    (state.impactCalc.laptops * laptop.cobaltGrams) +
    (state.impactCalc.tablets * tablet.cobaltGrams)
  ) / 1000;

  const goldGrams = (
    (state.impactCalc.phones * phone.goldMg) +
    (state.impactCalc.laptops * laptop.goldMg) +
    (state.impactCalc.tablets * tablet.goldMg)
  ) / 1000;

  const dollarsSaved = (
    (state.impactCalc.phones * phone.avgRepairSavingsUsd) +
    (state.impactCalc.laptops * laptop.avgRepairSavingsUsd) +
    (state.impactCalc.tablets * tablet.avgRepairSavingsUsd)
  ).toLocaleString();

  // Update DOM displays
  const co2El = document.getElementById('metric-co2');
  const ewasteEl = document.getElementById('metric-ewaste');
  const cobaltEl = document.getElementById('metric-cobalt');
  const goldEl = document.getElementById('metric-gold');
  const dollarsEl = document.getElementById('metric-dollars');

  if (co2El) co2El.innerText = `${co2AvoidedMetricTons} MT`;
  if (ewasteEl) ewasteEl.innerText = `${ewasteKg.toFixed(0)} kg`;
  if (cobaltEl) cobaltEl.innerText = `${cobaltKg.toFixed(1)} kg`;
  if (goldEl) goldEl.innerText = `${goldGrams.toFixed(1)} g`;
  if (dollarsEl) dollarsEl.innerText = `$${dollarsSaved}`;
}
window.updateImpactCalculator = updateImpactCalculator;

/* ==========================================================================
   7. JUDGE DEMO QUICK TOUR ACCELERATORS
   ========================================================================== */

function runJudgeDemo(mode) {
  switch (mode) {
    case 'phone-battery':
      switchTab('checker');
      selectCheckerCategory('phone');
      loadDevicePreset('iphone-13-pro');
      selectCheckerIssue('battery-degraded');
      setCheckerStep(5);
      showToast('Loaded Phone Battery Triage Demo directly to diagnosis results!', 'success');
      break;

    case 'swollen-battery':
      switchTab('checker');
      selectCheckerCategory('phone');
      loadDevicePreset('galaxy-s22');
      selectCheckerIssue('battery-swollen');
      state.checker.batteryCondition = 'swollen';
      setCheckerStep(5);
      showToast('Triggered Swollen Battery Critical Hazard Warning state!', 'alert');
      break;

    case 'laptop-thermal':
      switchTab('checker');
      selectCheckerCategory('laptop');
      loadDevicePreset('thinkpad-t480');
      selectCheckerIssue('overheating-slow');
      setCheckerStep(5);
      showToast('Loaded ThinkPad T480 Thermal Triage demo with 9.3/10 modularity!', 'success');
      break;

    case 'teardown-guide':
      switchTab('library');
      openGuideModal('guide-thinkpad-repaste');
      showToast('Opened ThinkPad Dual Heatpipe Repaste Teardown Specimen.', 'success');
      break;

    case 'impact-calculator':
      switchTab('about');
      const calcSection = document.getElementById('impact-calculator-section');
      if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });
      showToast('Jumped to Live Circular Economy LCA Calculator.', 'info');
      break;

    case 'judge-pitch':
      switchTab('about');
      const pitchSection = document.getElementById('judge-pitch-section');
      if (pitchSection) pitchSection.scrollIntoView({ behavior: 'smooth' });
      showToast('Jumped to CEDA-EPS Challenge Brief & Feasibility Pitch.', 'info');
      break;

    default:
      switchTab('home');
  }
}
window.runJudgeDemo = runJudgeDemo;

/**
 * Circular Journey Node Inspector on Home
 */
function inspectJourneyNode(nodeIndex) {
  document.querySelectorAll('.journey-node').forEach((node, i) => {
    if (i === nodeIndex) {
      node.classList.add('active-stage');
    } else {
      node.classList.remove('active-stage');
    }
  });

  const details = [
    {
      title: "01. TELEMETRY DIAGNOSTICS",
      desc: "Instant symptom-to-component mapping cross-referencing repairability scores, common point-of-failure databases, and proprietary lockout traps."
    },
    {
      title: "02. COMMUNITY REPAIR",
      desc: "Open hardware schematics, screw fastener sizing (P2, Torx, Phillips), ESD guidance, and verified independent workshop routing."
    },
    {
      title: "03. FUNCTIONAL SECOND LIFE",
      desc: "NIST 800-88 cryptographic sanitization workflows, unlinking cloud locks, and donating to community digital equity programs."
    },
    {
      title: "04. CERTIFIED MATERIAL RECOVERY",
      desc: "Certified R2v3 and e-Stewards smelters recover high-purity gold, cobalt, and lithium when board-level silicon is non-viable."
    }
  ];

  const detailEl = document.getElementById('journey-stage-detail');
  if (detailEl) {
    detailEl.innerHTML = `
      <div class="font-mono text-xs text-brand-lime font-bold mb-1">${details[nodeIndex].title}</div>
      <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">${details[nodeIndex].desc}</p>
    `;
  }
}
window.inspectJourneyNode = inspectJourneyNode;
