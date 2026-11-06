import os
import random


def analyze_shelf_image(filepath: str):
    filename = os.path.basename(filepath).lower()
    product_hints = {
        "biscuit": random.randint(8, 20),
        "butter": random.randint(4, 12),
        "salt": random.randint(10, 28),
        "maggi": random.randint(6, 18),
        "tea": random.randint(5, 15),
    }
    if not any(key in filename for key in product_hints):
        product_hints = {
            "Parle-G": random.randint(8, 20),
            "Maggi": random.randint(5, 16),
            "Tata": random.randint(6, 18),
            "Amul": random.randint(4, 12),
        }
    return {
        "detected_products": product_hints,
        "scan_accuracy": round(random.uniform(0.78, 0.92), 2),
        "empty_gaps": random.randint(0, 4),
        "model": "local-demo-vision",
    }
