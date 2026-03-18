# NFR Design Patterns - Backend API (Unit 1)

---

## 보안 패턴

### JWT 인증 패턴
- FastAPI `Depends()` 를 활용한 의존성 주입 방식
- `get_current_admin()`, `get_current_table()` 의존성 함수 정의
- 관리자 전용 엔드포인트: `Depends(get_current_admin)`
- 테이블 전용 엔드포인트: `Depends(get_current_table)`

```python
# 패턴 예시
async def get_current_admin(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_jwt(token)
    if payload.get("role") != "admin":
        raise HTTPException(401)
    return payload
```

### Rate Limiting 패턴 (로그인 시도 제한)
- DB 기반 카운터 (`Admin.login_attempts`, `Admin.locked_until`)
- 로그인 시도마다 DB 업데이트
- 잠금 확인 → 비밀번호 검증 → 카운터 업데이트 순서

### 파일 업로드 보안 패턴
- Content-Type 검증 + 확장자 whitelist 이중 검증
- 저장 파일명 UUID로 교체 (원본 파일명 사용 금지)
- 최대 크기 제한 (5MB)

---

## 성능 패턴

### SSE 연결 풀 패턴
```python
# 인메모리 연결 풀
admin_connections: dict[str, list[asyncio.Queue]] = {}  # store_id → queues
table_connections: dict[str, asyncio.Queue] = {}         # session_id → queue

# 이벤트 발행
async def broadcast_to_admin(store_id: str, event: dict):
    for queue in admin_connections.get(store_id, []):
        await queue.put(event)
```

### DB 연결 풀 패턴
- `create_async_engine` with pool_size=5, max_overflow=10
- 요청별 세션: `async_sessionmaker` + `Depends(get_db)`
- 트랜잭션 자동 커밋/롤백

### 일괄 처리 패턴 (OrderItem 생성)
- 주문 생성 시 OrderItem 리스트를 `session.add_all()` 로 일괄 INSERT

---

## 안정성 패턴

### 표준 에러 응답 패턴
```json
{
  "detail": "에러 메시지",
  "code": "ERROR_CODE"
}
```

| HTTP 상태 | 사용 상황 |
|-----------|-----------|
| 400 | 입력값 검증 실패 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 리소스 |
| 429 | 로그인 시도 초과 |
| 500 | 서버 내부 오류 |

### Pydantic 입력 검증 패턴
- 모든 요청 body는 Pydantic BaseModel로 정의
- 필드 레벨 validator로 비즈니스 규칙 검증
- FastAPI가 자동으로 422 응답 생성

---

## 유지보수 패턴

### 레이어드 아키텍처
```
Router (HTTP 처리) → Service (비즈니스 로직) → DB (데이터 접근)
```
- Router: HTTP 요청/응답 처리, 인증 의존성
- Service: 비즈니스 로직, 트랜잭션 관리
- Model: SQLAlchemy ORM 모델

### 환경 설정 패턴
```python
class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_expire_hours: int = 16
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    model_config = SettingsConfigDict(env_file=".env")
```
