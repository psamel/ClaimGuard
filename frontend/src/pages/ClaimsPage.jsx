import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  ExternalLink, 
  Eye, 
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';

export default function ClaimsPage({ 
  claims, 
  onSelectClaim, 
  onInspectInGraph, 
  onStatusUpdate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('claim_id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort claims
  const filteredClaims = useMemo(() => {
    let list = [...claims];

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter((c) => (c.review_status || 'Pending').toUpperCase() === statusFilter);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((c) => {
        const fields = [
          c.claim_id,
          c.customer_name,
          c.customer_id,
          c.vehicle_id,
          c.incident_id,
          c.garage_id,
          c.garage_name,
          c.invoice_id,
          String(c.claim_amount || ''),
        ];
        return fields.some((f) => f && f.toLowerCase().includes(q));
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'claim_amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [claims, statusFilter, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortBy('claim_id');
    setSortOrder('asc');
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredClaims.length) return;
    const headers = [
      'Claim ID',
      'Customer ID',
      'Customer Name',
      'Vehicle ID',
      'Incident ID',
      'Incident Date',
      'Garage ID',
      'Garage Name',
      'Invoice ID',
      'Amount (INR)',
      'Review Status',
      'Notes',
    ];

    const rows = filteredClaims.map((c) => [
      `"${c.claim_id || ''}"`,
      `"${c.customer_id || ''}"`,
      `"${c.customer_name || ''}"`,
      `"${c.vehicle_id || ''}"`,
      `"${c.incident_id || ''}"`,
      `"${c.incident_date || ''}"`,
      `"${c.garage_id || ''}"`,
      `"${c.garage_name || ''}"`,
      `"${c.invoice_id || ''}"`,
      c.claim_amount || 0,
      `"${c.review_status || 'Pending'}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `claimguard_claims_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Filters & Actions Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '420px' }}>
            <input
              type="text"
              placeholder="Search Claim, Customer, Vehicle, Garage, Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#64748b" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="ALL">All Statuses ({claims.length})</option>
              <option value="PENDING">Pending Only</option>
              <option value="REVIEWED">Reviewed Only</option>
              <option value="RESOLVED">Resolved Only</option>
            </select>
          </div>

          {/* Export & Reset */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {(searchTerm || statusFilter !== 'ALL') && (
              <button className="btn btn-outline btn-sm" onClick={handleClearFilters}>
                <RotateCcw size={14} /> Clear Filters
              </button>
            )}

            <button 
              className="btn btn-outline btn-sm" 
              onClick={handleExportCSV}
              disabled={filteredClaims.length === 0}
              title="Export filtered records to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
          Showing <strong>{filteredClaims.length}</strong> of <strong>{claims.length}</strong> total claim records
        </div>
      </div>

      {/* Claims Data Table */}
      <div className="card">
        {filteredClaims.length === 0 ? (
          <div className="empty-state">
            <FileSpreadsheet size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
            <h3>No matching claims found</h3>
            <p>Try clearing your search query or changing status filters.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('claim_id')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Claim ID <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Customer</th>
                  <th>Vehicle ID</th>
                  <th>Incident</th>
                  <th>Garage</th>
                  <th>Invoice ID</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('incident_date')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Incident Date <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('claim_amount')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Amount (₹) <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr key={claim.claim_id}>
                    <td>
                      <button 
                        style={{ fontWeight: 700, color: '#0284c7', textDecoration: 'underline' }}
                        onClick={() => onSelectClaim(claim.claim_id)}
                      >
                        {claim.claim_id}
                      </button>
                    </td>
                    <td>
                      <div><strong>{claim.customer_name}</strong></div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{claim.customer_id}</div>
                    </td>
                    <td>
                      <code>{claim.vehicle_id}</code>
                    </td>
                    <td>
                      <code>{claim.incident_id}</code>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{claim.garage_name || claim.garage_id}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{claim.garage_id}</div>
                    </td>
                    <td>
                      <code>{claim.invoice_id}</code>
                    </td>
                    <td>{claim.incident_date}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{claim.claim_amount?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={claim.review_status || 'Pending'}
                        onChange={(e) => onStatusUpdate(claim.claim_id, e.target.value)}
                        style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onSelectClaim(claim.claim_id)}
                          title="View Full Record"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onInspectInGraph(claim.claim_id)}
                          title="Locate in Network Graph"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
