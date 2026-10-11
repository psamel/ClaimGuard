import React from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, Sun, Moon } from 'lucide-react';

export default function Header({ 
  activeTab, 
  backendStatus, 
  onRefresh, 
  onResetData, 
  isResetting,
  theme,
  toggleTheme
}) {
  const titles = {
    overview: {
      title: 'Claims Network Overview',
      subtitle: 'Real-time structural metrics, recent claims, and duplicate alerts',
    },
    network: {
      title: 'Interactive Claim Network Graph',
      subtitle: 'Graph exploration, BFS/DFS traversals, connected components, and path reachability',
    },
    claims: {
      title: 'All Insurance Claims',
      subtitle: 'Searchable, filterable repository of demonstration claim records',
    },
    duplicates: {
      title: 'Transparent Duplicate Checker',
      subtitle: 'Deterministic propositional logic rule: D(A,B) = I(A,B) ^ V(A,B) ^ B(A,B)',
    },
    review: {
      title: 'Human Review Queue',
      subtitle: 'Investigative workflow for inspecting flagged claims and updating review statuses',
    },
    relations: {
      title: 'Binary Relations & Warshall Reachability',
      subtitle: 'Module 3: Claim relation adjacency matrix and Warshall transitive closure',
    },
    math: {
      title: 'Discrete Mathematics Academic Mapping',
      subtitle: 'Curriculum mapping table and mathematical algorithmic formulations',
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="page-title">{current.title}</h1>
          <p className="card-subtitle">{current.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {toggleTheme && (
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={14} style={{ color: '#fbbf24' }} />
            ) : (
              <Moon size={14} style={{ color: '#475569' }} />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}

        <span className="demo-pill" title="All identifiers and amounts are simulated for academic demonstration.">
          Demonstration Data
        </span>

        {backendStatus === 'online' ? (
          <span className="status-indicator status-online" title="Backend connected at 127.0.0.1:5000">
            <span className="status-dot"></span>
            Backend Online
          </span>
        ) : (
          <button 
            className="status-indicator status-offline" 
            onClick={onRefresh}
            title="Backend disconnected. Click to retry connection."
          >
            <AlertTriangle size={12} />
            Backend Offline (Retry)
          </button>
        )}

        <button
          className="btn btn-outline btn-sm"
          onClick={onResetData}
          disabled={isResetting}
          title="Reset claims data back to original fictional demonstration state"
        >
          <RotateCcw size={14} className={isResetting ? 'spinner' : ''} />
          <span>Reset Sample Data</span>
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={onRefresh}
          title="Refresh current data from backend"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
