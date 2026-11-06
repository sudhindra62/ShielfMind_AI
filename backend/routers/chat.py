from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import ChatMessage
from schemas import ChatRequest, ChatResponse
from services.chat_service import answer_inventory_question


router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat_with_ai(payload: ChatRequest, db: Session = Depends(get_db)):
    db.add(ChatMessage(session_id=payload.session_id, role="user", content=payload.message))
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == payload.session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(6)
        .all()
    )
    history_payload = [{"role": item.role, "content": item.content} for item in reversed(history)]
    answer = answer_inventory_question(payload.message, db, history_payload)
    db.add(ChatMessage(session_id=payload.session_id, role="assistant", content=answer))
    db.commit()
    return ChatResponse(answer=answer, session_id=payload.session_id, timestamp=datetime.now().isoformat())


@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    return [
        {"role": item.role, "content": item.content, "timestamp": item.created_at.isoformat() if item.created_at else None}
        for item in messages
    ]


@router.delete("/history/{session_id}")
def clear_history(session_id: str, db: Session = Depends(get_db)):
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.commit()
    return {"cleared": True}
