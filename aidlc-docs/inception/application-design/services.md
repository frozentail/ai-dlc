# Services - 테이블 오더 애플리케이션

---

## Backend Services (FastAPI)

### SV-01. AuthService
- **목적**: 인증 비즈니스 로직 처리
- **책임**:
  - 관리자 자격증명 검증 (bcrypt 비교)
  - JWT 토큰 생성 및 검증 (16시간 만료)
  - 테이블 비밀번호 검증
  - 로그인 시도 횟수 추적 및 차단
  - 초기 관리자 계정 생성
- **의존성**: AdminRepository, TableRepository

### SV-02. MenuService
- **목적**: 메뉴 및 카테고리 비즈니스 로직
- **책임**:
  - 메뉴 CRUD 처리
  - 카테고리별 메뉴 정렬 (sort_order 기준)
  - 이미지 파일 저장 경로 관리
  - 메뉴 순서 일괄 업데이트
  - 입력값 유효성 검증 (가격 범위 등)
- **의존성**: MenuRepository, CategoryRepository

### SV-03. OrderService
- **목적**: 주문 생성 및 상태 관리 비즈니스 로직
- **책임**:
  - 주문 생성 (OrderItem 포함)
  - 주문 상태 전환 (대기중 → 준비중 → 완료)
  - 주문 삭제 및 테이블 총액 재계산
  - 현재 세션 주문 필터링
  - SSE 이벤트 발행 (신규 주문, 상태 변경)
- **의존성**: OrderRepository, TableSessionRepository, SSEService

### SV-04. TableService
- **목적**: 테이블 세션 라이프사이클 관리
- **책임**:
  - 테이블 초기 설정 (번호, 비밀번호 저장)
  - 세션 시작 (첫 주문 시 자동 생성)
  - 세션 종료 (이용 완료 처리)
  - 주문 내역 과거 이력 이동
  - 테이블 현재 상태 리셋
  - 과거 주문 내역 날짜 필터 조회
- **의존성**: TableRepository, TableSessionRepository, OrderRepository

### SV-05. SSEService
- **목적**: Server-Sent Events 연결 및 이벤트 브로드캐스트
- **책임**:
  - 관리자 SSE 연결 풀 관리
  - 고객 SSE 연결 풀 관리 (세션별)
  - 신규 주문 이벤트 브로드캐스트 (관리자)
  - 주문 상태 변경 이벤트 브로드캐스트 (고객)
  - 연결 해제 처리

---

## Frontend Services (React JS - 공통)

### FS-01. ApiClient
- **목적**: Backend API 통신 공통 클라이언트
- **책임**:
  - HTTP 요청 (axios 또는 fetch 기반)
  - JWT 토큰 자동 첨부 (Authorization header)
  - 401 응답 시 로그인 화면 리다이렉트
  - 에러 응답 공통 처리

### FS-02. AuthStore (Context/State)
- **목적**: 인증 상태 전역 관리
- **책임**:
  - JWT 토큰 저장 (localStorage)
  - 로그인/로그아웃 상태 관리
  - 토큰 만료 감지 및 자동 로그아웃

### FS-03. CartStore (Context/State) - Customer Only
- **목적**: 장바구니 상태 전역 관리
- **책임**:
  - 장바구니 아이템 상태 관리
  - localStorage 동기화
  - 총 금액 계산

### FS-04. SSEClient
- **목적**: SSE 연결 관리 공통 유틸리티
- **책임**:
  - EventSource 연결 생성
  - 자동 재연결 (브라우저 기본 SSE 재연결)
  - 이벤트 타입별 핸들러 등록
  - 컴포넌트 언마운트 시 연결 해제
