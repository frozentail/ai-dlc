# Code Generation Plan - Customer Frontend (Unit 2)

## 방식: Standard
## 위치: workspace root / customer-frontend/

---

## 단계별 체크리스트

### Step 1: 프로젝트 구조 설정
- [x] 1.1 package.json 생성 (React 18, React Router v6, Vite)
- [x] 1.2 vite.config.js 생성
- [x] 1.3 index.html 생성
- [x] 1.4 Dockerfile 생성 (multi-stage: node → nginx)
- [x] 1.5 nginx.conf 생성 (SPA 라우팅, /api 프록시, SSE 프록시)
- [x] 1.6 .env.example 생성

### Step 2: API 클라이언트
- [x] 2.1 src/api/client.js (fetch wrapper, Authorization 헤더, 에러 처리)

### Step 3: Context (전역 상태)
- [x] 3.1 src/context/AuthContext.jsx (자동 로그인, localStorage 자격증명)
- [x] 3.2 src/context/CartContext.jsx (장바구니, localStorage 동기화)

### Step 4: 커스텀 훅
- [x] 4.1 src/hooks/useSSE.js (EventSource 관리, cleanup)
- [x] 4.2 src/hooks/useCart.js → CartContext에 통합 (별도 파일 불필요)

### Step 5: 공통 컴포넌트
- [x] 5.1 src/components/MenuCard.jsx (메뉴 카드, 담기 버튼)
- [x] 5.2 src/components/CartDrawer.jsx (장바구니 드로어, CartItem 포함)
- [x] 5.3 src/components/OrderStatusBadge.jsx (상태별 색상 배지)

### Step 6: 페이지 컴포넌트
- [x] 6.1 src/pages/SetupPage.jsx (초기 설정, 자격증명 저장)
- [x] 6.2 src/pages/MenuPage.jsx (카테고리 탭, 메뉴 그리드, 장바구니 버튼)
- [x] 6.3 src/pages/OrderConfirmPage.jsx (주문 확인, 확정, 5초 리다이렉트)
- [x] 6.4 src/pages/OrderHistoryPage.jsx (주문 내역, SSE 실시간 업데이트)

### Step 7: 앱 진입점
- [x] 7.1 src/App.jsx (라우팅, PrivateRoute, Context Provider 래핑)
- [x] 7.2 src/main.jsx (React DOM 렌더링)

### Step 8: 스타일
- [x] 8.1 src/index.css (기본 reset, 전역 스타일)

---

## 스토리 커버리지

| Step | 구현 Story |
|------|-----------|
| 3.1 | US-01, US-02 |
| 3.2, 5.2 | US-05, US-06, US-07, US-08, US-09 |
| 6.2, 5.1 | US-03, US-04 |
| 6.3 | US-10, US-11 |
| 6.4, 4.1 | US-12 |

---

## 코드 위치
- **Application Code**: `customer-frontend/` (workspace root)
- **Documentation**: `aidlc-docs/construction/customer-frontend/`
