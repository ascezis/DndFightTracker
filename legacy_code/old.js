// Массив участников боя
let combatants = [];
let currentIdx = 0;
let round = 1;

// === ДОБАВЛЯЕМ ФУНКЦИИ РУЧНОГО РЕДАКТИРОВАНИЯ (раньше всех) ===
function editName(idx) {
  const old = combatants[idx].name;
  const val = prompt('Изменить имя:', old);
  if (val !== null && val.trim() !== '') {
    combatants[idx].name = val.trim();
    logEvent(`${old}: имя изменено на ${val.trim()}`);
    renderCombatants();
  }
}
window.editName = editName;
function editType(idx) {
  const old = combatants[idx].type;
  const val = prompt('Изменить тип (pc, npc, monster):', old);
  if (val !== null && ['pc','npc','monster'].includes(val.trim())) {
    combatants[idx].type = val.trim();
    logEvent(`${combatants[idx].name}: тип изменён на ${val.trim()}`);
    renderCombatants();
  }
}
window.editType = editType;
function editInitiative(idx) {
  const old = combatants[idx].initiative;
  const val = prompt('Изменить инициативу:', old);
  if (val !== null && !isNaN(parseInt(val, 10))) {
    combatants[idx].initiative = parseInt(val, 10);
    logEvent(`${combatants[idx].name}: инициатива изменена на ${combatants[idx].initiative}`);
    renderCombatants();
  }
}
window.editInitiative = editInitiative;
function editAC(idx) {
  console.log('editAC вызван для', idx, combatants[idx]);
  const old = combatants[idx].ac || 10;
  const val = prompt('Изменить КД (AC):', old);
  if (val !== null && !isNaN(parseInt(val, 10))) {
    combatants[idx].ac = parseInt(val, 10);
    logEvent(`${combatants[idx].name}: КД изменено на ${combatants[idx].ac}`);
    renderCombatants();
  }
}
window.editAC = editAC;
function editTempHp(idx) {
  const old = combatants[idx].tempHp || 0;
  const val = prompt('Изменить временные хиты:', old);
  if (val !== null && !isNaN(parseInt(val, 10))) {
    combatants[idx].tempHp = Math.max(0, parseInt(val, 10));
    logEvent(`${combatants[idx].name}: временные хиты изменены на ${combatants[idx].tempHp}`);
    renderCombatants();
  }
}
window.editTempHp = editTempHp;
function editInspiration(idx) {
  const old = combatants[idx].inspiration;
  const val = confirm('Включить вдохновение? (ОК — да, Отмена — нет)');
  combatants[idx].inspiration = val;
  logEvent(`${combatants[idx].name}: вдохновение ${val ? 'включено' : 'выключено'}`);
  renderCombatants();
}
window.editInspiration = editInspiration;
function editNote(idx) {
  const old = combatants[idx].note;
  const val = prompt('Изменить заметку:', old);
  if (val !== null) {
    combatants[idx].note = val;
    logEvent(`${combatants[idx].name}: заметка изменена на "${val}"`);
    renderCombatants();
  }
}
window.editNote = editNote;

// Используем API через preload вместо прямого require
const electronAPI = window.electronAPI || {};

function svgIcon(name) {
  // Минимальный набор SVG-иконок (можно расширять)
  const icons = {
    theme: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><circle cx='12' cy='12' r='10' fill='none' stroke='#23272f' stroke-width='2'/><path d='M12 2a10 10 0 0 0 0 20V2z' fill='#23272f'/></svg>`,
    note: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><rect x='4' y='4' width='16' height='16' rx='4' fill='none' stroke='#23272f' stroke-width='2'/><path d='M8 8h8M8 12h4' stroke='#23272f' stroke-width='2' stroke-linecap='round'/></svg>`,
    load: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><path d='M12 3v12m0 0l-4-4m4 4l4-4' stroke='#23272f' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/><rect x='4' y='17' width='16' height='4' rx='2' fill='none' stroke='#23272f' stroke-width='2'/></svg>`,
    save: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><path d='M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z' fill='none' stroke='#23272f' stroke-width='2'/><path d='M7 3v4h10V3' stroke='#23272f' stroke-width='2'/></svg>`,
    reset: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><path d='M4 4v6h6' stroke='#23272f' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M20 20v-6h-6' stroke='#23272f' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M4 10a8 8 0 0 1 16 0M20 14a8 8 0 0 1-16 0' stroke='#23272f' stroke-width='2' fill='none'/></svg>`,
    next: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><circle cx='12' cy='12' r='10' fill='none' stroke='#23272f' stroke-width='2'/><path d='M10 8l4 4-4 4' stroke='#23272f' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
    edit: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><path d='M4 20h4l10-10a2.828 2.828 0 0 0-4-4L4 16v4z' fill='none' stroke='#23272f' stroke-width='2'/></svg>`,
    delete: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><rect x='5' y='6' width='14' height='12' rx='2' fill='none' stroke='#23272f' stroke-width='2'/><path d='M9 10v4M15 10v4' stroke='#23272f' stroke-width='2'/><path d='M9 6V4h6v2' stroke='#23272f' stroke-width='2'/></svg>`,
    add: `<svg class='icon' viewBox='0 0 24 24' width='20' height='20'><circle cx='12' cy='12' r='10' fill='none' stroke='#23272f' stroke-width='2'/><path d='M12 8v8M8 12h8' stroke='#23272f' stroke-width='2'/></svg>`
  };
  return icons[name] || '';
}

let sortField = 'initiative';
let sortDir = 'desc';
let groupByType = false;

function setSort(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir = field === 'name' ? 'asc' : 'desc';
  }
  renderCombatants();
}
function toggleGroupByType() {
  groupByType = !groupByType;
  renderCombatants();
}

let searchQuery = '';
let filterType = 'all';

function setSearchQuery(val) {
  searchQuery = val.toLowerCase();
  renderCombatants();
}
function setFilterType(val) {
  filterType = val;
  renderCombatants();
}

function getSortedCombatants() {
  let arr = [...combatants];
  // Фильтрация по типу
  if (filterType !== 'all') arr = arr.filter(c => c.type === filterType);
  // Поиск по имени
  if (searchQuery) arr = arr.filter(c => c.name.toLowerCase().includes(searchQuery));
  arr.sort((a, b) => {
    let vA = a[sortField], vB = b[sortField];
    if (sortField === 'name') {
      vA = vA.toLowerCase(); vB = vB.toLowerCase();
      return sortDir === 'asc' ? vA.localeCompare(vB, 'ru') : vB.localeCompare(vA, 'ru');
    }
    if (typeof vA === 'number' && typeof vB === 'number') {
      return sortDir === 'asc' ? vA - vB : vB - vA;
    }
    return 0;
  });
  if (groupByType) {
    arr.sort((a, b) => (a.type > b.type ? 1 : a.type < b.type ? -1 : 0));
  }
  return arr;
}

let selectedCombatants = new Set();
let selectAllChecked = false;

function toggleSelectCombatant(idx) {
  if (selectedCombatants.has(idx)) {
    selectedCombatants.delete(idx);
  } else {
    selectedCombatants.add(idx);
  }
  renderCombatants();
}
function toggleSelectAll() {
  if (selectAllChecked) {
    selectedCombatants.clear();
    selectAllChecked = false;
  } else {
    getSortedCombatants().forEach((c, i) => selectedCombatants.add(combatants.indexOf(c)));
    selectAllChecked = true;
  }
  renderCombatants();
}
function clearSelection() {
  selectedCombatants.clear();
  selectAllChecked = false;
  renderCombatants();
}

function massDamageHeal(type) {
  saveState();
  const val = parseInt(prompt(type === 'heal' ? 'На сколько исцелить?' : 'На сколько нанести урона?', '1'), 10);
  if (!val || isNaN(val)) return;
  selectedCombatants.forEach(idx => {
    if (type === 'heal') {
      combatants[idx].hp += val;
      logEvent(`${combatants[idx].name}: массовое исцеление на ${val} (теперь ${combatants[idx].hp})`);
    } else {
      combatants[idx].hp = Math.max(0, combatants[idx].hp - val);
      logEvent(`${combatants[idx].name}: массовый урон ${val} (теперь ${combatants[idx].hp})`);
    }
  });
  renderCombatants();
}
function massEffect() {
  saveState();
  const effect = prompt('Какой эффект добавить выделенным?');
  if (!effect) return;
  let duration = prompt('Длительность эффекта в раундах (оставьте пустым, если бессрочно):');
  duration = duration ? parseInt(duration, 10) : null;
  if (duration !== null && isNaN(duration)) duration = null;
  selectedCombatants.forEach(idx => {
    combatants[idx].effects = combatants[idx].effects || [];
    combatants[idx].effects.push({ name: effect, duration });
    logEvent(`${combatants[idx].name}: массовый эффект "${effect}"${duration ? ` (${duration} р.)` : ''}`);
  });
  renderCombatants();
}
function massDelete() {
  if (!confirm('Удалить всех выделенных участников?')) return;
  saveState();
  // Удаляем с конца, чтобы индексы не сбились
  Array.from(selectedCombatants).sort((a,b)=>b-a).forEach(idx => {
    logEvent(`Массовое удаление: ${combatants[idx].name}`);
    combatants.splice(idx, 1);
  });
  clearSelection();
  renderCombatants();
}
function massInspiration() {
  saveState();
  selectedCombatants.forEach(idx => {
    combatants[idx].inspiration = !combatants[idx].inspiration;
    logEvent(`${combatants[idx].name}: массовое переключение вдохновения (${combatants[idx].inspiration ? 'включено' : 'выключено'})`);
  });
  renderCombatants();
}
function massAC() {
  saveState();
  const val = prompt('Новое значение КД (AC) для выделенных:', '10');
  if (!val || isNaN(parseInt(val, 10))) return;
  selectedCombatants.forEach(idx => {
    combatants[idx].ac = parseInt(val, 10);
    logEvent(`${combatants[idx].name}: массовое изменение КД на ${combatants[idx].ac}`);
  });
  renderCombatants();
}

function massInitiative() {
  saveState();
  const val = prompt('Новое значение инициативы для выделенных:', '0');
  if (!val || isNaN(parseInt(val, 10))) return;
  selectedCombatants.forEach(idx => {
    combatants[idx].initiative = parseInt(val, 10);
    logEvent(`${combatants[idx].name}: массовое изменение инициативы на ${combatants[idx].initiative}`);
  });
  renderCombatants();
}

function massTempHp() {
  saveState();
  const val = prompt('Новое значение временных хитов для выделенных:', '0');
  if (!val || isNaN(parseInt(val, 10))) return;
  selectedCombatants.forEach(idx => {
    combatants[idx].tempHp = Math.max(0, parseInt(val, 10));
    logEvent(`${combatants[idx].name}: массовое изменение временных хитов на ${combatants[idx].tempHp}`);
  });
  renderCombatants();
}

function massSpellSlots() {
  saveState();
  const level = parseInt(prompt('Какой уровень слотов изменить?', '1'), 10);
  if (isNaN(level) || level < 1 || level > 9) return;
  const val = parseInt(prompt('Сколько слотов установить?', '0'), 10);
  if (isNaN(val) || val < 0) return;
  selectedCombatants.forEach(idx => {
    combatants[idx].spellSlots[level-1] = val;
    logEvent(`${combatants[idx].name}: слоты ${level} уровня изменены на ${val}`);
  });
  renderCombatants();
}
window.massSpellSlots = massSpellSlots;

// Миграция инвентаря в новый формат (вызывается при любом доступе к combatants)
function migrateInventoryFormat() {
  combatants.forEach(c => {
    if (!Array.isArray(c.inventory)) c.inventory = [];
    c.inventory = c.inventory.map(item => {
      if (typeof item === 'string') {
        return { name: item, type: 'прочее', qty: 1, desc: '', weight: '', cost: '', used: false };
      }
      // Если уже объект, но нет qty/type/desc/used
      return {
        name: item.name || '',
        type: item.type || 'прочее',
        qty: typeof item.qty === 'number' ? item.qty : 1,
        desc: item.desc || '',
        weight: item.weight || '',
        cost: item.cost || '',
        used: !!item.used
      };
    });
  });
}

// Переопределяем функции работы с инвентарём
function addInventoryItem(idx) {
  saveState();
  migrateInventoryFormat();
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10001;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-inv-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Добавить предмет</h2>
      <form id="inv-form">
        <label>Название:<br><input id="inv-name" type="text" required style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Категория:<br>
          <select id="inv-type" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;">
            <option value="оружие">Оружие</option>
            <option value="броня">Броня</option>
            <option value="зелье">Зелье</option>
            <option value="артефакт">Артефакт</option>
            <option value="прочее">Прочее</option>
          </select>
        </label><br>
        <label>Количество:<br><input id="inv-qty" type="number" min="1" value="1" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Описание:<br><input id="inv-desc" type="text" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Вес:<br><input id="inv-weight" type="text" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Стоимость:<br><input id="inv-cost" type="text" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label><input id="inv-used" type="checkbox"> Использован (одноразовый)</label><br>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Добавить</button>
          <button type="button" id="cancel-inv" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-inv-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-inv').onclick = () => closeWithFadeOut(modal);
  document.getElementById('inv-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('inv-name').value.trim();
    const type = document.getElementById('inv-type').value;
    const qty = parseInt(document.getElementById('inv-qty').value, 10) || 1;
    const desc = document.getElementById('inv-desc').value;
    const weight = document.getElementById('inv-weight').value;
    const cost = document.getElementById('inv-cost').value;
    const used = document.getElementById('inv-used').checked;
    if (!name) return;
    combatants[idx].inventory.push({ name, type, qty, desc, weight, cost, used });
    logEvent(`${combatants[idx].name}: добавлен предмет "${name}" (${type})`);
    renderCombatants();
    closeWithFadeOut(modal);
  };
}

function editInventoryItem(idx, itemIdx) {
  saveState();
  migrateInventoryFormat();
  const item = combatants[idx].inventory[itemIdx];
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10001;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-inv-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Редактировать предмет</h2>
      <form id="inv-form">
        <label>Название:<br><input id="inv-name" type="text" required value="${item.name}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Категория:<br>
          <select id="inv-type" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;">
            <option value="оружие" ${item.type==='оружие'?'selected':''}>Оружие</option>
            <option value="броня" ${item.type==='броня'?'selected':''}>Броня</option>
            <option value="зелье" ${item.type==='зелье'?'selected':''}>Зелье</option>
            <option value="артефакт" ${item.type==='артефакт'?'selected':''}>Артефакт</option>
            <option value="прочее" ${item.type==='прочее'?'selected':''}>Прочее</option>
          </select>
        </label><br>
        <label>Количество:<br><input id="inv-qty" type="number" min="1" value="${item.qty}" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Описание:<br><input id="inv-desc" type="text" value="${item.desc}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Вес:<br><input id="inv-weight" type="text" value="${item.weight}" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Стоимость:<br><input id="inv-cost" type="text" value="${item.cost}" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label><input id="inv-used" type="checkbox" ${item.used?'checked':''}> Использован (одноразовый)</label><br>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Сохранить</button>
          <button type="button" id="cancel-inv" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-inv-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-inv').onclick = () => closeWithFadeOut(modal);
  document.getElementById('inv-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('inv-name').value.trim();
    const type = document.getElementById('inv-type').value;
    const qty = parseInt(document.getElementById('inv-qty').value, 10) || 1;
    const desc = document.getElementById('inv-desc').value;
    const weight = document.getElementById('inv-weight').value;
    const cost = document.getElementById('inv-cost').value;
    const used = document.getElementById('inv-used').checked;
    if (!name) return;
    combatants[idx].inventory[itemIdx] = { name, type, qty, desc, weight, cost, used };
    logEvent(`${combatants[idx].name}: изменён предмет "${name}" (${type})`);
    renderCombatants();
    closeWithFadeOut(modal);
  };
}

function addCombatant(e) {
  e.preventDefault();
  saveState();
  const name = document.getElementById('name-input').value.trim();
  const type = document.getElementById('type-input').value;
  const initiative = parseInt(document.getElementById('initiative-input').value, 10);
  const hp = parseInt(document.getElementById('hp-input').value, 10);
  const ac = parseInt(document.getElementById('ac-input').value, 10) || 10;
  // Если выбран тип monster (или Монстр (справочник)), открываем окно выбора монстра
  if (type === 'monster') {
    openMonsterSearchModal();
    return;
  }
  if (!name || isNaN(initiative) || isNaN(hp)) return;
  combatants.push({
    name,
    type,
    initiative,
    hp,
    ac,
    inspiration: false,
    tempHp: 0,
    spellSlots: [0,0,0,0,0,0,0,0,0], // 9 уровней
    inventory: [],
  });
  renderCombatants();
  e.target.reset();
}

function deleteCombatant(idx) {
  saveState();
  combatants.splice(idx, 1);
  renderCombatants();
}

function nextTurn() {
  saveState();
  if (combatants.length === 0) return;
  currentIdx++;
  if (currentIdx >= combatants.length) {
    currentIdx = 0;
    round++;
  }
  renderCombatants();
}

function resetCombat() {
  currentIdx = 0;
  round = 1;
  renderCombatants();
}

function removeInventoryItem(idx, itemIdx) {
  saveState();
  migrateInventoryFormat();
  const item = combatants[idx].inventory[itemIdx];
  combatants[idx].inventory.splice(itemIdx, 1);
  logEvent(`${combatants[idx].name}: удалён предмет "${item.name||item}"`);
  renderCombatants();
}

function saveCombat() {
  const data = {
    combatants,
    currentIdx,
    round
  };
  const json = JSON.stringify(data, null, 2);
  if (electronAPI.saveDialog) {
    electronAPI.saveDialog({
      title: 'Сохранить бой',
      defaultPath: 'combat.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    }).then(result => {
      if (!result.canceled && result.filePath) {
        electronAPI.writeFile(result.filePath, json);
      }
    });
  } else {
    alert('Сохранение доступно только в десктопном приложении Electron.');
  }
}

function loadCombat() {
  if (electronAPI.openDialog) {
    electronAPI.openDialog({
      title: 'Загрузить бой',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    }).then(result => {
      if (!result.canceled && result.filePaths && result.filePaths[0]) {
        electronAPI.readFile(result.filePaths[0]).then(json => {
          try {
            const data = JSON.parse(json);
            if (Array.isArray(data.combatants)) {
              combatants = data.combatants;
              currentIdx = data.currentIdx || 0;
              round = data.round || 1;
              renderCombatants();
            } else {
              alert('Файл повреждён или не содержит данные боя.');
            }
          } catch {
            alert('Ошибка чтения файла.');
          }
        });
      }
    });
  } else {
    alert('Загрузка доступна только в десктопном приложении Electron.');
  }
}

function setSpellSlotMax(idx, level) {
  saveState();
  const max = prompt(`Максимум слотов для ${level+1} уровня:`, combatants[idx].spellSlotsMax?.[level] || 0);
  if (max !== null) {
    combatants[idx].spellSlotsMax = combatants[idx].spellSlotsMax || Array(9).fill(0);
    combatants[idx].spellSlotsMax[level] = Math.max(0, parseInt(max, 10) || 0);
    // Если текущих больше максимума — обрезаем
    if (combatants[idx].spellSlots[level] > combatants[idx].spellSlotsMax[level]) {
      combatants[idx].spellSlots[level] = combatants[idx].spellSlotsMax[level];
    }
    logEvent(`${combatants[idx].name}: максимум слотов ${level+1} ур. = ${combatants[idx].spellSlotsMax[level]}`);
    renderCombatants();
  }
}
function resetSpellSlots(idx) {
  saveState();
  if (!confirm('Сбросить все использованные слоты?')) return;
  combatants[idx].spellSlots = (combatants[idx].spellSlotsMax || Array(9).fill(0)).slice();
  logEvent(`${combatants[idx].name}: все слоты заклинаний восстановлены`);
  renderCombatants();
}

// Заметка к бою
let combatNote = '';
function setCombatNote() {
  saveState();
  const note = prompt('Введите заметку к бою:', combatNote);
  if (note !== null) {
    combatNote = note;
    document.getElementById('combat-note').innerText = combatNote ? '📝 ' + combatNote : '';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function applySavedTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') document.body.classList.add('dark-theme');
}

let eventLog = [];
let logFilter = 'all';
let logSearch = '';

function logEvent(text) {
  const time = new Date().toLocaleTimeString();
  eventLog.unshift(`[${time}] ${text}`);
  renderLog();
}

function setLogFilter(val) {
  logFilter = val;
  renderLog();
}
function setLogSearch(val) {
  logSearch = val.toLowerCase();
  renderLog();
}
function clearLog() {
  if (confirm('Очистить лог событий?')) {
    eventLog = [];
    renderLog();
  }
}
function exportLog() {
  const text = eventLog.join('\n');
  const blob = new Blob([text], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'combat_log.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function renderLog() {
  const logBox = document.getElementById('log');
  if (!logBox) return;
  let filtered = eventLog.slice();
  if (logFilter !== 'all') {
    filtered = filtered.filter(e => e.toLowerCase().includes(logFilter));
  }
  if (logSearch) {
    filtered = filtered.filter(e => e.toLowerCase().includes(logSearch));
  }
  logBox.innerHTML = filtered.slice(0, 30).map(e => `<div class='fade-in' style='${e.includes('массов')||e.includes('удал')?'color:#c00;font-weight:600;':''}'>${e}</div>`).join('') || '<span style="color:#aaa;">Нет событий</span>';
}

function skipTurn() {
  saveState();
  if (combatants.length === 0) return;
  logEvent(`Ход пропущен: ${combatants[currentIdx]?.name || ''}`);
  nextTurn();
}

function delayTurn() {
  saveState();
  if (combatants.length === 0) return;
  const c = combatants.splice(currentIdx, 1)[0];
  combatants.push(c);
  logEvent(`Задержка хода: ${c.name}`);
  if (currentIdx >= combatants.length) currentIdx = 0;
  renderCombatants();
}

function prevTurn() {
  saveState();
  if (combatants.length === 0) return;
  currentIdx--;
  if (currentIdx < 0) {
    currentIdx = combatants.length - 1;
    round = Math.max(1, round - 1);
  }
  logEvent(`Возврат к предыдущему: ${combatants[currentIdx]?.name || ''}`);
  renderCombatants();
}

// Уменьшаем длительность эффектов при переходе раунда
const origNextTurn = nextTurn;
nextTurn = function() {
  const prevIdx = currentIdx;
  origNextTurn();
  // Если начался новый раунд
  if (currentIdx === 0) {
    combatants.forEach(c => {
      if (Array.isArray(c.effects)) {
        c.effects.forEach(e => {
          if (e.duration && e.duration > 0) e.duration--;
        });
        // Удаляем эффекты с duration === 0
        c.effects = c.effects.filter(e => !e.duration || e.duration > 0);
      }
    });
    logEvent('Начался новый раунд: эффекты обновлены');
    renderCombatants();
  }
};

let turnTimer = null;
let timerSeconds = 0;
let timerRunning = false;
const DEFAULT_TURN_TIME = 60; // секунд на ход по умолчанию

function renderTimer() {
  const timerBox = document.getElementById('turn-timer');
  if (!timerBox) return;
  const min = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const sec = String(timerSeconds % 60).padStart(2, '0');
  timerBox.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
      <span style="font-size:1.5em;font-variant-numeric:tabular-nums;letter-spacing:1px;">⏱️ ${min}:${sec}</span>
      <button id="timer-start" style="padding:6px 14px;">▶️<span class='tooltip'>Старт</span></button>
      <button id="timer-pause" style="padding:6px 14px;">⏸️<span class='tooltip'>Пауза</span></button>
      <button id="timer-reset" style="padding:6px 14px;">🔄<span class='tooltip'>Сброс</span></button>
      <input id="timer-set" type="number" min="10" max="600" value="${timerSeconds}" style="width:60px;margin-left:10px;" title="Время на ход, сек.">
    </div>
  `;
  document.getElementById('timer-start').onclick = startTimer;
  document.getElementById('timer-pause').onclick = pauseTimer;
  document.getElementById('timer-reset').onclick = resetTimer;
  document.getElementById('timer-set').onchange = (e) => {
    timerSeconds = Math.max(10, Math.min(600, parseInt(e.target.value, 10) || DEFAULT_TURN_TIME));
    renderTimer();
  };
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  if (!timerSeconds) timerSeconds = DEFAULT_TURN_TIME;
  logEvent(`Таймер хода запущен (${timerSeconds} сек.)`);
  turnTimer = setInterval(() => {
    timerSeconds--;
    renderTimer();
    if (timerSeconds <= 0) {
      logEvent('Время хода истекло! Переход к следующему.');
      pauseTimer();
      nextTurn();
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (turnTimer) clearInterval(turnTimer);
  timerRunning = false;
  logEvent('Таймер хода на паузе');
}

function resetTimer() {
  pauseTimer();
  timerSeconds = DEFAULT_TURN_TIME;
  renderTimer();
  logEvent('Таймер хода сброшен');
}

// Сброс таймера при смене активного участника
const origRenderCombatants = renderCombatants;
renderCombatants = function() {
  origRenderCombatants();
  renderTimer();
};
const origNextTurnTimer = nextTurn;
nextTurn = function() {
  origNextTurnTimer();
  resetTimer();
};

function showDamageModal(idx) {
  const c = combatants[idx];
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:1000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-dmg-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">${c.name}: урон / исцеление</h2>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
        <input id="dmg-value" type="number" min="1" max="999" value="1" style="width:80px;font-size:1.2em;">
        <button id="roll-dmg-dice" class="icon-btn tooltip" data-tooltip="Бросить кубы" style="padding:7px 10px;">
          <svg class='icon dice-svg' viewBox='0 0 32 32' width='22' height='22'><polygon points='16,4 30,12 26,28 6,28 2,12' fill='none' stroke='#007aff' stroke-width='2'/></svg>
        </button>
        <span style="margin-left:10px;color:#888;font-size:0.98em;">Быстрый бросок:</span>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d4" data-sides="4">${diceIcon(4)}</button>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d6" data-sides="6">${diceIcon(6)}</button>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d8" data-sides="8">${diceIcon(8)}</button>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d10" data-sides="10">${diceIcon(10)}</button>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d12" data-sides="12">${diceIcon(12)}</button>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d20" data-sides="20">${diceIcon(20)}</button>
        <button class="icon-btn dmg-dice-btn tooltip" data-tooltip="d100" data-sides="100">${diceIcon(100)}</button>
      </div>
      <div style="margin-bottom:18px;">
        <button id="dmg-btn" style="margin-right:12px;padding:8px 18px;">Нанести урон</button>
        <button id="heal-btn" style="padding:8px 18px;">Исцелить</button>
      </div>
      <div style="font-size:0.98em;color:#888;">Текущие хиты: <b>${c.hp}</b></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-dmg-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('dmg-btn').onclick = () => {
    saveState();
    const val = Math.max(1, parseInt(document.getElementById('dmg-value').value, 10) || 1);
    c.hp = Math.max(0, c.hp - val);
    logEvent(`${c.name}: получил урон ${val} (теперь ${c.hp})`);
    renderCombatants();
    closeWithFadeOut(modal);
  };
  document.getElementById('heal-btn').onclick = () => {
    saveState();
    const val = Math.max(1, parseInt(document.getElementById('dmg-value').value, 10) || 1);
    c.hp += val;
    logEvent(`${c.name}: исцелён на ${val} (теперь ${c.hp})`);
    renderCombatants();
    closeWithFadeOut(modal);
  };
  document.getElementById('roll-dmg-dice').onclick = (e) => {
    if (e.shiftKey) {
      showDiceRollModal(6, c.name); // d6 по умолчанию, можно изменить
    } else {
      showInlineDiceRoller(function(result) {
        document.getElementById('dmg-value').value = result;
      });
    }
  };
  // Быстрые кнопки кубов
  modal.querySelectorAll('.dmg-dice-btn').forEach(btn => {
    btn.onclick = (e) => {
      const sides = parseInt(btn.getAttribute('data-sides'), 10);
      if (e.shiftKey) {
        showDiceRollModal(sides, c.name);
      } else {
        const { total } = rollDice(sides, 1, 0, c.name);
        document.getElementById('dmg-value').value = total;
      }
    };
  });
}

// Мини-модалка для выбора куба и модификатора, результат возвращается в callback
function showInlineDiceRoller(callback) {
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10001;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:24px 22px 18px 22px;border-radius:16px;box-shadow:0 8px 32px #0002;min-width:220px;max-width:90vw;position:relative;animation:fadeIn 0.5s;">
      <button id="close-inline-dice" style="position:absolute;top:8px;right:12px;font-size:1.2em;background:none;border:none;cursor:pointer;">×</button>
      <h3 style="margin-top:0;margin-bottom:12px;font-size:1.08em;">Бросить кубы</h3>
      <form id="inline-dice-form">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <input id="inline-dice-count" type="number" min="1" max="20" value="1" style="width:38px;">
          <span>d</span>
          <select id="inline-dice-sides" style="width:54px;">
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="20" selected>20</option>
            <option value="100">100</option>
          </select>
          <span>+</span>
          <input id="inline-dice-mod" type="number" min="-100" max="100" value="0" style="width:38px;">
        </div>
        <div style="margin-top:10px;display:flex;gap:10px;">
          <button type="submit" class="accent-btn" style="padding:6px 18px;">Бросить</button>
          <button type="button" id="cancel-inline-dice" style="padding:6px 18px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-inline-dice').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-inline-dice').onclick = () => closeWithFadeOut(modal);
  document.getElementById('inline-dice-form').onsubmit = (e) => {
    e.preventDefault();
    const count = parseInt(document.getElementById('inline-dice-count').value, 10) || 1;
    const sides = parseInt(document.getElementById('inline-dice-sides').value, 10) || 6;
    const mod = parseInt(document.getElementById('inline-dice-mod').value, 10) || 0;
    const { total } = rollDice(sides, count, mod);
    callback(total);
    closeWithFadeOut(modal);
  };
}

function showAttackModal(attackerIdx) {
  const attacker = combatants[attackerIdx];
  // Определяем модификатор атаки
  let attackMod = 0;
  if (typeof attacker.attackMod === 'number') {
    attackMod = attacker.attackMod;
  } else if (attacker.note) {
    const m = attacker.note.match(/(?:атака|attack)\s*[:=]\s*([+-]?\d+)/i);
    if (m) attackMod = parseInt(m[1], 10) || 0;
  }
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:1000;display:flex;align-items:center;justify-content:center;';
  // Список целей (кроме атакующего)
  const targets = combatants.map((c, i) => ({name: c.name, idx: i})).filter(t => t.idx !== attackerIdx);
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-attack-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">${attacker.name} атакует</h2>
      <label style='font-size:0.97em;'>Цель:
        <select id='attack-target' style='margin-left:8px;padding:4px 10px;font-size:1em;'>
          ${targets.map(t => `<option value='${t.idx}'>${t.name}</option>`).join('')}
        </select>
      </label>
      <br><br>
      <label style='font-size:0.97em;display:flex;align-items:center;gap:8px;'>Бросок атаки (d20 + мод):
        <input id='attack-roll' type='number' style='width:60px;' value='${Math.floor(Math.random()*20)+1+attackMod}'>
        <span style='color:#888;font-size:0.98em;'>+</span>
        <input id='attack-mod' type='number' style='width:44px;' value='${attackMod}' title='Модификатор атаки'>
        <button id='roll-attack-dice' class='icon-btn tooltip' data-tooltip='Бросить d20 (Shift — модификатор)' style='padding:7px 10px;'>
          <svg class='icon dice-svg' viewBox='0 0 32 32' width='22' height='22'><polygon points='16,4 30,12 26,28 6,28 2,12' fill='none' stroke='#007aff' stroke-width='2'/></svg>
        </button>
      </label>
      <br><br>
      <label style='font-size:0.97em;'>Урон: <input id='attack-dmg' type='number' style='width:60px;' value='1'></label>
      <br><br>
      <button id='attack-confirm' style='padding:8px 18px;'>Атаковать</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-attack-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('attack-confirm').onclick = () => {
    const targetIdx = parseInt(document.getElementById('attack-target').value, 10);
    const roll = parseInt(document.getElementById('attack-roll').value, 10);
    const dmg = parseInt(document.getElementById('attack-dmg').value, 10);
    const target = combatants[targetIdx];
    const ac = target.ac || 10;
    let result = '';
    if (roll >= ac) {
      target.hp = Math.max(0, target.hp - dmg);
      result = `Попадание! ${target.name} получает ${dmg} урона (КД ${ac}, теперь ${target.hp})`;
    } else {
      result = `Промах! (КД ${ac})`;
    }
    logEvent(`${attacker.name} атакует ${target.name}: бросок ${roll} vs КД ${ac}. ${result}`);
    renderCombatants();
    closeWithFadeOut(modal);
  };
  document.getElementById('roll-attack-dice').onclick = (e) => {
    const mod = parseInt(document.getElementById('attack-mod').value, 10) || 0;
    if (e.shiftKey) {
      showInlineDiceRoller(function(result) {
        document.getElementById('attack-roll').value = result + mod;
      });
    } else {
      const { total } = rollDice(20, 1, 0, attacker.name);
      document.getElementById('attack-roll').value = total + mod;
    }
  };
}

function rollInitiativeForAll() {
  getSortedCombatants().forEach(c => {
    // Модификатор инициативы: ищем в заметке вида "инициатива:+2" или "init:+2"
    let mod = 0;
    if (c.note) {
      const m = c.note.match(/(?:инициатива|init)\s*[:=]\s*([+-]?\d+)/i);
      if (m) mod = parseInt(m[1], 10) || 0;
    }
    const roll = Math.floor(Math.random() * 20) + 1;
    c.initiative = roll + mod;
    logEvent(`${c.name}: бросок инициативы d20 = ${roll}${mod ? (mod > 0 ? ' + ' : ' - ') + Math.abs(mod) : ''} → <b>${c.initiative}</b>`);
  });
  renderCombatants();
}

function editHP(idx) {
  const old = combatants[idx].hp;
  const val = prompt('Изменить хиты:', old);
  if (val !== null && !isNaN(parseInt(val, 10))) {
    combatants[idx].hp = parseInt(val, 10);
    logEvent(`${combatants[idx].name}: хиты изменены на ${combatants[idx].hp}`);
    renderCombatants();
  }
}

// === КАСТОМНОЕ КОНТЕКСТНОЕ МЕНЮ ДЛЯ РЕДАКТИРОВАНИЯ ===
let contextMenuDiv = null;
function showContextMenu(x, y, onEdit) {
  hideContextMenu();
  contextMenuDiv = document.createElement('div');
  contextMenuDiv.style = `position:fixed;z-index:9999;left:${x}px;top:${y}px;background:#fff;border-radius:8px;box-shadow:0 4px 24px #0002;padding:0;min-width:120px;animation:fadeIn 0.2s;`;
  contextMenuDiv.innerHTML = `<div style='padding:10px 18px;cursor:pointer;font-size:1em;' onmouseover="this.style.background='#f7f7fa'" onmouseout="this.style.background='none'" id='ctx-edit'>Изменить</div>`;
  document.body.appendChild(contextMenuDiv);
  document.getElementById('ctx-edit').onclick = () => {
    hideContextMenu();
    onEdit();
  };
  document.addEventListener('mousedown', hideContextMenu, { once: true });
}
function hideContextMenu() {
  if (contextMenuDiv) {
    contextMenuDiv.remove();
    contextMenuDiv = null;
  }
}
// === Экспортируем showContextMenu в window ===
window.showContextMenu = showContextMenu;

// === УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ ===
function showEditModal(idx, field) {
  hideContextMenu();
  const c = combatants[idx];
  let label = '', value = '', inputType = 'text', isCheckbox = false;
  switch(field) {
    case 'name': label = 'Имя'; value = c.name; break;
    case 'type': label = 'Тип (pc, npc, monster)'; value = c.type; break;
    case 'initiative': label = 'Инициатива'; value = c.initiative; inputType = 'number'; break;
    case 'ac': label = 'КД (AC)'; value = c.ac || 10; inputType = 'number'; break;
    case 'hp': label = 'Хиты'; value = c.hp; inputType = 'number'; break;
    case 'tempHp': label = 'Временные хиты'; value = c.tempHp || 0; inputType = 'number'; break;
    case 'inspiration': label = 'Вдохновение'; value = c.inspiration; isCheckbox = true; break;
    case 'note': label = 'Заметка'; value = c.note || ''; break;
    default: return;
  }
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-edit-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">${c.name}: изменить ${label.toLowerCase()}</h2>
      <form id="edit-form">
        ${isCheckbox ? `<label style='font-size:1.05em;'><input type='checkbox' id='edit-value' ${value ? 'checked' : ''}> Вдохновение</label>` : `<input id='edit-value' type='${inputType}' value='${value}' style='width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:12px;'>`}
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Сохранить</button>
          <button type="button" id="cancel-edit" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-edit-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-edit').onclick = () => closeWithFadeOut(modal);
  document.getElementById('edit-form').onsubmit = (e) => {
    e.preventDefault();
    let newValue;
    if (isCheckbox) {
      newValue = document.getElementById('edit-value').checked;
    } else {
      newValue = document.getElementById('edit-value').value;
      if (inputType === 'number') newValue = parseInt(newValue, 10);
    }
    let changed = false;
    switch(field) {
      case 'name': if (typeof newValue === 'string' && newValue.trim() && newValue !== c.name) { c.name = newValue.trim(); changed = true; logEvent(`${c.name}: имя изменено`); } break;
      case 'type': if (['pc','npc','monster'].includes(newValue) && newValue !== c.type) { c.type = newValue; changed = true; logEvent(`${c.name}: тип изменён на ${newValue}`); } break;
      case 'initiative': if (!isNaN(newValue) && newValue !== c.initiative) { c.initiative = newValue; changed = true; logEvent(`${c.name}: инициатива изменена на ${newValue}`); } break;
      case 'ac': if (!isNaN(newValue) && newValue !== c.ac) { c.ac = newValue; changed = true; logEvent(`${c.name}: КД изменено на ${newValue}`); } break;
      case 'hp': if (!isNaN(newValue) && newValue !== c.hp) { c.hp = newValue; changed = true; logEvent(`${c.name}: хиты изменены на ${newValue}`); } break;
      case 'tempHp': if (!isNaN(newValue) && newValue !== c.tempHp) { c.tempHp = Math.max(0, newValue); changed = true; logEvent(`${c.name}: временные хиты изменены на ${newValue}`); } break;
      case 'inspiration': if (newValue !== c.inspiration) { c.inspiration = newValue; changed = true; logEvent(`${c.name}: вдохновение ${newValue ? 'включено' : 'выключено'}`); } break;
      case 'note': if (typeof newValue === 'string' && newValue !== c.note) { c.note = newValue; changed = true; logEvent(`${c.name}: заметка изменена`); } break;
    }
    if (changed) renderCombatants();
    closeWithFadeOut(modal);
  };
}
window.showEditModal = showEditModal;

// === МОДАЛЬНОЕ ОКНО ПОЛНОГО РЕДАКТИРОВАНИЯ ===
function showFullEditModal(idx) {
  hideContextMenu();
  const c = combatants[idx];
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-full-edit-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Редактировать: ${c.name}</h2>
      <form id="full-edit-form">
        <label>Имя:<br><input id="full-edit-name" type="text" value="${c.name}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Тип:<br>
          <select id="full-edit-type" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;">
            <option value="pc" ${c.type==='pc'?'selected':''}>Персонаж</option>
            <option value="npc" ${c.type==='npc'?'selected':''}>NPC</option>
            <option value="monster" ${c.type==='monster'?'selected':''}>Монстр</option>
          </select>
        </label><br>
        <label>Инициатива:<br><input id="full-edit-initiative" type="number" value="${c.initiative}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>КД (AC):<br><input id="full-edit-ac" type="number" value="${c.ac||10}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Хиты:<br><input id="full-edit-hp" type="number" value="${c.hp}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Временные хиты:<br><input id="full-edit-tempHp" type="number" value="${c.tempHp||0}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input id="full-edit-inspiration" type="checkbox" ${c.inspiration?'checked':''}> Вдохновение
        </label>
        <label>Заметка:<br><input id="full-edit-note" type="text" value="${c.note||''}" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Сохранить</button>
          <button type="button" id="cancel-full-edit" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-full-edit-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-full-edit').onclick = () => closeWithFadeOut(modal);
  document.getElementById('full-edit-form').onsubmit = (e) => {
    e.preventDefault();
    let changed = false;
    const newName = document.getElementById('full-edit-name').value.trim();
    if (newName && newName !== c.name) { c.name = newName; changed = true; logEvent(`${c.name}: имя изменено`); }
    const newType = document.getElementById('full-edit-type').value;
    if (['pc','npc','monster'].includes(newType) && newType !== c.type) { c.type = newType; changed = true; logEvent(`${c.name}: тип изменён на ${newType}`); }
    const newInit = parseInt(document.getElementById('full-edit-initiative').value, 10);
    if (!isNaN(newInit) && newInit !== c.initiative) { c.initiative = newInit; changed = true; logEvent(`${c.name}: инициатива изменена на ${newInit}`); }
    const newAC = parseInt(document.getElementById('full-edit-ac').value, 10);
    if (!isNaN(newAC) && newAC !== c.ac) { c.ac = newAC; changed = true; logEvent(`${c.name}: КД изменено на ${newAC}`); }
    const newHP = parseInt(document.getElementById('full-edit-hp').value, 10);
    if (!isNaN(newHP) && newHP !== c.hp) { c.hp = newHP; changed = true; logEvent(`${c.name}: хиты изменены на ${newHP}`); }
    const newTempHp = parseInt(document.getElementById('full-edit-tempHp').value, 10);
    if (!isNaN(newTempHp) && newTempHp !== c.tempHp) { c.tempHp = Math.max(0, newTempHp); changed = true; logEvent(`${c.name}: временные хиты изменены на ${newTempHp}`); }
    const newInsp = document.getElementById('full-edit-inspiration').checked;
    if (newInsp !== c.inspiration) { c.inspiration = newInsp; changed = true; logEvent(`${c.name}: вдохновение ${newInsp ? 'включено' : 'выключено'}`); }
    const newNote = document.getElementById('full-edit-note').value;
    if (typeof newNote === 'string' && newNote !== c.note) { c.note = newNote; changed = true; logEvent(`${c.name}: заметка изменена`); }
    if (changed) renderCombatants();
    closeWithFadeOut(modal);
  };
}
window.showFullEditModal = showFullEditModal;

// === СПРАВОЧНИКИ ===
function openReferenceModal() {
  // Создаём модальное окно
  let modal = document.createElement('div');
  modal.id = 'reference-modal';
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10001;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:420px;max-width:96vw;max-height:90vh;overflow:auto;position:relative;animation:fadeIn 0.7s;">
      <button id="close-reference-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Справочники</h2>
      <div style="display:flex;gap:12px;margin-bottom:18px;">
        <button class="ref-tab-btn" data-tab="spells">Заклинания</button>
        <button class="ref-tab-btn" data-tab="items">Предметы</button>
        <button class="ref-tab-btn" data-tab="artifacts">Артефакты</button>
      </div>
      <div id="ref-tab-content"></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-reference-modal').onclick = () => closeWithFadeOut(modal);

  // Вкладки только: заклинания, предметы, артефакты
  function renderTab(tab) {
    let html = '';
    if (tab === 'spells') {
      html += `<input id='ref-spell-search' type='text' placeholder='Поиск заклинания...' style='width:220px;margin-bottom:10px;'>`;
      html += `<div id='ref-spell-list' style='max-height:50vh;overflow:auto;'></div>`;
    } else if (tab === 'items') {
      html += `<input id='ref-item-search' type='text' placeholder='Поиск предмета...' style='width:220px;margin-bottom:10px;'>`;
      html += `<div id='ref-item-list' style='max-height:50vh;overflow:auto;'></div>`;
    } else if (tab === 'artifacts') {
      html += `<input id='ref-artifact-search' type='text' placeholder='Поиск артефакта...' style='width:220px;margin-bottom:10px;'>`;
      html += `<div id='ref-artifact-list' style='max-height:50vh;overflow:auto;'></div>`;
    }
    document.getElementById('ref-tab-content').innerHTML = html;
    if (tab === 'spells') renderSpellList();
    if (tab === 'items') renderItemList();
    if (tab === 'artifacts') renderArtifactList();
  }
  // Только нужные вкладки
  document.querySelectorAll('.ref-tab-btn').forEach(btn => {
    btn.onclick = () => renderTab(btn.dataset.tab);
  });
  renderTab('spells');
}

// Поиск и рендеринг заклинаний
function renderSpellList() {
  const listDiv = document.getElementById('ref-spell-list');
  let search = '';
  document.getElementById('ref-spell-search').oninput = function() {
    search = this.value.toLowerCase();
    update();
  };
  function update() {
    let arr = (window.allSpells||[]).filter(s => (s.ru?.name||'').toLowerCase().includes(search) || (s.en?.name||'').toLowerCase().includes(search));
    listDiv.innerHTML = arr.map(s => `<div class='ref-list-item' style='padding:6px 0;cursor:pointer;border-bottom:1px solid #eee;' data-name="${s.ru?.name||s.en?.name}">${s.ru?.name||s.en?.name}</div>`).join('') || '<span style="color:#aaa;">Нет заклинаний</span>';
    listDiv.querySelectorAll('.ref-list-item').forEach(el => {
      el.onclick = () => showSpellDetails(arr.find(s => (s.ru?.name||s.en?.name) === el.dataset.name));
    });
  }
  update();
}
function showSpellDetails(s) {
  let html = `<h3>${s.ru?.name||s.en?.name}</h3>`;
  html += `<div><b>Уровень:</b> ${s.ru?.level||s.en?.level} <b>Школа:</b> ${s.ru?.school||s.en?.school}</div>`;
  html += `<div><b>Время:</b> ${s.ru?.castingTime||s.en?.castingTime} <b>Дистанция:</b> ${s.ru?.range||s.en?.range}</div>`;
  html += `<div><b>Длительность:</b> ${s.ru?.duration||s.en?.duration}</div>`;
  html += `<div><b>Компоненты:</b> ${s.ru?.components||s.en?.components}</div>`;
  html += `<div><b>Источник:</b> ${s.ru?.source||s.en?.source}</div>`;
  html += `<div style='margin-top:8px;'>${s.ru?.text||s.en?.text}</div>`;
  document.getElementById('ref-tab-content').innerHTML = `<button onclick='openReferenceModal()' style='margin-bottom:10px;'>&larr; Назад</button>`+html;
}

// Поиск и рендеринг предметов
function renderItemList() {
  const listDiv = document.getElementById('ref-item-list');
  let search = '';
  document.getElementById('ref-item-search').oninput = function() {
    search = this.value.toLowerCase();
    update();
  };
  function update() {
    let arr = (window.allItems||[]).filter(i => (i.ru?.name||'').toLowerCase().includes(search) || (i.en?.name||'').toLowerCase().includes(search));
    listDiv.innerHTML = arr.map(i => `<div class='ref-list-item' style='padding:6px 0;cursor:pointer;border-bottom:1px solid #eee;' data-name="${i.ru?.name||i.en?.name}">${i.ru?.name||i.en?.name}</div>`).join('') || '<span style="color:#aaa;">Нет предметов</span>';
    listDiv.querySelectorAll('.ref-list-item').forEach(el => {
      el.onclick = () => showItemDetails(arr.find(i => (i.ru?.name||i.en?.name) === el.dataset.name));
    });
  }
  update();
}
function showItemDetails(i) {
  let html = `<h3>${i.ru?.name||i.en?.name}</h3>`;
  html += `<div><b>Тип:</b> ${i.en?.type||''} ${i.en?.typeAdditions||''}</div>`;
  html += `<div><b>Редкость:</b> ${i.en?.rarity||''} <b>Источник:</b> ${i.en?.source||''}</div>`;
  html += `<div><b>Цена:</b> ${i.en?.coast||''} <b>Вес:</b> ${i.en?.weight||''}</div>`;
  if (i.en?.img) html += `<img src='${i.en.img}' style='max-width:120px;float:right;margin-left:16px;'>`;
  html += `<div style='margin-top:8px;'>${i.ru?.text||i.en?.text||''}</div>`;
  html += `<div style='margin-top:18px;'><button id='add-item-to-inventory' style='padding:8px 18px;font-size:1em;'>Добавить в инвентарь</button></div>`;
  document.getElementById('ref-tab-content').innerHTML = `<button onclick='openReferenceModal()' style='margin-bottom:10px;'>&larr; Назад</button>`+html;
  document.getElementById('add-item-to-inventory').onclick = function() {
    // Открываем выбор участника
    if (!combatants.length) { alert('Нет участников боя!'); return; }
    let selectHtml = `<div style='margin-top:12px;'><b>Кому добавить:</b><br><select id='choose-combatant' style='font-size:1.1em;margin-top:6px;'>`;
    combatants.forEach((c, idx) => {
      selectHtml += `<option value='${idx}'>${c.name}</option>`;
    });
    selectHtml += `</select><button id='confirm-add-item' style='margin-left:12px;padding:6px 16px;'>Добавить</button></div>`;
    document.getElementById('ref-tab-content').innerHTML += selectHtml;
    document.getElementById('confirm-add-item').onclick = function() {
      const idx = parseInt(document.getElementById('choose-combatant').value, 10);
      if (!combatants[idx].inventory) combatants[idx].inventory = [];
      const itemName = i.ru?.name||i.en?.name;
      combatants[idx].inventory.push(itemName);
      combatants[idx].inventory.sort((a, b) => a.localeCompare(b, 'ru'));
      logEvent(`${combatants[idx].name}: добавлен предмет из справочника "${itemName}"`);
      renderCombatants();
      closeWithFadeOut(modal);
    };
  };
}

// Поиск и рендеринг артефактов (фильтруем из allItems по редкости или ключу)
function renderArtifactList() {
  const listDiv = document.getElementById('ref-artifact-list');
  let search = '';
  document.getElementById('ref-artifact-search').oninput = function() {
    search = this.value.toLowerCase();
    update();
  };
  function update() {
    let arr = (window.allItems||[]).filter(i => (i.en?.rarity||0) >= 4 && ((i.ru?.name||'').toLowerCase().includes(search) || (i.en?.name||'').toLowerCase().includes(search)));
    listDiv.innerHTML = arr.map(i => `<div class='ref-list-item' style='padding:6px 0;cursor:pointer;border-bottom:1px solid #eee;' data-name="${i.ru?.name||i.en?.name}">${i.ru?.name||i.en?.name}</div>`).join('') || '<span style="color:#aaa;">Нет артефактов</span>';
    listDiv.querySelectorAll('.ref-list-item').forEach(el => {
      el.onclick = () => showItemDetails(arr.find(i => (i.ru?.name||i.en?.name) === el.dataset.name));
    });
  }
  update();
}

document.getElementById('app').innerHTML = `
  <div style="display:flex;align-items:center;gap:18px;margin-bottom:10px;flex-wrap:wrap;">
    <button onclick="rollInitiativeForAll()" style="font-size:0.97em;">Пробросить инициативу</button>
    <input type="text" placeholder="Поиск по имени..." style="padding:6px 14px;font-size:0.97em;min-width:160px;" oninput="setSearchQuery(this.value)" value="${searchQuery}">
    <select style="padding:6px 14px;font-size:0.97em;" onchange="setFilterType(this.value)">
      <option value="all" ${filterType==='all'?'selected':''}>Все типы</option>
      <option value="pc" ${filterType==='pc'?'selected':''}>Персонажи</option>
      <option value="npc" ${filterType==='npc'?'selected':''}>NPC</option>
      <option value="monster" ${filterType==='monster'?'selected':''}>Монстры</option>
    </select>
    <button onclick="setSort('initiative')" style="font-size:0.97em;">Инициатива</button>
    <button onclick="setSort('name')" style="font-size:0.97em;">Имя</button>
    <button onclick="setSort('hp')" style="font-size:0.97em;">Хиты</button>
    <button onclick="setSort('type')" style="font-size:0.97em;">Тип</button>
    <button onclick="toggleGroupByType()" style="font-size:0.97em;">${groupByType ? 'Снять группировку' : 'Группировать по типу'}</button>
  </div>
  ${selectedCombatants.size > 0 ? `
    <div style='display:flex;align-items:center;gap:12px;margin-bottom:10px;background:#f8f9fa;padding:12px;border-radius:8px;border:1px solid #e9ecef;'>
      <span style='font-weight:600;color:#495057;margin-right:8px;'>Выбрано: ${selectedCombatants.size}</span>
      <button onclick='massDamageHeal("damage")' class='mass-btn damage-btn tooltip' data-tooltip='Массовый урон (Ctrl+D)'>💥 Урон</button>
      <button onclick='massDamageHeal("heal")' class='mass-btn heal-btn tooltip' data-tooltip='Массовое исцеление (Ctrl+H)'>💚 Исцеление</button>
      <button onclick='massEffect()' class='mass-btn effect-btn tooltip' data-tooltip='Массовый эффект (Ctrl+E)'>✨ Эффект</button>
      <button onclick='massInspiration()' class='mass-btn insp-btn tooltip' data-tooltip='Массовое вдохновение (Ctrl+I)'>⭐ Вдохновение</button>
      <button onclick='massAC()' class='mass-btn ac-btn tooltip' data-tooltip='Массовое изменение КД'>🛡️ КД</button>
      <button onclick='massInitiative()' class='mass-btn init-btn tooltip' data-tooltip='Массовое изменение инициативы'>🎯 Инициатива</button>
      <button onclick='massTempHp()' class='mass-btn temphp-btn tooltip' data-tooltip='Массовое изменение временных хитов'>🛡️ Вр.Хиты</button>
      <button onclick='massSpellSlots()' class='mass-btn spell-btn tooltip' data-tooltip='Массовое изменение слотов заклинаний'>📚 Слоты</button>
      <button onclick='massInventory()' class='mass-btn inv-btn tooltip' data-tooltip='Массовое управление инвентарём'>🎒 Инвентарь</button>
      <button onclick='massDelete()' class='mass-btn delete-btn tooltip' data-tooltip='Массовое удаление (Ctrl+Del)' style='color:#c00;'>🗑️ Удалить</button>
      <button onclick='clearSelection()' class='mass-btn clear-btn tooltip' data-tooltip='Снять выделение'>❌ Снять</button>
    </div>
  ` : ''}
  <div id="combat-note" style="margin-bottom:10px;color:#ffb700;font-size:1.1em;min-height:1.2em;">${combatNote ? '📝 ' + combatNote : ''}</div>
  <form id="add-form" autocomplete="off" style="margin-bottom: 24px;">
    <input id="name" type="text" placeholder="Имя" required style="width: 140px; margin-right: 8px;">
    <select id="type" class="fade-in-select" style="margin-right: 8px;">
      <option value="pc">Персонаж</option>
      <option value="npc">Монстр</option>
      <option value="monster">Монстр (справочник)</option>
    </select>
    <input id="initiative" type="number" placeholder="Инициатива" required style="width: 110px; margin-right: 8px;">
    <input id="hp" type="number" placeholder="Хиты" required style="width: 90px; margin-right: 8px;">
    <input id="ac" type="number" placeholder="КД" style="width: 90px; margin-right: 8px;">
    <button type="submit">${window.editing ? 'Сохранить' : 'Добавить'}</button>
  </form>
  <div class="table-wrapper">
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#23272f;">
          <th class='col-num'><input type='checkbox' style='margin:0;' ${selectAllChecked?'checked':''} onclick='toggleSelectAll()'></th>
          <th class='col-name'>Имя</th>
          <th class='col-type'>Тип</th>
          <th class='col-init'>Инициатива</th>
          <th class='col-ac'>КД</th>
          <th class='col-hp'>Хиты</th>
          <th class='col-insp'>Вдох.</th>
          <th class='col-eff'>Эффекты</th>
          <th class='col-slots'>Слоты</th>
          <th class='col-inv'>Инвентарь</th>
          <th class='col-act'></th>
        </tr>
      </thead>
      <tbody id="combatants-list"></tbody>
    </table>
  </div>
  <div id="turn-timer" style="margin:24px auto 0 auto;max-width:420px;"></div>
  <div id="event-log" style="margin-top:32px;min-height:60px;background:rgba(0,0,0,0.03);border-radius:12px;padding:18px 18px 10px 18px;font-size:1.04em;box-shadow:0 1px 4px 0 rgba(0,0,0,0.03);color:#444;max-height:220px;overflow-y:auto;"></div>
  <div style='display:flex;align-items:center;gap:10px;margin:18px 0 6px 0;'>
    <input type='text' placeholder='Поиск по логу...' style='padding:5px 12px;font-size:0.97em;min-width:120px;' oninput='setLogSearch(this.value)' value='${logSearch}'>
    <select style='padding:5px 12px;font-size:0.97em;' onchange='setLogFilter(this.value)'>
      <option value='all' ${logFilter==='all'?'selected':''}>Все</option>
      <option value='урон' ${logFilter==='урон'?'selected':''}>Урон</option>
      <option value='исцел' ${logFilter==='исцел'?'selected':''}>Исцеление</option>
      <option value='эффект' ${logFilter==='эффект'?'selected':''}>Эффекты</option>
      <option value='массов' ${logFilter==='массов'?'selected':''}>Массовые</option>
      <option value='удал' ${logFilter==='удал'?'selected':''}>Удаление</option>
    </select>
    <button onclick='clearLog()'>Очистить лог</button>
    <button onclick='exportLog()'>Экспорт</button>
  </div>
`;

document.getElementById('add-form').addEventListener('submit', addCombatant);
document.getElementById('next-turn').addEventListener('click', nextTurn);
document.getElementById('reset-combat').addEventListener('click', resetCombat);
document.getElementById('save-combat').addEventListener('click', saveCombat);
document.getElementById('load-combat').addEventListener('click', loadCombat);
document.getElementById('combat-note-btn').addEventListener('click', setCombatNote);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('roll-initiative').addEventListener('click', rollInitiativeForAll);
renderCombatants();
renderTimer();
renderLog();

// Логируем основные действия:
const origAddCombatant = addCombatant;
addCombatant = function(e) {
  origAddCombatant(e);
  const name = document.getElementById('name-input').value.trim();
  if (name) logEvent(`Добавлен участник: ${name}`);
};
const origDeleteCombatant = deleteCombatant;
deleteCombatant = function(idx) {
  logEvent(`Удалён участник: ${combatants[idx]?.name || ''}`);
  origDeleteCombatant(idx);
};

// Анимация появления для таблицы и элементов
setTimeout(() => {
  document.querySelectorAll('table, #combat-note, #app form, #event-log').forEach(el => el.classList.add('fade-in'));
}, 50); 

// Добавляем кнопку "Справочники" в интерфейс (рядом с остальными кнопками)
setTimeout(() => {
  const btnsDiv = document.querySelector('body > div');
  if (btnsDiv && !document.getElementById('reference-btn')) {
    const refBtn = document.createElement('button');
    refBtn.id = 'reference-btn';
    refBtn.innerText = 'Справочники';
    refBtn.style.marginLeft = '8px';
    refBtn.onclick = openReferenceModal;
    btnsDiv.appendChild(refBtn);
  }
}, 500); 

// === МОДАЛЬНОЕ ОКНО ПОИСКА И ДОБАВЛЕНИЯ МОНСТРОВ ===
function openMonsterSearchModal() {
  let modal = document.createElement('div');
  modal.id = 'monster-search-modal';
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10001;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:700px;max-width:98vw;height:80vh;max-height:90vh;overflow:hidden;position:relative;animation:fadeIn 0.7s;display:flex;gap:32px;">
      <button id="close-monster-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <div style='min-width:260px;max-width:320px;display:flex;flex-direction:column;height:100%;'>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style='display:inline-flex;align-items:center;'><svg width='20' height='20' viewBox='0 0 20 20' style='margin-right:4px;opacity:0.7;'><circle cx='9' cy='9' r='7' stroke='#888' stroke-width='2' fill='none'/><line x1='15' y1='15' x2='19' y2='19' stroke='#888' stroke-width='2' stroke-linecap='round'/></svg></span>
          <input id='monster-search-input' type='text' placeholder='Поиск монстра...' style='width:180px;'>
        </div>
        <div id='monster-search-list' style='flex:1 1 0;min-height:0;overflow:auto;border-right:1px solid #eee;'></div>
      </div>
      <div id='monster-details' style='flex:1;min-width:280px;max-width:420px;'></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-monster-modal').onclick = () => closeWithFadeOut(modal);

  let search = '';
  let selected = null;
  let detailsOpen = false;
  document.getElementById('monster-search-input').oninput = function() {
    search = this.value.toLowerCase();
    updateList();
  };
  function updateList() {
    let arr = (window.allMonsters||[]).filter(m => m.name.toLowerCase().includes(search));
    const listDiv = document.getElementById('monster-search-list');
    listDiv.innerHTML = arr.map((m, idx) => `<div class='ref-list-item' style='padding:6px 0;cursor:pointer;border-bottom:1px solid #eee;${selected&&selected.name===m.name?'background:#f5f5fa;':''}' data-idx="${idx}"><span>${m.name}</span></div>`).join('') || '<span style="color:#aaa;">Нет монстров</span>';
    listDiv.querySelectorAll('.ref-list-item').forEach(el => {
      el.onclick = () => {
        selected = arr[parseInt(el.dataset.idx,10)];
        // detailsOpen не сбрасываем!
        updateDetails();
        updateList();
      };
    });
    // Если ничего не выбрано, показываем первого
    if (!selected && arr.length) {
      selected = arr[0];
      // detailsOpen не сбрасываем!
      updateDetails();
      updateList();
    }
    if (!arr.length) {
      selected = null;
      updateDetails();
    }
  }
  function updateDetails() {
    const detailsDiv = document.getElementById('monster-details');
    if (!selected) {
      detailsDiv.innerHTML = '<span style="color:#aaa;">Выберите монстра для просмотра информации</span>';
      return;
    }
    let m = selected;
    // Рендерим основной заголовок и кнопки
    let html = `<h3 style='font-weight:500;margin-bottom:10px;'>${m.name}</h3>`;
    html += `<div style='margin-bottom:18px;'><button id='add-monster-to-combat' style='padding:8px 18px;font-size:1em;'>Добавить в бой</button></div>`;
    html += `<button id='toggle-monster-details' style='margin-bottom:10px;padding:6px 14px;font-size:0.97em;transition:background 0.2s;'>${detailsOpen ? 'Скрыть подробности' : 'Показать подробности'}</button>`;
    html += `<div id='monster-details-animated' class='monster-details-animated' style='overflow:hidden;max-height:0;opacity:0;transition:max-height 0.5s cubic-bezier(.4,2,.6,1), opacity 0.4s;'></div>`;
    detailsDiv.innerHTML = html;
    // Обновляем содержимое подробностей
    const block = document.getElementById('monster-details-animated');
    if (detailsOpen) {
      let detailsHtml = '';
      if (m.image) detailsHtml += `<img src='${m.image}' style='max-width:180px;float:right;margin-left:16px;margin-bottom:10px;border-radius:10px;box-shadow:0 2px 12px #0001;'>`;
      detailsHtml += `<div style='margin-bottom:6px;'>${monsterIcon('type')} <b>Тип:</b> ${m.type||''} &nbsp; ${monsterIcon('cr')} <b>CR:</b> ${m.cr||''} &nbsp; ${monsterIcon('size')} <b>Размер:</b> ${m.size||''}</div>`;
      detailsHtml += `<div style='margin-bottom:6px;'>${monsterIcon('ac')} <b>AC:</b> ${m.ac||''} &nbsp; ${monsterIcon('hp')} <b>HP:</b> ${m.hp||''} &nbsp; ${monsterIcon('speed')} <b>Скорость:</b> ${m.speed||''}</div>`;
      if (m.trait) detailsHtml += `<div style='margin-top:8px;'>${monsterIcon('trait')} <b>Особенности:</b> ${Array.isArray(m.trait)?m.trait.map(t=>t.name+': '+t.text).join('<br>'):m.trait.name+': '+m.trait.text}</div>`;
      if (m.action) detailsHtml += `<div style='margin-top:8px;'>${monsterIcon('action')} <b>Действия:</b> ${Array.isArray(m.action)?m.action.map(a=>a.name+': '+a.text).join('<br>'):m.action.name+': '+m.action.text}</div>`;
      if (m.spells) detailsHtml += `<div style='margin-top:8px;'>${monsterIcon('spells')} <b>Заклинания:</b> ${m.spells}</div>`;
      if (m.fiction) detailsHtml += `<div style='margin-top:8px;'>${monsterIcon('lore')} ${m.fiction}</div>`;
      block.innerHTML = detailsHtml;
      block.style.maxHeight = block.scrollHeight + 'px';
      block.style.opacity = '1';
    } else {
      block.innerHTML = '';
      block.style.maxHeight = '0px';
      block.style.opacity = '0';
    }
    document.getElementById('add-monster-to-combat').onclick = function() {
      let hp = parseInt(m.hp);
      if (isNaN(hp)) hp = 1;
      let ac = parseInt(m.ac);
      if (isNaN(ac)) ac = 10;
      combatants.push({
        name: m.name,
        type: 'monster',
        initiative: 0,
        hp: hp,
        ac: ac,
        inspiration: false,
        tempHp: 0,
        spellSlots: [0,0,0,0,0,0,0,0,0],
        inventory: [],
        note: '',
        effects: [],
        spellSlotsMax: Array(9).fill(0),
      });
      logEvent(`Добавлен монстр из справочника: ${m.name}`);
      renderCombatants();
      closeWithFadeOut(modal);
    };
    document.getElementById('toggle-monster-details').onclick = function() {
      detailsOpen = !detailsOpen;
      updateDetails();
    };
  }
  updateList();
}
window.openMonsterSearchModal = openMonsterSearchModal;

// SVG-иконки для параметров монстра
function monsterIcon(name) {
  const icons = {
    type: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><rect x='4' y='4' width='16' height='16' rx='4' fill='none' stroke='#888' stroke-width='2'/></svg>`,
    cr: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><circle cx='12' cy='12' r='10' fill='none' stroke='#888' stroke-width='2'/><text x='12' y='16' text-anchor='middle' font-size='10' fill='#888'>CR</text></svg>`,
    size: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><rect x='6' y='10' width='12' height='4' rx='2' fill='none' stroke='#888' stroke-width='2'/></svg>`,
    ac: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><polygon points='12,2 22,8 22,20 2,20 2,8' fill='none' stroke='#888' stroke-width='2'/></svg>`,
    hp: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><path d='M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13 5.36C13.5 3.99 14.96 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z' fill='none' stroke='#888' stroke-width='2'/></svg>`,
    speed: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><path d='M2 12h20M12 2l4 4-4 4M12 22l-4-4 4-4' fill='none' stroke='#888' stroke-width='2'/></svg>`,
    trait: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><circle cx='12' cy='12' r='10' fill='none' stroke='#888' stroke-width='2'/><path d='M8 12h8' stroke='#888' stroke-width='2'/></svg>`,
    action: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><rect x='4' y='11' width='16' height='2' fill='#888'/></svg>`,
    spells: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><path d='M12 2v20M2 12h20' fill='none' stroke='#888' stroke-width='2'/></svg>`,
    lore: `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;opacity:0.7;'><path d='M4 4h16v16H4z' fill='none' stroke='#888' stroke-width='2'/><path d='M8 8h8M8 12h4' stroke='#888' stroke-width='2'/></svg>`
  };
  return icons[name] || '';
}

// === Добавляю кнопку поиска по монстрам в верхнюю панель управления ===
setTimeout(() => {
  const appDiv = document.getElementById('app');
  if (appDiv) {
    const panel = appDiv.querySelector('div');
    if (panel && !document.getElementById('monster-search-btn-top')) {
      const monsterBtn = document.createElement('button');
      monsterBtn.id = 'monster-search-btn-top';
      monsterBtn.title = 'Поиск монстров';
      monsterBtn.innerHTML = `<svg width='18' height='18' viewBox='0 0 20 20' style='vertical-align:middle;opacity:0.7;'><circle cx='9' cy='9' r='7' stroke='#888' stroke-width='2' fill='none'/><line x1='15' y1='15' x2='19' y2='19' stroke='#888' stroke-width='2' stroke-linecap='round'/></svg> Монстры`;
      monsterBtn.style.marginLeft = '8px';
      monsterBtn.onclick = openMonsterSearchModal;
      panel.insertBefore(monsterBtn, panel.children[1]);
    }
  }
}, 500);

// В конец файла добавляю функцию showMonsterInfo
function showMonsterInfo(idx) {
  const m = combatants[idx];
  if (!m || m.type !== 'monster') return;
  let modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10001;display:flex;align-items:center;justify-content:center;';
  let html = `<div style="background:#fff;padding:32px 28px 24px 28px;border-radius:24px;box-shadow:0 12px 48px #0002;min-width:320px;max-width:96vw;max-height:90vh;overflow:auto;position:relative;animation:fadeIn 0.7s;">
    <button id="close-monster-info-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
    <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">${m.name}</h2>`;
  if (m.image) html += `<img src='${m.image}' style='max-width:180px;float:right;margin-left:16px;margin-bottom:10px;border-radius:10px;box-shadow:0 2px 12px #0001;'>`;
  html += `<div style='margin-bottom:6px;'><b>Тип:</b> ${m.type||''} &nbsp; <b>CR:</b> ${m.cr||''} &nbsp; <b>Размер:</b> ${m.size||''}</div>`;
  html += `<div style='margin-bottom:6px;'><b>AC:</b> ${m.ac||''} &nbsp; <b>HP:</b> ${m.hp||''} &nbsp; <b>Скорость:</b> ${m.speed||''}</div>`;
  if (m.trait) html += `<div style='margin-top:8px;'><b>Особенности:</b> ${Array.isArray(m.trait)?m.trait.map(t=>t.name+': '+t.text).join('<br>'):m.trait.name+': '+m.trait.text}</div>`;
  if (m.action) html += `<div style='margin-top:8px;'><b>Действия:</b> ${Array.isArray(m.action)?m.action.map(a=>a.name+': '+a.text).join('<br>'):m.action.name+': '+m.action.text}</div>`;
  if (m.spells) html += `<div style='margin-top:8px;'><b>Заклинания:</b> ${m.spells}</div>`;
  if (m.fiction) html += `<div style='margin-top:8px;'>${m.fiction}</div>`;
  html += `</div>`;
  modal.innerHTML = html;
  document.body.appendChild(modal);
  document.getElementById('close-monster-info-modal').onclick = () => closeWithFadeOut(modal);
}
window.showMonsterInfo = showMonsterInfo;

// Универсальная функция для плавного закрытия модалок и блоков
function closeWithFadeOut(el) {
  if (!el) return;
  el.classList.add('fade-out');
  el.addEventListener('animationend', () => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, { once: true });
}

// === МОДАЛЬНОЕ ОКНО ПОЛНОГО ДОБАВЛЕНИЯ ===
function showFullAddModal() {
  hideContextMenu();
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-full-add-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Добавить персонажа вручную</h2>
      <form id="full-add-form">
        <label>Имя:<br><input id="full-add-name" type="text" value="" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;" required></label><br>
        <label>Тип:<br>
          <select id="full-add-type" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;">
            <option value="pc">Персонаж</option>
            <option value="npc">NPC</option>
            <option value="monster">Монстр</option>
          </select>
        </label><br>
        <label>Инициатива:<br><input id="full-add-initiative" type="number" value="0" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>КД (AC):<br><input id="full-add-ac" type="number" value="10" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Хиты:<br><input id="full-add-hp" type="number" value="1" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;" required></label><br>
        <label>Временные хиты:<br><input id="full-add-tempHp" type="number" value="0" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input id="full-add-inspiration" type="checkbox"> Вдохновение
        </label>
        <label>Заметка:<br><input id="full-add-note" type="text" value="" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Инвентарь (через запятую):<br><input id="full-add-inventory" type="text" value="" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Слоты заклинаний (через запятую, 9 уровней):<br><input id="full-add-slots" type="text" value="0,0,0,0,0,0,0,0,0" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Макс. слоты заклинаний (через запятую, 9 уровней):<br><input id="full-add-slots-max" type="text" value="0,0,0,0,0,0,0,0,0" style="width:220px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Добавить</button>
          <button type="button" id="cancel-full-add" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-full-add-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-full-add').onclick = () => closeWithFadeOut(modal);
  document.getElementById('full-add-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('full-add-name').value.trim();
    const type = document.getElementById('full-add-type').value;
    const initiative = parseInt(document.getElementById('full-add-initiative').value, 10) || 0;
    const ac = parseInt(document.getElementById('full-add-ac').value, 10) || 10;
    const hp = parseInt(document.getElementById('full-add-hp').value, 10) || 1;
    const tempHp = parseInt(document.getElementById('full-add-tempHp').value, 10) || 0;
    const inspiration = document.getElementById('full-add-inspiration').checked;
    const note = document.getElementById('full-add-note').value || '';
    const inventory = document.getElementById('full-add-inventory').value.split(',').map(x=>x.trim()).filter(Boolean);
    const spellSlots = document.getElementById('full-add-slots').value.split(',').map(x=>parseInt(x,10)||0);
    const spellSlotsMax = document.getElementById('full-add-slots-max').value.split(',').map(x=>parseInt(x,10)||0);
    combatants.push({
      name,
      type,
      initiative,
      ac,
      hp,
      tempHp,
      inspiration,
      note,
      inventory,
      spellSlots,
      spellSlotsMax,
      effects: [],
    });
    renderCombatants();
    closeWithFadeOut(modal);
    logEvent(`Добавлен персонаж вручную: ${name}`);
  };
}
window.showFullAddModal = showFullAddModal;

// В интерфейс (рядом с формой добавления) добавим кнопку "Ручное добавление"
setTimeout(() => {
  const addForm = document.getElementById('add-form');
  if (addForm && !document.getElementById('manual-add-btn')) {
    const btn = document.createElement('button');
    btn.id = 'manual-add-btn';
    btn.type = 'button';
    btn.innerText = 'Ручное добавление';
    btn.style.marginLeft = '8px';
    btn.onclick = showFullAddModal;
    addForm.appendChild(btn);
  }
}, 500);

// === SVG-иконки для кубиков ===
function diceIcon(sides) {
  switch (sides) {
    case 4: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><polygon points='16,4 28,28 4,28' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
    case 6: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><rect x='6' y='6' width='20' height='20' rx='4' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
    case 8: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><polygon points='16,4 28,16 16,28 4,16' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
    case 10: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><ellipse cx='16' cy='16' rx='12' ry='14' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
    case 12: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><polygon points='16,4 28,12 24,28 8,28 4,12' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
    case 20: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><polygon points='16,4 30,12 26,28 6,28 2,12' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
    case 100: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='none' stroke='#007aff' stroke-width='2'/><text x='16' y='22' text-anchor='middle' font-size='12' fill='#007aff'>%</text></svg>`;
    default: return `<svg class='icon dice-svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='none' stroke='#007aff' stroke-width='2'/></svg>`;
  }
}

// === Панель кубиков ===
let diceHistory = [];
function renderDicePanel() {
  const dicePanel = document.getElementById('dice-panel');
  if (!dicePanel) return;
  const diceTypes = [4, 6, 8, 10, 12, 20, 100];
  let html = `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
    ${diceTypes.map(s => `<button class="icon-btn dice-btn tooltip" data-tooltip="Бросить d${s}" onclick="showDiceRollModal(${s})">${diceIcon(s)}</button>`).join('')}
  </div>`;
  // История бросков + кнопка очистки
  html += `<div style='display:flex;align-items:center;gap:10px;margin-top:10px;'>
    <div id="dice-history" style="font-size:1.08em;min-height:1.5em;">
      ${diceHistory.slice(0, 6).map(e => `<div class="fade-in">${e}</div>`).join('')}
    </div>
    <button class="icon-btn tooltip" data-tooltip="Очистить историю" onclick="clearDiceHistory()" style="margin-left:8px;">
      <svg width="22" height="22" viewBox="0 0 24 24" class="icon" style="color:#e53935;stroke:#e53935;"><rect x="5" y="6" width="14" height="12" rx="2" fill="none" stroke="#e53935" stroke-width="2"/><path d="M9 10v4M15 10v4" stroke="#e53935" stroke-width="2"/><path d="M9 6V4h6v2" stroke="#e53935" stroke-width="2"/></svg>
    </button>
  </div>`;
  dicePanel.innerHTML = html;
}

function clearDiceHistory() {
  diceHistory = [];
  renderDicePanel();
}
window.clearDiceHistory = clearDiceHistory;

function rollDice(sides, count = 1, mod = 0, participantName = null) {
  let rolls = [];
  for (let i = 0; i < count; ++i) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  const total = rolls.reduce((a, b) => a + b, 0) + mod;
  let who = participantName ? `<b>${participantName}</b>: ` : '';
  let result = `${who}${count > 1 ? count + 'd' + sides : 'd' + sides}${mod ? (mod > 0 ? '+' + mod : mod) : ''} → <b>${total}</b> (${rolls.join('+')}${mod ? (mod > 0 ? '+' + mod : mod) : ''})`;
  diceHistory.unshift(result);
  if (diceHistory.length > 10) diceHistory.length = 10;
  renderDicePanel();
  animateDiceRoll(sides);
  logEvent(`${who}Бросок ${count > 1 ? count + 'd' + sides : 'd' + sides}${mod ? (mod > 0 ? '+' + mod : mod) : ''}: ${total} (${rolls.join('+')}${mod ? (mod > 0 ? '+' + mod : mod) : ''})`);
  return { rolls, total };
}

function showDiceRollModal(sides, participantName = null, callback = null) {
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-dice-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">Бросок d${sides}${participantName ? ` — <span style='font-size:0.9em;color:#007aff;'>${participantName}</span>` : ''}</h2>
      <form id="dice-roll-form">
        <label>Количество кубов:<br><input id="modal-dice-count" type="number" min="1" max="20" value="1" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>Модификатор:<br><input id="modal-dice-mod" type="number" min="-100" max="100" value="0" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" class="accent-btn" style="padding:8px 22px;">Бросить</button>
          <button type="button" id="cancel-dice-modal" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-dice-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-dice-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('dice-roll-form').onsubmit = (e) => {
    e.preventDefault();
    const count = parseInt(document.getElementById('modal-dice-count').value, 10) || 1;
    const mod = parseInt(document.getElementById('modal-dice-mod').value, 10) || 0;
    const { total, rolls } = rollDice(sides, count, mod, participantName);
    closeWithFadeOut(modal);
    if (typeof callback === 'function') callback(total, rolls, mod, count, sides);
  };
}
window.showDiceRollModal = showDiceRollModal;

function rollCustomDice() {
  const count = parseInt(document.getElementById('custom-dice-count').value, 10) || 1;
  const sides = parseInt(document.getElementById('custom-dice-sides').value, 10) || 20;
  const mod = parseInt(document.getElementById('custom-dice-mod').value, 10) || 0;
  rollDice(sides, count, mod);
}
window.rollCustomDice = rollCustomDice;

// Анимация броска кубика (иконка трясётся и вспыхивает)
function animateDiceRoll(sides) {
  const btns = document.querySelectorAll('.dice-btn');
  btns.forEach(btn => {
    if (btn.innerHTML.includes(`d${sides}`) || (sides === 100 && btn.innerHTML.includes('%'))) {
      btn.classList.add('dice-rolling');
      setTimeout(() => btn.classList.remove('dice-rolling'), 700);
    }
  });
}

// Панель кубиков уже есть в HTML, просто рендерим её
// renderDicePanel() будет вызвана в инициализации

function handleDiceRowClick(event, name) {
  if (event.shiftKey) {
    showDiceRollModal(20, name);
  } else {
    rollDice(20, 1, 0, name);
  }
}
window.handleDiceRowClick = handleDiceRowClick;

// === МОДАЛЬНОЕ ОКНО СПАСБРОСКА ===
function showSaveModal(idx) {
  const c = combatants[idx];
  const saves = [
    { key: 'str', label: 'Сила' },
    { key: 'dex', label: 'Ловкость' },
    { key: 'con', label: 'Телосложение' },
    { key: 'int', label: 'Интеллект' },
    { key: 'wis', label: 'Мудрость' },
    { key: 'cha', label: 'Харизма' }
  ];
  let modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:18px;box-shadow:0 8px 32px #0002;min-width:320px;max-width:90vw;position:relative;animation:fadeIn 0.7s;">
      <button id="close-save-modal" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;margin-bottom:18px;font-size:1.2em;">${c.name}: спасбросок</h2>
      <form id="save-form">
        <label>Тип спасброска:<br>
          <select id="save-type" style="width:180px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;">
            ${saves.map(s => `<option value="${s.key}">${s.label}</option>`).join('')}
          </select>
        </label><br>
        <label>Модификатор:<br><input id="save-mod" type="number" value="0" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <label>DC (Сложность):<br><input id="save-dc" type="number" value="10" style="width:80px;font-size:1.1em;padding:7px 12px;margin-bottom:8px;"></label><br>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <button id="save-roll-btn" type="button" class="icon-btn tooltip" data-tooltip="Бросить d20" style="padding:7px 10px;">${diceIcon(20)}</button>
          <span style="color:#888;font-size:0.98em;">или Shift — панель кубов</span>
          <input id="save-result" type="number" style="width:70px;font-size:1.1em;margin-left:10px;" placeholder="Результат" readonly>
        </div>
        <div id="save-outcome" style="margin-bottom:10px;font-size:1.08em;"></div>
        <div style="margin-top:18px;display:flex;gap:12px;">
          <button type="submit" style="padding:8px 22px;">Записать</button>
          <button type="button" id="cancel-save" style="padding:8px 22px;">Отмена</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-save-modal').onclick = () => closeWithFadeOut(modal);
  document.getElementById('cancel-save').onclick = () => closeWithFadeOut(modal);
  // d20 бросок
  document.getElementById('save-roll-btn').onclick = (e) => {
    const mod = parseInt(document.getElementById('save-mod').value, 10) || 0;
    if (e.shiftKey) {
      showDiceRollModal(20, c.name, function(total) {
        document.getElementById('save-result').value = total + mod;
        const dc = parseInt(document.getElementById('save-dc').value, 10) || 10;
        const outcome = (total + mod) >= dc ? 'УСПЕХ' : 'ПРОВАЛ';
        document.getElementById('save-outcome').innerHTML = `<b style='color:${outcome==='УСПЕХ'?'#2e7d32':'#c00'};'>${outcome}</b> (бросок: ${total}${mod? (mod>0? ' +'+mod : ' '+mod) : ''}, DC: ${dc})`;
        logEvent(`${c.name}: спасбросок (${document.getElementById('save-type').selectedOptions[0].text}) d20${mod? (mod>0? ' +'+mod : ' '+mod) : ''} = ${total+mod} vs DC ${dc} — ${outcome}`);
      });
    } else {
      const { total, rolls } = rollDice(20, 1, 0, c.name);
      document.getElementById('save-result').value = total + mod;
      // outcome
      const dc = parseInt(document.getElementById('save-dc').value, 10) || 10;
      const outcome = (total + mod) >= dc ? 'УСПЕХ' : 'ПРОВАЛ';
      document.getElementById('save-outcome').innerHTML = `<b style='color:${outcome==='УСПЕХ'?'#2e7d32':'#c00'};'>${outcome}</b> (бросок: ${total}${mod? (mod>0? ' +'+mod : ' '+mod) : ''}, DC: ${dc})`;
      // лог
      logEvent(`${c.name}: спасбросок (${document.getElementById('save-type').selectedOptions[0].text}) d20${mod? (mod>0? ' +'+mod : ' '+mod) : ''} = ${total+mod} vs DC ${dc} — ${outcome}`);
    }
  };
  document.getElementById('save-form').onsubmit = (e) => {
    e.preventDefault();
    closeWithFadeOut(modal);
  };
}
window.showSaveModal = showSaveModal;

// === Undo/Redo ===
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 50;

function saveState() {
  // Сохраняем глубокую копию состояния
  const snapshot = {
    combatants: JSON.parse(JSON.stringify(combatants)),
    round: round,
    currentIdx: currentIdx
  };
  undoStack.push(snapshot);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  // После нового действия redoStack сбрасывается
  redoStack = [];
}

function restoreState(state) {
  if (!state) return;
  combatants = JSON.parse(JSON.stringify(state.combatants));
  round = state.round;
  currentIdx = state.currentIdx;
  renderCombatants();
}

function undo() {
  if (undoStack.length === 0) return;
  const current = {
    combatants: JSON.parse(JSON.stringify(combatants)),
    round: round,
    currentIdx: currentIdx
  };
  redoStack.push(current);
  const prev = undoStack.pop();
  restoreState(prev);
  logEvent('Отмена действия (Undo)');
}

function redo() {
  if (redoStack.length === 0) return;
  const current = {
    combatants: JSON.parse(JSON.stringify(combatants)),
    round: round,
    currentIdx: currentIdx
  };
  undoStack.push(current);
  const next = redoStack.pop();
  restoreState(next);
  logEvent('Повтор действия (Redo)');
}

// Пример: saveState() перед изменениями combatants, round, currentIdx
// Например, в функции урона:
// saveState();
// combatants[idx].hp = ...
// ...
// Аналогично для других мутаций

// ... остальной код ...

// === Добавить кнопки Undo/Redo в верхнюю панель ===
setTimeout(() => {
  const btnsDiv = document.querySelector('body > div');
  if (btnsDiv && !document.getElementById('undo-btn')) {
    // Undo
    const undoBtn = document.createElement('button');
    undoBtn.id = 'undo-btn';
    undoBtn.title = 'Отменить (Ctrl+Z)';
    undoBtn.innerHTML = `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;'><path d='M12 19c-4 0-7-3-7-7s3-7 7-7c2.5 0 4.7 1.2 6 3M5 12H19M5 12l4-4M5 12l4 4' fill='none' stroke='#007aff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
    undoBtn.onclick = undo;
    btnsDiv.insertBefore(undoBtn, btnsDiv.firstChild.nextSibling);
    // Redo
    const redoBtn = document.createElement('button');
    redoBtn.id = 'redo-btn';
    redoBtn.title = 'Повторить (Ctrl+Y, Ctrl+Shift+Z)';
    redoBtn.innerHTML = `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;'><path d='M12 5c4 0 7 3 7 7s-3 7-7 7c-2.5 0-4.7-1.2-6-3M19 12H5M19 12l-4-4M19 12l-4 4' fill='none' stroke='#007aff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
    redoBtn.onclick = redo;
    btnsDiv.insertBefore(redoBtn, undoBtn.nextSibling);
  }
}, 500);

// === Глобальные горячие клавиши Undo/Redo ===
document.addEventListener('keydown', function(e) {
  // Ctrl+Z (Undo)
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
  }
  // Ctrl+Y (Redo) или Ctrl+Shift+Z (Redo)
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
    e.preventDefault();
    redo();
  }
});

// === Глобальные горячие клавиши для быстрых действий ===
document.addEventListener('keydown', function(e) {
  // Не срабатывает, если фокус в input/textarea/select
  const tag = document.activeElement.tagName.toLowerCase();
  if (['input','textarea','select'].includes(tag)) return;

  // Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z — Undo/Redo (уже реализовано выше)

  // Enter или N — следующий ход
  if ((e.key === 'Enter' || e.key.toLowerCase() === 'n') && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    nextTurn();
  }
  // D — урон (открыть модалку урона для активного)
  if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (combatants.length > 0) showDamageModal(currentIdx);
  }
  // H — исцеление (открыть модалку урона для активного, сразу на вкладке исцеления)
  if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (combatants.length > 0) {
      showDamageModal(currentIdx);
      // Автоматически выбрать кнопку "Исцелить"
      setTimeout(() => {
        const healBtn = document.getElementById('heal-btn');
        if (healBtn) healBtn.focus();
      }, 100);
    }
  }
  // Del — удалить активного
  if (e.key === 'Delete' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (combatants.length > 0) deleteCombatant(currentIdx);
  }
  // E — редактировать активного
  if (e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (combatants.length > 0) showFullEditModal(currentIdx);
  }
  // F — поиск по имени
  if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    const searchInput = document.querySelector('input[placeholder="Поиск по имени..."]');
    if (searchInput) searchInput.focus();
  }
  // A — добавить участника
  if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    const addForm = document.getElementById('add-form');
    if (addForm) {
      const nameInput = addForm.querySelector('input#name');
      if (nameInput) nameInput.focus();
    }
  }
  // Ctrl+A — выделить всех
  if (e.key.toLowerCase() === 'a' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    selectAllChecked = false;
    toggleSelectAll();
  }
  // Массовые операции (только если есть выделенные)
  if (selectedCombatants.size > 0) {
    // Ctrl+D — массовый урон
    if (e.key.toLowerCase() === 'd' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      massDamageHeal('damage');
    }
    // Ctrl+H — массовое исцеление
    if (e.key.toLowerCase() === 'h' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      massDamageHeal('heal');
    }
    // Ctrl+E — массовый эффект
    if (e.key.toLowerCase() === 'e' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      massEffect();
    }
    // Ctrl+I — массовое вдохновение
    if (e.key.toLowerCase() === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      massInspiration();
    }
    // Ctrl+Del — массовое удаление
    if (e.key === 'Delete' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      massDelete();
    }
  }
  // Стрелки вверх/вниз — переключение активного участника
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (combatants.length > 0) {
      if (e.key === 'ArrowUp') {
        currentIdx = (currentIdx - 1 + combatants.length) % combatants.length;
      } else {
        currentIdx = (currentIdx + 1) % combatants.length;
      }
      renderCombatants();
    }
  }
});

// === Подсказки о горячих клавишах в tooltip для кнопок ===
setTimeout(() => {
  // Следующий ход
  const nextBtn = document.getElementById('next-turn');
  if (nextBtn) nextBtn.title = 'Следующий ход (Enter, N)';
  // Урон/исцеление (в модалке)
  const dmgBtn = document.getElementById('dmg-btn');
  if (dmgBtn) dmgBtn.title = 'Нанести урон (D)';
  const healBtn = document.getElementById('heal-btn');
  if (healBtn) healBtn.title = 'Исцелить (H)';
  // Удалить
  const delBtn = document.querySelector('button[onclick^="deleteCombatant"]');
  if (delBtn) delBtn.title = 'Удалить (Del)';
  // Редактировать
  const editBtn = document.querySelector('button[onclick^="showFullEditModal"]');
  if (editBtn) editBtn.title = 'Редактировать (E)';
  // Поиск
  const searchInput = document.querySelector('input[placeholder="Поиск по имени..."]');
  if (searchInput) searchInput.title = 'Поиск (F)';
  // Добавить
  const addBtn = document.querySelector('#add-form button[type="submit"]');
  if (addBtn) addBtn.title = 'Добавить (A)';
}, 700);

// === Быстрое снятие эффекта ===
function removeEffect(idx, effIdx) {
  saveState();
  if (!combatants[idx].effects) return;
  const eff = combatants[idx].effects[effIdx];
  combatants[idx].effects.splice(effIdx, 1);
  logEvent(`${combatants[idx].name}: снят эффект "${eff.name}"`);
  renderCombatants();
}
window.removeEffect = removeEffect;
// === Быстрое добавление эффекта ===
function showQuickEffectMenu(idx, anchorEl) {
  hideContextMenu();
  const effects = [
    { name: 'яд', color: '#43a047' },
    { name: 'оглушён', color: '#ffd600' },
    { name: 'испуг', color: '#ff7043' },
    { name: 'невидим', color: '#42a5f5' },
    { name: 'парализован', color: '#ab47bc' },
    { name: 'ослеплён', color: '#90a4ae' },
    { name: 'немой', color: '#757575' },
    { name: 'кастомный', color: '#888' }
  ];
  const menu = document.createElement('div');
  menu.style = `position:fixed;z-index:9999;left:${anchorEl.getBoundingClientRect().left}px;top:${anchorEl.getBoundingClientRect().bottom+4}px;background:#fff;border-radius:8px;box-shadow:0 4px 24px #0002;padding:0;min-width:120px;animation:fadeIn 0.2s;`;
  menu.innerHTML = effects.map(e => `<div style='padding:8px 18px;cursor:pointer;font-size:1em;display:flex;align-items:center;gap:8px;' onmouseover="this.style.background='#f7f7fa'" onmouseout="this.style.background='none'" onmousedown='quickAddEffect(${idx},"${e.name}")'><span style='display:inline-block;width:18px;height:18px;background:${e.color};border-radius:50%;text-align:center;color:#fff;'>${effectIcon(e.name)||e.name[0]}</span> ${e.name}</div>`).join('');
  document.body.appendChild(menu);
  contextMenuDiv = menu;
  document.addEventListener('mousedown', hideContextMenu, { once: true });
}
window.showQuickEffectMenu = showQuickEffectMenu;
function quickAddEffect(idx, name) {
  hideContextMenu();
  if (name === 'кастомный') {
    addEffectPrompt(idx);
    return;
  }
  saveState();
  combatants[idx].effects = combatants[idx].effects || [];
  combatants[idx].effects.push({ name });
  logEvent(`${combatants[idx].name}: добавлен эффект "${name}"`);
  renderCombatants();
}
window.quickAddEffect = quickAddEffect;
// === Добавление кастомного эффекта ===
function addEffectPrompt(idx) {
  const effectName = prompt('Название эффекта:');
  if (!effectName) return;
  
  const duration = prompt('Длительность в раундах (оставьте пустым для бессрочного):');
  const durationNum = duration ? parseInt(duration, 10) : null;
  
  saveState();
  combatants[idx].effects = combatants[idx].effects || [];
  combatants[idx].effects.push({ 
    name: effectName, 
    duration: durationNum 
  });
  logEvent(`${combatants[idx].name}: добавлен эффект "${effectName}"${durationNum ? ` на ${durationNum} раундов` : ''}`);
  renderCombatants();
}
window.addEffectPrompt = addEffectPrompt;
// === Перемещение участника вверх/вниз ===
function moveCombatantUp(idx) {
  if (idx <= 0) return;
  saveState();
  const tmp = combatants[idx-1];
  combatants[idx-1] = combatants[idx];
  combatants[idx] = tmp;
  renderCombatants();
}
window.moveCombatantUp = moveCombatantUp;
function moveCombatantDown(idx) {
  if (idx >= combatants.length-1) return;
  saveState();
  const tmp = combatants[idx+1];
  combatants[idx+1] = combatants[idx];
  combatants[idx] = tmp;
  renderCombatants();
}
window.moveCombatantDown = moveCombatantDown;
function renderCombatants() {
  migrateInventoryFormat();
  const arr = getSortedCombatants();
  let lastType = null;
  const list = arr.map((c, idx) => {
    let groupHeader = '';
    if (groupByType && c.type !== lastType) {
      groupHeader = `<tr><td colspan='13' style='background:#f7f7fa;color:#888;font-size:0.98em;font-weight:600;padding:4px 0 4px 8px;'>${c.type === 'pc' ? 'Персонажи' : c.type === 'npc' ? 'NPC' : 'Монстры'}</td></tr>`;
      lastType = c.type;
    }
    const realIdx = combatants.indexOf(c);
    const isActive = realIdx === currentIdx;
    return `
      ${groupHeader}
      <tr draggable="true" ondragstart="handleDragStart(event,${realIdx})" ondragover="handleDragOver(event,${realIdx})" ondrop="handleDrop(event,${realIdx})" ondragend="handleDragEnd(event)" style="${isActive ? 'background:#3a4252;font-weight:bold;' : ''}"${c.type === 'monster' ? ` ondblclick="showMonsterInfo(${realIdx})"` : ''}>
        <td class='col-num'><input type='checkbox' style='margin:0;' ${selectedCombatants.has(realIdx)?'checked':''} onclick='toggleSelectCombatant(${realIdx})'></td>
        <td class='col-name'>
          <span class='name-text' oncontextmenu="event.preventDefault();showContextMenu(event.clientX,event.clientY,function(){showEditModal(${realIdx},'name')})" style="cursor:pointer;" title="Изменить имя">${c.name}</span>
          <span class='dice-row-btn tooltip' data-tooltip='Бросить d20 (Shift — модификатор) для ${c.name}' onclick='handleDiceRowClick(event, "${c.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}")' style='margin-left:6px;vertical-align:middle;cursor:pointer;'>
            <svg class='icon dice-svg' viewBox='0 0 32 32' width='22' height='22'><polygon points='16,4 30,12 26,28 6,28 2,12' fill='none' stroke='#007aff' stroke-width='2'/></svg>
          </span>
          <span class='save-row-btn tooltip' data-tooltip='Бросить спасбросок для ${c.name}' onclick='showSaveModal(${realIdx})' style='margin-left:4px;vertical-align:middle;cursor:pointer;'>
            <svg class='icon dice-svg' viewBox='0 0 32 32' width='20' height='20'><circle cx='16' cy='16' r='13' fill='none' stroke='#43a047' stroke-width='2'/><text x='16' y='22' text-anchor='middle' font-size='12' fill='#43a047'>S</text></svg>
          </span>
          ${c.note ? `<span class='note-text' oncontextmenu=\"event.preventDefault();showContextMenu(event.clientX,event.clientY,function(){showEditModal(${realIdx},'note')})\" style=\"cursor:pointer;\" title=\"Изменить заметку\">${c.note}</span>` : `<span class='note-text' oncontextmenu=\"event.preventDefault();showContextMenu(event.clientX,event.clientY,function(){showEditModal(${realIdx},'note')})\" style=\"cursor:pointer;color:#bbb;\" title=\"Добавить заметку\">[+]</span>`}
        </td>
        <td class='col-type'><span class="type-value" onclick="showEditModal(${realIdx},'type')" title="Изменить тип">${c.type === 'pc' ? 'Персонаж' : c.type === 'npc' ? 'NPC' : 'Монстр'}</span></td>
        <td class='col-init'>
          <span class="init-value" onclick="showEditModal(${realIdx},'initiative')" title="Изменить инициативу">${c.initiative}</span>
          <span class='move-up-btn' title='Переместить вверх' style='margin-left:4px;cursor:pointer;vertical-align:middle;' onclick='moveCombatantUp(${realIdx})'>
            <svg width='14' height='14' viewBox='0 0 20 20'><path d='M10 5l-5 6h10z' fill='#888'/></svg>
          </span>
          <span class='move-down-btn' title='Переместить вниз' style='margin-left:2px;cursor:pointer;vertical-align:middle;' onclick='moveCombatantDown(${realIdx})'>
            <svg width='14' height='14' viewBox='0 0 20 20'><path d='M10 15l5-6H5z' fill='#888'/></svg>
          </span>
        </td>
        <td class='col-ac'><span class="ac-value" onclick="showEditModal(${realIdx},'ac')" title="Изменить КД">${c.ac || 10}</span></td>
        <td class='col-hp'>
          <span class="hp-value" onclick="showDamageModal(${realIdx})" title="Изменить хиты">${c.hp}</span>
        </td>
        <td class='col-insp'>
          <span class="insp-value" onclick="showEditModal(${realIdx},'inspiration')" title="Изменить вдохновение" style="${c.inspiration ? 'font-weight:bold;text-decoration:underline;' : ''}">${svgIcon('theme')}</span>
        </td>
        <td class='col-eff'>
          <div class='effects-list' style='display:inline-block;'>
            ${(c.effects||[]).map((e, effIdx) => {
              const colorMap = {
                'яд': '#43a047',
                'оглушён': '#ffd600',
                'испуг': '#ff7043',
                'невидим': '#42a5f5',
                'парализован': '#ab47bc',
                'ослеплён': '#90a4ae',
                'немой': '#757575'
              };
              const color = colorMap[e.name?.toLowerCase()] || '#888';
              return `<span class='effect-chip' title='${e.name}${e.duration ? ` (${e.duration} р.)` : ''}' style='display:inline-block;margin-right:3px;vertical-align:middle;cursor:pointer;background:${color};color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;text-align:center;font-size:0.98em;' onclick='removeEffect(${realIdx},${effIdx})'>${effectIcon(e.name?.toLowerCase())||e.name[0]}</span>`;
            }).join('')}
            <span class='effect-add-btn' title='Добавить эффект' style='display:inline-block;vertical-align:middle;cursor:pointer;background:#eee;color:#888;border-radius:50%;width:22px;height:22px;line-height:22px;text-align:center;font-size:1.1em;margin-left:2px;' onclick='showQuickEffectMenu(${realIdx},this)'>+</span>
          </div>
        </td>
        <td class='col-slots'>
          <div class='spell-slots'>
            ${c.spellSlots.map((s, i) => {
              const max = c.spellSlotsMax?.[i] || 0;
              return `
                <span class='spell-slot${s > 0 ? ' filled' : ''}' title='${i+1} уровень' onclick='changeSpellSlot(${realIdx},${i},-1)'>${s}</span>
                <span class='spell-slot-max' onclick='setSpellSlotMax(${realIdx},${i})'>/${max}</span>
              `;
            }).join('')}
            <button onclick='resetSpellSlots(${realIdx})' style='margin-left:8px;'>${svgIcon('reset')}</button>
          </div>
        </td>
        <td class='col-inv'>
          <div style='max-height:60px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:4px;'>
            ${(c.inventory||[]).map((item, i) => {
              if (!item || typeof item !== 'object' || !item.name) return '';
              // Цвета по типу
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
                <button class='chip-remove' onclick="event.stopPropagation();removeInventoryItem(${realIdx},${i})">×</button>
                <button class='chip-edit' onclick="event.stopPropagation();editInventoryItem(${realIdx},${i})" style='margin-left:2px;'>✎</button>
              </span>`;
            }).join('')}
            <button onclick="addInventoryItem(${realIdx})" class='chip' style='padding:3px 10px;background:#eee;color:#888;'>+</button>
          </div>
        </td>
        <td class='col-act'>
          <button onclick="showFullEditModal(${realIdx})">${svgIcon('edit')}</button>
          <button onclick="deleteCombatant(${realIdx})">${svgIcon('delete')}</button>
          <button onclick="addNotePrompt(${realIdx})">${svgIcon('note')}</button>
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('combatants-list').innerHTML = list || '<tr><td colspan="13">Нет участников</td></tr>';
  document.getElementById('round-indicator').innerText = `Раунд: ${round}`;
  
  // Показываем/скрываем панель массовых действий
  const massActionsDiv = document.getElementById('mass-actions');
  if (massActionsDiv) {
    massActionsDiv.style.display = selectedCombatants.size > 0 ? 'block' : 'none';
  }
}

// === Массовое управление инвентарём ===
function massInventory() {
  saveState();
  const action = prompt('Действие (add/remove/clear):', 'add');
  if (!action) return;
  
  if (action === 'clear') {
    selectedCombatants.forEach(idx => {
      combatants[idx].inventory = [];
      logEvent(`${combatants[idx].name}: инвентарь очищен`);
    });
  } else if (action === 'add') {
    const itemName = prompt('Название предмета:');
    if (!itemName) return;
    const itemType = prompt('Тип предмета (оружие/броня/зелье/артефакт/прочее):', 'прочее');
    const itemQty = parseInt(prompt('Количество:', '1'), 10) || 1;
    const itemDesc = prompt('Описание (необязательно):');
    
    selectedCombatants.forEach(idx => {
      combatants[idx].inventory = combatants[idx].inventory || [];
      combatants[idx].inventory.push({
        name: itemName,
        type: itemType,
        qty: itemQty,
        desc: itemDesc
      });
      logEvent(`${combatants[idx].name}: добавлен предмет "${itemName}"`);
    });
  } else if (action === 'remove') {
    const itemName = prompt('Название предмета для удаления:');
    if (!itemName) return;
    
    selectedCombatants.forEach(idx => {
      if (combatants[idx].inventory) {
        const itemIndex = combatants[idx].inventory.findIndex(item => 
          item.name.toLowerCase().includes(itemName.toLowerCase())
        );
        if (itemIndex !== -1) {
          const removedItem = combatants[idx].inventory.splice(itemIndex, 1)[0];
          logEvent(`${combatants[idx].name}: удалён предмет "${removedItem.name}"`);
        }
      }
    });
  }
  renderCombatants();
}
window.massInventory = massInventory;

// === Добавление заметки ===
function addNotePrompt(idx) {
  const note = prompt('Добавить заметку для ' + combatants[idx].name + ':');
  if (note !== null) {
    saveState();
    combatants[idx].note = note;
    logEvent(`${combatants[idx].name}: добавлена заметка "${note}"`);
    renderCombatants();
  }
}
window.addNotePrompt = addNotePrompt;

// === Изменение слотов заклинаний ===
function changeSpellSlot(idx, level, change) {
  saveState();
  const current = combatants[idx].spellSlots[level] || 0;
  const newValue = Math.max(0, current + change);
  combatants[idx].spellSlots[level] = newValue;
  logEvent(`${combatants[idx].name}: слоты ${level+1} уровня изменены на ${newValue}`);
  renderCombatants();
}
window.changeSpellSlot = changeSpellSlot;

// === Drag & Drop функции ===
function handleDragStart(event, idx) {
  event.dataTransfer.setData('text/plain', idx);
  event.dataTransfer.effectAllowed = 'move';
}
window.handleDragStart = handleDragStart;

function handleDragOver(event, idx) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}
window.handleDragOver = handleDragOver;

function handleDrop(event, targetIdx) {
  event.preventDefault();
  const sourceIdx = parseInt(event.dataTransfer.getData('text/plain'), 10);
  if (sourceIdx !== targetIdx) {
    saveState();
    const tmp = combatants[sourceIdx];
    combatants[sourceIdx] = combatants[targetIdx];
    combatants[targetIdx] = tmp;
    logEvent(`Участник "${tmp.name}" перемещён`);
    renderCombatants();
  }
}
window.handleDrop = handleDrop;

function handleDragEnd(event) {
  event.preventDefault();
}
window.handleDragEnd = handleDragEnd;

// === Иконки эффектов ===
function effectIcon(effectName) {
  const iconMap = {
    'яд': '☠️',
    'оглушён': '💫',
    'испуг': '😨',
    'невидим': '👻',
    'парализован': '🛑',
    'ослеплён': '🙈',
    'немой': '🤐',
    'оглушение': '💫',
    'страх': '😨',
    'невидимость': '👻',
    'паралич': '🛑',
    'слепота': '🙈',
    'немота': '🤐'
  };
  return iconMap[effectName?.toLowerCase()] || effectName?.[0]?.toUpperCase() || '?';
}
window.effectIcon = effectIcon;

// === Инициализация приложения ===
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация кнопок
  document.getElementById('next-turn').onclick = nextTurn;
  document.getElementById('reset-combat').onclick = resetCombat;
  document.getElementById('save-combat').onclick = saveCombat;
  document.getElementById('load-combat').onclick = loadCombat;
  document.getElementById('combat-note-btn').onclick = setCombatNote;
  document.getElementById('theme-toggle').onclick = toggleTheme;
  document.getElementById('roll-initiative').onclick = rollInitiativeForAll;

  // Инициализация формы добавления
  document.getElementById('add-form').onsubmit = addCombatant;

  // Применение сохранённой темы
  applySavedTheme();

  // Первоначальный рендер
  renderCombatants();
  renderLog();
  renderTimer();
  renderDicePanel();

  // Добавление кнопок Undo/Redo
  setTimeout(() => {
    const btnsDiv = document.querySelector('div[style*="margin-bottom: 12px"]');
    if (btnsDiv && !document.getElementById('undo-btn')) {
      // Undo
      const undoBtn = document.createElement('button');
      undoBtn.id = 'undo-btn';
      undoBtn.title = 'Отменить (Ctrl+Z)';
      undoBtn.innerHTML = `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;'><path d='M12 19c-4 0-7-3-7-7s3-7 7-7c2.5 0 4.7 1.2 6 3M5 12H19M5 12l4-4M5 12l4 4' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
      undoBtn.onclick = undo;
      btnsDiv.insertBefore(undoBtn, btnsDiv.firstChild.nextSibling);
      
      // Redo
      const redoBtn = document.createElement('button');
      redoBtn.id = 'redo-btn';
      redoBtn.title = 'Повторить (Ctrl+Y, Ctrl+Shift+Z)';
      redoBtn.innerHTML = `<svg width='18' height='18' viewBox='0 0 24 24' style='vertical-align:middle;'><path d='M12 5c4 0 7 3 7 7s-3 7-7 7c-2.5 0-4.7-1.2-6-3M19 12H5M19 12l-4-4M19 12l-4 4' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
      redoBtn.onclick = redo;
      btnsDiv.insertBefore(redoBtn, undoBtn.nextSibling);
    }
  }, 100);

  // Глобальные горячие клавиши
  document.addEventListener('keydown', function(e) {
    // Ctrl+Z (Undo)
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    // Ctrl+Y (Redo) или Ctrl+Shift+Z (Redo)
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.key === 'z' && e.shiftKey)) {
      e.preventDefault();
      redo();
    }
    // Enter (Следующий ход)
    if (e.key === 'Enter' && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      nextTurn();
    }
    // N (Следующий ход)
    if (e.key === 'n' && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      nextTurn();
    }
  });
});

