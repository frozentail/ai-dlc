# Unit Test Instructions

> 현재 Standard 방식으로 코드 생성되어 테스트 코드는 포함되지 않았습니다.
> 아래는 각 유닛별 수동 검증 체크리스트입니다.

---

## Unit 1: Backend API 수동 검증

서비스 실행 후 Swagger UI (`http://localhost:8000/docs`) 또는 curl로 검증.

### 인증
```bash
# 관리자 로그인
curl -X POST http://localhost:8000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"store_identifier":"my-restaurant","username":"admin","password":"admin1234"}'
# → access_token 반환 확인

# 테이블 로그인
curl -X POST http://localhost:8000/auth/table/login \
  -H "Content-Type: application/json" \
  -d '{"store_identifier":"my-restaurant","table_number":1,"password":"table1234"}'
# → access_token, table_id, session_id 반환 확인
```

### 메뉴 조회 (공개)
```bash
curl "http://localhost:8000/public/menus?store_id={store_id}"
curl "http://localhost:8000/public/categories?store_id={store_id}"
```

### 주문 생성
```bash
curl -X POST http://localhost:8000/orders \
  -H "Authorization: Bearer {table_token}" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menu_id":"{id}","menu_name":"테스트메뉴","quantity":2,"unit_price":10000}]}'
```

### 주문 상태 변경
```bash
curl -X PUT http://localhost:8000/orders/{order_id}/status \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'
```

---

## Unit 2: Customer Frontend 수동 검증

브라우저에서 `http://localhost:3000` 접속 후 체크리스트:

- [ ] SetupPage: 매장 식별자/테이블 번호/비밀번호 입력 후 저장 → MenuPage 이동
- [ ] MenuPage: 카테고리 탭 표시, 메뉴 카드 표시
- [ ] MenuCard: "담기" 버튼 클릭 → 장바구니 버튼에 수량/금액 표시
- [ ] CartDrawer: 수량 +/- 조절, 삭제, 비우기 동작
- [ ] OrderConfirmPage: 주문 목록 표시, 주문 확정 → 성공 메시지 → 5초 후 MenuPage 이동
- [ ] OrderHistoryPage: 주문 내역 표시, 상태 실시간 업데이트 (관리자에서 상태 변경 시)
- [ ] 새로고침 후 장바구니 유지 확인

---

## Unit 3: Admin Frontend 수동 검증

브라우저에서 `http://localhost:3001` 접속 후 체크리스트:

- [ ] LoginPage: 관리자 로그인 → DashboardPage 이동
- [ ] DashboardPage: 테이블 카드 그리드 표시
- [ ] 고객이 주문 시 → 2초 이내 대시보드에 NEW 배지 + 하이라이트 표시
- [ ] OrderDetailModal: 주문 클릭 → 상세 표시, 상태 변경 (대기중→준비중→완료)
- [ ] OrderDetailModal: 주문 삭제 → 확인 팝업 → 삭제
- [ ] TableManagementPage: 이용 완료 처리 → 주문 초기화
- [ ] TableManagementPage: 과거 내역 조회, 날짜 필터
- [ ] MenuManagementPage: 메뉴 추가/수정/삭제
- [ ] MenuManagementPage: 드래그 앤 드롭 순서 변경
- [ ] 브라우저 새로고침 후 로그인 유지 확인
