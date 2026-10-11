"""
ClaimGuard - Discrete Mathematics Graph & Relation Algorithms
Implements Module 6 (Graphs: Adjacency list, BFS, DFS, Connected Components, Paths)
and Module 3 (Relations & Reachability: Binary Claim Relations, Adjacency Matrix, Warshall's Algorithm).
"""

from collections import deque
import copy


def build_relationship_graph(claims):
    """
    Constructs an explainable heterogeneous bipartite/multipartite relationship graph
    from claim records and their associated entities.

    Nodes:
      - Claim nodes: 'CLM-xxx' (type='claim')
      - Customer nodes: 'CUST-xxx' (type='customer')
      - Vehicle nodes: 'VEH-xxx' (type='vehicle')
      - Incident nodes: 'INC-xxx' (type='incident')
      - Garage nodes: 'GAR-xxx' (type='garage')
      - Invoice nodes: 'INV-xxx' (type='invoice')

    Edges:
      Connect each claim to its associated entities:
      - Claim <-> Customer
      - Claim <-> Vehicle
      - Claim <-> Incident
      - Claim <-> Garage
      - Claim <-> Invoice

    Returns:
      dict with:
        'nodes': list of node dicts (id, label, type, metadata)
        'edges': list of edge dicts (id, source, target, label)
        'adj_list': dict mapping node_id -> list of neighbor node_ids
        'node_map': dict mapping node_id -> node dict
    """
    nodes_map = {}
    edges_list = []
    adj_list = {}

    def add_node(node_id, label, node_type, metadata=None):
        if node_id not in nodes_map:
            node_data = {
                "id": node_id,
                "label": label,
                "type": node_type,
                "metadata": metadata or {}
            }
            nodes_map[node_id] = node_data
            adj_list[node_id] = []

    def add_edge(source, target, relation_type):
        edge_id = f"e_{source}_{target}"
        # Undirected in practice: add both directions in adjacency list
        if target not in adj_list[source]:
            adj_list[source].append(target)
        if source not in adj_list[target]:
            adj_list[target].append(source)
        
        edges_list.append({
            "id": edge_id,
            "source": source,
            "target": target,
            "label": relation_type
        })

    for claim in claims:
        c_id = claim["claim_id"]
        # Add claim node
        add_node(c_id, f"Claim {c_id}", "claim", {
            "claim_amount": claim["claim_amount"],
            "review_status": claim["review_status"],
            "incident_date": claim["incident_date"],
            "customer_name": claim.get("customer_name", ""),
            "notes": claim.get("notes", "")
        })

        # Add customer node
        cust_id = claim.get("customer_id")
        if cust_id:
            cust_name = claim.get("customer_name", cust_id)
            add_node(cust_id, f"Customer: {cust_name}", "customer", {"name": cust_name})
            add_edge(c_id, cust_id, "filed_by")

        # Add vehicle node
        veh_id = claim.get("vehicle_id")
        if veh_id:
            add_node(veh_id, f"Vehicle {veh_id}", "vehicle", {})
            add_edge(c_id, veh_id, "involved_vehicle")

        # Add incident node
        inc_id = claim.get("incident_id")
        if inc_id:
            add_node(inc_id, f"Incident {inc_id}", "incident", {"date": claim.get("incident_date", "")})
            add_edge(c_id, inc_id, "associated_incident")

        # Add garage node
        gar_id = claim.get("garage_id")
        if gar_id:
            gar_name = claim.get("garage_name", gar_id)
            add_node(gar_id, f"Garage: {gar_name}", "garage", {"name": gar_name})
            add_edge(c_id, gar_id, "serviced_at")

        # Add invoice node
        inv_id = claim.get("invoice_id")
        if inv_id:
            add_node(inv_id, f"Invoice {inv_id}", "invoice", {})
            add_edge(c_id, inv_id, "billed_invoice")

    return {
        "nodes": list(nodes_map.values()),
        "edges": edges_list,
        "adj_list": adj_list,
        "node_map": nodes_map
    }


def bfs(adj_list, start_node):
    """
    Breadth-First Search (BFS) traversal.
    Explores the graph level-by-level from start_node.

    Returns:
      dict with:
        'start_node': start_node
        'traversal_order': list of nodes visited in order
        'levels': dict mapping node_id -> distance from start_node
        'visited_edges': list of directed tree edges (u, v) traversed
    """
    if start_node not in adj_list:
        raise ValueError(f"Starting node '{start_node}' does not exist in graph.")

    visited = set([start_node])
    traversal_order = [start_node]
    queue = deque([start_node])
    levels = {start_node: 0}
    visited_edges = []

    while queue:
        current = queue.popleft()
        current_level = levels[current]

        # Sort neighbors for deterministic, reproducible traversal order
        for neighbor in sorted(adj_list.get(current, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                traversal_order.append(neighbor)
                levels[neighbor] = current_level + 1
                visited_edges.append({"source": current, "target": neighbor})
                queue.append(neighbor)

    return {
        "start_node": start_node,
        "traversal_order": traversal_order,
        "levels": levels,
        "visited_edges": visited_edges,
        "total_visited": len(traversal_order)
    }


def dfs(adj_list, start_node):
    """
    Depth-First Search (DFS) traversal.
    Explores as deep as possible along each branch before backtracking.

    Returns:
      dict with:
        'start_node': start_node
        'traversal_order': list of nodes visited in order
        'discovery_depth': dict mapping node_id -> depth reached
        'visited_edges': list of tree edges (u, v)
    """
    if start_node not in adj_list:
        raise ValueError(f"Starting node '{start_node}' does not exist in graph.")

    visited = set([start_node])
    traversal_order = [start_node]
    discovery_depth = {start_node: 0}
    visited_edges = []

    def _dfs_helper(node, depth):
        for neighbor in sorted(adj_list.get(node, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                traversal_order.append(neighbor)
                discovery_depth[neighbor] = depth + 1
                visited_edges.append({"source": node, "target": neighbor})
                _dfs_helper(neighbor, depth + 1)

    _dfs_helper(start_node, 0)

    return {
        "start_node": start_node,
        "traversal_order": traversal_order,
        "discovery_depth": discovery_depth,
        "visited_edges": visited_edges,
        "total_visited": len(traversal_order)
    }


def get_connected_components(adj_list, nodes_map):
    """
    Identifies all connected components in the graph using graph traversal.
    Explains that a connected component represents an equivalence class of nodes
    connected by paths, NOT a confirmed fraud ring.

    Returns:
      dict with:
        'num_components': int
        'components': list of component dicts
        'largest_component_size': int
    """
    visited = set()
    components = []
    comp_counter = 1

    # Deterministic iteration over all nodes
    sorted_node_ids = sorted(adj_list.keys())

    for node_id in sorted_node_ids:
        if node_id not in visited:
            comp_nodes = []
            queue = deque([node_id])
            visited.add(node_id)

            while queue:
                curr = queue.popleft()
                comp_nodes.append(curr)
                for neighbor in sorted(adj_list.get(curr, [])):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            claim_nodes = [nid for nid in comp_nodes if nodes_map.get(nid, {}).get("type") == "claim"]
            entity_nodes = [nid for nid in comp_nodes if nodes_map.get(nid, {}).get("type") != "claim"]

            components.append({
                "component_id": comp_counter,
                "size": len(comp_nodes),
                "nodes": comp_nodes,
                "claims": sorted(claim_nodes),
                "claim_count": len(claim_nodes),
                "entity_count": len(entity_nodes),
                "is_isolated_claim": len(claim_nodes) == 1 and len(comp_nodes) <= 6
            })
            comp_counter += 1

    # Sort components by size descending
    components.sort(key=lambda c: c["size"], reverse=True)
    for idx, c in enumerate(components):
        c["component_id"] = idx + 1

    largest_size = components[0]["size"] if components else 0

    return {
        "num_components": len(components),
        "largest_component_size": largest_size,
        "components": components,
        "mathematical_explanation": (
            "In graph theory, a connected component is a maximal connected subgraph where every "
            "pair of vertices is connected by a path. In ClaimGuard, this separates mutually independent "
            "claim groups from claims sharing garages, vehicles, or customers. It does NOT imply collusion."
        )
    }


def find_path(adj_list, source, target):
    """
    Finds the shortest relationship path between two nodes using BFS.
    Explains the chain of direct and indirect associations.

    Returns:
      dict with:
        'found': bool
        'source': source
        'target': target
        'path': list of node_ids in order [source, ..., target]
        'length': number of edges (len(path)-1)
        'explanation': human-readable explanation of the chain
    """
    if source not in adj_list:
        raise ValueError(f"Source node '{source}' does not exist in graph.")
    if target not in adj_list:
        raise ValueError(f"Target node '{target}' does not exist in graph.")

    if source == target:
        return {
            "found": True,
            "source": source,
            "target": target,
            "path": [source],
            "length": 0,
            "explanation": f"Source and target are the identical node ({source})."
        }

    visited = {source}
    parent = {source: None}
    queue = deque([source])
    found = False

    while queue:
        curr = queue.popleft()
        if curr == target:
            found = True
            break
        for neighbor in sorted(adj_list.get(curr, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = curr
                queue.append(neighbor)

    if not found:
        return {
            "found": False,
            "source": source,
            "target": target,
            "path": [],
            "length": -1,
            "explanation": f"No path exists between '{source}' and '{target}'. They belong to disconnected components."
        }

    # Reconstruct path
    curr = target
    path = []
    while curr is not None:
        path.append(curr)
        curr = parent[curr]
    path.reverse()

    explanation = f"Connection path of {len(path)-1} step(s): " + " -> ".join(path)

    return {
        "found": True,
        "source": source,
        "target": target,
        "path": path,
        "length": len(path) - 1,
        "explanation": explanation
    }


# =========================================================================
# Discrete Mathematics Module 3: Binary Relations & Warshall's Algorithm
# =========================================================================

def compute_claim_relation_matrix(claims, shared_entity_types=None):
    """
    Defines a binary relation R on the set S of claims:
      R(A, B) = true <=> Claim A and Claim B (A != B) share at least one selected entity.
    
    By standard mathematical formulation for relationship networks, self-relations
    R(A, A) = 0 (distinct claim relationship).

    Entities considered:
      - vehicle_id
      - customer_id
      - incident_id
      - garage_id
      - invoice_id

    Returns:
      dict with:
        'claim_ids': list of claim IDs (row and column labels)
        'matrix': n x n 2D list of 0s and 1s
        'reasons': dict mapping "A,B" -> list of shared entities
        'density': float ratio of 1s to possible pairs
    """
    if shared_entity_types is None:
        shared_entity_types = ["vehicle_id", "customer_id", "incident_id", "garage_id", "invoice_id"]

    sorted_claims = sorted(claims, key=lambda c: c["claim_id"])
    claim_ids = [c["claim_id"] for c in sorted_claims]
    n = len(claim_ids)

    matrix = [[0 for _ in range(n)] for _ in range(n)]
    reasons = {}

    entity_keys = {
        "vehicle_id": "Vehicle",
        "customer_id": "Customer",
        "incident_id": "Incident",
        "garage_id": "Garage",
        "invoice_id": "Invoice"
    }

    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = 0
                continue
            
            c_a = sorted_claims[i]
            c_b = sorted_claims[j]
            shared_items = []

            for ek in shared_entity_types:
                val_a = c_a.get(ek)
                val_b = c_b.get(ek)
                if val_a and val_b and val_a == val_b:
                    label = entity_keys.get(ek, ek)
                    shared_items.append(f"{label}: {val_a}")

            if shared_items:
                matrix[i][j] = 1
                key = f"{c_a['claim_id']},{c_b['claim_id']}"
                reasons[key] = shared_items

    total_possible = n * (n - 1) if n > 1 else 1
    total_ones = sum(sum(row) for row in matrix)
    density = round(total_ones / total_possible, 4)

    return {
        "claim_ids": claim_ids,
        "matrix": matrix,
        "reasons": reasons,
        "n": n,
        "total_direct_relations": total_ones // 2,
        "density": density,
        "definition": "R(A, B) = 1 iff Claim A and Claim B share at least one entity (Vehicle, Customer, Incident, Garage, or Invoice), with R(A, A) = 0."
    }


def warshall_reachability(relation_result):
    """
    Computes the transitive closure reachability matrix using Warshall's Algorithm.

    Given initial binary relation matrix W^(0) = M_R,
    Warshall's algorithm iteratively computes:
      W^(k)[i][j] = W^(k-1)[i][j] OR (W^(k-1)[i][k] AND W^(k-1)[k][j])
    for k = 0, 1, ..., n-1.

    At step k, it checks whether path from i to j exists using vertices from {0, ..., k}
    as intermediate points.

    Returns:
      dict with:
        'claim_ids': list of claim IDs
        'initial_matrix': M_R
        'reachability_matrix': transitive closure matrix W
        'intermediate_milestones': key intermediate changes
        'newly_reachable_pairs': pairs reachable indirectly but not directly
        'mathematical_explanation': explanation of Warshall's formulation
    """
    claim_ids = relation_result["claim_ids"]
    initial_matrix = relation_result["matrix"]
    n = len(claim_ids)

    # Deep copy for W
    W = [row[:] for row in initial_matrix]
    
    milestones = []
    newly_reachable = []

    for k in range(n):
        intermediate_claim = claim_ids[k]
        changes_in_step = 0

        for i in range(n):
            for j in range(n):
                if i != j and not W[i][j]:
                    if W[i][k] and W[k][j]:
                        W[i][j] = 1
                        changes_in_step += 1
                        pair = (claim_ids[i], claim_ids[j])
                        rev_pair = (claim_ids[j], claim_ids[i])
                        if pair not in [p["pair"] for p in newly_reachable] and rev_pair not in [p["pair"] for p in newly_reachable]:
                            newly_reachable.append({
                                "pair": pair,
                                "via": intermediate_claim,
                                "explanation": f"{claim_ids[i]} can reach {claim_ids[j]} via intermediate claim {intermediate_claim}."
                            })

        if changes_in_step > 0:
            milestones.append({
                "step_k": k,
                "intermediate_claim": intermediate_claim,
                "new_connections_added": changes_in_step
            })

    return {
        "claim_ids": claim_ids,
        "n": n,
        "initial_matrix": initial_matrix,
        "reachability_matrix": W,
        "milestones": milestones,
        "newly_reachable_pairs": newly_reachable,
        "total_reachable_pairs": sum(sum(row) for row in W) // 2,
        "mathematical_explanation": (
            "Warshall's algorithm computes the transitive closure W of relation R in O(n^3) time. "
            "A value of W[i][j] = 1 indicates that claim i is reachable from claim j either directly "
            "or indirectly through a sequence of intermediate shared claims. "
            "It computes reachability and does NOT compute fraud probability."
        )
    }
