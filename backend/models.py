from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(String(100))
    brand = Column(String(100))
    unit = Column(String(20), default="unit")
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    image_url = Column(String(500))
    barcode = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="product", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="product", cascade="all, delete-orphan")
    reorder_suggestions = relationship("ReorderSuggestion", back_populates="product", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="product")

    @property
    def profit_margin(self):
        if not self.selling_price:
            return 0.0
        return round((self.selling_price - self.cost_price) / self.selling_price * 100, 2)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, unique=True, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    reorder_point = Column(Integer, default=20)
    max_stock = Column(Integer, default=200)
    location = Column(String(100), default="Main Store")
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="inventory")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity_sold = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    sale_date = Column(Date, nullable=False, index=True)
    hour_of_day = Column(Integer)
    day_of_week = Column(Integer)
    is_festival_day = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="sales")

    @property
    def total_revenue(self):
        return round((self.quantity_sold or 0) * (self.unit_price or 0), 2)


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_demand = Column(Float, nullable=False)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    confidence_score = Column(Float)
    model_version = Column(String(20), default="local-ma-v1")
    generated_at = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="forecasts")


class ReorderSuggestion(Base):
    __tablename__ = "reorder_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    suggested_quantity = Column(Integer, nullable=False)
    urgency_level = Column(String(20), default="medium")
    estimated_stockout_date = Column(Date)
    suggested_order_date = Column(Date)
    estimated_cost = Column(Float)
    reasoning = Column(Text)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="reorder_suggestions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    financial_impact = Column(Float)
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="alerts")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class ShelfScan(Base):
    __tablename__ = "shelf_scans"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(300))
    detected_items = Column(Text)
    scan_accuracy = Column(Float)
    gaps_detected = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    supplier_name = Column(String(200))
    total_items = Column(Integer)
    total_value = Column(Float)
    status = Column(String(30), default="draft")
    pdf_path = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("PurchaseOrderItem", back_populates="order", cascade="all, delete-orphan")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)

    order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

    @property
    def total_cost(self):
        return round((self.quantity or 0) * (self.unit_cost or 0), 2)
