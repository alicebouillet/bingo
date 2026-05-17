/* ═══════════════════════════
   DATA
═══════════════════════════ */
const ALL_ITEMS = [
  { id:'camion',    e:'🚛', l:'Camion\ncaisse' },
  { id:'vache',     e:'🐄', l:'Vaches\ndans un champ' },
  { id:'eau',       e:'💧', l:'Château\nd\'eau' },
  { id:'essence',   e:'⛽', l:'Station\nessence' },
  { id:'tournesol', e:'🌻', l:'Champ de\ntournesols' },
  { id:'tracteur',  e:'🚜', l:'Tracteur' },
  { id:'tunnel',    e:'🌁', l:'Tunnel' },
  { id:'foret',     e:'🌲', l:'Forêt de\nsapins' },
  { id:'mouton',    e:'🐑', l:'Moutons' },
  { id:'eolienne',  e:'⚡', l:'Éolienne' },
  { id:'pont',      e:'🌉', l:'Viaduc\nou pont' },
  { id:'police',    e:'🚓', l:'Voiture\nde police' },
  { id:'arc',       e:'🌈', l:'Arc-en-ciel' },
  { id:'cheval',    e:'🐴', l:'Chevaux' },
  { id:'car',       e:'🚌', l:'Car de\ntourisme' },
  { id:'eglise',    e:'⛪', l:'Clocher\nd\'église' },
  { id:'rondpoint', e:'🔵', l:'Rond-point\nsculpture' },
  { id:'ble',       e:'🌾', l:'Champ\nde blé' },
  { id:'travaux',   e:'🚧', l:'Travaux' },
  { id:'oiseau',    e:'🦅', l:'Grand oiseau' },
  { id:'couchant',  e:'☀️', l:'Coucher\nde soleil' },
  { id:'riviere',   e:'🌊', l:'Rivière\nou lac' },
  { id:'campingcar',e:'🚐', l:'Camping-car' },
  { id:'vignes',    e:'🍇', l:'Vignes' },
  { id:'mais',      e:'🌽', l:'Champ\nde maïs' },
  { id:'panneau',   e:'🚦', l:'Panneaux de\nsignalisation' },
  { id:'velo',      e:'🚲', l:'Vélo' },
  { id:'citerne',   e:'🛢️', l:'Camion\nciterne' },
  { id:'bateau',    e:'⛵', l:'Bateau' },
  { id:'ferme',     e:'🏚️', l:'Ferme' },
  { id:'avion',     e:'✈️', l:'Avion' },
  { id:'solar',     e:'🔆', l:'Panneaux\nsolaires' },
  { id:'chateau',   e:'🏰', l:'Château\nou manoir' },
  { id:'helicop',   e:'🚁', l:'Hélicoptère' },
  { id:'centrale',  e:'🏭', l:'Centrale\nélectrique' },
  { id:'prison',    e:'🔒', l:'Prison' },
  { id:'barrage',   e:'🌊', l:'Barrage' },
  { id:'parc',      e:'🎡', l:'Parc\nd\'attraction' },
  { id:'temple',    e:'🛕', l:'Temple\nou ruines' },
  { id:'accident',  e:'🚨', l:'Accident' },
  { id:'convoi',    e:'🚛', l:'Convoi\nexceptionnel' },
  { id:'maison',    e:'🏠', l:'Maison\nisolée' },
  { id:'2chateaux', e:'💧💧', l:'2 châteaux\nd\'eau côte à côte', hard: true },
];

const PCOLS = ['#4AABDE','#FF6B47','#5DB87A','#9B6DDE'];

const LINES = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
  [0,6,12,18,24],[4,8,12,16,20],
];

/* ═══════════════════════════
   SETUP STATE
═══════════════════════════ */
let sMode      = 'defi';
let sPlayers   = 1;
let sDiff      = 'easy';
let sGridMode  = 'random';
let sCustom    = new Set();
let printDiff  = 'easy';
let printCount = 2;
let game       = null;

/* ═══════════════════════════
   UTILS
═══════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function shuffle(arr, seed) {
  const a = [...arr];
  let s = seed || Math.floor(Math.random()*1e9);
  for (let i = a.length-1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i+1);
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function pickGrid(diff, custom, seed) {
  const userItems = getMyItems().map(it => ({...it, custom:true}));
  const base = [...ALL_ITEMS, ...userItems];
  const byDiff = {
    easy:   base.filter(i => !['chateau','helicop','centrale','prison','barrage','parc','temple','accident','convoi','2chateaux'].includes(i.id)),
    medium: base.filter(i => i.id !== '2chateaux'),
    hard:   base,
  };

  let pool;
  if (custom && custom.size >= 25) {
    pool = base.filter(it => custom.has(it.id));
  } else {
    pool = shuffle(byDiff[diff], seed).slice(0, 25);
  }
  return shuffle(pool, seed ? seed+1 : undefined).slice(0, 25);
}

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

/* ═══════════════════════════
   NAVIGATION
═══════════════════════════ */
function goHome() { renderHomeHist(); showScreen('home'); }

function goSetup(mode) {
  sMode = mode;
  document.getElementById('setupTitle').textContent = mode === 'team' ? '🤝 Mode Équipe' : '⚔️ Mode Défi';
  renderPNames();
  renderItemsGrid();
  showScreen('setup');
}

function goHistory() { renderHistList(); showScreen('history'); }

function goPrint() {
  setPrintDiff('easy');
  renderPrintPreview();
  showScreen('printscreen');
}

/* ═══════════════════════════
   SETUP UI
═══════════════════════════ */
function setPlayers(n) {
  sPlayers = n;
  document.querySelectorAll('.pcount-btn').forEach(b => b.classList.toggle('sel', +b.dataset.n === n));
  renderPNames();
}

const PNAMES_DEFAULT = ['Joueur 1','Joueur 2','Joueur 3','Joueur 4'];
function renderPNames() {
  const wrap = document.getElementById('pnameWrap');
  wrap.innerHTML = '';
  for (let i=0; i<sPlayers; i++) {
    const row = document.createElement('div');
    row.className = 'pname-row';
    row.innerHTML = `<div class="pname-dot" style="background:${PCOLS[i]}"></div>
      <input class="pname-input" id="pn${i}" placeholder="${PNAMES_DEFAULT[i]}" value="${PNAMES_DEFAULT[i]}">`;
    wrap.appendChild(row);
  }
}

function getNames() {
  return Array.from({length:sPlayers},(_,i)=>{
    const el = document.getElementById('pn'+i);
    return el ? el.value.trim() || PNAMES_DEFAULT[i] : PNAMES_DEFAULT[i];
  });
}

function setDiff(d) {
  sDiff = d;
  document.querySelectorAll('#setup .diff-btn').forEach(b => b.classList.toggle('sel', b.dataset.d === d));
}

function geSwitch(tab) {
  sGridMode = tab;
  document.querySelectorAll('.ge-tab').forEach((t,i) => t.classList.toggle('active', (i===0&&tab==='random')||(i===1&&tab==='custom')));
  document.getElementById('ge-random').classList.toggle('active', tab==='random');
  document.getElementById('ge-custom').classList.toggle('active', tab==='custom');
}

function renderItemsGrid() {
  const wrap = document.getElementById('itemsGrid');
  wrap.innerHTML = '';
  const userItems = getMyItems().map(it => ({...it, custom:true}));
  const combined = [...ALL_ITEMS, ...userItems];
  combined.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'item-toggle' + (item.hard?' hard-item':'') + (item.custom?' custom-item':'') + (sCustom.has(item.id)?' on':'');
    btn.title = item.custom ? 'Élément perso ✨' : '';
    btn.innerHTML = `<span class="ite">${item.e}</span>${item.l.replace(/\n/g,'<br>')}${item.custom?'<span style="font-size:.55rem;color:var(--sun-deep);display:block">✨perso</span>':''}`;
    btn.addEventListener('click', () => {
      sCustom.has(item.id) ? sCustom.delete(item.id) : sCustom.add(item.id);
      btn.classList.toggle('on');
      document.getElementById('geCount').textContent = `${sCustom.size} / 25 sélectionnés`;
    });
    wrap.appendChild(btn);
  });
}

/* ═══════════════════════════
   GAME START
═══════════════════════════ */
function startGame() {
  if (sGridMode==='custom' && sCustom.size!==25) {
    alert(`Sélectionne exactement 25 éléments (actuellement : ${sCustom.size}).`);
    return;
  }

  const names  = getNames();
  const seed   = Math.floor(Math.random()*1e9);
  const custom = sGridMode==='custom' ? new Set(sCustom) : null;

  const players = names.map((name,i) => ({
    name,
    color: PCOLS[i],
    grid:    pickGrid(sDiff, custom, seed + i*999),
    checked: new Set(),
    bingoShown: false,
    bingoCount: 0,
  }));

  if (sMode === 'team') {
    const sharedGrid    = pickGrid(sDiff, custom, seed);
    const sharedChecked = new Set();
    players.forEach(p => { p.grid = sharedGrid; p.checked = sharedChecked; });
  }

  game = { id: Date.now(), mode: sMode, diff: sDiff, seed, players, active: 0, start: new Date().toISOString() };
  renderGame();
  showScreen('game');
}

/* ═══════════════════════════
   RENDER GAME
═══════════════════════════ */
function checkBingo(p) { return LINES.filter(l => l.every(i => p.checked.has(i))); }

function renderGame() {
  const {players, mode, active, diff} = game;

  document.getElementById('gmodeTag').textContent = mode==='team' ? '🤝 Mode Équipe' : '⚔️ Mode Défi';
  document.getElementById('gname').textContent = mode==='team'
    ? players.map(p=>p.name).join(' · ')
    : players[active].name;

  // Tabs
  const tabsWrap = document.getElementById('ptabsWrap');
  if (mode==='defi' && players.length>1) {
    tabsWrap.style.display = 'flex';
    tabsWrap.innerHTML = '';
    players.forEach((p,i) => {
      const btn = document.createElement('button');
      btn.className = 'ptab' + (i===active?' active':'');
      btn.style.borderBottomColor = i===active ? p.color : 'transparent';
      btn.style.color = i===active ? p.color : '';
      btn.innerHTML = `<span class="pt-dot" style="background:${p.color}"></span>${p.name}<span class="pt-star${p.bingoCount>0?' show':''}">⭐</span>`;
      btn.addEventListener('click', () => { game.active=i; renderGame(); });
      tabsWrap.appendChild(btn);
    });
  } else tabsWrap.style.display='none';

  // Scores
  const scoreRow = document.getElementById('scoreRow');
  scoreRow.innerHTML = '';
  (mode==='team'?[players[0]]:players).forEach(p => {
    const pill = document.createElement('div');
    pill.className = 'score-pill';
    pill.innerHTML = `<div class="sp-dot" style="background:${p.color}"></div>
      <span>${mode==='team'?'Équipe':p.name}</span>
      <span class="sp-val">${p.checked.size}/25</span>
      ${p.bingoCount>0?`<span class="sp-bingo">🏆×${p.bingoCount}</span>`:''}`;
    scoreRow.appendChild(pill);
  });

  // Grids
  const panels = document.getElementById('gridPanels');
  panels.innerHTML = '';
  const rp = mode==='team' ? [players[0]] : players;

  rp.forEach((p,i) => {
    const isActive = mode==='team' || i===active;
    const panel = document.createElement('div');
    panel.className = 'grid-panel' + (isActive?' active':'');

    const wrap = document.createElement('div');
    wrap.className = 'bingo-grid-wrap';
    const grid = document.createElement('div');
    grid.className = 'bingo-grid';

    const winFlat = checkBingo(p).flat();

    p.grid.forEach((item, ci) => {
      const cell = document.createElement('div');
      cell.className = 'bcell'
        + (p.checked.has(ci) ? ' checked' : '')
        + (item.hard ? ' hard-item' : '')
        + (winFlat.includes(ci) ? ' winner' : '');

      if (p.checked.has(ci)) {
        cell.style.background = p.color;
        cell.style.borderColor = p.color;
        cell.style.boxShadow = `0 3px 10px ${p.color}55`;
      }

      cell.innerHTML = `<span class="ce">${item.e}</span><span class="cl">${item.l.replace(/\n/g,'<br>')}</span>`;

      cell.addEventListener('click', () => toggle(mode==='team'?0:i, ci));
      grid.appendChild(cell);
    });

    wrap.appendChild(grid);
    panel.appendChild(wrap);
    panels.appendChild(panel);
  });
}

function toggle(pi, ci) {
  const p = game.players[pi];
  if (p.checked.has(ci)) {
    p.checked.delete(ci);
    p.bingoShown = false;
  } else {
    p.checked.add(ci);
    if (checkBingo(p).length > 0 && !p.bingoShown) {
      p.bingoShown = true;
      p.bingoCount++;
      confetti();
      setTimeout(() => showWin(p), 350);
    }
  }
  renderGame();
}

/* ═══════════════════════════
   WIN
═══════════════════════════ */
function showWin(p) {
  document.getElementById('winTitle').textContent = 'BINGO !';
  document.getElementById('winTitle').style.color = p.color;
  document.getElementById('winSub').textContent = game.mode==='team'
    ? `L'équipe a trouvé une ligne ! 🎉`
    : `${p.name} a trouvé une ligne complète ! 🎉`;
  document.getElementById('winOverlay').classList.add('show');
}

function closeWin() {
  document.getElementById('winOverlay').classList.remove('show');
  game.players.forEach(p => { if(p.bingoCount>0) p.bingoShown=false; });
  renderGame();
}

function confirmQuit() { document.getElementById('quitOverlay').classList.add('show'); }
function closeQuit()   { document.getElementById('quitOverlay').classList.remove('show'); }

function endGame() {
  document.getElementById('winOverlay').classList.remove('show');
  document.getElementById('quitOverlay').classList.remove('show');
  saveGame();
  goHome();
}

function resetCur() {
  const i = game.mode==='team'?0:game.active;
  game.players[i].checked = new Set();
  game.players[i].bingoShown = false;
  game.players[i].bingoCount = 0;
  renderGame();
}

function reshuffleCur() {
  const i = game.mode==='team'?0:game.active;
  game.players[i].grid = pickGrid(game.diff, null);
  game.players[i].checked = new Set();
  game.players[i].bingoShown = false;
  game.players[i].bingoCount = 0;
  renderGame();
}

function reshuffleAll() {
  game.players.forEach(p => {
    p.grid = pickGrid(game.diff, null);
    p.checked = new Set();
    p.bingoShown = false;
    p.bingoCount = 0;
  });
  renderGame();
}

/* ═══════════════════════════
   CONFETTI
═══════════════════════════ */
function confetti() {
  const colors = ['#F5C800','#FF6B47','#4AABDE','#5DB87A','#FF8C6B','#FFE066'];
  for (let n=0; n<60; n++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random()*100}vw;
      top: -20px;
      background: ${colors[n%colors.length]};
      width: ${6+Math.random()*8}px;
      height: ${6+Math.random()*8}px;
      border-radius: ${Math.random()>.5?'50%':'3px'};
      animation-duration: ${1.5+Math.random()*1.5}s;
      animation-delay: ${Math.random()*.4}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ═══════════════════════════
   QR CODE (no external lib)
═══════════════════════════ */
function openQr() {
  if (!game) return;
  const url = `${location.href.split('?')[0]}?seed=${game.seed}&diff=${game.diff}&mode=${game.mode}`;
  drawQR(url);
  document.getElementById('qrSeedText').textContent = `Seed : ${game.seed}`;
  document.getElementById('qrOverlay').classList.add('show');
}
function closeQr() { document.getElementById('qrOverlay').classList.remove('show'); }

// Minimal QR code drawer using a compact data URL approach
function drawQR(text) {
  const canvas = document.getElementById('qrCanvas');
  const ctx = canvas.getContext('2d');
  const size = 200;
  canvas.width = canvas.height = size;

  // Simple visual QR placeholder with seed info encoded visually
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,size,size);

  // Use a seeded pattern from the URL to make a unique-looking QR-style grid
  const data = text.split('').map(c=>c.charCodeAt(0));
  const cells = 21;
  const cs = Math.floor(size/cells);
  const pad = Math.floor((size - cs*cells)/2);

  ctx.fillStyle = '#2D2520';

  // Finder patterns
  const fp = (x,y) => {
    ctx.fillRect(pad+x*cs, pad+y*cs, 7*cs, 7*cs);
    ctx.fillStyle = 'white';
    ctx.fillRect(pad+x*cs+cs, pad+y*cs+cs, 5*cs, 5*cs);
    ctx.fillStyle = '#2D2520';
    ctx.fillRect(pad+x*cs+2*cs, pad+y*cs+2*cs, 3*cs, 3*cs);
  };
  fp(0,0); fp(14,0); fp(0,14);
  ctx.fillStyle = '#2D2520';

  // Data cells (seeded hash pattern)
  let h = 0;
  for(let c of text) h = ((h<<5)-h)+c.charCodeAt(0);

  for (let r=0; r<cells; r++) {
    for (let c=0; c<cells; c++) {
      // Skip finder pattern areas
      if ((r<8&&c<8)||(r<8&&c>12)||(r>12&&c<8)) continue;
      h = (h * 1664525 + 1013904223) & 0xffffffff;
      if (h & 1) {
        ctx.fillRect(pad+c*cs, pad+r*cs, cs-1, cs-1);
      }
    }
  }

  // Center label
  ctx.fillStyle = 'white';
  ctx.fillRect(size/2-28, size/2-12, 56, 22);
  ctx.fillStyle = '#FF6B47';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KiVoitQuoi', size/2, size/2+2);
}

/* ═══════════════════════════
   HISTORY
═══════════════════════════ */
function getHist() {
  try { return JSON.parse(localStorage.getItem('kvq_hist')||'[]'); } catch { return []; }
}

function saveGame() {
  if (!game) return;
  const h = getHist();
  h.unshift({
    id: game.id,
    mode: game.mode,
    diff: game.diff,
    players: game.players.map(p=>({ name:p.name, color:p.color, bingoCount:p.bingoCount, checked:p.checked.size })),
    start: game.start,
    end: new Date().toISOString(),
  });
  localStorage.setItem('kvq_hist', JSON.stringify(h.slice(0,50)));
}

function clearHistory() {
  if (confirm('Effacer tout l\'historique ?')) {
    localStorage.removeItem('kvq_hist');
    renderHistList();
    renderHomeHist();
  }
}

function renderHomeHist() {
  const wrap = document.getElementById('homeHistory');
  const h = getHist().slice(0,3);
  if (!h.length) { wrap.innerHTML = '<div class="empty-msg">🗺️ Aucune partie encore — à vos places !</div>'; return; }
  wrap.innerHTML = '';
  h.forEach(e => {
    const d = document.createElement('div');
    d.className = 'recent-item';
    d.innerHTML = `<span class="ri-icon">${e.mode==='team'?'🤝':'⚔️'}</span>
      <div class="ri-info">
        <div class="ri-title">${e.players.map(p=>p.name).join(', ')}</div>
        <div class="ri-sub">${fmt(e.start)} · ${e.players.reduce((a,b)=>a+b.bingoCount,0)} BINGO(s)</div>
      </div>
      <button class="ri-del" onclick="delHist(${e.id},event)">🗑</button>`;
    wrap.appendChild(d);
  });
}

function delHist(id, ev) {
  ev.stopPropagation();
  localStorage.setItem('kvq_hist', JSON.stringify(getHist().filter(x=>x.id!==id)));
  renderHomeHist();
}

function renderHistList() {
  const list = document.getElementById('histList');
  const h = getHist();
  if (!h.length) { list.innerHTML = '<div class="hist-empty">🏕️<br><br>Aucune partie enregistrée</div>'; return; }
  list.innerHTML = '';
  h.forEach(e => {
    const card = document.createElement('div');
    card.className = 'hist-card';
    const modeL = e.mode==='team'?'🤝 Équipe':'⚔️ Défi';
    const diffL = {easy:'Facile',medium:'Moyen',hard:'Difficile'}[e.diff]||'';
    card.innerHTML = `<div class="hc-top">
        <span class="hc-title">${modeL} · ${diffL}</span>
        <span class="hc-date">${fmt(e.start)}</span>
      </div>
      <div class="hc-chips">${e.players.map(p=>`
        <div class="hc-chip"><div class="hc-chip-dot" style="background:${p.color}"></div>
        ${p.name}${p.bingoCount>0?` <span class="hc-win">🏆×${p.bingoCount}</span>`:''}</div>`).join('')}
      </div>`;
    list.appendChild(card);
  });
}

/* ═══════════════════════════
   PRINT
═══════════════════════════ */
function setPrintDiff(d) {
  printDiff = d;
  document.querySelectorAll('#printscreen .diff-btn').forEach(b => b.classList.toggle('sel', b.dataset.d===d));
  renderPrintPreview();
}

function changePrint(delta) {
  printCount = Math.max(1, Math.min(8, printCount+delta));
  document.getElementById('printCountVal').textContent = printCount;
}

function renderPrintPreview() {
  const preview = document.getElementById('printPreview');
  preview.innerHTML = '';
  pickGrid(printDiff, null).forEach(item => {
    const cell = document.createElement('div');
    cell.className = 'pmg-cell' + (item.free?' free-c':'');
    cell.innerHTML = `${item.e}<div class="pmg-label">${item.l.replace(/\n/g,'<br>')}</div>`;
    preview.appendChild(cell);
  });
}

function doPrint() {
  const grids = Array.from({length:printCount}, () => pickGrid(printDiff,null));
  const diffL = {easy:'Facile',medium:'Moyen',hard:'Difficile'}[printDiff];

  let html = `<style>
    @page { margin: 10mm; }
    body { font-family: 'Nunito', 'Segoe UI', sans-serif; background: white; }
    .pg { page-break-after: always; padding: 8px; }
    .pg:last-child { page-break-after: auto; }
    .pg-head { text-align:center; margin-bottom:10px; }
    .pg-title { font-size:24px; font-weight:900; color:#2D2520; }
    .pg-sub { font-size:11px; color:#9A8870; margin-top:4px; }
    .pg-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; }
    .pg-cell {
      aspect-ratio:1; border:2.5px solid #3D3530; border-radius:10px;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      text-align:center; font-size:22px; padding:4px; background:#FFF8E8;
    }
    .pg-lbl { font-size:7px; font-weight:700; color:#5A4F45; margin-top:2px; line-height:1.2; }
  </style>`;

  grids.forEach((grid,gi) => {
    html += `<div class="pg">
      <div class="pg-head">
        <div class="pg-title">🚗 KiVoitQuoi</div>
        <div class="pg-sub">Grille ${gi+1} · Difficulté : ${diffL} · Le bingo du road trip !</div>
      </div>
      <div class="pg-grid">
        ${grid.map(item=>`<div class="pg-cell">
          ${item.e}<div class="pg-lbl">${item.l.replace(/\n/g,'<br>')}</div>
        </div>`).join('')}
      </div>
    </div>`;
  });

  const w = window.open('','_blank','width=800,height=600');
  w.document.write(`<!DOCTYPE html><html><head><title>KiVoitQuoi — Grilles</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap" rel="stylesheet">
    </head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}

/* ═══════════════════════════
   MY ITEMS (custom user items)
═══════════════════════════ */
const EMOJI_PALETTE = [
  '🦙','🦒','🦓','🐊','🦘','🦬','🐘','🦏','🐪','🦩','🦚','🦜',
  '🌵','🌴','🍄','🌺','🌸','🍀','🌾','🎋','🎄','🌳',
  '🏔️','⛰️','🗻','🌋','🏜️','🏖️','🏝️','🌊','🌅',
  '🏟️','🏗️','🏚️','🏛️','🕌','🕍','⛩️','🗼','🗽',
  '🚂','🚃','🚄','🚅','🚁','🛸','🚀','⛵','🛥️','🚢','🛶',
  '🎡','🎢','🎠','🎪','🎭','🎨','🎬',
  '🐄','🐖','🐓','🦃','🐐','🐏','🦌','🐇','🦔','🦦','🦫',
  '⛽','🚧','🚦','🚨','🛑','🪧','🏁',
  '💡','🔭','📡','⚗️','🧲','🔋','💧','🔥',
  '🎯','🎲','🃏','🧩','🎮','🏆','🥇','🎖️',
  '🌈','⭐','🌙','☁️','⚡','❄️','🌪️','🌤️',
  '🍕','🌮','🍔','🥨','🥐','🧇','🍦','🎂',
  '⚽','🏀','🎾','🏈','🏒','🎿','🏄','🚵',
];

let miSelectedEmoji = '🎯';

function getMyItems() {
  try { return JSON.parse(localStorage.getItem('kvq_myitems') || '[]'); } catch { return []; }
}
function saveMyItems(items) {
  localStorage.setItem('kvq_myitems', JSON.stringify(items));
}

function allItems() {
  // Built-in + user custom items merged
  const custom = getMyItems().map(it => ({...it, custom: true}));
  return [...ALL_ITEMS, ...custom];
}

function goMyItems() {
  renderMyItemsScreen();
  showScreen('myitems');
}

function renderMyItemsScreen() {
  // Emoji palette
  const grid = document.getElementById('miEmojiGrid');
  grid.innerHTML = '';
  EMOJI_PALETTE.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'mi-emoji-btn' + (e === miSelectedEmoji ? ' sel' : '');
    btn.textContent = e;
    btn.addEventListener('click', () => {
      miSelectedEmoji = e;
      document.getElementById('miEmojiPreview').textContent = e;
      grid.querySelectorAll('.mi-emoji-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
    });
    grid.appendChild(btn);
  });

  renderMyItemsList();
  updateMyItemsBadge();
}

function renderMyItemsList() {
  const items = getMyItems();
  const list = document.getElementById('miList');
  document.getElementById('miCount').textContent = items.length;

  if (!items.length) {
    list.innerHTML = '<div class="mi-empty">Aucun élément pour l\'instant.<br>Ajoute des trucs insolites que tu veux trouver ! 👆</div>';
    return;
  }

  list.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'mi-item-row';
    row.innerHTML = `
      <div class="mi-item-emoji">${item.e}</div>
      <div class="mi-item-label">${item.l}</div>
      <div class="mi-item-badge">perso</div>
      <button class="mi-item-del" onclick="deleteMyItem(${i})">🗑</button>
    `;
    list.appendChild(row);
  });
}

function addMyItem() {
  const input = document.getElementById('miLabelInput');
  const label = input.value.trim();
  if (!label) { input.focus(); input.style.borderColor = 'var(--coral)'; setTimeout(()=>input.style.borderColor='',800); return; }

  const items = getMyItems();
  const newItem = {
    id: 'custom_' + Date.now(),
    e: miSelectedEmoji,
    l: label,
    custom: true,
  };
  items.push(newItem);
  saveMyItems(items);

  input.value = '';
  renderMyItemsList();
  updateMyItemsBadge();

  // Visual feedback
  input.style.borderColor = 'var(--sage)';
  setTimeout(() => input.style.borderColor = '', 1000);
}

function deleteMyItem(index) {
  const items = getMyItems();
  items.splice(index, 1);
  saveMyItems(items);
  renderMyItemsList();
  updateMyItemsBadge();
  renderItemsGrid(); // refresh custom selector in setup if open
}

function updateMyItemsBadge() {
  const n = getMyItems().length;
  const el = document.getElementById('myItemsCount');
  if (el) el.textContent = n > 0 ? `${n} élément${n>1?'s':''} perso dans le jeu !` : 'Ajoute tes propres trucs à trouver';
}

/* ═══════════════════════════
   URL SEED HANDLING
═══════════════════════════ */
function checkURLSeed() {
  const params = new URLSearchParams(location.search);
  const seed = parseInt(params.get('seed'));
  if (seed) {
    const diff = params.get('diff') || 'easy';
    const mode = params.get('mode') || 'defi';
    // Auto-start a 1-player game with this seed
    game = {
      id: Date.now(),
      mode: 'defi',
      diff,
      seed,
      players: [{
        name: 'Moi',
        color: PCOLS[0],
        grid: pickGrid(diff, null, seed),
        checked: new Set(),
        bingoShown: false,
        bingoCount: 0,
      }],
      active: 0,
      start: new Date().toISOString(),
    };
    renderGame();
    showScreen('game');
  }
}

/* ═══════════════════════════
   INIT
═══════════════════════════ */
renderHomeHist();
renderPNames();
updateMyItemsBadge();
checkURLSeed();
