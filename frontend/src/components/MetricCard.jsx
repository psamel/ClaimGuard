import React from 'react';

export default function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  caption, 
  variant = 'default',
  onClick 
}) {
  return (
    <div 
      className={`metric-card ${variant ? variant : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="metric-header">
        <span>{label}</span>
        {Icon && (
          <div className="metric-icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      {caption && <div className="metric-caption">{caption}</div>}
    </div>
  );
}
