from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    menu_id: str
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("수량은 1 이상이어야 합니다")
        return v


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("주문 항목이 없습니다")
        return v


class OrderItemResponse(BaseModel):
    id: str
    menu_id: str
    menu_name: str
    unit_price: int
    quantity: int

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    table_id: str
    session_id: str
    status: OrderStatus
    total_amount: int
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
