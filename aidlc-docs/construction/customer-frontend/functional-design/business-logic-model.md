# Business Logic Model - Customer Frontend (Unit 2)

## 핵심 비즈니스 플로우

### 1. 앱 초기화 플로우

```
앱 로드
  └─ localStorage에 자격증명 있음?
       ├─ YES → autoLogin() → POST /auth/table/login
       │          ├─ 성공 → token 저장 → MenuPage 표시
       │          └─ 실패 → 에러 표시 → SetupPage 이동
       └─ NO  → SetupPage 이동
```

### 2. 초기 설정 플로우 (SetupPage)

```
운영자 입력: storeIdentifier + tableNumber + password
  └─ 필수값 검증
       ├─ 실패 → 에러 메시지 표시
       └─ 성공 → POST /auth/table/login
                  ├─ 성공 → localStorage 저장 → MenuPage 이동
                  └─ 실패 → 에러 메시지 표시
```

### 3. 메뉴 조회 플로우

```
MenuPage 마운트
  └─ GET /categories + GET /menus (병렬 호출)
       └─ 첫 번째 카테고리 자동 선택
            └─ 해당 카테고리 메뉴 필터링 표시
                 └─ 카테고리 탭 클릭 → 해당 카테고리 메뉴 표시
```

### 4. 장바구니 관리 플로우

```
메뉴 "담기" 클릭
  └─ CartContext.addItem(menu)
       ├─ 동일 menuId 있음 → quantity + 1
       └─ 없음 → 새 항목 추가 { menuId, menuName, price, quantity: 1 }
            └─ totalAmount 재계산
                 └─ localStorage 동기화

수량 조절
  ├─ "+" → increaseQty(menuId) → quantity + 1
  └─ "-" → decreaseQty(menuId)
             ├─ quantity > 1 → quantity - 1
             └─ quantity = 1 → removeItem(menuId)

페이지 새로고침
  └─ CartContext 초기화 시 localStorage에서 items 복원
```

### 5. 주문 확정 플로우

```
OrderConfirmPage 진입
  └─ 장바구니 비어있음? → MenuPage 리다이렉트

주문 확정 버튼 클릭
  └─ POST /orders
       payload: {
         table_session_id: sessionId,
         items: [{ menu_id, menu_name, quantity, unit_price }]
       }
       ├─ 성공 → 주문 번호 표시
       │          └─ 5초 후 → clearCart() → MenuPage 이동
       └─ 실패 → 에러 메시지 표시 (장바구니 유지)
```

### 6. 주문 내역 + 실시간 업데이트 플로우

```
OrderHistoryPage 마운트
  ├─ GET /orders/session/{sessionId} → 초기 주문 목록 로드
  └─ useSSE('/sse/table/{tableId}', token) → SSE 연결

SSE 이벤트 수신
  └─ event: 'order_status_updated'
       payload: { orderId, status }
       └─ orders 배열에서 해당 orderId 찾아 status 업데이트 (immutable update)
```

---

## 상태 관리 모델

### 전역 상태 (Context)

| Context | 상태 | 범위 |
|---------|------|------|
| AuthContext | token, tableInfo, isLoading, error | 앱 전체 |
| CartContext | items, totalAmount | 앱 전체 |

### 로컬 상태 (useState)

| 컴포넌트 | 상태 |
|----------|------|
| SetupPage | form, error, isLoading |
| MenuPage | categories, menus, activeCategory, isCartOpen |
| OrderConfirmPage | isLoading, error, orderId (성공 시) |
| OrderHistoryPage | orders, isLoading |

---

## 데이터 변환 로직

### totalAmount 계산
```
totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
```

### 카테고리 필터링
```
filteredMenus = menus.filter(m => m.category_id === activeCategory)
```

### 주문 payload 변환
```
cartItems → orderItems: items.map(item => ({
  menu_id: item.menuId,
  menu_name: item.menuName,
  quantity: item.quantity,
  unit_price: item.price
}))
```
