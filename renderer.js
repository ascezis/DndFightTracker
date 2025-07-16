// Включаем тёмную тему по умолчанию
if (document.body) document.body.classList.add('dark-theme');

import {
  getCombatants,
  addCombatant as addCombatantRaw,
  updateCombatant,
  deleteCombatant as deleteCombatantRaw,
  getSelected,
  toggleSelect,
  selectAll,
  clearSelection,
  deleteSelectedCombatants,
  getSortedAndFilteredCombatants,
  setSort,
  setFilter,
  getSort,
  getFilter,
  getCurrentIdx,
  setCurrentIdx,
  getRound,
  nextTurn,
  prevTurn,
  resetTurn,
  massDamage,
  massHeal
} from './combatants.js';
import { allMonsters } from './db/monsters.js';
import { allItems } from './db/items.js';
import { allSpells } from './db/spells.js';
import { allArtifacts } from './db/artifacts.js';
// --- Получение справочников ---
// const allItems = window.allItems || [];
// const allSpells = window.allSpells || [];

const typeOptions = [
  { value: 'all', label: 'Все типы' },
  { value: 'pc', label: 'PC' },
  { value: 'npc', label: 'NPC' },
  { value: 'monster', label: 'Monster' }
];

// Кастомная модалка для ввода значения
function showEditModal({title, value, type = 'text', onSubmit}) {
  // Удаляем старую модалку, если есть
  const oldModal = document.getElementById('edit-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div style="background:#fff;padding:24px 20px;border-radius:16px;min-width:260px;box-shadow:0 8px 32px #0002;display:flex;flex-direction:column;gap:16px;">
      <div style="font-size:1.1em;font-weight:500;margin-bottom:4px;">${title}</div>
      <input id="edit-modal-input" type="${type}" value="${value ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" autofocus />
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="edit-modal-cancel" style="padding:7px 18px;border-radius:8px;border:none;background:#e5e5ea;cursor:pointer;">Отмена</button>
        <button id="edit-modal-ok" style="padding:7px 18px;border-radius:8px;border:none;background:#007aff;color:#fff;cursor:pointer;">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#edit-modal-input');
  input.focus();
  input.select();

  function close() {
    modal.remove();
  }

  modal.querySelector('#edit-modal-cancel').onclick = close;
  modal.querySelector('#edit-modal-ok').onclick = () => {
    onSubmit(input.value);
    close();
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(input.value);
      close();
    }
    if (e.key === 'Escape') close();
  };
}

// Обновлённые функции редактирования
function editName(idx) {
  showEditModal({
    title: 'Изменить имя:',
    value: getCombatants()[idx].name,
    onSubmit: (val) => {
      if (val && val.trim() !== '') {
        updateCombatant(idx, { name: val.trim() });
        renderCombatants();
      }
    }
  });
}
function editType(idx) {
  showEditModal({
    title: 'Изменить тип (pc, npc, monster):',
    value: getCombatants()[idx].type,
    onSubmit: (val) => {
      if (val && ['pc','npc','monster'].includes(val.trim())) {
        updateCombatant(idx, { type: val.trim() });
        renderCombatants();
      }
    }
  });
}
function editInitiative(idx) {
  showEditModal({
    title: 'Изменить инициативу:',
    value: getCombatants()[idx].initiative,
    type: 'number',
    onSubmit: (val) => {
      if (val !== '' && !isNaN(parseInt(val, 10))) {
        updateCombatant(idx, { initiative: parseInt(val, 10) });
        renderCombatants();
      }
    }
  });
}
function editAC(idx) {
  showEditModal({
    title: 'Изменить КД (AC):',
    value: getCombatants()[idx].ac || 10,
    type: 'number',
    onSubmit: (val) => {
      if (val !== '' && !isNaN(parseInt(val, 10))) {
        updateCombatant(idx, { ac: parseInt(val, 10) });
        renderCombatants();
      }
    }
  });
}
function editHP(idx) {
  showEditModal({
    title: 'Изменить хиты:',
    value: getCombatants()[idx].hp,
    type: 'number',
    onSubmit: (val) => {
      if (val !== '' && !isNaN(parseInt(val, 10))) {
        updateCombatant(idx, { hp: parseInt(val, 10) });
        renderCombatants();
      }
    }
  });
}
function editNote(idx) {
  showEditModal({
    title: 'Изменить заметку:',
    value: getCombatants()[idx].note || '',
    onSubmit: (val) => {
      updateCombatant(idx, { note: val });
      renderCombatants();
    }
  });
}

function showFullEditModal({
  initial = {},
  onSubmit
}) {
  // Удаляем старую модалку, если есть
  const oldModal = document.getElementById('edit-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  const types = ['pc', 'npc', 'monster'];
  modal.innerHTML = `
    <div style="background:#fff;padding:24px 20px;border-radius:16px;min-width:320px;box-shadow:0 8px 32px #0002;display:flex;flex-direction:column;gap:16px;">
      <div style="font-size:1.1em;font-weight:500;margin-bottom:4px;">${initial.isNew ? 'Добавить участника' : 'Редактировать участника'}</div>
      <input id="edit-name" type="text" placeholder="Имя персонажа или монстра" value="${initial.name ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <select id="edit-type" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;">
        ${types.map(t => `<option value="${t}"${initial.type === t ? ' selected' : ''}>${t === 'pc' ? 'Игрок (PC)' : t === 'npc' ? 'NPC' : 'Монстр'}</option>`).join('')}
      </select>
      <input id="edit-initiative" type="number" placeholder="Инициатива (очередь хода)" value="${initial.initiative ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-ac" type="number" placeholder="Класс Доспеха (AC) — защита" value="${initial.ac ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-hp" type="number" placeholder="Текущие хиты (HP) — здоровье" value="${initial.hp ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-maxhp" type="number" placeholder="Максимальные хиты (макс. HP)" value="${initial.maxHp ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-note" type="text" placeholder="Заметка (например, особенности, эффекты)" value="${initial.note ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="edit-modal-cancel" style="padding:7px 18px;border-radius:8px;border:none;background:#e5e5ea;cursor:pointer;">Отмена</button>
        <button id="edit-modal-ok" style="padding:7px 18px;border-radius:8px;border:none;background:#007aff;color:#fff;cursor:pointer;">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  function close() { modal.remove(); }
  modal.querySelector('#edit-modal-cancel').onclick = close;
  modal.querySelector('#edit-modal-ok').onclick = () => {
    const name = modal.querySelector('#edit-name').value.trim();
    const type = modal.querySelector('#edit-type').value;
    const initiative = parseInt(modal.querySelector('#edit-initiative').value, 10) || 0;
    const ac = parseInt(modal.querySelector('#edit-ac').value, 10) || 10;
    const hp = parseInt(modal.querySelector('#edit-hp').value, 10) || 10;
    const maxHp = parseInt(modal.querySelector('#edit-maxhp').value, 10) || hp;
    const note = modal.querySelector('#edit-note').value;
    if (name) {
      try {
        onSubmit({ name, type, initiative, ac, hp, maxHp, note });
      } finally {
        close();
      }
    } else {
      modal.querySelector('#edit-name').focus();
    }
  };
  modal.querySelectorAll('input').forEach(input => {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') modal.querySelector('#edit-modal-ok').click();
      if (e.key === 'Escape') close();
    };
  });
  modal.querySelector('#edit-type').onkeydown = (e) => {
    if (e.key === 'Escape') close();
  };
}

function addCombatant() {
  showFullEditModal({
    initial: {},
    onSubmit: (data) => {
      addCombatantRaw(data);
      renderCombatants();
    }
  });
}

function editFullCombatant(idx) {
  showFullEditModal({
    initial: { ...getCombatants()[idx], isNew: false },
    onSubmit: (data) => {
      updateCombatant(idx, data);
      renderCombatants();
    }
  });
}

function deleteCombatant(idx) {
  deleteCombatantRaw(idx);
  renderCombatants();
}

// --- Модалка поиска и добавления монстров ---
function showMonsterModal() {
  let search = '';
  let filtered = allMonsters;
  let selectedIdx = 0;

  // Создаём модалку один раз
  const modal = document.createElement('div');
  modal.id = 'monster-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal-content" style="width:900px;max-width:98vw;height:600px;max-height:98vh;display:flex;flex-direction:column;gap:12px;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:12px;">
        <input id="monster-search" type="text" placeholder="Поиск монстра..." value="" class="" style="font-size:1em;padding:10px 16px;border-radius:12px;border:1.5px solid #e5e5ea;outline:none;flex:1;background:#f6f7f9;transition:box-shadow 0.18s;" />
        <button id="monster-modal-close" class="icon-btn" style=""><span style="font-size:1.2em;">✕</span></button>
      </div>
      <div style="display:flex;gap:24px;flex:1;min-height:320px;overflow:hidden;height:100%;">
        <div id="monster-list-wrap" style="width:260px;max-width:260px;min-width:180px;height:100%;overflow:auto;"></div>
        <div id="monster-details-wrap" style="flex:2;min-width:320px;height:100%;overflow-y:auto;padding:0 16px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#monster-search');
  const listWrap = modal.querySelector('#monster-list-wrap');
  const detailsWrap = modal.querySelector('#monster-details-wrap');

  function renderList() {
    listWrap.innerHTML = `<ul id="monster-list" style="list-style:none;padding:0;margin:0;">
      ${filtered.map((m, i) => `<li data-idx=\"${i}\" class=\"monster-list-item\" style=\"padding:10px 12px;cursor:pointer;border-radius:10px;margin-bottom:2px;transition:background 0.18s;${selectedIdx===i?'font-weight:600;background:#e5f0ff;':''}\">${m.name}</li>`).join('')}
    </ul>`;
    listWrap.querySelectorAll('.monster-list-item').forEach(el => {
      el.onclick = () => {
        selectedIdx = Number(el.dataset.idx);
        renderDetails();
        renderList();
      };
    });
  }

  function renderDetails() {
    detailsWrap.innerHTML = filtered[selectedIdx]
      ? renderMonsterDetails(filtered[selectedIdx])
      : '<div style="color:#888;">Выберите монстра для просмотра</div>';
    // Кнопка добавить в бой
    if (filtered[selectedIdx]) {
      const addBtn = detailsWrap.querySelector('#add-monster-btn');
      if (addBtn) addBtn.onclick = () => {
        const m = filtered[selectedIdx];
        addCombatantRaw({
          name: m.name,
          type: 'monster',
          initiative: 0,
          ac: parseInt(m.ac) || 10,
          hp: typeof m.hp === 'number' ? m.hp : (parseInt((m.hp||'').split('(')[0]) || 10),
          maxHp: typeof m.hp === 'number' ? m.hp : (parseInt((m.hp||'').split('(')[0]) || 10),
          note: m.trait && m.trait.name ? m.trait.name+': '+m.trait.text : ''
        });
        modal.remove();
        renderCombatants();
      };
    }
  }

  // Инициализация
  renderList();
  renderDetails();
  input.focus();

  // Обработчики событий
  modal.querySelector('#monster-modal-close').onclick = () => modal.remove();
  input.oninput = (e) => {
    search = e.target.value;
    filtered = allMonsters.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    // Если выбранный монстр исчез из фильтра — сбрасываем выбор на первого
    if (!filtered[selectedIdx]) selectedIdx = filtered.length ? 0 : null;
    renderList();
    renderDetails();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  };
}

function renderMonsterDetails(m) {
  return `
    <div style="font-weight:600;font-size:1.2em;margin-bottom:12px;">${m.name}</div>
    <div style="font-size:1em;color:#888;margin-bottom:8px;">Тип: ${m.type || ''}, КД: ${m.ac || ''}, Хиты: ${m.hp || ''}</div>
    <div style="font-size:1em;color:#888;margin-bottom:8px;">CR: ${m.cr || ''}, Источник: ${m.source || ''}</div>
    ${m.size ? `<div style='color:#888;margin-bottom:6px;'>Размер: ${m.size}</div>` : ''}
    ${m.speed ? `<div style='color:#888;margin-bottom:6px;'>Скорость: ${m.speed}</div>` : ''}
    ${m.alignment ? `<div style='color:#888;margin-bottom:6px;'>Мировоззрение: ${m.alignment}</div>` : ''}
    ${m.languages ? `<div style='color:#888;margin-bottom:6px;'>Языки: ${m.languages}</div>` : ''}
    ${m.passive ? `<div style='color:#888;margin-bottom:6px;'>Пассивка: ${m.passive}</div>` : ''}
    ${m.skill ? `<div style='color:#888;margin-bottom:6px;'>Навыки: ${m.skill}</div>` : ''}
    ${m.immune ? `<div style='color:#888;margin-bottom:6px;'>Иммунитеты: ${m.immune}</div>` : ''}
    ${m.resist ? `<div style='color:#888;margin-bottom:6px;'>Сопротивления: ${m.resist}</div>` : ''}
    ${m.conditionImmune ? `<div style='color:#888;margin-bottom:6px;'>Иммунитет к состояниям: ${m.conditionImmune}</div>` : ''}
    ${m.senses ? `<div style='color:#888;margin-bottom:6px;'>Чувства: ${m.senses}</div>` : ''}
    ${m.biom ? `<div style='color:#888;margin-bottom:6px;'>Биом: ${m.biom}</div>` : ''}
    ${m.trait ? (Array.isArray(m.trait) ? m.trait.map(t => `<div style='margin-bottom:8px;'><b>${t.name}:</b> ${t.text}</div>`).join('') : `<div style='margin-bottom:8px;'><b>${m.trait.name}:</b> ${m.trait.text}</div>`) : ''}
    ${m.fiction ? `<div style='margin-bottom:18px;line-height:1.6;font-size:1.04em;'>${m.fiction}</div>` : ''}
    ${m.action ? (Array.isArray(m.action) ? `<div style='margin-bottom:8px;'><b>Действия:</b><ul style='margin:6px 0 0 18px;padding:0;'>${m.action.map(a => `<li style='margin-bottom:4px;'><b>${a.name}:</b> ${a.text}</li>`).join('')}</ul></div>` : `<div style='margin-bottom:8px;'><b>Действие:</b> ${m.action.name}: ${m.action.text}</div>`) : ''}
    ${m.note ? `<div style='margin-bottom:8px;'><b>Заметка:</b> ${m.note}</div>` : ''}
    <button id="add-monster-btn" class="accent-btn" style="margin-top:8px;padding:10px 24px;font-size:1.08em;">Добавить в бой</button>
  `;
}

// --- Модалка для добавления/редактирования предмета инвентаря ---
function showInventoryItemModal({
  initial = {},
  onSubmit,
  onCancel
}) {
  const oldModal = document.getElementById('inventory-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'inventory-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div style="background:#fff;padding:24px 20px;border-radius:16px;min-width:320px;box-shadow:0 8px 32px #0002;display:flex;flex-direction:column;gap:14px;">
      <div style="font-size:1.1em;font-weight:500;margin-bottom:4px;">${initial.isNew ? 'Добавить предмет' : 'Редактировать предмет'}</div>
      <input id="inv-name" type="text" placeholder="Название" value="${initial.name ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <select id="inv-type" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;">
        <option value="оружие"${initial.type==='оружие'?' selected':''}>Оружие</option>
        <option value="броня"${initial.type==='броня'?' selected':''}>Броня</option>
        <option value="зелье"${initial.type==='зелье'?' selected':''}>Зелье</option>
        <option value="артефакт"${initial.type==='артефакт'?' selected':''}>Артефакт</option>
        <option value="прочее"${!initial.type||initial.type==='прочее'?' selected':''}>Прочее</option>
      </select>
      <input id="inv-qty" type="number" min="1" placeholder="Количество" value="${initial.qty ?? 1}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="inv-desc" type="text" placeholder="Описание" value="${initial.desc ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="inv-weight" type="text" placeholder="Вес (кг)" value="${initial.weight ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="inv-cost" type="text" placeholder="Стоимость (зм)" value="${initial.cost ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <label style="font-size:0.98em;display:flex;align-items:center;gap:8px;"><input id="inv-used" type="checkbox"${initial.used?' checked':''}/> Использован (одноразовый)</label>
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="inv-cancel" style="padding:7px 18px;border-radius:8px;border:none;background:#e5e5ea;cursor:pointer;">Отмена</button>
        <button id="inv-ok" style="padding:7px 18px;border-radius:8px;border:none;background:#007aff;color:#fff;cursor:pointer;">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  function close() { modal.remove(); if(onCancel) onCancel(); }
  modal.querySelector('#inv-cancel').onclick = close;
  modal.querySelector('#inv-ok').onclick = () => {
    const name = modal.querySelector('#inv-name').value.trim();
    const type = modal.querySelector('#inv-type').value;
    const qty = parseInt(modal.querySelector('#inv-qty').value, 10) || 1;
    const desc = modal.querySelector('#inv-desc').value;
    const weight = modal.querySelector('#inv-weight').value;
    const cost = modal.querySelector('#inv-cost').value;
    const used = modal.querySelector('#inv-used').checked;
    if (name) {
      onSubmit({ name, type, qty, desc, weight, cost, used });
      close();
    } else {
      modal.querySelector('#inv-name').focus();
    }
  };
  modal.querySelectorAll('input').forEach(input => {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') modal.querySelector('#inv-ok').click();
      if (e.key === 'Escape') close();
    };
  });
}

// --- Модалка для массовых операций с инвентарём ---
function showMassInventoryModal() {
  // Удаляем старую модалку, если есть
  const oldModal = document.getElementById('mass-inv-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'mass-inv-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div style="background:#fff;padding:24px 20px;border-radius:16px;min-width:340px;box-shadow:0 8px 32px #0002;display:flex;flex-direction:column;gap:16px;">
      <div style="font-size:1.1em;font-weight:500;margin-bottom:4px;">Массовые операции с инвентарём</div>
      <button id="mass-inv-add" style="padding:8px 18px;border-radius:8px;background:#27ae60;color:#fff;border:none;cursor:pointer;">Добавить предмет всем выделенным</button>
      <button id="mass-inv-remove" style="padding:8px 18px;border-radius:8px;background:#e67e22;color:#fff;border:none;cursor:pointer;">Удалить предмет по имени</button>
      <button id="mass-inv-clear" style="padding:8px 18px;border-radius:8px;background:#e74c3c;color:#fff;border:none;cursor:pointer;">Очистить инвентарь</button>
      <button id="mass-inv-cancel" style="padding:8px 18px;border-radius:8px;background:#e5e5ea;color:#222;border:none;cursor:pointer;">Отмена</button>
    </div>
  `;
  document.body.appendChild(modal);
  function close() { modal.remove(); }
  modal.querySelector('#mass-inv-cancel').onclick = close;
  modal.querySelector('#mass-inv-add').onclick = () => {
    close();
    showInventoryItemModal({
      initial: { isNew: true },
      onSubmit: (item) => {
        const selected = new Set(getSelected());
        const combatants = getCombatants();
        selected.forEach(idx => {
          if (!combatants[idx].inventory) combatants[idx].inventory = [];
          combatants[idx].inventory.push({ ...item });
        });
        renderCombatants();
        // Закрываем модалку вручную
        const invModal = document.getElementById('inventory-modal');
        if (invModal) invModal.remove();
      }
    });
  };
  modal.querySelector('#mass-inv-remove').onclick = () => {
    close();
    showEditModal({
      title: 'Название предмета для удаления у всех выделенных:',
      value: '',
      onSubmit: (val) => {
        if (!val) return;
        const selected = new Set(getSelected());
        const combatants = getCombatants();
        selected.forEach(idx => {
          if (combatants[idx].inventory) {
            combatants[idx].inventory = combatants[idx].inventory.filter(item => !item.name.toLowerCase().includes(val.toLowerCase()));
          }
        });
        renderCombatants();
      }
    });
  };
  modal.querySelector('#mass-inv-clear').onclick = () => {
    if (!confirm('Очистить инвентарь у всех выделенных участников?')) return;
    const selected = new Set(getSelected());
    const combatants = getCombatants();
    selected.forEach(idx => {
      combatants[idx].inventory = [];
    });
    renderCombatants();
    close();
  };
}

// --- Модалка справочника ---
function showReferenceModal() {
  const oldModal = document.getElementById('reference-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'reference-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div style="background:#fff;padding:28px 24px 20px 24px;border-radius:18px;min-width:420px;max-width:96vw;max-height:90vh;overflow:auto;position:relative;box-shadow:0 8px 32px #0002;display:flex;flex-direction:column;gap:12px;">
      <button id="close-reference-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:12px;font-size:1.2em;">Справочник</h2>
      <div style="display:flex;gap:12px;margin-bottom:10px;">
        <button class="ref-tab-btn" data-tab="spells">Заклинания</button>
        <button class="ref-tab-btn" data-tab="items">Предметы</button>
        <button class="ref-tab-btn" data-tab="artifacts">Артефакты</button>
      </div>
      <input id="ref-search" type="text" placeholder="Поиск..." style="font-size:1em;padding:8px 14px;border-radius:12px;border:1.5px solid #e5e5ea;outline:none;margin-bottom:8px;" />
      <div id="ref-tab-content"></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-reference-modal').onclick = () => modal.remove();

  let currentTab = 'items';
  let search = '';

  function renderTab() {
    const content = modal.querySelector('#ref-tab-content');
    let list = [];
    if (currentTab === 'items') list = allItems;
    if (currentTab === 'spells') list = allSpells;
    if (currentTab === 'artifacts') list = allArtifacts;
    // TODO: artifacts — если есть отдельный массив
    if (search) {
      list = list.filter(i => {
        const ru = i.ru?.name || '';
        const en = i.en?.name || '';
        const base = i.name || '';
        return ru.toLowerCase().includes(search.toLowerCase()) || en.toLowerCase().includes(search.toLowerCase()) || base.toLowerCase().includes(search.toLowerCase());
      });
    }
    content.innerHTML = `<ul style='list-style:none;padding:0;margin:0;max-height:340px;overflow:auto;'>
      ${list.slice(0, 100).map((i, idx) => `<li class='ref-list-item' data-idx='${idx}' style='padding:8px 12px;cursor:pointer;border-radius:10px;margin-bottom:2px;transition:background 0.18s;'>${i.ru?.name||i.en?.name||i.name||'-'}</li>`).join('')}
    </ul>`;
    content.querySelectorAll('.ref-list-item').forEach(el => {
      el.onclick = () => {
        const idx = Number(el.dataset.idx);
        showItemDetails(list[idx]);
      };
    });
  }
  modal.querySelectorAll('.ref-tab-btn').forEach(btn => {
    btn.onclick = () => {
      currentTab = btn.dataset.tab;
      renderTab();
    };
  });
  modal.querySelector('#ref-search').oninput = (e) => {
    search = e.target.value;
    renderTab();
  };
  renderTab();
}

function showItemDetails(item) {
  const modal = document.getElementById('reference-modal');
  if (!modal) return;
  const content = modal.querySelector('#ref-tab-content');
  content.innerHTML = `
    <div style='padding:8px 0;'>
      <div style='font-size:1.1em;font-weight:600;margin-bottom:6px;'>${item.name||item.ru?.name||'-'}</div>
      <div style='font-size:0.97em;color:#888;margin-bottom:4px;'>${item.type||item.ru?.type||''}</div>
      <div style='font-size:0.97em;color:#888;margin-bottom:4px;'>${item.desc||item.ru?.text||''}</div>
      <button id='add-item-to-inventory' style='margin-top:10px;padding:8px 18px;font-size:1em;'>Добавить в инвентарь...</button>
      <button id='back-to-list' style='margin-left:12px;padding:8px 18px;font-size:1em;'>Назад</button>
    </div>
  `;
  content.querySelector('#back-to-list').onclick = () => showReferenceModal();
  content.querySelector('#add-item-to-inventory').onclick = () => {
    // Открываем выбор участника
    const combatants = getCombatants();
    if (!combatants.length) { alert('Нет участников боя!'); return; }
    let selectHtml = `<div style='margin-top:12px;'><b>Кому добавить:</b><br><select id='choose-combatant' style='font-size:1.1em;margin-top:6px;'>`;
    combatants.forEach((c, idx) => {
      selectHtml += `<option value='${idx}'>${c.name}</option>`;
    });
    selectHtml += `</select><button id='confirm-add-item' style='margin-left:12px;padding:6px 16px;'>Добавить</button></div>`;
    content.innerHTML += selectHtml;
    content.querySelector('#confirm-add-item').onclick = function() {
      const idx = parseInt(content.querySelector('#choose-combatant').value, 10);
      if (!combatants[idx].inventory) combatants[idx].inventory = [];
      combatants[idx].inventory.push({ name: item.name||item.ru?.name||'-', type: item.type||item.ru?.type||'прочее', qty: 1, desc: item.desc||item.ru?.text||'', weight: item.weight||'', cost: item.cost||'', used: false });
      renderCombatants();
      modal.remove();
    };
  };
}

// === Модалка урона/исцеления для участника ===
function showDamageModal(idx) {
  const c = getCombatants()[idx];
  if (!c) return;
  // Удаляем старую модалку, если есть
  const oldModal = document.getElementById('damage-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'damage-modal';
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-damage-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">${c.name}: урон / исцеление</h2>
      <form id="damage-form">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
          <input id="dmg-value" type="number" min="1" max="999" value="1" style="width:80px;font-size:1.2em;">
          <select id="dmg-type" style="font-size:1.1em;padding:6px 10px;">
            <option value="damage">Урон</option>
            <option value="heal">Исцеление</option>
          </select>
          <span style="margin-left:10px;color:#888;font-size:0.98em;">Быстрый бросок:</span>
          ${[4,6,8,10,12,20,100].map(s => `<button type="button" class="dmg-dice-btn" data-sides="${s}" style="padding:6px 10px;border-radius:8px;background:#f4f4f7;border:none;font-size:1em;box-shadow:0 1px 4px #0001;cursor:pointer;">d${s}</button>`).join('')}
        </div>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Применить</button>
          <button type="button" id="cancel-damage" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-damage-modal').onclick = () => modal.remove();
  document.getElementById('cancel-damage').onclick = () => modal.remove();
  // Быстрые кнопки кубиков
  modal.querySelectorAll('.dmg-dice-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const sides = parseInt(btn.getAttribute('data-sides'), 10);
      if (sides) {
        const res = rollDice(sides);
        modal.querySelector('#dmg-value').value = res.total;
      }
    });
  });
  // Применение урона/исцеления
  modal.querySelector('#damage-form').onsubmit = function(e) {
    e.preventDefault();
    const value = parseInt(modal.querySelector('#dmg-value').value, 10) || 0;
    const type = modal.querySelector('#dmg-type').value;
    if (value > 0) {
      if (type === 'damage') {
        c.hp = Math.max(0, c.hp - value);
      } else {
        c.hp = c.hp + value;
      }
      renderCombatants();
    }
    modal.remove();
  };
}

// === Модалка массового урона/исцеления ===
function showMassDamageModal(type = 'damage') {
  const selected = getSelected();
  if (!selected.length) return;
  const oldModal = document.getElementById('mass-damage-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'mass-damage-modal';
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-mass-damage-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Массовое ${type === 'damage' ? 'нанесение урона' : 'исцеление'}</h2>
      <form id="mass-damage-form">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
          <input id="mass-dmg-value" type="number" min="1" max="999" value="1" style="width:80px;font-size:1.2em;">
          <select id="mass-dmg-type" style="font-size:1.1em;padding:6px 10px;">
            <option value="damage" ${type==='damage'?'selected':''}>Урон</option>
            <option value="heal" ${type==='heal'?'selected':''}>Исцеление</option>
          </select>
          <span style="margin-left:10px;color:#888;font-size:0.98em;">Быстрый бросок:</span>
          ${[4,6,8,10,12,20,100].map(s => `<button type="button" class="mass-dmg-dice-btn" data-sides="${s}" style="padding:6px 10px;border-radius:8px;background:#f4f4f7;border:none;font-size:1em;box-shadow:0 1px 4px #0001;cursor:pointer;">d${s}</button>`).join('')}
        </div>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Применить</button>
          <button type="button" id="cancel-mass-damage" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-mass-damage-modal').onclick = () => modal.remove();
  document.getElementById('cancel-mass-damage').onclick = () => modal.remove();
  // Быстрые кнопки кубиков
  modal.querySelectorAll('.mass-dmg-dice-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const sides = parseInt(btn.getAttribute('data-sides'), 10);
      if (sides) {
        const res = rollDice(sides);
        modal.querySelector('#mass-dmg-value').value = res.total;
      }
    });
  });
  // Применение урона/исцеления
  modal.querySelector('#mass-damage-form').onsubmit = function(e) {
    e.preventDefault();
    const value = parseInt(modal.querySelector('#mass-dmg-value').value, 10) || 0;
    const t = modal.querySelector('#mass-dmg-type').value;
    if (value > 0) {
      selected.forEach(idx => {
        const c = getCombatants()[idx];
        if (c) {
          if (t === 'damage') {
            c.hp = Math.max(0, c.hp - value);
          } else {
            c.hp = c.hp + value;
          }
        }
      });
      renderCombatants();
    }
    modal.remove();
  };
}

// === Модалка массового вдохновения ===
function showMassInspirationModal() {
  const selected = getSelected();
  if (!selected.length) return;
  const oldModal = document.getElementById('mass-insp-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'mass-insp-modal';
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-mass-insp-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Массовое вдохновение</h2>
      <form id="mass-insp-form">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;">
          <label><input type="radio" name="insp" value="on" checked> Выдать вдохновение</label>
          <label><input type="radio" name="insp" value="off"> Снять вдохновение</label>
        </div>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Применить</button>
          <button type="button" id="cancel-mass-insp" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-mass-insp-modal').onclick = () => modal.remove();
  document.getElementById('cancel-mass-insp').onclick = () => modal.remove();
  modal.querySelector('#mass-insp-form').onsubmit = function(e) {
    e.preventDefault();
    const val = modal.querySelector('input[name="insp"]:checked').value;
    selected.forEach(idx => {
      const c = getCombatants()[idx];
      if (c) c.inspiration = (val === 'on');
    });
    renderCombatants();
    modal.remove();
  };
}

// SVG-иконки для кнопок
const icons = {
  add: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="3" width="2" height="14" rx="1" fill="currentColor"/><rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/></svg>`,
  monster: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><ellipse cx="10" cy="13" rx="4" ry="2" fill="currentColor"/><circle cx="7" cy="9" r="1" fill="#fff"/><circle cx="13" cy="9" r="1" fill="#fff"/></svg>`,
  ref: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="12" height="12" rx="3" stroke="currentColor" stroke-width="2"/><rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor"/></svg>`,
  delete: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="6" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 9v4M12 9v4" stroke="currentColor" stroke-width="2"/><path d="M8 6V4h4v2" stroke="currentColor" stroke-width="2"/></svg>`,
  damage: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 6v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  heal: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 7v6M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  inventory: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="12" height="7" rx="2" stroke="currentColor" stroke-width="2"/><rect x="7" y="4" width="6" height="3" rx="1" fill="currentColor"/></svg>`,
  insp: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 6v4l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  selectAll: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="12" height="12" rx="3" stroke="currentColor" stroke-width="2"/><path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  clear: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  prev: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 15l-5-5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  next: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  reset: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 6v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

// SVG-иконки для темы
const themeIcons = {
  dark: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a8 8 0 1 0 8 8c0-4.418-3.582-8-8-8z" fill="currentColor"/></svg>`,
  light: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2"><line x1="10" y1="1" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="19"/><line x1="1" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="19" y2="10"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="13.66" y1="13.66" x2="15.78" y2="15.78"/><line x1="4.22" y1="15.78" x2="6.34" y2="13.66"/><line x1="13.66" y1="6.34" x2="15.78" y2="4.22"/></g></svg>`
};

function getTheme() {
  return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
}

function renderCombatants() {
  const app = document.getElementById('app');
  if (!app) return;
  const combatants = getSortedAndFilteredCombatants();
  const selected = new Set(getSelected());
  const sort = getSort();
  const filter = getFilter();
  let currentIdx = getCurrentIdx();
  const round = getRound();
  // --- Корректировка индекса активного участника ---
  if (currentIdx >= combatants.length) {
    setCurrentIdx(0);
    currentIdx = 0;
  }

  // --- Новая панель навигации ---
  let navHtml = `<div class="nav-wrapper"><nav class="main-nav">
    <button id="add-combatant-btn" class="nav-btn accent">${icons.add} <span>Добавить</span></button>
    <button id="add-monster-btn" class="nav-btn">${icons.monster} <span>Монстр</span></button>
    <button id="reference-btn" class="nav-btn">${icons.ref} <span>Справочник</span></button>
    <div class="nav-group">
      <button id="delete-selected-btn" class="nav-btn">${icons.delete} <span>Удалить</span></button>
      <button id="mass-damage-btn" class="nav-btn">${icons.damage} <span>Урон</span></button>
      <button id="mass-heal-btn" class="nav-btn">${icons.heal} <span>Исцеление</span></button>
      <button id="mass-inventory-btn" class="nav-btn">${icons.inventory} <span>Инвентарь</span></button>
      <button id="mass-insp-btn" class="nav-btn">${icons.insp} <span>Вдохновение</span></button>
    </div>
    <select id="filter-type" class="nav-select">
      <option value="all">Все типы</option>
      <option value="pc">PC</option>
      <option value="npc">NPC</option>
      <option value="monster">Monster</option>
    </select>
    <span style="margin-left:24px;font-weight:500;">Раунд: <span id="round-num">${round}</span></span>
    <span style="margin-left:18px;font-weight:500;">Ход: <span id="turn-num">${currentIdx+1}/${combatants.length}</span></span>
    <button id="prev-turn-btn" class="nav-btn">${icons.prev}</button>
    <button id="next-turn-btn" class="nav-btn accent">${icons.next}</button>
    <button id="reset-turn-btn" class="nav-btn">${icons.reset}</button>
    <button id="theme-toggle-btn" class="nav-btn" style="margin-left:auto;">${getTheme()==='dark'?themeIcons.dark:themeIcons.light} <span>${getTheme()==='dark'?'Тёмная':'Светлая'} тема</span></button>
  </nav></div>`;

  let html = navHtml;
  // --- Таблица с чекбоксом в заголовке и resizer-ручками ---
  const allSelected = combatants.length > 0 && combatants.every((_, i) => selected.has(i));
  const columns = [
    { key: '', label: '', resizable: false },
    { key: 'name', label: 'Имя', resizable: true },
    { key: 'type', label: 'Тип', resizable: true },
    { key: 'initiative', label: 'Инициатива', resizable: true },
    { key: 'ac', label: 'КД', resizable: true },
    { key: 'hp', label: 'Хиты', resizable: true },
    { key: 'effects', label: 'Эффекты', resizable: true },
    { key: 'inspiration', label: 'Вдохновение', resizable: true },
    { key: 'spellSlots', label: 'Слоты/Ресурсы', resizable: true },
    { key: 'note', label: 'Заметка', resizable: true },
    { key: 'inv', label: 'Инвентарь', resizable: true },
    { key: 'edit', label: '', resizable: false },
    { key: 'delete', label: '', resizable: false }
  ];
  // Сохраняем ширины в памяти (можно расширить до localStorage)
  if (!window._colWidths) window._colWidths = {};
  html += `<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
    <thead><tr>`;
  columns.forEach((col, idx) => {
    let width = window._colWidths[idx] ? `width:${window._colWidths[idx]}px;` : '';
    html += `<th style="${col.key === '' ? 'text-align:center;' : ''}${width}position:relative;">
      ${idx === 0 ? `<div class='checkbox-center'><input type=\"checkbox\" id=\"select-all-checkbox\" style=\"width:22px;height:22px;cursor:pointer;accent-color:var(--accent);\" ${allSelected ? 'checked' : ''} /></div>` : ''}
      ${col.label ? `<span class=\"th-label\">${col.label}${sort.field === col.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</span>` : ''}
      ${col.resizable && idx < columns.length - 1 ? `<div class=\"resizer\" data-idx=\"${idx}\"></div>` : ''}
    </th>`;
  });
  html += `</tr></thead>`;
  html += '<tbody>';
  for (let i = 0; i < combatants.length; i++) {
    const c = combatants[i];
    const isEditing = window._editingCell || {};
    const isActive = i === currentIdx;
    html += `<tr data-idx="${i}" draggable="true"${isActive ? ' class="active-turn"' : ''}>`;
    html += `<td style='text-align:center;'><div class='checkbox-center'><input type='checkbox' class='select-combatant' data-idx='${i}' ${selected.has(i) ? 'checked' : ''}></div></td>`;
    // Имя (оставим как есть)
    html += `<td class="cell-name" data-idx="${i}" style="cursor:pointer">${c.name}</td>`;
    // Тип (select)
    if (isEditing.row === i && isEditing.col === 'type') {
      html += `<td style='text-align:center;'><select class='inline-edit' data-idx='${i}' data-col='type' autofocus style='width:100%;font-size:1em;'>
        <option value='pc' ${c.type==='pc'?'selected':''}>PC</option>
        <option value='npc' ${c.type==='npc'?'selected':''}>NPC</option>
        <option value='monster' ${c.type==='monster'?'selected':''}>Monster</option>
      </select></td>`;
    } else {
      html += `<td class="cell-type" data-idx="${i}" style="cursor:pointer;text-align:center;">${c.type}</td>`;
    }
    // Инициатива
    if (isEditing.row === i && isEditing.col === 'initiative') {
      html += `<td style='text-align:center;'><input type='number' class='inline-edit' data-idx='${i}' data-col='initiative' value='${c.initiative}' autofocus style='width:100%;font-size:1em;'></td>`;
    } else {
      html += `<td class="cell-initiative" data-idx="${i}" style="cursor:pointer;text-align:center;">${c.initiative}</td>`;
    }
    // КД
    if (isEditing.row === i && isEditing.col === 'ac') {
      html += `<td style='text-align:center;'><input type='number' class='inline-edit' data-idx='${i}' data-col='ac' value='${c.ac}' autofocus style='width:100%;font-size:1em;'></td>`;
    } else {
      html += `<td class="cell-ac" data-idx="${i}" style="cursor:pointer;text-align:center;">${c.ac}</td>`;
    }
    // Хиты
    if (isEditing.row === i && isEditing.col === 'hp') {
      html += `<td style='text-align:center;'><input type='number' class='inline-edit' data-idx='${i}' data-col='hp' value='${c.hp}' autofocus style='width:100%;font-size:1em;'></td>`;
    } else {
      // --- Цветовая индикация состояния хитов ---
      let maxHp = c.maxHp || c.hp || 1;
      if (c.hp > maxHp) maxHp = c.hp; // если вдруг вылечили больше максимума
      let percent = (c.hp / maxHp) * 100;
      let hpColor = '#fff';
      let critical = false;
      if (c.hp === 0) { hpColor = '#e53935'; critical = true; } // красный
      else if (percent < 10) { hpColor = '#ff9800'; critical = true; } // оранжевый
      else if (percent < 50) { hpColor = '#fff59d'; critical = true; } // жёлтый
      else if (percent > 80) hpColor = '#fff'; // белый
      else hpColor = '#f5f5f5'; // нейтральный светло-серый
      let hpStyle = `cursor:pointer;background:${hpColor};font-weight:600;text-align:center;`;
      if (c.hp === 0) hpStyle += 'color:#b71c1c;';
      // Если строка активная — перекрываем фон активным цветом ТОЛЬКО если не критическое состояние
      if (isActive && !critical) hpStyle += 'background:var(--active-row-bg,#e3f2fd);';
      html += `<td class=\"cell-hp\" data-idx=\"${i}\" style=\"${hpStyle}\">${c.hp}</td>`;
    }
    // Эффекты
    html += `<td class="cell-effects" data-idx="${i}" style="text-align:center;">
      <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;justify-content:center;">
        ${(c.effects||[]).map((eff, j) => `<span class='chip effect-chip' title='${eff.desc||''}' style='background:#b0bec5;color:#222;'>${eff.icon||'★'}${eff.name}${eff.duration?` <span style='color:#888;font-size:0.95em;'>(${eff.duration})</span>`:''}<button class='effect-remove' data-idx="${i}" data-eff="${j}" style='margin-left:2px;padding:2px 6px;border-radius:6px;background:#eee;color:#c00;border:none;cursor:pointer;'>×</button></span>`).join('')}
        <button class='effect-add' data-idx="${i}" style='margin-left:2px;padding:2px 6px;border-radius:6px;background:#eee;color:#222;border:none;cursor:pointer;'>+</button>
      </div>
    </td>`;
    // Вдохновение
    html += `<td class="cell-inspiration" data-idx="${i}" style="text-align:center;">
      <div class="inspiration-toggle" data-idx="${i}" style="cursor:pointer;padding:4px 8px;border-radius:8px;background:${c.inspiration ? '#e8f5e9' : '#f3e5f5'};color:${c.inspiration ? '#2e7d32' : '#c62828'};font-weight:600;">
        ${c.inspiration ? 'Вдохновение' : 'Нет вдохновения'}
      </div>
    </td>`;
    // Слоты/Ресурсы
    html += `<td class="cell-spellSlots" data-idx="${i}" style="text-align:center;">
      <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;justify-content:center;">
        ${(c.spellSlots||[]).map(slot => `<span class='chip spell-slot-chip' title='${slot.name} (${slot.value})' style='background:#e0f2f7;color:#1976d2;'>${slot.icon}${slot.name}</span>`).join('')}
        <button class='spell-slot-add' data-idx="${i}" style='margin-left:2px;padding:2px 6px;border-radius:6px;background:#eee;color:#222;border:none;cursor:pointer;'>+</button>
      </div>
    </td>`;
    // Заметка
    if (isEditing.row === i && isEditing.col === 'note') {
      html += `<td style='text-align:center;'><textarea class='inline-edit' data-idx='${i}' data-col='note' style='width:100%;font-size:1em;'>${c.note}</textarea></td>`;
    } else {
      html += `<td class="cell-note" data-idx="${i}" style="cursor:pointer;text-align:center;">${c.note || ''}</td>`;
    }
    // Инвентарь
    html += `<td class="cell-inventory" data-idx="${i}" style="text-align:center;">
      <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;justify-content:center;">
        ${(c.inventory||[]).map(item => `<span class='chip inventory-item-chip' title='${item.name} (${item.qty})' style='background:#e0f2f7;color:#1976d2;'>${item.icon}${item.name}</span>`).join('')}
        <button class='inventory-item-add' data-idx="${i}" style='margin-left:2px;padding:2px 6px;border-radius:6px;background:#eee;color:#222;border:none;cursor:pointer;'>+</button>
      </div>
    </td>`;
    // Кнопки редактирования и удаления
    html += `<td class="cell-edit" data-idx="${i}" style="text-align:center;">
      <button class="edit-btn" data-idx="${i}" title="Редактировать">${icons.edit || `<svg width='18' height='18' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4 14.5V16h1.5l8.06-8.06-1.5-1.5L4 14.5zm11.04-7.04a1 1 0 0 0 0-1.41l-2.09-2.09a1 1 0 0 0-1.41 0l-1.13 1.13 3.5 3.5 1.13-1.13z' fill='currentColor'/></svg>`}</button>
      <button class="delete-btn" data-idx="${i}" title="Удалить">${icons.delete}</button>
    </td>`;
    // --- Закрываю строку участника ---
    html += `</tr>`;
  }
  html += '</tbody></table>';
  app.innerHTML = html;

  // === ОБРАБОТЧИКИ КНОПОК И ЭЛЕМЕНТОВ ===
  // Кнопка добавления участника
  const addBtn = app.querySelector('#add-combatant-btn');
  if (addBtn) addBtn.addEventListener('click', addCombatant);

  // Кнопка добавления монстра
  const addMonsterBtn = app.querySelector('#add-monster-btn');
  if (addMonsterBtn) addMonsterBtn.addEventListener('click', showMonsterModal);

  // Кнопка справочника
  const refBtn = app.querySelector('#reference-btn');
  if (refBtn) refBtn.addEventListener('click', showReferenceModal);

  // Кнопка массового удаления
  const delSelBtn = app.querySelector('#delete-selected-btn');
  if (delSelBtn) delSelBtn.addEventListener('click', () => {
    deleteSelectedCombatants();
    renderCombatants();
  });

  // Кнопка массового урона
  const massDmgBtn = app.querySelector('#mass-damage-btn');
  if (massDmgBtn) massDmgBtn.addEventListener('click', () => {
    showMassDamageModal('damage');
  });

  // Кнопка массового исцеления
  const massHealBtn = app.querySelector('#mass-heal-btn');
  if (massHealBtn) massHealBtn.addEventListener('click', () => {
    showMassDamageModal('heal');
  });

  // Кнопка массового инвентаря
  const massInvBtn = app.querySelector('#mass-inventory-btn');
  if (massInvBtn) massInvBtn.addEventListener('click', showMassInventoryModal);

  // Кнопка массового вдохновения
  const massInspBtn = app.querySelector('#mass-insp-btn');
  if (massInspBtn) massInspBtn.addEventListener('click', showMassInspirationModal);

  // Кнопка переключения темы
  const themeBtn = app.querySelector('#theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    renderCombatants();
  });

  // Фильтр по типу
  const filterType = app.querySelector('#filter-type');
  if (filterType) filterType.addEventListener('change', (e) => {
    setFilter(e.target.value);
    renderCombatants();
  });

  // Чекбокс выделить всех
  const selectAllBox = app.querySelector('#select-all-checkbox');
  if (selectAllBox) selectAllBox.addEventListener('change', () => {
    if (selectAllBox.checked) {
      selectAll();
    } else {
      clearSelection();
    }
    renderCombatants();
  });

  // Чекбоксы выделения
  app.querySelectorAll('.select-combatant').forEach(el => {
    el.addEventListener('change', () => {
      toggleSelect(Number(el.dataset.idx));
      renderCombatants();
    });
  });

  // Кнопки удаления участника
  app.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = Number(el.dataset.idx);
      deleteCombatantRaw(idx);
      renderCombatants();
    });
  });

  // Кнопки редактирования участника
  app.querySelectorAll('.edit-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = Number(el.dataset.idx);
      if (typeof editFullCombatant === 'function') {
        editFullCombatant(idx);
      } else {
        // fallback: showFullEditModal
        const c = getCombatants()[idx];
        showFullEditModal({
          initial: { ...c },
          onSubmit: (data) => {
            updateCombatant(idx, data);
            renderCombatants();
          }
        });
      }
    });
  });

  // Клик по имени для быстрого редактирования
  app.querySelectorAll('.cell-name').forEach(el => {
    el.addEventListener('click', () => editName(Number(el.dataset.idx)));
  });

  // Клик по типу
  app.querySelectorAll('.cell-type').forEach(el => {
    el.addEventListener('click', () => editType(Number(el.dataset.idx)));
  });

  // Клик по инициативе
  app.querySelectorAll('.cell-initiative').forEach(el => {
    el.addEventListener('click', () => editInitiative(Number(el.dataset.idx)));
  });

  // Клик по КД
  app.querySelectorAll('.cell-ac').forEach(el => {
    el.addEventListener('click', () => editAC(Number(el.dataset.idx)));
  });

  // Клик по хп
  app.querySelectorAll('.cell-hp').forEach(el => {
    el.addEventListener('click', () => editHP(Number(el.dataset.idx)));
  });

  // Клик по заметке
  app.querySelectorAll('.cell-note').forEach(el => {
    el.addEventListener('click', () => editNote(Number(el.dataset.idx)));
  });

  // --- Здесь можно добавить обработчики для инвентаря, эффектов и т.д. ---

  // Кнопки добавления/удаления эффектов
  app.querySelectorAll('.effect-add').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      const combatants = getCombatants();
      if (!combatants[idx].effects) combatants[idx].effects = [];
      showEditModal({
        title: 'Добавить эффект',
        value: '',
        onSubmit: (val) => {
          if (val) {
            combatants[idx].effects.push({ name: val });
            renderCombatants();
          }
        }
      });
    });
  });
  app.querySelectorAll('.effect-remove').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      const eff = Number(el.dataset.eff);
      const combatants = getCombatants();
      if (combatants[idx].effects) combatants[idx].effects.splice(eff, 1);
      renderCombatants();
    });
  });

  // Кнопка вдохновения
  app.querySelectorAll('.inspiration-toggle').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      const combatants = getCombatants();
      combatants[idx].inspiration = !combatants[idx].inspiration;
      renderCombatants();
    });
  });

  // Кнопка добавления слота/ресурса
  app.querySelectorAll('.spell-slot-add').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      const combatants = getCombatants();
      if (!combatants[idx].spellSlots) combatants[idx].spellSlots = [];
      showEditModal({
        title: 'Название слота/ресурса',
        value: '',
        onSubmit: (val) => {
          if (val) {
            combatants[idx].spellSlots.push({ name: val, value: 1 });
            renderCombatants();
          }
        }
      });
    });
  });

  // Кнопка добавления предмета инвентаря
  app.querySelectorAll('.inventory-item-add').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      const combatants = getCombatants();
      if (!combatants[idx].inventory) combatants[idx].inventory = [];
      showEditModal({
        title: 'Название предмета',
        value: '',
        onSubmit: (val) => {
          if (val) {
            combatants[idx].inventory.push({ name: val, qty: 1 });
            renderCombatants();
          }
        }
      });
    });
  });

  // Исправляю массовое исцеление и урон
  if (massDmgBtn) massDmgBtn.addEventListener('click', () => {
    showMassDamageModal('damage');
  });
  if (massHealBtn) massHealBtn.addEventListener('click', () => {
    showMassDamageModal('heal');
  });
}

// Рендерим интерфейс при запуске
renderCombatants();