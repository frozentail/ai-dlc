# Business Logic Model - Admin Frontend (Unit 3)

## 핵심 비즈니스 플로우

### 1. 관리자 인증 플로우

```
앱 로드
  └─ localStorage에 admin_token 있음?
       ├─ YES → JWT exp 검증
       │          ├─ 유효 → DashboardPage 표시
       │          └─ 만료 → token 삭제 → LoginPage 이동
       └─ NO  → LoginPage 이동

로그인
  └─ POST /auth/admin/login
       ├─ 성공 → token localStorage 저장 → DashboardPage 이동
       └─ 실패 → 에러 메시지 표시
```

### 2. 실시간 주문 모니터링 플로우

```
DashboardPage 마운트
  ├─ GET /orders → 초기 주문 목록 로드
  └─ useSSE('/sse/admin', token) → SSE 연결

SSE 이벤트 처리
  ├─ 'new_order' → orders에 추가 + 해당 테이블 isNew = true (3초 후 false)
  └─ 'order_status_updated' → 해당 order status 업데이트

테이블별 주문 그룹핑
  └─ orders를 table_id 기준으로 groupBy
       └─ 각 TableCard에 해당 테이블 orders 전달
```

### 3. 주문 상태 변경 플로우

```
OrderDetailModal에서 상태 변경 버튼 클릭
  └─ PUT /orders/{id}/status { status: nextStatus }
       ├─ 성공 → 로컬 orders 상태 업데이트
       └─ 실패 → 에러 메시지

상태 전이 (단방향)
  pending → preparing → completed
  (completed에서는 변경 버튼 비활성화)
```

### 4. 주문 삭제 플로우

```
삭제 버튼 클릭
  └─ ConfirmDialog 표시
       ├─ 취소 → 닫기
       └─ 확인 → DELETE /orders/{id}
                  ├─ 성공 → orders에서 제거 → Modal 닫기
                  └─ 실패 → 에러 메시지
```

### 5. 테이블 이용 완료 플로우

```
이용 완료 버튼 클릭
  └─ ConfirmDialog 표시
       └─ 확인 → POST /tables/{id}/complete
                  ├─ 성공 → 해당 테이블 orders 초기화 → 새 세션 반영
                  └─ 실패 → 에러 메시지
```

### 6. 메뉴 관리 플로우

```
메뉴 등록/수정
  └─ MenuForm 열기
       ├─ 이미지 선택 시 → POST /menus/upload-image → image_path 저장
       └─ 저장 버튼
            ├─ 신규 → POST /menus
            └─ 수정 → PUT /menus/{id}
                 └─ 성공 → menus 목록 갱신

드래그 앤 드롭 순서 변경
  └─ HTML5 Drag API
       ├─ dragstart → draggingId 저장
       ├─ dragover → 위치 계산
       └─ drop → 배열 재정렬 → PUT /menus/reorder { menu_ids: [...] }
```

---

## 상태 관리 모델

### 전역 상태 (Context)
| Context | 상태 |
|---------|------|
| AuthContext | token, admin, isLoading |

### 로컬 상태 (useState)
| 컴포넌트 | 상태 |
|----------|------|
| DashboardPage | orders, newTableIds (Set), selectedOrder |
| TableManagementPage | tables, selectedTableId, showHistory |
| OrderHistoryModal | history, dateFilter, isLoading |
| MenuManagementPage | categories, menus, activeCategory, editingMenu, showForm |
| MenuForm | form, imagePreview, isLoading, error |

---

## 데이터 변환 로직

### 테이블별 주문 그룹핑
```js
const ordersByTable = orders.reduce((acc, order) => {
  const key = order.table_id
  if (!acc[key]) acc[key] = []
  acc[key].push(order)
  return acc
}, {})
```

### 다음 주문 상태 계산
```js
const NEXT_STATUS = { pending: 'preparing', preparing: 'completed' }
const nextStatus = NEXT_STATUS[order.status] // completed면 undefined
```

### JWT 만료 검증
```js
const isExpired = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.exp * 1000 < Date.now()
}
```
