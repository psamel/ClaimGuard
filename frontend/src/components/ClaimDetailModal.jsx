import React, { useState } from 'react';
import { X, ShieldAlert, ExternalLink, Calendar, User, Truck, Wrench, Receipt, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ClaimDetailModal({ 
  claim, 
  onClose, 
  onStatusUpdate, 
  onInspectInGraph,
  onCheckDuplicates 
}) {
  const [selectedStatus, setSelectedStatus] = useState(claim?.review_status || 'Pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!claim) return null;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await onStatusUpdate(claim.claim_id, newStatus);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update status');
      setSelectedStatus(claim.review_status);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(claim.claim_amount || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="card-title" style={{ fontSize: '1.2rem' }}>{claim.claim_id}</h2>
              <StatusBadge status={selectedStatus} />
            </div>
            <p className="card-subtitle">Fictional insurance claim record</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div className="alert-box alert-danger" style={{ marginBottom: '16px' }}>
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick status update bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Update Review Status:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                className="form-select" 
                value={selectedStatus} 
                onChange={handleStatusChange}
                disabled={isUpdating}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Resolved">Resolved</option>
              </select>
              {isUpdating && <span className="spinner" style={{ width: '16px', height: '16px' }}></span>}
            </div>
          </div>

          {/* Key details grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={13} /> CUSTOMER
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>{claim.customer_name || 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {claim.customer_id}</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Receipt size={13} /> CLAIM AMOUNT
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {formattedAmount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Indian Rupees (Simulated)</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Truck size={13} /> VEHICLE IDENTIFIER
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>{claim.vehicle_id || 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Linked vehicle node</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} /> INCIDENT
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>{claim.incident_id || 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {claim.incident_date}</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Wrench size={13} /> REPAIR GARAGE
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>{claim.garage_name || claim.garage_id}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {claim.garage_id}</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={13} /> INVOICE NUMBER
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>{claim.invoice_id || 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Billed invoice identifier</div>
            </div>
          </div>

          {claim.notes && (
            <div style={{ 
              padding: '12px 16px', 
              background: 'var(--bg-card-subtle)', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}>
              <strong>Case Notes:</strong> {claim.notes}
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
            * Note: Status updates are saved in backend application memory for the active session.
          </div>
        </div>

        <div className="modal-footer">
          {onInspectInGraph && (
            <button 
              className="btn btn-outline" 
              onClick={() => {
                onInspectInGraph(claim.claim_id);
                onClose();
              }}
            >
              <ExternalLink size={15} />
              Inspect in Network Graph
            </button>
          )}

          {onCheckDuplicates && (
            <button 
              className="btn btn-primary" 
              onClick={() => {
                onCheckDuplicates(claim.claim_id);
                onClose();
              }}
            >
              Check Duplicate Rules
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
