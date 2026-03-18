# Units of Work - 테이블 오더 애플리케이션

## 배포 모델
- Docker Compose 기반 단일 호스트 배포
- 3개 독립 서비스로 구성 (각각 별도 컨테이너)

---

## Unit 1: Backend API

- **서비스명**: `backend`
- **기술 스택**: Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL + Alembic
- **컨테이너**: `backend` (포트 8000)
- **책임**:
  - REST API 제공 (인증, 메뉴, 주문, 테이블)
  - SSE 실시간 이벤트 스트림
  - JWT 인증 및 bcrypt 비밀번호 해싱
  - DB 마이그레이션 (Alembic)
  - 이미지 파일 저장 (static/uploads/)

- **디렉토리 구조**:
```
backend/
├── app/
│   ├── main.py               # FastAPI 앱 진입점
│   ├── config.py             # 환경 변수 설정
│   ├── database.py           # DB 연결 설정
│   ├── models/               # SQLAlchemy ORM 모델
│   │   ├── store.py
│   │   ├── admin.py
│   │   ├── table.py
│   │   ├── menu.py
│   │   └── order.py
│   ├── schemas/              # Pydantic 스키마
│   │   ├── auth.py
│   │   ├── menu.py
│   │   ├── order.py
│   │   └── table.py
│   ├── routers/              # API 라우터
│   │   ├── auth.py
│   │   ├── menus.py
│   │   ├── orders.py
│   │   ├── tables.py
│   │   └── sse.py
│   ├── services/             # 비즈니스 로직
│   │   ├── auth_service.py
│   │   ├── menu_service.py
│   │   ├── order_service.py
│   │   ├── table_service.py
│   │   └── sse_service.py
│   └── middleware/
│       └── auth_middleware.py
├── alembic/                  # DB 마이그레이션
├── static/uploads/           # 이미지 파일 저장
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## Unit 2: Customer Frontend

- **서비스명**: `customer-frontend`
- **기술 스택**: React 18 (JavaScript) + Vite + React Router
- **컨테이너**: `customer-frontend` (포트 3000)
- **책임**:
  - 고객용 메뉴 조회, 장바구니, 주문 UI
  - 테이블 자동 로그인 (localStorage)
  - 장바구니 localStorage 유지
  - SSE 기반 주문 상태 실시간 업데이트

- **디렉토리 구조**:
```
customer-frontend/
├── src/
│   ├── main.jsx              # 앱 진입점
│   ├── App.jsx               # 라우팅 설정
│   ├── api/                  # API 클라이언트
│   │   └── client.js
│   ├── context/              # 전역 상태
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── MenuPage.jsx
│   │   ├── OrderConfirmPage.jsx
│   │   ├── OrderHistoryPage.jsx
│   │   └── SetupPage.jsx     # 초기 설정 화면
│   ├── components/           # 공통 컴포넌트
│   │   ├── MenuCard.jsx
│   │   ├── CartDrawer.jsx
│   │   └── OrderStatusBadge.jsx
│   └── hooks/                # 커스텀 훅
│       ├── useSSE.js
│       └── useCart.js
├── package.json
├── vite.config.js
└── Dockerfile
```

---

## Unit 3: Admin Frontend

- **서비스명**: `admin-frontend`
- **기술 스택**: React 18 (JavaScript) + Vite + React Router
- **컨테이너**: `admin-frontend` (포트 3001)
- **책임**:
  - 관리자 로그인 (JWT, 16시간 세션)
  - 실시간 주문 모니터링 대시보드 (SSE)
  - 테이블 관리 (세션 시작/종료, 과거 내역)
  - 메뉴 관리 (CRUD, 드래그 앤 드롭 순서)

- **디렉토리 구조**:
```
admin-frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   └── client.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TableManagementPage.jsx
│   │   └── MenuManagementPage.jsx
│   ├── components/
│   │   ├── TableCard.jsx
│   │   ├── OrderDetailModal.jsx
│   │   ├── OrderHistoryModal.jsx
│   │   └── MenuForm.jsx
│   └── hooks/
│       └── useSSE.js
├── package.json
├── vite.config.js
└── Dockerfile
```

---

## 공통 인프라

```
docker-compose.yml            # 전체 서비스 오케스트레이션
├── backend (포트 8000)
├── customer-frontend (포트 3000)
├── admin-frontend (포트 3001)
└── postgres (포트 5432)
.env                          # 환경 변수 (DB URL, JWT Secret 등)
```
