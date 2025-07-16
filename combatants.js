// combatants.js — управление участниками боя

let combatants = [
  { name: 'Андрей', type: 'pc', initiative: 15, ac: 16, hp: 30, note: '' },
  { name: 'Гоблин', type: 'monster', initiative: 12, ac: 13, hp: 7, note: '' },
  { name: 'NPC-страж', type: 'npc', initiative: 10, ac: 15, hp: 20, note: '' }
];

let selectedCombatants = new Set();

let sortField = 'initiative';
let sortDir = 'desc';
let filterType = 'all';

let currentIdx = 0;
let round = 1;

export function getCombatants() {
  return combatants;
}

export function addCombatant(data) {
  combatants.push(data);
}

export function updateCombatant(idx, data) {
  combatants[idx] = { ...combatants[idx], ...data };
}

export function deleteCombatant(idx) {
  combatants.splice(idx, 1);
}

export function getSelected() {
  return Array.from(selectedCombatants);
}

export function toggleSelect(idx) {
  if (selectedCombatants.has(idx)) {
    selectedCombatants.delete(idx);
  } else {
    selectedCombatants.add(idx);
  }
}

export function selectAll() {
  selectedCombatants = new Set(combatants.map((_, i) => i));
}

export function clearSelection() {
  selectedCombatants.clear();
}

export function deleteSelectedCombatants() {
  const toDelete = Array.from(selectedCombatants).sort((a, b) => b - a);
  for (const idx of toDelete) {
    combatants.splice(idx, 1);
  }
  clearSelection();
}

export function setSort(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir = field === 'name' ? 'asc' : 'desc';
  }
}

export function getSort() {
  return { field: sortField, dir: sortDir };
}

export function setFilter(type) {
  filterType = type;
}

export function getFilter() {
  return filterType;
}

export function getSortedAndFilteredCombatants() {
  let arr = [...combatants];
  if (filterType !== 'all') arr = arr.filter(c => c.type === filterType);
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
  return arr;
}

export function getCurrentIdx() {
  return currentIdx;
}

export function getRound() {
  return round;
}

export function nextTurn() {
  if (getSortedAndFilteredCombatants().length === 0) return;
  currentIdx++;
  if (currentIdx >= getSortedAndFilteredCombatants().length) {
    currentIdx = 0;
    round++;
  }
}

export function prevTurn() {
  if (getSortedAndFilteredCombatants().length === 0) return;
  currentIdx--;
  if (currentIdx < 0) {
    currentIdx = getSortedAndFilteredCombatants().length - 1;
    round = Math.max(1, round - 1);
  }
}

export function resetTurn() {
  currentIdx = 0;
  round = 1;
}

export function massDamage(amount) {
  for (const idx of selectedCombatants) {
    combatants[idx].hp = Math.max(0, (combatants[idx].hp || 0) - amount);
  }
}

export function massHeal(amount) {
  for (const idx of selectedCombatants) {
    combatants[idx].hp = (combatants[idx].hp || 0) + amount;
  }
} 