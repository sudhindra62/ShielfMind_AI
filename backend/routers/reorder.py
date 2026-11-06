from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product, PurchaseOrder, PurchaseOrderItem, ReorderSuggestion
from schemas import ReorderGenerateRequest, WhatIfRequest
from services.reorder_service import build_reorder_suggestion, refresh_reorder_suggestions
from websocket_manager import manager


router = APIRouter()


def _serialize_suggestion(row: ReorderSuggestion):
    return {
        "id": row.id,
        "product_id": row.product_id,
        "product_name": row.product.name if row.product else None,
        "sku": row.product.sku if row.product else None,
        "suggested_quantity": row.suggested_quantity,
        "urgency_level": row.urgency_level,
        "estimated_stockout_date": row.estimated_stockout_date.isoformat() if row.estimated_stockout_date else None,
        "suggested_order_date": row.suggested_order_date.isoformat() if row.suggested_order_date else None,
        "estimated_cost": row.estimated_cost,
        "reasoning": row.reasoning,
        "status": row.status,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


@router.get("/")
def list_reorder_suggestions(refresh: bool = True, db: Session = Depends(get_db)):
    if refresh:
        refresh_reorder_suggestions(db)
    rows = db.query(ReorderSuggestion).order_by(ReorderSuggestion.created_at.desc()).limit(100).all()
    return [_serialize_suggestion(row) for row in rows]


@router.post("/simulate")
def simulate_reorder(payload: WhatIfRequest, db: Session = Depends(get_db)):
    results = []
    for product in db.query(Product).order_by(Product.name).all():
        data = build_reorder_suggestion(db, product, payload.lead_time_days, payload.safety_stock, payload.demand_multiplier)
        if data:
            data["estimated_stockout_date"] = data["estimated_stockout_date"].isoformat()
            data["suggested_order_date"] = data["suggested_order_date"].isoformat()
            results.append(data)
    return sorted(results, key=lambda item: (item["urgency_level"], item["suggested_order_date"]))


@router.patch("/{suggestion_id}/status")
async def update_suggestion_status(suggestion_id: int, status: str, db: Session = Depends(get_db)):
    if status not in {"pending", "approved", "ordered", "dismissed"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    suggestion = db.query(ReorderSuggestion).filter(ReorderSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    suggestion.status = status
    db.commit()
    await manager.broadcast({"type": "reorder.updated", "suggestion_id": suggestion_id, "status": status})
    return {"id": suggestion_id, "status": status}


@router.post("/generate-order")
async def generate_purchase_order(payload: ReorderGenerateRequest, db: Session = Depends(get_db)):
    suggestions = refresh_reorder_suggestions(db, payload.product_ids)
    actionable = [item for item in suggestions if item["suggested_quantity"] > 0]
    if not actionable:
        raise HTTPException(status_code=400, detail="No reorder quantities required")

    order = PurchaseOrder(
        order_number=f"PO-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        supplier_name=payload.supplier_name,
        total_items=sum(item["suggested_quantity"] for item in actionable),
        total_value=round(sum(item["estimated_cost"] for item in actionable), 2),
        status="draft",
    )
    db.add(order)
    db.flush()
    for item in actionable:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        db.add(PurchaseOrderItem(order_id=order.id, product_id=item["product_id"], quantity=item["suggested_quantity"], unit_cost=product.cost_price))
    db.commit()
    await manager.broadcast({"type": "purchase_order.created", "order_number": order.order_number, "total_value": order.total_value})
    return {"order_id": order.id, "order_number": order.order_number, "total_items": order.total_items, "total_value": order.total_value, "status": order.status}


@router.get("/orders")
def list_purchase_orders(db: Session = Depends(get_db)):
    orders = db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()
    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "supplier_name": order.supplier_name,
            "total_items": order.total_items,
            "total_value": order.total_value,
            "status": order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }
        for order in orders
    ]
