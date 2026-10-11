"""
Automated Unit Tests for Duplicate Rules and Propositional Logic:
- Matching incident, vehicle, and invoice flagged as duplicate candidate
- Differing in one required identifier is not flagged
- Different invoices do not match
- Identical claim IDs are not compared against themselves
- Same pair not returned twice (no redundant A-B and B-A)
- Missing or None identifiers handled safely
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from data import get_claims, get_claim
from duplicate_rules import evaluate_pair, find_all_duplicate_candidates


class TestDuplicateRules(unittest.TestCase):

    def setUp(self):
        self.claims = get_claims()

    def test_matching_all_identifiers_is_flagged(self):
        """A pair with identical incident, vehicle, and invoice IDs is flagged."""
        claim_204 = get_claim("CLM-204")
        claim_205 = get_claim("CLM-205")
        
        # Verify precondition in sample data
        self.assertEqual(claim_204["incident_id"], claim_205["incident_id"])
        self.assertEqual(claim_204["vehicle_id"], claim_205["vehicle_id"])
        self.assertEqual(claim_204["invoice_id"], claim_205["invoice_id"])

        res = evaluate_pair(claim_204, claim_205)
        self.assertTrue(res["is_duplicate_candidate"])
        self.assertTrue(res["truth_values"]["I"])
        self.assertTrue(res["truth_values"]["V"])
        self.assertTrue(res["truth_values"]["B"])
        self.assertTrue(res["truth_values"]["D"])
        self.assertIn("Possible duplicate candidate", res["explanation"])

    def test_differing_in_one_identifier_not_flagged(self):
        """A pair differing in vehicle or incident is NOT flagged."""
        # CLM-208 and CLM-209 share incident INC-307, but different vehicles (VEH-506 vs VEH-507) and invoices
        c_208 = get_claim("CLM-208")
        c_209 = get_claim("CLM-209")
        res = evaluate_pair(c_208, c_209)
        
        self.assertFalse(res["is_duplicate_candidate"])
        self.assertTrue(res["truth_values"]["I"])
        self.assertFalse(res["truth_values"]["V"])
        self.assertFalse(res["truth_values"]["B"])
        self.assertFalse(res["truth_values"]["D"])

    def test_different_invoices_do_not_match(self):
        """Claims with same incident and vehicle but different invoices are not flagged."""
        c_a = {
            "claim_id": "TEST-1",
            "incident_id": "INC-999",
            "vehicle_id": "VEH-999",
            "invoice_id": "INV-111"
        }
        c_b = {
            "claim_id": "TEST-2",
            "incident_id": "INC-999",
            "vehicle_id": "VEH-999",
            "invoice_id": "INV-222"
        }
        res = evaluate_pair(c_a, c_b)
        self.assertFalse(res["is_duplicate_candidate"])
        self.assertTrue(res["truth_values"]["I"])
        self.assertTrue(res["truth_values"]["V"])
        self.assertFalse(res["truth_values"]["B"])
        self.assertFalse(res["truth_values"]["D"])

    def test_identical_claim_ids_not_compared_against_themselves(self):
        """Comparing a claim against itself is rejected as self-comparison."""
        claim_201 = get_claim("CLM-201")
        res = evaluate_pair(claim_201, claim_201)
        self.assertTrue(res["is_self_comparison"])
        self.assertFalse(res["is_duplicate_candidate"])

    def test_same_pair_not_returned_twice(self):
        """find_all_duplicate_candidates does not return both (A, B) and (B, A)."""
        candidates = find_all_duplicate_candidates(self.claims)
        self.assertEqual(len(candidates), 1)
        
        candidate = candidates[0]
        self.assertEqual(candidate["claim_a_id"], "CLM-204")
        self.assertEqual(candidate["claim_b_id"], "CLM-205")

        # Ensure no reverse pair exists
        reverse_found = any(
            c["claim_a_id"] == "CLM-205" and c["claim_b_id"] == "CLM-204"
            for c in candidates
        )
        self.assertFalse(reverse_found)

    def test_missing_identifiers_handled_safely(self):
        """Missing or None fields do not raise errors and evaluate to False."""
        c_empty_1 = {"claim_id": "EMPTY-1", "incident_id": None, "vehicle_id": "", "invoice_id": "INV-1"}
        c_empty_2 = {"claim_id": "EMPTY-2", "incident_id": None, "vehicle_id": "   ", "invoice_id": "INV-1"}
        
        res = evaluate_pair(c_empty_1, c_empty_2)
        self.assertFalse(res["is_duplicate_candidate"])
        self.assertFalse(res["truth_values"]["I"])
        self.assertFalse(res["truth_values"]["V"])
        self.assertTrue(res["truth_values"]["B"])
        self.assertFalse(res["truth_values"]["D"])


if __name__ == "__main__":
    unittest.main()
