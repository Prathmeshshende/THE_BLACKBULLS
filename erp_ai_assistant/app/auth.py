from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from .config import get_settings

bearer_scheme = HTTPBearer(auto_error=True)


def create_access_token(subject: str, scopes: list[str], expires_minutes: int = 120) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "scopes": scopes,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.app_jwt_secret, algorithm=settings.app_jwt_algorithm)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.app_jwt_secret,
            algorithms=[settings.app_jwt_algorithm],
        )
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def require_scopes(required_scopes: list[str]):
    def _checker(payload: dict = Depends(verify_token)) -> dict:
        token_scopes = set(payload.get("scopes", []))
        missing = [scope for scope in required_scopes if scope not in token_scopes]
        if missing:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing scopes: {', '.join(missing)}")
        return payload

    return _checker
