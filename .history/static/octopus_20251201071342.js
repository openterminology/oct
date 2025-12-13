import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';

const html = htm.bind(h);

/**
 * Convert a value to a safe HTML string by escaping `&`, `<`, and `>`.
 * @param {*} s - Value to escape; `null` or `undefined` yield an empty string.
 * @returns {string} The input converted to a string with `&`, `<`, and `>` replaced by their HTML entities.
 */
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/**
 * Preact component that provides a UI to perform FHIR $lookup calls and display the results.
 *
 * The component reads optional URL query parameters (concept/code, fhir, valueset/valueSet, tour, system)
 * on mount and may auto-run a lookup if a concept is provided. It renders inputs for FHIR server, concept ID,
 * and system, performs a lookup against two candidate endpoints ({base}/$lookup and {base}/CodeSystem/$lookup),
 * handles network and non-OK responses, and displays either an error, the raw JSON response, or a structured
 * details panel extracted from the lookup `parameter` array (display/name, designations, and properties).
 *
 * @returns {JSX.Element} The Octopus terminology browser UI element.
 */
function OctopusApp() {
  const [fhirBase, setFhirBase] = useState('https://tx.ontoserver.csiro.au/fhir');
  const [conceptId, setConceptId] = useState('138875005');
  const [system, setSystem] = useState('http://snomed.info/sct');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [queryInfo, setQueryInfo] = useState('');

  useEffect(() => {
    // Read URL parameters
    const qs = new URLSearchParams(window.location.search);
    const concept = qs.get('concept') || qs.get('code') || '';
    const fhir = qs.get('fhir') || '';
    const valueset = qs.get('valueset') || qs.get('valueSet') || '';
    const tour = qs.get('tour') || '';
    const sys = qs.get('system') || '';

    if (concept) setConceptId(concept);
    if (fhir) setFhirBase(fhir);
    if (sys) setSystem(sys);

    const parts = [];
    if (concept) parts.push(html`<strong>concept</strong>: ${concept}`);
    if (valueset) parts.push(html`<strong>valueset</strong>: ${valueset}`);
    if (fhir) parts.push(html`<strong>fhir</strong>: ${fhir}`);
    if (tour) parts.push(html`<strong>tour</strong>: ${tour}`);

    if (parts.length) {
      setQueryInfo(html`Params — ${parts.map((p, i) => html`${i > 0 ? ' · ' : ''}${p}`)}`);
    } else {
      setQueryInfo('No URL parameters detected');
    }

    // Auto-run if concept provided
    if (concept) {
      setTimeout(() => doLookup(fhir || fhirBase, concept, sys || system), 200);
    }
  }, []);

  async function doLookup(fhir = fhirBase, code = conceptId, sys = system) {
    if (!fhir || !code) {
      setError('Please provide FHIR server and concept id');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const base = fhir.replace(/\/+$/, '');
    const params = new URLSearchParams({ system: sys, code });
    const urls = [
      `${base}/$lookup?${params}`,
      `${base}/CodeSystem/$lookup?${params}`
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

    setLoading(false);

    if (!ok) {
      setError(`Lookup failed: ${lastErr}`);
      return;
    }

    setResult(res);
  }

  function handleLookup() {
    doLookup();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') doLookup();
  }

  function renderDetails() {
    if (!result) return null;

    const display = [];
    const params = result.parameter || [];

    if (Array.isArray(params) && params.length) {
      const fsn = params.find(p => p.name === 'display') || params.find(p => p.name === 'name');
      const designations = params.filter(p => p.name === 'designation');
      
      if (fsn && fsn.valueString) {
        display.push(html`<div><strong>Display:</strong> ${fsn.valueString}</div>`);
      }
      
      if (designations.length) {
        const items = designations.map(d => {
          try {
            const val = d.part ? d.part.find(p => p.name === 'value') : null;
            return val && val.valueString ? val.valueString : JSON.stringify(d);
          } catch(e) { return JSON.stringify(d); }
        });
        display.push(html`
          <div>
            <strong>Designations:</strong>
            <ul>${items.map(i => html`<li>${i}</li>`)}</ul>
          </div>
        `);
      }
    }

    const properties = params.find(p => p.name === 'property');
    if (properties && Array.isArray(properties.part)) {
      const rows = properties.part.map(pp => {
        const n = pp.part && pp.part.find(x => x.name === 'code')?.valueString;
        const v = pp.part && pp.part.find(x => x.name === 'value')?.valueString;
        if (n) return html`<div><strong>${n}:</strong> ${v || ''}</div>`;
        return null;
      }).filter(Boolean);
      
      if (rows.length) {
        display.push(html`<div><strong>Properties:</strong>${rows}</div>`);
      }
    }

    if (!display.length) {
      display.push(html`<em>No structured display items found — see raw JSON.</em>`);
    }

    return display;
  }

  return html`
    <div style=${{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header class="topbar">
        <div style=${{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div class="brand">🐙 Octopus</div>
            <small class="muted">v0.3 — FHIR Terminology Browser</small>
          </div>
          <div class="muted" style=${{ fontSize: '0.95rem' }}>${queryInfo}</div>
        </div>
        <div class="top-actions">
          <a href="tree-preact.html" class="btn">Tree View</a>
        </div>
      </header>

      <main style=${{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', flex: '1' }}>
        <section>
          <h2>Lookup a concept</h2>
          <div class="form-row">
            <label class="muted">FHIR Server</label>
            <input 
              value=${fhirBase} 
              onInput=${e => setFhirBase(e.target.value)}
              style=${{ flex: 1 }}
            />
          </div>
          <div class="form-row">
            <label class="muted">Concept ID</label>
            <input 
              value=${conceptId} 
              onInput=${e => setConceptId(e.target.value)}
              onKeyDown=${handleKeyDown}
            />
            <button onClick=${handleLookup} disabled=${loading}>
              ${loading ? 'Loading...' : 'Lookup'}
            </button>
          </div>
          <div class="form-row">
            <label class="muted">System</label>
            <input 
              value=${system} 
              onInput=${e => setSystem(e.target.value)}
              style=${{ flex: 1 }}
            />
          </div>
          <p class="muted">
            The viewer performs a FHIR ${'`$lookup`'} call. CORS and server availability depend on the chosen FHIR endpoint.
          </p>

          ${error && html`<div class="error-box">${error}</div>`}

          ${result && html`
            <div>
              <h3>Result</h3>
              <div><strong>Lookup succeeded</strong> — showing ${Object.keys(result).length} top-level keys</div>
              <div class="result-grid">
                <div class="panel">
                  <h4>Raw JSON</h4>
                  <pre class="json">${JSON.stringify(result, null, 2)}</pre>
                </div>
                <div class="panel">
                  <h4>Details</h4>
                  <div>${renderDetails()}</div>
                </div>
              </div>
            </div>
          `}
        </section>
      </main>

      <footer style=${{ textAlign: 'center', padding: '1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <small class="muted">
          🐙 Octopus — Open Clinical Terminology Browser — Licensed under Apache 2.0 & CC-BY 4.0 by OCT
          <br />
          <a href="https://openhealthhub.org/c/oct/58" target="_blank" rel="noopener" style=${{ color: '#6b9bd1', textDecoration: 'none' }}>Contact Us</a>
        </small>
      </footer>
    </div>
  `;
}

render(html`<${OctopusApp} />`, document.getElementById('app'));