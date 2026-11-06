from datetime import date, timedelta

from sqlalchemy import func

from models import Sale


def detect_sales_anomaly(db, product_id: int, quantity: int):
    cutoff = date.today() - timedelta(days=30)
    avg = (
        db.query(func.avg(Sale.quantity_sold))
        .filter(Sale.product_id == product_id, Sale.sale_date >= cutoff)
        .scalar()
        or 0
    )
    if avg and quantity > avg * 3:
        return {"is_anomaly": True, "reason": f"Sale quantity is more than 3x the recent average of {avg:.1f}."}
    return {"is_anomaly": False, "reason": None}
