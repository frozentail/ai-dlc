# Domain Entities - Backend API (Unit 1)

---

## Store (매장)
```
Store
├── id: UUID (PK)
├── identifier: string (unique) - 매장 식별자 (로그인용)
├── name: string - 매장명
└── created_at: datetime
```

## Admin (관리자)
```
Admin
├── id: UUID (PK)
├── store_id: UUID (FK → Store)
├── username: string
├── password_hash: string (bcrypt)
├── login_attempts: int (default 0)
├── locked_until: datetime | null
└── created_at: datetime
```

## Table (테이블)
```
Table
├── id: UUID (PK)
├── store_id: UUID (FK → Store)
├── table_number: int
├── password_hash: string (bcrypt)
└── created_at: datetime
```

## TableSession (테이블 세션)
```
TableSession
├── id: UUID (PK)
├── table_id: UUID (FK → Table)
├── started_at: datetime
├── ended_at: datetime | null  - null이면 현재 활성 세션
└── total_amount: int (원 단위)
```

## Category (카테고리)
```
Category
├── id: UUID (PK)
├── store_id: UUID (FK → Store)
├── name: string
└── sort_order: int
```

## Menu (메뉴)
```
Menu
├── id: UUID (PK)
├── store_id: UUID (FK → Store)
├── category_id: UUID (FK → Category)
├── name: string
├── price: int (원 단위, 0 이상)
├── description: string | null
├── image_path: string | null
├── sort_order: int
└── created_at: datetime
```

## Order (주문)
```
Order
├── id: UUID (PK)
├── table_id: UUID (FK → Table)
├── session_id: UUID (FK → TableSession)
├── status: enum (PENDING | PREPARING | COMPLETED)
├── total_amount: int (원 단위)
└── created_at: datetime
```

## OrderItem (주문 항목)
```
OrderItem
├── id: UUID (PK)
├── order_id: UUID (FK → Order)
├── menu_id: UUID (FK → Menu)
├── menu_name: string (주문 시점 스냅샷)
├── unit_price: int (주문 시점 스냅샷)
└── quantity: int (1 이상)
```

---

## 관계 다이어그램

```
Store (1) ──< Admin (N)
Store (1) ──< Table (N)
Store (1) ──< Category (N)
Store (1) ──< Menu (N)
Category (1) ──< Menu (N)
Table (1) ──< TableSession (N)
TableSession (1) ──< Order (N)
Order (1) ──< OrderItem (N)
Menu (1) ──< OrderItem (N)
```

---

## 핵심 설계 결정

1. **OrderItem에 menu_name, unit_price 스냅샷 저장**: 메뉴 수정/삭제 후에도 과거 주문 내역 보존
2. **TableSession.ended_at = null**: 현재 활성 세션 식별자
3. **가격 단위**: 원(KRW) 정수형 저장 (소수점 없음)
4. **UUID PK**: 예측 불가능한 ID로 보안 강화
