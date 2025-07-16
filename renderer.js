// renderer.js — точка входа для логики интерфейса D&D Tracker

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
      <input id="edit-name" type="text" placeholder="Имя" value="${initial.name ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <select id="edit-type" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;">
        ${types.map(t => `<option value="${t}"${initial.type === t ? ' selected' : ''}>${t}</option>`).join('')}
      </select>
      <input id="edit-initiative" type="number" placeholder="Инициатива" value="${initial.initiative ?? 0}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-ac" type="number" placeholder="КД (AC)" value="${initial.ac ?? 10}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-hp" type="number" placeholder="Хиты" value="${initial.hp ?? 10}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
      <input id="edit-note" type="text" placeholder="Заметка" value="${initial.note ?? ''}" style="font-size:1em;padding:8px 12px;border-radius:8px;border:1.5px solid #e5e5ea;outline:none;" />
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
    const note = modal.querySelector('#edit-note').value;
    if (name) {
      onSubmit({ name, type, initiative, ac, hp, note });
      close();
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
    initial: { isNew: true },
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

// Обновлённый рендер с интерактивностью
function renderCombatants() {
  const app = document.getElementById('app');
  if (!app) return;
  const combatants = getSortedAndFilteredCombatants();
  const selected = new Set(getSelected());
  const sort = getSort();
  const filter = getFilter();
  const currentIdx = getCurrentIdx();
  const round = getRound();
  let html = `<div style="margin-bottom:16px;display:flex;gap:12px;align-items:center;">
    <button id="add-combatant-btn" style="padding:8px 18px;border-radius:10px;background:#007aff;color:#fff;border:none;cursor:pointer;font-size:1em;">+ Добавить участника</button>
    <button id="add-monster-btn" style="padding:8px 18px;border-radius:10px;background:#23272f;color:#fff;border:none;cursor:pointer;font-size:1em;">+ Монстр</button>
    <button id="reference-btn" style="padding:8px 18px;border-radius:10px;background:#f6f7f9;color:#23272f;border:1.5px solid #e5e5ea;cursor:pointer;font-size:1em;">Справочник</button>
    <button id="delete-selected-btn" style="padding:8px 18px;border-radius:10px;background:#e74c3c;color:#fff;border:none;cursor:pointer;font-size:1em;">Удалить выделенных</button>
    <button id="mass-damage-btn" style="padding:8px 18px;border-radius:10px;background:#e67e22;color:#fff;border:none;cursor:pointer;font-size:1em;">Массовый урон</button>
    <button id="mass-heal-btn" style="padding:8px 18px;border-radius:10px;background:#27ae60;color:#fff;border:none;cursor:pointer;font-size:1em;">Массовое исцеление</button>
    <button id="mass-inventory-btn" style="padding:8px 18px;border-radius:10px;background:#bbb;color:#fff;border:none;cursor:pointer;font-size:1em;">Массовый инвентарь</button>
    <button id="mass-insp-btn" style="padding:8px 18px;border-radius:10px;background:#f4f4f7;color:#23272f;border:1.5px solid #e5e5ea;cursor:pointer;font-size:1em;">Массовое вдохновение</button>
    <button id="select-all-btn" style="padding:8px 18px;border-radius:10px;background:#888;color:#fff;border:none;cursor:pointer;font-size:1em;">Выделить всех</button>
    <button id="clear-selection-btn" style="padding:8px 18px;border-radius:10px;background:#bbb;color:#fff;border:none;cursor:pointer;font-size:1em;">Снять выделение</button>
    <select id="filter-type" style="padding:8px 12px;border-radius:8px;font-size:1em;">
      ${typeOptions.map(opt => `<option value="${opt.value}"${filter === opt.value ? ' selected' : ''}>${opt.label}</option>`).join('')}
    </select>
    <span style="margin-left:32px;font-weight:500;">Раунд: <span id="round-num">${round}</span></span>
    <button id="prev-turn-btn" style="padding:8px 14px;border-radius:8px;background:#bbb;color:#fff;border:none;cursor:pointer;">&lt; Предыдущий ход</button>
    <button id="next-turn-btn" style="padding:8px 14px;border-radius:8px;background:#007aff;color:#fff;border:none;cursor:pointer;">Следующий ход &gt;</button>
    <button id="reset-turn-btn" style="padding:8px 14px;border-radius:8px;background:#888;color:#fff;border:none;cursor:pointer;">Сбросить раунд</button>
  </div>`;
  html += `<table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th></th>
      <th class="sortable" data-field="name" style="cursor:pointer;">Имя${sort.field === 'name' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
      <th class="sortable" data-field="type" style="cursor:pointer;">Тип${sort.field === 'type' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
      <th class="sortable" data-field="initiative" style="cursor:pointer;">Инициатива${sort.field === 'initiative' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
      <th class="sortable" data-field="ac" style="cursor:pointer;">КД${sort.field === 'ac' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
      <th class="sortable" data-field="hp" style="cursor:pointer;">Хиты${sort.field === 'hp' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
      <th>Заметка</th>
      <th>Инвентарь</th>
      <th></th><th></th>
    </tr></thead>
    <tbody>`;
  for (let i = 0; i < combatants.length; i++) {
    const c = combatants[i];
    html += `<tr data-idx="${i}" draggable="true">
      <td><input type="checkbox" class="select-combatant" data-idx="${i}"${selected.has(i) ? ' checked' : ''}></td>
      <td class="cell-name" data-idx="${i}" style="cursor:pointer">${c.name}</td>
      <td class="cell-type" data-idx="${i}" style="cursor:pointer">${c.type}</td>
      <td class="cell-initiative" data-idx="${i}" style="cursor:pointer">${c.initiative}</td>
      <td class="cell-ac" data-idx="${i}" style="cursor:pointer">${c.ac}</td>
      <td class="cell-hp" data-idx="${i}" style="cursor:pointer">${c.hp} <button class="dmg-btn" title="Урон/исцеление" data-idx="${i}" style="margin-left:6px;padding:2px 7px;border-radius:7px;background:#f4f4f7;border:none;cursor:pointer;font-size:1em;">💥</button></td>
      <td class="cell-note" data-idx="${i}" style="cursor:pointer">${c.note ? c.note : ''}</td>
      <td class="cell-inventory" data-idx="${i}">
        <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
          ${(c.inventory||[]).map((item, j) => {
            if (!item || typeof item !== 'object' || !item.name) return '';
            const typeColors = {
              'оружие': '#bdb76b',
              'броня': '#90caf9',
              'зелье': '#ffb74d',
              'артефакт': '#ce93d8',
              'прочее': '#b0bec5'
            };
            const color = typeColors[item.type] || '#b0bec5';
            const usedIcon = item.used ? '✔️' : '';
            const style = `background:${color};color:#222;border-radius:8px;padding:2px 8px;display:inline-flex;align-items:center;gap:4px;${item.used?'text-decoration:line-through;opacity:0.6;':''}`;
            return `<span class='chip' style='${style}' title='${item.desc?item.desc.replace(/'/g,'&#39;'):''}'>
              <span style='font-weight:600;'>${item.name}</span>
              <span style='font-size:0.98em;'>x${item.qty||1}</span>
              <span style='font-size:0.98em;'>${item.type}</span>
              ${item.weight?`<span style='font-size:0.95em;color:#888;'>${item.weight}кг</span>`:''}
              ${item.cost?`<span style='font-size:0.95em;color:#888;'>${item.cost}зм</span>`:''}
              ${usedIcon?`<span title='Использован' style='font-size:1.1em;'>${usedIcon}</span>`:''}
              <button class='chip-edit' data-idx="${i}" data-item="${j}" style='margin-left:2px;padding:2px 6px;border-radius:6px;background:#eee;color:#222;border:none;cursor:pointer;'>✎</button>
              <button class='chip-remove' data-idx="${i}" data-item="${j}" style='margin-left:2px;padding:2px 6px;border-radius:6px;background:#eee;color:#c00;border:none;cursor:pointer;'>×</button>
            </span>`;
          }).join('')}
          <button class='add-inventory-btn' data-idx="${i}" style='margin-left:4px;padding:2px 10px;border-radius:8px;background:#f6f7f9;color:#007aff;border:1.5px solid #e5e5ea;cursor:pointer;'>+ Предмет</button>
        </div>
      </td>
      <td><button class="edit-combatant-btn" data-idx="${i}" style="padding:4px 10px;border-radius:8px;background:#888;color:#fff;border:none;cursor:pointer;">Редактировать</button></td>
      <td><button class="delete-combatant-btn" data-idx="${i}" style="padding:4px 10px;border-radius:8px;background:#e74c3c;color:#fff;border:none;cursor:pointer;">Удалить</button></td>
    </tr>`;
  }
  html += '</tbody></table>';
  app.innerHTML = html;

  // Кнопка добавления
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
    showEditModal({
      title: 'Нанести урон (всем выделенным):',
      value: 1,
      type: 'number',
      onSubmit: (val) => {
        const dmg = parseInt(val, 10);
        if (!isNaN(dmg) && dmg > 0) {
          massDamage(dmg);
          renderCombatants();
        }
      }
    });
  });

  // Кнопка массового исцеления
  const massHealBtn = app.querySelector('#mass-heal-btn');
  if (massHealBtn) massHealBtn.addEventListener('click', () => {
    showEditModal({
      title: 'Исцелить (всех выделенных) на:',
      value: 1,
      type: 'number',
      onSubmit: (val) => {
        const heal = parseInt(val, 10);
        if (!isNaN(heal) && heal > 0) {
          massHeal(heal);
          renderCombatants();
        }
      }
    });
  });

  // Кнопка массового инвентаря
  const massInvBtn = app.querySelector('#mass-inventory-btn');
  if (massInvBtn) massInvBtn.addEventListener('click', showMassInventoryModal);

  // Кнопка массового вдохновения
  const massInspBtn = app.querySelector('#mass-insp-btn');
  if (massInspBtn) massInspBtn.addEventListener('click', showMassInspirationModal);

  // Кнопка выделить всех
  const selAllBtn = app.querySelector('#select-all-btn');
  if (selAllBtn) selAllBtn.addEventListener('click', () => {
    selectAll();
    renderCombatants();
  });

  // Кнопка снять выделение
  const clearSelBtn = app.querySelector('#clear-selection-btn');
  if (clearSelBtn) clearSelBtn.addEventListener('click', () => {
    clearSelection();
    renderCombatants();
  });

  // Чекбоксы выделения
  app.querySelectorAll('.select-combatant').forEach(el => {
    el.addEventListener('change', () => {
      toggleSelect(Number(el.dataset.idx));
      renderCombatants();
    });
  });

  // Сортировка по клику на заголовок
  app.querySelectorAll('.sortable').forEach(el => {
    el.addEventListener('click', () => {
      setSort(el.dataset.field);
      renderCombatants();
    });
  });

  // Фильтрация по типу
  const filterType = app.querySelector('#filter-type');
  if (filterType) filterType.addEventListener('change', (e) => {
    setFilter(e.target.value);
    renderCombatants();
  });

  // Кнопки удаления
  app.querySelectorAll('.delete-combatant-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = Number(el.dataset.idx);
      deleteCombatant(idx);
    });
  });

  // Кнопки редактирования
  app.querySelectorAll('.edit-combatant-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = Number(el.dataset.idx);
      editFullCombatant(idx);
    });
  });

  // Навешиваем обработчики событий на ячейки (оставляем для быстрого редактирования отдельных полей)
  app.querySelectorAll('.cell-name').forEach(el => {
    el.addEventListener('click', () => editName(Number(el.dataset.idx)));
  });
  app.querySelectorAll('.cell-type').forEach(el => {
    el.addEventListener('click', () => editType(Number(el.dataset.idx)));
  });
  app.querySelectorAll('.cell-initiative').forEach(el => {
    el.addEventListener('click', () => editInitiative(Number(el.dataset.idx)));
  });
  app.querySelectorAll('.cell-ac').forEach(el => {
    el.addEventListener('click', () => editAC(Number(el.dataset.idx)));
  });
  app.querySelectorAll('.cell-hp').forEach(el => {
    el.addEventListener('click', () => editHP(Number(el.dataset.idx)));
  });
  app.querySelectorAll('.cell-note').forEach(el => {
    el.addEventListener('click', () => editNote(Number(el.dataset.idx)));
  });

  // Кнопки перехода хода
  const nextBtn = app.querySelector('#next-turn-btn');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextTurn();
    renderCombatants();
  });
  const prevBtn = app.querySelector('#prev-turn-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevTurn();
    renderCombatants();
  });
  const resetBtn = app.querySelector('#reset-turn-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    resetTurn();
    renderCombatants();
  });

  const monstersBtn = app.querySelector('#monsters-btn');
  if (monstersBtn) monstersBtn.addEventListener('click', showMonsterModal);

  // === Drag&Drop для перестановки участников ===
  let dragSrcIdx = null;
  function handleDragStart(e) {
    dragSrcIdx = Number(e.currentTarget.getAttribute('data-idx'));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSrcIdx);
    e.currentTarget.style.opacity = '0.5';
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function handleDrop(e) {
    e.preventDefault();
    const targetIdx = Number(e.currentTarget.getAttribute('data-idx'));
    if (dragSrcIdx === null || targetIdx === dragSrcIdx) return;
    const arr = getCombatants();
    const moved = arr.splice(dragSrcIdx, 1)[0];
    let insertIdx = targetIdx;
    if (targetIdx > dragSrcIdx) insertIdx = targetIdx;
    arr.splice(insertIdx, 0, moved);
    renderCombatants();
  }
  function handleDragEnd(e) {
    e.currentTarget.style.opacity = '';
    dragSrcIdx = null;
  }
  // ... existing code ...
  // В renderCombatants добавляю обработчики drag&drop на строки
  // ... existing code ...
  // Drag&Drop обработчики
  app.querySelectorAll('tr[data-idx]').forEach(row => {
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);
  });
}

// === Панель кубиков ===
let diceHistory = [];
function renderDicePanel() {
  let html = `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
    ${[4,6,8,10,12,20,100].map(s => `<button class="icon-btn dice-btn tooltip" data-tooltip="Бросить d${s}" data-sides="${s}" style="padding:8px 14px;border-radius:10px;background:#f4f4f7;border:none;font-size:1.1em;box-shadow:0 1px 4px #0001;cursor:pointer;transition:background 0.2s;">d${s}</button>`).join('')}
  </div>`;
  html += `<div style='display:flex;align-items:center;gap:10px;margin-bottom:18px;'>
    <div id="dice-history" style="font-size:1.08em;min-height:1.5em;">
      ${diceHistory.slice(0, 6).map(e => `<div class="fade-in">${e}</div>`).join('')}
    </div>
    <button class="icon-btn tooltip" data-tooltip="Очистить историю" id="clear-dice-history-btn" style="margin-left:8px;padding:6px 12px;border-radius:8px;background:#fff0f0;border:1px solid #ffd0d0;color:#e53935;font-size:1em;">Очистить</button>
  </div>`;
  const panel = document.getElementById('dice-panel');
  if (panel) panel.innerHTML = html;
}
window.clearDiceHistory = function() { diceHistory = []; renderDicePanel(); };
function rollDice(sides, count = 1, mod = 0, participantName = null) {
  let rolls = [];
  for (let i = 0; i < count; ++i) rolls.push(Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0) + mod;
  let who = participantName ? `<b>${participantName}</b>: ` : '';
  let result = `${who}${count > 1 ? count + 'd' + sides : 'd' + sides}${mod ? (mod > 0 ? '+' + mod : mod) : ''} → <b>${total}</b> (${rolls.join('+')}${mod ? (mod > 0 ? '+' + mod : mod) : ''})`;
  diceHistory.unshift(result);
  if (diceHistory.length > 10) diceHistory.length = 10;
  renderDicePanel();
  return { rolls, total };
}
window.rollDiceModal = function(sides) {
  const res = rollDice(sides);
  // Можно добавить анимацию/уведомление
};

// --- Обработчики для кнопок инвентаря ---
document.addEventListener('click', function(e) {
  // Добавить предмет
  if (e.target.classList.contains('add-inventory-btn')) {
    const idx = Number(e.target.dataset.idx);
    showInventoryItemModal({
      initial: { isNew: true },
      onSubmit: (item) => {
        const combatants = getCombatants();
        if (!combatants[idx].inventory) combatants[idx].inventory = [];
        combatants[idx].inventory.push(item);
        renderCombatants();
      }
    });
  }
  // Редактировать предмет
  if (e.target.classList.contains('chip-edit')) {
    const idx = Number(e.target.dataset.idx);
    const itemIdx = Number(e.target.dataset.item);
    const combatants = getCombatants();
    const item = combatants[idx].inventory[itemIdx];
    showInventoryItemModal({
      initial: { ...item, isNew: false },
      onSubmit: (newItem) => {
        combatants[idx].inventory[itemIdx] = newItem;
        renderCombatants();
      }
    });
  }
  // Удалить предмет
  if (e.target.classList.contains('chip-remove')) {
    const idx = Number(e.target.dataset.idx);
    const itemIdx = Number(e.target.dataset.item);
    const combatants = getCombatants();
    combatants[idx].inventory.splice(itemIdx, 1);
    renderCombatants();
  }
});

function renderMassDamageBtn() {
  const panel = document.getElementById('mass-panel');
  if (!panel) return;
  let btn = document.getElementById('mass-damage-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'mass-damage-btn';
    btn.textContent = 'Массовый урон/исцеление';
    btn.style = 'padding:8px 18px;border-radius:10px;background:#f4f4f7;color:#23272f;border:none;cursor:pointer;font-size:1em;';
    panel.appendChild(btn);
  }
  btn.onclick = () => showMassDamageModal();
}

// === Контекстное меню для участника ===
let contextMenuEl = null;
function showContextMenu(x, y, idx) {
  hideContextMenu();
  contextMenuEl = document.createElement('div');
  contextMenuEl.className = 'context-menu';
  contextMenuEl.style = `position:fixed;left:${x}px;top:${y}px;z-index:10010;background:#fff;border-radius:14px;box-shadow:0 4px 24px #0002;padding:8px 0;min-width:180px;animation:fadeIn 0.2s;`;
  contextMenuEl.innerHTML = `
    <button class="ctx-btn" data-action="edit" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">✏️ Редактировать</button>
    <button class="ctx-btn" data-action="delete" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">🗑️ Удалить</button>
    <button class="ctx-btn" data-action="damage" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">💥 Урон</button>
    <button class="ctx-btn" data-action="heal" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">💚 Исцеление</button>
    <button class="ctx-btn" data-action="inspiration" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">⭐ Вдохновение</button>
    <button class="ctx-btn" data-action="effects" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">✨ Эффекты</button>
  `;
  document.body.appendChild(contextMenuEl);
  // Обработчики
  contextMenuEl.querySelectorAll('.ctx-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = btn.getAttribute('data-action');
      hideContextMenu();
      if (action === 'edit') editFullCombatant(idx);
      if (action === 'delete') deleteCombatant(idx);
      if (action === 'damage') showDamageModal(idx);
      if (action === 'heal') {
        showDamageModal(idx);
        setTimeout(() => {
          const modal = document.getElementById('damage-modal');
          if (modal) modal.querySelector('#dmg-type').value = 'heal';
        }, 50);
      }
      if (action === 'inspiration') {
        const c = getCombatants()[idx];
        if (c) { c.inspiration = !c.inspiration; renderCombatants(); }
      }
      if (action === 'effects') alert('Быстрые эффекты пока не реализованы');
    });
  });
  // Закрытие по клику вне меню
  setTimeout(() => {
    document.addEventListener('mousedown', hideContextMenu, { once: true });
  }, 0);
}
function hideContextMenu() {
  if (contextMenuEl) {
    contextMenuEl.remove();
    contextMenuEl = null;
  }
}

// Добавляю обработчик правого клика на строке участника
function addContextMenuHandlers() {
  document.querySelectorAll('tr[data-idx]').forEach(row => {
    row.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      const idx = parseInt(row.getAttribute('data-idx'), 10);
      showContextMenu(e.clientX, e.clientY, idx);
    });
  });
}

function renderMassInspBtn() {
  const panel = document.getElementById('mass-panel');
  if (!panel) return;
  let btn = document.getElementById('mass-insp-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'mass-insp-btn';
    btn.textContent = 'Массовое вдохновение';
    btn.style = 'padding:8px 18px;border-radius:10px;background:#f4f4f7;color:#23272f;border:none;cursor:pointer;font-size:1em;';
    panel.appendChild(btn);
  }
  btn.onclick = () => showMassInspirationModal();
}

document.addEventListener('DOMContentLoaded', function() {
  renderCombatants();
  const dicePanel = document.createElement('div');
  dicePanel.id = 'dice-panel';
  dicePanel.style.margin = '18px 0 0 0';
  const app = document.getElementById('app');
  if (app) app.parentNode.insertBefore(dicePanel, app.nextSibling);
  renderDicePanel();
  // Делегирование событий для панели кубиков
  dicePanel.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.classList.contains('dice-btn')) {
      const sides = parseInt(btn.getAttribute('data-sides'), 10);
      if (sides) rollDice(sides);
    }
    if (btn.id === 'clear-dice-history-btn') {
      diceHistory = [];
      renderDicePanel();
    }
  });
  // Делегирование событий для кнопок урона/исцеления
  app.querySelectorAll('.dmg-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      showDamageModal(idx);
    });
  });
  renderMassDamageBtn();
  renderMassInspBtn();
  addContextMenuHandlers(); // Добавляю обработчики для контекстного меню
});

// Горячие клавиши Ctrl+D и Ctrl+H
window.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    showMassDamageModal('damage');
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault();
    showMassDamageModal('heal');
  }
});
// Горячая клавиша Ctrl+I
window.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault();
    showMassInspirationModal();
  }
});

// --- Модалка подробной информации о предмете инвентаря ---
function showInventoryItemInfoModal(item) {
  const oldModal = document.getElementById('inventory-item-info-modal');
  if (oldModal) oldModal.remove();
  const modal = document.createElement('div');
  modal.id = 'inventory-item-info-modal';
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

  // Поиск оригинального объекта в справочниках
  let ref = allItems.find(i => (i.name||i.ru?.name||i.en?.name||'').toLowerCase() === (item.name||'').toLowerCase())
    || allSpells.find(i => (i.name||i.ru?.name||i.en?.name||'').toLowerCase() === (item.name||'').toLowerCase())
    || allArtifacts.find(i => (i.name||i.ru?.name||i.en?.name||'').toLowerCase() === (item.name||'').toLowerCase());
  if (!ref) ref = item; // fallback: показываем то, что есть

  modal.innerHTML = `
    <div style="background:#fff;padding:28px 24px 20px 24px;border-radius:18px;min-width:340px;max-width:96vw;max-height:90vh;overflow:auto;position:relative;box-shadow:0 8px 32px #0002;display:flex;flex-direction:column;gap:12px;">
      <button id="close-inventory-item-info-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <div style='font-size:1.2em;font-weight:600;margin-bottom:8px;'>${ref.name||ref.ru?.name||ref.en?.name||'-'}</div>
      <div style='font-size:1em;color:#888;margin-bottom:6px;'>${ref.type||ref.ru?.type||ref.en?.type||''}</div>
      <div style='font-size:1em;color:#888;margin-bottom:6px;'>${ref.desc||ref.ru?.text||ref.en?.text||''}</div>
      ${ref.weight?`<div style='color:#888;margin-bottom:6px;'>Вес: ${ref.weight}кг</div>`:''}
      ${ref.cost?`<div style='color:#888;margin-bottom:6px;'>Стоимость: ${ref.cost}зм</div>`:''}
      ${ref.rarity?`<div style='color:#888;margin-bottom:6px;'>Редкость: ${ref.rarity}</div>`:''}
      ${ref.source?`<div style='color:#888;margin-bottom:6px;'>Источник: ${ref.source}</div>`:''}
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-inventory-item-info-modal').onclick = () => modal.remove();
}

// --- Обработчик правого клика по предмету инвентаря ---
document.addEventListener('contextmenu', function(e) {
  const chip = e.target.closest('.chip');
  if (chip) {
    e.preventDefault();
    const tr = chip.closest('tr[data-idx]');
    const idx = tr ? Number(tr.getAttribute('data-idx')) : null;
    const itemIdx = chip.querySelector('.chip-edit')?.dataset.item;
    if (idx !== null && itemIdx !== undefined) {
      // Показываем простое контекстное меню
      const menu = document.createElement('div');
      menu.className = 'context-menu';
      menu.style = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:10010;background:#fff;border-radius:14px;box-shadow:0 4px 24px #0002;padding:8px 0;min-width:160px;animation:fadeIn 0.2s;`;
      menu.innerHTML = `
        <button class="ctx-btn" data-action="info" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">ℹ️ Инфо</button>
        <button class="ctx-btn" data-action="edit" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">✏️ Редактировать</button>
        <button class="ctx-btn" data-action="remove" style="width:100%;padding:10px 18px;text-align:left;border:none;background:none;font-size:1em;cursor:pointer;">🗑️ Удалить</button>
      `;
      document.body.appendChild(menu);
      // Обработчики
      menu.querySelectorAll('.ctx-btn').forEach(btn => {
        btn.onclick = function() {
          menu.remove();
          const combatants = getCombatants();
          const item = combatants[idx].inventory[itemIdx];
          if (btn.dataset.action === 'info') showInventoryItemInfoModal(item);
          if (btn.dataset.action === 'edit') showInventoryItemModal({ initial: { ...item, isNew: false }, onSubmit: (newItem) => { combatants[idx].inventory[itemIdx] = newItem; renderCombatants(); } });
          if (btn.dataset.action === 'remove') { combatants[idx].inventory.splice(itemIdx, 1); renderCombatants(); }
        };
      });
      // Закрытие по клику вне меню
      setTimeout(() => {
        document.addEventListener('mousedown', function handler(ev) {
          if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('mousedown', handler); }
        }, { once: true });
      }, 0);
    }
  }
});