# Logical Components - Backend API (Unit 1)

---

## 컴포넌트 구성

```
FastAPI Application
├── Middleware Layer
│   ├── CORS Middleware
│   └── Auth Middleware (JWT 검증 Depends)
├── Router Layer
│   ├── AuthRouter (/auth)
│   ├── MenuRouter (/menus, /categories)
│   ├── OrderRouter (/orders)
│   ├── TableRouter (/tables)
│   └── SSERouter (/sse)
├── Service Layer
│   ├── AuthService
│   ├── MenuService
│   ├── OrderService
│   ├── TableService
│   └── SSEService (인메모리 연결 풀)
├── Model Layer (SQLAlchemy)
│   ├── Store, Admin
│   ├── Table, TableSession
│   ├── Category, Menu
│   └── Order, OrderItem
├── Schema Layer (Pydantic)
│   ├── Request schemas
│   └── Response schemas
└── Infrastructure
    ├── DB Engine (asyncpg + PostgreSQL)
    ├── Static Files (/static/uploads)
    └── Settings (pydantic-settings)
```

---

## SSE 연결 풀 (인메모리)

```
SSEService
├── admin_connections: dict[store_id → list[Queue]]
│   - 관리자 SSE 연결 등록/해제
│   - store_id 기준 broadcast
└── table_connections: dict[session_id → Queue]
    - 고객 SSE 연결 등록/해제
    - session_id 기준 단일 전송
```

- 외부 메시지 브로커 없음 (소규모 매장, 단일 서버 기준)
- 서버 재시작 시 연결 재수립 (브라우저 자동 재연결)

---

## DB 세션 관리

```
lifespan (앱 시작/종료)
└── create_async_engine → async_sessionmaker

요청 처리
└── Depends(get_db) → AsyncSession
    └── try: yield session
        finally: await session.close()
```

---

## 파일 저장소

```
static/
└── uploads/
    └── {uuid}.{ext}  ← 업로드된 이미지

FastAPI StaticFiles 마운트: /static → ./static
이미지 접근 URL: http://localhost:8000/static/uploads/{uuid}.{ext}
```
