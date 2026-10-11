import React, { useState } from 'react';
import { 
  ExternalLink, 
  Info,
  RotateCcw
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function ReviewQueuePage({ 
  claims, 
  duplicates, 
  onSelectClaim, 
  onInspectInGraph, 
  onStatusUpdate,
  onResetData 
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const duplicateClaimIds = new Set(
    (duplicates?.candidates || []).flatMap((c) => [c.claim_a_id, c.claim_b_id])
  );

  const filtered = claims.filter((c) => {
    if (activeFilter === 'ALL') return true;
    return (c.review_status || 'Pending').toUpperCase() === activeFilter;
  });

  const counts = {
    all: claims.length,
    pending: claims.filter((c) => (c.review_status || 'Pending') === 'Pending').length,
    reviewed: claims.filter((c) => c.review_status === 'Reviewed').length,
    resolved: claims.filter((c) => c.review_status === 'Resolved').length,
  };

  const handleUpdate = async (claimId, newStatus) => {
    setUpdatingId(claimId);
    try {
      await onStatusUpdate(claimId, newStatus);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getReasonForReview = (claim) => {
    if (duplicateClaimIds.has(claim.claim_id)) {
      return {
        text: 'Duplicate Rule Candidate: Identical incident, vehicle, and invoice identifier.',
        severity: 'high'
      };
    }
    if (claim.garage_id === 'GAR-10') {
      return {
        text: 'Shared Garage Hub: Repaired at Apex Auto Care (GAR-10) with multiple claimants.',
        severity: 'medium'
      };
    }
    if (claim.customer_name === 'Priya Nair') {
      return {
        text: 'Multi-Claim Customer: Multiple separate claims filed across garages.',
        severity: 'medium'
      };
    }
    if (claim.claim_amount >= 60000) {
      return {
        text: `High Claim Amount: ₹${claim.claim_amount?.toLocaleString('en-IN')} requiring administrative sign-off.`,
        severity: 'low'
      };
    }
    return {
      text: 'Routine verification of vehicle and repair documentation.',
      severity: 'low'
    };
  };

  return (
    <div>
      {/* Session Memory Notice */}
      <div className="alert-box alert-info">
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Review Workflow Session State:</strong> Review statuses updated here are 
          maintained in application backend memory. When the backend server restarts, 
          statuses reset to the baseline fictional dataset. This demonstrates human-in-the-loop review without requiring an external persistent database.
        </div>
      </div>

      {/* Status Tabs Header */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Claims ({counts.all})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('PENDING')}
            >
              Pending ({counts.pending})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'REVIEWED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('REVIEWED')}
            >
              Reviewed ({counts.reviewed})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'RESOLVED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('RESOLVED')}
            >
              Resolved ({counts.resolved})
            </button>
          </div>

          <button className="btn btn-outline btn-sm" onClick={onResetData} title="Reset all statuses to default demo state">
            <RotateCcw size={14} /> Reset State
          </button>
        </div>
      </div>

      {/* Review Queue Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((claim) => {
          const reason = getReasonForReview(claim);
          const isUpdating = updatingId === claim.claim_id;

          return (
            <div 
              key={claim.claim_id} 
              className="card"
              style={{
                marginBottom: 0,
                borderLeft: reason.severity === 'high' ? '4px solid #991b1b' : reason.severity === 'medium' ? '4px solid #0284c7' : '4px solid #cbd5e1'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                
                {/* Left Claim Summary */}
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <button 
                      style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7', textDecoration: 'underline' }}
                      onClick={() => onSelectClaim(claim.claim_id)}
                    >
                      {claim.claim_id}
                    </button>
                    <StatusBadge status={claim.review_status} />
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>• Incident Date: {claim.incident_date}</span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#334155', display: 'flex', flexWrap: 'wrap', gap: '18px', margin: '8px 0' }}>
                    <span>Customer: <strong>{claim.customer_name}</strong> ({claim.customer_id})</span>
                    <span>Vehicle: <code>{claim.vehicle_id}</code></span>
                    <span>Garage: <strong>{claim.garage_name || claim.garage_id}</strong></span>
                    <span>Amount: <strong>₹{claim.claim_amount?.toLocaleString('en-IN')}</strong></span>
                  </div>

                  {/* Investigation Context */}
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px 12px', 
                    background: reason.severity === 'high' ? '#fef2f2' : '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: reason.severity === 'high' ? '#991b1b' : '#475569',
                    border: `1px solid ${reason.severity === 'high' ? '#fecaca' : '#e2e8f0'}`
                  }}>
                    <strong>Investigation Trigger:</strong> {reason.text}
                  </div>
                </div>

                {/* Right Actions & Status Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => onSelectClaim(claim.claim_id)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => onInspectInGraph(claim.claim_id)}
                      title="Inspect node on Network Graph"
                    >
                      <ExternalLink size={13} /> Network
                    </button>
                  </div>

                  {/* Status update button group */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      className={`btn btn-sm ${claim.review_status === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      disabled={isUpdating || claim.review_status === 'Pending'}
                      onClick={() => handleUpdate(claim.claim_id, 'Pending')}
                    >
                      Set Pending
                    </button>
                    <button
                      className={`btn btn-sm ${claim.review_status === 'Reviewed' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      disabled={isUpdating || claim.review_status === 'Reviewed'}
                      onClick={() => handleUpdate(claim.claim_id, 'Reviewed')}
                    >
                      Set Reviewed
                    </button>
                    <button
                      className={`btn btn-sm ${claim.review_status === 'Resolved' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      disabled={isUpdating || claim.review_status === 'Resolved'}
                      onClick={() => handleUpdate(claim.claim_id, 'Resolved')}
                    >
                      Set Resolved
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
