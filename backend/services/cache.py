import os
import importlib
from typing import Any

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_redis_client: Any | None = None


def _resolve_redis_module() -> Any:
    """
    Resolve Redis client module lazily.

    Tries `aioredis` first, then falls back to `redis.asyncio`.
    """
    try:
        return importlib.import_module("aioredis")
    except ModuleNotFoundError:
        return importlib.import_module("redis.asyncio")


async def get_redis_client() -> Any:
    """
    Optional Redis cache connection for faster repeated lookups.

    Example usage in router/service:
        redis = await get_redis_client()
        await redis.set("key", "value", ex=60)
        value = await redis.get("key")
    """
    global _redis_client

    if _redis_client is None:
        redis_module = _resolve_redis_module()
        _redis_client = redis_module.from_url(REDIS_URL, decode_responses=True)

    return _redis_client


async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    redis = await get_redis_client()
    await redis.set(key, value, ex=ttl_seconds)


async def cache_get(key: str) -> str | None:
    redis = await get_redis_client()
    return await redis.get(key)


async def close_redis() -> None:
    global _redis_client
    if _redis_client is not None:
        close_method = getattr(_redis_client, "aclose", None) or getattr(_redis_client, "close", None)
        if close_method is not None:
            await close_method()
        _redis_client = None
