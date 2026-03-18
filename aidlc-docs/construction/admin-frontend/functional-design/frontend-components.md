# Frontend Components - Admin Frontend (Unit 3)

## 컴포넌트 계층 구조

```
App.jsx
└── AuthContext (Provider)
    ├── LoginPage              /login
    └── (인증 필요)
        ├── DashboardPage      /
        │   ├── TableCard (list)
        │   └── OrderDetailModal (overlay)
        ├── TableManagementPage  /tables
        │   ├── TableCard (list)
        │   ├── OrderHistoryModal (overlay)
        │   └── ConfirmDialog
        └── MenuManagementPage   /menus
            ├── CategoryTabs
            ├── MenuList (drag & drop)
            └── MenuForm (overlay)
```

---

## 컴포넌트 상세 정의

### App.jsx
- **역할**: 라우팅, AuthContext Provider 래핑
- **라우트**:
  - `/login` → LoginPage
  - `/` → DashboardPage (인증 필요)
  - `/tables` → TableManagementPage (인증 필요)
  - `/menus` → MenuManagementPage (인증 필요)
- **인증 가드**: token 없으면 `/login`으로 리다이렉트

---

### AuthContext
- **역할**: 관리자 JWT 인증, 세션 유지
- **State**: `token: string | null`, `admin: { storeId, username } | null`, `isLoading: boolean`
- **Actions**:
  - `login(storeIdentifier, username, password)` - 로그인 + token localStorage 저장
  - `logout()` - token 삭제 + `/login` 이동
  - `checkAuth()` - 앱 시작 시 localStorage token 복원
- **localStorage key**: `admin_token`
- **16시간 만료**: JWT exp 검증, 만료 시 자동 logout

---

### LoginPage (`/login`)
- **State**: `form: { storeIdentifier, username, password }`, `error`, `isLoading`
- **UI**: 매장 식별자, 사용자명, 비밀번호 입력 폼 + 로그인 버튼
- **성공 시**: `/`로 이동
- **API**: `POST /auth/admin/login`

---

### DashboardPage (`/`)
- **역할**: 실시간 주문 모니터링 대시보드
- **State**: `tables: Table[]`, `orders: Order[]`, `selectedOrder: Order | null`
- **데이터 로드**: 마운트 시 `GET /orders` (전체 주문)
- **실시간**: `useSSE('/sse/admin', token)` → `new_order`, `order_status_updated` 이벤트
- **UI 요소**:
  - 상단 네비게이션 (대시보드, 테이블관리, 메뉴관리, 로그아웃)
  - TableCard 그리드 (테이블별 주문 현황)
  - OrderDetailModal (주문 클릭 시)
- **신규 주문 강조**: `new_order` 이벤트 수신 시 해당 테이블 카드 하이라이트 (3초)

---

### TableCard
- **Props**: `tableNumber`, `orders: Order[]`, `isNew: boolean`, `onOrderClick: (order) => void`
- **UI**:
  - 테이블 번호
  - 총 주문액
  - 최신 주문 2개 미리보기 (메뉴명, 상태)
  - `isNew` 시 강조 스타일 (빨간 테두리 + 애니메이션)
- **빈 테이블**: "주문 없음" 표시

---

### OrderDetailModal
- **Props**: `order: Order | null`, `onClose`, `onStatusChange`, `onDelete`
- **UI**:
  - 주문 번호, 시각, 테이블 번호
  - 메뉴 목록 (메뉴명, 수량, 단가, 소계)
  - 총 금액
  - 상태 변경 버튼 (pending→preparing→completed, 단방향)
  - 삭제 버튼 (확인 팝업 포함)
- **API**: `PUT /orders/{id}/status`, `DELETE /orders/{id}`

---

### TableManagementPage (`/tables`)
- **역할**: 테이블 세션 관리, 과거 내역 조회
- **State**: `tables: Table[]`, `selectedTable`, `showHistory: boolean`, `history: Order[]`
- **데이터 로드**: `GET /tables`
- **UI 요소**:
  - 테이블 목록 (테이블 번호, 현재 세션 주문 수, 총액)
  - 이용 완료 버튼 (확인 팝업 → `POST /tables/{id}/complete`)
  - 과거 내역 버튼 → OrderHistoryModal
- **API**: `GET /tables`, `POST /tables/{id}/complete`, `GET /tables/{id}/history`

---

### OrderHistoryModal
- **Props**: `tableId`, `onClose`
- **State**: `history: SessionHistory[]`, `dateFilter: { from, to }`
- **UI**:
  - 날짜 필터 (from/to date input)
  - 세션별 주문 목록 (시간 역순)
  - 각 세션: 이용 완료 시각, 주문 목록, 총액
- **API**: `GET /tables/{id}/history?from=&to=`

---

### MenuManagementPage (`/menus`)
- **역할**: 메뉴 CRUD, 순서 조정
- **State**: `categories: []`, `menus: []`, `activeCategory`, `editingMenu`, `showForm: boolean`
- **데이터 로드**: `GET /categories`, `GET /menus`
- **UI 요소**:
  - CategoryTabs
  - 메뉴 목록 (드래그 앤 드롭 순서 조정)
  - 메뉴 추가/수정 버튼 → MenuForm
  - 메뉴 삭제 버튼 (확인 팝업)
- **드래그 앤 드롭**: HTML5 Drag API 사용, 드롭 후 `PUT /menus/reorder` 호출

---

### MenuForm
- **Props**: `menu: Menu | null` (null이면 신규), `categories`, `onSave`, `onClose`
- **State**: `form: { name, price, description, categoryId, imageFile }`
- **UI**: 메뉴명, 가격, 설명, 카테고리 선택, 이미지 업로드
- **Validation**: 메뉴명/가격/카테고리 필수, 가격 > 0
- **이미지**: 파일 선택 → `POST /menus/upload-image` → image_path 저장
- **API**: `POST /menus` (신규) 또는 `PUT /menus/{id}` (수정)

---

### useSSE (hook)
- Customer Frontend와 동일 구조, admin SSE 엔드포인트 사용
- URL: `/sse/admin` (token을 query param으로 전달)

---

## API 연동 포인트

| 컴포넌트 | API 엔드포인트 | 메서드 |
|----------|---------------|--------|
| AuthContext | `/auth/admin/login` | POST |
| DashboardPage | `/orders` | GET |
| DashboardPage | `/sse/admin` | GET (SSE) |
| OrderDetailModal | `/orders/{id}/status` | PUT |
| OrderDetailModal | `/orders/{id}` | DELETE |
| TableManagementPage | `/tables` | GET |
| TableManagementPage | `/tables/{id}/complete` | POST |
| OrderHistoryModal | `/tables/{id}/history` | GET |
| MenuManagementPage | `/categories`, `/menus` | GET |
| MenuForm | `/menus`, `/menus/{id}` | POST/PUT |
| MenuForm | `/menus/upload-image` | POST |
| MenuManagementPage | `/menus/{id}` | DELETE |
| MenuManagementPage | `/menus/reorder` | PUT |
