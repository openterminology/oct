async function doLookup() {
  const fhir = document.getElementById('fhirBase').value.replace(/\/+$/, '');
  const code = document.getElementById('conceptId').value.trim();
  const system = document.getElementById('system').value.trim();
  const rawEl = document.getElementById('raw');
  const detailsEl = document.getElementById('details');
  const summaryEl = document.getElementById('summary');

  if (!fhir || !code) {
    alert('Please provide FHIR server and concept id');
    return;
  }

  rawEl.textContent = 'Loading...';
  detailsEl.innerHTML = '';
  summaryEl.textContent = '';

  // Try the generic $lookup endpoint at the server root first.
  const params = new URLSearchParams({ system, code });
  const urls = [
    `${fhir}/$lookup?${params}`,
    `${fhir}/CodeSystem/$lookup?${params}`,
    `${fhir}/CodeSystem/$lookup?${params}`
  ];

  let res = null;
  let ok = false;
  let lastErr = null;
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/fhir+json,application/json' } });
      if (!r.ok) {
        lastErr = `${r.status} ${r.statusText} from ${url}`;
        continue;
      }
      res = await r.json();
      ok = true;
      break;
    } catch (e) {
      lastErr = e.message;
    }
  }

  if (!ok) {
    rawEl.textContent = `Lookup failed: ${lastErr}`;
    return;
  }

  rawEl.textContent = JSON.stringify(res, null, 2);

  // Render some useful pieces
  const display = [];
  // FHIR $lookup returns parameter bundle with parameter[] elements
  const params = res.parameter || res.parameter || [];
  if (Array.isArray(params) && params.length) {
    const fsn = params.find(p => p.name === 'display') || params.find(p => p.name === 'name');
    const designations = params.filter(p => p.name === 'designation');
    if (fsn && fsn.valueString) display.push(`<strong>Display:</strong> ${escapeHtml(fsn.valueString)}`);
    if (designations.length) {
      const items = designations.map(d => {
        try {
          const val = d.part ? d.part.find(p=>p.name==='value') : null;
          return val && val.valueString ? escapeHtml(val.valueString) : JSON.stringify(d);
        } catch(e){return JSON.stringify(d)}
      });
      display.push(`<strong>Designations:</strong><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`);
    }
  }

  // Try to display properties
  const properties = (res.parameter || []).find(p => p.name === 'property');
  if (properties && Array.isArray(properties.part)) {
    const rows = properties.part.map(pp => {
      const n = pp.part && pp.part.find(x=>x.name==='code')?.valueString;
      const v = pp.part && pp.part.find(x=>x.name==='value')?.valueString;
      if (n) return `<div><strong>${escapeHtml(n)}:</strong> ${escapeHtml(v||'')}</div>`;
      return '';
    }).filter(Boolean);
    if (rows.length) display.push(`<strong>Properties:</strong>${rows.join('')}`);
  }

  if (!display.length) display.push('<em>No structured display items found — see raw JSON.</em>');
  detailsEl.innerHTML = display.join('\n');
  summaryEl.innerHTML = `<div><strong>Lookup succeeded</strong> — showing ${Object.keys(res).length} top-level keys</div>`;
}

function escapeHtml(s){
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('lookupBtn').addEventListener('click', doLookup);
  document.getElementById('conceptId').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLookup(); });
});
