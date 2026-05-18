from app.database import SessionLocal, engine, Base
from app.models import User, Company
from app.auth import get_password_hash

# Drop all tables and recreate them
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create test client user with plain text password (temporary for testing)
    # For production, use proper hashing
    test_client = User(
        email="client@test.com",
        hashed_password="test123",  # Temporary plain text
        full_name="Test Client",
        phone="+91 98765 43219",
        role="client",
        is_active=True,
        is_verified=True
    )
    db.add(test_client)
    
    # Create test vendor user
    test_vendor = User(
        email="vendor@test.com",
        hashed_password="test123",  # Temporary plain text
        full_name="Test Vendor",
        phone="+91 98765 43220",
        role="vendor",
        is_active=True,
        is_verified=True,
        vendor_name="Test Vendor Solutions"
    )
    db.add(test_vendor)
    
    db.commit()
    
    print("Database initialized successfully!")
    print("\nLogin credentials:")
    print("Client: client@test.com / test123")
    print("Vendor: vendor@test.com / test123")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()