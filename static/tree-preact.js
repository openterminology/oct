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

function traverse(node, fn) {
  fn(node);
  if (node.children) node.children.forEach(n => traverse(n, fn));
  if (node._children) node._children.forEach(n => traverse(n, fn));
}

function collapseAll(data) {
  traverse(data, d => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
  });
}

function expandAll(data) {
  traverse(data, d => {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  });
}

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

function App() {
  return html`<div>${html`<${Tree} data=${structuredClone(sampleData)} />`}</div>`;
}

render(html`<${App} />`, document.getElementById('app'));
