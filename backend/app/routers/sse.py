import asyncio
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.dependencies import get_current_admin, get_current_table
from app.services.sse_service import sse_service

router = APIRouter(prefix="/sse", tags=["sse"])


async def event_generator(queue: asyncio.Queue):
    """SSE 이벤트 스트림 제너레이터"""
    try:
        while True:
            message = await queue.get()
            yield sse_service.format_sse(message)
    except asyncio.CancelledError:
        pass


@router.get("/admin")
async def admin_sse(admin: dict = Depends(get_current_admin)):
    queue: asyncio.Queue = asyncio.Queue()
    store_id = admin["store_id"]
    sse_service.add_admin_connection(store_id, queue)

    async def stream():
        try:
            async for event in event_generator(queue):
                yield event
        finally:
            sse_service.remove_admin_connection(store_id, queue)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/table/{session_id}")
async def table_sse(session_id: str, table: dict = Depends(get_current_table)):
    queue: asyncio.Queue = asyncio.Queue()
    sse_service.add_table_connection(session_id, queue)

    async def stream():
        try:
            async for event in event_generator(queue):
                yield event
        finally:
            sse_service.remove_table_connection(session_id)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
