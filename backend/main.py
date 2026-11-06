import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine
from routers import alerts, chat, forecast, insights, inventory, products, reorder, sales, scanner
from seed_data import seed_if_empty
from websocket_manager import manager


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("SHELFMIND_DATA_DIR", Path(tempfile.gettempdir()) / "shelfmind-ai"))
UPLOAD_DIR = DATA_DIR / "uploads"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_if_empty()
    yield


app = FastAPI(
    title="ShelfMind AI",
    description="Local-first AI-powered retail intelligence backend",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Forecast"])
app.include_router(reorder.router, prefix="/api/reorder", tags=["Reorder"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(scanner.router, prefix="/api/scanner", tags=["Scanner"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await websocket.send_json({"type": "ack", "received": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
def root():
    return {"name": "ShelfMind AI Backend", "status": "running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "2.0.0", "database": "sqlite", "ai": "local-ready"}
