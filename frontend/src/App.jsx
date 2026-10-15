import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ClaimDetailModal from './components/ClaimDetailModal';
import OverviewPage from './pages/OverviewPage';
import NetworkGraph from './components/NetworkGraph';
import ClaimsPage from './pages/ClaimsPage';
import DuplicateCheckerPage from './pages/DuplicateCheckerPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import RelationsPage from './pages/RelationsPage';
import MathConceptsPage from './pages/MathConceptsPage';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [duplicates, setDuplicates] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('online');
  const [isResetting, setIsResetting] = useState(false);

  // Theme state with localStorage persistence (defaults to 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('claimguard_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('claimguard_theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme to localStorage', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modal & focus states
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [graphFocusNodeId, setGraphFocusNodeId] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Check health
      await api.getHealth();
      setBackendStatus('online');

      // Fetch core datasets concurrently
      const [claimsRes, statsRes, graphRes, dupRes] = await Promise.all([
        api.getClaims(),
        api.getStats(),
        api.getGraph(),
        api.getDuplicates(),
      ]);

      setClaims(claimsRes.claims || []);
      setStats(statsRes);
      setGraphData(graphRes);
      setDuplicates(dupRes);
    } catch (err) {
      console.error('Failed to load backend data:', err);
      setBackendStatus('offline');
      setError(err.message || 'Failed to connect to ClaimGuard backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle review status update
  const handleStatusUpdate = async (claimId, newStatus) => {
    try {
      const res = await api.updateClaimStatus(claimId, newStatus);
      
      // Update local claims state immediately
      setClaims((prev) =>
        prev.map((c) =>
          c.claim_id.toUpperCase() === claimId.toUpperCase()
            ? { ...c, review_status: newStatus }
            : c
        )
      );

      // Refresh stats & graph in background to maintain consistency
      const [newStats, newGraph] = await Promise.all([
        api.getStats(),
        api.getGraph(),
      ]);
      setStats(newStats);
      setGraphData(newGraph);

      return res;
    } catch (err) {
      console.error('Status update failed:', err);
      throw err;
    }
  };

  // Handle data reset
  const handleResetData = async () => {
    if (!window.confirm('Reset all claim review statuses and in-memory data to default demonstration state?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetData();
      await loadAllData();
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Navigate to network tab and focus on specific node
  const handleInspectInGraph = (nodeId) => {
    setGraphFocusNodeId(nodeId);
    setActiveTab('network');
  };

  // Claim selected for detail modal
  const selectedClaimObject = claims.find(
    (c) => c.claim_id.toUpperCase() === (selectedClaimId || '').toUpperCase()
  );

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          backendStatus={backendStatus}
          onRefresh={loadAllData}
          onResetData={handleResetData}
          isResetting={isResetting}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="content-body">
          {loading && !claims.length ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Connecting to ClaimGuard API...</p>
            </div>
          ) : error && !claims.length ? (
            <div className="card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
              <AlertCircle size={48} color="var(--accent-burgundy)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                Backend Connection Error
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {error}
              </p>
              <div style={{ 
                background: 'var(--bg-card-subtle)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '6px', 
                padding: '12px', 
                fontSize: '0.82rem', 
                textAlign: 'left',
                marginBottom: '20px' 
              }}>
                <strong>How to start the backend:</strong>
                <pre style={{ marginTop: '6px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                  cd backend{"\n"}
                  venv\Scripts\python.exe app.py
                </pre>
              </div>
              <button className="btn btn-primary" onClick={loadAllData}>
                <RefreshCw size={16} /> Retry Connection
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewPage
                  stats={stats}
                  claims={claims}
                  duplicates={duplicates}
                  onNavigate={setActiveTab}
                  onSelectClaim={setSelectedClaimId}
                  onInspectInGraph={handleInspectInGraph}
                />
              )}

              {activeTab === 'network' && (
                <div className="card" style={{ padding: '20px' }}>
                  <div className="card-header" style={{ marginBottom: '14px' }}>
                    <div>
                      <h2 className="card-title">Claim Relationship Network</h2>
                      <p className="card-subtitle">
                        Interactive Cytoscape.js canvas. Click nodes to highlight direct connections; run BFS, DFS, or Path Finder.
                      </p>
                    </div>
                  </div>
                  <NetworkGraph
                    graphData={graphData}
                    onSelectClaim={setSelectedClaimId}
                    initialSelectedNodeId={graphFocusNodeId}
                    theme={theme}
                  />
                </div>
              )}

              {activeTab === 'claims' && (
                <ClaimsPage
                  claims={claims}
                  onSelectClaim={setSelectedClaimId}
                  onInspectInGraph={handleInspectInGraph}
                  onStatusUpdate={handleStatusUpdate}
                />
              )}

              {activeTab === 'duplicates' && (
                <DuplicateCheckerPage
                  duplicates={duplicates}
                  claims={claims}
                  onSelectClaim={setSelectedClaimId}
                  onInspectInGraph={handleInspectInGraph}
                  onStatusUpdate={handleStatusUpdate}
                />
              )}

              {activeTab === 'review' && (
                <ReviewQueuePage
                  claims={claims}
                  duplicates={duplicates}
                  onSelectClaim={setSelectedClaimId}
                  onInspectInGraph={handleInspectInGraph}
                  onStatusUpdate={handleStatusUpdate}
                  onResetData={handleResetData}
                />
              )}

              {activeTab === 'relations' && (
                <RelationsPage onSelectClaim={setSelectedClaimId} />
              )}

              {activeTab === 'math' && <MathConceptsPage />}
            </>
          )}
        </main>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaimObject && (
        <ClaimDetailModal
          claim={selectedClaimObject}
          onClose={() => setSelectedClaimId(null)}
          onStatusUpdate={handleStatusUpdate}
          onInspectInGraph={handleInspectInGraph}
          onCheckDuplicates={() => setActiveTab('duplicates')}
        />
      )}
    </div>
  );
}
