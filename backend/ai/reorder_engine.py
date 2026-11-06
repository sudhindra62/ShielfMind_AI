from datetime import date, timedelta

from ai.forecasting import forecast_with_moving_average, get_sales_history
from models import Inventory, Product, ReorderSuggestion


def build_reorder_suggestion(db, product: Product, lead_time_days: int = 3, safety_stock: int | None = None, demand_multiplier: float = 1.0):
    inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
    if not inventory:
        return None

    history = get_sales_history(db, product.id, 60)
    forecast = forecast_with_moving_average(history, 14)
    avg_demand = sum(p["predicted_demand"] for p in forecast[:7]) / 7 if forecast else 1
    avg_demand *= demand_multiplier
    stock = inventory.quantity
    days_left = int(stock / avg_demand) if avg_demand > 0 else 999
    buffer = safety_stock if safety_stock is not None else inventory.reorder_point
    target_stock = min(inventory.max_stock or 200, int(avg_demand * (lead_time_days + 7) + buffer))
    qty = max(0, target_stock - stock)
    urgency = "critical" if days_left <= 3 else "high" if days_left <= 7 else "medium" if days_left <= 14 else "low"
    stockout = date.today() + timedelta(days=max(0, days_left))
    order_date = stockout - timedelta(days=lead_time_days)

    return {
        "product_id": product.id,
        "product_name": product.name,
        "sku": product.sku,
        "current_stock": stock,
        "avg_daily_demand": round(avg_demand, 2),
        "suggested_quantity": qty,
        "urgency_level": urgency,
        "estimated_stockout_date": stockout,
        "suggested_order_date": max(date.today(), order_date),
        "estimated_cost": round(qty * product.cost_price, 2),
        "reasoning": f"{days_left} days of stock left at about {avg_demand:.1f} units/day. Target stock covers lead time plus buffer.",
    }


def refresh_reorder_suggestions(db, product_ids: list[int] | None = None):
    query = db.query(Product)
    if product_ids:
        query = query.filter(Product.id.in_(product_ids))
    suggestions = []
    for product in query.all():
        data = build_reorder_suggestion(db, product)
        if not data or data["suggested_quantity"] <= 0:
            continue
        db.add(
            ReorderSuggestion(
                product_id=product.id,
                suggested_quantity=data["suggested_quantity"],
                urgency_level=data["urgency_level"],
                estimated_stockout_date=data["estimated_stockout_date"],
                suggested_order_date=data["suggested_order_date"],
                estimated_cost=data["estimated_cost"],
                reasoning=data["reasoning"],
            )
        )
        suggestions.append(data)
    db.commit()
    return suggestions
