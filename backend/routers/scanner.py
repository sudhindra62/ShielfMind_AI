import json
import os
import shutil
import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory, Product, ShelfScan
from schemas import ScannerApplyRequest
from services.scanner_service import analyze_shelf_image
from websocket_manager import manager


router = APIRouter()
DATA_DIR = Path(os.getenv("SHELFMIND_DATA_DIR", Path(tempfile.gettempdir()) / "shelfmind-ai"))
UPLOAD_DIR = DATA_DIR / "uploads"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/analyze")
async def analyze_shelf(image: UploadFile = File(...), db: Session = Depends(get_db)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    filename = f"{uuid.uuid4().hex}_{image.filename}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as output:
        shutil.copyfileobj(image.file, output)

    results = analyze_shelf_image(filepath)
    scan = ShelfScan(
        image_filename=filename,
        detected_items=json.dumps(results["detected_products"]),
        scan_accuracy=results["scan_accuracy"],
        gaps_detected=results["empty_gaps"],
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    await manager.send_scan_complete(results)
    return {**results, "scan_id": scan.id, "image_url": f"/uploads/{filename}"}


@router.post("/apply")
async def apply_scan_counts(payload: ScannerApplyRequest, db: Session = Depends(get_db)):
    updated = []
    for item in payload.counts:
        product_id = item.get("product_id")
        sku = item.get("sku")
        quantity = item.get("quantity")
        if quantity is None:
            continue
        query = db.query(Product)
        product = query.filter(Product.id == product_id).first() if product_id else query.filter(Product.sku == sku).first()
        if not product:
            continue
        inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if inventory:
            old = inventory.quantity
            inventory.quantity = max(0, int(quantity))
            updated.append({"product_id": product.id, "sku": product.sku, "old_quantity": old, "new_quantity": inventory.quantity})
    db.commit()
    await manager.broadcast({"type": "inventory.bulk_updated", "updated": updated})
    return {"updated": len(updated), "items": updated}


@router.get("/history")
def get_scan_history(limit: int = 10, db: Session = Depends(get_db)):
    scans = db.query(ShelfScan).order_by(ShelfScan.created_at.desc()).limit(limit).all()
    return [
        {
            "id": scan.id,
            "image_url": f"/uploads/{scan.image_filename}" if scan.image_filename else None,
            "accuracy": scan.scan_accuracy,
            "gaps": scan.gaps_detected,
            "items": json.loads(scan.detected_items) if scan.detected_items else {},
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
        }
        for scan in scans
    ]


@router.post("/use-demo-image")
async def use_demo_image():
    demo_path = os.path.join("data", "sample_shelf_photo.jpg")
    results = analyze_shelf_image(demo_path)
    await manager.send_scan_complete(results)
    return results
