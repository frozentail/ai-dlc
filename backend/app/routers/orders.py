from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin, get_current_table
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    table: dict = Depends(get_current_table),
):
    return await order_service.create_order(
        db, table["table_id"], table["session_id"], table["store_id"], data
    )


@router.get("/session/{session_id}", response_model=list[OrderResponse])
async def get_session_orders(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    table: dict = Depends(get_current_table),
):
    return await order_service.get_session_orders(db, session_id)


@router.get("", response_model=list[OrderResponse])
async def get_all_orders(
    table_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await order_service.get_all_orders(db, admin["store_id"], table_id)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await order_service.update_order_status(db, admin["store_id"], order_id, data)


@router.delete("/{order_id}")
async def delete_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    await order_service.delete_order(db, admin["store_id"], order_id)
    return {"success": True}
