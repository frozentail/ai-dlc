# NFR Requirements - Backend API (Unit 1)

---

## NFR-01. 성능

| 항목 | 요구사항 |
|------|----------|
| 실시간 주문 수신 | SSE 이벤트 발행 후 2초 이내 클라이언트 수신 |
| 메뉴 조회 응답 | 1초 이내 |
| 주문 생성 응답 | 2초 이내 |
| 동시 SSE 연결 | 소규모 매장 기준 최대 20개 동시 연결 (테이블 10개 + 관리자) |

---

## NFR-02. 보안

| 항목 | 요구사항 |
|------|----------|
| 비밀번호 해싱 | bcrypt (cost factor 12) |
| 인증 방식 | JWT (HS256, 16시간 만료) |
| 로그인 시도 제한 | 5회 실패 시 15분 잠금 |
| JWT Secret | 환경 변수로 관리 (코드에 하드코딩 금지) |
| DB 접속 정보 | 환경 변수로 관리 |
| CORS | 허용 origin 환경 변수로 설정 |
| 파일 업로드 | 허용 확장자 whitelist (jpg, jpeg, png, webp), 최대 5MB |
| SQL Injection | SQLAlchemy ORM 사용으로 방지 |

---

## NFR-03. 안정성

| 항목 | 요구사항 |
|------|----------|
| SSE 재연결 | 브라우저 기본 재연결 지원 (EventSource 스펙) |
| DB 연결 풀 | SQLAlchemy connection pool 사용 |
| 에러 응답 | 표준 HTTP 상태 코드 + JSON 에러 메시지 |
| 입력값 검증 | Pydantic 스키마로 모든 입력값 검증 |

---

## NFR-04. 유지보수성

| 항목 | 요구사항 |
|------|----------|
| DB 마이그레이션 | Alembic으로 버전 관리 |
| 환경 설정 | .env 파일 + pydantic-settings |
| 로깅 | uvicorn 기본 로깅 (요청/응답) |
| API 문서 | FastAPI 자동 생성 (Swagger UI /docs) |

---

## NFR-05. 배포

| 항목 | 요구사항 |
|------|----------|
| 컨테이너화 | Dockerfile (Python 3.11-slim 기반) |
| 오케스트레이션 | Docker Compose |
| 포트 | 8000 |
| 정적 파일 | /static/uploads/ 경로로 서빙 |
