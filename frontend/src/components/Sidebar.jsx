import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Share2, 
  FileText, 
  CopyCheck, 
  ClipboardList, 
  Binary, 
  GraduationCap 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'network', label: 'Claim Network', icon: Share2 },
    { id: 'claims', label: 'All Claims', icon: FileText },
    { id: 'duplicates', label: 'Duplicate Checker', icon: CopyCheck },
    { id: 'review', label: 'Review Queue', icon: ClipboardList },
    { id: 'relations', label: 'Relations & Warshall', icon: Binary },
    { id: 'math', label: 'Discrete Math Concepts', icon: GraduationCap },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <ShieldCheck className="shield-icon" size={24} />
          <span>ClaimGuard</span>
        </div>
        <div className="brand-subtitle">
          Explainable Claim Network Analyzer
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="academic-tag">CSBS Discrete Mathematics</div>
        <div>Fictional demonstration records. Deterministic relationship analysis.</div>
      </div>
    </aside>
  );
}
