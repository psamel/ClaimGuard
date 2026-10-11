"""
ClaimGuard - Fictional Insurance Claims Data Store
This module provides in-memory demonstration claim records and management functions.
All data is entirely fictional for academic and educational evaluation.
"""

import copy

INITIAL_CLAIMS = [
    {
        "claim_id": "CLM-201",
        "customer_id": "CUST-101",
        "customer_name": "Rajesh Sharma",
        "vehicle_id": "VEH-501",
        "incident_id": "INC-301",
        "garage_id": "GAR-10",
        "garage_name": "Apex Auto Care",
        "invoice_id": "INV-801",
        "incident_date": "2026-03-01",
        "claim_amount": 42000,
        "review_status": "Pending",
        "notes": "Single-vehicle bumper and grille damage."
    },
    {
        "claim_id": "CLM-202",
        "customer_id": "CUST-102",
        "customer_name": "Priya Nair",
        "vehicle_id": "VEH-502",
        "incident_id": "INC-302",
        "garage_id": "GAR-10",
        "garage_name": "Apex Auto Care",
        "invoice_id": "INV-802",
        "incident_date": "2026-03-04",
        "claim_amount": 38500,
        "review_status": "Reviewed",
        "notes": "Shared garage GAR-10 with CLM-201; distinct incident and vehicle."
    },
    {
        "claim_id": "CLM-203",
        "customer_id": "CUST-102",
        "customer_name": "Priya Nair",
        "vehicle_id": "VEH-503",
        "incident_id": "INC-303",
        "garage_id": "GAR-12",
        "garage_name": "Metro Motors",
        "invoice_id": "INV-803",
        "incident_date": "2026-03-10",
        "claim_amount": 65000,
        "review_status": "Pending",
        "notes": "Second claim by customer Priya Nair; links GAR-10 to GAR-12 via customer."
    },
    {
        "claim_id": "CLM-204",
        "customer_id": "CUST-103",
        "customer_name": "Amit Verma",
        "vehicle_id": "VEH-504",
        "incident_id": "INC-304",
        "garage_id": "GAR-14",
        "garage_name": "Speedy Repairs",
        "invoice_id": "INV-804",
        "incident_date": "2026-03-12",
        "claim_amount": 52000,
        "review_status": "Pending",
        "notes": "Claim for alleged intersection collision; duplicate candidate with CLM-205."
    },
    {
        "claim_id": "CLM-205",
        "customer_id": "CUST-104",
        "customer_name": "Sunita Verma",
        "vehicle_id": "VEH-504",
        "incident_id": "INC-304",
        "garage_id": "GAR-14",
        "garage_name": "Speedy Repairs",
        "invoice_id": "INV-804",
        "incident_date": "2026-03-12",
        "claim_amount": 52000,
        "review_status": "Pending",
        "notes": "Deliberate candidate duplicate sharing same incident, vehicle, and invoice as CLM-204."
    },
    {
        "claim_id": "CLM-206",
        "customer_id": "CUST-105",
        "customer_name": "Vikram Rao",
        "vehicle_id": "VEH-505",
        "incident_id": "INC-305",
        "garage_id": "GAR-15",
        "garage_name": "Precision Works",
        "invoice_id": "INV-805",
        "incident_date": "2026-03-15",
        "claim_amount": 28000,
        "review_status": "Resolved",
        "notes": "Legitimate claim for windshield glass replacement."
    },
    {
        "claim_id": "CLM-207",
        "customer_id": "CUST-105",
        "customer_name": "Vikram Rao",
        "vehicle_id": "VEH-505",
        "incident_id": "INC-306",
        "garage_id": "GAR-15",
        "garage_name": "Precision Works",
        "invoice_id": "INV-806",
        "incident_date": "2026-03-18",
        "claim_amount": 31000,
        "review_status": "Pending",
        "notes": "Subsequent incident for same customer and vehicle; separate invoice and incident ID."
    },
    {
        "claim_id": "CLM-208",
        "customer_id": "CUST-106",
        "customer_name": "Ananya Sen",
        "vehicle_id": "VEH-506",
        "incident_id": "INC-307",
        "garage_id": "GAR-16",
        "garage_name": "National Bodyworks",
        "invoice_id": "INV-807",
        "incident_date": "2026-03-20",
        "claim_amount": 45000,
        "review_status": "Reviewed",
        "notes": "Two-car collision incident INC-307; party 1."
    },
    {
        "claim_id": "CLM-209",
        "customer_id": "CUST-107",
        "customer_name": "Rohan Deshmukh",
        "vehicle_id": "VEH-507",
        "incident_id": "INC-307",
        "garage_id": "GAR-16",
        "garage_name": "National Bodyworks",
        "invoice_id": "INV-808",
        "incident_date": "2026-03-20",
        "claim_amount": 49000,
        "review_status": "Pending",
        "notes": "Two-car collision incident INC-307; party 2. Shares incident and garage, but distinct vehicle and invoice."
    },
    {
        "claim_id": "CLM-210",
        "customer_id": "CUST-108",
        "customer_name": "Meera Joshi",
        "vehicle_id": "VEH-508",
        "incident_id": "INC-308",
        "garage_id": "GAR-17",
        "garage_name": "Sunrise Garage",
        "invoice_id": "INV-809",
        "incident_date": "2026-03-22",
        "claim_amount": 19500,
        "review_status": "Resolved",
        "notes": "Completely isolated claim with unique entities; disconnected graph component."
    },
    {
        "claim_id": "CLM-211",
        "customer_id": "CUST-109",
        "customer_name": "Karan Malhotra",
        "vehicle_id": "VEH-509",
        "incident_id": "INC-309",
        "garage_id": "GAR-18",
        "garage_name": "Highway Garage",
        "invoice_id": "INV-810",
        "incident_date": "2026-03-25",
        "claim_amount": 75000,
        "review_status": "Pending",
        "notes": "Separate disconnected cluster - Highway collision party 1."
    },
    {
        "claim_id": "CLM-212",
        "customer_id": "CUST-110",
        "customer_name": "Sneha Patil",
        "vehicle_id": "VEH-510",
        "incident_id": "INC-309",
        "garage_id": "GAR-18",
        "garage_name": "Highway Garage",
        "invoice_id": "INV-811",
        "incident_date": "2026-03-25",
        "claim_amount": 82000,
        "review_status": "Pending",
        "notes": "Separate disconnected cluster - Highway collision party 2."
    },
    {
        "claim_id": "CLM-213",
        "customer_id": "CUST-111",
        "customer_name": "Deepa Gupta",
        "vehicle_id": "VEH-511",
        "incident_id": "INC-310",
        "garage_id": "GAR-12",
        "garage_name": "Metro Motors",
        "invoice_id": "INV-812",
        "incident_date": "2026-03-28",
        "claim_amount": 22000,
        "review_status": "Reviewed",
        "notes": "Repaired at Metro Motors (GAR-12), expanding the main network component."
    },
    {
        "claim_id": "CLM-214",
        "customer_id": "CUST-112",
        "customer_name": "Arjun Kapoor",
        "vehicle_id": "VEH-512",
        "incident_id": "INC-311",
        "garage_id": "GAR-19",
        "garage_name": "Express Care",
        "invoice_id": "INV-813",
        "incident_date": "2026-03-30",
        "claim_amount": 34000,
        "review_status": "Resolved",
        "notes": "Isolated claim testing single-node reachability and review status."
    }
]

# In-memory working copy
claims_store = copy.deepcopy(INITIAL_CLAIMS)

VALID_STATUSES = {"Pending", "Reviewed", "Resolved"}

def get_claims():
    """Return a deep copy of all current claim records."""
    return copy.deepcopy(claims_store)

def get_claim(claim_id):
    """Retrieve a single claim by claim_id."""
    for claim in claims_store:
        if claim["claim_id"].upper() == claim_id.upper():
            return copy.deepcopy(claim)
    return None

def update_claim_status(claim_id, new_status):
    """Update review status of a claim in memory."""
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{new_status}'. Allowed: {', '.join(sorted(VALID_STATUSES))}")
    
    for claim in claims_store:
        if claim["claim_id"].upper() == claim_id.upper():
            claim["review_status"] = new_status
            return copy.deepcopy(claim)
    return None

def reset_claims():
    """Reset claims back to original demonstration data."""
    global claims_store
    claims_store = copy.deepcopy(INITIAL_CLAIMS)
    return copy.deepcopy(claims_store)
