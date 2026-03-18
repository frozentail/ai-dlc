from pydantic import BaseModel, field_validator
from typing import Optional


class CategoryResponse(BaseModel):
    id: str
    name: str
    sort_order: int

    model_config = {"from_attributes": True}


class MenuCreate(BaseModel):
    category_id: str
    name: str
    price: int
    description: Optional[str] = None
    image_path: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str) -> str:
        if not 1 <= len(v) <= 100:
            raise ValueError("메뉴명은 1~100자여야 합니다")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("가격은 0 이상이어야 합니다")
        return v


class MenuUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    price: Optional[int] = None
    description: Optional[str] = None
    image_path: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("가격은 0 이상이어야 합니다")
        return v


class MenuResponse(BaseModel):
    id: str
    category_id: str
    name: str
    price: int
    description: Optional[str]
    image_path: Optional[str]
    sort_order: int

    model_config = {"from_attributes": True}


class MenuReorderItem(BaseModel):
    id: str
    sort_order: int


class MenuReorderRequest(BaseModel):
    items: list[MenuReorderItem]
