# Logical Components - Customer Frontend (Unit 2)

## 컴포넌트 구성도

```
customer-frontend/
├── [Browser Storage]
│   ├── localStorage: cart_items       # 장바구니 영속성
│   ├── localStorage: table_store_id   # 자격증명
│   ├── localStorage: table_number
│   └── localStorage: table_password
│
├── [Memory State]
│   ├── AuthContext                    # token, tableInfo
│   └── CartContext                    # items, totalAmount
│
├── [Network Layer]
│   ├── API Client (fetch wrapper)     # REST API 호출
│   └── EventSource (SSE)             # 실시간 이벤트 수신
│
└── [UI Layer]
    ├── Pages (SetupPage, MenuPage, OrderConfirmPage, OrderHistoryPage)
    ├── Components (MenuCard, CartDrawer, CartItem, OrderStatusBadge)
    └── Hooks (useSSE, useCart)
```

---

## 논리 컴포넌트 역할

| 컴포넌트 | 유형 | 역할 |
|----------|------|------|
| localStorage | Browser Storage | 자격증명 + 장바구니 영속성 |
| AuthContext | Memory State | JWT 토큰, 테이블 세션 정보 |
| CartContext | Memory State | 장바구니 아이템, 총 금액 |
| API Client | Network | Backend REST API 통신 |
| EventSource | Network | SSE 실시간 이벤트 수신 |
| Nginx | Infra | 정적 파일 서빙, `/api` 프록시 |

---

## 외부 의존성

| 의존 대상 | 통신 방식 | 용도 |
|----------|----------|------|
| Backend API (포트 8000) | HTTP/REST | 인증, 메뉴, 주문 |
| Backend SSE (포트 8000) | EventSource | 주문 상태 실시간 수신 |

---

## 배포 구성

```
Docker Container: customer-frontend
  ├── Nginx (포트 3000)
  │   ├── /          → dist/ (React 빌드 결과)
  │   └── /api/*     → backend:8000 (프록시)
  └── dist/          (Vite 빌드 산출물)
```

- `VITE_API_URL` 환경 변수로 API base URL 설정
- Nginx 프록시로 CORS 이슈 없이 Backend 호출
