import React from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function MathConceptsPage() {
  const mappingRows = [
    {
      concept: 'Graph Representation',
      module: 'Module 6: Graphs',
      application: 'Models claims and shared entities (vehicles, garages, customers, incidents, invoices) as a heterogeneous relationship network.',
      status: 'Implemented in backend & Cytoscape.js'
    },
    {
      concept: 'Breadth-First Search (BFS)',
      module: 'Module 6: Graphs',
      application: 'Explores reachable relationships level by level from any selected claim or entity node, computing traversal order and level distance.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: 'Depth-First Search (DFS)',
      module: 'Module 6: Graphs',
      application: 'Explores relationship paths depth-first with discovery depths and deterministic neighbor ordering.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: 'Connected Components',
      module: 'Module 6: Graphs',
      application: 'Partitions claims into maximal connected subgraphs, identifying isolated claims and independent claim clusters.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: 'Path Finding & Reachability',
      module: 'Module 6: Graphs',
      application: 'Finds shortest relationship paths between two claims, explaining indirect associations across shared intermediaries.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: 'Binary Relations',
      module: 'Module 3: Relations',
      application: 'Defines relation R(A, B) on the set of claims where R(A, B) = 1 iff distinct claims share at least one physical entity.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: 'Relation Adjacency Matrix',
      module: 'Module 3: Relations',
      application: 'Generates n x n binary matrix M_R with claim IDs as labels, providing transparent mathematical representation.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: "Warshall's Algorithm",
      module: 'Module 3: Reachability',
      application: 'Computes transitive closure reachability matrix W in O(n^3) time by iteratively considering intermediate vertices.',
      status: 'Implemented in graph_algorithms.py'
    },
    {
      concept: 'Propositional Logic',
      module: 'Module 1: Logic',
      application: 'Evaluates deterministic compound formula D(A,B) = I(A,B) ^ V(A,B) ^ B(A,B) to identify candidate duplicate claims.',
      status: 'Implemented in duplicate_rules.py'
    },
  ];

  return (
    <div>
      {/* Intro Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <GraduationCap size={20} /> Second-Year B.Tech CSBS — Discrete Mathematics Project Mapping
            </h2>
            <p className="card-subtitle">
              Formal curriculum mapping and algorithmic specifications implemented in ClaimGuard
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          ClaimGuard demonstrates the direct real-world application of foundational discrete mathematics concepts 
          to complex relational data. Rather than relying on opaque machine learning models or probabilistic fraud scores, 
          ClaimGuard employs deterministic graph theory, binary relations, and propositional logic to deliver 
          fully explainable investigative insights.
        </p>
      </div>

      {/* Academic Mapping Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <BookOpen size={18} /> Discrete Mathematics Curriculum Mapping Table
          </h3>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Discrete Mathematics Concept</th>
                <th>Academic Module</th>
                <th>ClaimGuard Implementation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mappingRows.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.concept}</strong></td>
                  <td><code>{row.module}</code></td>
                  <td style={{ fontSize: '0.84rem' }}>{row.application}</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'var(--success-light)', 
                      color: 'var(--success-text)', 
                      padding: '3px 8px', 
                      borderRadius: '12px',
                      fontWeight: 600,
                      border: '1px solid var(--success-border)'
                    }}>
                      ✓ Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-dive Cards for Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Module 1 */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '0.98rem', color: 'var(--primary)' }}>
            Module 1: Propositional Logic
          </h3>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>
              <strong>Formulation:</strong> A candidate duplicate alert is formed by the conjunction of three atomic propositions:
            </p>
            <div style={{ fontFamily: 'monospace', background: 'var(--bg-card-subtle)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              D(A,B) = I(A,B) ∧ V(A,B) ∧ B(A,B)
            </div>
            <p>
              By truth-table definition, D(A,B) is true if and only if all three conjuncts evaluate to true. 
              If any identifier differs or is missing, D(A,B) is false.
            </p>
          </div>
        </div>

        {/* Module 3 */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '0.98rem', color: 'var(--primary)' }}>
            Module 3: Relations &amp; Reachability
          </h3>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>
              <strong>Warshall's Algorithm:</strong> Computes the transitive closure W of the claim relation matrix M_R using dynamic programming:
            </p>
            <div style={{ fontFamily: 'monospace', background: 'var(--bg-card-subtle)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              W^(k)[i][j] = W^(k-1)[i][j] ∨ (W^(k-1)[i][k] ∧ W^(k-1)[k][j])
            </div>
            <p>
              Reveals indirect multi-hop connections (e.g. Claim 201 reaching Claim 203 through intermediate customer Priya Nair).
            </p>
          </div>
        </div>

        {/* Module 6 */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '0.98rem', color: 'var(--primary)' }}>
            Module 6: Graph Algorithms
          </h3>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>
              <strong>Graph Model:</strong> Claims and entities form an undirected bipartite/multipartite graph G = (V, E).
            </p>
            <ul style={{ paddingLeft: '18px' }}>
              <li><strong>BFS:</strong> Queue-based level exploration finding shortest hop paths.</li>
              <li><strong>DFS:</strong> Recursive depth traversal exploring relationship branches.</li>
              <li><strong>Components:</strong> Partitions V into maximal connected components.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
