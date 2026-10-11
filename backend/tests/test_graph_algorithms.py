"""
Automated Unit Tests for Graph Algorithms and Discrete Mathematics Module 6 & 3:
- BFS traversal
- DFS traversal
- Isolated node handling
- Connected components
- Invalid start node handling
- Path finding (reachable and disconnected)
- Binary claim relations matrix
- Warshall's Algorithm reachability
"""

import unittest
import sys
import os

# Add parent directory to sys.path so backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from data import get_claims
from graph_algorithms import (
    build_relationship_graph,
    bfs,
    dfs,
    get_connected_components,
    find_path,
    compute_claim_relation_matrix,
    warshall_reachability
)


class TestGraphAlgorithms(unittest.TestCase):

    def setUp(self):
        self.claims = get_claims()
        self.graph = build_relationship_graph(self.claims)
        self.adj = self.graph["adj_list"]
        self.node_map = self.graph["node_map"]

    def test_bfs_visits_expected_nodes(self):
        """BFS visits all reachable nodes and records traversal order."""
        res = bfs(self.adj, "CLM-201")
        self.assertEqual(res["start_node"], "CLM-201")
        self.assertIn("CLM-201", res["traversal_order"])
        # CLM-201 connects to GAR-10, which connects to CLM-202
        self.assertIn("GAR-10", res["traversal_order"])
        self.assertIn("CLM-202", res["traversal_order"])
        # Isolated claim CLM-210 should NOT be reached from CLM-201
        self.assertNotIn("CLM-210", res["traversal_order"])
        self.assertEqual(len(res["traversal_order"]), len(set(res["traversal_order"])))

    def test_dfs_visits_expected_nodes(self):
        """DFS visits all reachable nodes with valid depth tracking."""
        res = dfs(self.adj, "CLM-201")
        self.assertEqual(res["start_node"], "CLM-201")
        self.assertIn("CLM-201", res["traversal_order"])
        self.assertIn("GAR-10", res["traversal_order"])
        self.assertNotIn("CLM-210", res["traversal_order"])
        self.assertEqual(len(res["traversal_order"]), len(set(res["traversal_order"])))

    def test_isolated_node_handling(self):
        """An isolated node or its component is traversed without breaking."""
        # CLM-210 is isolated from the main component
        res_bfs = bfs(self.adj, "CLM-210")
        # Should only visit CLM-210 and its private entities (CUST-108, VEH-508, INC-308, GAR-17, INV-809)
        self.assertIn("CLM-210", res_bfs["traversal_order"])
        self.assertIn("GAR-17", res_bfs["traversal_order"])
        self.assertNotIn("CLM-201", res_bfs["traversal_order"])
        self.assertNotIn("GAR-10", res_bfs["traversal_order"])

    def test_connected_components(self):
        """Connected components correctly group partitioned subgraphs."""
        res = get_connected_components(self.adj, self.node_map)
        self.assertGreaterEqual(res["num_components"], 3)
        
        # Verify that CLM-201 and CLM-202 belong to the same component
        main_comp = None
        for comp in res["components"]:
            if "CLM-201" in comp["claims"]:
                main_comp = comp
                break
        self.assertIsNotNone(main_comp)
        self.assertIn("CLM-202", main_comp["claims"])
        self.assertIn("CLM-203", main_comp["claims"])
        self.assertNotIn("CLM-210", main_comp["claims"])

        # Verify isolated claim CLM-210 is in its own component
        iso_comp = None
        for comp in res["components"]:
            if "CLM-210" in comp["claims"]:
                iso_comp = comp
                break
        self.assertIsNotNone(iso_comp)
        self.assertEqual(iso_comp["claim_count"], 1)

    def test_invalid_starting_node_handled(self):
        """BFS and DFS raise ValueError on non-existent node IDs."""
        with self.assertRaises(ValueError):
            bfs(self.adj, "NON_EXISTENT_NODE_999")
        with self.assertRaises(ValueError):
            dfs(self.adj, "NON_EXISTENT_NODE_999")

    def test_known_path_found(self):
        """Path finding returns the shortest connecting path between related claims."""
        # CLM-201 and CLM-202 share GAR-10: path length 2 (CLM-201 -> GAR-10 -> CLM-202)
        res = find_path(self.adj, "CLM-201", "CLM-202")
        self.assertTrue(res["found"])
        self.assertEqual(res["length"], 2)
        self.assertEqual(res["path"], ["CLM-201", "GAR-10", "CLM-202"])

        # CLM-201 to CLM-203 is indirect: CLM-201 -> GAR-10 -> CLM-202 -> CUST-102 -> CLM-203 (4 steps)
        res_indirect = find_path(self.adj, "CLM-201", "CLM-203")
        self.assertTrue(res_indirect["found"])
        self.assertEqual(res_indirect["path"][0], "CLM-201")
        self.assertEqual(res_indirect["path"][-1], "CLM-203")

    def test_disconnected_pair_has_no_path(self):
        """Disconnected claims return found=False with clear explanation."""
        res = find_path(self.adj, "CLM-201", "CLM-210")
        self.assertFalse(res["found"])
        self.assertEqual(res["path"], [])
        self.assertEqual(res["length"], -1)
        self.assertIn("disconnected", res["explanation"].lower())

    def test_warshall_reachability_manual_comparison(self):
        """Warshall reachability matches mathematical transitive closure."""
        # Simple 3-node manual test graph:
        # 0 -> 1, 1 -> 2. Reachability should show 0 reaches 2.
        test_matrix_data = {
            "claim_ids": ["C1", "C2", "C3"],
            "matrix": [
                [0, 1, 0],
                [1, 0, 1],
                [0, 1, 0]
            ]
        }
        reach = warshall_reachability(test_matrix_data)
        W = reach["reachability_matrix"]
        # Since C1 connects to C2 and C2 connects to C3, C1 should reach C3: W[0][2] == 1
        self.assertEqual(W[0][1], 1)
        self.assertEqual(W[0][2], 1)
        self.assertEqual(W[2][0], 1)

        # Real claim data test:
        rel_matrix = compute_claim_relation_matrix(self.claims)
        warshall_res = warshall_reachability(rel_matrix)
        c_ids = warshall_res["claim_ids"]
        idx_201 = c_ids.index("CLM-201")
        idx_203 = c_ids.index("CLM-203")
        idx_210 = c_ids.index("CLM-210")

        # CLM-201 is reachable to CLM-203 via Priya Nair
        self.assertEqual(warshall_res["reachability_matrix"][idx_201][idx_203], 1)
        # CLM-201 cannot reach isolated CLM-210
        self.assertEqual(warshall_res["reachability_matrix"][idx_201][idx_210], 0)


if __name__ == "__main__":
    unittest.main()
