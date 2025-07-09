// Escucha cuando una pestaña se actualiza
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Verifica si el estado es 'loading' (la pestaña está cargando)
  if (changeInfo.status === "loading") {
    // Comprueba si la URL coincide con el patrón de horarios de la Facultad
    if (
      /https?:\/\/w(w|e)(w|b)\.fciencias\.unam\.mx\/docencia\/horarios\/202[0-9][0-9]/.test(
        changeInfo.url
      )
    ) {
      // Si coincide, ejecuta el script foreground.js en la pestaña
      chrome.tabs.executeScript(null, { file: "./foreground.js" });
    }
  }
});

// Escucha mensajes desde otros scripts (como foreground.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender);
  // Inicializa arrays para nombres y apellidos
  firstNames = [];
  lastNames = [];

  // Procesa cada profesor recibido en el mensaje
  for (professor of request.msg) {
    // Separa el nombre completo en nombre y apellidos
    firstNames.push(getFirstName(professor));
    lastNames.push(getLastName(professor));
  }
  console.log(firstNames, lastNames);
  // Busca información de los profesores en misprofesores.com
  fetchProfxsInfo(firstNames, lastNames, sender.tab.id);
});

// Función para obtener los apellidos de un nombre completo
function getLastName(name) {
  let arr = name.split(" ").splice(-2); // Toma los últimos dos elementos
  let lastName = arr[0] + " " + arr[1]; // Une los dos últimos elementos (apellidos)
  return lastName;
}

// Función para obtener el primer nombre
function getFirstName(name) {
  let arr = name.split(" "); // Divide por espacios
  let firstName = arr[0]; // Toma el primer elemento
  return firstName;
}

// Función para remover caracteres especiales (excepto la ñ)
function removeSpecialChars(name) {
  let removed = name
    .normalize("NFD")
    .replace(
      /([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,
      "$1"
    )
    .normalize();
  return removed;
}

// Función para crear regex que coincida con apellidos con/sin acentos
function getLastNameRegex(name, unicode) {
  let removed = removeSpecialChars(name); // Elimina acentos
  let arrAccent = unicode.split(" "); // Divide el nombre con acentos
  let arrRemoved = removed.split(" "); // Divide el nombre sin acentos

  // Construye un patrón regex que coincida con diferentes variantes del nombre
  let optionalName =
    "(" +
    arrAccent[0] +
    "|" +
    arrAccent[0].toLowerCase() +
    "|" +
    arrRemoved[0] +
    "|" +
    arrRemoved[0].toLowerCase() +
    "|" +
    arrRemoved[0].toUpperCase() +
    ")[^}]*(" +
    arrAccent[1] +
    "|" +
    arrAccent[1].toLowerCase() +
    "|" +
    arrRemoved[1] +
    "|" +
    arrRemoved[1].toLowerCase() +
    "|" +
    arrRemoved[1].toLowerCase() +
    ")";
  return optionalName;
}

// Función para transformar caracteres especiales a su representación Unicode
function transformSpecialChars(strings) {
  var specialChars = [225, 233, 237, 243, 250, 193, 201, 205, 211, 218, 241]; // Códigos de caracteres especiales
  var unicode = [];
  for (string of strings) {
    console.log("String before: ", string);
    var stringUnicode = "";
    // Recorre cada carácter del string
    for (idx in string) {
      // Si es un carácter especial, lo convierte a formato Unicode
      if (specialChars.includes(string.charCodeAt(idx))) {
        stringUnicode += "\\\\u00" + string.charCodeAt(idx).toString(16);
      } else {
        stringUnicode += string[idx];
      }
    }
    console.log("String unicode: ", stringUnicode);
    unicode.push(stringUnicode);
  }
  return unicode;
}

// Función principal que busca información de profesores en misprofesores.com
function fetchProfxsInfo(firstNames, lastNames, tabid) {
  // Hace una petición a la página de profesores de la Facultad de Ciencias
  fetch("https://www.misprofesores.com/escuelas/Facultad-de-Ciencias-UNAM_2842")
    .then(function (response) {
      switch (response.status) {
        case 200: // Si la respuesta es OK
          return response.text();
        case 404: // Si no se encuentra la página
          throw response;
      }
    })
    .then((template) => {
      // Convierte nombres y apellidos a formatos con/sin acentos
      firstUnicode = transformSpecialChars(firstNames);
      lastUnicode = transformSpecialChars(lastNames);
      console.log(firstUnicode, lastUnicode);

      profInfo = [];
      // Para cada profesor, busca coincidencias en el HTML
      for (i = 0; i < firstUnicode.length; i++) {
        // Construye un regex complejo para encontrar el profesor
        let regExString =
          "\\{[^}]*(" +
          firstUnicode[i] +
          "|" +
          firstUnicode[i].toLowerCase() +
          "|" +
          removeSpecialChars(firstNames[i]) +
          "|" +
          removeSpecialChars(firstNames[i]).toLowerCase() +
          "|" +
          removeSpecialChars(firstNames[i]).toUpperCase() +
          ")[^}]*" +
          getLastNameRegex(lastNames[i], lastUnicode[i]) +
          ".*?\\}";
        let regEx = new RegExp(regExString);
        console.log(regEx);

        // Intenta encontrar coincidencia con el regex
        if (regEx.test(template)) {
          let result = template.match(regEx);
          console.log(result[0]);
          // Convierte el resultado a objeto JSON
          profObject = JSON.parse(result[0]);
          console.log(profObject);
          profInfo.push(profObject);
        } else {
          profInfo.push(null); // Si no encuentra, agrega null
        }
      }
      console.log(profInfo);
      // Envía la información encontrada de vuelta a la pestaña
      chrome.tabs.sendMessage(tabid, { profxs: profInfo });
      // Inyecta el CSS de estilos
      chrome.tabs.insertCSS(null, { file: "./style.css" });
    })
    .catch(function (response) {
      // Manejo de errores
      console.log(response.statusText);
    });
}
