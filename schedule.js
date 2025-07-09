// schedule.js
let selectedProfessors = [];

// Cargar horario al iniciar
loadSchedule();

function saveSchedule() {
  chrome.storage.local.set({ professorSchedule: selectedProfessors }, () => {
    console.log("Horario guardado");
    // Notificar a todos los contextos sobre el cambio
    chrome.runtime.sendMessage({ type: "SCHEDULE_UPDATED" });
  });
}

function loadSchedule(callback) {
  chrome.storage.local.get(["professorSchedule"], (result) => {
    selectedProfessors = result.professorSchedule || [];
    if (callback) callback();
  });
}

function addToSchedule(professor) {
  if (!professor || !professor.i) return false;
  
  if (!selectedProfessors.some((p) => p.i === professor.i)) {
    selectedProfessors.push(professor);
    saveSchedule();
    return true;
  }
  return false;
}

function removeFromSchedule(professorId) {
  selectedProfessors = selectedProfessors.filter((p) => p.i !== professorId);
  saveSchedule();
}

// Exportar para content.js
if (typeof window !== 'undefined') {
  window.ScheduleManager = {
    addToSchedule,
    removeFromSchedule,
    loadSchedule,
    getSchedule: () => [...selectedProfessors], // Devolver copia
  };
}

// Exportar para el popup
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADD_TO_SCHEDULE") {
      const result = addToSchedule(request.professor);
      sendResponse({ success: result });
      return true;
    }
    if (request.type === "GET_SCHEDULE") {
      sendResponse({ schedule: selectedProfessors });
      return true;
    }
  });
}
