from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.order import Order, OrderItem, OrderStatus
from app.models.menu import Menu
from app.models.table import TableSession
from app.models.base import generate_uuid
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.services.sse_service import sse_service

from sqlalchemy.orm import selectinload

STATUS_TRANSITIONS = {
    OrderStatus.PENDING: OrderStatus.PREPARING,
    OrderStatus.PREPARING: OrderStatus.COMPLETED,
}


async def create_order(db: AsyncSession, table_id: str, session_id: str, store_id: str, data: OrderCreate) -> Order:
    # 메뉴 유효성 검증 및 스냅샷 수집
    items_data = []
    total = 0
    for item in data.items:
        result = await db.execute(select(Menu).where(Menu.id == item.menu_id, Menu.store_id == store_id))
        menu = result.scalar_one_or_none()
        if not menu:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"유효하지 않은 메뉴: {item.menu_id}")
        subtotal = menu.price * item.quantity
        total += subtotal
        items_data.append({"menu": menu, "quantity": item.quantity})

    order = Order(
        id=generate_uuid(),
        table_id=table_id,
        session_id=session_id,
        status=OrderStatus.PENDING,
        total_amount=total,
    )
    db.add(order)
    await db.flush()

    for item_data in items_data:
        order_item = OrderItem(
            id=generate_uuid(),
            order_id=order.id,
            menu_id=item_data["menu"].id,
            menu_name=item_data["menu"].name,
            unit_price=item_data["menu"].price,
            quantity=item_data["quantity"],
        )
        db.add(order_item)

    # 세션 총액 업데이트
    result = await db.execute(select(TableSession).where(TableSession.id == session_id))
    session = result.scalar_one_or_none()
    if session:
        session.total_amount += total

    await db.commit()

    # items eager load
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    order = result.scalar_one()

    # SSE 이벤트 발행
    await sse_service.broadcast_to_admin(store_id, "new_order", {
        "order_id": order.id,
        "table_id": table_id,
        "total_amount": total,
        "items": [{"menu_name": i["menu"].name, "quantity": i["quantity"]} for i in items_data],
    })

    return order


async def get_session_orders(db: AsyncSession, session_id: str) -> list[Order]:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.session_id == session_id).order_by(Order.created_at)
    )
    return list(result.scalars().all())


async def get_all_orders(db: AsyncSession, store_id: str, table_id: str | None = None) -> list[Order]:
    from app.models.table import Table
    result = await db.execute(select(Table).where(Table.store_id == store_id))
    tables = result.scalars().all()
    table_ids = [t.id for t in tables]

    query = select(Order).options(selectinload(Order.items)).where(Order.table_id.in_(table_ids))
    if table_id:
        query = query.where(Order.table_id == table_id)
    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_order_status(db: AsyncSession, store_id: str, order_id: str, data: OrderStatusUpdate) -> Order:
    from app.models.table import Table
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다")

    # 권한 확인
    result = await db.execute(select(Table).where(Table.id == order.table_id, Table.store_id == store_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    # 상태 전환 검증
    allowed_next = STATUS_TRANSITIONS.get(order.status)
    if data.status != allowed_next:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="유효하지 않은 상태 전환입니다")

    order.status = data.status
    await db.commit()

    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    order = result.scalar_one()

    # SSE 이벤트 발행
    await sse_service.broadcast_to_admin(store_id, "order_status_changed", {
        "order_id": order.id, "status": order.status.value
    })
    await sse_service.send_to_table(order.session_id, "order_status_changed", {
        "order_id": order.id, "status": order.status.value
    })

    return order


async def delete_order(db: AsyncSession, store_id: str, order_id: str):
    from app.models.table import Table
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다")

    result = await db.execute(select(Table).where(Table.id == order.table_id, Table.store_id == store_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    # 세션 총액 재계산
    result = await db.execute(select(TableSession).where(TableSession.id == order.session_id))
    session = result.scalar_one_or_none()
    if session:
        session.total_amount = max(0, session.total_amount - order.total_amount)

    await db.delete(order)
    await db.commit()

    await sse_service.broadcast_to_admin(store_id, "order_deleted", {
        "order_id": order_id, "table_id": order.table_id
    })
