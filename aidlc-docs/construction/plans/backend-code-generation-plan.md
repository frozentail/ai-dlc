# Code Generation Plan - Backend API (Unit 1)

## 방식: Standard
## 위치: workspace root / backend/

---

## 단계별 체크리스트

### Step 1: 프로젝트 구조 설정
- [x] 1.1 backend/ 디렉토리 구조 생성
- [x] 1.2 requirements.txt 생성
- [x] 1.3 .env.example 생성
- [x] 1.4 Dockerfile 생성
- [x] 1.5 alembic.ini + alembic/env.py 생성

### Step 2: 설정 및 DB 연결
- [x] 2.1 app/config.py (pydantic-settings)
- [x] 2.2 app/database.py (async engine, session)

### Step 3: DB 모델 (SQLAlchemy ORM)
- [x] 3.1 app/models/base.py (Base, UUID PK mixin)
- [x] 3.2 app/models/store.py (Store, Admin)
- [x] 3.3 app/models/table.py (Table, TableSession)
- [x] 3.4 app/models/menu.py (Category, Menu)
- [x] 3.5 app/models/order.py (Order, OrderItem)
- [x] 3.6 alembic/versions/001_initial.py (초기 마이그레이션)

### Step 4: Pydantic 스키마
- [x] 4.1 app/schemas/auth.py
- [x] 4.2 app/schemas/menu.py
- [x] 4.3 app/schemas/order.py
- [x] 4.4 app/schemas/table.py

### Step 5: 서비스 레이어
- [x] 5.1 app/services/sse_service.py (연결 풀, 이벤트 발행)
- [x] 5.2 app/services/auth_service.py (JWT, bcrypt, rate limiting)
- [x] 5.3 app/services/menu_service.py (메뉴 CRUD, 이미지, 순서)
- [x] 5.4 app/services/order_service.py (주문 생성, 상태 변경, 삭제)
- [x] 5.5 app/services/table_service.py (세션 라이프사이클, 과거 내역)

### Step 6: 라우터 레이어
- [x] 6.1 app/routers/auth.py (로그인, 초기 설정)
- [x] 6.2 app/routers/menus.py (메뉴/카테고리 CRUD)
- [x] 6.3 app/routers/orders.py (주문 생성/조회/상태변경/삭제)
- [x] 6.4 app/routers/tables.py (테이블 관리, 세션, 과거 내역)
- [x] 6.5 app/routers/sse.py (SSE 스트림 엔드포인트)

### Step 7: 앱 진입점
- [x] 7.1 app/main.py (FastAPI 앱, 미들웨어, 라우터 등록, lifespan)

### Step 8: 정적 파일 디렉토리
- [x] 8.1 backend/static/uploads/.gitkeep

---

## 스토리 커버리지

| Step | 구현 Story |
|------|-----------|
| 3, 6 (alembic) | 전체 도메인 모델 |
| 5.2, 6.1 | US-01, US-02, US-13, US-14 |
| 5.3, 6.2 | US-03, US-04, US-22, US-23, US-24, US-25 |
| 5.4, 6.3 | US-11, US-12, US-15, US-16, US-17, US-18, US-19 |
| 5.5, 6.4 | US-20, US-21 |
| 5.1, 6.5 | US-16 (SSE), US-12 (SSE) |

---

## 코드 위치
- **Application Code**: `backend/` (workspace root)
- **Documentation**: `aidlc-docs/construction/backend/code/`

## 완료 상태: ✅ ALL STEPS COMPLETED (2026-03-18)
