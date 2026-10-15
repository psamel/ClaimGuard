import React from 'react';
import { 
  FileText, 
  Users, 
  Share2, 
  CopyCheck, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

export default function OverviewPage({ 
  stats, 
  claims, 
  duplicates, 
  onNavigate, 
  onSelectClaim, 
  onInspectInGraph 
}) {
  const recentClaims = (claims || []).slice(0, 6);

  return (
    <div>
      {/* Scope Alert Notice */}
      <div className="alert-box alert-info">
        <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Educational Demonstration Prototype:</strong> ClaimGuard maps structural relationships 
          among insurance claim entities using discrete mathematics (graphs, relations, and propositional logic). 
          Shared garages, customers, or vehicles indicate relationships for human investigation, not proof of wrongdoing or automated fraud scores.
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Claims"
          value={stats?.total_claims ?? claims.length}
          icon={FileText}
          caption="Simulated insurance records"
          onClick={() => onNavigate('claims')}
        />

        <MetricCard
          label="Unique Customers"
          value={stats?.unique_customers ?? 0}
          icon={Users}
          caption="Distinct claimant identities"
          onClick={() => onNavigate('claims')}
        />

        <MetricCard
          label="Connected Claim Groups"
          value={stats?.connected_components_count ?? 0}
          icon={Share2}
          caption={`Largest cluster: ${stats?.largest_component_size ?? 0} nodes`}
          variant="accent-blue"
          onClick={() => onNavigate('network')}
        />

        <MetricCard
          label="Possible Duplicate Pairs"
          value={stats?.possible_duplicate_pairs ?? (duplicates?.candidate_count || 0)}
          icon={CopyCheck}
          caption="Flagged by I ^ V ^ B rule"
          variant="accent-red"
          onClick={() => onNavigate('duplicates')}
        />

        <MetricCard
          label="Claims Pending Review"
          value={stats?.pending_reviews ?? 0}
          icon={Clock}
          caption="Awaiting human reviewer"
          onClick={() => onNavigate('review')}
        />
      </div>

      {/* Grid: Recent Claims Table & Graph / Duplicate Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        
        {/* Recent Claims Table Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Activity size={18} /> Recent Claim Records
              </h2>
              <p className="card-subtitle">Showing latest records from application data</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('claims')}>
              View All Claims <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Garage</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.map((c) => (
                  <tr key={c.claim_id}>
                    <td>
                      <button 
                        style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'underline' }}
                        onClick={() => onSelectClaim(c.claim_id)}
                      >
                        {c.claim_id}
                      </button>
                    </td>
                    <td>{c.customer_name}</td>
                    <td><code>{c.vehicle_id}</code></td>
                    <td>{c.garage_name || c.garage_id}</td>
                    <td>₹{c.claim_amount?.toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={c.review_status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => onSelectClaim(c.claim_id)}
                          title="View Details"
                        >
                          View
                        </button>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => onInspectInGraph(c.claim_id)}
                          title="Locate in Network Graph"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Summaries Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Network Summary Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: '0.98rem' }}>
                <Share2 size={16} /> Graph Network Summary
              </h2>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Connected Components:</span>
                <strong>{stats?.connected_components_count ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Largest Component Size:</span>
                <strong>{stats?.largest_component_size ?? 0} nodes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Transitive Reachability:</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Warshall Analyzed</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Each component represents an equivalence class of claims connected via shared entities.
              </p>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ marginTop: '6px' }}
                onClick={() => onNavigate('network')}
              >
                Open Network Graph
              </button>
            </div>
          </div>

          {/* Duplicate Summary Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: '0.98rem', color: 'var(--accent-burgundy-text)' }}>
                <CopyCheck size={16} /> Propositional Duplicate Rules
              </h2>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ 
                fontFamily: 'monospace', 
                background: 'var(--accent-burgundy-light)', 
                color: 'var(--accent-burgundy-text)', 
                padding: '8px', 
                borderRadius: '6px',
                border: '1px solid var(--accent-burgundy-border)',
                fontSize: '0.8rem',
                marginBottom: '10px'
              }}>
                D(A,B) = I(A,B) ^ V(A,B) ^ B(A,B)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <strong>{duplicates?.candidate_count || 0} candidate pair(s)</strong> flagged with matching incident, vehicle, and invoice IDs.
              </p>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('duplicates')}
              >
                Inspect Duplicate Alerts
              </button>
            </div>
          </div>

          {/* Review Queue Summary Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: '0.98rem' }}>
                <Clock size={16} /> Review Pipeline
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--warning)' }}>• Pending:</span>
                <strong>{stats?.pending_reviews ?? 0} claims</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--primary)' }}>• Reviewed:</span>
                <strong>{stats?.reviewed_claims ?? 0} claims</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--success)' }}>• Resolved:</span>
                <strong>{stats?.resolved_claims ?? 0} claims</strong>
              </div>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ marginTop: '6px' }}
                onClick={() => onNavigate('review')}
              >
                Open Review Queue
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
