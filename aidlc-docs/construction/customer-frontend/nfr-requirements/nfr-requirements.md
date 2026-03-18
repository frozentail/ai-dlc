# NFR Requirements - Customer Frontend (Unit 2)

## NFR-01. 성능

| ID | 요구사항 | 목표값 |
|----|---------|--------|
| NFR-01-1 | 메뉴 화면 초기 로드 | 2초 이내 (LCP 기준) |
| NFR-01-2 | 카테고리 탭 전환 응답 | 즉시 (클라이언트 필터링) |
| NFR-01-3 | 장바구니 조작 응답 | 즉시 (로컬 상태 업데이트) |
| NFR-01-4 | 주문 확정 API 응답 | 3초 이내 |
| NFR-01-5 | SSE 주문 상태 업데이트 반영 | 2초 이내 (서버 이벤트 발생 후) |

## NFR-02. 사용성 (Usability)

| ID | 요구사항 |
|----|---------|
| NFR-02-1 | 모든 터치 타겟 최소 44x44px |
| NFR-02-2 | 모바일 태블릿 화면 최적화 (세로 모드 기준) |
| NFR-02-3 | 카드 형태 메뉴 레이아웃 (터치 친화적) |
| NFR-02-4 | 로딩 상태 시각적 피드백 (spinner 또는 skeleton) |
| NFR-02-5 | 에러 상태 명확한 메시지 표시 |
| NFR-02-6 | 주문 성공 후 명확한 확인 피드백 (주문 번호 표시) |

## NFR-03. 안정성 (Reliability)

| ID | 요구사항 |
|----|---------|
| NFR-03-1 | 장바구니 localStorage 유지 (새로고침 후에도 복원) |
| NFR-03-2 | SSE 연결 끊김 시 브라우저 자동 재연결 |
| NFR-03-3 | API 실패 시 사용자 데이터 손실 없음 |
| NFR-03-4 | 자동 로그인 실패 시 graceful degradation (SetupPage 이동) |

## NFR-04. 보안

| ID | 요구사항 |
|----|---------|
| NFR-04-1 | JWT 토큰 메모리 또는 localStorage 저장 (httpOnly 쿠키 불가 - SPA 구조) |
| NFR-04-2 | API 요청 시 Authorization Bearer 헤더 포함 |
| NFR-04-3 | 인증 필요 페이지 접근 시 토큰 검증 후 리다이렉트 |
| NFR-04-4 | 비밀번호 입력 필드 type="password" 처리 |

## NFR-05. 유지보수성

| ID | 요구사항 |
|----|---------|
| NFR-05-1 | API 호출 로직 `src/api/client.js`에 집중 |
| NFR-05-2 | 전역 상태 Context로 분리 (AuthContext, CartContext) |
| NFR-05-3 | 재사용 가능한 컴포넌트 분리 (MenuCard, CartItem, OrderStatusBadge) |
| NFR-05-4 | 커스텀 훅으로 로직 분리 (useSSE, useCart) |
