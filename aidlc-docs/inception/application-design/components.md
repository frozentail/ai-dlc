# Application Components - 테이블 오더 애플리케이션

---

## 시스템 구성 개요

```
+------------------+     +------------------+     +-------------------+
|  Customer UI     |     |  Admin UI        |     |  Backend API      |
|  (React JS)      |     |  (React JS)      |     |  (FastAPI)        |
|                  |     |                  |     |                   |
| - MenuPage       |     | - LoginPage      |     | - AuthRouter      |
| - CartPage       |     | - DashboardPage  |     | - MenuRouter      |
| - OrderPage      |     | - TableMgmtPage  |     | - OrderRouter     |
| - OrderHistory   |     | - MenuMgmtPage   |     | - TableRouter     |
+------------------+     +------------------+     | - SSERouter       |
         |                        |               +-------------------+
         +------------------------+                        |
                                  |               +-------------------+
                                  +-------------> |  PostgreSQL DB    |
                                                  +-------------------+
```

---

## Backend Components (FastAPI)

### BC-01. AuthRouter
- **목적**: 관리자 인증 및 테이블 인증 처리
- **책임**:
  - 관리자 로그인 (JWT 발급)
  - 테이블 자동 로그인 검증
  - JWT 토큰 갱신 및 검증
  - 로그인 시도 횟수 제한 (Rate Limiting)

### BC-02. MenuRouter
- **목적**: 메뉴 및 카테고리 CRUD API 제공
- **책임**:
  - 카테고리 목록 조회
  - 메뉴 목록 조회 (카테고리별)
  - 메뉴 등록/수정/삭제 (관리자 전용)
  - 메뉴 이미지 파일 업로드
  - 메뉴 노출 순서 변경

### BC-03. OrderRouter
- **목적**: 주문 생성 및 조회 API 제공
- **책임**:
  - 주문 생성 (고객)
  - 현재 세션 주문 내역 조회 (고객)
  - 전체 주문 목록 조회 (관리자)
  - 주문 상태 변경 (관리자)
  - 주문 삭제 (관리자)

### BC-04. TableRouter
- **목적**: 테이블 및 세션 관리 API 제공
- **책임**:
  - 테이블 목록 조회
  - 테이블 초기 설정 (번호, 비밀번호)
  - 테이블 세션 시작/종료
  - 과거 주문 내역 조회

### BC-05. SSERouter
- **목적**: Server-Sent Events 실시간 통신
- **책임**:
  - 관리자용 SSE 스트림 (신규 주문, 상태 변경)
  - 고객용 SSE 스트림 (주문 상태 업데이트)
  - SSE 연결 관리

### BC-06. Database Models
- **목적**: PostgreSQL ORM 모델 정의 (SQLAlchemy)
- **책임**:
  - Store, Admin, Table, TableSession 모델
  - Category, Menu 모델
  - Order, OrderItem 모델
  - 마이그레이션 관리 (Alembic)

### BC-07. AuthMiddleware
- **목적**: JWT 인증 미들웨어
- **책임**:
  - 요청별 JWT 토큰 검증
  - 관리자 권한 확인
  - 테이블 세션 권한 확인

---

## Customer Frontend Components (React JS)

### CF-01. AutoLoginProvider
- **목적**: 자동 로그인 및 세션 관리
- **책임**:
  - 로컬 스토리지에서 저장된 인증 정보 로드
  - 자동 로그인 API 호출
  - 초기 설정 화면 표시 (미설정 시)

### CF-02. MenuPage
- **목적**: 메뉴 조회 및 탐색 화면
- **책임**:
  - 카테고리 탭 표시 및 전환
  - 메뉴 카드 그리드 표시
  - 장바구니 추가 버튼 처리

### CF-03. CartDrawer
- **목적**: 장바구니 사이드 패널
- **책임**:
  - 장바구니 메뉴 목록 표시
  - 수량 증가/감소/삭제
  - 총 금액 실시간 계산
  - 로컬 스토리지 동기화
  - 주문하기 버튼

### CF-04. OrderConfirmPage
- **목적**: 주문 최종 확인 및 확정 화면
- **책임**:
  - 주문 내역 표시
  - 주문 확정 API 호출
  - 성공 시 주문 번호 표시 (5초) 후 리다이렉트
  - 실패 시 에러 메시지 표시

### CF-05. OrderHistoryPage
- **목적**: 현재 세션 주문 내역 조회 화면
- **책임**:
  - 현재 세션 주문 목록 표시
  - SSE 연결로 주문 상태 실시간 업데이트
  - 페이지네이션

---

## Admin Frontend Components (React JS)

### AF-01. LoginPage
- **목적**: 관리자 로그인 화면
- **책임**:
  - 매장 식별자, 사용자명, 비밀번호 입력
  - JWT 토큰 저장
  - 로그인 실패 에러 표시

### AF-02. DashboardPage
- **목적**: 실시간 주문 모니터링 대시보드
- **책임**:
  - 테이블별 주문 카드 그리드 표시
  - SSE 연결로 신규 주문 실시간 수신
  - 신규 주문 시각적 강조
  - 테이블별 필터링

### AF-03. OrderDetailModal
- **목적**: 주문 상세 정보 모달
- **책임**:
  - 전체 메뉴 목록 표시
  - 주문 상태 변경 버튼
  - 주문 삭제 버튼 (확인 팝업 포함)

### AF-04. TableManagementPage
- **목적**: 테이블 관리 화면
- **책임**:
  - 테이블 초기 설정 (번호, 비밀번호)
  - 이용 완료 처리 버튼 (확인 팝업 포함)
  - 과거 주문 내역 조회 (날짜 필터)

### AF-05. MenuManagementPage
- **목적**: 메뉴 관리 화면
- **책임**:
  - 카테고리별 메뉴 목록 표시
  - 메뉴 등록/수정/삭제 폼
  - 이미지 파일 업로드
  - 드래그 앤 드롭 순서 조정
