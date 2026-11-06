from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Alert, Inventory, Product, Sale
from schemas import AlertResponse
from websocket_manager import manager


router = APIRouter()


def _estimate_days(db: Session, product_id: int, current_qty: int):
    avg = (
        db.query(func.avg(Sale.quantity_sold))
        .filter(Sale.product_id == product_id, Sale.sale_date >= date.today() - timedelta(days=14))
        .scalar()
        or 1
    )
    return max(0, int(current_qty / avg))


def _generate_dynamic_alerts(db: Session):
    for inventory, product in db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id).all():
        if inventory.quantity <= inventory.reorder_point:
            exists = (
                db.query(Alert)
                .filter(Alert.product_id == product.id, Alert.alert_type == "low_stock", Alert.is_resolved == False)
                .first()
            )
            if not exists:
                days = _estimate_days(db, product.id, inventory.quantity)
                severity = "critical" if days <= 3 else "warning"
                db.add(
                    Alert(
                        alert_type="low_stock",
                        severity=severity,
                        product_id=product.id,
                        title=f"Low Stock - {product.name}",
                        message=f"Only {inventory.quantity} units left, about {days} days of cover.",
                        financial_impact=-(product.selling_price * inventory.reorder_point),
                    )
                )
    db.commit()


@router.get("/", response_model=List[AlertResponse])
def get_alerts(severity: Optional[str] = None, unread_only: bool = False, limit: int = 50, db: Session = Depends(get_db)):
    _generate_dynamic_alerts(db)
    query = db.query(Alert).options(joinedload(Alert.product)).filter(Alert.is_resolved == False)
    if severity:
        query = query.filter(Alert.severity == severity)
    if unread_only:
        query = query.filter(Alert.is_read == False)
    result = []
    for alert in query.order_by(Alert.created_at.desc()).limit(limit).all():
        response = AlertResponse.model_validate(alert)
        response.product_name = alert.product.name if alert.product else None
        result.append(response)
    return result


@router.get("/count")
def get_alert_counts(db: Session = Depends(get_db)):
    return {
        "total": db.query(Alert).filter(Alert.is_resolved == False).count(),
        "unread": db.query(Alert).filter(Alert.is_read == False, Alert.is_resolved == False).count(),
        "critical": db.query(Alert).filter(Alert.severity == "critical", Alert.is_resolved == False).count(),
    }


@router.patch("/{alert_id}/read")
def mark_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "ok"}


@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    alert.is_read = True
    db.commit()
    await manager.broadcast({"type": "alert.resolved", "alert_id": alert_id})
    return {"status": "resolved"}


@router.post("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}
