// Offline mock UI client
let concepts = [];
const resultsEl = document.getElementById('results');
const relationsEl = document.getElementById('relations');
const conceptTitle = document.getElementById('conceptTitle');
const conceptDetails = document.getElementById('conceptDetails');
const globalSearch = document.getElementById('globalSearch');
const searchBtn = document.getElementById('searchBtn');

function renderResults(list) {
  resultsEl.innerHTML = '';
  if (!list.length) {
    resultsEl.innerHTML = '<li class="empty">No results</li>';
    return;
  }
  list.forEach(c => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.textContent = `${c.id} — ${c.term}`;
    li.dataset.id = c.id;
    li.addEventListener('click', () => showConcept(c.id));
    resultsEl.appendChild(li);
  });
}

function renderConcept(c) {
  conceptTitle.textContent = `${c.id} — ${c.term}`;
  conceptDetails.innerHTML = `
    <p><strong>FSN:</strong> ${c.fsn || '-'} </p>
    <p><strong>Definition:</strong> ${c.definition || '—'}</p>
  `;

  relationsEl.innerHTML = '';
  (c.relations || []).forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.type}: ${r.targetId} — ${r.targetTerm}`;
    relationsEl.appendChild(li);
  });
}

function showConcept(id) {
  const c = concepts.find(x => String(x.id) === String(id));
  if (!c) return alert('Concept not found');
  renderConcept(c);
}

function search(q) {
  if (!q) { renderResults([]); return; }
  const norm = String(q).toLowerCase();
  const byId = concepts.filter(c => String(c.id) === norm);
  if (byId.length) return renderResults(byId);
  const res = concepts.filter(c => (c.term || '').toLowerCase().includes(norm) || (c.fsn || '').toLowerCase().includes(norm));
  renderResults(res.slice(0, 50));
}

async function loadMock() {
  try {
    const res = await fetch('/static/mock/concepts.json');
    concepts = await res.json();
    // show a small initial result list
    renderResults(concepts.slice(0, 10));
  } catch (e) {
    console.error('Failed to load mock data', e);
    concepts = [];
    renderResults([]);
  }
}

searchBtn.addEventListener('click', () => search(globalSearch.value.trim()));
globalSearch.addEventListener('keydown', ev => { if (ev.key === 'Enter') search(globalSearch.value.trim()); });

document.querySelectorAll('.example').forEach(btn => btn.addEventListener('click', (ev) => {
  const id = ev.currentTarget.dataset.id;
  showConcept(id);
}));

loadMock();
