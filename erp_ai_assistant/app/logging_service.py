import json

from sqlalchemy.ext.asyncio import AsyncSession

from .models import SessionLog


async def log_session_interaction(
    db: AsyncSession,
    *,
    session_id: str,
    prompt: str,
    intent: str,
    api_called: str,
    response_payload: dict,
    status: str,
) -> None:
    log_row = SessionLog(
        session_id=session_id,
        user_prompt=prompt,
        intent=intent,
        api_called=api_called,
        response_json=json.dumps(response_payload, default=str),
        status=status,
    )
    db.add(log_row)
    await db.commit()
