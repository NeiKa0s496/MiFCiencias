// Escucha mensajes del runtime (background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Obtiene todas las tablas de la página
  let tables = document.getElementsByTagName("table");
  // Extrae la información de profesores del mensaje
  let profxs = message.profxs;
  
  // Itera sobre cada profesor recibido
  for (let j = 0; j < profxs.length; j++) {
    // Si no se encontró información del profesor
    if (profxs[j] === null) {
      // Crea un elemento de error
      let error = document.createElement("div");
      error.className = "professor-not-found ";
      error.innerText = "No se encontró (╥﹏╥)";
      // Inserta el mensaje después de la tabla correspondiente
      tables[j].after(error);
      continue;
    }
    
    // Crea contenedor principal para la información del profesor
    let info = document.createElement("div");
    // Determina el color de la tarjeta según la calificación
    let cal = parseInt(profxs[j].c);
    if (cal >= 8) {
      info.className = "tarjeta green";
    } else if (cal >= 6) {
      info.className = "tarjeta  yellow";
    } else {
      info.className = "tarjeta  red";
    }
    
    // Crea elemento para el nombre completo
    let name = document.createElement("div");
    name.className = "name";
    name.innerText = profxs[j].n + " " + profxs[j].a;
    
    // Crea elemento para la calificación con formato
    let grade = document.createElement("div");
    grade.innerText = "calificación: " + parseFloat(profxs[j].c).toFixed(2);
    const calif = parseFloat(profxs[j].c);
    grade.innerText = "calificación: " + (calif % 1 === 0 ? calif.toFixed(0) : calif.toFixed(1));
    
    // Crea elemento para los comentarios
    let comments = document.createElement("div");
    comments.innerText = "comentarios: " + profxs[j].m;
    
    // Crea contenedor inferior con enlace
    let bottom = document.createElement("div");
    bottom.className = "bottom";
    let ir = document.createElement("a");
    ir.className = "ir";
    ir.innerHTML = "➤ Ir";
    // Genera URL del perfil del profesor
    ir.href = getProfURL(profxs[j].n, profxs[j].a, profxs[j].i);
    bottom.appendChild(ir);
    
    // Ensambla todos los elementos
    info.appendChild(name);
    info.appendChild(grade);
    info.appendChild(comments);
    info.appendChild(bottom);
    
    // Inserta la tarjeta después de la tabla correspondiente
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
