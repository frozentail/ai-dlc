# Component Dependencies - 테이블 오더 애플리케이션

---

## 시스템 레이어 구조

```
[Customer Browser]          [Admin Browser]
       |                           |
  Customer UI                 Admin UI
  (React JS)                 (React JS)
       |                           |
       +----------+----------------+
                  |
            HTTP / SSE
                  |
          Backend API (FastAPI)
                  |
         +--------+--------+
         |                 |
    PostgreSQL DB     Static Files
                      (이미지 저장)
```

---

## Backend 의존성

| 컴포넌트 | 의존 대상 | 의존 유형 |
|----------|-----------|-----------|
| AuthRouter | AuthService | 직접 호출 |
| MenuRouter | MenuService | 직접 호출 |
| OrderRouter | OrderService | 직접 호출 |
| TableRouter | TableService | 직접 호출 |
| SSERouter | SSEService | 직접 호출 |
| AuthService | DB (Admin, Table 모델) | ORM |
| MenuService | DB (Menu, Category 모델) | ORM |
| OrderService | DB (Order, OrderItem 모델) | ORM |
| OrderService | SSEService | 이벤트 발행 |
| TableService | DB (Table, TableSession 모델) | ORM |
| TableService | OrderService | 세션 종료 시 주문 이력 이동 |
| AuthMiddleware | AuthService | JWT 검증 |

---

## Customer Frontend 의존성

| 컴포넌트 | 의존 대상 | 의존 유형 |
|----------|-----------|-----------|
| AutoLoginProvider | ApiClient, AuthStore | API 호출, 상태 관리 |
| MenuPage | ApiClient, CartStore | API 호출, 장바구니 상태 |
| CartDrawer | CartStore | 상태 관리 |
| OrderConfirmPage | ApiClient, CartStore | API 호출, 장바구니 비우기 |
| OrderHistoryPage | ApiClient, SSEClient | API 호출, 실시간 업데이트 |

---

## Admin Frontend 의존성

| 컴포넌트 | 의존 대상 | 의존 유형 |
|----------|-----------|-----------|
| LoginPage | ApiClient, AuthStore | API 호출, 상태 저장 |
| DashboardPage | ApiClient, SSEClient | API 호출, 실시간 수신 |
| OrderDetailModal | ApiClient | API 호출 |
| TableManagementPage | ApiClient | API 호출 |
| MenuManagementPage | ApiClient | API 호출 |

---

## API 통신 패턴

| 방향 | 방식 | 용도 |
|------|------|------|
| Frontend → Backend | REST HTTP | 데이터 조회/생성/수정/삭제 |
| Backend → Admin UI | SSE | 신규 주문, 주문 상태 변경 실시간 push |
| Backend → Customer UI | SSE | 주문 상태 변경 실시간 push |

---

## 데이터 흐름 - 주문 생성

```
고객이 주문 확정
      |
      v
Customer UI (OrderConfirmPage)
      |  POST /orders
      v
Backend (OrderRouter → OrderService)
      |  DB 저장
      v
PostgreSQL (Order, OrderItem)
      |  SSE 이벤트 발행
      v
SSEService
      |  broadcast
      +---> Admin UI (DashboardPage) - 신규 주문 표시
      +---> Customer UI (OrderHistoryPage) - 주문 목록 업데이트
```

---

## 데이터 흐름 - 테이블 이용 완료

```
운영자가 이용 완료 처리
      |
      v
Admin UI (TableManagementPage)
      |  POST /tables/{id}/complete
      v
Backend (TableRouter → TableService)
      |
      +---> 현재 세션 주문 → OrderHistory 이동
      +---> 테이블 총 주문액 0 리셋
      +---> 새 TableSession 생성 준비
      |
      v
PostgreSQL 업데이트 완료
```
