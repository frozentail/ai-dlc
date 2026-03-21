import uuid
import os
import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.menu import Category, Menu
from app.models.base import generate_uuid
from app.schemas.menu import MenuCreate, MenuUpdate, MenuReorderRequest

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
UPLOAD_DIR = "static/uploads"


async def create_category(db: AsyncSession, store_id: str, name: str) -> Category:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id).order_by(Category.sort_order.desc())
    )
    last = result.scalars().first()
    next_order = (last.sort_order + 1) if last else 0
    category = Category(id=generate_uuid(), store_id=store_id, name=name, sort_order=next_order)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, store_id: str, category_id: str):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.store_id == store_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="카테고리를 찾을 수 없습니다")
    await db.delete(category)
    await db.commit()


async def get_categories(db: AsyncSession, store_id: str) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id).order_by(Category.sort_order)
    )
    return list(result.scalars().all())


async def get_menus(db: AsyncSession, store_id: str, category_id: str | None = None) -> list[Menu]:
    query = select(Menu).where(Menu.store_id == store_id)
    if category_id:
        query = query.where(Menu.category_id == category_id)
    query = query.order_by(Menu.sort_order)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_menu(db: AsyncSession, store_id: str, data: MenuCreate) -> Menu:
    # 카테고리 소속 확인
    result = await db.execute(
        select(Category).where(Category.id == data.category_id, Category.store_id == store_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="유효하지 않은 카테고리입니다")

    # sort_order: 해당 카테고리 내 마지막 순서
    result = await db.execute(
        select(Menu).where(Menu.category_id == data.category_id).order_by(Menu.sort_order.desc())
    )
    last = result.scalars().first()
    next_order = (last.sort_order + 1) if last else 0

    menu = Menu(
        id=generate_uuid(),
        store_id=store_id,
        category_id=data.category_id,
        name=data.name,
        price=data.price,
        description=data.description,
        image_path=data.image_path,
        sort_order=next_order,
    )
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    return menu


async def update_menu(db: AsyncSession, store_id: str, menu_id: str, data: MenuUpdate) -> Menu:
    result = await db.execute(select(Menu).where(Menu.id == menu_id, Menu.store_id == store_id))
    menu = result.scalar_one_or_none()
    if not menu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="메뉴를 찾을 수 없습니다")

    if data.category_id is not None:
        result = await db.execute(
            select(Category).where(Category.id == data.category_id, Category.store_id == store_id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="유효하지 않은 카테고리입니다")
        menu.category_id = data.category_id

    if data.name is not None:
        menu.name = data.name
    if data.price is not None:
        menu.price = data.price
    if data.description is not None:
        menu.description = data.description
    if data.image_path is not None:
        menu.image_path = data.image_path

    await db.commit()
    await db.refresh(menu)
    return menu


async def delete_menu(db: AsyncSession, store_id: str, menu_id: str):
    result = await db.execute(select(Menu).where(Menu.id == menu_id, Menu.store_id == store_id))
    menu = result.scalar_one_or_none()
    if not menu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="메뉴를 찾을 수 없습니다")
    await db.delete(menu)
    await db.commit()


async def reorder_menus(db: AsyncSession, store_id: str, data: MenuReorderRequest):
    for item in data.items:
        result = await db.execute(select(Menu).where(Menu.id == item.id, Menu.store_id == store_id))
        menu = result.scalar_one_or_none()
        if not menu:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"메뉴 {item.id}에 대한 권한이 없습니다")
        menu.sort_order = item.sort_order
    await db.commit()


async def upload_image(file: UploadFile) -> str:
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="허용되지 않는 파일 형식입니다")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="파일 크기는 5MB 이하여야 합니다")

    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return filename
