from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.table import Table, TableSession
from app.models.order import Order
from app.models.base import generate_uuid
from app.schemas.table import TableSetupRequest
from app.services.sse_service import sse_service
from app.services.auth_service import hash_password


async def get_tables(db: AsyncSession, store_id: str) -> list[Table]:
    result = await db.execute(select(Table).where(Table.store_id == store_id).order_by(Table.table_number))
    return list(result.scalars().all())


async def setup_table(db: AsyncSession, store_id: str, data: TableSetupRequest) -> Table:
    # 기존 테이블 조회
    result = await db.execute(
        select(Table).where(Table.store_id == store_id, Table.table_number == data.table_number)
    )
    table = result.scalar_one_or_none()

    if table:
        table.password_hash = hash_password(data.password)
    else:
        table = Table(
            id=generate_uuid(),
            store_id=store_id,
            table_number=data.table_number,
            password_hash=hash_password(data.password),
        )
        db.add(table)

    await db.commit()
    await db.refresh(table)
    return table


async def get_active_session(db: AsyncSession, table_id: str) -> TableSession | None:
    result = await db.execute(
        select(TableSession).where(TableSession.table_id == table_id, TableSession.ended_at.is_(None))
    )
    return result.scalar_one_or_none()


async def complete_session(db: AsyncSession, store_id: str, table_id: str):
    # 권한 확인
    result = await db.execute(select(Table).where(Table.id == table_id, Table.store_id == store_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    session = await get_active_session(db, table_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="활성 세션이 없습니다")

    session.ended_at = datetime.now(timezone.utc).replace(tzinfo=None)
    session.total_amount = 0
    await db.commit()

    await sse_service.broadcast_to_admin(store_id, "session_completed", {
        "table_id": table_id, "session_id": session.id
    })
    return {"success": True}


async def get_table_history(
    db: AsyncSession,
    store_id: str,
    table_id: str,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict]:
    # 권한 확인
    result = await db.execute(select(Table).where(Table.id == table_id, Table.store_id == store_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    query = select(TableSession).where(
        TableSession.table_id == table_id,
        TableSession.ended_at.is_not(None),
    )
    if date_from:
        query = query.where(TableSession.ended_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.where(TableSession.ended_at <= datetime.fromisoformat(date_to))
    query = query.order_by(TableSession.ended_at.desc())

    result = await db.execute(query)
    sessions = result.scalars().all()

    history = []
    for session in sessions:
        orders_result = await db.execute(
            select(Order).where(Order.session_id == session.id).order_by(Order.created_at)
        )
        orders = orders_result.scalars().all()
        history.append({"session": session, "orders": orders})

    return history
