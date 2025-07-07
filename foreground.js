// Get profxs info and send it to background
let tables = document.getElementsByTagName('table');
let profxs = [];
for (let i = 0; i < tables.length; i++) {
  profxs.push(tables[i].rows[0].cells[1].innerText);
}
chrome.runtime.sendMessage({ msg: profxs });