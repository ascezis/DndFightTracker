// renderer.js — точка входа для логики интерфейса D&D Tracker

// Массив участников боя (тестовые данные для старта)
let combatants = [
  // Пусто, стартовых персонажей нет
];

function renderCombatants() {
  const app = document.getElementById('app');
  if (!app) return;
  let html = `<table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th>Имя</th><th>Тип</th><th>Инициатива</th><th>КД</th><th>Хиты</th>
    </tr></thead>
    <tbody>`;
  for (const c of combatants) {
    html += `<tr>
      <td>${c.name}</td>
      <td>${c.type}</td>
      <td>${c.initiative}</td>
      <td>${c.ac}</td>
      <td>${c.hp}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  app.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderCombatants);

