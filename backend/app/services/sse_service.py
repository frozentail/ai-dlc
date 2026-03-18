import asyncio
import json
from typing import Dict, List


class SSEService:
    def __init__(self):
        # store_id → list of queues (관리자 연결)
        self.admin_connections: Dict[str, List[asyncio.Queue]] = {}
        # session_id → queue (고객 연결)
        self.table_connections: Dict[str, asyncio.Queue] = {}

    # ── 관리자 연결 관리 ──────────────────────────────────────────
    def add_admin_connection(self, store_id: str, queue: asyncio.Queue):
        if store_id not in self.admin_connections:
            self.admin_connections[store_id] = []
        self.admin_connections[store_id].append(queue)

    def remove_admin_connection(self, store_id: str, queue: asyncio.Queue):
        if store_id in self.admin_connections:
            try:
                self.admin_connections[store_id].remove(queue)
            except ValueError:
                pass

    # ── 고객 연결 관리 ────────────────────────────────────────────
    def add_table_connection(self, session_id: str, queue: asyncio.Queue):
        self.table_connections[session_id] = queue

    def remove_table_connection(self, session_id: str):
        self.table_connections.pop(session_id, None)

    # ── 이벤트 발행 ───────────────────────────────────────────────
    async def broadcast_to_admin(self, store_id: str, event_type: str, data: dict):
        message = {"type": event_type, "data": data}
        for queue in self.admin_connections.get(store_id, []):
            await queue.put(message)

    async def send_to_table(self, session_id: str, event_type: str, data: dict):
        message = {"type": event_type, "data": data}
        queue = self.table_connections.get(session_id)
        if queue:
            await queue.put(message)

    # ── SSE 포맷 변환 ─────────────────────────────────────────────
    @staticmethod
    def format_sse(data: dict) -> str:
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


sse_service = SSEService()
