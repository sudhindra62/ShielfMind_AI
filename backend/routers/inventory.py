from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Alert, Inventory, Product
from schemas import InventoryResponse, StockUpdateRequest
from services.inventory_service import set_stock
from websocket_manager import manager


router = APIRouter()


def _inventory_response(inventory: Inventory):
    response = InventoryResponse.model_validate(inventory)
    response.is_low_stock = inventory.quantity <= inventory.reorder_point
    response.is_overstock = inventory.quantity >= (inventory.max_stock or 200) * 0.9
    response.stock_percentage = min(100.0, round(inventory.quantity / max(1, inventory.max_stock or 100) * 100, 1))
    if response.product:
        response.product.profit_margin = inventory.product.profit_margin
    return response


@router.get("/", response_model=List[InventoryResponse])
def list_inventory(low_stock_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Inventory).options(joinedload(Inventory.product))
    if low_stock_only:
        query = query.filter(Inventory.quantity <= Inventory.reorder_point)
    return [_inventory_response(item) for item in query.order_by(Inventory.quantity.asc()).all()]


@router.post("/")
async def add_or_update_inventory(product_id: int, quantity: int, reorder_point: int = 20, max_stock: int = 200, location: str = "Main Store", db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if inventory:
        old_quantity = inventory.quantity
        inventory.quantity = max(0, quantity)
        inventory.reorder_point = reorder_point
        inventory.max_stock = max_stock
        inventory.location = location
    else:
        old_quantity = 0
        inventory = Inventory(product_id=product_id, quantity=max(0, quantity), reorder_point=reorder_point, max_stock=max_stock, location=location)
        db.add(inventory)
    db.commit()
    await manager.send_stock_update(product_id, inventory.quantity, product.name)
    return {"product_id": product_id, "old_quantity": old_quantity, "new_quantity": inventory.quantity}


@router.patch("/{product_id}")
async def update_stock(product_id: int, payload: StockUpdateRequest, db: Session = Depends(get_db)):
    result = set_stock(db, product_id, payload.quantity, payload.reason or "manual_adjustment")
    if not result:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    product = result["product"]
    inventory = result["inventory"]
    old_quantity = result["old_quantity"]
    db.commit()
    await manager.send_stock_update(product_id, inventory.quantity, product.name)
    return {
        "product_id": product_id,
        "old_quantity": old_quantity,
        "new_quantity": inventory.quantity,
        "is_low_stock": inventory.quantity <= inventory.reorder_point,
        "reason": payload.reason,
    }


@router.post("/bulk-adjust")
async def bulk_adjust(adjustments: List[dict], db: Session = Depends(get_db)):
    updated = []
    for adjustment in adjustments:
        product_id = adjustment.get("product_id")
        quantity = adjustment.get("quantity")
        if product_id is None or quantity is None:
            continue
        inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if inventory:
            inventory.quantity = max(0, int(quantity))
            updated.append(product_id)
    db.commit()
    await manager.broadcast({"type": "inventory.bulk_updated", "product_ids": updated, "count": len(updated)})
    return {"updated": len(updated), "product_ids": updated}


@router.get("/summary/overview")
def stock_overview(db: Session = Depends(get_db)):
    total = db.query(Inventory).count()
    low = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point).count()
    out = db.query(Inventory).filter(Inventory.quantity == 0).count()
    overstock = db.query(Inventory).filter(Inventory.quantity >= Inventory.max_stock * 0.9).count()
    total_value = (
        db.query(func.sum(Inventory.quantity * Product.cost_price))
        .join(Product, Inventory.product_id == Product.id)
        .scalar()
        or 0
    )
    healthy = max(0, total - low - out)
    return {
        "total_products": total,
        "healthy": healthy,
        "low_stock": low,
        "out_of_stock": out,
        "overstock": overstock,
        "total_stock_value": round(total_value, 2),
        "health_percentage": round(healthy / total * 100, 1) if total else 0,
    }
