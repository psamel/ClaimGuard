"""
ClaimGuard - Discrete Mathematics Module 1: Propositional Logic Duplicate Rule Checker

Defines and evaluates the deterministic duplicate-candidate rule:
  For distinct claims A and B:
    I(A, B): A.incident_id == B.incident_id (and not empty)
    V(A, B): A.vehicle_id == B.vehicle_id (and not empty)
    B_rule(A, B): A.invoice_id == B.invoice_id (and not empty)

  Compound Proposition:
    D(A, B) = I(A, B) ^ V(A, B) ^ B_rule(A, B)

A pair is flagged as a duplicate candidate ONLY when all three atomic conditions are TRUE.
"""

DISCLAIMER_TEXT = (
    "Possible duplicate does not mean confirmed fraud. "
    "All alerts require independent human verification."
)


def evaluate_pair(claim_a, claim_b):
    """
    Evaluates the duplicate proposition D(A, B) for two specific claims.

    Returns detailed propositional logic breakdown:
      - truth values of atomic propositions I, V, B_rule
      - overall compound truth value D
      - comparison details (field values for both claims)
      - formal logical proof / explanation
    """
    if not claim_a or not claim_b:
        raise ValueError("Both claims must be valid dictionary objects.")

    id_a = claim_a.get("claim_id", "")
    id_b = claim_b.get("claim_id", "")

    if id_a == id_b:
        return {
            "claim_a_id": id_a,
            "claim_b_id": id_b,
            "is_self_comparison": True,
            "is_duplicate_candidate": False,
            "explanation": "Self-comparison excluded: a claim cannot be compared against itself.",
            "conditions": {
                "incident_match": False,
                "vehicle_match": False,
                "invoice_match": False
            },
            "disclaimer": DISCLAIMER_TEXT
        }

    # Extract field values safely
    inc_a = (claim_a.get("incident_id") or "").strip()
    inc_b = (claim_b.get("incident_id") or "").strip()

    veh_a = (claim_a.get("vehicle_id") or "").strip()
    veh_b = (claim_b.get("vehicle_id") or "").strip()

    inv_a = (claim_a.get("invoice_id") or "").strip()
    inv_b = (claim_b.get("invoice_id") or "").strip()

    # Atomic propositions (must be non-empty and equal)
    cond_incident = bool(inc_a and inc_b and inc_a == inc_b)
    cond_vehicle = bool(veh_a and veh_b and veh_a == veh_b)
    cond_invoice = bool(inv_a and inv_b and inv_a == inv_b)

    # Conjunction: D(A, B) = I(A, B) ^ V(A, B) ^ B_rule(A, B)
    is_duplicate = cond_incident and cond_vehicle and cond_invoice

    # Build clear formal explanation
    if is_duplicate:
        explanation = (
            f"Possible duplicate candidate: both records share incident ID '{inc_a}', "
            f"vehicle ID '{veh_a}', and invoice ID '{inv_a}'. "
            f"All three conditions I(A,B) [True], V(A,B) [True], and B(A,B) [True] are satisfied. "
            f"Human verification is required."
        )
    else:
        failed_conditions = []
        if not cond_incident:
            failed_conditions.append(f"I(A,B) is False (Incident IDs: '{inc_a}' vs '{inc_b}')")
        if not cond_vehicle:
            failed_conditions.append(f"V(A,B) is False (Vehicle IDs: '{veh_a}' vs '{veh_b}')")
        if not cond_invoice:
            failed_conditions.append(f"B(A,B) is False (Invoice IDs: '{inv_a}' vs '{inv_b}')")
        
        explanation = (
            f"Not a duplicate candidate. Conjunction D(A,B) evaluates to False because: "
            + "; ".join(failed_conditions)
            + "."
        )

    return {
        "claim_a_id": id_a,
        "claim_b_id": id_b,
        "is_self_comparison": False,
        "is_duplicate_candidate": is_duplicate,
        "truth_values": {
            "I": cond_incident,
            "V": cond_vehicle,
            "B": cond_invoice,
            "D": is_duplicate
        },
        "formula": "D(A,B) = I(A,B) ^ V(A,B) ^ B(A,B)",
        "fields": {
            "incident": {"a": inc_a, "b": inc_b, "match": cond_incident},
            "vehicle": {"a": veh_a, "b": veh_b, "match": cond_vehicle},
            "invoice": {"a": inv_a, "b": inv_b, "match": cond_invoice}
        },
        "claims_summary": {
            "claim_a": {
                "claim_id": id_a,
                "customer_name": claim_a.get("customer_name"),
                "claim_amount": claim_a.get("claim_amount"),
                "review_status": claim_a.get("review_status")
            },
            "claim_b": {
                "claim_id": id_b,
                "customer_name": claim_b.get("customer_name"),
                "claim_amount": claim_b.get("claim_amount"),
                "review_status": claim_b.get("review_status")
            }
        },
        "explanation": explanation,
        "disclaimer": DISCLAIMER_TEXT
    }


def find_all_duplicate_candidates(claims):
    """
    Scans all pairs of distinct claims (A, B) where A < B to prevent redundant pairs (B, A).
    Evaluates propositional formula D(A, B).

    Returns list of candidate match objects.
    """
    candidates = []
    n = len(claims)

    for i in range(n):
        for j in range(i + 1, n):
            c_a = claims[i]
            c_b = claims[j]
            result = evaluate_pair(c_a, c_b)
            if result["is_duplicate_candidate"]:
                candidates.append(result)

    return candidates
