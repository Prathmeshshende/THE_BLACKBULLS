from typing import Protocol

from fastapi import APIRouter, Depends, Request

from models.schemas import StatusResponse

router = APIRouter(tags=["status"])


class DatabaseClient(Protocol):
    async def get_status(self, session_id: str) -> dict[str, object]: ...


def get_db_client(request: Request) -> DatabaseClient:
    return request.app.state.db_client


@router.get("/status", response_model=StatusResponse)
async def get_status(
    session_id: str = "default-session",
    db_client: DatabaseClient = Depends(get_db_client),
) -> StatusResponse:
    status = await db_client.get_status(session_id)
    return StatusResponse(
        session_id=session_id,
        last_interaction=str(status["last_interaction"]),
        logs=list(status["logs"]),
        history=list(status["history"]),
    )
