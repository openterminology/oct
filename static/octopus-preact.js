// Lightweight Preact + htm UI for Octopus (no build)
import { h, render } from 'https://unpkg.com/preact@10.15.1?module';
import { useState } from 'https://unpkg.com/preact@10.15.1/hooks/dist/hooks.module.js?module';
import htm from 'https://unpkg.com/htm@3.1.1?module';

const html = htm.bind(h);

function escapeHtml(s){
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function ResultView({data}){
  if (!data) return html`<div class="panel muted">No result</div>`;
  return html`<div class="panel"><h4>Raw JSON</h4><pre class="json">${JSON.stringify(data,null,2)}</pre></div>`;
}

function Details({data}){
  if (!data) return html`<div class="panel muted">No details</div>`;
  const params = data.parameter || [];
  const fsn = params.find(p=>p.name==='display' || p.name==='name')?.valueString;
  const designations = params.filter(p=>p.name==='designation');
  return html`<div class="panel">
    <h4>Details</h4>
    ${fsn ? html`<div><strong>Display:</strong> ${escapeHtml(fsn)}</div>` : ''}
    ${designations.length ? html`<div><strong>Designations:</strong><ul>${designations.map(d=>html`<li>${escapeHtml(JSON.stringify(d))}</li>`)}</ul></div>` : ''}
  </div>`;
}

function App(){
  const [fhir, setFhir] = useState('https://tx.ontoserver.csiro.au/fhir');
  const [code, setCode] = useState('138875005');
  const [system, setSystem] = useState('http://snomed.info/sct');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function lookup(){
    if (!fhir || !code) { setError('Provide FHIR and Concept'); return; }
    setLoading(true); setError(''); setData(null);
    const params = new URLSearchParams({ system, code });
    const urls = [`${fhir}/$lookup?${params}`, `${fhir}/CodeSystem/$lookup?${params}`];
    let lastErr = '';
    for (const url of urls){
      try{
        const r = await fetch(url, { headers: { Accept: 'application/fhir+json,application/json' } });
        if (!r.ok){ lastErr = `${r.status} ${r.statusText} ${url}`; continue; }
        const json = await r.json(); setData(json); setLoading(false); return;
      } catch(e){ lastErr = e.message; }
    }
    setError('Lookup failed: '+lastErr); setLoading(false);
  }

  return html`<div>
    <div class="panel">
      <div style="display:flex;gap:8px;align-items:center">
        <label class="muted">FHIR Server</label>
        <input value=${fhir} onInput=${e=>setFhir(e.target.value)} style="flex:1" />
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
        <label class="muted">Concept ID</label>
        <input value=${code} onInput=${e=>setCode(e.target.value)} />
        <button onClick=${lookup}>Lookup</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
        <label class="muted">System</label>
        <input value=${system} onInput=${e=>setSystem(e.target.value)} style="flex:1" />
      </div>
      ${error ? html`<div style="color:#c00;margin-top:8px">${escapeHtml(error)}</div>` : ''}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
      <${ResultView} data=${data} />
      <${Details} data=${data} />
    </div>
  </div>`;
}

const root = document.getElementById('root');
render(html`<${App} />`, root);
