import os

from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Example:
# postgresql+asyncpg://postgres:password@localhost:5432/healthcare_voice
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/healthcare_voice",
)

SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=SQL_ECHO,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


async def init_db() -> None:
    """
    Run this during app startup if you want SQLAlchemy to auto-create tables.
    For production, prefer Alembic migrations.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
