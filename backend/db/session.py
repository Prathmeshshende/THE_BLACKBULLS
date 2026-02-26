from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from db.database import AsyncSessionLocal


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database sessions.

    Use this in routers with:
        from fastapi import Depends
        from sqlalchemy.ext.asyncio import AsyncSession
        from db.session import get_db_session

        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db_session)):
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session
