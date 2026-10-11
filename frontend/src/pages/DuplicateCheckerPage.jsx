import React, { useState } from 'react';
import { 
  CopyCheck, 
  AlertTriangle, 
  ExternalLink, 
  Eye, 
  HelpCircle,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DuplicateCheckerPage({ 
  duplicates, 
  claims, 
  onSelectClaim, 
  onInspectInGraph, 
  onStatusUpdate 
}) {
  // Custom pair evaluation state
  const [customA, setCustomA] = useState(claims[0]?.claim_id || '');
  const [customB, setCustomB] = useState(claims[1]?.claim_id || '');
  const [evalResult, setEvalResult] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const candidates = duplicates?.candidates || [];

  const handleEvaluateCustomPair = async (e) => {
    e.preventDefault();
    if (!customA || !customB) return;
    setEvalLoading(true);
    try {
      const res = await api.evaluatePair(customA, customB);
      setEvalResult(res);
    } catch (err) {
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div>
      {/* Prominent Mandatory Warning Alert */}
      <div className="alert-box alert-warning">
        <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ fontSize: '0.95rem' }}>
            Possible duplicate does not mean confirmed fraud. All alerts require independent human verification.
          </strong>
          <p style={{ marginTop: '4px', fontSize: '0.82rem' }}>
            The duplicate candidate checker applies a deterministic propositional logic rule. 
            It identifies administrative re-submissions, data entry duplicates, or potential anomalies for investigation.
          </p>
        </div>
      </div>

      {/* Logic Formula Definition Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Scale size={18} /> Propositional Logic Formulation (Discrete Mathematics Module 1)
          </h2>
        </div>
        <div style={{ fontSize: '0.88rem', color: '#475569' }}>
          <p style={{ marginBottom: '10px' }}>
            For any two distinct claims A and B (A ≠ B), we evaluate three atomic truth conditions:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Condition I(A, B):</strong> Same Incident Identifier
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                I(A, B) ⇔ A.incident_id = B.incident_id ∧ A.incident_id ≠ ∅
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Condition V(A, B):</strong> Same Vehicle Identifier
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                V(A, B) ⇔ A.vehicle_id = B.vehicle_id ∧ A.vehicle_id ≠ ∅
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Condition B(A, B):</strong> Same Invoice Identifier
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                B(A, B) ⇔ A.invoice_id = B.invoice_id ∧ A.invoice_id ≠ ∅
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '12px 16px', 
            background: '#fef2f2', 
            borderRadius: '6px', 
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Compound Proposition: D(A, B) = I(A, B) ∧ V(A, B) ∧ B(A, B)</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>All 3 must be TRUE</span>
          </div>
        </div>
      </div>

      {/* Detected Duplicate Candidate Pairs */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <CopyCheck size={18} /> Flagged Candidate Pairs ({candidates.length})
            </h2>
            <p className="card-subtitle">
              Pairs where all three conditions are satisfied simultaneously
            </p>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={36} color="#059669" style={{ margin: '0 auto 8px' }} />
            <h3>No duplicate candidates found</h3>
            <p>None of the distinct claim pairs satisfy the conjunction I ∧ V ∧ B.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {candidates.map((cand, idx) => (
              <div 
                key={`${cand.claim_a_id}_${cand.claim_b_id}`}
                style={{
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  background: '#fffbfb',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      background: '#991b1b', 
                      color: '#ffffff', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700 
                    }}>
                      CANDIDATE #{idx + 1}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      {cand.claim_a_id} & {cand.claim_b_id}
                    </h3>
                  </div>

                  <span style={{ 
                    color: '#991b1b', 
                    background: '#fee2e2', 
                    padding: '4px 10px', 
                    borderRadius: '14px', 
                    fontSize: '0.78rem', 
                    fontWeight: 600 
                  }}>
                    D(A,B) = TRUE
                  </span>
                </div>

                {/* Side by side claims summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#0284c7' }}>Claim A: {cand.claim_a_id}</strong>
                      <StatusBadge status={cand.claims_summary?.claim_a?.review_status} />
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>Customer: <strong>{cand.claims_summary?.claim_a?.customer_name}</strong></div>
                      <div>Amount: <strong>₹{cand.claims_summary?.claim_a?.claim_amount?.toLocaleString('en-IN')}</strong></div>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => onSelectClaim(cand.claim_a_id)}>
                        <Eye size={12} /> View Record
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => onInspectInGraph(cand.claim_a_id)}>
                        <ExternalLink size={12} /> Graph
                      </button>
                      {onStatusUpdate && (
                        <select
                          className="form-select"
                          value={cand.claims_summary?.claim_a?.review_status || 'Pending'}
                          onChange={(e) => onStatusUpdate(cand.claim_a_id, e.target.value)}
                          style={{ fontSize: '0.75rem', padding: '3px 6px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#0284c7' }}>Claim B: {cand.claim_b_id}</strong>
                      <StatusBadge status={cand.claims_summary?.claim_b?.review_status} />
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>Customer: <strong>{cand.claims_summary?.claim_b?.customer_name}</strong></div>
                      <div>Amount: <strong>₹{cand.claims_summary?.claim_b?.claim_amount?.toLocaleString('en-IN')}</strong></div>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => onSelectClaim(cand.claim_b_id)}>
                        <Eye size={12} /> View Record
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => onInspectInGraph(cand.claim_b_id)}>
                        <ExternalLink size={12} /> Graph
                      </button>
                      {onStatusUpdate && (
                        <select
                          className="form-select"
                          value={cand.claims_summary?.claim_b?.review_status || 'Pending'}
                          onChange={(e) => onStatusUpdate(cand.claim_b_id, e.target.value)}
                          style={{ fontSize: '0.75rem', padding: '3px 6px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logic conditions table */}
                <div className="table-responsive" style={{ marginBottom: '14px' }}>
                  <table className="custom-table" style={{ background: '#ffffff' }}>
                    <thead>
                      <tr>
                        <th>Rule Condition</th>
                        <th>Claim A Value</th>
                        <th>Claim B Value</th>
                        <th>Match State</th>
                        <th>Truth Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>I(A,B) — Incident Match</strong></td>
                        <td><code>{cand.fields?.incident?.a}</code></td>
                        <td><code>{cand.fields?.incident?.b}</code></td>
                        <td>Identical Identifier</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>TRUE (1)</td>
                      </tr>
                      <tr>
                        <td><strong>V(A,B) — Vehicle Match</strong></td>
                        <td><code>{cand.fields?.vehicle?.a}</code></td>
                        <td><code>{cand.fields?.vehicle?.b}</code></td>
                        <td>Identical Identifier</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>TRUE (1)</td>
                      </tr>
                      <tr>
                        <td><strong>B(A,B) — Invoice Match</strong></td>
                        <td><code>{cand.fields?.invoice?.a}</code></td>
                        <td><code>{cand.fields?.invoice?.b}</code></td>
                        <td>Identical Identifier</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>TRUE (1)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ 
                  background: '#f1f5f9', 
                  padding: '12px 14px', 
                  borderRadius: '6px', 
                  fontSize: '0.84rem', 
                  color: '#334155' 
                }}>
                  <strong>Mathematical Explanation:</strong> {cand.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Custom Pair Logic Inspector */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <HelpCircle size={18} /> Interactive Logic Rule Evaluator
            </h2>
            <p className="card-subtitle">
              Select any two claims to inspect why they do or do not satisfy the duplicate formula
            </p>
          </div>
        </div>

        <form onSubmit={handleEvaluateCustomPair} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Claim A:</label>
            <select 
              className="form-select" 
              value={customA} 
              onChange={(e) => setCustomA(e.target.value)}
              style={{ width: '220px' }}
            >
              {claims.map((c) => (
                <option key={c.claim_id} value={c.claim_id}>
                  {c.claim_id} ({c.customer_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Claim B:</label>
            <select 
              className="form-select" 
              value={customB} 
              onChange={(e) => setCustomB(e.target.value)}
              style={{ width: '220px' }}
            >
              {claims.map((c) => (
                <option key={c.claim_id} value={c.claim_id}>
                  {c.claim_id} ({c.customer_name})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={evalLoading}>
            {evalLoading ? 'Evaluating...' : 'Evaluate Proposition D(A, B)'}
          </button>
        </form>

        {evalResult && (
          <div style={{ 
            background: evalResult.is_duplicate_candidate ? '#fffbfb' : '#f8fafc', 
            border: `1px solid ${evalResult.is_duplicate_candidate ? '#fecaca' : '#e2e8f0'}`,
            borderRadius: '8px', 
            padding: '18px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>
                Comparison: {evalResult.claim_a_id} vs {evalResult.claim_b_id}
              </h3>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '12px', 
                fontSize: '0.8rem', 
                fontWeight: 700,
                backgroundColor: evalResult.is_duplicate_candidate ? '#fee2e2' : '#f1f5f9',
                color: evalResult.is_duplicate_candidate ? '#991b1b' : '#475569'
              }}>
                D({evalResult.claim_a_id}, {evalResult.claim_b_id}) = {evalResult.is_duplicate_candidate ? 'TRUE' : 'FALSE'}
              </span>
            </div>

            {evalResult.truth_values && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '8px', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <div>I(A,B) (Incident): <strong>{evalResult.truth_values.I ? 'TRUE' : 'FALSE'}</strong></div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {evalResult.fields?.incident?.a} vs {evalResult.fields?.incident?.b}
                  </div>
                </div>

                <div style={{ padding: '8px', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <div>V(A,B) (Vehicle): <strong>{evalResult.truth_values.V ? 'TRUE' : 'FALSE'}</strong></div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {evalResult.fields?.vehicle?.a} vs {evalResult.fields?.vehicle?.b}
                  </div>
                </div>

                <div style={{ padding: '8px', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <div>B(A,B) (Invoice): <strong>{evalResult.truth_values.B ? 'TRUE' : 'FALSE'}</strong></div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {evalResult.fields?.invoice?.a} vs {evalResult.fields?.invoice?.b}
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.84rem', color: '#334155' }}>
              <strong>Result Explanation:</strong> {evalResult.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
