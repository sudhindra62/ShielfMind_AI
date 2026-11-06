from models import Alert, Inventory, Product


def set_stock(db, product_id: int, quantity: int, reason: str = "manual_adjustment"):
    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    product = db.query(Product).filter(Product.id == product_id).first()
    if not inventory or not product:
        return None
    old_quantity = inventory.quantity
    inventory.quantity = max(0, quantity)
    if inventory.quantity <= inventory.reorder_point and old_quantity > inventory.reorder_point:
        db.add(
            Alert(
                alert_type="low_stock",
                severity="warning",
                product_id=product_id,
                title=f"Low Stock - {product.name}",
                message=f"Stock dropped to {inventory.quantity}, below reorder point {inventory.reorder_point}.",
                financial_impact=-(product.selling_price * inventory.reorder_point),
            )
        )
    return {"product": product, "inventory": inventory, "old_quantity": old_quantity, "reason": reason}
