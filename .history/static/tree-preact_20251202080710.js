import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const html = htm.bind(h);

const sampleData = {
  name: 'SNOMED CT',
  system: 'http://snomed.info/sct',
  children: [
    {
      name: 'Diseases & Disorders',
      children: [
        { 
          name: 'Cardiovascular Diseases', 
          children: [
            { 
              name: 'Heart Diseases',
              children: [
                { name: 'Myocardial Infarction' },
                { name: 'Coronary Artery Disease' },
                { name: 'Heart Failure' }
              ]
            },
            { 
              name: 'Vascular Diseases',
              children: [
                { name: 'Hypertension' },
                { name: 'Atherosclerosis' },
                { name: 'Deep Vein Thrombosis' }
              ]
            }
          ]
        },
        { 
          name: 'Respiratory Diseases', 
          children: [
            { name: 'Asthma' },
            { name: 'COPD' },
            { name: 'Pneumonia' },
            { name: 'Tuberculosis' }
          ]
        },
        {
          name: 'Neurological Disorders',
          children: [
            { name: 'Stroke' },
            { name: 'Epilepsy' },
            { name: 'Migraine' },
            { name: "Parkinson's Disease" },
            { name: "Alzheimer's Disease" }
          ]
        },
        {
          name: 'Infectious Diseases',
          children: [
            { name: 'Viral Infections', children: [{ name: 'Influenza' }, { name: 'COVID-19' }, { name: 'HIV/AIDS' }] },
            { name: 'Bacterial Infections', children: [{ name: 'Sepsis' }, { name: 'Strep Throat' }] }
          ]
        }
      ]
    },
    { 
      name: 'Procedures',
      children: [
        {
          name: 'Surgical Procedures',
          children: [
            { name: 'Cardiac Surgery', children: [{ name: 'CABG' }, { name: 'Valve Replacement' }] },
            { name: 'Orthopedic Surgery', children: [{ name: 'Hip Replacement' }, { name: 'Knee Arthroscopy' }] }
          ]
        },
        {
          name: 'Diagnostic Procedures',
          children: [
            { name: 'Imaging', children: [{ name: 'X-Ray' }, { name: 'CT Scan' }, { name: 'MRI' }] },
            { name: 'Laboratory Tests', children: [{ name: 'Blood Count' }, { name: 'Metabolic Panel' }] }
          ]
        }
      ]
    },
    {
      name: 'Medications',
      children: [
        { name: 'Analgesics', children: [{ name: 'Acetaminophen' }, { name: 'Ibuprofen' }, { name: 'Morphine' }] },
        { name: 'Antibiotics', children: [{ name: 'Amoxicillin' }, { name: 'Ciprofloxacin' }] },
        { name: 'Cardiovascular Drugs', children: [{ name: 'Beta Blockers' }, { name: 'ACE Inhibitors' }] }
      ]
    },
    {
      name: 'Anatomical Structures',
      children: [
        { 
          name: 'Body Systems',
          children: [
            { name: 'Cardiovascular System', children: [{ name: 'Heart' }, { name: 'Blood Vessels' }] },
            { name: 'Respiratory System', children: [{ name: 'Lungs' }, { name: 'Trachea' }] },
            { name: 'Nervous System', children: [{ name: 'Brain' }, { name: 'Spinal Cord' }] }
          ]
        }
      ]
    },
    {
      name: 'Observations',
      children: [
        { name: 'Vital Signs', children: [{ name: 'Blood Pressure' }, { name: 'Heart Rate' }, { name: 'Temperature' }, { name: 'Oxygen Saturation' }] },
        { name: 'Symptoms', children: [{ name: 'Pain' }, { name: 'Fever' }, { name: 'Fatigue' }, { name: 'Nausea' }] }
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
    
    return () => window.removeEventListener('resize', handleResize);
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
    <div>
      <svg 
        viewBox="0 0 ${viewWidth} ${viewHeight}"
        style=${{ width: '100%', height: '72vh', transition: 'all 0.3s ease' }}
      >
        <g transform="translate(${margin.left}, ${Math.abs(minX) + margin.top}) scale(${zoomLevel})">
          ${links.map((l, i) => {
            const source = [l.source.y, l.source.x];
            const target = [l.target.y, l.target.x];
            const path = d3.linkHorizontal().x(d => d[0]).y(d => d[1])({ source, target });
            return html`<path key=${i} class="link" d=${path} style=${{ transition: 'all 0.3s ease' }}></path>`;
          })}

          ${nodes.map((n, i) => {
            const cls = n.children || n.data.children ? 'node--internal' : (n.data._children ? 'node--collapsed' : '');
            return html`
              <g 
                key=${i}
                class="node ${cls}" 
                transform="translate(${n.y},${n.x})" 
                onClick=${() => handleToggle(n)} 
                style=${{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                <circle r="8"></circle>
                <text dx="12" dy="4">${n.data.name}</text>
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
            <div class="brand">🐙 Universal Octopus Viewer</div>
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
          🐙 Universal Octopus Viewer — Clinical Terminology Tree Browser — Licensed under Apache 2.0 & CC-BY 4.0 by OCT
          <br />
          <a href="https://openhealthhub.org/c/oct/58" target="_blank" rel="noopener" style=${{ color: '#6b9bd1', textDecoration: 'none' }}>Contact Us</a>
        </small>
      </footer>
    </div>
  `;
}

render(html`<${App} />`, document.getElementById('app'));