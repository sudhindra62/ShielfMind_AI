from ai.forecasting import calculate_stockout_date, forecast_with_moving_average, forecast_with_prophet, get_sales_history


def build_forecast(db, product_id: int, days_ahead: int = 30):
    history = get_sales_history(db, product_id, days=90)
    points = forecast_with_prophet(history, periods=days_ahead)
    avg_daily_demand = sum(p["predicted_demand"] for p in points[:7]) / max(1, min(7, len(points)))
    return {
        "history": history,
        "forecast_points": points,
        "avg_daily_demand": round(avg_daily_demand, 2),
    }


__all__ = ["build_forecast", "calculate_stockout_date", "forecast_with_moving_average", "forecast_with_prophet", "get_sales_history"]
