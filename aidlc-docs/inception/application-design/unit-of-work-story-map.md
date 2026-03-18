# Unit of Work Story Map - 테이블 오더 애플리케이션

---

## Unit 1: Backend API

| Story ID | 스토리 요약 | API Endpoint |
|----------|-------------|--------------|
| US-01 | 테이블 초기 설정 | PUT /tables/{id}/setup |
| US-02 | 자동 로그인 | POST /auth/table/login |
| US-03 | 카테고리별 메뉴 목록 조회 | GET /categories, GET /menus |
| US-04 | 메뉴 상세 정보 확인 | GET /menus (상세 포함) |
| US-05 | 장바구니에 메뉴 추가 | (Frontend only) |
| US-06 | 장바구니 메뉴 수량 조절 | (Frontend only) |
| US-07 | 장바구니 메뉴 삭제 | (Frontend only) |
| US-08 | 장바구니 전체 비우기 | (Frontend only) |
| US-09 | 장바구니 로컬 저장 | (Frontend only) |
| US-10 | 주문 내역 최종 확인 | (Frontend only) |
| US-11 | 주문 확정 | POST /orders |
| US-12 | 현재 세션 주문 내역 조회 | GET /orders/session/{id}, GET /sse/table/{id} |
| US-13 | 관리자 로그인 | POST /auth/admin/login |
| US-14 | 세션 유지 및 자동 로그아웃 | JWT 검증 미들웨어 |
| US-15 | 테이블별 주문 대시보드 조회 | GET /orders |
| US-16 | 신규 주문 실시간 수신 | GET /sse/admin |
| US-17 | 주문 상세 내역 확인 | GET /orders/{id} |
| US-18 | 주문 상태 변경 | PUT /orders/{id}/status |
| US-19 | 주문 삭제 | DELETE /orders/{id} |
| US-20 | 테이블 이용 완료 처리 | POST /tables/{id}/complete |
| US-21 | 과거 주문 내역 조회 | GET /tables/{id}/history |
| US-22 | 메뉴 등록 | POST /menus, POST /menus/upload-image |
| US-23 | 메뉴 수정 | PUT /menus/{id} |
| US-24 | 메뉴 삭제 | DELETE /menus/{id} |
| US-25 | 메뉴 노출 순서 조정 | PUT /menus/reorder |

---

## Unit 2: Customer Frontend

| Story ID | 스토리 요약 | 컴포넌트 |
|----------|-------------|----------|
| US-01 | 테이블 초기 설정 | SetupPage |
| US-02 | 자동 로그인 | AutoLoginProvider (AuthContext) |
| US-03 | 카테고리별 메뉴 목록 조회 | MenuPage |
| US-04 | 메뉴 상세 정보 확인 | MenuCard |
| US-05 | 장바구니에 메뉴 추가 | MenuCard → CartContext |
| US-06 | 장바구니 메뉴 수량 조절 | CartDrawer |
| US-07 | 장바구니 메뉴 삭제 | CartDrawer |
| US-08 | 장바구니 전체 비우기 | CartDrawer |
| US-09 | 장바구니 로컬 저장 | CartContext (localStorage) |
| US-10 | 주문 내역 최종 확인 | OrderConfirmPage |
| US-11 | 주문 확정 | OrderConfirmPage |
| US-12 | 현재 세션 주문 내역 조회 | OrderHistoryPage + useSSE |

---

## Unit 3: Admin Frontend

| Story ID | 스토리 요약 | 컴포넌트 |
|----------|-------------|----------|
| US-13 | 관리자 로그인 | LoginPage |
| US-14 | 세션 유지 및 자동 로그아웃 | AuthContext |
| US-15 | 테이블별 주문 대시보드 조회 | DashboardPage + TableCard |
| US-16 | 신규 주문 실시간 수신 | DashboardPage + useSSE |
| US-17 | 주문 상세 내역 확인 | OrderDetailModal |
| US-18 | 주문 상태 변경 | OrderDetailModal |
| US-19 | 주문 삭제 | OrderDetailModal |
| US-20 | 테이블 이용 완료 처리 | TableManagementPage |
| US-21 | 과거 주문 내역 조회 | TableManagementPage + OrderHistoryModal |
| US-22 | 메뉴 등록 | MenuManagementPage + MenuForm |
| US-23 | 메뉴 수정 | MenuManagementPage + MenuForm |
| US-24 | 메뉴 삭제 | MenuManagementPage |
| US-25 | 메뉴 노출 순서 조정 | MenuManagementPage (drag & drop) |

---

## 커버리지 요약

| 유닛 | 담당 Story 수 | 비고 |
|------|--------------|------|
| Unit 1 (Backend API) | 25개 전체 | API/서비스 레이어 |
| Unit 2 (Customer Frontend) | 12개 | US-01 ~ US-12 |
| Unit 3 (Admin Frontend) | 13개 | US-13 ~ US-25 |

모든 25개 User Story가 유닛에 매핑됨.
