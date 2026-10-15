# ClaimGuard â€” An Explainable Insurance Claim Network Analyzer

> **Academic Context:** Second-Year B.Tech Computer Science and Business Systems (CSBS), Discrete Mathematics Project  
> **Development Environment:** Windows 11, Antigravity IDE, Python 3.14.4, Node.js 24.15.0 / npm 11.12.1

---

## 1. Project Overview & Problem Statement

Insurance companies examine claims using verification procedures and fraud-prevention systems. However, examining individual claim records separately makes it difficult to discover complex relationships across multiple claims. Different claims may be connected through shared vehicles, garages, incidents, invoices, customers, or contact details, forming larger networks that are invisible when claims are viewed independently.

**ClaimGuard** is a web-based investigative analytics prototype that represents insurance claim records as a graph and applies core **discrete mathematics** concepts to explore those relationships:
- **Graph Traversal & Partitioning (Module 6):** Adjacency lists, Breadth-First Search (BFS), Depth-First Search (DFS), and Connected Components.
- **Binary Relations & Transitive Closure (Module 3):** Claim-to-claim binary relations, adjacency matrix $M_R$, and Warshall's Algorithm for reachability.
- **Propositional Logic (Module 1):** Transparent rule-based duplicate candidate verification using conjunction of atomic propositions ($I \land V \land B$).

### Core Research Question
*How can discrete mathematics be used to discover, visualize, and explain relationships among insurance claim records that may be difficult to understand when each claim is examined separately?*

---

## 2. Important Scope & Educational Notice

> **Important:** ClaimGuard is an explainable network-analysis tool, **not** an automated fraud detection engine.
> - **Fictional Data:** All claim records, amounts, vehicle IDs, and garage names are simulated demonstration records.
> - **No Machine Learning:** The system avoids black-box ML scoring or opaque risk probabilities. It uses deterministic, explainable mathematical algorithms.
> - **Structural Links â‰  Fraud:** A shared garage, shared vehicle, or multi-claim customer indicates a relationship for human investigation, never proof of wrongdoing.
> - **Human Verification Required:** Possible duplicate alerts are candidates produced by formal logic rules for human reviewers to investigate.

---

## 3. Technology Stack

- **Frontend:**
  - React 19 + Vite
  - JavaScript (ES Modules)
  - Cytoscape.js (`cytoscape` & `react-cytoscapejs`) for interactive graph visualization
  - Lucide React (`lucide-react`) for icons and the Light/Dark theme toggle (Sun/Moon)
  - Custom fintech CSS design system: CSS custom properties (`--var`) with `[data-theme="light"]` / `[data-theme="dark"]` token sets; dark mode uses dark navy/charcoal backgrounds; preference persisted in `localStorage` key `claimguard_theme` (defaults to `light`)
- **Backend:**
  - Python 3.14
  - Flask 3.1 & Flask-CORS
- **Testing:**
  - Python `unittest` test suite (22 unit & integration tests)
  - Vite production build verification & oxlint static analysis

---

## 4. Academic Mapping Table (Discrete Mathematics)

| Discrete Mathematics Concept | Academic Module | ClaimGuard Implementation |
| :--- | :--- | :--- |
| **Graph Representation** | Module 6: Graphs | Models claims and shared entities (Vehicles, Customers, Incidents, Garages, Invoices) as a heterogeneous relationship graph $G = (V, E)$. |
| **Breadth-First Search (BFS)** | Module 6: Graphs | Level-by-level traversal from any selected node, computing visit order and shortest distance levels. |
| **Depth-First Search (DFS)** | Module 6: Graphs | Explores relationship paths depth-first with discovery depths and deterministic neighbor ordering. |
| **Connected Components** | Module 6: Graphs | Partitions the network into maximal connected subgraphs, identifying isolated claims and independent claim clusters. |
| **Path Finding** | Module 6: Graphs | Computes shortest relationship path between two nodes, explaining indirect links across intermediaries. |
| **Binary Relations** | Module 3: Relations | Defines relation $R \subseteq S \times S$ where $R(A, B) = 1$ iff distinct claims $A$ and $B$ share at least one physical entity. |
| **Relation Matrix** | Module 3: Relations | Generates $n \times n$ binary adjacency matrix $M_R$ with claim IDs as labels; clicking cells reveals shared entity rationale. |
| **Warshall's Algorithm** | Module 3: Reachability | Computes transitive closure reachability matrix $W$ in $O(n^3)$ time, identifying claims reachable through intermediate claims. |
| **Propositional Logic** | Module 1: Logic | Evaluates compound formula $D(A, B) = I(A, B) \land V(A, B) \land B(A, B)$ to flag duplicate candidates with truth table breakdown. |

---

## 5. Mathematical Formulations

### A. Propositional Logic Duplicate Rule (Module 1)
For distinct claims $A$ and $B$ ($A \ne B$):
- $I(A, B) \iff A.\text{incident\_id} = B.\text{incident\_id} \land A.\text{incident\_id} \ne \emptyset$
- $V(A, B) \iff A.\text{vehicle\_id} = B.\text{vehicle\_id} \land A.\text{vehicle\_id} \ne \emptyset$
- $B(A, B) \iff A.\text{invoice\_id} = B.\text{invoice\_id} \land A.\text{invoice\_id} \ne \emptyset$

**Compound Proposition:**
$$D(A, B) = I(A, B) \land V(A, B) \land B(A, B)$$
A candidate duplicate is flagged **if and only if** all three atomic propositions evaluate to True.

### B. Claim-to-Claim Binary Relation (Module 3)
Let $S = \{c_1, c_2, \dots, c_n\}$ be the set of insurance claims.  
The binary relation $R$ on $S$ is defined as:
$$R(A, B) = \begin{cases} 1 & \text{if } A \ne B \text{ and claims } A \text{ and } B \text{ share at least one entity (Vehicle, Customer, Incident, Garage, Invoice)} \\ 0 & \text{otherwise} \end{cases}$$
Self-relations are excluded ($R(A, A) = 0$).

### C. Warshall's Algorithm (Module 3)
Given initial relation matrix $W^{(0)} = M_R$, Warshall's algorithm iteratively computes the reachability matrix $W$:
$$W^{(k)}[i][j] = W^{(k-1)}[i][j] \lor \left(W^{(k-1)}[i][k] \land W^{(k-1)}[k][j]\right)$$
for $k = 1, 2, \dots, n$.  
If $W[i][j] = 1$ while $M_R[i][j] = 0$, claims $i$ and $j$ are **indirectly connected** through a sequence of intermediate claims.

---

## 6. Project Structure

```
ClaimGuard/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ venv/                       # Python virtual environment
â”‚   â”œâ”€â”€ app.py                      # Flask REST API application
â”‚   â”œâ”€â”€ data.py                     # Fictional claim records & in-memory store
â”‚   â”œâ”€â”€ graph_algorithms.py         # BFS, DFS, Components, Path, Relation Matrix, Warshall
â”‚   â”œâ”€â”€ duplicate_rules.py          # Propositional logic duplicate checker
â”‚   â”œâ”€â”€ requirements.txt            # Flask & Flask-CORS dependencies
â”‚   â””â”€â”€ tests/
â”‚       â”œâ”€â”€ test_graph_algorithms.py# Unit tests for graph algorithms & Warshall
â”‚       â”œâ”€â”€ test_duplicate_rules.py # Unit tests for propositional logic rule
â”‚       â””â”€â”€ test_api.py             # REST API integration tests
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ dist/                       # Production build output
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ Sidebar.jsx         # Dark navy navigation sidebar
¦   ¦   ¦   +-- Header.jsx          # Header with backend status, reset button & Light/Dark theme toggle
â”‚   â”‚   â”‚   â”œâ”€â”€ MetricCard.jsx      # Fintech summary metric card
â”‚   â”‚   â”‚   â”œâ”€â”€ StatusBadge.jsx     # Pending / Reviewed / Resolved badges
â”‚   â”‚   â”‚   â”œâ”€â”€ ClaimDetailModal.jsx# Inspection modal dialog & status updater
â”‚   â”‚   â”‚   â””â”€â”€ NetworkGraph.jsx    # Cytoscape.js interactive graph component
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ OverviewPage.jsx    # Metrics dashboard & recent claims
â”‚   â”‚   â”‚   â”œâ”€â”€ ClaimsPage.jsx      # Searchable, filterable claims table & CSV export
â”‚   â”‚   â”‚   â”œâ”€â”€ DuplicateCheckerPage.jsx # Transparent duplicate alerts & custom pair inspector
â”‚   â”‚   â”‚   â”œâ”€â”€ ReviewQueuePage.jsx # Human reviewer workflow queue
â”‚   â”‚   â”‚   â”œâ”€â”€ RelationsPage.jsx   # M_R Matrix & Warshall reachability matrix
â”‚   â”‚   â”‚   â””â”€â”€ MathConceptsPage.jsx# Discrete mathematics curriculum mapping
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â””â”€â”€ api.js              # Centralized backend API client
â”‚   â”‚   â”œâ”€â”€ App.jsx                 # Application root & state coordination
â”‚   â”‚   â”œâ”€â”€ main.jsx                # React DOM root entry
â”‚   â”‚   â””â”€â”€ index.css               # Design system & styles
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ vite.config.js
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md
```

---

## 7. Sample Data Scenarios & Expected Outcomes

The fictional dataset in `backend/data.py` contains 14 claims specifically engineered to demonstrate:

1. **Shared Garage (Direct Relation):**  
   `CLM-201` and `CLM-202` both use Apex Auto Care (`GAR-10`), but have different vehicles, incidents, and invoices.
2. **Indirect Multi-Hop Connection (Transitive Reachability):**  
   `CLM-201` reaches `CLM-203` via:  
   `CLM-201` $\rightarrow$ `GAR-10` $\rightarrow$ `CLM-202` $\rightarrow$ `CUST-102` (Priya Nair) $\rightarrow$ `CLM-203`.  
   Direct relation $M_R[201][203] = 0$, but Warshall reachability $W[201][203] = 1$.
3. **Deliberate Duplicate Candidate:**  
   `CLM-204` and `CLM-205` share incident `INC-304`, vehicle `VEH-504`, and invoice `INV-804`.  
   Evaluates to $D(\text{CLM-204}, \text{CLM-205}) = \text{True}$.
4. **Negative Duplicate Rule Cases:**  
   - `CLM-206` & `CLM-207`: share vehicle `VEH-505`, but distinct incident and invoice $\implies D = \text{False}$.
   - `CLM-208` & `CLM-209`: share collision incident `INC-307` and garage `GAR-16`, but distinct vehicles and invoices $\implies D = \text{False}$.
5. **Disconnected Subgraph Clusters:**  
   - Main Cluster: `CLM-201`, `CLM-202`, `CLM-203`, `CLM-204`, `CLM-205`, `CLM-206`, `CLM-207`, `CLM-208`, `CLM-209`, `CLM-213`.
   - Highway Accident Cluster: `CLM-211` & `CLM-212` at `GAR-18`.
   - Isolated Single-Claim Cluster: `CLM-210` at `GAR-17` and `CLM-214` at `GAR-19`.
6. **Multiple Review Statuses:**  
   `Pending`, `Reviewed`, and `Resolved` claims with real-time status update capability.

---

## 8. Windows Setup & Run Instructions

Commands are tailored for Windows PowerShell. Note that PowerShell blocks `npm.ps1`; always use `npm.cmd`.

### Prerequisites
- Python 3.14+ (Installed at `C:\Python314` or on PATH)
- Node.js 24+ & npm 11+

### Terminal 1: Backend Setup & Launch
```powershell
# 1. Navigate to the backend folder
cd "c:\Users\Prathamesh Samel\ClaimGuard\backend"

# 2. Activate virtual environment (already created)
.\venv\Scripts\Activate.ps1
# (or call python directly: .\venv\Scripts\python.exe)

# 3. Install requirements (if not already installed)
.\venv\Scripts\pip.exe install -r requirements.txt

# 4. Start Flask backend server
.\venv\Scripts\python.exe app.py
```
*The backend API will run on:* `http://127.0.0.1:5000`  
*Health Check endpoint:* `http://127.0.0.1:5000/api/health`

---

### Terminal 2: Frontend Setup & Launch
```powershell
# 1. Open a new PowerShell terminal and navigate to frontend
cd "c:\Users\Prathamesh Samel\ClaimGuard\frontend"

# 2. Install dependencies (if not already installed)
npm.cmd install

# 3. Start the Vite development server
npm.cmd run dev
```
*The frontend application will open on:* `http://localhost:5173`

---

## 9. Running Automated Tests

### A. Backend Unit & Integration Tests (22 Tests)
Run the automated test suite in the backend folder:
```powershell
cd "c:\Users\Prathamesh Samel\ClaimGuard\backend"
.\venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py" -v
```
**Test Results:**
- `test_graph_algorithms.py`: 8 tests (BFS, DFS, Isolated nodes, Components, Invalid nodes, Paths, Disconnected pairs, Warshall manual calculation) â€” **ALL PASSED**.
- `test_duplicate_rules.py`: 6 tests (Matching condition, Differing condition, Different invoice, Self-comparison exclusion, Duplicate pair symmetry, Missing values) â€” **ALL PASSED**.
- `test_api.py`: 8 tests (Health check, Claims endpoint, Graph endpoint, Duplicates, 404 on invalid ID, Valid PATCH status update, Invalid status rejection, Matrix endpoints) â€” **ALL PASSED**.

### B. Frontend Production Build Verification
```powershell
cd "c:\Users\Prathamesh Samel\ClaimGuard\frontend"
npm.cmd run build
```
Builds the production distribution package with zero errors.

---

## 10. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status, service info, and loaded claims count. |
| `GET` | `/api/stats` | Real-time computed overview counts (claims, customers, components, duplicate candidates). |
| `GET` | `/api/claims` | List claims. Supports query params: `search`, `status`, `sort_by`, `sort_order`. |
| `GET` | `/api/claims/<claim_id>` | Detailed record of a single claim. |
| `PATCH`| `/api/claims/<claim_id>/status` | Update review status in session memory (`Pending`, `Reviewed`, `Resolved`). |
| `POST` | `/api/claims/reset` | Resets in-memory store back to default demonstration dataset. |
| `GET` | `/api/graph` | Cytoscape.js formatted elements (nodes and edges) with node metadata. |
| `GET` | `/api/graph/components` | Connected components partition and cluster sizes. |
| `GET` | `/api/graph/bfs/<node_id>` | Executes BFS traversal starting from `node_id`. |
| `GET` | `/api/graph/dfs/<node_id>` | Executes DFS traversal starting from `node_id`. |
| `GET` | `/api/graph/path?source=...&target=...` | Finds shortest connection path between two nodes. |
| `GET` | `/api/relations/matrix` | Returns $n \times n$ claim binary relation matrix $M_R$. |
| `GET` | `/api/relations/reachability` | Computes transitive closure matrix $W$ via Warshall's Algorithm. |
| `GET` | `/api/duplicates` | Returns candidate pairs flagged by $D = I \land V \land B$. |
| `POST` | `/api/duplicates/evaluate` | Evaluates rule $D(A, B)$ for any user-selected pair with truth values. |

---

## 11. Known Limitations & Future Work

1. **In-Memory Session Storage:** Review status updates are kept in backend memory and reset upon server restart. (A persistent database like SQLite or PostgreSQL can be added for persistent storage).
2. **Simplified Duplicate Rule:** The propositional logic rule $D(A, B) = I \land V \land B$ is illustrative for discrete mathematics demonstration, not an exhaustive insurance industry duplicate rule.
3. **Graph Scale:** The graph is optimized for interactive relationship analysis of small-to-medium networks (10â€“1000 nodes) in Cytoscape.js.

---


---

## 12. Vercel Deployment Guide (Services Architecture)

### How it works

ClaimGuard uses Vercel **services** — one project, two independently built services, one public domain:

| Service | Root | Framework | Public? |
|---|---|---|---|
| `backend` | `backend/` | Flask | Via `/api/(.*)` rewrite only |
| `frontend` | `frontend/` | Vite | Via `/(.*)` catch-all rewrite |

Vercel routes all `/api/*` requests to the Flask service and everything else to the React build.
Both are served from **the same domain** (`https://<project>.vercel.app`), so all browser API calls are same-origin — no CORS preflight is ever triggered in production.

No inter-service bindings are needed because the frontend uses relative `/api` paths baked in at build time — it never needs to know the Flask service's internal URL.

> **In-memory state disclosure:** Review status changes (`PATCH /api/claims/<id>/status`) are held in the Flask process's memory only. In Vercel's serverless model, each invocation may run in a separate process. **Status changes do not persist reliably across requests.** Every cold start reloads the original synthetic dataset from `data.py`. The "Reset Data" button resets state within the current warm invocation. This is intentional for an educational demonstration; add a database (e.g. SQLite, Postgres) to make state durable.

---

### Step 1 — Push to GitHub

```powershell
cd "C:\Users\Prathamesh Samel\ClaimGuard"
git init            # skip if already a repo
git add .
git commit -m "chore: configure Vercel services deployment"
git remote add origin https://github.com/<YOUR_USERNAME>/ClaimGuard.git
git push -u origin main
```

---

### Step 2 — Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repository.
2. Vercel detects `vercel.json` automatically. No manual build settings needed.
3. Click **Deploy**.

---

### Step 3 — Environment Variables

No environment variables are required for the default deployment.

**Optional — direct Flask access for development/testing only:**

| Variable | Set where | Value | Purpose |
|---|---|---|---|
| `ALLOWED_ORIGINS` | Local shell only | `http://localhost:5173` | Extra CORS origins for direct Flask access (not needed via Vite proxy or in production) |

Do **not** set `ALLOWED_ORIGINS` or `VITE_API_BASE_URL` in the Vercel dashboard.

---

### Step 4 — Verify after deployment

Test the health endpoint first:
```
GET https://<project>.vercel.app/api/health
```
Expected response:
```json
{"status": "healthy", "service": "ClaimGuard API", "claims_loaded": 14, "version": "1.0.0"}
```

Then test the full API surface:
```
GET  /api/stats
GET  /api/claims
GET  /api/claims/CLM-201
GET  /api/graph
GET  /api/graph/components
GET  /api/graph/bfs/CLM-201
GET  /api/graph/dfs/CLM-201
GET  /api/graph/path?source=CLM-201&target=CLM-203
GET  /api/relations/matrix
GET  /api/relations/reachability
GET  /api/duplicates
POST /api/duplicates/evaluate   body: {"claim_a":"CLM-204","claim_b":"CLM-205"}
PATCH /api/claims/CLM-201/status  body: {"status":"Reviewed"}
```

---

### Local Development (unchanged)

**Terminal 1 — Backend:**
```powershell
cd "C:\Users\Prathamesh Samel\ClaimGuard\backend"
.\venv\Scripts\python.exe app.py
# API runs at http://127.0.0.1:5000
```

**Terminal 2 — Frontend:**
```powershell
cd "C:\Users\Prathamesh Samel\ClaimGuard\frontend"
npm.cmd run dev
# App runs at http://localhost:5173
# Vite proxy forwards /api/* to http://127.0.0.1:5000
```

No environment variables needed locally.

---

### CORS

CORS is configured in `backend/app.py` via the `ALLOWED_ORIGINS` environment variable.

| Context | CORS triggered? | Why |
|---|---|---|
| Production (Vercel) | No | Same-origin: browser calls `https://app.vercel.app/api/*`, which Vercel rewrites internally |
| Local dev (Vite proxy) | No | Vite proxy makes `/api/*` same-origin from the browser's perspective |
| Direct Flask access (`localhost:5000`) | Yes | Different origin — `ALLOWED_ORIGINS` default `http://localhost:5173` allows it |

Default allowed origin: `http://localhost:5173`. Override with `ALLOWED_ORIGINS=origin1,origin2` in your local shell if needed.

---

### Files changed for this deployment

| File | Action | Reason |
|---|---|---|
| `vercel.json` | **Rewritten** | Migrated from legacy `builds`+`routes` format to `services`+`rewrites` format |
| `api/index.py` | **Deleted** | Was a shim for the old single-function format; not used by services |
| `api/requirements.txt` | **Deleted** | Was paired with the deleted shim |
| `api/` directory | **Deleted** | Removed after both files were removed (was empty) |
| `backend/app.py` | **Updated** | Replaced `"*"` wildcard CORS with env-var-driven narrow origin list |
| `frontend/vite.config.js` | **Updated** | Updated proxy comment; no functional change |
