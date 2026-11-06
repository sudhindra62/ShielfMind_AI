from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ai.forecasting import calculate_stockout_date, forecast_with_prophet, get_sales_history
from database import get_db
from models import Forecast, Inventory, Product
from websocket_manager import manager


router = APIRouter()


@router.get("/all/summary")
def get_all_forecasts_summary(db: Session = Depends(get_db)):
    summaries = []
    for product in db.query(Product).order_by(Product.name).all():
        inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        history = get_sales_history(db, product.id, days=14)
        if history:
            avg = sum(point["qty"] for point in history) / len(history)
        else:
            avg = 1
        days_left = int((inventory.quantity if inventory else 0) / avg) if avg > 0 else 99
        summaries.append(
            {
                "product_id": product.id,
                "name": product.name,
                "sku": product.sku,
                "category": product.category,
                "current_stock": inventory.quantity if inventory else 0,
                "avg_daily_demand": round(avg, 1),
                "days_of_stock": min(days_left, 999),
                "urgency": "critical" if days_left <= 3 else "high" if days_left <= 7 else "medium" if days_left <= 14 else "low",
            }
        )
    return sorted(summaries, key=lambda item: item["days_of_stock"])


@router.get("/")
def get_forecast_index(db: Session = Depends(get_db)):
    return get_all_forecasts_summary(db)


@router.get("/{product_id}")
def get_product_forecast(product_id: int, days_ahead: int = 30, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    current_stock = inventory.quantity if inventory else 0
    history = get_sales_history(db, product_id, days=90)

    stored = (
        db.query(Forecast)
        .filter(Forecast.product_id == product_id, Forecast.forecast_date >= date.today())
        .order_by(Forecast.forecast_date)
        .limit(days_ahead)
        .all()
    )
    if len(stored) >= max(3, days_ahead // 2):
        forecast_points = [
            {
                "date": row.forecast_date.isoformat(),
                "predicted_demand": round(row.predicted_demand, 2),
                "lower_bound": round(row.lower_bound or 0, 2),
                "upper_bound": round(row.upper_bound or 0, 2),
                "confidence": round(row.confidence_score or 0.78, 2),
            }
            for row in stored
        ]
    else:
        forecast_points = forecast_with_prophet(history, periods=days_ahead)
        db.query(Forecast).filter(Forecast.product_id == product_id, Forecast.forecast_date >= date.today()).delete()
        for point in forecast_points:
            db.add(
                Forecast(
                    product_id=product_id,
                    forecast_date=date.fromisoformat(point["date"]),
                    predicted_demand=point["predicted_demand"],
                    lower_bound=point["lower_bound"],
                    upper_bound=point["upper_bound"],
                    confidence_score=point["confidence"],
                )
            )
        db.commit()

    avg_daily = sum(point["predicted_demand"] for point in forecast_points[:7]) / max(1, min(7, len(forecast_points)))
    chart_data = [
        {
            "date": point["date"].isoformat(),
            "actual": point["qty"],
            "predicted_demand": None,
            "lower_bound": None,
            "upper_bound": None,
        }
        for point in history[-30:]
    ]
    chart_data.extend(
        {
            "date": point["date"],
            "actual": None,
            "predicted_demand": point["predicted_demand"],
            "lower_bound": point["lower_bound"],
            "upper_bound": point["upper_bound"],
        }
        for point in forecast_points
    )

    return {
        "product_id": product_id,
        "product_name": product.name,
        "current_stock": current_stock,
        "avg_daily_demand": round(avg_daily, 1),
        "stockout_date": calculate_stockout_date(current_stock, avg_daily),
        "days_of_stock": int(current_stock / avg_daily) if avg_daily > 0 else 999,
        "forecast_points": forecast_points,
        "chart_data": chart_data,
    }


@router.post("/run/{product_id}")
async def run_product_forecast(product_id: int, days_ahead: int = 30, db: Session = Depends(get_db)):
    payload = get_product_forecast(product_id, days_ahead, db)
    await manager.send_forecast_ready(product_id, {"avg_daily_demand": payload["avg_daily_demand"], "days_of_stock": payload["days_of_stock"]})
    return payload
