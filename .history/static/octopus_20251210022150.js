import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

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
  const [relationshipView, setRelationshipView] = useState('stated'); // 'stated' or 'inferred'
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'hierarchy'
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const codeSystems = [
    { name: 'SNOMED CT (International)', uri: 'http://snomed.info/sct', exampleCode: '138875005' },
    { name: 'SNOMED CT [🇬🇧 UK Edition]', uri: 'http://snomed.info/sct/83821000000107', exampleCode: '138875005' },
    { name: 'NHS dm+d [🇬🇧 UK]', uri: 'https://dmd.nhs.uk', exampleCode: '329498007' },
    { name: 'ICD-10 (International)', uri: 'http://hl7.org/fhir/sid/icd-10', exampleCode: 'I10' },
    { name: 'ICD-10 [🇯🇵 Japan]', uri: 'http://jpfhir.jp/fhir/core/CodeSystem/JP_DiseaseCode_ICD10_CS', exampleCode: 'I10' },
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
    
    // Save to recent searches
    addRecentSearch(code, sys);
  }
  
  function addRecentSearch(code, systemUri) {
    const systemName = codeSystems.find(cs => cs.uri === systemUri)?.name || systemUri;
    const newSearch = {
      code,
      system: systemUri,
      systemName,
      timestamp: Date.now()
    };
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => !(s.code === code && s.system === systemUri));
      const updated = [newSearch, ...filtered].slice(0, 10); // Keep last 10
      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
    
    // Create implicit ValueSet URL by appending ?fhir_vs to the code system URL
    const valueSetUrl = `${system}?fhir_vs`;
    const params = new URLSearchParams({ 
      url: valueSetUrl,
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
    console.log('handleSearch called, mode:', searchMode);
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

    // Separate properties into stated and inferred relationships
    const statedRels = [];
    const inferredRels = [];
    const otherProps = [];

    params.filter(p => p.name === 'property').forEach(prop => {
      if (!prop.part) return;
      
      const code = prop.part.find(x => x.name === 'code')?.valueCode || prop.part.find(x => x.name === 'code')?.valueString;
      const value = prop.part.find(x => x.name === 'value')?.valueString || 
                    prop.part.find(x => x.name === 'value')?.valueCoding?.display ||
                    prop.part.find(x => x.name === 'value')?.valueCoding?.code;
      const subProp = prop.part.find(x => x.name === 'subproperty');
      
      if (code === 'parent') {
        // Check if it's inferred (computed) relationship
        const isInferred = subProp?.part?.some(sp => 
          sp.name === 'code' && (sp.valueCode === 'inferred' || sp.valueString === 'inferred')
        );
        
        if (isInferred) {
          inferredRels.push({ property: 'Parent (Inferred)', value: value || '-', code });
        } else {
          statedRels.push({ property: 'Parent (Stated)', value: value || '-', code });
        }
      } else {
        otherProps.push({ property: code, value: value || '-' });
      }
    });

    // Add relationships based on current view
    if (relationshipView === 'stated') {
      statedRels.forEach(rel => details.push(rel));
    } else {
      inferredRels.forEach(rel => details.push(rel));
      // If no inferred, show stated as fallback
      if (inferredRels.length === 0) {
        statedRels.forEach(rel => details.push(rel));
      }
    }
    
    // Add other properties
    otherProps.forEach(prop => details.push(prop));

    if (!details.length) {
      return html`<p style=${{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No structured details found — see raw JSON.</p>`;
    }

    return html`
      <table style=${{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
        background: 'white',
        border: '1px solid #e5e7eb'
      }}>
        <thead>
          <tr style=${{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <th style=${{ 
              padding: '8px 12px', 
              textAlign: 'left', 
              fontWeight: '600', 
              color: '#374151',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              width: '28%'
            }}>Property</th>
            <th style=${{ 
              padding: '8px 12px', 
              textAlign: 'left', 
              fontWeight: '600', 
              color: '#374151',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Value</th>
          </tr>
        </thead>
        <tbody>
          ${details.map((d, i) => html`
            <tr key=${i} style=${{ 
              borderBottom: i < details.length - 1 ? '1px solid #f3f4f6' : 'none',
              background: i % 2 === 0 ? 'white' : '#fafafa'
            }}>
              <td style=${{ 
                padding: '10px 12px', 
                fontWeight: '500', 
                color: '#6b7280',
                verticalAlign: 'top',
                fontSize: '0.875rem'
              }}>${d.property}</td>
              <td style=${{ 
                padding: '10px 12px', 
                color: '#111827',
                wordBreak: 'break-word',
                fontSize: '0.875rem'
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
            <div class="brand">🐙Universal OctoViewer</div>
            <small class="muted">v0.3 — FHIR Terminology Browser</small>
          </div>
          <div class="muted" style=${{ fontSize: '0.95rem' }}>${queryInfo}</div>
        </div>
        <nav class="tabs" style=${{ width: 'auto', borderBottom: 'none', marginTop: '0' }}>
          <a href="octopus.html?system=${encodeURIComponent(system)}" class="tab active">Lookup</a>
          <a href="tree-preact.html?system=${encodeURIComponent(system)}" class="tab">Tree View</a>
        </nav>
      </header>

      <div class="layout-container">
        <aside class="left-pane">
          <h3 style=${{ marginTop: 0, fontSize: '1rem', marginBottom: '1rem' }}>Quick Links</h3>
          <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick=${() => {
                setSystem('http://snomed.info/sct');
                setConceptId('138875005');
                setSearchMode('code');
              }}
              style=${{ 
                padding: '0.5rem', 
                background: 'rgba(49, 130, 189, 0.1)', 
                border: '1px solid rgba(49, 130, 189, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textAlign: 'left'
              }}
            >
              SNOMED CT Example
            </button>
            <button 
              onClick=${() => {
                setSystem('http://snomed.info/sct/83821000000107');
                setConceptId('138875005');
                setSearchMode('code');
              }}
              style=${{ 
                padding: '0.5rem', 
                background: 'rgba(49, 130, 189, 0.1)', 
                border: '1px solid rgba(49, 130, 189, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textAlign: 'left'
              }}
            >
              SNOMED CT [🇬🇧 UK]
            </button>
            <button 
              onClick=${() => {
                setSystem('http://hl7.org/fhir/sid/icd-10');
                setConceptId('I10');
                setSearchMode('code');
              }}
              style=${{ 
                padding: '0.5rem', 
                background: 'rgba(49, 130, 189, 0.1)', 
                border: '1px solid rgba(49, 130, 189, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textAlign: 'left'
              }}
            >
              ICD-10 Example
            </button>
            <button 
              onClick=${() => {
                setSystem('http://loinc.org');
                setConceptId('718-7');
                setSearchMode('code');
              }}
              style=${{ 
                padding: '0.5rem', 
                background: 'rgba(49, 130, 189, 0.1)', 
                border: '1px solid rgba(49, 130, 189, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textAlign: 'left'
              }}
            >
              LOINC Example
            </button>
          </div>
          
          <hr style=${{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          
          <h3 style=${{ fontSize: '1rem', marginBottom: '0.75rem' }}>Recent Searches</h3>
          <div style=${{ fontSize: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
            ${recentSearches.length === 0 ? html`
              <p class="muted">No recent searches</p>
            ` : html`
              <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                ${recentSearches.map(search => html`
                  <button
                    key="${search.code}-${search.system}"
                    onClick=${() => {
                      setSystem(search.system);
                      setConceptId(search.code);
                      setSearchMode('code');
                      setTimeout(() => doLookup(fhirBase, search.code, search.system), 100);
                    }}
                    style=${{ 
                      padding: '0.5rem', 
                      background: 'rgba(100, 100, 100, 0.05)', 
                      border: '1px solid rgba(100, 100, 100, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter=${e => {
                      e.currentTarget.style.background = 'rgba(100, 100, 100, 0.1)';
                    }}
                    onMouseLeave=${e => {
                      e.currentTarget.style.background = 'rgba(100, 100, 100, 0.05)';
                    }}
                  >
                    <div style=${{ fontWeight: '500', color: '#333', marginBottom: '2px' }}>${search.code}</div>
                    <div style=${{ color: '#6b7280', fontSize: '0.75rem' }}>${search.systemName}</div>
                  </button>
                `)}
              </div>
            `}
          </div>
        </aside>

        <main class="main-content" style=${{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', flex: '1' }}>
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
              <button onClick=${() => doLookup()} disabled=${loading}>
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
              <h3 style=${{ textAlign: 'center', marginBottom: '1rem' }}>Lookup Results</h3>
              
              <!-- Tabs for Details and Hierarchy -->
              <div style=${{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
                <button 
                  onClick=${() => setActiveTab('details')}
                  style=${{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: activeTab === 'details' ? '#3b82f6' : '#6b7280',
                    border: 'none',
                    borderBottom: activeTab === 'details' ? '3px solid #3b82f6' : '3px solid transparent',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    marginBottom: '-2px'
                  }}
                >
                  Details
                </button>
                ${(system.includes('snomed.info/sct')) && html`
                  <button 
                    onClick=${() => setActiveTab('hierarchy')}
                    style=${{
                      padding: '0.75rem 2rem',
                      background: 'transparent',
                      color: activeTab === 'hierarchy' ? '#3b82f6' : '#6b7280',
                      border: 'none',
                      borderBottom: activeTab === 'hierarchy' ? '3px solid #3b82f6' : '3px solid transparent',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                      marginBottom: '-2px'
                    }}
                  >
                    Hierarchy
                  </button>
                `}
              </div>
              
              ${activeTab === 'details' && html`
                ${(system.includes('snomed.info/sct')) && html`
                  <div style=${{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button 
                      onClick=${() => setRelationshipView('stated')}
                      style=${{
                        padding: '0.5rem 1.5rem',
                        background: relationshipView === 'stated' ? '#3b82f6' : '#f3f4f6',
                        color: relationshipView === 'stated' ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Stated View
                    </button>
                    <button 
                      onClick=${() => setRelationshipView('inferred')}
                      style=${{
                        padding: '0.5rem 1.5rem',
                        background: relationshipView === 'inferred' ? '#3b82f6' : '#f3f4f6',
                        color: relationshipView === 'inferred' ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Inferred View
                    </button>
                  </div>
                `}
              
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div class="panel" style=${{ margin: '0 auto', width: '100%', maxWidth: '800px' }}>
                    <h4 style=${{ textAlign: 'center', marginBottom: '1rem' }}>
                      Concept Details ${(system.includes('snomed.info/sct')) ? `(${relationshipView === 'stated' ? 'Stated' : 'Inferred'})` : ''}
                    </h4>
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
              `}
              
              ${activeTab === 'hierarchy' && html`
                <div style=${{ margin: '0 auto', width: '100%', maxWidth: '1200px', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <p style=${{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '1rem' }}>
                    🌳 Hierarchy visualization coming soon!<br/>
                    <small style=${{ color: '#9ca3af' }}>This will display the concept's position in the SNOMED CT hierarchy</small>
                  </p>
                </div>
              `}
            </div>
          `}
        </section>
      </main>
      </div>

      <footer style=${{ textAlign: 'center', padding: '1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <small class="muted">
          🐙 Universal OctoViewer— Open Clinical Terminology Browser — Licensed under Apache 2.0 & CC-BY 4.0 by OCT
          <br />
          <a href="https://openhealthhub.org/c/oct/58" target="_blank" rel="noopener" style=${{ color: '#6b9bd1', textDecoration: 'none' }}>Contact Us</a>
        </small>
      </footer>
    </div>
  `;
}

render(html`<${OctopusApp} />`, document.getElementById('app'));