from sqlalchemy import func

from models import Alert, Inventory, Product, Sale


def answer_inventory_question(message: str, db, history: list[dict] | None = None):
    text = message.lower()
    if "low" in text or "stockout" in text or "reorder" in text:
        rows = (
            db.query(Product.name, Product.sku, Inventory.quantity, Inventory.reorder_point)
            .join(Inventory, Product.id == Inventory.product_id)
            .filter(Inventory.quantity <= Inventory.reorder_point)
            .order_by(Inventory.quantity.asc())
            .limit(5)
            .all()
        )
        if not rows:
            return "No products are currently below reorder point. Inventory health looks stable."
        items = "; ".join(f"{r.name} ({r.quantity}/{r.reorder_point})" for r in rows)
        return f"The highest-priority low-stock items are: {items}. I recommend reviewing purchase orders for these SKUs first."

    if "top" in text or "selling" in text or "fast" in text:
        rows = (
            db.query(Product.name, func.sum(Sale.quantity_sold).label("units"))
            .join(Sale, Product.id == Sale.product_id)
            .group_by(Product.id)
            .order_by(func.sum(Sale.quantity_sold).desc())
            .limit(5)
            .all()
        )
        return "Top movers are: " + "; ".join(f"{r.name} with {int(r.units or 0)} units" for r in rows) + "."

    if "alert" in text:
        rows = db.query(Alert).filter(Alert.is_resolved == False).order_by(Alert.created_at.desc()).limit(5).all()
        if not rows:
            return "There are no unresolved alerts right now."
        return "Current alerts: " + "; ".join(f"{a.severity}: {a.title}" for a in rows) + "."

    total_products = db.query(Product).count()
    stock_value = (
        db.query(func.sum(Inventory.quantity * Product.cost_price))
        .join(Product, Inventory.product_id == Product.id)
        .scalar()
        or 0
    )
    return f"ShelfMind is tracking {total_products} products with inventory worth Rs {stock_value:,.0f}. Ask about low stock, reorder needs, alerts, or top-selling items."
