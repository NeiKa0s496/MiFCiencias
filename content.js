
// Escucha mensajes del runtime (background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let tables = document.getElementsByTagName("table");
  let profxs = message.profxs;
  
  for (let j = 0; j < profxs.length; j++) {
    if (profxs[j] === null) {
      let error = document.createElement("div");
      error.className = "professor-not-found";
      error.innerText = "No se encontró (╥﹏╥)";
      tables[j].after(error);
      continue;
    }
    
    let info = document.createElement("div");
    let cal = parseInt(profxs[j].c);
    if (cal >= 8) {
      info.className = "tarjeta green";
    } else if (cal >= 6) {
      info.className = "tarjeta yellow";
    } else {
      info.className = "tarjeta red";
    }
    
    let name = document.createElement("div");
    name.className = "professor-name";
    name.innerText = profxs[j].n + " " + profxs[j].a;
    
    let grade = document.createElement("div");
    grade.className = "professor-calif";
    const calif = parseFloat(profxs[j].c);
    grade.innerHTML = `
      <span class="calif-value">${calif % 1 === 0 ? calif.toFixed(0) : calif.toFixed(1)}</span>
      <span class="calif-label">calificación</span>
    `;
    
    let comments = document.createElement("div");
    comments.className = "professor-comments";
    const commentCount = profxs[j].m ? profxs[j].m.length : 0;
    comments.innerHTML = `<span class="comment-count">Comentarios: ${commentCount}</span>`;
    
    let bottom = document.createElement("div");
    bottom.className = "bottom";
    
    let ir = document.createElement("a");
    ir.className = "professor-link";
    ir.innerHTML = "➤ Ir";
    ir.href = getProfURL(profxs[j].n, profxs[j].a, profxs[j].i);
    ir.target = "_blank";
    
    let addButton = document.createElement("button");
    addButton.className = "add-to-schedule";
    addButton.innerHTML = "➕ Agregar a horario";
    addButton.dataset.profId = profxs[j].i;
    addButton.onclick = () => {
      if (window.ScheduleManager.addToSchedule(profxs[j])) {
        addButton.innerHTML = "✔️ En horario";
        addButton.disabled = true;
      }
    };
    
    bottom.appendChild(ir);
    bottom.appendChild(addButton);
    
    info.appendChild(name);
    info.appendChild(grade);
    info.appendChild(comments);
    info.appendChild(bottom);
    
    tables[j].after(info);
  }
  
  // Verificar horario después de crear todas las tarjetas
  checkScheduleStatus();
});

function checkScheduleStatus() {
  if (window.ScheduleManager) {
    window.ScheduleManager.loadSchedule(() => {
      document.querySelectorAll('.add-to-schedule').forEach(button => {
        const professorId = button.dataset.profId;
        if (window.ScheduleManager.getSchedule().some(p => p.i === professorId)) {
          button.innerHTML = '✔️ En horario';
          button.disabled = true;
        }
      });
    });
  } else {
    // Reintentar si ScheduleManager no está cargado
    setTimeout(checkScheduleStatus, 100);
  }
}
// Función para generar URL del perfil del profesor en misprofesores.com
function getProfURL(firstName, lastName, id) {
  // Normaliza los nombres (quita acentos)
  let first = removeSpecialChars(firstName);
  let last = removeSpecialChars(lastName);
  // Divide y une los nombres con guiones
  let name = first.split(" ");
  name = name.concat(last.split(" "));
  name = name.join("-");
  // Construye la URL final
  let url = "https://www.misprofesores.com/profesores/" + name + "_" + id;
  return url;
}

// Función para remover caracteres especiales (excepto ñ)
function removeSpecialChars(name) {
  let removed = name
    .normalize("NFD") // Normaliza a forma descompuesta
    .replace(
      /([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,
      "$1"
    ) // Elimina diacríticos excepto ñ
    .normalize(); // Vuelve a forma compuesta
  return removed;
}
function initScheduleUI() {
  ScheduleManager.loadSchedule(() => {
    document.querySelectorAll('.add-to-schedule').forEach(button => {
      const professorId = button.dataset.profId;
      if (ScheduleManager.getSchedule().some(p => p.i === professorId)) {
        button.innerText = '✔️ En horario';
        button.disabled = true;
      }
    });
  });
}

// Cargar schedule.js primero
const scheduleScript = document.createElement('script');
scheduleScript.src = chrome.runtime.getURL('schedule.js');
document.head.appendChild(scheduleScript);
