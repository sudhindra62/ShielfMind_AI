import random
from datetime import date, timedelta

from database import SessionLocal
from models import Alert, Inventory, Product, Sale


INDIAN_RETAIL_PRODUCTS = [
    ("Parle-G Biscuits 800g", "BISCUIT-001", "Biscuits", "Parle", 42, 60, 30),
    ("Amul Butter 500g", "DAIRY-001", "Dairy", "Amul", 230, 280, 15),
    ("Tata Salt 1kg", "SALT-001", "Staples", "Tata", 20, 28, 40),
    ("Sunflower Oil 1L", "OIL-001", "Oils", "Fortune", 140, 175, 25),
    ("Maggi Noodles 12-pack", "NOODLES-001", "Instant Food", "Nestle", 144, 168, 20),
    ("Colgate Toothpaste 200g", "HYGIENE-001", "Personal Care", "Colgate", 85, 120, 25),
    ("Head & Shoulders 400ml", "HYGIENE-002", "Personal Care", "P&G", 280, 380, 12),
    ("Horlicks 500g", "DRINKS-001", "Health Drinks", "GSK", 210, 265, 18),
    ("Dettol Handwash 250ml", "HYGIENE-003", "Personal Care", "Dettol", 75, 110, 30),
    ("Lay's Chips 26g Box", "SNACKS-001", "Snacks", "PepsiCo", 260, 312, 25),
    ("Tata Tea Premium 500g", "TEA-001", "Beverages", "Tata", 180, 230, 20),
    ("Ariel Detergent 1kg", "DETERGENT-001", "Cleaning", "P&G", 175, 230, 15),
    ("Surf Excel 1kg", "DETERGENT-002", "Cleaning", "HUL", 170, 220, 15),
    ("Vim Dishwash Bar 400g", "CLEANING-001", "Cleaning", "HUL", 32, 48, 35),
    ("Glucon-D Orange 1kg", "DRINKS-002", "Health Drinks", "Heinz", 175, 225, 12),
    ("Haldiram Namkeen 400g", "SNACKS-002", "Snacks", "Haldiram", 85, 120, 20),
    ("Britannia Milk Bikis", "BISCUIT-002", "Biscuits", "Britannia", 52, 75, 25),
    ("Vim Liquid 500ml", "CLEANING-002", "Cleaning", "HUL", 90, 125, 20),
    ("Lifebuoy Soap 4-pack", "SOAP-001", "Personal Care", "HUL", 80, 108, 30),
    ("Reynolds Pen 12-pack", "STATIONERY-001", "Stationery", "Reynolds", 96, 144, 15),
]


FESTIVAL_DATES = {
    date(2025, 10, 2),
    date(2025, 10, 20),
    date(2025, 10, 24),
    date(2025, 12, 25),
    date(2026, 1, 26),
    date(2026, 3, 14),
}


def _daily_sales(seed: int, days: int = 90):
    random.seed(seed)
    base = random.randint(7, 22)
    trend = random.uniform(-0.004, 0.012)
    for offset in range(days):
        sale_date = date.today() - timedelta(days=days - offset)
        weekend = 1.35 if sale_date.weekday() in (5, 6) else 1.0
        festival = 2.2 if sale_date in FESTIVAL_DATES else 1.0
        qty = max(1, int(base * weekend * festival * (1 + trend * offset) * random.uniform(0.75, 1.25)))
        for _ in range(random.randint(1, 3)):
            yield {
                "quantity": max(1, qty // random.randint(1, 3)),
                "date": sale_date,
                "hour": random.choice([9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20]),
                "is_festival": sale_date in FESTIVAL_DATES,
            }


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return

        for idx, (name, sku, category, brand, cost, price, reorder_point) in enumerate(INDIAN_RETAIL_PRODUCTS, start=1):
            product = Product(
                name=name,
                sku=sku,
                category=category,
                brand=brand,
                cost_price=float(cost),
                selling_price=float(price),
            )
            db.add(product)
            db.flush()

            db.add(
                Inventory(
                    product_id=product.id,
                    quantity=random.randint(18, 140),
                    reorder_point=reorder_point,
                    max_stock=reorder_point * 8,
                )
            )

            for sale_data in _daily_sales(idx, 90):
                db.add(
                    Sale(
                        product_id=product.id,
                        quantity_sold=sale_data["quantity"],
                        unit_price=float(price),
                        sale_date=sale_data["date"],
                        hour_of_day=sale_data["hour"],
                        day_of_week=sale_data["date"].weekday(),
                        is_festival_day=sale_data["is_festival"],
                    )
                )

        alerts = [
            ("stockout_risk", "critical", 1, "Parle-G: 3 Days to Stockout", "Stock is projected to run out soon. Reorder immediately.", -4800),
            ("dead_stock", "warning", 19, "Lifebuoy Soap: Dead Stock Alert", "No recent velocity. Consider a promotion to unlock working capital.", -2160),
            ("margin_drop", "warning", 5, "Maggi Noodles: Margin Compression", "Margin is below target versus category benchmark.", -1200),
            ("festival_opportunity", "info", None, "Festival Demand Spike Predicted", "Pre-stock high-velocity staples before the next local demand spike.", 18000),
        ]
        for alert_type, severity, product_id, title, message, impact in alerts:
            db.add(
                Alert(
                    alert_type=alert_type,
                    severity=severity,
                    product_id=product_id,
                    title=title,
                    message=message,
                    financial_impact=float(impact),
                )
            )

        db.commit()
        print(f"Seeded {len(INDIAN_RETAIL_PRODUCTS)} products with 90 days of demo sales.")
    except Exception as exc:
        db.rollback()
        print(f"Seed error: {exc}")
    finally:
        db.close()
