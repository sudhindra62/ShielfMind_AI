from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str
    sku: str
    category: Optional[str] = None
    brand: Optional[str] = None
    unit: str = "unit"
    cost_price: float = Field(..., ge=0)
    selling_price: float = Field(..., gt=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    cost_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    barcode: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    profit_margin: float = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    reorder_point: int
    max_stock: int
    location: str
    last_updated: Optional[datetime] = None
    product: Optional[ProductResponse] = None
    is_low_stock: bool = False
    is_overstock: bool = False
    stock_percentage: float = 0.0

    class Config:
        from_attributes = True


class StockUpdateRequest(BaseModel):
    quantity: int = Field(..., ge=0)
    reason: Optional[str] = "manual_adjustment"


class SaleCreate(BaseModel):
    product_id: int
    quantity_sold: int = Field(..., ge=1)
    unit_price: Optional[float] = Field(None, gt=0)
    sale_date: Optional[date] = None
    hour_of_day: Optional[int] = Field(None, ge=0, le=23)


class SaleResponse(BaseModel):
    id: int
    product_id: int
    quantity_sold: int
    unit_price: float
    total_revenue: float
    sale_date: date
    hour_of_day: Optional[int] = None
    is_festival_day: bool = False

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: int
    alert_type: str
    severity: str
    product_id: Optional[int] = None
    title: str
    message: str
    financial_impact: Optional[float] = None
    is_read: bool
    is_resolved: bool
    created_at: Optional[datetime] = None
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    session_id: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    timestamp: str


class KPIResponse(BaseModel):
    total_stock_value: float
    revenue_today: float
    revenue_this_week: float
    low_stock_products: int
    critical_alerts: int
    health_score: int
    total_products: int
    overstock_products: int


class ReorderGenerateRequest(BaseModel):
    product_ids: Optional[list[int]] = None
    supplier_name: str = "Local Supplier Network"


class WhatIfRequest(BaseModel):
    demand_multiplier: float = Field(1.0, gt=0)
    lead_time_days: int = Field(3, ge=0)
    safety_stock: int = Field(10, ge=0)


class ScannerApplyRequest(BaseModel):
    counts: list[dict[str, Any]]
