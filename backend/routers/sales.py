import random
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from ai.anomaly import detect_sales_anomaly
from database import get_db
from models import Alert, Inventory, Product, Sale
from schemas import SaleCreate, SaleResponse
from services.import_service import import_sales_csv_bytes
from websocket_manager import manager


router = APIRouter()


@router.post("/", response_model=SaleResponse, status_code=201)
async def record_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sale_date = payload.sale_date or date.today()
    sale = Sale(
        product_id=payload.product_id,
        quantity_sold=payload.quantity_sold,
        unit_price=payload.unit_price or product.selling_price,
        sale_date=sale_date,
        hour_of_day=payload.hour_of_day,
        day_of_week=sale_date.weekday(),
    )
    db.add(sale)

    inventory = db.query(Inventory).filter(Inventory.product_id == payload.product_id).first()
    if inventory:
        inventory.quantity = max(0, inventory.quantity - payload.quantity_sold)
        if inventory.quantity == 0:
            db.add(
                Alert(
                    alert_type="out_of_stock",
                    severity="critical",
                    product_id=product.id,
                    title=f"Out of Stock - {product.name}",
                    message=f"{product.name} is now out of stock after a sale of {payload.quantity_sold} units.",
                    financial_impact=-(product.selling_price * 20),
                )
            )
        elif inventory.quantity <= inventory.reorder_point:
            db.add(
                Alert(
                    alert_type="low_stock",
                    severity="warning",
                    product_id=product.id,
                    title=f"Low Stock - {product.name}",
                    message=f"{inventory.quantity} units left, below reorder point {inventory.reorder_point}.",
                    financial_impact=-(product.selling_price * inventory.reorder_point),
                )
            )

    anomaly = detect_sales_anomaly(db, product.id, payload.quantity_sold)
    if anomaly["is_anomaly"]:
        db.add(
            Alert(
                alert_type="sales_anomaly",
                severity="info",
                product_id=product.id,
                title=f"Sales Spike - {product.name}",
                message=anomaly["reason"],
                financial_impact=payload.quantity_sold * (payload.unit_price or product.selling_price),
            )
        )

    db.commit()
    db.refresh(sale)
    if inventory:
        await manager.send_stock_update(product.id, inventory.quantity, product.name)
    return sale


@router.get("/history")
def get_sales_history(product_id: Optional[int] = None, days: int = 30, db: Session = Depends(get_db)):
    cutoff = date.today() - timedelta(days=days)
    query = (
        db.query(
            Sale.sale_date,
            func.sum(Sale.quantity_sold).label("units"),
            func.sum(Sale.quantity_sold * Sale.unit_price).label("revenue"),
            func.count(Sale.id).label("transactions"),
        )
        .filter(Sale.sale_date >= cutoff)
    )
    if product_id:
        query = query.filter(Sale.product_id == product_id)
    rows = query.group_by(Sale.sale_date).order_by(Sale.sale_date).all()
    return [
        {
            "date": row.sale_date.isoformat(),
            "units": int(row.units or 0),
            "revenue": round(row.revenue or 0, 2),
            "transactions": row.transactions,
        }
        for row in rows
    ]


@router.post("/import-csv")
async def import_sales_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    content = await file.read()
    imported, errors = import_sales_csv_bytes(db, content)
    db.commit()
    await manager.broadcast({"type": "import.completed", "records": imported, "errors": len(errors)})
    return {"imported": imported, "errors": errors[:10], "total_errors": len(errors)}


@router.get("/top-products")
def get_top_products(days: int = 30, limit: int = 10, db: Session = Depends(get_db)):
    cutoff = date.today() - timedelta(days=days)
    rows = (
        db.query(
            Product.id,
            Product.name,
            Product.category,
            Product.sku,
            func.sum(Sale.quantity_sold).label("units_sold"),
            func.sum(Sale.quantity_sold * Sale.unit_price).label("revenue"),
        )
        .join(Sale, Product.id == Sale.product_id)
        .filter(Sale.sale_date >= cutoff)
        .group_by(Product.id)
        .order_by(func.sum(Sale.quantity_sold * Sale.unit_price).desc())
        .limit(limit)
        .all()
    )
    return [
        {"id": row.id, "name": row.name, "category": row.category, "sku": row.sku, "units_sold": int(row.units_sold or 0), "revenue": round(row.revenue or 0, 2)}
        for row in rows
    ]


@router.post("/simulate-day")
async def simulate_day_of_sales(db: Session = Depends(get_db)):
    products = db.query(Product).limit(10).all()
    created = 0
    for product in products:
        inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if not inventory or inventory.quantity <= 0:
            continue
        for _ in range(random.randint(1, 4)):
            quantity = random.randint(1, min(5, inventory.quantity))
            db.add(Sale(product_id=product.id, quantity_sold=quantity, unit_price=product.selling_price, sale_date=date.today(), hour_of_day=random.randint(9, 20), day_of_week=date.today().weekday()))
            inventory.quantity = max(0, inventory.quantity - quantity)
            created += 1
        await manager.send_stock_update(product.id, inventory.quantity, product.name)
    db.commit()
    await manager.broadcast({"type": "sales.simulated", "sales_created": created})
    return {"simulated_sales": created}
