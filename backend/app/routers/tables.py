from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.schemas.table import TableSetupRequest, TableResponse
from app.services import table_service

router = APIRouter(prefix="/tables", tags=["tables"])


@router.get("", response_model=list[TableResponse])
async def get_tables(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await table_service.get_tables(db, admin["store_id"])


@router.post("/setup", response_model=TableResponse)
async def setup_table(
    data: TableSetupRequest,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await table_service.setup_table(db, admin["store_id"], data)


@router.post("/{table_id}/complete")
async def complete_session(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await table_service.complete_session(db, admin["store_id"], table_id)


@router.delete("/{table_id}")
async def delete_table(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    await table_service.delete_table(db, admin["store_id"], table_id)
    return {"success": True}


@router.get("/{table_id}/history")
async def get_table_history(
    table_id: str,
    date_from: str | None = None,
    date_to: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    history = await table_service.get_table_history(db, admin["store_id"], table_id, date_from, date_to)
    result = []
    for entry in history:
        session = entry["session"]
        result.append({
            "session_id": session.id,
            "started_at": session.started_at,
            "ended_at": session.ended_at,
            "orders": [
                {
                    "id": o.id,
                    "status": o.status,
                    "total_amount": o.total_amount,
                    "created_at": o.created_at,
                }
                for o in entry["orders"]
            ],
        })
    return result
