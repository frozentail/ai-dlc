# Frontend Components - Customer Frontend (Unit 2)

## 컴포넌트 계층 구조

```
App.jsx
├── AuthContext (Provider)
│   └── CartContext (Provider)
│       ├── SetupPage          /setup
│       ├── MenuPage           /          (기본 홈)
│       │   ├── CategoryTabs
│       │   ├── MenuCard (list)
│       │   └── CartDrawer (overlay)
│       │       └── CartItem (list)
│       ├── OrderConfirmPage   /order/confirm
│       └── OrderHistoryPage   /orders
│           └── OrderStatusBadge
```

---

## 컴포넌트 상세 정의

### App.jsx
- **역할**: 라우팅 설정, Context Provider 래핑
- **라우트**:
  - `/setup` → SetupPage
  - `/` → MenuPage (인증 필요)
  - `/order/confirm` → OrderConfirmPage (인증 필요)
  - `/orders` → OrderHistoryPage (인증 필요)
- **인증 가드**: 로컬 스토리지에 자격증명 없으면 `/setup`으로 리다이렉트

---

### AuthContext
- **역할**: 테이블 자동 로그인, 세션 토큰 관리
- **State**:
  - `token: string | null` - JWT 토큰
  - `tableInfo: { storeIdentifier, tableNumber, tableId, sessionId } | null`
  - `isLoading: boolean`
  - `error: string | null`
- **Actions**:
  - `setup(storeIdentifier, tableNumber, password)` - 초기 설정 저장 + 로그인
  - `autoLogin()` - 로컬 스토리지 자격증명으로 자동 로그인
  - `logout()` - 토큰 및 로컬 스토리지 초기화
- **localStorage keys**: `table_store_id`, `table_number`, `table_password`
- **초기화 시**: `autoLogin()` 자동 호출, 실패 시 `/setup`으로 이동

---

### CartContext
- **역할**: 장바구니 상태 관리, localStorage 동기화
- **State**:
  - `items: CartItem[]` - `{ menuId, menuName, price, quantity }`
  - `totalAmount: number`
- **Actions**:
  - `addItem(menu)` - 메뉴 추가 (이미 있으면 수량 +1)
  - `increaseQty(menuId)` - 수량 증가
  - `decreaseQty(menuId)` - 수량 감소 (1이면 삭제)
  - `removeItem(menuId)` - 항목 삭제
  - `clearCart()` - 전체 비우기
- **localStorage key**: `cart_items`
- **동기화**: items 변경 시마다 localStorage에 저장

---

### SetupPage (`/setup`)
- **역할**: 최초 1회 매장/테이블 정보 입력
- **State**: `form: { storeIdentifier, tableNumber, password }`, `error`, `isLoading`
- **UI 요소**:
  - 매장 식별자 input
  - 테이블 번호 input (number)
  - 비밀번호 input (password)
  - 저장 버튼
  - 에러 메시지 표시 영역
- **Validation**: 3개 필드 모두 필수, 비어있으면 에러 표시
- **성공 시**: AuthContext.setup() 호출 → 성공 시 `/`로 이동
- **API**: `POST /auth/table/login`

---

### MenuPage (`/`)
- **역할**: 메뉴 목록 조회, 장바구니 접근
- **State**: `categories: []`, `menus: []`, `activeCategory: string`, `isCartOpen: boolean`
- **UI 요소**:
  - 상단 헤더 (매장명, 테이블 번호, 주문내역 버튼)
  - CategoryTabs (카테고리 탭 목록)
  - MenuCard 그리드
  - 하단 고정 장바구니 버튼 (총 금액, 아이템 수)
  - CartDrawer (오버레이)
- **데이터 로드**: 마운트 시 카테고리 + 메뉴 전체 로드
- **API**: `GET /categories`, `GET /menus`

---

### CategoryTabs
- **Props**: `categories: Category[]`, `activeId: string`, `onChange: (id) => void`
- **UI**: 수평 스크롤 가능한 탭 목록
- **터치**: 최소 44px 높이

---

### MenuCard
- **Props**: `menu: Menu`, `onAdd: (menu) => void`
- **UI 요소**:
  - 메뉴 이미지 (없으면 placeholder)
  - 메뉴명, 가격, 설명
  - "담기" 버튼 (최소 44x44px)
- **이벤트**: 담기 버튼 클릭 → `CartContext.addItem(menu)`

---

### CartDrawer
- **Props**: `isOpen: boolean`, `onClose: () => void`
- **UI 요소**:
  - 오버레이 배경 (클릭 시 닫기)
  - CartItem 목록
  - 총 금액 표시
  - 장바구니 비우기 버튼
  - 주문하기 버튼 → `/order/confirm`으로 이동
- **빈 장바구니**: "담긴 메뉴가 없습니다" 메시지

---

### CartItem
- **Props**: `item: CartItem`, `onIncrease`, `onDecrease`, `onRemove`
- **UI**: 메뉴명, 단가, 수량 조절 버튼(+/-), 소계, 삭제 버튼
- **터치**: +/- 버튼 최소 44x44px

---

### OrderConfirmPage (`/order/confirm`)
- **역할**: 주문 최종 확인 및 확정
- **State**: `isLoading`, `error`, `orderId`
- **UI 요소**:
  - 주문 메뉴 목록 (메뉴명, 수량, 단가, 소계)
  - 총 금액
  - 뒤로가기 버튼
  - 주문 확정 버튼
  - 성공 시: 주문 번호 표시 (5초 후 자동 이동)
  - 실패 시: 에러 메시지
- **장바구니 비어있으면**: `/`로 리다이렉트
- **주문 확정 흐름**:
  1. `POST /orders` 호출
  2. 성공 → 주문 번호 표시 → 5초 후 `clearCart()` + `/`로 이동
  3. 실패 → 에러 메시지, 장바구니 유지

---

### OrderHistoryPage (`/orders`)
- **역할**: 현재 세션 주문 내역 조회 + 실시간 상태 업데이트
- **State**: `orders: Order[]`, `isLoading`
- **데이터 로드**: 마운트 시 `GET /orders/session/{sessionId}`
- **실시간**: `useSSE` 훅으로 SSE 연결, `order_status_updated` 이벤트 수신 시 해당 주문 상태 업데이트
- **UI 요소**:
  - 주문 목록 (시간 순)
  - 각 주문: 주문 번호, 시각, 메뉴 목록, 금액, OrderStatusBadge
  - 뒤로가기 버튼

---

### OrderStatusBadge
- **Props**: `status: 'pending' | 'preparing' | 'completed'`
- **UI**: 상태별 색상 배지
  - `pending` → 노란색 "대기중"
  - `preparing` → 파란색 "준비중"
  - `completed` → 초록색 "완료"

---

### useSSE (hook)
- **파라미터**: `url: string`, `token: string`
- **동작**: `EventSource` 생성, 이벤트 리스너 등록
- **반환**: `{ lastEvent, isConnected }`
- **정리**: 컴포넌트 언마운트 시 `EventSource.close()`
- **연결 끊김**: 브라우저 기본 자동 재연결 활용

---

### useCart (hook)
- **역할**: CartContext 소비 편의 훅
- **반환**: `{ items, totalAmount, addItem, increaseQty, decreaseQty, removeItem, clearCart, itemCount }`

---

## API 연동 포인트

| 컴포넌트 | API 엔드포인트 | 메서드 |
|----------|---------------|--------|
| AuthContext | `/auth/table/login` | POST |
| MenuPage | `/categories` | GET |
| MenuPage | `/menus` | GET |
| OrderConfirmPage | `/orders` | POST |
| OrderHistoryPage | `/orders/session/{sessionId}` | GET |
| useSSE | `/sse/table/{tableId}` | GET (EventSource) |
