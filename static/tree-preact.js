import { h, render } from 'https://unpkg.com/preact@10.11.5?module';
import { useState, useEffect } from 'https://unpkg.com/preact@10.11.5/hooks/dist/hooks.module.js?module';
import htm from 'https://unpkg.com/htm@3.1.1?module';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7?module';

const html = htm.bind(h);

const sampleData = {
  name: 'Life',
  children: [
    {
      name: 'Animals',
      children: [
        { name: 'Mammals', children: [{ name: 'Human' }, { name: 'Dog' }, { name: 'Cat' }] },
        { name: 'Birds', children: [{ name: 'Sparrow' }, { name: 'Eagle' }] }
      ]
    },
    { name: 'Plants', children: [{ name: 'Flowering' }, { name: 'Ferns' }] },
    { name: 'Fungi' }
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
 * Render an interactive collapsible tree visualization as an SVG.
 *
 * The component displays hierarchical `data` as a D3 layout and lets users
 * toggle nodes by clicking them. It also attaches global controls:
 * elements with IDs "expandAll" and "collapseAll" will expand or collapse the
 * entire tree when present in the document.
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

  useEffect(() => {
    // attach global controls
    const eBtn = document.getElementById('expandAll');
    const cBtn = document.getElementById('collapseAll');
    if (eBtn) eBtn.onclick = () => { expandAll(treeData); setVersion(v => v + 1); };
    if (cBtn) cBtn.onclick = () => { collapseAll(treeData); setVersion(v => v + 1); };
  }, [treeData]);

  // compute layout
  const root = d3.hierarchy(treeData);
  const treeLayout = d3.tree().nodeSize([40, 160]);
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

  // center vertically
  const minX = d3.min(nodes, n => n.x);
  const maxX = d3.max(nodes, n => n.x);
  const minY = d3.min(nodes, n => n.y);
  const maxY = d3.max(nodes, n => n.y);

  const margin = { top: 20, left: 20 };
  const viewWidth = Math.max(width, maxY + 120);
  const viewHeight = Math.max(height, maxX - minX + 120);

  return html`
    <div>
      <svg viewBox="0 0 ${viewWidth + margin.left * 2} ${viewHeight + margin.top * 2}">
        <g transform="translate(${margin.left}, ${Math.abs(minX) + margin.top})">
          ${links.map((l) => {
            const source = [l.source.y, l.source.x];
            const target = [l.target.y, l.target.x];
            const path = d3.linkHorizontal().x(d => d[0]).y(d => d[1])({ source, target });
            return html`<path class="link" d=${path}></path>`;
          })}

          ${nodes.map((n) => {
            const cls = n.children || n.data.children ? 'node--internal' : (n.data._children ? 'node--collapsed' : '');
            return html`
              <g class="node ${cls}" transform="translate(${n.y},${n.x})" onClick=${() => handleToggle(n)} style="cursor:pointer">
                <circle r="8"></circle>
                <text dx="12" dy="4">${n.data.name}</text>
              </g>
            `;
          })}
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
  return html`<div>${html`<${Tree} data=${structuredClone(sampleData)} />`}</div>`;
}

render(html`<${App} />`, document.getElementById('app'));