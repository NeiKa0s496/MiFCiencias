// On receiving prof info create info tables and append them
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let tables = document.getElementsByTagName("table");
  let professors = message.professors;
  for (let j = 0; j < professors.length; j++) {
    if (professors[j] === null) {
      let error = document.createElement("div");
      error.className = "professor-not-found ";
      error.innerText = "No se encontró o(╥﹏╥)o";
      tables[j].after(error);
      continue;
    }
    let info = document.createElement("div");
    let cal = parseInt(professors[j].c);
    if (cal >= 8) {
      info.className = "professor-card green";
    } else if (cal >= 6) {
      info.className = "professor-card  yellow";
    } else {
      info.className = "professor-card  red";
    }
    let name = document.createElement("div");
    name.className = "name";
    name.innerText = professors[j].n + " " + professors[j].a;
    
    let grade = document.createElement("div");
    grade.innerText = "calificación: " + parseFloat(professors[j].c).toFixed(2);
    const rating = parseFloat(professors[j].c);
    grade.innerText = "calificación: " + (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1));
    
    
    let comments = document.createElement("div");
    comments.innerText = "comentarios: " + professors[j].m;
    let bottom = document.createElement("div");
    bottom.className = "bottom";
    let plus = document.createElement("a");
    plus.className = "plus";
    plus.innerHTML = "ir &plus;";
    plus.href = getProfURL(professors[j].n, professors[j].a, professors[j].i);
    bottom.appendChild(plus);
    info.appendChild(name);
    info.appendChild(grade);
    info.appendChild(comments);
    info.appendChild(bottom);
    tables[j].after(info);
  }
});

// Turns prof info into valid URL
function getProfURL(firstName, lastName, id) {
  let first = removeSpecialChars(firstName);
  let last = removeSpecialChars(lastName);
  let name = first.split(" ");
  name = name.concat(last.split(" "));
  name = name.join("-");
  let url = "https://www.misprofesores.com/profesores/" + name + "_" + id;
  return url;
}

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
