# Business Logic Model - Backend API (Unit 1)

---

## 핵심 비즈니스 플로우

### 1. 테이블 자동 로그인 플로우

```
입력: store_identifier, table_number, password
  |
  v
Store 조회 (identifier 기준)
  |-- 없으면 → 401
  v
Table 조회 (store_id + table_number)
  |-- 없으면 → 401
  v
bcrypt 비밀번호 검증
  |-- 실패 → 401
  v
활성 TableSession 조회 (ended_at = null)
  |-- 없으면 → 새 TableSession 생성
  v
JWT 발급 (payload: table_id, session_id, store_id)
  |
  v
반환: {access_token, session_id, table_number}
```

---

### 2. 주문 생성 플로우

```
입력: [OrderItem 목록] (menu_id, quantity)
인증: 테이블 JWT (table_id, session_id 추출)
  |
  v
각 menu_id 유효성 검증 (해당 store의 메뉴인지)
  |-- 유효하지 않은 menu_id → 400
  v
OrderItem 스냅샷 생성 (menu_name, unit_price 복사)
  |
  v
total_amount 계산 = sum(unit_price * quantity)
  |
  v
Order 생성 (status=PENDING)
  |
  v
OrderItem 일괄 생성
  |
  v
TableSession.total_amount 업데이트
  |
  v
SSE 이벤트 발행 → 관리자 채널 (new_order)
  |
  v
반환: Order 상세 정보
```

---

### 3. 이용 완료 처리 플로우

```
입력: table_id
인증: 관리자 JWT
  |
  v
Table 조회 및 권한 확인 (같은 store인지)
  |-- 권한 없음 → 403
  v
활성 TableSession 조회 (ended_at = null)
  |-- 없으면 → 404 (활성 세션 없음)
  v
TableSession.ended_at = now
TableSession.total_amount = 0
  |
  v
SSE 이벤트 발행 → 관리자 채널 (session_completed)
  |
  v
반환: {success: true}
```

---

### 4. 메뉴 순서 변경 플로우

```
입력: [{id, sort_order}, ...]
인증: 관리자 JWT
  |
  v
각 menu_id가 해당 store의 메뉴인지 검증
  |-- 권한 없음 → 403
  v
일괄 UPDATE (sort_order)
  |
  v
반환: {success: true}
```

---

## 인증 미들웨어 로직

```
요청 헤더에서 Authorization: Bearer {token} 추출
  |-- 없으면 → 401
  v
JWT 서명 검증 + 만료 확인
  |-- 실패 → 401
  v
payload에서 역할 확인 (admin / table)
  |
  v
엔드포인트 권한 확인
  - 관리자 전용 엔드포인트: admin 역할만 허용
  - 테이블 전용 엔드포인트: table 역할만 허용
  - 공개 엔드포인트: 인증 불필요 (메뉴 조회 등)
```

---

## SSE 연결 관리

```
관리자 SSE 연결 (/sse/admin):
  - 관리자 JWT 검증
  - store_id 기준으로 연결 풀에 등록
  - 연결 해제 시 풀에서 제거

고객 SSE 연결 (/sse/table/{session_id}):
  - 테이블 JWT 검증
  - session_id 기준으로 연결 풀에 등록
  - 연결 해제 시 풀에서 제거

이벤트 발행:
  - 관리자 채널: store_id에 해당하는 모든 관리자 연결에 broadcast
  - 고객 채널: session_id에 해당하는 연결에 전송
```
