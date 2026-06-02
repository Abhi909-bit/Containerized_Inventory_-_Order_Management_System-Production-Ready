from fastapi import FastAPI
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import products, customers, orders, audit
from . import models
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from .database import get_db
from datetime import datetime, timedelta


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production mein specific URL daalna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(audit.router)
@app.get("/")
def root():
    return {"message": "Inventory API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = db.query(models.Product).filter(models.Product.quantity < 10).all()
    
    # Revenue last 7 days
    recent_orders = db.query(models.Order).filter(
        models.Order.created_at >= week_ago
    ).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_count": len(low_stock),
        "low_stock_products": [{"id": p.id, "name": p.name, "quantity": p.quantity} for p in low_stock],
        "recent_revenue": sum(o.total_amount for o in recent_orders),
        "pending_orders": db.query(models.Order).filter(models.Order.status == "pending").count()
    }