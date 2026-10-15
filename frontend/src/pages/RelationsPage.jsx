import React, { useState, useEffect, useCallback } from 'react';
import { Binary, Layers, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function RelationsPage({ onSelectClaim }) {
  const [activeTab, setActiveTab] = useState('relation'); // 'relation' | 'warshall'
  const [relationData, setRelationData] = useState(null);
  const [reachabilityData, setReachabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rel, reach] = await Promise.all([
        api.getRelationMatrix(),
        api.getReachabilityMatrix(),
      ]);
      setRelationData(rel);
      setReachabilityData(reach);
    } catch (err) {
      alert(`Error loading relation matrices: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Computing binary relation matrix and Warshall transitive closure...</p>
      </div>
    );
  }

  const claimIds = relationData?.claim_ids || [];
  const matrix = relationData?.matrix || [];
  const reachMatrix = reachabilityData?.reachability_matrix || [];

  const handleCellClick = (i, j) => {
    const idA = claimIds[i];
    const idB = claimIds[j];
    if (i === j) {
      setSelectedCell({
        idA,
        idB,
        val: 0,
        type: 'self',
        text: 'Self-relation R(A, A) = 0 by definition (distinct claims only).'
      });
      return;
    }

    const key = `${idA},${idB}`;
    const directReason = relationData.reasons?.[key];
    const isDirect = matrix[i][j] === 1;
    const isReach = reachMatrix[i][j] === 1;

    let text = '';
    if (isDirect) {
      text = `Direct relationship: ${idA} and ${idB} share [${directReason?.join(', ')}].`;
    } else if (isReach) {
      text = `Transitive reachability: ${idA} can reach ${idB} through intermediate claims via Warshall's closure.`;
    } else {
      text = `Unreachable: ${idA} and ${idB} belong to disconnected components.`;
    }

    setSelectedCell({
      idA,
      idB,
      isDirect,
      isReach,
      text,
      reasons: directReason || []
    });
  };

  return (
    <div>
      {/* Educational Context Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Binary size={18} /> Discrete Mathematics Module 3: Relations and Reachability
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'relation' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('relation')}
            >
              Direct Relation Matrix (M_R)
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'warshall' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('warshall')}
            >
              Warshall Reachability (W)
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {activeTab === 'relation' ? (
            <div>
              <p>
                <strong>Binary Relation Definition:</strong> Let S be the set of insurance claims. 
                The relation R ⊆ S × S is defined as:
              </p>
              <div style={{ 
                fontFamily: 'monospace', 
                background: 'var(--bg-card-subtle)', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                margin: '8px 0',
                border: '1px solid var(--border-color)' 
              }}>
                R(A, B) = 1 &nbsp;iff&nbsp; (A ≠ B) and Claims A and B share at least one entity (Vehicle, Customer, Incident, Garage, Invoice).
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Self-relations R(A, A) = 0 along the diagonal. The matrix M_R is symmetric because shared entities form an undirected relation.
              </p>
            </div>
          ) : (
            <div>
              <p>
                <strong>Warshall's Algorithm (Transitive Closure):</strong> Computes whether a path of any length exists between two claims.
              </p>
              <div style={{ 
                fontFamily: 'monospace', 
                background: 'var(--warning-light)', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                margin: '8px 0',
                border: '1px solid var(--warning-border)',
                color: 'var(--warning-text)'
              }}>
                W^(k)[i][j] = W^(k-1)[i][j] ∨ (W^(k-1)[i][k] ∧ W^(k-1)[k][j]) &nbsp;for k = 1, 2, ..., n
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                At iteration k, intermediate claim v_k is considered. Cells with 1 in W that were 0 in M_R represent indirect relationships discovered by transitive reachability.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Cell Inspector Banner */}
      {selectedCell && (
        <div style={{ 
          background: 'var(--info-bg)', 
          border: '1px solid var(--info-border)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--info-text)', fontSize: '0.9rem' }}>
              Selected Pair: ({selectedCell.idA}, {selectedCell.idB})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {selectedCell.text}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onSelectClaim && selectedCell.idA && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onSelectClaim(selectedCell.idA)}
              >
                <Eye size={12} /> View {selectedCell.idA}
              </button>
            )}
            {onSelectClaim && selectedCell.idB && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onSelectClaim(selectedCell.idB)}
              >
                <Eye size={12} /> View {selectedCell.idB}
              </button>
            )}
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => setSelectedCell(null)}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Matrix Display Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {activeTab === 'relation' ? 'Direct Relation Adjacency Matrix M_R' : 'Transitive Closure Reachability Matrix W'}
            </h3>
            <p className="card-subtitle">
              Size: {claimIds.length} × {claimIds.length} claims. Click any cell to inspect its mathematical rationale.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--matrix-cell-1-bg)', border: '1px solid var(--info-border)', borderRadius: '2px' }}></span>
              Direct Connection (1)
            </span>
            {activeTab === 'warshall' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--matrix-cell-reach-bg)', border: '1px solid var(--warning-border)', borderRadius: '2px' }}></span>
                Transitive Indirect Reachability (1)
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '2px' }}></span>
              No Connection (0)
            </span>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ backgroundColor: 'var(--bg-card-subtle)', position: 'sticky', top: 0, left: 0, zIndex: 10 }}>Claims</th>
                {claimIds.map((cid) => (
                  <th key={cid} style={{ position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', zIndex: 5 }}>
                    {cid.replace('CLM-', 'C')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claimIds.map((rowId, i) => (
                <tr key={rowId}>
                  <th style={{ position: 'sticky', left: 0, backgroundColor: 'var(--table-header-bg)', zIndex: 5, textAlign: 'left' }}>
                    {rowId}
                  </th>
                  {claimIds.map((colId, j) => {
                    const isDirect = matrix[i]?.[j] === 1;
                    const isReach = reachMatrix[i]?.[j] === 1;

                    let cellClass = 'matrix-cell-0';
                    let displayVal = 0;

                    if (activeTab === 'relation') {
                      if (isDirect) {
                        cellClass = 'matrix-cell-1';
                        displayVal = 1;
                      }
                    } else {
                      // Warshall tab
                      if (isReach) {
                        displayVal = 1;
                        cellClass = isDirect ? 'matrix-cell-1' : 'matrix-cell-1-reach';
                      }
                    }

                    return (
                      <td 
                        key={colId} 
                        className={cellClass}
                        onClick={() => handleCellClick(i, j)}
                        title={`${rowId} ↔ ${colId}: ${displayVal} (Click to inspect)`}
                      >
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warshall Milestones / Newly Reachable Pairs Details */}
      {activeTab === 'warshall' && reachabilityData && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Layers size={18} /> Indirectly Reachable Pairs Discovered by Warshall's Algorithm
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            These pairs have M_R[i][j] = 0 (no shared entity directly) but W[i][j] = 1 (connected via a chain of intermediate claims):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {reachabilityData.newly_reachable_pairs?.map((item, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: 'var(--warning-light)', 
                  border: '1px solid var(--warning-border)', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--warning-text)', marginBottom: '4px' }}>
                  {item.pair[0]} ⟷ {item.pair[1]}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{item.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
