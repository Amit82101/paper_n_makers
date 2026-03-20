import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime, timezone

async def seed_products():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Check if products already exist
    existing = await db.products.count_documents({})
    if existing > 0:
        print(f"Products already exist ({existing} products). Skipping seed.")
        return
    
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Red Rose Bouquet",
            "description": "Classic dozen red roses arranged beautifully. Perfect for expressing love and romance.",
            "price": 1499.00,
            "category": "bouquet",
            "occasion": "love",
            "image": "https://images.unsplash.com/photo-1768448595323-92ded21be885?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 50,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sunflower Joy",
            "description": "Bright and cheerful sunflowers that bring happiness to any occasion.",
            "price": 899.00,
            "category": "bouquet",
            "occasion": "joy",
            "image": "https://images.unsplash.com/photo-1768448587668-35994cd84db0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 40,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "White Lily Elegance",
            "description": "Graceful white lilies symbolizing purity and peace. Ideal for sympathy and remembrance.",
            "price": 1299.00,
            "category": "bouquet",
            "occasion": "sympathy",
            "image": "https://images.unsplash.com/photo-1768448601132-67df7d32e5a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 30,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mixed Celebration",
            "description": "Colorful mix of seasonal flowers perfect for birthdays and celebrations.",
            "price": 1699.00,
            "category": "arrangement",
            "occasion": "birthday",
            "image": "https://images.unsplash.com/photo-1768448581878-b52637049bda?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 35,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pink Tulip Dream",
            "description": "Soft pink tulips representing perfect love and elegance.",
            "price": 1199.00,
            "category": "bouquet",
            "occasion": "love",
            "image": "https://images.unsplash.com/photo-1768448595323-92ded21be885?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 45,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Purple Orchid Premium",
            "description": "Exotic purple orchids for someone truly special. Luxury and sophistication combined.",
            "price": 2499.00,
            "category": "single",
            "occasion": "anniversary",
            "image": "https://images.unsplash.com/photo-1768448587668-35994cd84db0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 20,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Garden Fresh Mix",
            "description": "A delightful mix of garden-fresh flowers bringing nature's beauty indoors.",
            "price": 999.00,
            "category": "arrangement",
            "occasion": "joy",
            "image": "https://images.unsplash.com/photo-1768448601132-67df7d32e5a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 60,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Peach Rose Charm",
            "description": "Delicate peach roses symbolizing gratitude and appreciation.",
            "price": 1399.00,
            "category": "bouquet",
            "occasion": "anniversary",
            "image": "https://images.unsplash.com/photo-1768448581878-b52637049bda?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHx2aWJyYW50JTIwZmxvd2VyJTIwYm91cXVldCUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzM5ODAyOTl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 40,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"Successfully seeded {len(products)} products!")
    
    # Create admin user
    existing_admin = await db.users.find_one({"email": "admin@bloom.com"})
    if not existing_admin:
        import bcrypt
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        admin_user = {
            "id": str(uuid.uuid4()),
            "name": "Admin User",
            "email": "admin@bloom.com",
            "phone": "9999999999",
            "password": hashed_password.decode('utf-8'),
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print("Admin user created: admin@bloom.com / admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_products())
