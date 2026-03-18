# Tech Stack Decisions - Backend API (Unit 1)

---

## 확정 기술 스택

| 영역 | 기술 | 버전 | 선택 이유 |
|------|------|------|-----------|
| 언어 | Python | 3.11 | 사용자 선택 |
| 웹 프레임워크 | FastAPI | 0.111+ | 사용자 선택, async 지원, 자동 API 문서, Pydantic 통합 |
| ORM | SQLAlchemy | 2.0+ | Python 표준 ORM, async 지원 |
| DB 마이그레이션 | Alembic | 1.13+ | SQLAlchemy 공식 마이그레이션 도구 |
| 데이터베이스 | PostgreSQL | 16 | 사용자 선택, 안정성, JSON 지원 |
| DB 드라이버 | asyncpg | 0.29+ | async PostgreSQL 드라이버 |
| 인증 | python-jose | 3.3+ | JWT 생성/검증 |
| 비밀번호 | passlib[bcrypt] | 1.7+ | bcrypt 해싱 |
| 설정 관리 | pydantic-settings | 2.0+ | .env 파일 로드, 타입 안전 설정 |
| ASGI 서버 | uvicorn | 0.29+ | FastAPI 권장 서버 |
| 파일 업로드 | python-multipart | 0.0.9+ | FastAPI 파일 업로드 지원 |
| 정적 파일 | FastAPI StaticFiles | - | 이미지 파일 서빙 |

---

## 주요 설계 결정

### async vs sync
- SQLAlchemy async 세션 사용
- 모든 DB 작업 `async/await` 패턴
- SSE 스트리밍 async generator 사용

### SSE 구현 방식
- FastAPI `StreamingResponse` + async generator
- 인메모리 연결 풀 (dict 기반)
- 소규모 매장 기준으로 외부 메시지 브로커(Redis 등) 불필요

### 파일 저장
- 로컬 파일시스템 (`static/uploads/`)
- Docker volume으로 영속성 보장
- 파일명: UUID + 원본 확장자

### DB 연결 풀
- SQLAlchemy `create_async_engine` pool_size=5, max_overflow=10
- Docker Compose 환경 기준 적정 크기
