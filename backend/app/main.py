from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.routers import auth, menus, orders, tables, sse


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("static/uploads", exist_ok=True)
    yield


app = FastAPI(title="테이블 오더 API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(menus.router)
app.include_router(orders.router)
app.include_router(tables.router)
app.include_router(sse.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
