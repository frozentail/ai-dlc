# Business Rules - Backend API (Unit 1)

---

## BR-01. 인증 규칙

### 관리자 로그인
- 매장 식별자 + 사용자명 + 비밀번호 모두 필수
- 비밀번호는 bcrypt로 해싱하여 비교
- 로그인 성공 시 JWT 발급 (만료: 16시간)
- 로그인 실패 시 `login_attempts` +1
- `login_attempts >= 5` 이면 `locked_until = now + 15분` 설정
- `locked_until > now` 이면 로그인 차단 (429 응답)
- 로그인 성공 시 `login_attempts = 0`, `locked_until = null` 리셋

### 테이블 자동 로그인
- 매장 식별자 + 테이블 번호 + 비밀번호 모두 필수
- 비밀번호 bcrypt 비교
- 성공 시 JWT 발급 + 현재 활성 세션 ID 반환
- 활성 세션 없으면 새 TableSession 생성 후 반환

### 초기 관리자 계정 생성
- 해당 매장 식별자에 Admin이 이미 존재하면 409 에러
- 비밀번호는 bcrypt 해싱 후 저장

---

## BR-02. 메뉴 관리 규칙

- 메뉴명: 필수, 1~100자
- 가격: 필수, 0 이상 정수
- 카테고리: 필수, 해당 매장의 카테고리여야 함
- 설명: 선택, 최대 500자
- 이미지: 선택, 파일 업로드 시 `static/uploads/{uuid}.{ext}` 저장
- 허용 이미지 확장자: jpg, jpeg, png, webp
- 최대 파일 크기: 5MB
- sort_order: 등록 시 해당 카테고리 내 마지막 순서로 자동 배정
- 메뉴 삭제 시 해당 메뉴의 OrderItem은 유지 (스냅샷 보존)

---

## BR-03. 주문 생성 규칙

- 주문 항목 최소 1개 이상
- 각 OrderItem의 menu_id는 해당 매장의 메뉴여야 함
- 주문 시점의 menu_name, unit_price를 OrderItem에 스냅샷 저장
- total_amount = sum(unit_price * quantity)
- 주문 생성 시 활성 TableSession이 없으면 새 세션 자동 생성
- 주문 생성 성공 시 SSE 이벤트 발행 (관리자 채널)
- 초기 주문 상태: PENDING

---

## BR-04. 주문 상태 전환 규칙

```
PENDING → PREPARING → COMPLETED
```
- 역방향 전환 불가 (COMPLETED → PREPARING 불가)
- 상태 변경 시 SSE 이벤트 발행 (고객 채널 - 해당 세션)
- 상태 변경 시 SSE 이벤트 발행 (관리자 채널)

---

## BR-05. 주문 삭제 규칙 (관리자 직권)

- 관리자만 삭제 가능
- 삭제 시 해당 Order와 OrderItem 모두 삭제
- 삭제 후 TableSession.total_amount 재계산
  - `total_amount = sum(order.total_amount) for active orders in session`
- SSE 이벤트 발행 (관리자 채널)

---

## BR-06. 테이블 세션 라이프사이클

### 세션 시작
- 테이블에 활성 세션(ended_at = null)이 없을 때 첫 주문 시 자동 생성
- `started_at = now`, `ended_at = null`, `total_amount = 0`

### 세션 종료 (이용 완료)
- 관리자만 실행 가능
- `ended_at = now` 설정
- 해당 세션의 모든 주문은 과거 이력으로 분류됨 (별도 이동 없음, ended_at으로 구분)
- `total_amount = 0` 리셋
- 이후 고객 주문 시 새 세션 자동 생성

### 현재 세션 주문 조회 (고객)
- `session_id = 현재 활성 세션 ID` 조건으로 필터링
- 활성 세션: `ended_at = null`

---

## BR-07. 과거 주문 내역 조회

- `TableSession.ended_at IS NOT NULL` 인 세션의 주문만 조회
- 날짜 필터: `TableSession.ended_at` 기준
- 시간 역순 정렬 (최신 세션 먼저)

---

## BR-08. SSE 이벤트 타입

| 이벤트 | 채널 | 페이로드 |
|--------|------|----------|
| `new_order` | 관리자 | {order_id, table_id, table_number, total_amount, items} |
| `order_status_changed` | 관리자 + 고객(세션) | {order_id, status} |
| `order_deleted` | 관리자 | {order_id, table_id} |
| `session_completed` | 관리자 | {table_id, session_id} |
