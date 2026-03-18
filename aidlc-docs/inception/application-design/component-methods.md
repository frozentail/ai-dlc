# Component Methods - 테이블 오더 애플리케이션

> 상세 비즈니스 로직은 Construction Phase의 Functional Design에서 정의됩니다.

---

## Backend API (FastAPI)

### BC-01. AuthRouter

| Method | Endpoint | Input | Output | 설명 |
|--------|----------|-------|--------|------|
| POST | /auth/admin/login | {store_identifier, username, password} | {access_token, expires_in} | 관리자 로그인 |
| POST | /auth/table/login | {store_identifier, table_number, password} | {access_token, session_id} | 테이블 자동 로그인 |
| POST | /auth/admin/setup | {store_identifier, username, password} | {success} | 초기 관리자 계정 생성 |

### BC-02. MenuRouter

| Method | Endpoint | Input | Output | 설명 |
|--------|----------|-------|--------|------|
| GET | /menus | {category_id?} | List[Menu] | 메뉴 목록 조회 |
| GET | /categories | - | List[Category] | 카테고리 목록 조회 |
| POST | /menus | MenuCreate | Menu | 메뉴 등록 (관리자) |
| PUT | /menus/{id} | MenuUpdate | Menu | 메뉴 수정 (관리자) |
| DELETE | /menus/{id} | - | {success} | 메뉴 삭제 (관리자) |
| POST | /menus/upload-image | File | {image_path} | 이미지 업로드 (관리자) |
| PUT | /menus/reorder | List[{id, sort_order}] | {success} | 순서 변경 (관리자) |

### BC-03. OrderRouter

| Method | Endpoint | Input | Output | 설명 |
|--------|----------|-------|--------|------|
| POST | /orders | OrderCreate | Order | 주문 생성 (고객) |
| GET | /orders/session/{session_id} | - | List[Order] | 현재 세션 주문 조회 (고객) |
| GET | /orders | {table_id?} | List[Order] | 전체 주문 조회 (관리자) |
| PUT | /orders/{id}/status | {status} | Order | 주문 상태 변경 (관리자) |
| DELETE | /orders/{id} | - | {success} | 주문 삭제 (관리자) |

### BC-04. TableRouter

| Method | Endpoint | Input | Output | 설명 |
|--------|----------|-------|--------|------|
| GET | /tables | - | List[Table] | 테이블 목록 조회 (관리자) |
| POST | /tables | TableCreate | Table | 테이블 생성 (관리자) |
| PUT | /tables/{id}/setup | {table_number, password} | Table | 테이블 초기 설정 (관리자) |
| POST | /tables/{id}/complete | - | {success} | 이용 완료 처리 (관리자) |
| GET | /tables/{id}/history | {date_from?, date_to?} | List[OrderHistory] | 과거 주문 내역 조회 (관리자) |

### BC-05. SSERouter

| Method | Endpoint | Input | Output | 설명 |
|--------|----------|-------|--------|------|
| GET | /sse/admin | - | EventStream | 관리자용 실시간 이벤트 스트림 |
| GET | /sse/table/{session_id} | - | EventStream | 고객용 주문 상태 이벤트 스트림 |

---

## Customer Frontend (React JS)

### CF-01. AutoLoginProvider

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| loadStoredCredentials() | - | Credentials \| null | 로컬 스토리지에서 인증 정보 로드 |
| autoLogin(credentials) | Credentials | AuthResult | 자동 로그인 API 호출 |
| saveCredentials(credentials) | Credentials | void | 인증 정보 로컬 스토리지 저장 |
| clearCredentials() | - | void | 인증 정보 삭제 |

### CF-02. MenuPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| fetchCategories() | - | List[Category] | 카테고리 목록 조회 |
| fetchMenus(categoryId) | categoryId | List[Menu] | 카테고리별 메뉴 조회 |
| handleAddToCart(menu) | Menu | void | 장바구니에 메뉴 추가 |

### CF-03. CartDrawer

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| addItem(menu) | Menu | void | 메뉴 추가 |
| removeItem(menuId) | menuId | void | 메뉴 삭제 |
| updateQuantity(menuId, qty) | menuId, qty | void | 수량 변경 |
| clearCart() | - | void | 장바구니 비우기 |
| calculateTotal() | - | number | 총 금액 계산 |
| syncToLocalStorage() | - | void | 로컬 스토리지 동기화 |
| loadFromLocalStorage() | - | CartItem[] | 로컬 스토리지에서 로드 |

### CF-04. OrderConfirmPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| submitOrder(cartItems) | CartItem[] | Order | 주문 확정 API 호출 |
| handleSuccess(order) | Order | void | 성공 처리 (5초 표시 후 리다이렉트) |
| handleError(error) | Error | void | 실패 처리 (에러 메시지 표시) |

### CF-05. OrderHistoryPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| fetchSessionOrders(sessionId) | sessionId | List[Order] | 현재 세션 주문 조회 |
| connectSSE(sessionId) | sessionId | EventSource | SSE 연결 |
| handleStatusUpdate(event) | SSEEvent | void | 주문 상태 실시간 업데이트 |

---

## Admin Frontend (React JS)

### AF-01. LoginPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| handleLogin(credentials) | AdminCredentials | void | 로그인 API 호출 및 토큰 저장 |
| validateForm() | - | boolean | 입력값 유효성 검사 |

### AF-02. DashboardPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| fetchOrders() | - | List[Order] | 전체 주문 조회 |
| connectSSE() | - | EventSource | 관리자 SSE 연결 |
| handleNewOrder(event) | SSEEvent | void | 신규 주문 처리 (강조 표시) |
| filterByTable(tableId) | tableId \| null | void | 테이블별 필터링 |

### AF-03. OrderDetailModal

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| updateOrderStatus(orderId, status) | orderId, status | void | 주문 상태 변경 API 호출 |
| deleteOrder(orderId) | orderId | void | 주문 삭제 API 호출 (확인 팝업 포함) |

### AF-04. TableManagementPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| setupTable(tableId, config) | tableId, TableConfig | void | 테이블 초기 설정 |
| completeSession(tableId) | tableId | void | 이용 완료 처리 (확인 팝업 포함) |
| fetchHistory(tableId, dateRange) | tableId, DateRange | List[OrderHistory] | 과거 내역 조회 |

### AF-05. MenuManagementPage

| Function | Input | Output | 설명 |
|----------|-------|--------|------|
| fetchMenus() | - | List[Menu] | 메뉴 목록 조회 |
| createMenu(data) | MenuCreate | Menu | 메뉴 등록 |
| updateMenu(id, data) | id, MenuUpdate | Menu | 메뉴 수정 |
| deleteMenu(id) | id | void | 메뉴 삭제 (확인 팝업 포함) |
| uploadImage(file) | File | string | 이미지 업로드 |
| reorderMenus(items) | List[{id, sort_order}] | void | 드래그 앤 드롭 순서 저장 |
