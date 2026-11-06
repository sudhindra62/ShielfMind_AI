from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory, Product, Sale
from schemas import KPIResponse
from services.insights_service import dashboard_kpis, mover_lists


router = APIRouter()


@router.get("/", response_model=KPIResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return dashboard_kpis(db)


@router.get("/summary", response_model=KPIResponse)
def get_summary_alias(db: Session = Depends(get_db)):
    return dashboard_kpis(db)


@router.get("/movers")
def get_movers(days: int = 30, limit: int = 5, db: Session = Depends(get_db)):
    return mover_lists(db, days, limit)


@router.get("/profit-leakage")
def get_profit_leakage(days: int = 30, db: Session = Depends(get_db)):
    cutoff = date.today() - timedelta(days=days)
    low_margin = (
        db.query(Product)
        .filter(((Product.selling_price - Product.cost_price) / Product.selling_price * 100) < 20)
        .limit(5)
        .all()
    )
    slow_stock = (
        db.query(Product, Inventory)
        .join(Inventory, Product.id == Inventory.product_id)
        .outerjoin(Sale, (Sale.product_id == Product.id) & (Sale.sale_date >= cutoff))
        .group_by(Product.id)
        .having(func.count(Sale.id) == 0)
        .limit(5)
        .all()
    )
    return {
        "low_margin": [
            {"product_id": p.id, "name": p.name, "sku": p.sku, "margin": p.profit_margin, "estimated_risk": round(p.cost_price * 10, 2)}
            for p in low_margin
        ],
        "deadstock": [
            {"product_id": product.id, "name": product.name, "sku": product.sku, "quantity": inv.quantity, "locked_value": round(inv.quantity * product.cost_price, 2)}
            for product, inv in slow_stock
        ],
    }


@router.get("/sales-heatmap")
def get_sales_heatmap(days: int = 30, db: Session = Depends(get_db)):
    cutoff = date.today() - timedelta(days=days)
    rows = (
        db.query(Sale.day_of_week, Sale.hour_of_day, func.sum(Sale.quantity_sold).label("units"))
        .filter(Sale.sale_date >= cutoff)
        .group_by(Sale.day_of_week, Sale.hour_of_day)
        .all()
    )
    return [{"day_of_week": row.day_of_week, "hour_of_day": row.hour_of_day, "units": int(row.units or 0)} for row in rows]
