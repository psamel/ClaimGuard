import React, { useState, useEffect, useRef, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  Info, 
  Compass, 
  Layers, 
  Route, 
  X,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';

const NODE_STYLES = {
  claim: { color: '#0284c7', shape: 'ellipse', label: 'Claim' },
  customer: { color: '#8b5cf6', shape: 'round-rectangle', label: 'Customer' },
  vehicle: { color: '#f59e0b', shape: 'diamond', label: 'Vehicle' },
  incident: { color: '#ef4444', shape: 'pentagon', label: 'Incident' },
  garage: { color: '#10b981', shape: 'hexagon', label: 'Garage' },
  invoice: { color: '#06b6d4', shape: 'tag', label: 'Invoice' },
};

export default function NetworkGraph({ 
  graphData, 
  onSelectClaim, 
  initialSelectedNodeId,
  theme = 'light'
}) {
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  
  const isDark = theme === 'dark';

  // Filter checkboxes for entity types
  const [visibleTypes, setVisibleTypes] = useState({
    claim: true,
    customer: true,
    vehicle: true,
    incident: true,
    garage: true,
    invoice: true,
  });

  // Algorithm panel modes: 'none' | 'bfs' | 'dfs' | 'path' | 'components'
  const [algoMode, setAlgoMode] = useState('none');
  const [algoResult, setAlgoResult] = useState(null);
  const [algoLoading, setAlgoLoading] = useState(false);
  
  // Path finder states
  const [pathSource, setPathSource] = useState('');
  const [pathTarget, setPathTarget] = useState('');

  // Connected components state
  const [componentsList, setComponentsList] = useState([]);

  // Cytoscape stylesheet adapted for theme
  const stylesheet = useMemo(() => [
    {
      selector: 'node',
      style: {
        'label': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#ffffff',
        'font-size': '11px',
        'font-weight': 'bold',
        'font-family': 'sans-serif',
        'text-outline-width': 2,
        'text-outline-color': isDark ? '#020617' : '#0f172a',
        'width': 44,
        'height': 44,
        'border-width': 2,
        'border-color': isDark ? '#1a253c' : '#ffffff',
        'transition-property': 'background-color, line-color, target-arrow-color, opacity, border-width, border-color',
        'transition-duration': '0.2s',
      },
    },
    {
      selector: 'node[type = "claim"]',
      style: {
        'background-color': '#0284c7',
        'shape': 'ellipse',
        'width': 50,
        'height': 50,
      },
    },
    {
      selector: 'node[type = "customer"]',
      style: {
        'background-color': '#8b5cf6',
        'shape': 'round-rectangle',
        'width': 48,
        'height': 38,
      },
    },
    {
      selector: 'node[type = "vehicle"]',
      style: {
        'background-color': '#f59e0b',
        'shape': 'diamond',
        'width': 42,
        'height': 42,
      },
    },
    {
      selector: 'node[type = "incident"]',
      style: {
        'background-color': '#ef4444',
        'shape': 'pentagon',
        'width': 44,
        'height': 44,
      },
    },
    {
      selector: 'node[type = "garage"]',
      style: {
        'background-color': '#10b981',
        'shape': 'hexagon',
        'width': 46,
        'height': 46,
      },
    },
    {
      selector: 'node[type = "invoice"]',
      style: {
        'background-color': '#06b6d4',
        'shape': 'tag',
        'width': 40,
        'height': 34,
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': isDark ? '#334155' : '#cbd5e1',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '8px',
        'color': isDark ? '#94a3b8' : '#64748b',
        'text-rotation': 'autorotate',
        'text-background-opacity': 0.85,
        'text-background-color': isDark ? '#0f172a' : '#ffffff',
        'text-background-padding': '2px',
        'transition-property': 'line-color, width, opacity',
        'transition-duration': '0.2s',
      },
    },
    {
      selector: '.highlighted',
      style: {
        'border-width': 4,
        'border-color': '#f43f5e',
        'underlay-color': '#fda4af',
        'underlay-padding': '6px',
        'underlay-opacity': 0.5,
        'z-index': 999,
      },
    },
    {
      selector: '.path-highlight',
      style: {
        'background-color': '#ec4899',
        'border-width': 4,
        'border-color': '#be185d',
        'z-index': 999,
      },
    },
    {
      selector: 'edge.highlighted',
      style: {
        'width': 4,
        'line-color': '#f43f5e',
        'z-index': 998,
      },
    },
    {
      selector: 'edge.path-highlight',
      style: {
        'width': 4,
        'line-color': '#ec4899',
        'z-index': 998,
      },
    },
    {
      selector: '.dimmed',
      style: {
        'opacity': isDark ? 0.12 : 0.15,
      },
    },
  ], [isDark]);

  // Filter elements by visible entity types
  const filteredElements = useMemo(() => {
    if (!graphData || !graphData.elements) return [];
    
    // Nodes visible based on toggle
    const visibleNodeIds = new Set();
    const visibleNodes = [];

    graphData.elements.forEach((el) => {
      if (el.data.source === undefined) {
        // Node
        const type = el.data.type || 'claim';
        if (visibleTypes[type]) {
          visibleNodeIds.add(el.data.id);
          visibleNodes.push(el);
        }
      }
    });

    // Edges where both source & target nodes are visible
    const visibleEdges = [];
    graphData.elements.forEach((el) => {
      if (el.data.source !== undefined) {
        if (visibleNodeIds.has(el.data.source) && visibleNodeIds.has(el.data.target)) {
          visibleEdges.push(el);
        }
      }
    });

    return [...visibleNodes, ...visibleEdges];
  }, [graphData, visibleTypes]);

  // Layout configuration
  const layout = {
    name: 'cose',
    animate: false,
    fit: true,
    padding: 40,
    nodeRepulsion: 8000,
    idealEdgeLength: 60,
    edgeElasticity: 100,
    gravity: 80,
    numIter: 1000,
  };

  const resetHighlights = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('highlighted dimmed path-highlight');
  };

  const highlightNodeAndNeighbors = (node) => {
    const cy = cyRef.current;
    if (!cy) return;

    resetHighlights();
    const neighborhood = node.neighborhood().add(node);
    cy.elements().difference(neighborhood).addClass('dimmed');
    node.addClass('highlighted');
    neighborhood.edges().addClass('highlighted');
    neighborhood.nodes().addClass('highlighted');
  };

  const focusOnNode = (nodeId) => {
    const cy = cyRef.current;
    if (!cy) return;
    const targetNode = cy.getElementById(nodeId);
    if (targetNode.length > 0) {
      highlightNodeAndNeighbors(targetNode);
      setSelectedNode(targetNode.data());
      cy.animate({
        center: { eles: targetNode },
        zoom: 1.4,
        duration: 400,
      });
      setSearchError('');
    } else {
      setSearchError(`Node '${nodeId}' is not visible or doesn't exist.`);
    }
  };

  // Setup click listeners and initial selection
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleTap = (event) => {
      if (event.target === cy) {
        // Clicked background: reset highlights
        resetHighlights();
        setSelectedNode(null);
      } else if (event.target.isNode()) {
        const node = event.target;
        highlightNodeAndNeighbors(node);
        setSelectedNode(node.data());
      }
    };

    cy.on('tap', handleTap);

    return () => {
      cy.off('tap', handleTap);
    };
  }, []);

  // Handle external initialSelectedNodeId
  useEffect(() => {
    if (initialSelectedNodeId && cyRef.current) {
      focusOnNode(initialSelectedNodeId);
    }
  }, [initialSelectedNodeId]);

  // Zoom controls
  const handleZoomIn = () => {
    const cy = cyRef.current;
    if (cy) cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  const handleZoomOut = () => {
    const cy = cyRef.current;
    if (cy) cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  const handleFit = () => {
    const cy = cyRef.current;
    if (cy) {
      resetHighlights();
      cy.fit(null, 30);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    focusOnNode(searchQuery.trim().toUpperCase());
  };

  // Toggle filter
  const toggleType = (type) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Run BFS
  const handleRunBFS = async () => {
    if (!selectedNode) return;
    setAlgoLoading(true);
    setAlgoMode('bfs');
    try {
      const res = await api.runBFS(selectedNode.id);
      setAlgoResult(res);
      // Highlight BFS traversal on graph
      const cy = cyRef.current;
      if (cy) {
        resetHighlights();
        cy.elements().addClass('dimmed');
        res.traversal_order.forEach((nid) => {
          cy.getElementById(nid).removeClass('dimmed').addClass('path-highlight');
        });
      }
    } catch (err) {
      alert(`BFS Error: ${err.message}`);
    } finally {
      setAlgoLoading(false);
    }
  };

  // Run DFS
  const handleRunDFS = async () => {
    if (!selectedNode) return;
    setAlgoLoading(true);
    setAlgoMode('dfs');
    try {
      const res = await api.runDFS(selectedNode.id);
      setAlgoResult(res);
      // Highlight DFS traversal on graph
      const cy = cyRef.current;
      if (cy) {
        resetHighlights();
        cy.elements().addClass('dimmed');
        res.traversal_order.forEach((nid) => {
          cy.getElementById(nid).removeClass('dimmed').addClass('path-highlight');
        });
      }
    } catch (err) {
      alert(`DFS Error: ${err.message}`);
    } finally {
      setAlgoLoading(false);
    }
  };

  // Find Path between Source and Target
  const handleFindPath = async (e) => {
    e?.preventDefault();
    if (!pathSource || !pathTarget) return;
    setAlgoLoading(true);
    setAlgoMode('path');
    try {
      const res = await api.findPath(pathSource.trim().toUpperCase(), pathTarget.trim().toUpperCase());
      setAlgoResult(res);

      const cy = cyRef.current;
      if (cy && res.found) {
        resetHighlights();
        cy.elements().addClass('dimmed');

        // Highlight nodes in path
        res.path.forEach((nid) => {
          cy.getElementById(nid).removeClass('dimmed').addClass('path-highlight');
        });

        // Highlight edges between consecutive nodes
        for (let i = 0; i < res.path.length - 1; i++) {
          const u = res.path[i];
          const v = res.path[i + 1];
          cy.edges(`[source = "${u}"][target = "${v}"], [source = "${v}"][target = "${u}"]`)
            .removeClass('dimmed')
            .addClass('path-highlight');
        }
      }
    } catch (err) {
      alert(`Path Error: ${err.message}`);
    } finally {
      setAlgoLoading(false);
    }
  };

  // Load Connected Components
  const handleLoadComponents = async () => {
    setAlgoLoading(true);
    setAlgoMode('components');
    try {
      const res = await api.getComponents();
      setComponentsList(res.components || []);
      setAlgoResult(res);
    } catch (err) {
      alert(`Components Error: ${err.message}`);
    } finally {
      setAlgoLoading(false);
    }
  };

  const highlightComponent = (comp) => {
    const cy = cyRef.current;
    if (!cy) return;
    resetHighlights();
    cy.elements().addClass('dimmed');
    comp.nodes.forEach((nid) => {
      cy.getElementById(nid).removeClass('dimmed').addClass('highlighted');
    });
    // highlight internal edges
    const compNodeIds = new Set(comp.nodes);
    cy.edges().forEach((edge) => {
      if (compNodeIds.has(edge.source().id()) && compNodeIds.has(edge.target().id())) {
        edge.removeClass('dimmed').addClass('highlighted');
      }
    });
  };

  return (
    <div>
      {/* Top Controls Toolbar */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search by ID */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Find Node (e.g. CLM-201, GAR-10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '260px', paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Locate</button>
            {searchError && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{searchError}</span>}
          </form>

          {/* Type Visibility Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Show:</span>
            {Object.keys(NODE_STYLES).map((type) => {
              const info = NODE_STYLES[type];
              const isChecked = visibleTypes[type];
              return (
                <label 
                  key={type} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '5px', 
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: isChecked ? `${info.color}22` : 'var(--bg-card-subtle)',
                    border: `1px solid ${isChecked ? info.color : 'var(--border-color)'}`,
                    color: isChecked ? info.color : 'var(--text-muted)',
                    fontWeight: isChecked ? 600 : 400
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleType(type)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: info.color }}></span>
                  {info.label}
                </label>
              );
            })}
          </div>

          {/* Zoom & Fit Actions */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-outline btn-sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={15} />
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={15} />
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleFit} title="Reset View & Fit">
              <Maximize2 size={15} />
              <span>Fit</span>
            </button>
          </div>
        </div>

        {/* Algorithm Actions Bar */}
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={14} /> Discrete Math Algorithms:
          </span>

          <button 
            className={`btn btn-sm ${algoMode === 'bfs' ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleRunBFS}
            disabled={!selectedNode || algoLoading}
            title={selectedNode ? `Run BFS from ${selectedNode.id}` : 'Select a node on graph first'}
          >
            Run BFS {selectedNode ? `from ${selectedNode.id}` : ''}
          </button>

          <button 
            className={`btn btn-sm ${algoMode === 'dfs' ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleRunDFS}
            disabled={!selectedNode || algoLoading}
            title={selectedNode ? `Run DFS from ${selectedNode.id}` : 'Select a node on graph first'}
          >
            Run DFS {selectedNode ? `from ${selectedNode.id}` : ''}
          </button>

          <button 
            className={`btn btn-sm ${algoMode === 'components' ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleLoadComponents}
            disabled={algoLoading}
          >
            <Layers size={14} />
            Connected Components
          </button>

          <button 
            className={`btn btn-sm ${algoMode === 'path' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setAlgoMode('path');
              if (selectedNode && !pathSource) setPathSource(selectedNode.id);
            }}
          >
            <Route size={14} />
            Path Finder
          </button>

          {algoMode !== 'none' && (
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAlgoMode('none');
                setAlgoResult(null);
                resetHighlights();
              }}
              style={{ marginLeft: 'auto' }}
            >
              <RotateCw size={13} /> Clear Highlights
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Canvas and Side Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode || algoMode !== 'none' ? '1fr 340px' : '1fr', gap: '16px' }}>
        
        {/* Cytoscape Canvas */}
        <div className="graph-wrapper" style={{ height: '640px' }}>
          <CytoscapeComponent
            elements={filteredElements}
            stylesheet={stylesheet}
            layout={layout}
            cy={(cy) => {
              cyRef.current = cy;
            }}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Floating notice */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'var(--graph-panel-bg)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
            maxWidth: '520px'
          }}>
            <Info size={14} color="#0284c7" />
            <span>Graph edges indicate shared entities between claims. Connections do not imply guilt or fraud.</span>
          </div>
        </div>

        {/* Right Info / Algorithm Details Drawer */}
        {(selectedNode || algoMode !== 'none') && (
          <div className="card" style={{ height: '640px', overflowY: 'auto', marginBottom: 0 }}>
            
            {/* Path Finder Mode Drawer */}
            {algoMode === 'path' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                    <Route size={16} /> Shortest Path Finder
                  </h3>
                  <button className="btn btn-sm" onClick={() => setAlgoMode('none')}><X size={15} /></button>
                </div>

                <form onSubmit={handleFindPath} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Source Node:</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CLM-201" 
                      value={pathSource} 
                      onChange={(e) => setPathSource(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Node:</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CLM-203" 
                      value={pathTarget} 
                      onChange={(e) => setPathTarget(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={algoLoading}>
                    {algoLoading ? 'Calculating...' : 'Find Connection Path'}
                  </button>
                </form>

                {algoResult && algoMode === 'path' && (
                  <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid var(--border-color)' }}>
                    {algoResult.found ? (
                      <div>
                        <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '4px' }}>
                          ✓ Path found ({algoResult.length} steps):
                        </div>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          background: 'var(--bg-card)', 
                          padding: '8px', 
                          borderRadius: '4px', 
                          border: '1px solid var(--border-color)',
                          wordBreak: 'break-all',
                          lineHeight: 1.6
                        }}>
                          {algoResult.path.map((node, i) => (
                            <span key={node}>
                              <strong>{node}</strong>
                              {i < algoResult.path.length - 1 && ' → '}
                            </span>
                          ))}
                        </div>
                        <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {algoResult.explanation}
                        </p>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--accent-burgundy)' }}>
                        ✕ {algoResult.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BFS / DFS Result Drawer */}
            {(algoMode === 'bfs' || algoMode === 'dfs') && algoResult && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                    {algoMode.toUpperCase()} Traversal Order
                  </h3>
                  <button className="btn btn-sm" onClick={() => setAlgoMode('none')}><X size={15} /></button>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Start: <strong>{algoResult.start_node}</strong> | Total Reached: <strong>{algoResult.total_visited}</strong> nodes
                </div>
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  background: 'var(--bg-card-subtle)', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  fontSize: '0.78rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <ol style={{ paddingLeft: '20px' }}>
                    {algoResult.traversal_order.map((nid) => (
                      <li key={nid} style={{ padding: '2px 0' }}>
                        <code>{nid}</code>
                        {algoResult.levels && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(level {algoResult.levels[nid]})</span>
                        )}
                        {algoResult.discovery_depth && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(depth {algoResult.discovery_depth[nid]})</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Connected Components Mode Drawer */}
            {algoMode === 'components' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                    Connected Components ({componentsList.length})
                  </h3>
                  <button className="btn btn-sm" onClick={() => setAlgoMode('none')}><X size={15} /></button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Click a component to highlight its maximal connected subgraph:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {componentsList.map((comp) => (
                    <div 
                      key={comp.component_id}
                      onClick={() => highlightComponent(comp)}
                      style={{ 
                        padding: '8px 10px', 
                        background: 'var(--bg-card-subtle)', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Component #{comp.component_id}</span>
                        <span style={{ color: 'var(--primary)' }}>{comp.size} nodes</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                        Claims ({comp.claim_count}): {comp.claims.join(', ') || 'None'}
                      </div>
                      {comp.is_isolated_claim && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 500 }}>
                          • Isolated single-claim cluster
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Node Details Drawer */}
            {selectedNode && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderTop: algoMode !== 'none' ? '1px solid var(--border-color)' : 'none', paddingTop: algoMode !== 'none' ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: NODE_STYLES[selectedNode.type]?.color || '#64748b' 
                      }}
                    ></span>
                    <h3 className="card-title" style={{ fontSize: '1rem' }}>{selectedNode.id}</h3>
                  </div>
                  <button className="btn btn-sm" onClick={() => setSelectedNode(null)}><X size={15} /></button>
                </div>

                <div style={{ fontSize: '0.82rem', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{selectedNode.type}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Label:</span>
                    <span>{selectedNode.label}</span>
                  </div>

                  {selectedNode.type === 'claim' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                        <strong>₹{selectedNode.claim_amount?.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                        <span>{selectedNode.review_status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Incident Date:</span>
                        <span>{selectedNode.incident_date}</span>
                      </div>
                      {selectedNode.notes && (
                        <div style={{ padding: '8px 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          <em>Notes: {selectedNode.notes}</em>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Direct quick action buttons for node */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedNode.type === 'claim' && onSelectClaim && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectClaim(selectedNode.id)}
                    >
                      Open Full Claim Record
                    </button>
                  )}
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setPathSource(selectedNode.id);
                      setAlgoMode('path');
                    }}
                  >
                    Set as Path Source
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setPathTarget(selectedNode.id);
                      setAlgoMode('path');
                    }}
                  >
                    Set as Path Target
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
