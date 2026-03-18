from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.config import settings
from app.models.store import Store, Admin
from app.models.table import Table, TableSession
from app.models.base import generate_uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(payload: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다")


# ── 관리자 초기 설정 ──────────────────────────────────────────────
async def setup_admin(db: AsyncSession, store_identifier: str, store_name: str, username: str, password: str):
    # Store 조회 또는 생성
    result = await db.execute(select(Store).where(Store.identifier == store_identifier))
    store = result.scalar_one_or_none()

    if not store:
        store = Store(id=generate_uuid(), identifier=store_identifier, name=store_name)
        db.add(store)
        await db.flush()

    # 이미 Admin 존재 여부 확인
    result = await db.execute(select(Admin).where(Admin.store_id == store.id))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 관리자 계정이 존재합니다")

    admin = Admin(
        id=generate_uuid(),
        store_id=store.id,
        username=username,
        password_hash=hash_password(password),
    )
    db.add(admin)
    await db.commit()
    return {"success": True}


# ── 관리자 로그인 ─────────────────────────────────────────────────
async def login_admin(db: AsyncSession, store_identifier: str, username: str, password: str) -> str:
    result = await db.execute(select(Store).where(Store.identifier == store_identifier))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패")

    result = await db.execute(select(Admin).where(Admin.store_id == store.id, Admin.username == username))
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패")

    # 잠금 확인
    if admin.locked_until and admin.locked_until > datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="로그인 시도 횟수 초과. 잠시 후 다시 시도하세요")

    if not verify_password(password, admin.password_hash):
        admin.login_attempts += 1
        if admin.login_attempts >= MAX_LOGIN_ATTEMPTS:
            admin.locked_until = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=LOCKOUT_MINUTES)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패")

    # 성공 시 초기화
    admin.login_attempts = 0
    admin.locked_until = None
    await db.commit()

    return create_token({"role": "admin", "admin_id": admin.id, "store_id": store.id})


# ── 테이블 로그인 ─────────────────────────────────────────────────
async def login_table(db: AsyncSession, store_identifier: str, table_number: int, password: str) -> dict:
    result = await db.execute(select(Store).where(Store.identifier == store_identifier))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패")

    result = await db.execute(
        select(Table).where(Table.store_id == store.id, Table.table_number == table_number)
    )
    table = result.scalar_one_or_none()
    if not table or not verify_password(password, table.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패")

    # 활성 세션 조회 또는 생성
    result = await db.execute(
        select(TableSession).where(TableSession.table_id == table.id, TableSession.ended_at.is_(None))
    )
    session = result.scalar_one_or_none()
    if not session:
        session = TableSession(id=generate_uuid(), table_id=table.id)
        db.add(session)
        await db.commit()
        await db.refresh(session)

    token = create_token({"role": "table", "table_id": table.id, "session_id": session.id, "store_id": store.id})
    return {"access_token": token, "session_id": session.id, "table_number": table.table_number}
