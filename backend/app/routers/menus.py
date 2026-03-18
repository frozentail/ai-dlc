from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.schemas.menu import MenuCreate, MenuUpdate, MenuResponse, CategoryResponse, MenuReorderRequest
from app.services import menu_service

router = APIRouter(tags=["menus"])


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    return await menu_service.get_categories(db, admin["store_id"])


@router.get("/menus", response_model=list[MenuResponse])
async def get_menus(
    category_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await menu_service.get_menus(db, admin["store_id"], category_id)


# 고객용 공개 메뉴 조회 (인증 불필요)
@router.get("/public/menus", response_model=list[MenuResponse])
async def get_public_menus(
    store_id: str,
    category_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.get_menus(db, store_id, category_id)


@router.get("/public/categories", response_model=list[CategoryResponse])
async def get_public_categories(store_id: str, db: AsyncSession = Depends(get_db)):
    return await menu_service.get_categories(db, store_id)


@router.post("/menus", response_model=MenuResponse)
async def create_menu(
    data: MenuCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await menu_service.create_menu(db, admin["store_id"], data)


@router.put("/menus/{menu_id}", response_model=MenuResponse)
async def update_menu(
    menu_id: str,
    data: MenuUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    return await menu_service.update_menu(db, admin["store_id"], menu_id, data)


@router.delete("/menus/{menu_id}")
async def delete_menu(
    menu_id: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    await menu_service.delete_menu(db, admin["store_id"], menu_id)
    return {"success": True}


@router.put("/menus/reorder")
async def reorder_menus(
    data: MenuReorderRequest,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    await menu_service.reorder_menus(db, admin["store_id"], data)
    return {"success": True}


@router.post("/menus/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
):
    image_path = await menu_service.upload_image(file)
    return {"image_path": image_path}
