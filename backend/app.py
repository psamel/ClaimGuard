"""
ClaimGuard - Flask Backend REST API
Provides endpoints for claims data, graph algorithms (BFS, DFS, components, paths),
binary relations, Warshall reachability, propositional logic duplicate checking,
and review status updates.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os

from data import (
    get_claims,
    get_claim,
    update_claim_status,
    reset_claims,
    VALID_STATUSES
)
from graph_algorithms import (
    build_relationship_graph,
    bfs,
    dfs,
    get_connected_components,
    find_path,
    compute_claim_relation_matrix,
    warshall_reachability
)
from duplicate_rules import (
    find_all_duplicate_candidates,
    evaluate_pair,
    DISCLAIMER_TEXT
)


app = Flask(__name__)

# ---------------------------------------------------------------------------
# CORS configuration
#
# In production (Vercel services with rewrite-based routing), all browser
# requests to /api/* arrive as same-origin — CORS headers are never checked.
#
# For local development, the Vite proxy (vite.config.js) also makes /api/*
# same-origin from the browser's perspective, so CORS is not triggered there
# either.
#
# Flask-CORS is retained for the case where a developer accesses Flask
# directly (e.g. curl / Postman / browser tab at localhost:5000).
#
# Set the ALLOWED_ORIGINS environment variable to a comma-separated list of
# origins to permit.  The default covers the Vite dev server.
# Do NOT set ALLOWED_ORIGINS in production — it is not needed.
# ---------------------------------------------------------------------------
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
CORS(app, resources={r"/api/*": {"origins": _allowed_origins}})


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    claims = get_claims()
    return jsonify({
        "status": "healthy",
        "service": "ClaimGuard API",
        "timestamp": datetime.now().isoformat(),
        "claims_loaded": len(claims),
        "version": "1.0.0"
    }), 200


@app.route("/api/claims", methods=["GET"])
def list_claims():
    """
    List all claims with optional filtering, search, and sorting.
    Query params:
      - search: string
      - status: 'Pending', 'Reviewed', 'Resolved'
      - sort_by: 'claim_id', 'claim_amount', 'incident_date'
      - sort_order: 'asc', 'desc'
    """
    claims = get_claims()

    search = request.args.get("search", "").strip().lower()
    status_filter = request.args.get("status", "").strip()
    sort_by = request.args.get("sort_by", "claim_id").strip()
    sort_order = request.args.get("sort_order", "asc").strip().lower()

    if status_filter:
        claims = [c for c in claims if c["review_status"].lower() == status_filter.lower()]

    if search:
        def matches_search(c):
            fields_to_check = [
                c.get("claim_id", ""),
                c.get("customer_name", ""),
                c.get("customer_id", ""),
                c.get("vehicle_id", ""),
                c.get("incident_id", ""),
                c.get("garage_id", ""),
                c.get("garage_name", ""),
                c.get("invoice_id", ""),
                str(c.get("claim_amount", ""))
            ]
            return any(search in str(f).lower() for f in fields_to_check)
        claims = [c for c in claims if matches_search(c)]

    # Sorting
    reverse = (sort_order == "desc")
    if sort_by == "claim_amount":
        claims.sort(key=lambda c: c.get("claim_amount", 0), reverse=reverse)
    elif sort_by == "incident_date":
        claims.sort(key=lambda c: c.get("incident_date", ""), reverse=reverse)
    else:
        claims.sort(key=lambda c: c.get("claim_id", ""), reverse=reverse)

    return jsonify({
        "count": len(claims),
        "claims": claims
    }), 200


@app.route("/api/claims/<claim_id>", methods=["GET"])
def get_single_claim(claim_id):
    """Retrieve details for a single claim record."""
    claim = get_claim(claim_id)
    if not claim:
        return jsonify({"error": f"Claim '{claim_id}' not found."}), 404
    return jsonify(claim), 200


@app.route("/api/claims/<claim_id>/status", methods=["PATCH"])
def patch_claim_status(claim_id):
    """
    Update review status of a claim in application memory.
    Request body: {"status": "Pending" | "Reviewed" | "Resolved"}
    """
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "Missing 'status' in request body."}), 400

    if new_status not in VALID_STATUSES:
        return jsonify({
            "error": f"Invalid status '{new_status}'. Allowed values: {sorted(list(VALID_STATUSES))}"
        }), 400

    updated = update_claim_status(claim_id, new_status)
    if not updated:
        return jsonify({"error": f"Claim '{claim_id}' not found."}), 404

    return jsonify({
        "message": f"Status of claim {claim_id} updated to '{new_status}'.",
        "claim": updated,
        "note": "Status updated in application memory for current session."
    }), 200


@app.route("/api/claims/reset", methods=["POST"])
def reset_data():
    """Reset data store to the original fictional demonstration dataset."""
    reset_claims()
    return jsonify({
        "message": "Claims data store successfully reset to original fictional dataset."
    }), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """
    Provides real-time computed overview metrics:
      - Total claims
      - Unique customers
      - Connected claim groups (components)
      - Possible duplicate pairs
      - Review status breakdown
    """
    claims = get_claims()
    graph_data = build_relationship_graph(claims)
    components_info = get_connected_components(graph_data["adj_list"], graph_data["node_map"])
    duplicate_candidates = find_all_duplicate_candidates(claims)

    unique_customers = len(set(c["customer_id"] for c in claims if c.get("customer_id")))
    pending_count = sum(1 for c in claims if c.get("review_status") == "Pending")
    reviewed_count = sum(1 for c in claims if c.get("review_status") == "Reviewed")
    resolved_count = sum(1 for c in claims if c.get("review_status") == "Resolved")

    return jsonify({
        "total_claims": len(claims),
        "unique_customers": unique_customers,
        "connected_components_count": components_info["num_components"],
        "largest_component_size": components_info["largest_component_size"],
        "possible_duplicate_pairs": len(duplicate_candidates),
        "pending_reviews": pending_count,
        "reviewed_claims": reviewed_count,
        "resolved_claims": resolved_count
    }), 200


@app.route("/api/graph", methods=["GET"])
def get_graph():
    """
    Returns graph nodes and edges formatted for Cytoscape.js visualization.
    """
    claims = get_claims()
    graph_data = build_relationship_graph(claims)

    # Convert to Cytoscape elements structure
    cy_elements = []

    for node in graph_data["nodes"]:
        cy_elements.append({
            "data": {
                "id": node["id"],
                "label": node["label"],
                "type": node["type"],
                **node["metadata"]
            }
        })

    for edge in graph_data["edges"]:
        cy_elements.append({
            "data": {
                "id": edge["id"],
                "source": edge["source"],
                "target": edge["target"],
                "label": edge["label"]
            }
        })

    return jsonify({
        "elements": cy_elements,
        "summary": {
            "total_nodes": len(graph_data["nodes"]),
            "total_edges": len(graph_data["edges"]),
            "node_types": {
                "claim": sum(1 for n in graph_data["nodes"] if n["type"] == "claim"),
                "customer": sum(1 for n in graph_data["nodes"] if n["type"] == "customer"),
                "vehicle": sum(1 for n in graph_data["nodes"] if n["type"] == "vehicle"),
                "incident": sum(1 for n in graph_data["nodes"] if n["type"] == "incident"),
                "garage": sum(1 for n in graph_data["nodes"] if n["type"] == "garage"),
                "invoice": sum(1 for n in graph_data["nodes"] if n["type"] == "invoice")
            }
        }
    }), 200


@app.route("/api/graph/components", methods=["GET"])
def get_components_endpoint():
    """Returns connected components analysis of the relationship graph."""
    claims = get_claims()
    graph_data = build_relationship_graph(claims)
    result = get_connected_components(graph_data["adj_list"], graph_data["node_map"])
    return jsonify(result), 200


@app.route("/api/graph/bfs/<node_id>", methods=["GET"])
def bfs_endpoint(node_id):
    """Executes Breadth-First Search traversal from starting node."""
    claims = get_claims()
    graph_data = build_relationship_graph(claims)
    try:
        result = bfs(graph_data["adj_list"], node_id.strip())
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/graph/dfs/<node_id>", methods=["GET"])
def dfs_endpoint(node_id):
    """Executes Depth-First Search traversal from starting node."""
    claims = get_claims()
    graph_data = build_relationship_graph(claims)
    try:
        result = dfs(graph_data["adj_list"], node_id.strip())
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/graph/path", methods=["GET"])
def path_endpoint():
    """
    Finds the shortest relationship path between source and target node.
    Query params:
      - source: node_id
      - target: node_id
    """
    source = request.args.get("source", "").strip()
    target = request.args.get("target", "").strip()

    if not source or not target:
        return jsonify({"error": "Both 'source' and 'target' query parameters are required."}), 400

    claims = get_claims()
    graph_data = build_relationship_graph(claims)

    try:
        result = find_path(graph_data["adj_list"], source, target)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/relations/matrix", methods=["GET"])
def relation_matrix_endpoint():
    """
    Returns the binary claim-to-claim relation matrix M_R.
    R(A, B) = 1 iff Claim A and Claim B share at least one entity.
    """
    claims = get_claims()
    result = compute_claim_relation_matrix(claims)
    return jsonify(result), 200


@app.route("/api/relations/reachability", methods=["GET"])
def reachability_endpoint():
    """
    Computes the transitive reachability matrix using Warshall's Algorithm.
    """
    claims = get_claims()
    rel_result = compute_claim_relation_matrix(claims)
    reach_result = warshall_reachability(rel_result)
    return jsonify(reach_result), 200


@app.route("/api/duplicates", methods=["GET"])
def duplicates_endpoint():
    """
    Evaluates propositional logic duplicate candidate rule across all distinct claim pairs.
    D(A,B) = I(A,B) ^ V(A,B) ^ B(A,B)
    """
    claims = get_claims()
    candidates = find_all_duplicate_candidates(claims)
    return jsonify({
        "candidate_count": len(candidates),
        "rule_definition": "D(A,B) = I(A,B) AND V(A,B) AND B(A,B)",
        "disclaimer": DISCLAIMER_TEXT,
        "candidates": candidates
    }), 200


@app.route("/api/duplicates/evaluate", methods=["POST"])
def evaluate_pair_endpoint():
    """
    Evaluates the duplicate rule proposition between any two user-selected claims.
    Request body: {"claim_a": "CLM-201", "claim_b": "CLM-202"}
    """
    body = request.get_json(silent=True) or {}
    id_a = body.get("claim_a", "").strip()
    id_b = body.get("claim_b", "").strip()

    if not id_a or not id_b:
        return jsonify({"error": "Both 'claim_a' and 'claim_b' are required."}), 400

    claim_a = get_claim(id_a)
    claim_b = get_claim(id_b)

    if not claim_a:
        return jsonify({"error": f"Claim '{id_a}' not found."}), 404
    if not claim_b:
        return jsonify({"error": f"Claim '{id_b}' not found."}), 404

    result = evaluate_pair(claim_a, claim_b)
    return jsonify(result), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
