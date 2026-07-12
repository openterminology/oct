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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('code'); // 'code' or 'term'
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [queryInfo, setQueryInfo] = useState('');

  const codeSystems = [
    { name: 'SNOMED CT', uri: 'http://snomed.info/sct', exampleCode: '138875005' },
    { name: 'ICD-10', uri: 'http://hl7.org/fhir/sid/icd-10', exampleCode: 'I10' },
    { name: 'LOINC', uri: 'http://loinc.org', exampleCode: '718-7' },
    { name: 'RxNorm', uri: 'http://www.nlm.nih.gov/research/umls/rxnorm', exampleCode: '313782' }
  ];

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

  async function doTermSearch(term = searchTerm) {
    if (!fhirBase || !term) {
      setError('Please provide FHIR server and search term');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults(null);
    setResult(null);

    const base = fhirBase.replace(/\/+$/, '');
    const params = new URLSearchParams({ 
      url: system,
      filter: term,
      count: '20'
    });

    try {
      const url = `${base}/ValueSet/$expand?${params}`;
      console.log('Searching:', url);
      const r = await fetch(url, { headers: { Accept: 'application/fhir+json,application/json' } });
      
      if (!r.ok) {
        setError(`Search failed: ${r.status} ${r.statusText}`);
        setLoading(false);
        return;
      }

      const res = await r.json();
      console.log('Search response:', res);
      
      if (res.expansion && res.expansion.contains) {
        setSearchResults(res.expansion.contains);
        setError('');
      } else {
        setSearchResults([]);
        setError('No results found');
      }
    } catch (e) {
      setError(`Search failed: ${e.message}`);
      setSearchResults(null);
    }

    setLoading(false);
  }

  function handleSearch() {
    if (searchMode === 'code') {
      doLookup();
    } else {
      doTermSearch();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }
  
  function handleSelectSearchResult(code) {
    setConceptId(code);
    setSearchMode('code');
    setSearchResults(null);
    setTimeout(() => doLookup(fhirBase, code, system), 100);
  }
  
  function handleSystemChange(uri) {
    setSystem(uri);
    const selected = codeSystems.find(cs => cs.uri === uri);
    if (selected) {
      setConceptId(selected.exampleCode);
    }
  }

  function renderDetails() {
    if (!result) return null;

    const params = result.parameter || [];
    const details = [];

    if (Array.isArray(params) && params.length) {
      const fsn = params.find(p => p.name === 'display') || params.find(p => p.name === 'name');
      const designations = params.filter(p => p.name === 'designation');
      
      if (fsn && fsn.valueString) {
        details.push({ property: 'Display Name', value: fsn.valueString });
      }
      
      if (designations.length) {
        designations.forEach((d, idx) => {
          try {
            const val = d.part ? d.part.find(p => p.name === 'value') : null;
            const use = d.part ? d.part.find(p => p.name === 'use') : null;
            const lang = d.part ? d.part.find(p => p.name === 'language') : null;
            
            let label = `Designation ${idx + 1}`;
            if (use?.valueCoding?.display) label = use.valueCoding.display;
            
            const valueText = val?.valueString || JSON.stringify(d);
            const extra = lang?.valueCode ? ` (${lang.valueCode})` : '';
            
            details.push({ property: label, value: valueText + extra });
          } catch(e) {
            details.push({ property: `Designation ${idx + 1}`, value: JSON.stringify(d) });
          }
        });
      }
    }

    const properties = params.find(p => p.name === 'property');
    if (properties && Array.isArray(properties.part)) {
      properties.part.forEach(pp => {
        const n = pp.part && pp.part.find(x => x.name === 'code')?.valueString;
        const v = pp.part && pp.part.find(x => x.name === 'value')?.valueString;
        if (n) {
          details.push({ property: n, value: v || '-' });
        }
      });
    }

    if (!details.length) {
      return html`<p style=${{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No structured details found — see raw JSON.</p>`;
    }

    return html`
      <table style=${{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        marginTop: '1rem',
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <thead>
          <tr style=${{ background: '#f7f7f7', borderBottom: '2px solid #e6e6e6' }}>
            <th style=${{ 
              padding: '12px', 
              textAlign: 'left', 
              fontWeight: '600', 
              color: '#0b1220',
              width: '30%'
            }}>Property</th>
            <th style=${{ 
              padding: '12px', 
              textAlign: 'left', 
              fontWeight: '600', 
              color: '#0b1220' 
            }}>Value</th>
          </tr>
        </thead>
        <tbody>
          ${details.map((d, i) => html`
            <tr key=${i} style=${{ borderBottom: i < details.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style=${{ 
                padding: '12px', 
                fontWeight: '500', 
                color: '#6b7280',
                verticalAlign: 'top'
              }}>${d.property}</td>
              <td style=${{ 
                padding: '12px', 
                color: '#0b1220',
                wordBreak: 'break-word'
              }}>${d.value}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  return html`
    <div style=${{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header class="topbar">
        <div style=${{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div class="brand">🐙Universal Octopus Viewer</div>
            <small class="muted">v0.3 — FHIR Terminology Browser</small>
          </div>
          <div class="muted" style=${{ fontSize: '0.95rem' }}>${queryInfo}</div>
        </div>
        <nav class="tabs" style=${{ width: 'auto', borderBottom: 'none', marginTop: '0' }}>
          <a href="octopus.html?system=${encodeURIComponent(system)}" class="tab active">Lookup</a>
          <a href="tree-preact.html?system=${encodeURIComponent(system)}" class="tab">Tree View</a>
        </nav>
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
            <label class="muted">Search Mode</label>
            <div style=${{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
              <label style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked=${searchMode === 'code'} 
                  onChange=${() => setSearchMode('code')}
                />
                <span>By Code</span>
              </label>
              <label style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked=${searchMode === 'term'} 
                  onChange=${() => setSearchMode('term')}
                />
                <span>By Term</span>
              </label>
            </div>
          </div>
          ${searchMode === 'code' ? html`
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
          ` : html`
            <div class="form-row">
              <label class="muted">Search Term</label>
              <input 
                value=${searchTerm} 
                onInput=${e => setSearchTerm(e.target.value)}
                onKeyDown=${handleKeyDown}
                placeholder="e.g., diabetes"
              />
              <button onClick=${handleSearch} disabled=${loading}>
                ${loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          `}
          <div class="form-row">
            <label class="muted">Code System</label>
            <select 
              value=${system}
              onChange=${e => handleSystemChange(e.target.value)}
              style=${{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e6e6e6', background: '#fff', color: '#0b1220' }}
            >
              ${codeSystems.map(cs => html`
                <option value=${cs.uri}>${cs.name}</option>
              `)}
            </select>
          </div>
          <div class="form-row">
            <label class="muted">System URI</label>
            <input 
              value=${system} 
              onInput=${e => setSystem(e.target.value)}
              style=${{ flex: 1, fontSize: '0.85rem', fontFamily: 'monospace' }}
            />
          </div>
          <p class="muted">
            The viewer performs a FHIR ${'`$lookup`'} call. CORS and server availability depend on the chosen FHIR endpoint.
          </p>

          ${searchResults && searchResults.length > 0 && html`
            <div style=${{ marginTop: '1.5rem', padding: '1rem', background: '#f7f7f7', borderRadius: '6px', maxWidth: '800px', margin: '1.5rem auto 0 auto' }}>
              <h4 style=${{ marginBottom: '0.75rem', color: '#0b1220' }}>Search Results (${searchResults.length})</h4>
              <ul style=${{ listStyle: 'none', padding: 0, margin: 0 }}>
                ${searchResults.map(r => html`
                  <li 
                    key=${r.code}
                    onClick=${() => handleSelectSearchResult(r.code)}
                    style=${{ 
                      padding: '0.75rem', 
                      marginBottom: '0.5rem', 
                      background: '#fff', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #e6e6e6',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter=${e => {
                      e.currentTarget.style.background = '#f0f7ff';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave=${e => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#e6e6e6';
                    }}
                  >
                    <div style=${{ fontWeight: '600', color: '#0b1220', marginBottom: '0.25rem' }}>
                      ${r.display}
                    </div>
                    <div style=${{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                      Code: ${r.code}
                    </div>
                  </li>
                `)}
              </ul>
            </div>
          `}

          ${error && html`<div class="error-box">${error}</div>`}

          ${result && html`
            <div style=${{ marginTop: '2rem' }}>
              <h3 style=${{ textAlign: 'center', marginBottom: '1.5rem' }}>Lookup Results</h3>
              
              <div style=${{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div class="panel" style=${{ margin: '0 auto', width: '100%', maxWidth: '800px' }}>
                  <h4 style=${{ textAlign: 'center', marginBottom: '1rem' }}>Concept Details</h4>
                  ${renderDetails()}
                </div>
                
                <details style=${{ margin: '0 auto', width: '100%', maxWidth: '800px' }}>
                  <summary style=${{ 
                    cursor: 'pointer', 
                    padding: '12px', 
                    background: '#f7f7f7', 
                    borderRadius: '6px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>View Raw JSON Response</summary>
                  <div class="panel" style=${{ marginTop: '1rem' }}>
                    <pre class="json" style=${{ 
                      maxHeight: '400px', 
                      overflow: 'auto',
                      fontSize: '0.85rem'
                    }}>${JSON.stringify(result, null, 2)}</pre>
                  </div>
                </details>
              </div>
            </div>
          `}
        </section>
      </main>

      <footer style=${{ textAlign: 'center', padding: '1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <small class="muted">
          🐙 Universal Octopus Viewer— Open Clinical Terminology Browser — Licensed under Apache 2.0 & CC-BY 4.0 by OCT
          <br />
          <a href="https://openhealthhub.org/c/oct/58" target="_blank" rel="noopener" style=${{ color: '#6b9bd1', textDecoration: 'none' }}>Contact Us</a>
        </small>
      </footer>
    </div>
  `;
}

render(html`<${OctopusApp} />`, document.getElementById('app'));