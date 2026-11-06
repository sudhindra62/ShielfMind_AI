from datetime import datetime
from typing import List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await websocket.send_json(
            {
                "type": "system.connected",
                "message": "Connected to ShelfMind AI live feed",
                "timestamp": datetime.now().isoformat(),
            }
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        payload = {**data, "timestamp": datetime.now().isoformat()}
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                disconnected.append(connection)
        for connection in disconnected:
            self.disconnect(connection)

    async def send_stock_update(self, product_id: int, new_qty: int, product_name: str):
        await self.broadcast(
            {
                "type": "inventory.updated",
                "product_id": product_id,
                "product_name": product_name,
                "new_quantity": new_qty,
                "alert": new_qty < 20,
            }
        )

    async def send_alert(self, alert_type: str, message: str, severity: str, financial_impact: float | None = None):
        await self.broadcast(
            {
                "type": "alert.created",
                "alert_type": alert_type,
                "message": message,
                "severity": severity,
                "financial_impact": financial_impact,
            }
        )

    async def send_forecast_ready(self, product_id: int, summary: dict):
        await self.broadcast({"type": "forecast.completed", "product_id": product_id, "summary": summary})

    async def send_scan_complete(self, results: dict):
        await self.broadcast({"type": "scan.completed", "results": results})


manager = ConnectionManager()
