let current = 0;
function goTo(n){
  document.getElementById('screen-'+current).classList.remove('active');
  document.querySelectorAll('.nav-btn').forEach((b,i)=>b.classList.toggle('active', i===n));
  current = n;
  document.getElementById('screen-'+current).classList.add('active');
  const sb = document.getElementById('statusBar');
  sb.style.background = (n===0||n===5) ? '#081226' : 'var(--azul)';
  const panel = document.getElementById('notifPanel');
  if(panel) panel.classList.remove('show');
  if(n===6) setTimeout(animateRings, 80);
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 1800);
}

function toggleTask(el){
  const check = el.querySelector('.task-check');
  const info = el.querySelector('.task-info');
  const isDone = check.classList.toggle('done');
  check.textContent = isDone ? '✓' : '';
  info.classList.toggle('done-text', isDone);
  const remaining = document.querySelectorAll('#taskCard .task-check:not(.done)').length;
  document.getElementById('pendingCount').textContent = remaining;
  document.getElementById('pendingChip').textContent = remaining;
}

/* ===== Pomodoro funcional ===== */
let pomoTotal = 25*60, pomoLeft = pomoTotal, pomoRunning = false, pomoInterval = null, sessionsToday = 2;
const RING_LEN = 565.5;
function formatTime(s){const m=Math.floor(s/60).toString().padStart(2,'0');const sec=(s%60).toString().padStart(2,'0');return m+':'+sec;}
function updateRing(){
  const ring = document.getElementById('pomoRing');
  const pct = pomoLeft/pomoTotal;
  ring.style.strokeDashoffset = RING_LEN * (1-pct);
}
function toggleTimer(){
  const btn = document.getElementById('pomoStartBtn');
  pomoRunning = !pomoRunning;
  btn.innerHTML = pomoRunning ? '⏸ Pausar' : '▶ Iniciar';
  if(pomoRunning){
    pomoInterval = setInterval(()=>{
      pomoLeft--;
      if(pomoLeft<=0){
        clearInterval(pomoInterval);
        pomoRunning=false;
        btn.innerHTML='▶ Iniciar';
        sessionsToday = Math.min(sessionsToday+1,4);
        updateSessionDots();
        showToast('¡Sesión completada! 🎉');
        pomoLeft = pomoTotal;
      }
      document.getElementById('pomoTime').textContent = formatTime(pomoLeft);
      updateRing();
    },1000);
  } else {
    clearInterval(pomoInterval);
  }
}
function resetPomo(){
  clearInterval(pomoInterval);
  pomoRunning=false;
  pomoLeft = pomoTotal;
  document.getElementById('pomoStartBtn').innerHTML='▶ Iniciar';
  document.getElementById('pomoTime').textContent = formatTime(pomoLeft);
  updateRing();
}
function setPomoMode(el,mins){
  document.querySelectorAll('.pomo-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  pomoTotal = mins*60;
  resetPomo();
}
function updateSessionDots(){
  document.querySelectorAll('#sessionDots .session-dot').forEach((d,i)=>{
    d.classList.toggle('done', i < sessionsToday);
  });
  document.getElementById('pomoSession').textContent = Math.min(sessionsToday+1,4);
  document.getElementById('minutesFocused').textContent = sessionsToday*25;
}

/* ===== LOGIN FUNCIONAL ===== */
function loginSubmit(){
  const btn = document.getElementById('loginBtn');
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span>Verificando...';
  setTimeout(()=>{
    btn.classList.remove('loading');
    btn.innerHTML = 'Iniciar sesión →';
    goTo(1);
    showToast('¡Bienvenido de nuevo, Diego!');
  }, 900);
}

/* ===== NOTIFICACIONES ===== */
function toggleNotif(e){
  e.stopPropagation();
  const panel = document.getElementById('notifPanel');
  panel.classList.toggle('show');
  document.getElementById('notifDot').style.display = 'none';
}
document.addEventListener('click', (e)=>{
  const panel = document.getElementById('notifPanel');
  if(panel && panel.classList.contains('show') && !panel.contains(e.target) && !e.target.closest('.notif-btn')){
    panel.classList.remove('show');
  }
});

/* ===== CALENDARIO INTERACTIVO ===== */
const dayEvents = {
  3:[{c:'#4a7fc9',t:'Laboratorio de Redes',s:'Redes de Computadoras · Lab 2',time:'10:00<br>am'}],
  5:[{c:'#3f8f5f',t:'Entrega de avance — BD II',s:'Base de Datos II · Aula 205',time:'8:00<br>am'}],
  10:[{c:'#c9584a',t:'Entrega Avance 3 — Prototipo',s:'Diseño de Productos · Aula 301',time:'11:00<br>am'},
      {c:'#4a7fc9',t:'Clase Redes de Computadoras',s:'Ing. Sistemas · Lab 2',time:'2:00<br>pm'},
      {c:'#3f8f5f',t:'Reunión Grupo 4 — Proyecto',s:'Biblioteca UTP · Sala C',time:'5:30<br>pm'}],
  11:[{c:'#c9584a',t:'Examen Parcial — Redes',s:'Redes de Computadoras · Aula 201',time:'9:00<br>am'}],
  16:[{c:'#c9973d',t:'Informe Final — Sistemas',s:'Teoría de Sistemas · Online',time:'11:59<br>pm'}],
  18:[{c:'#4a7fc9',t:'Sustentación de proyecto',s:'Diseño de Productos · Aula 301',time:'3:00<br>pm'}],
  22:[{c:'#3f8f5f',t:'Práctica calificada — BD II',s:'Base de Datos II · Lab 4',time:'10:00<br>am'}],
  25:[{c:'#c9584a',t:'Examen final — Sistemas',s:'Teoría de Sistemas · Aula 108',time:'8:00<br>am'}],
  30:[{c:'#4a7fc9',t:'Entrega de portafolio',s:'Diseño de Productos · Virtual',time:'11:59<br>pm'}]
};
const monthNames = {};
let selectedDay = 10;
function selectDay(el, day){
  document.querySelectorAll('#calGrid .cal-day').forEach(d=>d.classList.remove('today'));
  el.classList.add('today');
  selectedDay = day;
  document.getElementById('dayLabel').textContent = (day===10?'Hoy — ':'') + day + ' de junio';
  document.getElementById('modalDayLabel').textContent = day + ' de junio';
  const card = document.getElementById('dayEventsCard');
  const events = dayEvents[day];
  if(events && events.length){
    card.innerHTML = events.map(ev=>
      `<div class="event-list-item"><div class="event-color" style="background:${ev.c}"></div><div class="event-info"><div class="t">${ev.t}</div><div class="s">${ev.s}</div></div><div class="event-time">${ev.time}</div></div>`
    ).join('');
  } else {
    card.innerHTML = `<div class="empty-state"><div class="ic">📭</div><div class="t">Sin eventos ese día</div><div class="s">Toca "+ Agregar" para crear uno</div></div>`;
  }
}
function openAddEvent(){
  document.getElementById('modalDayLabel').textContent = selectedDay + ' de junio';
  document.getElementById('eventModal').classList.add('show');
}
function closeModal(){
  document.getElementById('eventModal').classList.remove('show');
  document.getElementById('evTitle').value='';
  document.getElementById('evCourse').value='';
  document.getElementById('evTime').value='';
}
function submitEvent(){
  const title = document.getElementById('evTitle').value.trim();
  const course = document.getElementById('evCourse').value.trim();
  const time = document.getElementById('evTime').value.trim();
  if(!title){ showToast('Escribe un título para el evento'); return; }
  if(!dayEvents[selectedDay]) dayEvents[selectedDay] = [];
  dayEvents[selectedDay].push({c:'#c9973d', t:title, s: course || 'Evento personal', time: (time||'—')+''});
  const dayCell = [...document.querySelectorAll('#calGrid .cal-day')].find(d=>parseInt(d.textContent)===selectedDay && !d.classList.contains('other-month'));
  if(dayCell) dayCell.classList.add('has-event');
  selectDay(dayCell || document.querySelector('#calGrid .today'), selectedDay);
  closeModal();
  showToast('Evento agregado ✓');
}

/* ===== BÚSQUEDA EN APUNTES ===== */
function filterApuntes(query){
  const q = query.trim().toLowerCase();
  const folders = document.querySelectorAll('#foldersSection .folder-item');
  const files = document.querySelectorAll('#filesSection .file-item');
  let visibleCount = 0;
  folders.forEach(f=>{
    const match = f.dataset.name.includes(q);
    f.style.display = match ? 'flex' : 'none';
    if(match) visibleCount++;
  });
  files.forEach(f=>{
    const match = f.dataset.name.includes(q);
    f.style.display = match ? 'flex' : 'none';
    if(match) visibleCount++;
  });
  const showEmpty = q.length>0 && visibleCount===0;
  document.getElementById('apuntesEmptyState').style.display = showEmpty ? 'block' : 'none';
  document.getElementById('foldersSection').style.display = showEmpty ? 'none' : 'block';
  document.getElementById('filesSection').style.display = showEmpty ? 'none' : 'block';
}

/* ===== IA: GENERAR RESUMEN CON CARGA ===== */
const resumenes = [
  {file:'📄 Redes_OSI_Model.pdf', text:'Resumen del Modelo OSI y sus 7 capas de comunicación en redes de computadoras:',
   points:['La capa física gestiona la transmisión de bits a través del medio físico (cables, señales).',
           'La capa de enlace controla el acceso al medio y la detección de errores mediante MAC.',
           'La capa de red se encarga del direccionamiento lógico y enrutamiento mediante IP.',
           'La capa de transporte garantiza la entrega fiable de datos usando TCP o UDP.',
           'Las capas de sesión, presentación y aplicación gestionan la comunicación entre aplicaciones.']},
  {file:'📄 Normalizacion_BD.pdf', text:'Resumen de las formas normales en el diseño de bases de datos relacionales:',
   points:['La 1FN elimina grupos repetitivos, asegurando valores atómicos en cada columna.',
           'La 2FN elimina dependencias parciales de la clave primaria compuesta.',
           'La 3FN elimina dependencias transitivas entre atributos no clave.',
           'La normalización reduce la redundancia y mejora la integridad de los datos.']},
  {file:'📝 TeoriaSistemas_Cap4.docx', text:'Resumen del enfoque sistémico aplicado a organizaciones:',
   points:['Un sistema se compone de entradas, procesos, salidas y retroalimentación.',
           'La sinergia implica que el todo es mayor que la suma de sus partes.',
           'Los sistemas abiertos intercambian energía e información con su entorno.',
           'La homeostasis permite al sistema mantener su equilibrio interno.']}
];
let resumenIndex = 0;
function generateResumen(){
  const card = document.getElementById('resumenCard');
  card.innerHTML = `<div class="label">✨ Analizando documento con IA...</div>
    <div class="skeleton-line" style="width:95%"></div>
    <div class="skeleton-line" style="width:88%"></div>
    <div class="skeleton-line" style="width:70%"></div>
    <div class="skeleton-line" style="width:80%"></div>`;
  setTimeout(()=>{
    resumenIndex = (resumenIndex+1) % resumenes.length;
    const r = resumenes[resumenIndex];
    card.innerHTML = `<div class="label">${r.file} · Generado ahora</div>
      <p>${r.text}</p>
      <div class="puntos">${r.points.map(p=>`<div class="punto"><span>${p}</span></div>`).join('')}</div>`;
    showToast('Resumen generado ✓');
  }, 1400);
}

/* ===== BADGES ===== */
function showBadgeDetail(title, desc, pct){
  document.getElementById('badgeTitle').textContent = title;
  document.getElementById('badgeDesc').textContent = desc;
  document.getElementById('badgeFill').style.width = '0%';
  document.getElementById('badgeModal').classList.add('show');
  setTimeout(()=>{ document.getElementById('badgeFill').style.width = pct+'%'; }, 80);
}
function closeBadgeModal(){
  document.getElementById('badgeModal').classList.remove('show');
}

/* ===== ANIMACIÓN DE ANILLOS EN SEGUIMIENTO ===== */
function animateRings(){
  document.querySelectorAll('#screen-6 .ring-fill').forEach(ring=>{
    const target = ring.getAttribute('stroke-dashoffset');
    ring.style.strokeDashoffset = '188.5';
    ring.style.transition = 'none';
    requestAnimationFrame(()=>{
      ring.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,.9,.36,1)';
      requestAnimationFrame(()=>{ ring.style.strokeDashoffset = target; });
    });
  });
  document.querySelectorAll('#screen-6 .bar-fill').forEach(bar=>{
    const target = bar.style.width;
    bar.style.width = '0%';
    requestAnimationFrame(()=>{
      bar.style.transition = 'width .8s ease';
      requestAnimationFrame(()=>{ bar.style.width = target; });
    });
  });
}