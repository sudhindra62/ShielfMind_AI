import csv
import io
from datetime import date

from models import Inventory, Product, Sale


def import_sales_csv_bytes(db, content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    imported, errors = 0, []
    for row_number, row in enumerate(reader, start=2):
        try:
            sku = (row.get("sku") or "").strip()
            product = db.query(Product).filter(Product.sku == sku).first()
            if not product:
                errors.append(f"Row {row_number}: SKU '{sku}' not found")
                continue
            sale_date = date.fromisoformat(row.get("date") or date.today().isoformat())
            quantity = int(row.get("quantity") or row.get("quantity_sold") or 1)
            unit_price = float(row.get("price") or row.get("unit_price") or product.selling_price)
            db.add(Sale(product_id=product.id, quantity_sold=quantity, unit_price=unit_price, sale_date=sale_date, day_of_week=sale_date.weekday()))
            inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
            if inventory:
                inventory.quantity = max(0, inventory.quantity - quantity)
            imported += 1
        except Exception as exc:
            errors.append(f"Row {row_number}: {exc}")
    return imported, errors
