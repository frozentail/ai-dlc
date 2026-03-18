# Unit of Work Dependencies - 테이블 오더 애플리케이션

---

## 의존성 매트릭스

| 유닛 | 의존 대상 | 의존 유형 | 설명 |
|------|-----------|-----------|------|
| Unit 2 (Customer Frontend) | Unit 1 (Backend API) | Runtime HTTP/SSE | REST API 호출, SSE 연결 |
| Unit 3 (Admin Frontend) | Unit 1 (Backend API) | Runtime HTTP/SSE | REST API 호출, SSE 연결 |
| Unit 1 (Backend API) | PostgreSQL | Runtime | DB 읽기/쓰기 |
| Unit 1 (Backend API) | Static Files | Runtime | 이미지 파일 서빙 |

---

## 개발 순서 (권장)

```
1단계: Unit 1 (Backend API)
   - DB 스키마 및 마이그레이션
   - 모든 API endpoint 구현
   - SSE 서비스 구현
   - 선행 필수: PostgreSQL 컨테이너

2단계: Unit 2 + Unit 3 (병렬 개발 가능)
   - Backend API가 완성되면 동시 개발 가능
   - Unit 2: 고객 Frontend
   - Unit 3: 관리자 Frontend
```

---

## 통합 포인트

| 통합 포인트 | Unit 1 (Backend) | Unit 2 (Customer) | Unit 3 (Admin) |
|-------------|------------------|-------------------|----------------|
| 메뉴 조회 API | GET /menus, /categories | 사용 | - |
| 주문 생성 API | POST /orders | 사용 | - |
| 주문 조회 API | GET /orders/session/{id} | 사용 | 사용 |
| 주문 상태 변경 API | PUT /orders/{id}/status | - | 사용 |
| 주문 삭제 API | DELETE /orders/{id} | - | 사용 |
| 테이블 인증 API | POST /auth/table/login | 사용 | - |
| 관리자 인증 API | POST /auth/admin/login | - | 사용 |
| 테이블 관리 API | GET/POST/PUT /tables | - | 사용 |
| 이용 완료 API | POST /tables/{id}/complete | - | 사용 |
| 과거 내역 API | GET /tables/{id}/history | - | 사용 |
| 메뉴 관리 API | POST/PUT/DELETE /menus | - | 사용 |
| 이미지 업로드 API | POST /menus/upload-image | - | 사용 |
| 관리자 SSE | GET /sse/admin | - | 사용 |
| 고객 SSE | GET /sse/table/{session_id} | 사용 | - |

---

## 환경 변수 공유

| 변수 | Unit 1 | Unit 2 | Unit 3 |
|------|--------|--------|--------|
| DATABASE_URL | 필요 | - | - |
| JWT_SECRET | 필요 | - | - |
| VITE_API_URL | - | 필요 (백엔드 URL) | 필요 (백엔드 URL) |
