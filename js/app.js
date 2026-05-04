// ========== CUSTOM MODAL SYSTEM (mobile-first) ==========
let museModalResolveFn = null;
function museModalResolve(val) {
  const overlay = document.getElementById('museModalOverlay');
  overlay.classList.remove('open');
  if(museModalResolveFn) { museModalResolveFn(val); museModalResolveFn = null; }
}
function musePrompt(title, placeholder) {
  return new Promise(resolve => {
    museModalResolveFn = resolve;
    const overlay = document.getElementById('museModalOverlay');
    document.getElementById('museModalTitle').textContent = title;
    const msg = document.getElementById('museModalMsg');
    msg.style.display = 'none';
    const inp = document.getElementById('museModalInput');
    inp.style.display = 'block';
    inp.value = '';
    inp.placeholder = placeholder || '';
    const okBtn = document.getElementById('museModalOk');
    okBtn.textContent = 'OK';
    okBtn.className = 'small-btn accent';
    document.getElementById('museModalCancel').textContent = 'Cancelar';
    overlay.classList.add('open');
    setTimeout(() => inp.focus(), 200);
  });
}
function museConfirm(title, message) {
  return new Promise(resolve => {
    museModalResolveFn = resolve;
    const overlay = document.getElementById('museModalOverlay');
    document.getElementById('museModalTitle').textContent = title;
    const msg = document.getElementById('museModalMsg');
    msg.style.display = 'block';
    msg.textContent = message;
    document.getElementById('museModalInput').style.display = 'none';
    const okBtn = document.getElementById('museModalOk');
    okBtn.textContent = 'Confirmar';
    okBtn.className = 'small-btn danger';
    document.getElementById('museModalCancel').textContent = 'Cancelar';
    overlay.classList.add('open');
  });
}

function openBottomSheet(html) {
  const overlay = document.getElementById('bottomSheetOverlay');
  const content = document.getElementById('bottomSheetContent');
  content.innerHTML = DOMPurify.sanitize(html, {ADD_ATTR: ['data-action','data-args']});
  overlay.classList.add('open');
}
function closeBottomSheet() {
  document.getElementById('bottomSheetOverlay').classList.remove('open');
}
document.getElementById('bottomSheetOverlay').addEventListener('click', e => { if(e.target.id === 'bottomSheetOverlay') closeBottomSheet(); });

// ========== SUPABASE & AUTH ==========
const supabaseUrl = 'https://ebfxschsrkcacnyvhhyi.supabase.co';
const supabaseKey = 'sb_publishable_ZPdvMhAJ_utWkhJY6CzKog_exQR-9eO';
let supabase = null;
try {
  if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
} catch (e) { console.error("Supabase init error:", e); }
let currentUser = null;

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) alert("Erro ao fazer login: " + error.message);
}

async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
  window.location.reload();
}

function renderAuthUI() {
  const authDiv = document.getElementById('sidebarAuth');
  if (!authDiv) return;
  if (currentUser) {
    authDiv.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text2); word-break: break-all;">Logado como:<br><b>${DOMPurify.sanitize(currentUser.email)}</b></div>
      <button class="small-btn" data-action="signOut" style="width: 100%;">Sair</button>
    `;
  } else {
    authDiv.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text2); margin-bottom: 4px;">Salve seus dados na nuvem:</div>
      <button class="small-btn accent" data-action="signInWithGoogle" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Entrar com Google
      </button>
    `;
  }
}

// ========== STATE ==========
const DEFAULT_STATE = {
  theme: 'dark',
  alert: { title: 'CUIDADO COM O FÍGADO', body: 'Leia a embalagem do suplemento. Verificar vitaminas com médico antes de usar. Prioridade máxima.' },
  subpages: [
    { id:'beauty-hub', name:'Beauty Hub', icon:'✧', desc:'Rotina de beleza — diário ao anual', longDesc:'Organize sua rotina de skincare, cabelo e bem-estar.', gradient:'beauty', coverImage:'', widgets:[], favorite:false, deleted:false },
    { id:'mind-soul', name:'Mind & Soul', icon:'◑', desc:'Estudos, idiomas e espiritualidade', longDesc:'Estudos, idiomas, leituras e crescimento pessoal.', gradient:'mind', coverImage:'', widgets:[], favorite:false, deleted:false },
    { id:'ugc-studio', name:'UGC Studio', icon:'▢', desc:'Conteúdo, ideias e produção', longDesc:'Ideias, produções e planejamento de conteúdo.', gradient:'ugc', coverImage:'', widgets:[], favorite:false, deleted:false },
    { id:'lab-pesquisas', name:'Lab Pesquisas', icon:'◎', desc:'Itens marcados com P', longDesc:'Pesquisas, referências e itens para investigar.', gradient:'lab', coverImage:'', widgets:[], favorite:false, deleted:false }
  ],
  events: {},
  currentView: 'home',
  currentSubpage: null,
  selectedDate: new Date().toISOString().split('T')[0],
  calMonth: new Date().getMonth(),
  calYear: new Date().getFullYear(),
  pinnedSubpages: [] // IDs das subpáginas fixadas na barra inferior
};

let state;
async function loadState() {
  try {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      currentUser = session?.user || null;

      let remoteState = null;
      if (currentUser) {
        const { data, error } = await supabase.from('muse_state').select('state_data').eq('user_id', currentUser.id).single();
        if (data && data.state_data) remoteState = data.state_data;
      }

      const localRaw = localStorage.getItem('muse_state');
      let localState = localRaw ? JSON.parse(localRaw) : null;
      
      // Migração de dados locais para a nuvem
      if (currentUser && localState && !remoteState) {
        remoteState = localState;
        await supabase.from('muse_state').upsert({ user_id: currentUser.id, state_data: remoteState });
      }

      const s = remoteState || localState;
      state = s ? {...DEFAULT_STATE, ...s} : JSON.parse(JSON.stringify(DEFAULT_STATE));
    } else {
      const localRaw = localStorage.getItem('muse_state');
      state = localRaw ? {...DEFAULT_STATE, ...JSON.parse(localRaw)} : JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    
    // Migração: se pinnedSubpages estiver vazio
    if (!state.pinnedSubpages || state.pinnedSubpages.length === 0) {
      state.pinnedSubpages = state.subpages
        .filter(sp => !sp.deleted && !sp.isNested)
        .slice(0, 3)
        .map(sp => sp.id);
    }

    state.subpages.forEach(sp => {
      if (sp.widgets) {
        sp.widgets.forEach(w => { if(w.type === 'pomodoro') w.data.isRunning = false; });
      }
    });
  } catch(e) {
    console.error("Error loading state", e);
    state = JSON.parse(JSON.stringify(DEFAULT_STATE)); 
  }
  document.documentElement.setAttribute('data-theme', state.theme);
  renderAuthUI();
}

async function saveState() { 
  localStorage.setItem('muse_state', JSON.stringify(state)); 
  if (supabase && currentUser) {
    await supabase.from('muse_state').upsert({ user_id: currentUser.id, state_data: state, updated_at: new Date().toISOString() });
  }
}
function genId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); }

// ========== GLOBAIS ==========
window.isEditMode = false;

// ========== ICONS SVG ==========
var ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>',
  beauty: '<svg viewBox="0 0 24 24"><path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 11.5l-4 3L9.5 10 6 7.5h4.5z"/></svg>',
  mind: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18"/><path d="M12 7v10M8 12h8"/></svg>',
  ugc: '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3z"/></svg>',
  lab: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  chevLeft: '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
  chevRight: '<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>',
  back: '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  star: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  summary: '<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

var WIDGET_TYPES = [
  { type:'acordeao', label:'Acordeão', icon:'▤' },
  { type:'pomodoro', label:'Timer Pomodoro', icon:'⏱' },
  { type:'habitos', label:'Rastreador de Hábitos', icon:'✔' },
  { type:'despesas', label:'Lançamento de Gastos', icon:'💸' },
  { type:'progresso', label:'Barra de Progresso', icon:'📊' },
  { type:'countdown', label:'Contagem Regressiva', icon:'⏳' },
  { type:'galeria', label:'Galeria / Moodboard', icon:'🖼' },
  { type:'cardapio', label:'Cardápio Semanal', icon:'🥗' },
  { type:'flashcards', label:'Flashcards', icon:'🧠' },
  { type:'links', label:'Links Rápidos', icon:'🔗' },
  { type:'notas', label:'Notas Rápidas', icon:'📝' },
  { type:'alerta', label:'Caixa de Alerta', icon:'⚠️' },
  { type:'ciclo', label:'Ciclo Menstrual', icon:'🩸' },
  { type:'menu-sub', label:'Menu de Subpáginas', icon:'🗂' },
  { type:'tarefas-adv', label:'Tarefas Avançadas', icon:'📋' }
];

var DAYS_PT = ['D','S','T','Q','Q','S','S'];
var MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var WEEKDAYS_PT = ['Domingo','Segunda-Feira','Terça-Feira','Quarta-Feira','Quinta-Feira','Sexta-Feira','Sábado'];

// DOM PURIFY CONFIG
var DP_CONFIG = { ADD_ATTR: ['data-action', 'data-args', 'data-blur', 'data-change', 'data-input', 'data-keydown', 'contenteditable', 'href', 'target', 'rel'] };

// ========== SPLASH ==========
function initSplash() {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    document.getElementById('app').classList.add('show');
  }, 2200);
}

// ========== THEME ==========
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('themeToggle').innerHTML = state.theme === 'dark' ? ICONS.moon : ICONS.sun;
  saveState();
  renderSidebar();
}

// ========== CLOCK ==========
let clockInterval;
function startClock() {
  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    const clockHTML = `<span class="clock-digit">${h}</span><span class="clock-sep">:</span><span class="clock-digit">${m}</span><span class="clock-sep">:</span><span class="clock-digit">${s}</span>`;
    const dateText = `${WEEKDAYS_PT[now.getDay()]}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]}`;

    const el = document.getElementById('clockDigits');
    const dateEl = document.getElementById('clockDate');
    if(el) el.innerHTML = DOMPurify.sanitize(clockHTML, DP_CONFIG);
    if(dateEl) dateEl.textContent = dateText;

    const spEl = document.getElementById('spClockDigits');
    const spDateEl = document.getElementById('spClockDate');
    if(spEl) spEl.innerHTML = DOMPurify.sanitize(clockHTML, DP_CONFIG);
    if(spDateEl) spDateEl.textContent = dateText;
    
    if(window.tickPomodoros) window.tickPomodoros();
    if(window.tickCountdowns) window.tickCountdowns();
  }
  update();
  clearInterval(clockInterval);
  clockInterval = setInterval(update, 1000);
}

// ========== ROUTER ==========
function navigate(view, subpageId) {
  state.currentView = view;
  state.currentSubpage = subpageId || null;
  saveState();
  render();
}

function render() {
  const main = document.getElementById('mainContent');
  if (state.currentView === 'home') renderHome(main);
  else if (state.currentView === 'subpage') renderSubpage(main);
  renderBottomNav();
  startClock();
}

// ========== HOME ==========
function renderHome(container) {
  const activeSubpages = state.subpages.filter(s => !s.deleted && !s.isNested);
  const today = new Date();
  
  const dateKey = state.selectedDate;

  let html = `
    <div class="hero-card">
      <div class="hero-img"></div>
      <div class="hero-text">
        <h2>Bem vindo(a) de volta!</h2>
        <p>Um estúdio digital para organizar a sua vida.</p>
        <p style="margin-top:4px;font-size:.72rem;color:var(--text3)">The Muse Studio está dividido em ${activeSubpages.length} categorias principais.</p>
      </div>
    </div>

    <div class="clock-alert-row">
      <div>
        <div class="clock-widget" id="clockDigits"></div>
        <div class="clock-date" id="clockDate"></div>
      </div>
      <div class="alert-widget" id="alertWidget">
        <div class="alert-header">
          <span class="alert-icon">⚠</span>
          <span class="alert-title" id="alertTitle">${DOMPurify.sanitize(state.alert.title)}</span>
        </div>
        <div class="alert-body" id="alertBody">${DOMPurify.sanitize(state.alert.body)}</div>
        <span class="alert-edit" id="alertEditBtn" data-action="toggleAlertEdit" title="Editar lembrete">✎</span>
      </div>
    </div>

    <div class="section-label">MENU</div>
    <div class="category-list" id="categoryList">
      ${activeSubpages.map((s,i) => `
        <div class="category-card" data-action="navigate" data-args="subpage,${s.id}" style="animation-delay:${0.15+i*0.1}s">
          <div class="cat-img ${s.gradient || 'custom'}" ${s.coverImage ? `style="background-image:url('${DOMPurify.sanitize(s.coverImage)}')" ` : ''}>
            <span class="cat-img-edit" data-action="changeCoverImage" data-args="${s.id}" title="Trocar capa">✎</span>
          </div>
          <div class="cat-info">
            <div class="cat-title"><span class="cat-icon">${s.icon}</span>${DOMPurify.sanitize(s.name)}</div>
            <div class="cat-desc">${DOMPurify.sanitize(s.desc)}</div>
          </div>
          <span class="cat-arrow">›</span>
        </div>
      `).join('')}
    </div>
    <div class="add-subpage-btn" data-action="addSubpage">
      <span>＋</span> Adicionar nova subpágina
    </div>

    <div class="section-label" id="sectionCalendar">CALENDÁRIO</div>
    ${renderCalendarHTML()}

    <div class="section-label" id="sectionSummary">RESUMO</div>
    <div class="summary-widget">
      <div style="font-size:.72rem;color:var(--text3);margin-bottom:10px">Hoje é ${today.getDate()} de ${MONTHS_PT[today.getMonth()].toLowerCase()} de ${today.getFullYear()}</div>
      ${activeSubpages.map(s => {
        return `<div class="summary-item"><h4>${DOMPurify.sanitize(s.name)}</h4><p><span>↳ ${s.widgets.length} widget${s.widgets.length!==1?'s':''}</span></p></div>`;
      }).join('')}
    </div>
  `;

  container.innerHTML = DOMPurify.sanitize(html, DP_CONFIG);

  setTimeout(() => {
    const at = document.getElementById('alertTitle');
    const ab = document.getElementById('alertBody');
    if(at) at.addEventListener('blur', () => { state.alert.title = at.textContent; saveState(); });
    if(ab) ab.addEventListener('blur', () => { state.alert.body = ab.textContent; saveState(); });
  }, 100);
}

// ========== ALERT EDIT TOGGLE ==========
function toggleAlertEdit() {
  const widget = document.getElementById('alertWidget');
  const title = document.getElementById('alertTitle');
  const body = document.getElementById('alertBody');
  if(!widget || !title || !body) return;

  const isEditing = widget.classList.contains('editing');
  if(isEditing) {
    widget.classList.remove('editing');
    title.contentEditable = 'false';
    body.contentEditable = 'false';
    title.style.cursor = 'default';
    body.style.cursor = 'default';
    state.alert.title = title.textContent;
    state.alert.body = body.textContent;
    saveState();
  } else {
    widget.classList.add('editing');
    title.contentEditable = 'true';
    body.contentEditable = 'true';
    title.style.cursor = 'text';
    body.style.cursor = 'text';
    body.focus();
  }
}

// ========== CALENDAR ==========
function renderCalendarHTML() {
  const year = state.calYear;
  const month = state.calMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const selDate = state.selectedDate;
  const dayEvents = state.events[selDate] || [];
  const selD = new Date(selDate + 'T12:00:00');

  let cells = '';
  for(let i = firstDay - 1; i >= 0; i--) {
    cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
  }
  for(let d = 1; d <= daysInMonth; d++) {
    const dk = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dk === todayStr;
    const isSel = dk === selDate && !isToday;
    const hasEv = (state.events[dk] && state.events[dk].length > 0);
    cells += `<div class="cal-day${isToday?' today':''}${isSel?' selected':''}${hasEv?' has-event':''}" data-action="selectDate" data-args="${dk}">${d}</div>`;
  }
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - totalCells % 7) % 7;
  for(let i = 1; i <= remaining; i++) {
    cells += `<div class="cal-day other-month">${i}</div>`;
  }

  return `
  <div class="calendar-widget">
    <div class="cal-header">
      <button class="cal-nav" data-action="calNav" data-args="-1"><span>${ICONS.chevLeft}</span></button>
      <h3>${MONTHS_PT[month]} ${year}</h3>
      <button class="cal-nav" data-action="calNav" data-args="1"><span>${ICONS.chevRight}</span></button>
    </div>
    <div class="cal-grid">
      ${DAYS_PT.map(d => `<div class="cal-day-label">${d}</div>`).join('')}
      ${cells}
    </div>
    <div class="cal-events">
      <div class="cal-events-header">
        <h4>${WEEKDAYS_PT[selD.getDay()]}, ${selD.getDate()} De ${MONTHS_PT[selD.getMonth()]}</h4>
        <button class="small-btn accent" data-action="promptAddEvent">＋</button>
      </div>
      ${dayEvents.length === 0 ? '<div class="cal-no-events">Nenhum evento neste dia</div>' :
        dayEvents.map((ev,i) => `
          <div class="cal-event-item">
            <span class="dot"></span>
            <span>${DOMPurify.sanitize(ev)}</span>
            <button data-action="removeEvent" data-args="${selDate},${i}">${ICONS.x}</button>
          </div>
        `).join('')}
      <div class="event-input-row" id="eventInputRow" style="display:none">
        <input class="inline-input" id="eventInput" placeholder="Descreva o evento..." data-keydown="confirmAddEventEnter">
        <button class="small-btn accent" data-action="confirmAddEvent">OK</button>
      </div>
    </div>
  </div>`;
}

function selectDate(dk) { state.selectedDate = dk; saveState(); render(); }
function calNav(dir) {
  state.calMonth += dir;
  if(state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  if(state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  saveState(); render();
}
function promptAddEvent() {
  const r = document.getElementById('eventInputRow');
  if(r) { r.style.display = 'flex'; document.getElementById('eventInput').focus(); }
}
function confirmAddEvent() {
  const inp = document.getElementById('eventInput');
  if(!inp || !inp.value.trim()) return;
  if(!state.events[state.selectedDate]) state.events[state.selectedDate] = [];
  state.events[state.selectedDate].push(inp.value.trim());
  saveState(); render();
}
function removeEvent(dk, idx) {
  if(state.events[dk]) { state.events[dk].splice(idx, 1); saveState(); render(); }
}

// ========== SUBPAGES CRUD ==========
function addSubpage() {
  musePrompt('Nova subpágina', 'Nome da subpágina:').then(name => {
    if(!name || !name.trim()) return;
    state.subpages.push({
      id: genId(), name: name.trim(), icon:'◇', desc:'Nova subpágina personalizada',
      longDesc:'Adicione uma descrição para esta subpágina.', gradient:'custom', coverImage:'', widgets:[], favorite:false, deleted:false
    });
    saveState(); render();
  });
}

// ========== DRAG TO SCROLL (GALLERY) ==========
let isDown = false;
let startX;
let scrollLeft;

document.addEventListener('mousedown', (e) => {
  const gal = e.target.closest('.w-gallery');
  if(!gal) return;
  isDown = true;
  gal.classList.add('active');
  startX = e.pageX - gal.offsetLeft;
  scrollLeft = gal.scrollLeft;
});

document.addEventListener('mouseleave', () => { isDown = false; });
document.addEventListener('mouseup', () => { isDown = false; });

document.addEventListener('mousemove', (e) => {
  if(!isDown) return;
  const gal = e.target.closest('.w-gallery');
  if(!gal) return;
  e.preventDefault();
  const x = e.pageX - gal.offsetLeft;
  const walk = (x - startX) * 2;
  gal.scrollLeft = scrollLeft - walk;
});

function deleteSubpage(id) {
  const sp = state.subpages.find(s => s.id === id);
  if(!sp) return;
  museConfirm('Mover para lixeira', `Mover "${sp.name}" para a lixeira?`).then(ok => {
    if(!ok) return;
    sp.deleted = true; saveState();
    navigate('home');
  });
}
function restoreSubpage(id) {
  const sp = state.subpages.find(s => s.id === id);
  if(sp) { sp.deleted = false; saveState(); renderSidebar(); render(); }
}
function permanentDelete(id) {
  museConfirm('Excluir permanentemente', 'Esta ação não pode ser desfeita. Excluir?').then(ok => {
    if(!ok) return;
    state.subpages = state.subpages.filter(s => s.id !== id);
    saveState(); renderSidebar(); render();
  });
}
function toggleFavorite(id) {
  const sp = state.subpages.find(s => s.id === id);
  if(sp) { sp.favorite = !sp.favorite; saveState(); renderSidebar(); render(); }
}

// ========== SUBPAGE VIEW ==========
function renderSubpage(container) {
  const sp = state.subpages.find(s => s.id === state.currentSubpage);
  if(!sp) { navigate('home'); return; }
  if(!sp.longDesc) sp.longDesc = '';
  if(!sp.coverImage) sp.coverImage = '';

  const coverStyle = sp.coverImage ? `background-image:url('${DOMPurify.sanitize(sp.coverImage)}')` : `background:linear-gradient(135deg, var(--card2), var(--card))`;

  const html = `
    <div class="sp-cover" style="${coverStyle}">
      <span class="sp-cover-edit" data-action="changeCoverImage" data-args="${sp.id}">✎ Alterar capa</span>
    </div>
    <div class="subpage-header">
      <button class="back-btn" data-action="navigate" data-args="home">${ICONS.back}</button>
      <div class="subpage-title" contenteditable="true" id="spTitle">${DOMPurify.sanitize(sp.name)}</div>
      <div class="subpage-actions">
        <button class="icon-btn ${window.isEditMode ? 'active' : ''}" data-action="toggleEditMode" title="Modo Edição" style="${window.isEditMode ? 'color:var(--accent)' : ''}">✎</button>
        <button class="icon-btn fav-btn ${sp.favorite?'active':''}" data-action="toggleFavorite" data-args="${sp.id}" title="Favorito">${ICONS.star}</button>
        <button class="icon-btn" data-action="deleteSubpage" data-args="${sp.id}" title="Excluir">${ICONS.trash}</button>
      </div>
    </div>
    <div class="sp-description">
      <p contenteditable="true" id="spDesc" placeholder="Adicione uma descrição...">${DOMPurify.sanitize(sp.longDesc) || 'Clique para adicionar uma descrição...'}</p>
    </div>
    <div class="sp-clock-row" id="spClockDigits"></div>
    <div class="sp-clock-date" id="spClockDate"></div>
    <div class="widget-list" id="widgetList" class="${window.isEditMode ? 'edit-mode-active' : ''}">
      ${sp.widgets.map((w,i) => renderWidget(w, i, sp.id)).join('')}
    </div>
    ${window.isEditMode ? `
    <div class="add-widget-btn" data-action="openWidgetPicker" data-args="${sp.id}">
      <span>＋</span> Adicionar visualização
    </div>` : ''}
  `;

  container.innerHTML = DOMPurify.sanitize(html, DP_CONFIG);

  setTimeout(() => {
    const t = document.getElementById('spTitle');
    if(t) t.addEventListener('blur', () => { sp.name = t.textContent.trim() || sp.name; saveState(); });
    const d = document.getElementById('spDesc');
    if(d) d.addEventListener('blur', () => { sp.longDesc = d.textContent.trim(); saveState(); });
  }, 50);
}

// ========== COVER IMAGE ==========
function changeCoverImage(spId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const sp = state.subpages.find(s => s.id === spId);
      if(sp) {
        sp.coverImage = ev.target.result;
        saveState();
        render();
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ========== WIDGET ENGINE ==========
function getDefaultData(type) {
  switch(type) {
    case 'acordeao': return { categories:[
      { id:genId(), title:'Nova Categoria', icon:'✦', desc:'Descrição da categoria...', expanded:true, items:[
        { id:genId(), text:'Primeiro item', content:'' },
        { id:genId(), text:'Segundo item', content:'' }
      ]}
    ]};
    default: return {};
  }
}

function addWidget(spId, type) {
  const sp = state.subpages.find(s => s.id === spId);
  if(!sp) return;
  sp.widgets.push({ id: genId(), type, title: WIDGET_TYPES.find(w=>w.type===type)?.label || type, data: getDefaultData(type) });
  saveState(); closeWidgetPicker(); render();
}

function removeWidget(spId, wIdx) {
  const sp = state.subpages.find(s => s.id === spId);
  if(!sp) return;
  const w = sp.widgets[wIdx];
  museConfirm('Remover widget', `Excluir o widget "${w.title}"?`).then(ok => {
    if(ok) {
      sp.widgets.splice(wIdx, 1);
      saveState();
      render();
    }
  });
}

function renderWidget(w, idx, spId) {
  let body = '';
  switch(w.type) {
    case 'acordeao': body = renderAcordeao(w, idx, spId); break;
    default: body = '<div style="font-size:0.7rem;color:var(--text3)">Widget não suportado ainda.</div>';
  }

  return `<div class="widget-container" style="animation-delay:${idx*0.08}s">
    <div class="widget-header">
      <div style="display:flex;align-items:center;gap:6px">
        ${window.isEditMode ? `
        <div class="widget-reorder" style="display:flex;gap:2px">
          <button class="small-btn" data-action="moveWidget" data-args="${spId},${idx},-1" style="padding:2px 4px;font-size:0.6rem">▲</button>
          <button class="small-btn" data-action="moveWidget" data-args="${spId},${idx},1" style="padding:2px 4px;font-size:0.6rem">▼</button>
        </div>` : ''}
        <h3><span>${WIDGET_TYPES.find(t=>t.type===w.type)?.icon||'◇'}</span> ${DOMPurify.sanitize(w.title)} <span class="widget-type">${DOMPurify.sanitize(w.type)}</span></h3>
      </div>
      ${window.isEditMode ? `<button class="widget-delete" data-action="removeWidget" data-args="${spId},${idx}" title="Remover widget">${ICONS.x}</button>` : ''}
    </div>
    <div class="widget-body">${body}</div>
  </div>`;
}

function renderAcordeao(w, idx, spId) {
  return `<div class="w-accordion">
    ${(w.data.categories||[]).map((cat,ci) => `
      <div class="w-acc-cat ${cat.expanded?'open':''}" id="acc_${w.id}_${ci}">
        <div class="w-acc-header" data-action="toggleAccCat" data-args="${spId},${idx},${ci}">
          <span class="acc-icon">${cat.icon||'✦'}</span>
          <span class="acc-title">${DOMPurify.sanitize(cat.title)}</span>
          <span class="acc-actions">
            <button class="widget-delete" data-action="removeAccCat" data-args="${spId},${idx},${ci}" title="Remover categoria" style="font-size:.65rem">✕</button>
          </span>
          <span class="acc-arrow">▾</span>
        </div>
        <div class="w-acc-body">
          <div class="w-acc-desc" contenteditable="true" data-blur="updateAccCatDesc" data-args="${spId},${idx},${ci}">${DOMPurify.sanitize(cat.desc)}</div>
          <div class="w-acc-items">
            ${cat.items.map((item,ii) => `
              <div class="w-acc-item" data-action="openAccDetail" data-args="${spId},${idx},${ci},${ii}">
                <span class="acc-dash">—</span>
                <span>${DOMPurify.sanitize(item.text)}</span>
                <button class="acc-item-edit" data-action="removeAccItem" data-args="${spId},${idx},${ci},${ii}" title="Remover">✕</button>
              </div>
            `).join('')}
          </div>
          <div class="w-acc-add" data-action="addAccItem" data-args="${spId},${idx},${ci}">
            <span>＋</span> Adicionar item
          </div>
        </div>
      </div>
    `).join('')}
    <div class="w-acc-cat-add" data-action="addAccCat" data-args="${spId},${idx}">
      <span>＋</span> Adicionar categoria
    </div>
  </div>`;
}

// ========== ACCORDION FUNCTIONS ==========
function toggleAccCat(spId,wIdx,catIdx){
  const sp=state.subpages.find(s=>s.id===spId);
  if(sp&&sp.widgets[wIdx]){ sp.widgets[wIdx].data.categories[catIdx].expanded=!sp.widgets[wIdx].data.categories[catIdx].expanded; saveState(); render(); }
}
function addAccCat(spId,wIdx){
  musePrompt('Nova categoria','Nome da categoria:').then(t => {
    if(!t||!t.trim())return;
    const sp=state.subpages.find(s=>s.id===spId);
    if(sp&&sp.widgets[wIdx]){
      if(!sp.widgets[wIdx].data.categories) sp.widgets[wIdx].data.categories = [];
      sp.widgets[wIdx].data.categories.push({id:genId(),title:t.trim(),icon:'✦',desc:'Descrição da categoria...',expanded:true,items:[]});
      saveState();render();
    }
  });
}
function removeAccCat(spId,wIdx,catIdx){
  museConfirm('Remover categoria','Remover esta categoria e todos os seus itens?').then(ok => {
    if(!ok) return;
    const sp=state.subpages.find(s=>s.id===spId);
    if(sp&&sp.widgets[wIdx]){sp.widgets[wIdx].data.categories.splice(catIdx,1);saveState();render();}
  });
}
function updateAccCatDesc(spId,wIdx,catIdx,val){
  const sp=state.subpages.find(s=>s.id===spId);
  if(sp&&sp.widgets[wIdx])sp.widgets[wIdx].data.categories[catIdx].desc=val;
  saveState();
}
function addAccItem(spId,wIdx,catIdx){
  musePrompt('Novo item','Nome do item:').then(t => {
    if(!t||!t.trim())return;
    const sp=state.subpages.find(s=>s.id===spId);
    if(sp&&sp.widgets[wIdx]){
      sp.widgets[wIdx].data.categories[catIdx].items.push({id:genId(),text:t.trim(),content:''});
      saveState();render();
    }
  });
}
function removeAccItem(spId,wIdx,catIdx,itemIdx){
  const sp=state.subpages.find(s=>s.id===spId);
  if(sp&&sp.widgets[wIdx]){sp.widgets[wIdx].data.categories[catIdx].items.splice(itemIdx,1);saveState();render();}
}

// Accordion detail modal state
let accDetailCtx=null;
function openAccDetail(spId,wIdx,catIdx,itemIdx){
  const sp=state.subpages.find(s=>s.id===spId);
  if(!sp||!sp.widgets[wIdx])return;
  const cat=sp.widgets[wIdx].data.categories[catIdx];
  const item=cat.items[itemIdx];
  accDetailCtx={spId,wIdx,catIdx,itemIdx};
  document.getElementById('accDetailCat').innerHTML=DOMPurify.sanitize('✦ '+cat.title);
  document.getElementById('accDetailTitle').textContent=item.text;
  document.getElementById('accDetailContent').innerHTML=DOMPurify.sanitize(item.content||'', DP_CONFIG);
  document.getElementById('accDetailOverlay').classList.add('open');
}
function closeAccDetail(){
  accDetailCtx=null;
  document.getElementById('accDetailOverlay').classList.remove('open');
}
function saveAndCloseAccDetail(){
  if(accDetailCtx){
    const {spId,wIdx,catIdx,itemIdx}=accDetailCtx;
    const sp=state.subpages.find(s=>s.id===spId);
    if(sp&&sp.widgets[wIdx]){
      sp.widgets[wIdx].data.categories[catIdx].items[itemIdx].content=document.getElementById('accDetailContent').innerHTML;
      saveState();
      render();
    }
  }
  closeAccDetail();
}
function renameAccItemFromModal(){
  if(!accDetailCtx) return;
  musePrompt('Renomear item', 'Novo nome:').then(newName => {
    if(newName && newName.trim()){
      const {spId,wIdx,catIdx,itemIdx}=accDetailCtx;
      const sp=state.subpages.find(s=>s.id===spId);
      if(sp&&sp.widgets[wIdx]){
        sp.widgets[wIdx].data.categories[catIdx].items[itemIdx].text = newName.trim();
        document.getElementById('accDetailTitle').textContent = newName.trim();
        saveState();
        render();
      }
    }
  });
}

// ========== WIDGET PICKER ==========
function openWidgetPicker(spId) {
  const modal = document.getElementById('widgetModal');
  const grid = document.getElementById('widgetGrid');
  grid.innerHTML = DOMPurify.sanitize(WIDGET_TYPES.map(w => `
    <div class="widget-option" data-action="addWidget" data-args="${spId},${w.type}">
      <span class="wo-icon">${w.icon}</span>
      <span class="wo-label">${w.label}</span>
    </div>
  `).join(''), DP_CONFIG);
  modal.classList.add('open');
}
function closeWidgetPicker() { document.getElementById('widgetModal').classList.remove('open'); }

// ========== SIDEBAR ==========
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
  renderSidebar();
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

function renderSidebar() {
  const active = state.subpages.filter(s => !s.deleted && !s.isNested);
  const favs = state.subpages.filter(s => s.favorite && !s.deleted && !s.isNested);
  const trashed = state.subpages.filter(s => s.deleted);

  const getSpIcon = (s) => {
    const key = s.id.split('-')[0];
    return ICONS[key] || `<span class="si-emoji">${s.icon}</span>`;
  };

  const html = `
    <div class="sidebar-section">
      <div class="sidebar-section-header">
        <span>MENU</span>
        <div class="sidebar-theme-toggle" data-action="toggleTheme">${state.theme==='dark'?'☽':'☀'} ${state.theme==='dark'?'Escuro':'Claro'}</div>
      </div>
      
      <div class="sidebar-item ${state.currentView==='home'?'active':''}" data-action="sidebarNav" data-args="home">
        <span class="si-icon">${ICONS.home}</span> Início <span class="si-arrow">›</span>
      </div>

      <div class="sidebar-sub-label">SISTEMA</div>
      <div class="sidebar-item" data-action="scrollToId" data-args="sectionCalendar">
        <span class="si-icon">${ICONS.calendar}</span> Calendário <span class="si-arrow">›</span>
      </div>
      <div class="sidebar-item" data-action="scrollToId" data-args="sectionSummary">
        <span class="si-icon">${ICONS.summary}</span> Resumo <span class="si-arrow">›</span>
      </div>

      <div class="sidebar-sub-label">WORKSPACES</div>
      ${active.map(s => `
        <div class="sidebar-item ${state.currentSubpage===s.id?'active':''}" data-action="sidebarNav" data-args="subpage,${s.id}">
          <span class="si-icon">${getSpIcon(s)}</span> ${DOMPurify.sanitize(s.name)} <span class="si-arrow">›</span>
        </div>
      `).join('')}
    </div>

    <div class="sidebar-divider"></div>
    
    <div class="sidebar-section">
      <div class="sidebar-sub-label" style="color:var(--accent)">FAVORITOS</div>
      ${favs.length === 0 ? '<div class="sidebar-empty">Nenhum favorito</div>' :
        favs.map(s => `
          <div class="sidebar-item" data-action="sidebarNav" data-args="subpage,${s.id}">
            <span class="si-icon">${getSpIcon(s)}</span> ${DOMPurify.sanitize(s.name)}
          </div>
        `).join('')}
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-sub-label">LIXEIRA</div>
      ${trashed.length === 0 ? '<div class="sidebar-empty">Vazia</div>' :
        trashed.map(s => `
          <div class="sidebar-item trashed">
            <span class="si-icon">${getSpIcon(s)}</span> ${DOMPurify.sanitize(s.name)}
            <div class="si-actions">
              <button class="small-btn" data-action="restoreSubpage" data-args="${s.id}" title="Restaurar">↩</button>
              <button class="small-btn danger" data-action="permanentDelete" data-args="${s.id}" title="Excluir">✕</button>
            </div>
          </div>
        `).join('')}
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-sub-label">CONFIGURAÇÕES</div>
      <div class="sidebar-item" data-action="openBottomNavEditor">
        <span class="si-icon">${ICONS.edit}</span> Barra Inferior <span class="si-arrow">›</span>
      </div>
    </div>
  `;
  document.getElementById('sidebarContent').innerHTML = DOMPurify.sanitize(html, DP_CONFIG);
}

// ========== BOTTOM NAV ==========
function renderBottomNav() {
  const activeSubpages = state.subpages.filter(s => !s.deleted && !s.isNested);
  
  const getIcon = (s) => {
    const key = s.id.split('-')[0];
    return ICONS[key] || `<span style="font-size:1.1rem">${s.icon}</span>`;
  };

  // Mapeia os IDs fixados para objetos de navegação, filtrando páginas deletadas
  const pinnedItems = state.pinnedSubpages
    .map(id => activeSubpages.find(s => s.id === id))
    .filter(Boolean)
    .map(s => ({
      id: s.id,
      label: s.name.split(' ')[0],
      icon: getIcon(s)
    }));

  const navItems = [
    { id:'home', label:'Início', icon:ICONS.home },
    ...pinnedItems
  ];

  let html = navItems.map(n => {
    const isActive = n.id === 'home' ? state.currentView === 'home' : state.currentSubpage === n.id;
    return `<div class="nav-item ${isActive?'active':''}" data-action="navigate" data-args="${n.id==='home'?'home':'subpage'},${n.id}">${n.icon}<span>${DOMPurify.sanitize(n.label)}</span></div>`;
  }).join('');

  document.getElementById('bottomNav').innerHTML = DOMPurify.sanitize(html, DP_CONFIG);
}

function openBottomNavEditor() {
  const activeSubpages = state.subpages.filter(s => !s.deleted && !s.isNested);
  
  let html = `
    <div class="nav-editor-header">
      <h3>Fixar na Barra Inferior</h3>
      <p>Escolha até 4 subpáginas para acesso rápido.</p>
    </div>
    <div class="nav-editor-list">
      ${activeSubpages.map(s => {
        const isPinned = state.pinnedSubpages.includes(s.id);
        return `
          <div class="nav-editor-item ${isPinned ? 'pinned' : ''}" data-action="togglePinToBottomNav" data-args="${s.id}">
            <span class="nei-icon">${s.icon}</span>
            <span class="nei-name">${DOMPurify.sanitize(s.name)}</span>
            <span class="nei-status">${isPinned ? 'Fixado' : 'Fixar'}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="nav-editor-footer">
      <button class="small-btn accent" data-action="closeBottomSheet" style="width:100%">Concluído</button>
    </div>
  `;
  openBottomSheet(html);
}

function togglePinToBottomNav(id) {
  const idx = state.pinnedSubpages.indexOf(id);
  if (idx > -1) {
    state.pinnedSubpages.splice(idx, 1);
  } else {
    if (state.pinnedSubpages.length >= 4) {
      // Poderia mostrar um alerta, mas por enquanto apenas ignora ou substitui
      // Vamos apenas ignorar para manter a simplicidade ou avisar
      return; 
    }
    state.pinnedSubpages.push(id);
  }
  saveState();
  renderBottomNav();
  openBottomNavEditor(); // Re-renderiza o editor
}


// ========== EVENT DELEGATION ENGINE ==========
document.addEventListener('click', e => {
  const bt = e.target.closest('[data-action]');
  if(bt) {
    const action = bt.getAttribute('data-action');
    const argsStr = bt.getAttribute('data-args');
    const args = argsStr ? argsStr.split(',') : [];

    if(action === 'navigate') navigate(args[0], args[1]);
    if(action === 'sidebarNav') { closeSidebar(); navigate(args[0], args[1] || null); }
    if(action === 'changeCoverImage') changeCoverImage(args[0]);
    if(action === 'addSubpage') addSubpage();
    if(action === 'toggleAlertEdit') toggleAlertEdit();
    if(action === 'removeEvent') removeEvent(args[0], parseInt(args[1]));
    if(action === 'promptAddEvent') promptAddEvent();
    if(action === 'confirmAddEvent') confirmAddEvent();
    if(action === 'deleteSubpage') deleteSubpage(args[0]);
    if(action === 'restoreSubpage') restoreSubpage(args[0]);
    if(action === 'permanentDelete') permanentDelete(args[0]);
     if(action === 'toggleFavorite') toggleFavorite(args[0]);
    if(action === 'toggleEditMode') { window.isEditMode = !window.isEditMode; saveState(); render(); }
    if(action === 'openBottomNavEditor') openBottomNavEditor();
    if(action === 'togglePinToBottomNav') togglePinToBottomNav(args[0]);
    if(action === 'closeBottomSheet') closeBottomSheet();
    if(action === 'moveWidget') {
      const sp = state.subpages.find(s=>s.id===args[0]);
      if(sp) {
        const idx = parseInt(args[1]);
        const dir = parseInt(args[2]);
        const newIdx = idx + dir;
        if(newIdx >= 0 && newIdx < sp.widgets.length){
          const temp = sp.widgets[idx];
          sp.widgets[idx] = sp.widgets[newIdx];
          sp.widgets[newIdx] = temp;
          saveState(); render();
        }
      }
    }
    if(action === 'scrollToId') {
      closeSidebar();
      if(state.currentView !== 'home') {
        navigate('home');
        setTimeout(() => {
          const el = document.getElementById(args[0]);
          if(el) el.scrollIntoView({behavior:'smooth'});
        }, 100);
      } else {
        const el = document.getElementById(args[0]);
        if(el) el.scrollIntoView({behavior:'smooth'});
      }
    }
    if(action === 'openWidgetPicker') openWidgetPicker(args[0]);
    if(action === 'addWidget') addWidget(args[0], args[1]);
    if(action === 'removeWidget') removeWidget(args[0], parseInt(args[1]));
    if(action === 'toggleAccCat') toggleAccCat(args[0], parseInt(args[1]), parseInt(args[2]));
    if(action === 'removeAccCat') removeAccCat(args[0], parseInt(args[1]), parseInt(args[2]));
    if(action === 'addAccItem') addAccItem(args[0], parseInt(args[1]), parseInt(args[2]));
    if(action === 'removeAccItem') removeAccItem(args[0], parseInt(args[1]), parseInt(args[2]), parseInt(args[3]));
    if(action === 'addAccCat') addAccCat(args[0], parseInt(args[1]));
    if(action === 'openAccDetail') openAccDetail(args[0], parseInt(args[1]), parseInt(args[2]), parseInt(args[3]));
    if(action === 'closeAccDetail') closeAccDetail();
    if(action === 'saveAndCloseAccDetail') saveAndCloseAccDetail();
    if(action === 'renameAccItemFromModal') renameAccItemFromModal();
    if(action === 'selectDate') selectDate(args[0]);
    if(action === 'calNav') calNav(parseInt(args[0]));
    if(action === 'openSidebar') openSidebar();
    if(action === 'closeSidebar') closeSidebar();
    if(action === 'openLightbox') {
      const img = document.getElementById('lightboxImg');
      if(img) {
         const bg = bt.style.backgroundImage;
         const url = bg.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
         img.src = url;
      }
      document.getElementById('lightboxOverlay').classList.add('open');
    }
    if(action === 'closeLightbox') document.getElementById('lightboxOverlay').classList.remove('open');
    
    if(action === 'toggleTheme') toggleTheme();
    if(action === 'museModalOk') {
      const inp = document.getElementById('museModalInput');
      const val = (document.getElementById('museModalMsg').style.display === 'none') ? inp.value : true;
      museModalResolve(val);
    }
    if(action === 'museModalCancel') museModalResolve(null);
    if(action === 'signInWithGoogle') signInWithGoogle();
    if(action === 'signOut') signOut();
  } else {
     // Modals and overlays
     if(e.target.id === 'museModalOverlay') museModalResolve(null);
     if(e.target.id === 'widgetModal') closeWidgetPicker();
     if(e.target.id === 'sidebarOverlay') closeSidebar();
     if(e.target.id === 'accDetailOverlay') closeAccDetail();
  }
});

document.addEventListener('focusout', e => {
  const bt = e.target.closest('[data-blur]');
  if(bt) {
    const action = bt.getAttribute('data-blur');
    const argsStr = bt.getAttribute('data-args');
    const args = argsStr ? argsStr.split(',') : [];
    if(action === 'updateAccCatDesc') updateAccCatDesc(args[0], parseInt(args[1]), parseInt(args[2]), bt.textContent);
  }
});

document.addEventListener('keydown', e => {
  const bt = e.target.closest('[data-keydown]');
  if(bt && e.key === 'Enter') {
      e.preventDefault();
      const action = bt.getAttribute('data-keydown');
      if(action === 'confirmAddEventEnter') confirmAddEvent();
  } else if(e.target.id === 'museModalInput' && e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('museModalOk').click();
  }
});

// ========== INIT ==========
async function initApp() {
  await loadState();
  initSplash();
  setTimeout(() => render(), 100);
}
initApp();
