// ================= MUSE WIDGETS ENGINE (V2 ROBUST) =================
console.log("[Muse] Carregando widgets.js...");

// Redundância de segurança para genId se app.js falhar
if (typeof genId !== 'function') {
    window.genId = function() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); };
}

// ========== 1. FUNÇÕES DE RENDERIZAÇÃO (HOISTED) ==========

function getCustomDefaultData(type) {
  switch(type) {
    case 'pomodoro': return { timeLeft: 1500, isRunning: false, isWork: true, workTime: 1500, breakTime: 300 };
    case 'habitos': return { habits: [{ id:genId(), name:'Beber Água', done:[false,false,false,false,false,false,false], streak:0, history:[] }] };
    case 'despesas': return { amount: '', category: 'Alimentação', description: '', history: [] };
    case 'progresso': return { goals: [{ id:genId(), title: 'Meta de Leitura', current: 0, total: 100, unit: 'pág' }] };
    case 'countdown': return { title: 'Viagem de Férias', targetDate: new Date(Date.now() + 86400000*30).toISOString().split('T')[0] };
    case 'galeria': return { images: [] };
    case 'cardapio': return { days: [
      { day: 'Segunda', lunch: {title:'', recipe:''}, dinner: {title:'', recipe:''} },
      { day: 'Terça', lunch: {title:'', recipe:''}, dinner: {title:'', recipe:''} },
      { day: 'Quarta', lunch: {title:'', recipe:''}, dinner: {title:'', recipe:''} },
      { day: 'Quinta', lunch: {title:'', recipe:''}, dinner: {title:'', recipe:''} },
      { day: 'Sexta', lunch: {title:'', recipe:''}, dinner: {title:'', recipe:''} }
    ]};
    case 'flashcards': return { cards: [{ id:genId(), front: 'Exemplo de Pergunta', back: 'Exemplo de Resposta', color: 'default' }], currentIdx: 0 };
    case 'links': return { links: [{ id:genId(), title: 'Google', url: 'https://google.com' }] };
    case 'notas': return { content: 'Minha primeira nota rápida...' };
    case 'alerta': return { title: 'IMPORTANTE', text: 'Não esqueça de conferir os prazos!', type: 'warning' };
    case 'ciclo': return { lastDate: new Date().toISOString().split('T')[0], length: 28, symptoms: [] };
    case 'menu-sub': return { links: [] };
    case 'tarefas-adv': return { tasks: [
      { id:genId(), title: 'Tarefa Exemplo', status: false, priority: 'Média', date: new Date().toISOString().split('T')[0], tags: ['Geral'], notes: '' }
    ]};
    default: return null;
  }
}

function renderPomodoro(w, idx, spId) {
  var mins = Math.floor(w.data.timeLeft / 60).toString().padStart(2, '0');
  var secs = (w.data.timeLeft % 60).toString().padStart(2, '0');
  return '<div class="w-pomodoro">' +
    '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:12px">' +
       '<button class="small-btn ' + (w.data.isWork?'accent':'') + '" style="font-size:0.6rem;padding:4px 10px" data-action="setPomoMode" data-args="' + spId + ',' + idx + ',work">FOCO</button>' +
       '<button class="small-btn ' + (!w.data.isWork?'accent':'') + '" style="font-size:0.6rem;padding:4px 10px" data-action="setPomoMode" data-args="' + spId + ',' + idx + ',break">PAUSA</button>' +
    '</div>' +
    '<div id="pomo_badge_' + w.id + '" class="w-pomodoro-badge ' + (w.data.isWork ? '' : 'break') + '">' + (w.data.isWork ? 'EM FOCO' : 'EM PAUSA') + '</div>' +
    '<div class="time ' + (w.data.isWork ? '' : 'break') + '" id="pomo_val_' + w.id + '">' + mins + ':' + secs + '</div>' +
    '<div style="display:flex;justify-content:center;gap:15px;margin-bottom:15px">' +
      '<div style="font-size:0.7rem;color:var(--text3);text-align:center">' +
        '<div style="margin-bottom:4px">Foco (min)</div>' +
        '<input class="inline-input" style="width:50px;text-align:center;padding:4px;font-size:0.8rem" type="number" value="' + Math.floor(w.data.workTime/60) + '" data-change="updatePomoTime" data-args="' + spId + ',' + idx + ',workTime">' +
      '</div>' +
      '<div style="font-size:0.7rem;color:var(--text3);text-align:center">' +
        '<div style="margin-bottom:4px">Pausa (min)</div>' +
        '<input class="inline-input" style="width:50px;text-align:center;padding:4px;font-size:0.8rem" type="number" value="' + Math.floor(w.data.breakTime/60) + '" data-change="updatePomoTime" data-args="' + spId + ',' + idx + ',breakTime">' +
      '</div>' +
    '</div>' +
    '<div class="pomo-btns">' +
      '<button class="small-btn accent" data-action="togglePomodoro" data-args="' + spId + ',' + idx + '">' + (w.data.isRunning ? 'Pausar' : 'Iniciar') + '</button>' +
      '<button class="small-btn" data-action="resetPomodoro" data-args="' + spId + ',' + idx + '">Reiniciar</button>' +
    '</div>' +
    '<audio id="pomo_beep_' + w.id + '" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto"></audio>' +
  '</div>';
}

function getISODateStr(d) {
    if (!d) return '';
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function renderHabitos(w, idx, spId) {
  var days = ['S','T','Q','Q','S','S','D'];
  var today = new Date();
  var dayOfWeek = today.getDay() || 7; 
  var weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - dayOfWeek + 1);
  var weekStartStr = getISODateStr(weekStart);

  if (!w.data.weekStart) w.data.weekStart = weekStartStr;
  
  if (w.data.weekStart !== weekStartStr) {
      w.data.habits.forEach(function(h) {
          h.done = [false,false,false,false,false,false,false];
      });
      w.data.weekStart = weekStartStr;
      setTimeout(function(){ saveState(); }, 50);
  }

  return '<div class="w-habits">' +
    '<div style="font-size:0.6rem;color:var(--text3);margin-bottom:8px;text-align:right">Semana: ' + weekStartStr.split('-').reverse().join('/') + '</div>' +
    (w.data.habits || []).map(function(h, hi) {
      return '<div class="w-habit-item">' +
        '<div class="w-habit-info">' +
          '<div class="w-habit-title" contenteditable="true" data-blur="updateHabitName" data-args="' + spId + ',' + idx + ',' + hi + '">' + DOMPurify.sanitize(h.name) + '</div>' +
          '<div style="display:flex;align-items:center;gap:5px;">' +
             '<div class="w-habit-streak">🔥 ' + (h.streak || 0) + ' dias</div>' +
             '<button class="widget-delete" style="font-size:0.6rem;padding:2px 4px" data-action="removeHabit" data-args="' + spId + ',' + idx + ',' + hi + '">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="w-habit-grid">' +
          days.map(function(d, di) {
            return '<div class="w-habit-day ' + (h.done[di]?'done':'') + '" data-action="toggleHabitDay" data-args="' + spId + ',' + idx + ',' + hi + ',' + di + '">' + d + '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('') +
    '<button class="add-widget-btn" style="margin:5px 0" data-action="addHabit" data-args="' + spId + ',' + idx + '">＋ Novo hábito</button>' +
  '</div>';
}

function renderDespesas(w, idx, spId) {
  var cats = ['Comida','Lazer','Saúde','Transporte','Compras','Outros'];
  var hist = w.data.history || [];
  return '<div class="w-expense">' +
    '<div style="display:flex;align-items:center;border-bottom:2px solid var(--border);border-top:2px solid var(--border);margin:5px 0;padding:0 10px">' +
      '<span style="font-size:1.4rem;font-weight:700;color:var(--text3);padding-right:8px">R$</span>' +
      '<input id="expense_val_' + w.id + '" style="flex:1;border:none;margin:0;font-size:1.8rem;font-weight:700;font-family:var(--font-body);color:var(--text);outline:none;background:none" type="number" placeholder="0,00" value="' + DOMPurify.sanitize(w.data.amount) + '" data-change="updateExpenseAmount" data-args="' + spId + ',' + idx + '" inputmode="decimal" step="0.01">' +
    '</div>' +
    '<div class="w-expense-cats">' +
      cats.map(function(c) {
        return '<div class="w-expense-cat ' + (w.data.category===c?'active':'') + '" data-action="updateExpenseCat" data-args="' + spId + ',' + idx + ',' + c + '">' + c + '</div>';
      }).join('') +
    '</div>' +
    '<button class="small-btn accent" data-action="saveExpense" data-args="' + spId + ',' + idx + '">Salvar Gasto</button>' +
    '<div style="margin-top:15px">' +
      '<div style="font-size:0.75rem;font-weight:600;margin-bottom:8px">Histórico</div>' +
      (hist.length === 0 ? '<div style="font-size:0.65rem;color:var(--text3)">Nenhum lançamento.</div>' : '') +
      hist.map(function(hi, i) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.75rem">' +
          '<div style="display:flex;flex-direction:column;gap:2px">' +
            '<span style="font-weight:600">' + DOMPurify.sanitize(hi.category) + '</span>' +
            '<span style="font-size:0.55rem;color:var(--text3)">' + new Date(hi.date).toLocaleDateString() + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<span style="color:var(--danger);font-weight:600">- R$ ' + parseFloat(hi.amount).toFixed(2).replace('.', ',') + '</span>' +
            '<button class="widget-delete" style="opacity:0.5;font-size:0.7rem;padding:4px" data-action="removeExpense" data-args="' + spId + ',' + idx + ',' + i + '">✕</button>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
  '</div>';
}

function renderProgresso(w, idx, spId) {
  var goals = w.data.goals || [];
  return '<div class="w-progress" style="display:flex;flex-direction:column;gap:20px">' +
    goals.map(function(g, gi) {
      var perc = Math.min(100, Math.floor((g.current / g.total) * 100)) || 0;
      return '<div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:0.8rem">' +
          '<div style="display:flex;align-items:center;gap:6px">' +
             '<span contenteditable="true" data-blur="updateProgTitle" data-args="' + spId + ',' + idx + ',' + gi + '">' + DOMPurify.sanitize(g.title) + '</span>' +
             '<button class="widget-delete" style="font-size:0.6rem;padding:2px 4px;margin-left:5px" data-action="removeProgItem" data-args="' + spId + ',' + idx + ',' + gi + '">✕</button>' +
          '</div>' +
          '<span style="margin-left:auto;cursor:pointer;color:var(--text2);font-size:0.7rem" data-action="promptProgGoal" data-args="' + spId + ',' + idx + ',' + gi + '">' + g.current + '/' + g.total + ' ✎</span>' +
        '</div>' +
        '<div class="w-prog-bar-outer"><div class="w-prog-bar-inner" style="width:' + perc + '%"></div></div>' +
        '<div class="w-prog-controls">' +
          '<span class="w-prog-val">' + perc + '% concluído</span>' +
          '<div class="w-prog-btns">' +
            '<button class="small-btn" data-action="updateProgVal" data-args="' + spId + ',' + idx + ',' + gi + ',-1">-</button>' +
            '<button class="small-btn" data-action="updateProgVal" data-args="' + spId + ',' + idx + ',' + gi + ',1">+</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
    '<button class="add-widget-btn" style="margin:5px 0" data-action="addProgItem" data-args="' + spId + ',' + idx + '">＋ Nova Barra</button>' +
  '</div>';
}

function renderCardapio(w, idx, spId) {
  var getMealVal = function(mealData) {
    if (mealData && typeof mealData === 'object') return mealData.title || '';
    return mealData || '';
  };

  var getLinkIconHTML = function(mealData) {
    var url = '';
    if (mealData && typeof mealData === 'object') {
        if (mealData.links && mealData.links.length > 0) url = mealData.links[0].url;
        else if (mealData.link) url = mealData.link;
    }

    if (url) {
      return '<a href="' + url + '" target="_blank" class="meal-link-icon" onclick="event.stopPropagation()" title="Abrir link">🔗</a>';
    }
    return '';
  };

  return '<div class="w-accordion">' +
    (w.data.days || []).map(function(d, di) {
      return '<div class="w-acc-cat" id="menu_' + w.id + '_' + di + '">' +
        '<div class="w-acc-header" data-action="toggleSubmenuOpen">' +
          '<span class="acc-title">' + d.day + '</span>' +
          '<span class="acc-arrow">▾</span>' +
        '</div>' +
        '<div class="w-acc-body">' +
          '<div class="w-acc-items">' +
            '<div class="w-menu-meal" data-action="openMenuRecipe" data-args="' + spId + ',' + idx + ',' + di + ',lunch">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
                '<label>ALMOÇO</label>' +
                getLinkIconHTML(d.lunch) +
              '</div>' +
              '<div class="meal-title">' + DOMPurify.sanitize(getMealVal(d.lunch)) + '</div>' +
            '</div>' +
            '<div class="w-menu-meal" data-action="openMenuRecipe" data-args="' + spId + ',' + idx + ',' + di + ',dinner">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
                '<label>JANTAR</label>' +
                getLinkIconHTML(d.dinner) +
              '</div>' +
              '<div class="meal-title">' + DOMPurify.sanitize(getMealVal(d.dinner)) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function renderCountdown(w, idx, spId) {
  var tdate = new Date(w.data.targetDate).getTime();
  var diff = tdate - Date.now();
  var d = 0, h = 0, m = 0, s = 0;
  if(diff > 0) {
    d = Math.floor(diff / (1000 * 60 * 60 * 24));
    h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    m = Math.floor((diff / 1000 / 60) % 60);
    s = Math.floor((diff / 1000) % 60);
  }
  var parts = w.data.targetDate.split('-');
  var dateStr = parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : w.data.targetDate;
  var htmlDigits = function(num) {
      return String(num).padStart(2,'0').split('').map(function(c) { return '<div class="w-cd-digit">' + c + '</div>'; }).join('');
  };  
  return '<div class="w-countdown">' +
    '<div class="w-cd-header">' +
      '<div class="w-cd-title" contenteditable="true" data-blur="updateCdTitle" data-args="' + spId + ',' + idx + '">' + DOMPurify.sanitize(w.data.title) + '</div>' +
      '<button class="w-cd-edit-btn" data-action="promptCdDate" data-args="' + spId + ',' + idx + '">✎</button>' +
    '</div>' +
    '<div class="w-cd-grid" id="cd_grid_' + w.id + '">' +
      '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(d) + '</div><div class="w-cd-lbl">Dias</div></div>' +
      '<div class="w-cd-sep">:</div>' +
      '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(h) + '</div><div class="w-cd-lbl">Horas</div></div>' +
      '<div class="w-cd-sep">:</div>' +
      '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(m) + '</div><div class="w-cd-lbl">Min</div></div>' +
      '<div class="w-cd-sep">:</div>' +
      '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(s) + '</div><div class="w-cd-lbl">Seg</div></div>' +
    '</div>' +
    '<div style="text-align:center;font-size:0.75rem;color:var(--text3);margin-top:12px;font-weight:600;">Data do evento: ' + DOMPurify.sanitize(dateStr) + '</div>' +
  '</div>';
}

function renderGaleria(w, idx, spId) {
  var imgs = w.data.images || [];
  if(imgs.length === 0) return '<div class="w-gallery" style="display:flex;justify-content:center;padding:20px"><div style="font-size:0.7rem;color:var(--text3)">Nenhuma imagem. Clique no + para adicionar.</div></div>';
  return '<div class="w-gallery">' +
    imgs.map(function(img, i) {
      return '<div class="w-gal-item w-gallery-item" style="background-image:url(\'' + DOMPurify.sanitize(img) + '\')" data-action="openLightbox">' +
        (window.isEditMode ? '<div class="w-gal-del" data-action="removeGalImage" data-args="' + spId + ',' + idx + ',' + i + '">✕</div>' : '') +
      '</div>';
    }).join('') +
  '</div>';
}

function renderFlashcards(w, idx, spId) {
  var cards = w.data.cards || [];
  if(cards.length === 0) return '<div class="w-flashcards"><div style="font-size:0.7rem;color:var(--text3)">Nenhum cartão.</div></div>';
  var c = cards[w.data.currentIdx || 0];
  if(!c) return '<div class="w-flashcards"><div style="font-size:0.7rem;color:var(--text3)">Cartão inválido.</div></div>';
  
  var colorClass = (c.color && c.color !== 'default') ? c.color : '';

  return '<div class="w-flashcards-container">' +
    '<div class="w-flashcards">' +
      '<div class="w-fc-card" data-action="toggleFlashcard" data-args="' + spId + ',' + idx + '">' +
        '<button class="w-fc-edit-btn" data-action="openFcEdit" data-args="' + spId + ',' + idx + '" onclick="event.stopPropagation()">✎</button>' +
        '<div class="w-fc-side ' + colorClass + '">' +
          '<div class="w-fc-lbl">FRENTE</div>' +
          '<div class="w-fc-text">' + DOMPurify.sanitize(c.front) + '</div>' +
        '</div>' +
        '<div class="w-fc-side w-fc-back ' + colorClass + '">' +
          '<div class="w-fc-lbl">VERSO</div>' +
          '<div class="w-fc-text">' + DOMPurify.sanitize(c.back) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="w-fc-nav">' +
      '<button class="small-btn" data-action="navFlashcard" data-args="' + spId + ',' + idx + ',-1">← Ant</button>' +
      '<span class="w-fc-count">' + ((w.data.currentIdx||0)+1) + ' / ' + cards.length + '</span>' +
      '<button class="small-btn" data-action="navFlashcard" data-args="' + spId + ',' + idx + ',1">Próx →</button>' +
    '</div>' +
    (window.isEditMode ? '<div style="margin-top:10px;text-align:center"><button class="small-btn accent" data-action="addFlashcard" data-args="' + spId + ',' + idx + '">＋ Adicionar Cartão</button></div>' : '') +
  '</div>';
}

function renderLinks(w, idx, spId) {
  var links = w.data.links || [];
  return '<div class="w-bookmarks">' +
    links.map(function(lk, i) {
      return '<div class="w-bk-item">' +
        '<div class="w-bk-icon">' + DOMPurify.sanitize(lk.title.charAt(0).toUpperCase()) + '</div>' +
        '<div class="w-bk-info">' +
          '<div class="w-bk-title" contenteditable="true" data-blur="updateLinkData" data-args="' + spId + ',' + idx + ',' + i + ',title">' + DOMPurify.sanitize(lk.title) + '</div>' +
          '<a href="' + lk.url + '" target="_blank" class="w-bk-url">' + lk.url + '</a>' +
        '</div>' +
        '<div style="display:flex;gap:4px">' +
          '<button class="widget-add-icon" style="border:none" data-action="editLinkUrl" data-args="' + spId + ',' + idx + ',' + i + '">✎</button>' +
          '<button class="widget-delete" style="font-size:.65rem" data-action="removeLink" data-args="' + spId + ',' + idx + ',' + i + '">✕</button>' +
        '</div>' +
      '</div>';
    }).join('') +
    '<button class="add-widget-btn" style="margin:5px 0" data-action="addLink" data-args="' + spId + ',' + idx + '">＋ Novo Link</button>' +
  '</div>';
}

function renderNotas(w, idx, spId) {
  return '<div class="w-notes">' +
    '<textarea placeholder="Digite suas notas aqui..." data-change="updateNotaData" data-args="' + spId + ',' + idx + '">' + DOMPurify.sanitize(w.data.content) + '</textarea>' +
  '</div>';
}

function renderAlerta(w, idx, spId) {
  return '<div class="w-alert-box ' + DOMPurify.sanitize(w.data.type || 'warning') + '">' +
    '<div class="w-alert-icon">' + (w.data.type === 'danger' ? '⛔' : '⚠️') + '</div>' +
    '<div class="w-alert-content">' +
      '<div class="w-alert-title" contenteditable="true" data-blur="updateAlertaData" data-args="' + spId + ',' + idx + ',title">' + DOMPurify.sanitize(w.data.title) + '</div>' +
      '<div class="w-alert-text" contenteditable="true" data-blur="updateAlertaData" data-args="' + spId + ',' + idx + ',text">' + DOMPurify.sanitize(w.data.text) + '</div>' +
    '</div>' +
    '<button class="small-btn" data-action="toggleAlertaType" data-args="' + spId + ',' + idx + '">Trocar</button>' +
  '</div>';
}

function renderCiclo(w, idx, spId) {
  var t = new Date();
  var last = new Date(w.data.lastDate);
  var diff = Math.floor((t - last) / (1000 * 60 * 60 * 24));
  var daysToNext = w.data.length - diff;
  if(daysToNext < 0) daysToNext = 0;
  var phase = 'Folicular';
  if(diff < 5) phase = 'Menstruação';
  else if(diff > 12 && diff < 16) phase = 'Ovulação';
  else if(diff > 15) phase = 'Lútea';

  return '<div class="w-cycle">' +
    '<div class="w-cycle-header">' +
      '<div class="w-cycle-circle">' +
        '<div class="w-cycle-day">' + diff + '</div>' +
        '<div class="w-cycle-lbl">Dia</div>' +
      '</div>' +
      '<div class="w-cycle-phase">' + phase + '</div>' +
      '<div style="font-size:0.65rem;color:var(--text3);margin-top:8px">Faltam ' + daysToNext + ' dias</div>' +
    '</div>' +
    '<div style="text-align:center;margin-bottom:10px">' +
       '<button class="small-btn accent" data-action="promptCicloDate" data-args="' + spId + ',' + idx + '">Ajustar Início (Última: ' + w.data.lastDate.split('-').reverse().join('/') + ')</button>' +
    '</div>' +
    '<div style="font-size:0.7rem;margin-bottom:6px">Sintomas (Hoje)</div>' +
    '<div class="w-cycle-chips">' +
      ['Cólica', 'Dor de Cabeça', 'Fadiga', 'Sensível', 'Gases'].map(function(s) {
        var active = (w.data.symptoms || []).includes(s);
        return '<div class="w-cycle-chip ' + (active ? 'active' : '') + '" data-action="toggleCicloSintoma" data-args="' + spId + ',' + idx + ',' + s + '">' + s + '</div>';
      }).join('') +
    '</div>' +
  '</div>';
}

function renderMenuSub(w, idx, spId) {
  var activeSps = state.subpages.filter(s => !s.deleted && s.id !== spId);
  return '<div class="w-subpages-menu">' +
    (w.data.links || []).map(function(lid, i) {
      var s = activeSps.find(sub => sub.id === lid);
      if(!s) return '';
      return '<div class="w-spm-item" data-action="navigate" data-args="subpage,' + s.id + '">' +
        '<div class="w-spm-title"><span style="opacity:0.6">' + s.icon + '</span> ' + DOMPurify.sanitize(s.name) + '</div>' +
        (window.isEditMode ? '<button class="widget-delete" style="font-size:.6rem" data-action="removeMenuSubLnk" data-args="' + spId + ',' + idx + ',' + i + '">✕</button>' : '') +
      '</div>';
    }).join('') +
    (window.isEditMode ? '<button class="add-widget-btn" style="margin:5px 0" data-action="promptMenuSubLnk" data-args="' + spId + ',' + idx + '">＋ Adicionar</button>' : '') +
  '</div>';
}

function renderTarefasAdv(w, idx, spId) {
  var tasks = w.data.tasks || [];
  return '<div class="w-tasks-adv">' +
    tasks.map(function(t, i) {
      var badgeClass = t.priority === 'Alta' ? 'prio-high' : '';
      return '<div class="w-task-adv-item ' + (t.status ? 'done' : '') + '">' +
        '<div class="w-task-adv-check" data-action="toggleTarefaAdv" data-args="' + spId + ',' + idx + ',' + i + '">' + (t.status ? '✓' : '') + '</div>' +
        '<div class="w-task-adv-content">' +
          '<div class="w-task-adv-title" contenteditable="true" data-blur="updateTarefaAdv" data-args="' + spId + ',' + idx + ',' + i + ',title">' + DOMPurify.sanitize(t.title) + '</div>' +
          '<div class="w-task-adv-meta">' +
            '<span class="w-task-badge ' + badgeClass + '" data-action="promptTarefaPrio" data-args="' + spId + ',' + idx + ',' + i + '">' + DOMPurify.sanitize(t.priority) + '</span>' +
            '<span class="w-task-badge" data-action="promptTarefaDate" data-args="' + spId + ',' + idx + ',' + i + '">' + DOMPurify.sanitize(t.date) + '</span>' +
            '<span class="w-task-badge" data-action="promptTarefaTags" data-args="' + spId + ',' + idx + ',' + i + '">' + (t.tags?t.tags.join(','):'Tag') + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="widget-delete" style="font-size:0.7rem;padding:4px" data-action="removeTarefaAdv" data-args="' + spId + ',' + idx + ',' + i + '">✕</button>' +
      '</div>';
    }).join('') +
    '<button class="add-widget-btn" style="margin:5px 0" data-action="addTarefaAdv" data-args="' + spId + ',' + idx + '">＋ Nova Tarefa</button>' +
  '</div>';
}

// ========== 2. MECANISMO DE SOBRESCRITA (V2) ==========

// Guardar originais
if (!window._orig_muse) {
    window._orig_muse = {
        renderWidget: window.renderWidget || (typeof renderWidget !== 'undefined' ? renderWidget : null),
        addWidget: window.addWidget || (typeof addWidget !== 'undefined' ? addWidget : null)
    };
}

// Substituir addWidget
window.addWidget = function(spId, type) {
    console.log("[Muse] addWidget chamado:", type);
    if (type === 'acordeao' && window._orig_muse.addWidget) {
        window._orig_muse.addWidget(spId, type);
        return;
    }
    var sp = state.subpages.find(function(s) { return s.id === spId; });
    if(!sp) return;
    
    var title = type;
    if (typeof WIDGET_TYPES !== 'undefined') {
        for(var i=0; i<WIDGET_TYPES.length; i++) {
            if(WIDGET_TYPES[i].type === type) { title = WIDGET_TYPES[i].label; break; }
        }
    }

    sp.widgets.push({ 
        id: genId(), 
        type: type, 
        title: title, 
        data: getCustomDefaultData(type) 
    });
    saveState(); closeWidgetPicker(); render();
};

// Substituir renderWidget
window.renderWidget = function(w, idx, spId) {
    if (w.type === 'acordeao' && window._orig_muse.renderWidget) {
        return window._orig_muse.renderWidget(w, idx, spId);
    }

    console.log("[Muse] Renderizando widget customizado:", w.type);
    var body = '';
    switch(w.type) {
      case 'pomodoro': body = renderPomodoro(w, idx, spId); break;
      case 'habitos': body = renderHabitos(w, idx, spId); break;
      case 'despesas': body = renderDespesas(w, idx, spId); break;
      case 'progresso': body = renderProgresso(w, idx, spId); break;
      case 'countdown': body = renderCountdown(w, idx, spId); break;
      case 'galeria': body = renderGaleria(w, idx, spId); break;
      case 'cardapio': body = renderCardapio(w, idx, spId); break;
      case 'flashcards': body = renderFlashcards(w, idx, spId); break;
      case 'links': body = renderLinks(w, idx, spId); break;
      case 'notas': body = renderNotas(w, idx, spId); break;
      case 'alerta': body = renderAlerta(w, idx, spId); break;
      case 'ciclo': body = renderCiclo(w, idx, spId); break;
      case 'menu-sub': body = renderMenuSub(w, idx, spId); break;
      case 'tarefas-adv': body = renderTarefasAdv(w, idx, spId); break;
      default: body = '<div style="font-size:0.7rem;color:var(--text3)">Ainda não suportado: ' + w.type + '</div>';
    }

    var icon = '◇';
    if (typeof WIDGET_TYPES !== 'undefined') {
        for(var i=0; i<WIDGET_TYPES.length; i++) {
            if(WIDGET_TYPES[i].type === w.type) { icon = WIDGET_TYPES[i].icon; break; }
        }
    }

    return '<div class="widget-container" style="animation-delay:' + (idx*0.08) + 's">' +
      '<div class="widget-header">' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          (window.isEditMode ? 
          '<div class="widget-reorder" style="display:flex;gap:2px">' +
            '<button class="small-btn" data-action="moveWidget" data-args="' + spId + ',' + idx + ',-1">▲</button>' +
            '<button class="small-btn" data-action="moveWidget" data-args="' + spId + ',' + idx + ',1">▼</button>' +
          '</div>' : '') +
          '<h3><span>' + icon + '</span> ' + DOMPurify.sanitize(w.title) + ' <span class="widget-type">' + DOMPurify.sanitize(w.type) + '</span></h3>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          (w.type === 'galeria' ? '<button class="widget-add-icon" data-action="addGalImage" data-args="' + spId + ',' + idx + '">' + (typeof ICONS !== 'undefined' ? ICONS.plus : '+') + '</button>' : '') +
          (window.isEditMode ? '<button class="widget-delete" data-action="removeWidget" data-args="' + spId + ',' + idx + '">✕</button>' : '') +
        '</div>' +
      '</div>' +
      '<div class="widget-body">' + body + '</div>' +
    '</div>';
};

// ========== 3. ENGINE DE EVENTOS WIDGETS ==========

function getWidgetDataRef(spId, wIdx) {
    if(!state || !state.subpages) return null;
    var sp = state.subpages.find(function(s) { return s.id === spId; });
    if(sp && sp.widgets) return sp.widgets[wIdx];
    return null;
}

window.pauseAllPomodoros = function() {
    if(!state || !state.subpages) return;
    state.subpages.forEach(function(sp) {
        if(!sp.widgets) return;
        sp.widgets.forEach(function(w) {
            if(w.type === 'pomodoro') w.data.isRunning = false;
        });
    });
};

window.tickPomodoros = function() {
    var needsSave = false;
    if(!state || !state.subpages) return;
    state.subpages.forEach(function(sp) {
        if(!sp.widgets) return;
        sp.widgets.forEach(function(w) {
            if(w.type === 'pomodoro' && w.data && w.data.isRunning) {
                if(w.data.timeLeft > 0) {
                    w.data.timeLeft--;
                    var valEl = document.getElementById('pomo_val_' + w.id);
                    if(valEl) {
                        var m = Math.floor(w.data.timeLeft / 60).toString().padStart(2, '0');
                        var s = (w.data.timeLeft % 60).toString().padStart(2, '0');
                        valEl.textContent = m + ':' + s;
                    }
                    needsSave = true;
                } else {
                    w.data.isRunning = false;
                    var beep = document.getElementById('pomo_beep_' + w.id);
                    if(beep) beep.play();
                    w.data.isWork = !w.data.isWork;
                    w.data.timeLeft = w.data.isWork ? w.data.workTime : w.data.breakTime;
                    if(typeof render === 'function') render();
                }
            }
        });
    });
    if(needsSave) saveState();
};

window.tickCountdowns = function() {
    if(!state || !state.subpages) return;
    state.subpages.forEach(function(sp) {
        if(!sp.widgets) return;
        var needsRender = false;
        sp.widgets.forEach(function(w) {
            if(w.type === 'countdown' && w.data && w.data.targetDate) {
                // To avoid full re-renders, we'll only update if render returns or we can manually update UI if we had IDs.
                // However, the easiest trick without full re-render is to re-render if we hit zero, or just do a light DOM update.
                // Let's rely on standard full render here but throttle it or just do manual update.
                // Since this runs every second, full render is bad. Let's assign an ID to the countdown grid.
                var el = document.getElementById('cd_grid_' + w.id);
                if(el) {
                    var tdate = new Date(w.data.targetDate).getTime();
                    var diff = tdate - Date.now();
                    var d = 0, h = 0, m = 0, s = 0;
                    if(diff > 0) {
                        d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        m = Math.floor((diff / 1000 / 60) % 60);
                        s = Math.floor((diff / 1000) % 60);
                    }
                    var htmlDigits = function(num) {
                        return String(num).padStart(2,'0').split('').map(function(c) { return '<div class="w-cd-digit">' + c + '</div>'; }).join('');
                    };
                    var html = '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(d) + '</div><div class="w-cd-lbl">Dias</div></div>' +
                               '<div class="w-cd-sep">:</div>' +
                               '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(h) + '</div><div class="w-cd-lbl">Horas</div></div>' +
                               '<div class="w-cd-sep">:</div>' +
                               '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(m) + '</div><div class="w-cd-lbl">Min</div></div>' +
                               '<div class="w-cd-sep">:</div>' +
                               '<div class="w-cd-group"><div class="w-cd-digits">' + htmlDigits(s) + '</div><div class="w-cd-lbl">Seg</div></div>';
                    if (el.innerHTML !== html) {
                        el.innerHTML = html;
                    }
                }
            }
        });
    });
};

var WIDGET_ACTION_HANDLERS = {
    // Pomodoro
    setPomoMode: function(spId, wIdx, mode) {
        window.pauseAllPomodoros();
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        w.data.isWork = (mode === 'work');
        w.data.timeLeft = w.data.isWork ? w.data.workTime : w.data.breakTime;
        saveState(); render();
    },
    togglePomodoro: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        w.data.isRunning = !w.data.isRunning;
        saveState(); render();
    },
    resetPomodoro: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        w.data.isRunning = false;
        w.data.timeLeft = w.data.isWork ? w.data.workTime : w.data.breakTime;
        saveState(); render();
    },
    updatePomoTime: function(spId, wIdx, field, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        var v = parseInt(val);
        if(!isNaN(v) && v > 0) w.data[field] = v * 60;
        if(!w.data.isRunning) w.data.timeLeft = w.data.isWork ? w.data.workTime : w.data.breakTime;
        saveState(); render();
    },
    // Habitos
    addHabit: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        if(!w.data.habits) w.data.habits = [];
        w.data.habits.push({ id: genId(), name: 'Novo Hábito', done: [false,false,false,false,false,false,false], streak: 0, history: [] });
        saveState(); render();
    },
    toggleHabitDay: function(spId, wIdx, hIdx, dIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w || !w.data.habits[hIdx]) return;
        var h = w.data.habits[hIdx];
        h.done[dIdx] = !h.done[dIdx];
        
        if(!h.history) {
            h.history = [];
            if(h.streak > 0) {
                var fillDate = new Date();
                fillDate.setDate(fillDate.getDate() - 1);
                for(var st=0; st<h.streak; st++) {
                    h.history.unshift(fillDate.getFullYear() + '-' + String(fillDate.getMonth()+1).padStart(2,'0') + '-' + String(fillDate.getDate()).padStart(2,'0'));
                    fillDate.setDate(fillDate.getDate() - 1);
                }
            }
        }
        
        var wsParts = w.data.weekStart ? w.data.weekStart.split('-') : [];
        var d = wsParts.length === 3 ? new Date(parseInt(wsParts[0]), parseInt(wsParts[1])-1, parseInt(wsParts[2])) : new Date();
        d.setDate(d.getDate() + dIdx - (d.getDay()||7) + 1); // fix to align accurately based on index from 0 to 6
        var todayVal = new Date();
        var wsDateObj = new Date(todayVal);
        wsDateObj.setDate(wsDateObj.getDate() - (wsDateObj.getDay() || 7) + 1);
        if(wsParts.length === 3) {
            wsDateObj = new Date(parseInt(wsParts[0]), parseInt(wsParts[1])-1, parseInt(wsParts[2]));
        }
        var targetDate = new Date(wsDateObj);
        targetDate.setDate(targetDate.getDate() + dIdx);
        var sCheck = targetDate.getFullYear() + '-' + String(targetDate.getMonth()+1).padStart(2,'0') + '-' + String(targetDate.getDate()).padStart(2,'0');
        
        if(h.done[dIdx]) {
            if(h.history.indexOf(sCheck) === -1) h.history.push(sCheck);
        } else {
            h.history = h.history.filter(function(x) { return x !== sCheck; });
        }
        
        var dates = h.history.sort();
        var streak = 0;
        if(dates.length > 0) {
            var latestStr = dates[dates.length - 1]; // "YYYY-MM-DD"
            var parts = latestStr.split('-');
            var checkDate = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
            for(var i=0; i<3650; i++) {
                var cs = checkDate.getFullYear() + '-' + String(checkDate.getMonth()+1).padStart(2,'0') + '-' + String(checkDate.getDate()).padStart(2,'0');
                if(h.history.indexOf(cs) !== -1) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }
        h.streak = streak;
        saveState(); render();
    },
    updateHabitName: function(spId, wIdx, hIdx, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.habits[hIdx]) { w.data.habits[hIdx].name = val; saveState(); }
    },
    removeHabit: function(spId, wIdx, hIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.habits) { w.data.habits.splice(hIdx, 1); saveState(); render(); }
    },
    // Despesas
    updateExpenseAmount: function(spId, wIdx, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) { w.data.amount = val; saveState(); }
    },
    updateExpenseCat: function(spId, wIdx, cat) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) { w.data.category = cat; saveState(); render(); }
    },
    saveExpense: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        var inputEl = document.getElementById('expense_val_' + w.id);
        var val = inputEl ? inputEl.value : w.data.amount;
        if(!val) return;
        var doSave = function(catName) {
            if(!w.data.history) w.data.history = [];
            w.data.history.unshift({ date: new Date().toISOString(), category: catName, amount: parseFloat(val) });
            w.data.amount = '';
            saveState(); render();
        };
        if(w.data.category === 'Outros' && typeof musePrompt !== 'undefined') {
            musePrompt('Descrição do Gasto', 'Ex: Conta de Luz').then(function(desc) {
                var finalCat = desc ? 'Outros: ' + desc : 'Outros';
                doSave(finalCat);
            });
        } else {
            doSave(w.data.category);
        }
    },
    removeExpense: function(spId, wIdx, hIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.history) { w.data.history.splice(hIdx, 1); saveState(); render(); }
    },
    // Progresso
    addProgItem: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        if(!w.data.goals) w.data.goals = [];
        w.data.goals.push({ id: genId(), title: 'Nova Meta', current: 0, total: 100, unit: '%' });
        saveState(); render();
    },
    updateProgVal: function(spId, wIdx, gIdx, dir) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w || !w.data.goals[gIdx]) return;
        var g = w.data.goals[gIdx];
        g.current += parseInt(dir);
        if(g.current < 0) g.current = 0;
        if(g.current > g.total) g.current = g.total;
        saveState(); render();
    },
    promptProgGoal: function(spId, wIdx, gIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w || !w.data.goals[gIdx]) return;
        if(typeof musePrompt !== 'undefined') {
            musePrompt('Editar Meta', 'Digite o total alvo:').then(function(val) {
                var v = parseInt(val);
                if(!isNaN(v) && v > 0) { w.data.goals[gIdx].total = v; saveState(); render(); }
            });
        }
    },
    updateProgTitle: function(spId, wIdx, gIdx, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.goals[gIdx]) { w.data.goals[gIdx].title = val; saveState(); }
    },
    removeProgItem: function(spId, wIdx, gIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.goals) { w.data.goals.splice(gIdx, 1); saveState(); render(); }
    },
    // Acordeao global actions (menu/recipe)
    toggleSubmenuOpen: function(spId, wIdx, arg2, arg3, el) {
        var c = el.closest('.w-acc-cat');
        if(c) {
            if(c.classList.contains('open')) c.classList.remove('open');
            else c.classList.add('open');
        }
    },
    // Contagem Regressiva
    promptCdDate: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        if(typeof musePrompt !== 'undefined') {
            musePrompt('Alterar Data', 'Ex: 01082026 ou 01/08/2026').then(function(val) {
                if(!val) return;
                var cleanVal = val.replace(/[^\d\-\/]/g, '');
                if(cleanVal.match(/^\d{8}$/)) { 
                    w.data.targetDate = cleanVal.substring(4,8) + '-' + cleanVal.substring(2,4) + '-' + cleanVal.substring(0,2);
                    saveState(); render();
                } else if(cleanVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    var parts = cleanVal.split('/');
                    w.data.targetDate = parts[2] + '-' + parts[1] + '-' + parts[0]; 
                    saveState(); render(); 
                } else if(cleanVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    w.data.targetDate = cleanVal; 
                    saveState(); render(); 
                }
            });
        }
    },
    updateCdTitle: function(spId, wIdx, arg2, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) { w.data.title = val; saveState(); }
    },
    // Galeria
    addGalImage: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w) return;
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if(file) {
                var reader = new FileReader();
                reader.onload = function(evt) {
                    if(!w.data.images) w.data.images = [];
                    w.data.images.push(evt.target.result);
                    saveState(); render();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    },
    removeGalImage: function(spId, wIdx, iIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.images) { w.data.images.splice(iIdx, 1); saveState(); render(); }
    },
    // Flashcards
    addFlashcard: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) {
            if(!w.data.cards) w.data.cards=[];
            w.data.cards.push({id:genId(), front:'Nova Pergunta?', back:'Nova Resposta', color: 'default'});
            w.data.currentIdx = w.data.cards.length - 1;
            saveState(); render();
        }
    },
    navFlashcard: function(spId, wIdx, dir) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.cards) {
            w.data.currentIdx = (w.data.currentIdx || 0) + parseInt(dir);
            if(w.data.currentIdx < 0) w.data.currentIdx = w.data.cards.length - 1;
            if(w.data.currentIdx >= w.data.cards.length) w.data.currentIdx = 0;
            saveState(); render();
        }
    },
    toggleFlashcard: function(spId, wIdx, arg2, arg3, el) {
        if(el) {
            if(el.classList.contains('flipped')) el.classList.remove('flipped');
            else el.classList.add('flipped');
        }
    },
    updateFcData: function(spId, wIdx, side, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.cards && w.data.cards[w.data.currentIdx || 0]) {
            w.data.cards[w.data.currentIdx || 0][side] = val;
            saveState();
        }
    },
    openFcEdit: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(!w || !w.data.cards) return;
        var c = w.data.cards[w.data.currentIdx || 0];
        if(!c) return;
        
        window._fcEditCtx = { spId: spId, wIdx: wIdx };
        document.getElementById('fcEditFront').value = c.front;
        document.getElementById('fcEditBack').value = c.back;
        
        // Setup color selector
        var chips = document.querySelectorAll('#fcColorSelector .w-cycle-chip');
        chips.forEach(function(chip) {
            var color = chip.getAttribute('data-color');
            if(color === (c.color || 'default')) chip.classList.add('active');
            else chip.classList.remove('active');
        });
        
        document.getElementById('fcEditOverlay').classList.add('open');
    },
    saveFcEdit: function() {
        var ctx = window._fcEditCtx;
        if(ctx) {
            var w = getWidgetDataRef(ctx.spId, ctx.wIdx);
            if(w && w.data.cards) {
                var c = w.data.cards[w.data.currentIdx || 0];
                if(c) {
                    c.front = document.getElementById('fcEditFront').value;
                    c.back = document.getElementById('fcEditBack').value;
                    
                    var activeChip = document.querySelector('#fcColorSelector .w-cycle-chip.active');
                    if(activeChip) c.color = activeChip.getAttribute('data-color');
                    
                    saveState();
                    render();
                }
            }
        }
        document.getElementById('fcEditOverlay').classList.remove('open');
    },
    closeFcEdit: function() {
        document.getElementById('fcEditOverlay').classList.remove('open');
    },
    removeFlashcard: function() {
        var ctx = window._fcEditCtx;
        if(ctx && typeof museConfirm !== 'undefined') {
            museConfirm('Excluir Cartão', 'Deseja realmente excluir este cartão?').then(function(ok) {
                if(ok) {
                    var w = getWidgetDataRef(ctx.spId, ctx.wIdx);
                    if(w && w.data.cards) {
                        w.data.cards.splice(w.data.currentIdx || 0, 1);
                        if(w.data.currentIdx >= w.data.cards.length) {
                            w.data.currentIdx = Math.max(0, w.data.cards.length - 1);
                        }
                        saveState();
                        render();
                    }
                    document.getElementById('fcEditOverlay').classList.remove('open');
                }
            });
        }
    },
    setFcColor: function(spId, wIdx, color, arg3, el) {
        var chips = document.querySelectorAll('#fcColorSelector .w-cycle-chip');
        chips.forEach(function(chip) { chip.classList.remove('active'); });
        if(el) el.classList.add('active');
    },
    // Links
    addLink: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) {
            if(!w.data.links) w.data.links=[];
            w.data.links.push({id:genId(), title:'Novo Link', url:'https://'});
            saveState(); render();
        }
    },
    removeLink: function(spId, wIdx, lIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.links) { w.data.links.splice(lIdx, 1); saveState(); render(); }
    },
    updateLinkData: function(spId, wIdx, lIdx, key, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.links[lIdx]) { w.data.links[lIdx][key] = val; saveState(); }
    },
    editLinkUrl: function(spId, wIdx, lIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.links[lIdx]) {
            if(typeof musePrompt !== 'undefined') {
                musePrompt('Editar URL', w.data.links[lIdx].url || 'https://').then(function(val) {
                    if(val) {
                        console.log("[Muse] Salvando nova URL:", val);
                        var finalUrl = val.trim();
                        if (!finalUrl.match(/^https?:\/\//i)) {
                            finalUrl = 'https://' + finalUrl;
                        }
                        w.data.links[lIdx].url = finalUrl; 
                        saveState(); render(); 
                    }
                });
            }
        }
    },
    // Notas
    updateNotaData: function(spId, wIdx, arg2, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) { w.data.content = val; saveState(); }
    },
    // Alerta
    toggleAlertaType: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) {
            if(w.data.type === 'warning') w.data.type = 'danger';
            else w.data.type = 'warning';
            saveState(); render();
        }
    },
    updateAlertaData: function(spId, wIdx, field, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) { w.data[field] = val; saveState(); }
    },
    // Ciclo
    promptCicloDate: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && typeof musePrompt !== 'undefined') {
            musePrompt('Última Menstruação', 'AAAA-MM-DD').then(function(val) {
                if(val && val.match(/^\d{4}-\d{2}-\d{2}$/)) { w.data.lastDate = val; saveState(); render(); }
            });
        }
    },
    toggleCicloSintoma: function(spId, wIdx, arg2, arg3, el) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) {
            if(!w.data.symptoms) w.data.symptoms = [];
            var s = el.textContent;
            var i = w.data.symptoms.indexOf(s);
            if(i > -1) w.data.symptoms.splice(i, 1);
            else w.data.symptoms.push(s);
            saveState(); render();
        }
    },
    // Sub-Menu
    promptMenuSubLnk: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && typeof musePrompt !== 'undefined') {
            var activeSps = state.subpages.filter(function(s) { return !s.deleted && s.id !== spId; });
            var msg = 'IDs disponíveis: \n' + activeSps.map(function(s){return s.id + ' (' + s.name + ')'}).join('\n');
            museConfirm('Adicionar Subpágina', msg).then(function(ok) {
                if(ok) musePrompt('ID da Subpágina', '').then(function(val) {
                    if(val) {
                        if(!w.data.links) w.data.links = [];
                        w.data.links.push(val); 
                        saveState(); render();
                    }
                });
            });
        }
    },
    removeMenuSubLnk: function(spId, wIdx, lIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.links) { w.data.links.splice(lIdx, 1); saveState(); render(); }
    },
    // Tarefas
    addTarefaAdv: function(spId, wIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w) {
            if(!w.data.tasks) w.data.tasks = [];
            w.data.tasks.push({ id: genId(), title: 'Nova Tarefa', status: false, priority: 'Média', date: new Date().toISOString().split('T')[0], tags: ['Add Tag'], notes: '' });
            saveState(); render();
        }
    },
    removeTarefaAdv: function(spId, wIdx, tIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.tasks) { w.data.tasks.splice(tIdx, 1); saveState(); render(); }
    },
    toggleTarefaAdv: function(spId, wIdx, tIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.tasks[tIdx]) { w.data.tasks[tIdx].status = !w.data.tasks[tIdx].status; saveState(); render(); }
    },
    updateTarefaAdv: function(spId, wIdx, tIdx, val) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.tasks[tIdx]) { w.data.tasks[tIdx].title = val; saveState(); }
    },
    promptTarefaPrio: function(spId, wIdx, tIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.tasks[tIdx] && typeof musePrompt !== 'undefined') {
            musePrompt('Prioridade (Alta/Média/Baixa)', '').then(function(val) {
                if(val) { w.data.tasks[tIdx].priority = val; saveState(); render(); }
            });
        }
    },
    promptTarefaDate: function(spId, wIdx, tIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.tasks[tIdx] && typeof musePrompt !== 'undefined') {
            musePrompt('Data (AAAA-MM-DD)', '').then(function(val) {
                if(val && val.match(/^\d{4}-\d{2}-\d{2}$/)) { w.data.tasks[tIdx].date = val; saveState(); render(); }
            });
        }
    },
    promptTarefaTags: function(spId, wIdx, tIdx) {
        var w = getWidgetDataRef(spId, wIdx);
        if(w && w.data.tasks[tIdx] && typeof musePrompt !== 'undefined') {
            musePrompt('Tags (separadas por vírgula)', '').then(function(val) {
                if(val) { w.data.tasks[tIdx].tags = val.split(',').map(function(s){return s.trim()}); saveState(); render(); }
            });
        }
    },
    // Menu Recipe Actions
    closeMenuRecipe: function() {
        document.getElementById('menuRecipeOverlay').classList.remove('open');
    },
    saveMenuRecipe: function() {
        window.saveMenuRecipe();
    },
    insertLinkMenuRecipe: function() {
        if(typeof musePrompt !== 'undefined') {
            var ctx = window._menuRecipeCtx;
            if (!ctx) return;
            
            musePrompt('Link da Receita (URL)', 'https://').then(function(val) {
                if(!val || val === 'https://') return;
                
                var finalUrl = val.trim();
                if (!finalUrl.match(/^https?:\/\//i)) {
                    finalUrl = 'https://' + finalUrl;
                }
                
                musePrompt('Texto do Link (opcional)', 'Ver Receita').then(function(text) {
                    var linkText = text || 'Ver Receita';
                    var html = '<a href="' + finalUrl + '" target="_blank" rel="noopener">' + linkText + '</a>';
                    
                    var el = document.getElementById('menuRecipeContent');
                    if(el) { el.focus(); document.execCommand('insertHTML', false, html); }

                    // Salvar o link no objeto da refeição
                    var sp = state.subpages.find(function(s) { return s.id === ctx.spId; });
                    if (sp && sp.widgets[ctx.wIdx]) {
                        var m = sp.widgets[ctx.wIdx].data.days[ctx.dayIdx][ctx.mealType];
                        if (typeof m === 'object') {
                            if (!m.links) m.links = [];
                            m.links.push({ title: linkText, url: finalUrl });
                            renderMenuRecipeLinks(m);
                        }
                    }
                });
            });
        }
    },
    removeMenuLink: function(lIdx) {
        var ctx = window._menuRecipeCtx;
        if (!ctx) return;
        var sp = state.subpages.find(function(s) { return s.id === ctx.spId; });
        if (sp && sp.widgets[ctx.wIdx]) {
            var m = sp.widgets[ctx.wIdx].data.days[ctx.dayIdx][ctx.mealType];
            if (m.links && m.links[lIdx]) {
                m.links.splice(lIdx, 1);
                renderMenuRecipeLinks(m);
            }
        }
    }
};

document.addEventListener('click', function(e) {
  var bt = e.target.closest('[data-action]');
  if(!bt) return;
  var action = bt.getAttribute('data-action');
  var argsStr = bt.getAttribute('data-args') || '';
  var args = argsStr.split(',');

  if(action === 'openMenuRecipe') { openMenuRecipe(args[0], parseInt(args[1]), parseInt(args[2]), args[3]); }
  else if (WIDGET_ACTION_HANDLERS[action]) {
      WIDGET_ACTION_HANDLERS[action](args[0], parseInt(args[1]), args[2], args[3], bt);
  }
});

document.addEventListener('focusout', function(e) {
  var el = e.target.closest('[data-blur]');
  if(!el) return;
  var action = el.getAttribute('data-blur');
  var argsStr = el.getAttribute('data-args') || '';
  var args = argsStr.split(',');

  if (WIDGET_ACTION_HANDLERS[action]) {
      WIDGET_ACTION_HANDLERS[action](args[0], parseInt(args[1]), args[2], el.textContent);
  }
});

document.addEventListener('change', function(e) {
  var el = e.target.closest('[data-change]');
  if(!el) return;
  var action = el.getAttribute('data-change');
  var argsStr = el.getAttribute('data-args') || '';
  var args = argsStr.split(',');

  if (WIDGET_ACTION_HANDLERS[action]) {
      WIDGET_ACTION_HANDLERS[action](args[0], parseInt(args[1]), args[2], el.value);
  }
});

// Nota: Adicione as funções de modal/receita aqui se necessário
function renderMenuRecipeLinks(meal) {
    var listEl = document.getElementById('menuRecipeLinksList');
    if (!listEl) return;
    
    if (!meal.links || meal.links.length === 0) {
        listEl.innerHTML = '<div style="font-size:0.65rem;color:var(--text3);padding:10px;text-align:center">Nenhum link adicionado.</div>';
        return;
    }
    
    listEl.innerHTML = meal.links.map(function(lk, i) {
        return '<div class="w-link-item">' +
            '<div class="link-text">' + DOMPurify.sanitize(lk.title) + '</div>' +
            '<a href="' + lk.url + '" target="_blank" class="link-url">' + lk.url.replace(/^https?:\/\//, '') + '</a>' +
            '<div class="w-link-del" data-action="removeMenuLink" data-args="' + i + '">✕</div>' +
        '</div>';
    }).join('');
}

function openMenuRecipe(spId, wIdx, dayIdx, mealType) {
    console.log("[Muse] Abrindo receita:", dayIdx, mealType);
    var sp = state.subpages.find(function(s) { return s.id === spId; });
    if (!sp || !sp.widgets[wIdx]) return;
    var day = sp.widgets[wIdx].data.days[dayIdx];
    var meal = day[mealType];
    
    if (typeof meal === 'string') {
        meal = { title: meal, recipe: '', links: [] };
        day[mealType] = meal;
    }

    // Migração de link único para array se necessário
    if (meal.link && (!meal.links || meal.links.length === 0)) {
        meal.links = [{ title: 'Ver Receita', url: meal.link }];
        delete meal.link;
    }
    if (!meal.links) meal.links = [];
    
    window._menuRecipeCtx = { spId: spId, wIdx: wIdx, dayIdx: dayIdx, mealType: mealType };
    
    document.getElementById('menuRecipeMealLabel').textContent = mealType === 'lunch' ? '✦ ALMOÇO' : '✦ JANTAR';
    document.getElementById('menuRecipeDayLabel').textContent = day.day;
    document.getElementById('menuRecipeTitle').value = meal.title || '';
    document.getElementById('menuRecipeContent').innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(meal.recipe || '', DP_CONFIG) : meal.recipe || '';
    
    renderMenuRecipeLinks(meal);
    document.getElementById('menuRecipeOverlay').classList.add('open');
}

window.saveMenuRecipe = function() {
    var ctx = window._menuRecipeCtx;
    if (ctx) {
        var sp = state.subpages.find(function(s) { return s.id === ctx.spId; });
        if (sp && sp.widgets[ctx.wIdx]) {
            var meal = sp.widgets[ctx.wIdx].data.days[ctx.dayIdx][ctx.mealType];
            meal.title = document.getElementById('menuRecipeTitle').value;
            meal.recipe = document.getElementById('menuRecipeContent').innerHTML;
            saveState();
            render();
        }
    }
    document.getElementById('menuRecipeOverlay').classList.remove('open');
};

console.log("[Muse] widgets.js carregado com sucesso.");
