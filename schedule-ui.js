// schedule-ui.js
function initializeUI() {
  if (window.ScheduleManager) {
    setupUI();
  } else {
    setTimeout(initializeUI, 100);
  }
}

function setupUI() {
  ScheduleManager.loadSchedule(renderSchedule);

  document.getElementById("print-schedule").addEventListener("click", () => {
    window.print();
  });
}

document.addEventListener("DOMContentLoaded", initializeUI);

function renderSchedule() {
  const container = document.getElementById("schedule-list");
  container.innerHTML = "";

  const schedule = ScheduleManager.getSchedule();
  if (schedule.length === 0) {
    container.innerHTML = "<p>No hay profesores en tu horario</p>";
    return;
  }

  schedule.forEach((prof) => {
    const profElement = document.createElement("div");
    profElement.className = "schedule-item";
    profElement.innerHTML = `
      <span>${prof.n} ${prof.a}</span>
      <span class="grade">${prof.c}</span>
      <button class="remove-btn" data-id="${prof.i}">✖</button>
    `;
    container.appendChild(profElement);
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      ScheduleManager.removeFromSchedule(e.target.dataset.id);
      renderSchedule();
    });
  });
}
