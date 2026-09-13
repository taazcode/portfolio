/* ══════════════════════════════════════════════════════════
   CYBER-NEXUS ADMIN DASHBOARD — app.js
   Hidden admin panel for managing stats, projects, and skills.
   Data persists in localStorage.
   ══════════════════════════════════════════════════════════ */

// ── SUPABASE CONFIGURATION (.env Loader) ───────────────────
let SUPABASE_URL = 'https://jmlspukljchjexssbbpv.supabase.co';
let SUPABASE_ANON_KEY = '';
let supabaseClient = null;

async function initSupabase() {
  try {
    const res = await fetch('.env');
    if (res.ok) {
      const text = await res.text();
      text.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          if (key === 'SUPABASE_URL' && val) SUPABASE_URL = val;
          if ((key === 'SUPABASE_ANON_KEY' || key === 'supabse_anon_APIKEY' || key === 'SUPABASE_ANON_APIKEY') && val) {
            SUPABASE_ANON_KEY = val;
          }
        }
      });
    }
  } catch (e) {
    // Fallback if fetch fails (e.g. file:// protocol)
  }

  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✓ Supabase Client Initialized via .env');
      if (typeof renderAdminGuild === 'function') renderAdminGuild();
    } catch (err) {
      console.warn('Supabase initialization warning:', err);
    }
  }
}

// Trigger initialization on load
initSupabase();

// Helper function to compute SHA-256 hash using native Web Crypto API
async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── DEFAULT DATA ──────────────────────────────────────────
const DEFAULT_DATA = {
  stats: [
    { id: 's1', label: 'DSA PROBLEMS SOLVED', value: '150+' },
    { id: 's2', label: 'PROJECTS BUILT', value: '05' },
    { id: 's3', label: 'TECH AREAS EXPLORED', value: '06' },
    { id: 's4', label: 'SYSTEM UPTIME', value: '99.9%' }
  ],
  projects: [
    {
      id: 'p1', name: 'StoreBill Management', icon: '🏪', rarity: 'FULL-STACK', rarityClass: 'rarity-epic', bgClass: 'epic-bg',
      desc: 'Cloud-powered billing system featuring Supabase integration, real-time data sync, and dynamic PDF report generation.',
      tags: ['SUPABASE', 'JS', 'jspdf'], source: 'SOURCE: bills/'
    },
    {
      id: 'p2', name: 'Expense Tracker GUI', icon: '💰', rarity: 'DESKTOP', rarityClass: 'rarity-rare', bgClass: 'rare-bg',
      desc: 'Python-based financial manager with a Tkinter GUI. Features local data persistence, category filtering, and budget analysis.',
      tags: ['PYTHON', 'TKINTER'], source: 'SOURCE: py/'
    },
    {
      id: 'p3', name: 'Student Admin Sys', icon: '🎓', rarity: 'SYSTEMS', rarityClass: 'rarity-epic', bgClass: 'common-bg',
      desc: 'Data-driven academic management system implementing CRUD operations and linear search algorithms for record handling.',
      tags: ['PYTHON', 'CRUD'], source: 'SOURCE: py/'
    },
    {
      id: 'p4', name: 'Performance To-Do', icon: '⚙', rarity: 'SYSTEMS', rarityClass: 'rarity-common', bgClass: 'epic-bg',
      desc: 'Low-level task manager built in C. Focuses on efficient file I/O operations and robust memory-efficient data structures.',
      tags: ['C', 'FILE_IO'], source: 'SOURCE: c prog/'
    }
  ],
  skills: [
    { id: 'sk1', name: 'C / C++ / PYTHON', mastery: 75, color: 'cyan' },
    { id: 'sk2', name: 'LINUX & NETWORKING', mastery: 40, color: 'cyan' },
    { id: 'sk3', name: 'GCP CLOUD', mastery: 50, color: 'purple' },
    { id: 'sk4', name: 'CYBERSECURITY BASICS', mastery: 30, color: 'purple' }
  ],
  guild: [
    { id: 'g1', email: 'alex.v@cyber.io', date: '2026-09-10 14:32' },
    { id: 'g2', email: 'dev_runner@nexus.net', date: '2026-09-12 09:15' }
  ]
};

// ── SKILL ICON SVGs ──────────────────────────────────────
const SKILL_SVGS = {
  cyan: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M7 8l-4 6 4 6M21 8l4 6-4 6M16 5l-4 18" stroke="#4cd7f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  purple: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 4C9 4 5 8 5 13c0 3.9 2.4 7.2 5.8 8.6L14 24l3.2-2.4C20.6 20.2 23 16.9 23 13c0-5-4-9-9-9z" stroke="#ddb7ff" stroke-width="1.5"/>
  </svg>`
};

// ── DATA LAYER ────────────────────────────────────────────
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();

// ── RENDER FUNCTIONS ──────────────────────────────────────
function renderStats() {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;
  grid.innerHTML = appData.stats.map(s => `
    <div class="stat-item">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
    </div>
  `).join('');
}

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = appData.projects.map(p => `
    <div class="quest-card" data-id="${p.id}">
      <div class="quest-img">
        <div class="quest-img-bg ${p.bgClass}">
          <div class="quest-img-decoration">${p.icon}</div>
        </div>
        <span class="quest-rarity ${p.rarityClass}">${p.rarity}</span>
      </div>
      <div class="quest-body">
        <div class="quest-name">${p.name}</div>
        <div class="quest-desc">${p.desc}</div>
        <div class="quest-footer">
          <div class="quest-tags">
            ${p.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
          <span class="quest-xp">${p.source}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = appData.skills.map(s => `
    <div class="skill-item" data-id="${s.id}">
      <div class="skill-icon">${SKILL_SVGS[s.color] || SKILL_SVGS.cyan}</div>
      <span class="skill-name">${s.name}</span>
      <span class="skill-mastery ${s.color}">Mastery: ${s.mastery}%</span>
    </div>
  `).join('');
}

function renderAll() {
  renderStats();
  renderProjects();
  renderSkills();
}

// ── ADMIN PANEL RENDER ────────────────────────────────────
function renderAdminStats() {
  const c = document.getElementById('admin-stats-list');
  if (!c) return;
  c.innerHTML = appData.stats.map(s => `
    <div class="adm-stat-row">
      <span class="adm-stat-label">${s.label}</span>
      <div class="adm-stat-controls">
        <button class="adm-btn-sm" onclick="adjustStat('${s.id}', -1)">−</button>
        <input class="adm-stat-input" value="${s.value}" onchange="setStatValue('${s.id}', this.value)">
        <button class="adm-btn-sm" onclick="adjustStat('${s.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function renderAdminProjects() {
  const c = document.getElementById('admin-projects-list');
  if (!c) return;
  c.innerHTML = appData.projects.map(p => `
    <div class="adm-project-row">
      <span class="adm-project-icon">${p.icon}</span>
      <div class="adm-project-info">
        <strong>${p.name}</strong>
        <span class="adm-project-tags">${p.tags.join(', ')}</span>
      </div>
      <button class="adm-btn-delete" onclick="deleteProject('${p.id}')">✕</button>
    </div>
  `).join('');
}

function renderAdminSkills() {
  const c = document.getElementById('admin-skills-list');
  if (!c) return;
  c.innerHTML = appData.skills.map(s => `
    <div class="adm-skill-row">
      <span class="adm-skill-name">${s.name}</span>
      <div class="adm-stat-controls">
        <button class="adm-btn-sm" onclick="adjustMastery('${s.id}', -5)">−</button>
        <span class="adm-mastery-val">${s.mastery}%</span>
        <button class="adm-btn-sm" onclick="adjustMastery('${s.id}', 5)">+</button>
      </div>
      <button class="adm-btn-delete" onclick="deleteSkill('${s.id}')">✕</button>
    </div>
  `).join('');
}

async function renderAdminGuild() {
  const c = document.getElementById('admin-guild-list');
  const countSpan = document.getElementById('adm-guild-count');
  if (!appData.guild) appData.guild = [];

  // Fetch from Supabase if configured
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('guild_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        appData.guild = data.map(item => ({
          id: item.id,
          email: item.email,
          date: item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) + ' ' + new Date(item.created_at).toTimeString().slice(0, 5) : 'Recently'
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, fallback to local storage:', e);
    }
  }

  if (countSpan) countSpan.textContent = appData.guild.length;
  if (!c) return;
  if (appData.guild.length === 0) {
    c.innerHTML = `<div class="adm-empty">No enlisted players yet.</div>`;
    return;
  }
  c.innerHTML = appData.guild.map(g => `
    <div class="adm-guild-row">
      <div class="adm-guild-info">
        <strong class="adm-guild-email">${g.email}</strong>
        <span class="adm-guild-date">${g.date || 'Recently'}</span>
      </div>
      <button class="adm-btn-delete" title="Remove player" onclick="deleteGuildSubscriber('${g.id}')">✕</button>
    </div>
  `).join('');
}

async function enlistPlayer(email) {
  if (!email) return;
  if (!appData.guild) appData.guild = [];
  const exists = appData.guild.some(g => g.email.toLowerCase() === email.toLowerCase());
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

  if (!exists) {
    appData.guild.unshift({
      id: 'g' + Date.now(),
      email: email,
      date: dateStr
    });
    saveData(appData);
  }

  // Sync to Supabase if configured
  if (supabaseClient) {
    try {
      await supabaseClient.from('guild_subscribers').insert([{ email }]);
    } catch (err) {
      console.warn('Supabase insert error:', err);
    }
  }

  renderAdminGuild();
}

async function deleteGuildSubscriber(id) {
  if (!appData.guild) return;

  if (supabaseClient && typeof id === 'string' && id.includes('-')) {
    try {
      await supabaseClient.from('guild_subscribers').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  appData.guild = appData.guild.filter(g => g.id !== id);
  saveData(appData);
  renderAdminGuild();
}

function clearGuildSubscribers() {
  if (confirm('Clear all enlisted players from the log?')) {
    appData.guild = [];
    saveData(appData);
    renderAdminGuild();
  }
}

function renderAdminAll() {
  renderAdminStats();
  renderAdminProjects();
  renderAdminSkills();
  renderAdminGuild();
}

// ── ADMIN ACTIONS ─────────────────────────────────────────
function adjustStat(id, delta) {
  const s = appData.stats.find(x => x.id === id);
  if (!s) return;
  // Try to parse numeric part
  const num = parseInt(s.value.replace(/[^0-9]/g, ''));
  if (!isNaN(num)) {
    const suffix = s.value.replace(/[0-9]/g, '');
    s.value = (num + delta) + suffix;
  }
  saveData(appData);
  renderAll();
  renderAdminStats();
}

function setStatValue(id, val) {
  const s = appData.stats.find(x => x.id === id);
  if (!s) return;
  s.value = val;
  saveData(appData);
  renderAll();
}

function deleteProject(id) {
  appData.projects = appData.projects.filter(p => p.id !== id);
  saveData(appData);
  renderAll();
  renderAdminProjects();
}

function addProject() {
  const name = document.getElementById('adm-proj-name').value.trim();
  const icon = document.getElementById('adm-proj-icon').value.trim() || '📦';
  const desc = document.getElementById('adm-proj-desc').value.trim();
  const tags = document.getElementById('adm-proj-tags').value.trim().split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  const rarity = document.getElementById('adm-proj-rarity').value;
  const source = document.getElementById('adm-proj-source').value.trim();

  if (!name || !desc) return;

  const rarityMap = { 'FULL-STACK': 'rarity-epic', 'DESKTOP': 'rarity-rare', 'SYSTEMS': 'rarity-common', 'WEB': 'rarity-epic' };
  const bgMap = { 'FULL-STACK': 'epic-bg', 'DESKTOP': 'rare-bg', 'SYSTEMS': 'common-bg', 'WEB': 'epic-bg' };

  appData.projects.push({
    id: 'p' + Date.now(),
    name, icon, rarity,
    rarityClass: rarityMap[rarity] || 'rarity-common',
    bgClass: bgMap[rarity] || 'common-bg',
    desc, tags,
    source: source ? `SOURCE: ${source}` : ''
  });

  saveData(appData);
  renderAll();
  renderAdminProjects();

  // Clear form
  ['adm-proj-name', 'adm-proj-icon', 'adm-proj-desc', 'adm-proj-tags', 'adm-proj-source'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function deleteSkill(id) {
  appData.skills = appData.skills.filter(s => s.id !== id);
  saveData(appData);
  renderAll();
  renderAdminSkills();
}

function adjustMastery(id, delta) {
  const s = appData.skills.find(x => x.id === id);
  if (!s) return;
  s.mastery = Math.max(0, Math.min(100, s.mastery + delta));
  saveData(appData);
  renderAll();
  renderAdminSkills();
}

function addSkill() {
  const name = document.getElementById('adm-skill-name').value.trim().toUpperCase();
  const mastery = parseInt(document.getElementById('adm-skill-mastery').value) || 50;
  const color = document.getElementById('adm-skill-color').value;

  if (!name) return;

  appData.skills.push({
    id: 'sk' + Date.now(),
    name, mastery: Math.max(0, Math.min(100, mastery)), color
  });

  saveData(appData);
  renderAll();
  renderAdminSkills();

  document.getElementById('adm-skill-name').value = '';
  document.getElementById('adm-skill-mastery').value = '50';
}

// ── ADMIN MODAL LOGIC ─────────────────────────────────────
let adminUnlocked = false;
let clickCount = 0;
let clickTimer = null;

function initAdminTrigger() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;

  logo.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 800);

    if (clickCount >= 5) {
      clickCount = 0;
      openAdminModal();
    }
  });
}

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (adminUnlocked) {
    showAdminDashboard();
  } else {
    showAdminLogin();
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.add('hidden');
}

function showAdminLogin() {
  document.getElementById('admin-login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard-screen').classList.add('hidden');
  document.getElementById('admin-pw').value = '';
  document.getElementById('admin-pw-error').classList.add('hidden');
}

function showAdminDashboard() {
  document.getElementById('admin-login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard-screen').classList.remove('hidden');
  renderAdminAll();
  switchAdminTab('stats');
}

async function attemptAdminLogin() {
  const pw = document.getElementById('admin-pw').value;
  const hash = await sha256(pw);
  if (hash === ADMIN_PASSWORD_HASH) {
    adminUnlocked = true;
    showAdminDashboard();
  } else {
    document.getElementById('admin-pw-error').classList.remove('hidden');
    document.getElementById('admin-pw').value = '';
  }
}

function switchAdminTab(tab) {
  document.querySelectorAll('.adm-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.adm-tab-content').forEach(c => c.classList.add('hidden'));
  document.querySelector(`.adm-tab-btn[data-tab="${tab}"]`)?.classList.add('active');
  document.getElementById(`adm-tab-${tab}`)?.classList.remove('hidden');
}

function resetToDefaults() {
  if (confirm('Reset all data to defaults? This cannot be undone.')) {
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData(appData);
    renderAll();
    renderAdminAll();
  }
}

// ── KEYBOARD SHORTCUT ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAdminModal();
  if (e.key === 'Enter' && !document.getElementById('admin-login-screen').classList.contains('hidden')) {
    attemptAdminLogin();
  }
});

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  initAdminTrigger();

  // Admin tab switching
  document.querySelectorAll('.adm-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAdminTab(btn.dataset.tab));
  });
});
