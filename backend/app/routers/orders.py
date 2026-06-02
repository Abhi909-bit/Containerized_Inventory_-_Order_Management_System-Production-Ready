from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=schemas.OrderOut, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total = 0.0
    order_items = []

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        product.quantity -= item.quantity
        subtotal = product.price * item.quantity
        total += subtotal
        order_items.append(models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        ))

    db_order = models.Order(customer_id=order.customer_id, total_amount=total)
    db.add(db_order)
    db.flush()
    for oi in order_items:
        oi.order_id = db_order.id
        db.add(oi)
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        db.add(models.AuditLog(
            action="STOCK_REDUCED",
            entity_type="product",
            entity_id=item.product_id,
            detail=f"Stock reduced by {item.quantity} (Order #{db_order.id})"
        ))
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=list[schemas.OrderOut])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@router.get("/{id}", response_model=schemas.OrderOut)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.delete("/{id}", status_code=204)
def delete_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()


@router.patch("/{id}/status")
def update_order_status(id: int, status: str, db: Session = Depends(get_db)):
    valid = ["pending", "confirmed", "fulfilled", "cancelled"]
    if status not in valid:
        raise HTTPException(400, f"Status must be one of: {valid}")
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    
    # Agar cancel ho to stock wapas karo
    if status == "cancelled" and order.status != "cancelled":
        for item in order.items:
            item.product.quantity += item.quantity
    
    order.status = status
    db.commit()
    return order