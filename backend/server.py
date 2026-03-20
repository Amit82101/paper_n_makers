from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"

razorpay_key = os.environ.get('RAZORPAY_KEY_ID', '')
razorpay_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = razorpay.Client(auth=(razorpay_key, razorpay_secret)) if razorpay_key else None

def create_token(user_id: str, email: str, is_admin: bool = False):
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    category: str
    image: str
    stock: int = 100
    occasion: Optional[str] = None
    created_at: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    stock: int = 100
    occasion: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    items: List[CartItem]
    updated_at: str

class OrderCreate(BaseModel):
    items: List[CartItem]
    delivery_date: str
    delivery_time: str
    recipient_name: str
    recipient_phone: str
    delivery_address: str
    gift_message: Optional[str] = None
    total_amount: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[CartItem]
    delivery_date: str
    delivery_time: str
    recipient_name: str
    recipient_phone: str
    delivery_address: str
    gift_message: Optional[str] = None
    total_amount: float
    payment_status: str = "pending"
    order_status: str = "pending"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "phone": user_data.phone,
        "password": hashed_password.decode('utf-8'),
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email)
    
    return {
        "token": token,
        "user": User(**{k: v for k, v in user_doc.items() if k != "password"})
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user.get("is_admin", False))
    
    return {
        "token": token,
        "user": User(**{k: v for k, v in user.items() if k != "password"})
    }

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, occasion: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if occasion:
        query["occasion"] = occasion
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        **product_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return Product(**product_doc)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not cart:
        return {"user_id": current_user["user_id"], "items": [], "updated_at": datetime.now(timezone.utc).isoformat()}
    return cart

@api_router.post("/cart")
async def update_cart(cart_items: List[CartItem], current_user: dict = Depends(get_current_user)):
    cart_doc = {
        "user_id": current_user["user_id"],
        "items": [item.model_dump() for item in cart_items],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.carts.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": cart_doc},
        upsert=True
    )
    
    return cart_doc

@api_router.post("/orders/create", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    
    razorpay_order_id = None
    if razorpay_client:
        razorpay_order = razorpay_client.order.create({
            "amount": int(order_data.total_amount * 100),
            "currency": "INR",
            "receipt": order_id[:40]
        })
        razorpay_order_id = razorpay_order["id"]
    
    order_doc = {
        "id": order_id,
        "user_id": current_user["user_id"],
        "items": [item.model_dump() for item in order_data.items],
        "delivery_date": order_data.delivery_date,
        "delivery_time": order_data.delivery_time,
        "recipient_name": order_data.recipient_name,
        "recipient_phone": order_data.recipient_phone,
        "delivery_address": order_data.delivery_address,
        "gift_message": order_data.gift_message,
        "total_amount": order_data.total_amount,
        "payment_status": "pending",
        "order_status": "pending",
        "razorpay_order_id": razorpay_order_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    return Order(**order_doc)

@api_router.post("/orders/verify-payment")
async def verify_payment(payment_data: PaymentVerify, current_user: dict = Depends(get_current_user)):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")
    
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment_data.razorpay_order_id,
            'razorpay_payment_id': payment_data.razorpay_payment_id,
            'razorpay_signature': payment_data.razorpay_signature
        })
        
        await db.orders.update_one(
            {"id": payment_data.order_id},
            {"$set": {
                "payment_status": "completed",
                "order_status": "confirmed",
                "razorpay_payment_id": payment_data.razorpay_payment_id
            }}
        )
        
        await db.carts.delete_one({"user_id": current_user["user_id"]})
        
        return {"message": "Payment verified successfully", "status": "success"}
    except Exception as e:
        await db.orders.update_one(
            {"id": payment_data.order_id},
            {"$set": {"payment_status": "failed"}}
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["user_id"]}
    if current_user.get("is_admin"):
        query = {}
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    query = {"id": order_id}
    if not current_user.get("is_admin"):
        query["user_id"] = current_user["user_id"]
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, order_status: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": order_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}

@api_router.get("/razorpay-key")
async def get_razorpay_key():
    return {"key": razorpay_key}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()