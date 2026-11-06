from datetime import date, timedelta

from sqlalchemy import func

from models import Alert, Inventory, Product, Sale


def dashboard_kpis(db):
    today = date.today()
    week_start = today - timedelta(days=7)
    total_stock_value = (
        db.query(func.sum(Inventory.quantity * Product.cost_price))
        .join(Product, Inventory.product_id == Product.id)
        .scalar()
        or 0
    )
    revenue_today = (
        db.query(func.sum(Sale.quantity_sold * Sale.unit_price))
        .filter(Sale.sale_date == today)
        .scalar()
        or 0
    )
    revenue_week = (
        db.query(func.sum(Sale.quantity_sold * Sale.unit_price))
        .filter(Sale.sale_date >= week_start)
        .scalar()
        or 0
    )
    total_products = db.query(Product).count()
    low_stock = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_point).count()
    overstock = db.query(Inventory).filter(Inventory.quantity >= Inventory.max_stock * 0.9).count()
    critical = db.query(Alert).filter(Alert.severity == "critical", Alert.is_resolved == False).count()
    health_score = max(0, min(100, 100 - low_stock * 4 - overstock * 2 - critical * 6))
    return {
        "total_stock_value": round(total_stock_value, 2),
        "revenue_today": round(revenue_today, 2),
        "revenue_this_week": round(revenue_week, 2),
        "low_stock_products": low_stock,
        "critical_alerts": critical,
        "health_score": health_score,
        "total_products": total_products,
        "overstock_products": overstock,
    }


def mover_lists(db, days: int = 30, limit: int = 5):
    cutoff = date.today() - timedelta(days=days)
    sold_rows = (
        db.query(
            Product.id,
            Product.name,
            Product.sku,
            Product.category,
            func.sum(Sale.quantity_sold).label("units"),
            func.sum(Sale.quantity_sold * Sale.unit_price).label("revenue"),
        )
        .join(Sale, Product.id == Sale.product_id)
        .filter(Sale.sale_date >= cutoff)
        .group_by(Product.id)
        .order_by(func.sum(Sale.quantity_sold).desc())
        .all()
    )
    fast = [
        {"id": r.id, "name": r.name, "sku": r.sku, "category": r.category, "units_sold": int(r.units or 0), "revenue": round(r.revenue or 0, 2)}
        for r in sold_rows[:limit]
    ]
    slow = [
        {"id": r.id, "name": r.name, "sku": r.sku, "category": r.category, "units_sold": int(r.units or 0), "revenue": round(r.revenue or 0, 2)}
        for r in reversed(sold_rows[-limit:])
    ]
    return {"fast_movers": fast, "slow_movers": slow}
