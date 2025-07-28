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
    
    // Sección corregida para mostrar comentarios
    let comments = document.createElement('div');
    comments.className = "professor-comments";
    
    // Verificamos si hay comentarios y mostramos el número correctamente
    if (profxs[j].m && typeof profxs[j].m === 'object') {
      // Si es un objeto, contamos las claves
      const commentCount = Object.keys(profxs[j].m).length;
      comments.innerHTML = `<span class="comment-count">Comentarios: ${commentCount}</span>`;
    } else if (profxs[j].m) {
      // Si no es un objeto pero tiene valor, lo mostramos directamente
      comments.innerHTML = `<span class="comment-count">Comentarios: ${profxs[j].m}</span>`;
    } else {
      // Si no hay comentarios
      comments.innerHTML = '<span class="comment-count">Sin comentarios</span>';
    }
    
    let bottom = document.createElement("div");
    bottom.className = "bottom";
    
    let ir = document.createElement("a");
    ir.className = "professor-link";
    ir.innerHTML = "➤ Ir";
    ir.href = getProfURL(profxs[j].n, profxs[j].a, profxs[j].i);
    ir.target = "_blank";
    
    bottom.appendChild(ir);
    
    info.appendChild(name);
    info.appendChild(grade);
    info.appendChild(comments);
    info.appendChild(bottom);
    
    tables[j].after(info);
  }
});

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