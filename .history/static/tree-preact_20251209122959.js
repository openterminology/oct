import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const html = htm.bind(h);

const sampleData = {
  name: 'SNOMED CT',
  code: '138875005',
  system: 'http://snomed.info/sct',
  children: [
    {
      name: 'Diseases & Disorders',
      code: '64572001',
      children: [
        { 
          name: 'Cardiovascular Diseases',
          code: '49601007',
          children: [
            { 
              name: 'Heart Diseases',
              code: '56265001',
              children: [
                { name: 'Myocardial Infarction', code: '22298006' },
                { name: 'Coronary Artery Disease', code: '53741008' },
                { name: 'Heart Failure', code: '84114007' }
              ]
            },
            { 
              name: 'Vascular Diseases',
              code: '27550009',
              children: [
                { name: 'Hypertension', code: '38341003' },
                { name: 'Atherosclerosis', code: '38716007' },
                { name: 'Deep Vein Thrombosis', code: '132281000119108' }
              ]
            }
          ]
        },
        { 
          name: 'Respiratory Diseases',
          code: '50043002',
          children: [
            { name: 'Asthma', code: '195967001' },
            { name: 'COPD', code: '13645005' },
            { name: 'Pneumonia', code: '233604007' },
            { name: 'Tuberculosis', code: '56717001' }
          ]
        },
        {
          name: 'Neurological Disorders',
          code: '118940003',
          children: [
            { name: 'Stroke', code: '230690007' },
            { name: 'Epilepsy', code: '84757009' },
            { name: 'Migraine', code: '37796009' },
            { name: "Parkinson's Disease", code: '49049000' },
            { name: "Alzheimer's Disease", code: '26929004' }
          ]
        },
        {
          name: 'Infectious Diseases',
          code: '40733004',
          children: [
            { name: 'Viral Infections', code: '34014006', children: [{ name: 'Influenza', code: '6142004' }, { name: 'COVID-19', code: '840539006' }, { name: 'HIV/AIDS', code: '86406008' }] },
            { name: 'Bacterial Infections', code: '301811001', children: [{ name: 'Sepsis', code: '91302008' }, { name: 'Strep Throat', code: '43878008' }] }
          ]
        }
      ]
    },
    { 
      name: 'Procedures',
      code: '71388002',
      children: [
        {
          name: 'Surgical Procedures',
          code: '387713003',
          children: [
            { name: 'Cardiac Surgery', code: '64915003', children: [{ name: 'CABG', code: '232717009' }, { name: 'Valve Replacement', code: '257903006' }] },
            { name: 'Orthopedic Surgery', code: '84138008', children: [{ name: 'Hip Replacement', code: '52734007' }, { name: 'Knee Arthroscopy', code: '179344006' }] }
          ]
        },
        {
          name: 'Diagnostic Procedures',
          code: '103693007',
          children: [
            { name: 'Imaging', code: '363679005', children: [{ name: 'X-Ray', code: '168537006' }, { name: 'CT Scan', code: '77477000' }, { name: 'MRI', code: '113091000' }] },
            { name: 'Laboratory Tests', code: '269814003', children: [{ name: 'Blood Count', code: '26604007' }, { name: 'Metabolic Panel', code: '166312007' }] }
          ]
        }
      ]
    },
    {
      name: 'Medications',
      code: '410942007',
      children: [
        { name: 'Analgesics', code: '373265006', children: [{ name: 'Acetaminophen', code: '387517004' }, { name: 'Ibuprofen', code: '387207008' }, { name: 'Morphine', code: '373529000' }] },
        { name: 'Antibiotics', code: '255631004', children: [{ name: 'Amoxicillin', code: '372687004' }, { name: 'Ciprofloxacin', code: '387048002' }] },
        { name: 'Cardiovascular Drugs', code: '373254001', children: [{ name: 'Beta Blockers', code: '373254001' }, { name: 'ACE Inhibitors', code: '372733002' }] }
      ]
    },
    {
      name: 'Anatomical Structures',
      code: '91723000',
      children: [
        { 
          name: 'Body Systems',
          code: '123037004',
          children: [
            { name: 'Cardiovascular System', code: '113257007', children: [{ name: 'Heart', code: '80891009' }, { name: 'Blood Vessels', code: '59820001' }] },
            { name: 'Respiratory System', code: '20139000', children: [{ name: 'Lungs', code: '39607008' }, { name: 'Trachea', code: '44567001' }] },
            { name: 'Nervous System', code: '25087005', children: [{ name: 'Brain', code: '12738006' }, { name: 'Spinal Cord', code: '2748008' }] }
          ]
        }
      ]
    },
    {
      name: 'Observations',
      code: '363787002',
      children: [
        { name: 'Vital Signs', code: '118227000', children: [{ name: 'Blood Pressure', code: '75367002' }, { name: 'Heart Rate', code: '364075005' }, { name: 'Temperature', code: '386725007' }, { name: 'Oxygen Saturation', code: '431314004' }] },
        { name: 'Symptoms', code: '418799008', children: [{ name: 'Pain', code: '22253000' }, { name: 'Fever', code: '386661006' }, { name: 'Fatigue', code: '84229001' }, { name: 'Nausea', code: '422587007' }] }
      ]
    }
  ]
};

/**
 * Perform a pre-order traversal of a tree, invoking a callback for each visited node.
 *
 * Traversal visits the provided node before its children and covers both `children` and `_children` branches.
 * @param {Object} node - The tree node to start traversal from; may contain `children` and/or `_children` arrays.
 * @param {function(Object): void} fn - Callback invoked for each visited node with the node as its sole argument.
 */
function traverse(node, fn) {
  fn(node);
  if (node.children) node.children.forEach(n => traverse(n, fn));
  if (node._children) node._children.forEach(n => traverse(n, fn));
}

/**
 * Collapse every expanded node in a hierarchical tree by moving its `children` to `_children`.
 *
 * Mutates the provided tree in-place: for each node that has a `children` array, that array is moved
 * to the node's `_children` property and `children` is set to `null`, effectively marking the node as collapsed.
 *
 * @param {Object} data - Root node of the hierarchical tree to collapse. Nodes are expected to use `children`/`_children` to represent expanded/collapsed state.
 */
function collapseAll(data) {
  traverse(data, d => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
  });
}

/**
 * Expand every collapsed node in a hierarchical tree by restoring stored children.
 *
 * Traverses the tree rooted at `data` and, for any node that has `_children`,
 * moves them to `children` and clears `_children`, mutating the tree in place.
 *
 * @param {Object} data - Root of the hierarchical tree (nodes may contain `children` and `_children`).
 */
function expandAll(data) {
  traverse(data, d => {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  });
}

/**
 * Render an interactive collapsible tree visualization as an SVG with dynamic layout.
 *
 * The component displays hierarchical `data` as a D3 layout and lets users
 * toggle nodes by clicking them. Features dynamic resizing, smooth transitions,
 * and automatic layout adjustment. Global controls with IDs "expandAll" and
 * "collapseAll" will expand or collapse the entire tree.
 *
 * @param {Object} props
 * @param {Object} props.data - Root of the hierarchical data. Each node should have a `name` property and may have `children` (expanded) or `_children` (collapsed).
 * @param {number} [props.width=960] - Minimum SVG width; the viewBox may expand to fit the tree.
 * @param {number} [props.height=600] - Minimum SVG height; the viewBox may expand to fit the tree.
 * @returns {HTMLElement} An HTM/Preact element containing the SVG tree.
 */
function Tree({ data, width = 960, height = 600 }) {
  const [treeData, setTreeData] = useState(data);
  const [version, setVersion] = useState(0); // force re-render after mutating treeData
  const [dimensions, setDimensions] = useState({ width, height });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tooltip, setTooltip] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Dynamic resize handling
    const handleResize = () => {
      setDimensions({
        width: Math.max(960, window.innerWidth - 40),
        height: Math.max(600, window.innerHeight * 0.72)
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // attach global controls
    const eBtn = document.getElementById('expandAll');
    const cBtn = document.getElementById('collapseAll');
    if (eBtn) eBtn.onclick = () => { expandAll(treeData); setVersion(v => v + 1); };
    if (cBtn) cBtn.onclick = () => { collapseAll(treeData); setVersion(v => v + 1); };
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (eBtn) eBtn.onclick = null;
      if (cBtn) cBtn.onclick = null;
    };
  }, [treeData]);

  // compute layout with dynamic spacing
  const root = d3.hierarchy(treeData);
  const nodeSpacing = 50; // vertical spacing between nodes
  const levelSpacing = 180; // horizontal spacing between levels
  const treeLayout = d3.tree().nodeSize([nodeSpacing, levelSpacing]);
  treeLayout(root);

  const nodes = root.descendants();
  const links = root.links();

  function handleToggle(d) {
    // d is a d3 node (has .data)
    if (d.data.children) {
      d.data._children = d.data.children;
      d.data.children = null;
    } else if (d.data._children) {
      d.data.children = d.data._children;
      d.data._children = null;
    }
    setVersion(v => v + 1);
  }
  
  function handleMouseEnter(d, e) {
    if (d.data.code) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        data: d.data,
        x: rect.right + 10,
        y: rect.top
      });
    }
  }
  
  function handleMouseLeave() {
    setTooltip(null);
  }
  
  function handleMouseDown(e) {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  }
  
  function handleMouseMove(e) {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }
  
  function handleMouseUp() {
    setIsPanning(false);
  }

  // Dynamic layout calculations
  const minX = d3.min(nodes, n => n.x);
  const maxX = d3.max(nodes, n => n.x);
  const minY = d3.min(nodes, n => n.y);
  const maxY = d3.max(nodes, n => n.y);

  const margin = { top: 40, left: 40, right: 100, bottom: 40 };
  const viewWidth = Math.max(dimensions.width, maxY - minY + margin.left + margin.right + 200);
  const viewHeight = Math.max(dimensions.height, maxX - minX + margin.top + margin.bottom + 100);

  const zoomIn = () => setZoomLevel(z => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoomLevel(z => Math.max(z - 0.25, 0.5));

  return html`
    <div style=${{ position: 'relative' }}>
      <svg 
        viewBox="0 0 ${viewWidth} ${viewHeight}"
        style=${{ width: '100%', height: '72vh', transition: 'all 0.3s ease', cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown=${handleMouseDown}
        onMouseMove=${handleMouseMove}
        onMouseUp=${handleMouseUp}
        onMouseLeave=${handleMouseUp}
      >
        <g transform="translate(${margin.left + panOffset.x}, ${Math.abs(minX) + margin.top + panOffset.y}) scale(${zoomLevel})">
          ${links.map((l, i) => {
            const source = [l.source.y, l.source.x];
            const target = [l.target.y, l.target.x];
            const path = d3.linkHorizontal().x(d => d[0]).y(d => d[1])({ source, target });
            return html`<path key=${i} class="link" d=${path} style=${{ transition: 'all 0.3s ease' }}></path>`;
          })}

          ${nodes.map((n, i) => {
            const cls = n.children || n.data.children ? 'node--internal' : (n.data._children ? 'node--collapsed' : '');
            const hasCode = n.data.code;
            const codeText = hasCode ? n.data.code : '';
            const rectWidth = hasCode ? Math.max(60, codeText.length * 8) : 24;
            const rectHeight = hasCode ? 24 : 16;
            return html`
              <g 
                key=${i}
                class="node ${cls}" 
                transform="translate(${n.y},${n.x})" 
                onClick=${(e) => { if (!isPanning) handleToggle(n); }}
                onMouseEnter=${(e) => handleMouseEnter(n, e)}
                onMouseLeave=${handleMouseLeave}
                style=${{ cursor: isPanning ? 'grabbing' : 'pointer', transition: 'all 0.3s ease' }}
              >
                <rect 
                  x="${-rectWidth / 2}" 
                  y="${-rectHeight / 2}" 
                  width="${rectWidth}" 
                  height="${rectHeight}" 
                  rx="6" 
                  ry="6"
                ></rect>
                ${hasCode && html`
                  <text 
                    dy="4" 
                    text-anchor="middle" 
                    fill="white" 
                    font-size="9" 
                    font-weight="bold"
                    style=${{ pointerEvents: 'none' }}
                  >
                    ${codeText}
                  </text>
                `}
                <text dx="0" dy="${hasCode ? 24 : 4}" text-anchor="middle">${n.data.name}</text>
              </g>
            `;
          })}
        </g>
        
        <!-- Zoom controls inside SVG - bottom right -->
        <g transform="translate(${viewWidth - 120}, ${viewHeight - 60})">
          <g onClick=${zoomIn} style=${{ cursor: 'pointer' }}>
            <rect x="0" y="0" width="50" height="40" fill="#3182bd" rx="4" opacity="0.9" />
            <text x="25" y="26" text-anchor="middle" fill="white" font-size="20" font-weight="bold">+</text>
          </g>
          <g onClick=${zoomOut} style=${{ cursor: 'pointer' }}>
            <rect x="60" y="0" width="50" height="40" fill="#3182bd" rx="4" opacity="0.9" />
            <text x="85" y="26" text-anchor="middle" fill="white" font-size="20" font-weight="bold">−</text>
          </g>
        </g>
      </svg>
      
      ${tooltip && html`
        <div 
          class="code-tooltip"
          style=${{
            position: 'fixed',
            top: `${tooltip.y}px`,
            left: `${tooltip.x}px`,
            background: '#1a1a1a',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            zIndex: 999,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            maxWidth: '250px'
          }}
        >
          <div style=${{ fontWeight: '600', marginBottom: '4px' }}>${tooltip.data.name}</div>
          ${tooltip.data.code && html`
            <div style=${{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a0d8f1' }}>
              Code: ${tooltip.data.code}
            </div>
          `}
        </div>
      `}
    </div>
  `;
}

/**
 * Root application component that renders the Tree component with a cloned sample dataset.
 *
 * The sample data is cloned before being passed to Tree to prevent accidental mutation of the original dataset.
 * @returns {import('preact').VNode} The Preact virtual DOM node for the application.
 */
function App() {
  const [systemName, setSystemName] = useState(sampleData.name);
  const [systemUrl, setSystemUrl] = useState(sampleData.system);
  const [treeData, setTreeData] = useState(() => {
    const cloned = structuredClone(sampleData);
    collapseAll(cloned);
    return cloned;
  });

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const sys = qs.get('system') || '';
    if (sys) {
      setSystemUrl(sys);
      // Map common systems to friendly names
      if (sys === 'http://snomed.info/sct') setSystemName('SNOMED CT');
      else if (sys.includes('loinc')) setSystemName('LOINC');
      else if (sys.includes('icd')) setSystemName('ICD');
      else setSystemName(sys);
    }
  }, []);

  return html`
    <div style=${{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header class="topbar">
        <div style=${{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div class="brand">🐙 Universal OctoViewer</div>
            <small class="muted">v0.3 — Clinical Terminology Tree Browser</small>
          </div>
          <div class="muted" style=${{ fontSize: '0.95rem' }}>
            Code System: <strong>${systemName}</strong> (<code style=${{ fontSize: '0.85rem' }}>${systemUrl}</code>)
          </div>
        </div>
        <nav class="tabs" style=${{ width: 'auto', borderBottom: 'none', marginTop: '0' }}>
          <a href="octopus.html?system=${encodeURIComponent(systemUrl)}" class="tab">Lookup</a>
          <a href="tree-preact.html?system=${encodeURIComponent(systemUrl)}" class="tab active">Tree View</a>
        </nav>
      </header>

      <main style=${{ padding: '1rem', flex: '1' }}>
        <div class="toolbar">
          <button id="expandAll">Expand All</button>
          <button id="collapseAll">Collapse All</button>
        </div>
        <${Tree} data=${treeData} />
      </main>

      <footer style=${{ textAlign: 'center', padding: '1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <small class="muted">
          🐙 Universal OctoViewer — Clinical Terminology Tree Browser — Licensed under Apache 2.0 & CC-BY 4.0 by OCT
          <br />
          <a href="https://openhealthhub.org/c/oct/58" target="_blank" rel="noopener" style=${{ color: '#6b9bd1', textDecoration: 'none' }}>Contact Us</a>
        </small>
      </footer>
    </div>
  `;
}

render(html`<${App} />`, document.getElementById('app'));