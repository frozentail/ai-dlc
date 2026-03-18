from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import AdminLoginRequest, TableLoginRequest, AdminSetupRequest, TokenResponse, TableTokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/admin/setup")
async def setup_admin(data: AdminSetupRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.setup_admin(db, data.store_identifier, data.store_name, data.username, data.password)


@router.post("/admin/login", response_model=TokenResponse)
async def login_admin(data: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    token = await auth_service.login_admin(db, data.store_identifier, data.username, data.password)
    return TokenResponse(access_token=token)


@router.post("/table/login", response_model=TableTokenResponse)
async def login_table(data: TableLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.login_table(db, data.store_identifier, data.table_number, data.password)
    return TableTokenResponse(**result)
