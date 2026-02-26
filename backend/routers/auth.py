from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.schemas import ProtectedResponse, SignupRequest, TokenResponse, UserResponse
from services.auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_user_by_email,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db_session)) -> UserResponse:
    """
    Register a new user.
    - Checks if email already exists
    - Hashes password
    - Stores user in PostgreSQL
    """
    existing_user = await get_user_by_email(db, data.email)
    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = await register_user(
        db=db,
        full_name=data.full_name,
        email=data.email,
        password=data.password,
        phone=data.phone,
        state=data.state,
    )
    return UserResponse(id=user.id, full_name=user.full_name, email=user.email)


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """
    OAuth2-compatible login endpoint.
    Clients send username=email and password as form data.
    Returns a JWT Bearer token.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.email)
    return TokenResponse(access_token=access_token)


@router.get("/protected", response_model=ProtectedResponse)
async def protected_route(current_user=Depends(get_current_user)) -> ProtectedResponse:
    """
    Example protected endpoint requiring a valid JWT token.
    Send header: Authorization: Bearer <token>
    """
    user_data = UserResponse(id=current_user.id, full_name=current_user.full_name, email=current_user.email)
    return ProtectedResponse(message="You have access to this protected endpoint", user=user_data)
