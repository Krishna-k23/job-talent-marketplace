import random
import string

def generate_requirement_id():
    """Generate a unique requirement ID"""
    import random
    import string
    import time
    
    timestamp = int(time.time() * 1000) % 100000
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"REQ{timestamp}{random_str}"

def generate_resource_id() -> str:
    """Generate unique resource ID like RES001"""
    return f"RES{random.randint(100, 999)}"

def generate_contract_id() -> str:
    """Generate unique contract ID like CT-2026-001"""
    return f"CT-{random.randint(2025, 2026)}-{random.randint(1, 999):03d}"

def generate_invoice_id() -> str:
    """Generate unique invoice ID like INV-2024-001"""
    return f"INV-{random.randint(2024, 2026)}-{random.randint(1, 999):03d}"