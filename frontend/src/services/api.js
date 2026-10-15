/**
 * ClaimGuard API Service
 * Centralized API helper with error handling, retries, and configurable backend URL.
 *
 * URL resolution strategy:
 *   1. If VITE_API_BASE_URL is set (e.g. a separate backend host), use it.
 *   2. Otherwise use a relative '/api' path.
 *      - In production (Vercel): /api/* is routed to the Python serverless function.
 *      - In local dev: Vite's proxy forwards /api/* to http://127.0.0.1:5000.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';


async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || `HTTP error ${response.status}: ${response.statusText}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Unable to reach the ClaimGuard backend at ${API_BASE_URL}. ` +
        `Locally: ensure the Flask server is running (cd backend && venv\\Scripts\\python.exe app.py). ` +
        `In production: check the Vercel deployment logs.`
      );
    }
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Claims
  getClaims: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_order) searchParams.set('sort_order', params.sort_order);
    const qs = searchParams.toString();
    return request(`/claims${qs ? `?${qs}` : ''}`);
  },

  getClaim: (claimId) => request(`/claims/${encodeURIComponent(claimId)}`),

  updateClaimStatus: (claimId, status) =>
    request(`/claims/${encodeURIComponent(claimId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  resetData: () =>
    request('/claims/reset', {
      method: 'POST',
    }),

  // Stats
  getStats: () => request('/stats'),

  // Graph
  getGraph: () => request('/graph'),

  getComponents: () => request('/graph/components'),

  runBFS: (nodeId) => request(`/graph/bfs/${encodeURIComponent(nodeId)}`),

  runDFS: (nodeId) => request(`/graph/dfs/${encodeURIComponent(nodeId)}`),

  findPath: (source, target) => {
    const qs = new URLSearchParams({ source, target }).toString();
    return request(`/graph/path?${qs}`);
  },

  // Relations & Warshall
  getRelationMatrix: () => request('/relations/matrix'),

  getReachabilityMatrix: () => request('/relations/reachability'),

  // Duplicates
  getDuplicates: () => request('/duplicates'),

  evaluatePair: (claimA, claimB) =>
    request('/duplicates/evaluate', {
      method: 'POST',
      body: JSON.stringify({ claim_a: claimA, claim_b: claimB }),
    }),
};
