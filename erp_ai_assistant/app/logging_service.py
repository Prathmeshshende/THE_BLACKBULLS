import json

from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from .db import Base, engine
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
    payload_json = json.dumps(response_payload, default=str)

    async def insert_log_row() -> None:
        log_row = SessionLog(
            session_id=session_id,
            user_prompt=prompt,
            intent=intent,
            api_called=api_called,
            response_json=payload_json,
            status=status,
        )
        db.add(log_row)
        await db.commit()

    try:
        await insert_log_row()
    except OperationalError:
        # Ensure table exists when startup lifecycle hooks were not executed.
        await db.rollback()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await insert_log_row()
