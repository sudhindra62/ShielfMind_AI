from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory, Product
from schemas import ProductCreate, ProductResponse, ProductUpdate


router = APIRouter()


def _product_response(product: Product):
    response = ProductResponse.model_validate(product)
    response.profit_margin = product.profit_margin
    return response


@router.get("/", response_model=List[ProductResponse])
def list_products(category: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        term = f"%{search}%"
        query = query.filter(Product.name.ilike(term) | Product.sku.ilike(term) | Product.brand.ilike(term))
    return [_product_response(product) for product in query.order_by(Product.name).all()]


@router.get("/categories/list")
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(Product.category).distinct().filter(Product.category.isnot(None)).order_by(Product.category).all()
    return [row[0] for row in rows if row[0]]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_response(product)


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status_code=409, detail=f"SKU {payload.sku} already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.flush()
    db.add(Inventory(product_id=product.id, quantity=0))
    db.commit()
    db.refresh(product)
    return _product_response(product)


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return _product_response(product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"deleted": True, "product_id": product_id}
