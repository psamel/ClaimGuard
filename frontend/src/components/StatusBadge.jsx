import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'Pending').toLowerCase();

  if (normalized === 'resolved') {
    return (
      <span className="badge badge-resolved" title="Claim review resolved">
        <CheckCircle size={12} />
        Resolved
      </span>
    );
  }

  if (normalized === 'reviewed') {
    return (
      <span className="badge badge-reviewed" title="Claim has been reviewed">
        <AlertCircle size={12} />
        Reviewed
      </span>
    );
  }

  return (
    <span className="badge badge-pending" title="Claim pending human review">
      <Clock size={12} />
      Pending
    </span>
  );
}
