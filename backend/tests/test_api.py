"""
Automated Integration Tests for Flask API:
- Health endpoint
- Claims list and search
- Graph nodes and edges
- Duplicates list
- Invalid ID handling
- Valid status update
- Invalid status rejection
"""

import unittest
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from data import reset_claims


class TestAPIEndpoints(unittest.TestCase):

    def setUp(self):
        reset_claims()
        self.client = app.test_client()

    def tearDown(self):
        reset_claims()

    def test_health_endpoint(self):
        """GET /api/health returns 200 and healthy status."""
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertEqual(data["status"], "healthy")
        self.assertGreaterEqual(data["claims_loaded"], 12)

    def test_claims_endpoint(self):
        """GET /api/claims returns list of claims."""
        resp = self.client.get("/api/claims")
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertGreaterEqual(data["count"], 12)
        self.assertEqual(len(data["claims"]), data["count"])

    def test_graph_endpoint(self):
        """GET /api/graph returns valid Cytoscape elements structure."""
        resp = self.client.get("/api/graph")
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertIn("elements", data)
        self.assertIn("summary", data)
        self.assertGreater(data["summary"]["total_nodes"], 0)
        self.assertGreater(data["summary"]["total_edges"], 0)

    def test_duplicates_endpoint(self):
        """GET /api/duplicates returns expected candidate pair."""
        resp = self.client.get("/api/duplicates")
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertEqual(data["candidate_count"], 1)
        cand = data["candidates"][0]
        self.assertEqual(cand["claim_a_id"], "CLM-204")
        self.assertEqual(cand["claim_b_id"], "CLM-205")

    def test_invalid_claim_id_returns_404(self):
        """GET /api/claims/<invalid_id> returns 404."""
        resp = self.client.get("/api/claims/CLM-NON-EXISTENT")
        self.assertEqual(resp.status_code, 404)
        data = json.loads(resp.data)
        self.assertIn("error", data)

    def test_valid_status_update(self):
        """PATCH /api/claims/<id>/status with valid status updates state."""
        # Initial status of CLM-201 is Pending
        resp = self.client.patch(
            "/api/claims/CLM-201/status",
            data=json.dumps({"status": "Resolved"}),
            content_type="application/json"
        )
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertEqual(data["claim"]["review_status"], "Resolved")

        # Verify via GET
        get_resp = self.client.get("/api/claims/CLM-201")
        self.assertEqual(get_resp.status_code, 200)
        get_data = json.loads(get_resp.data)
        self.assertEqual(get_data["review_status"], "Resolved")

    def test_invalid_status_rejected(self):
        """PATCH /api/claims/<id>/status with invalid status returns 400."""
        resp = self.client.patch(
            "/api/claims/CLM-201/status",
            data=json.dumps({"status": "ApprovedFraudulent"}),
            content_type="application/json"
        )
        self.assertEqual(resp.status_code, 400)
        data = json.loads(resp.data)
        self.assertIn("error", data)

    def test_relations_matrix_and_reachability(self):
        """GET /api/relations/matrix and reachability return consistent shapes."""
        resp_mat = self.client.get("/api/relations/matrix")
        self.assertEqual(resp_mat.status_code, 200)
        mat_data = json.loads(resp_mat.data)
        self.assertEqual(len(mat_data["matrix"]), mat_data["n"])

        resp_reach = self.client.get("/api/relations/reachability")
        self.assertEqual(resp_reach.status_code, 200)
        reach_data = json.loads(resp_reach.data)
        self.assertEqual(len(reach_data["reachability_matrix"]), reach_data["n"])


if __name__ == "__main__":
    unittest.main()
