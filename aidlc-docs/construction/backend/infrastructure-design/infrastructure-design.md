# Infrastructure Design - Backend API (Unit 1)

---

## 배포 환경: Docker Compose (로컬)

### 서비스 구성

| 서비스 | 이미지 | 포트 | 역할 |
|--------|--------|------|------|
| backend | 커스텀 Dockerfile | 8000 | FastAPI 애플리케이션 |
| postgres | postgres:16-alpine | 5432 | PostgreSQL 데이터베이스 |

### 볼륨

| 볼륨명 | 마운트 경로 | 용도 |
|--------|-------------|------|
| postgres_data | /var/lib/postgresql/data | DB 데이터 영속성 |
| backend_uploads | /app/static/uploads | 이미지 파일 영속성 |

### 네트워크
- `table-order-network` (bridge): 모든 서비스 공유

---

## Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p static/uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 환경 변수

| 변수명 | 예시값 | 설명 |
|--------|--------|------|
| DATABASE_URL | postgresql+asyncpg://user:pass@postgres:5432/tableorder | DB 연결 문자열 |
| JWT_SECRET | (랜덤 32자 이상 문자열) | JWT 서명 키 |
| JWT_EXPIRE_HOURS | 16 | JWT 만료 시간 |
| CORS_ORIGINS | http://localhost:3000,http://localhost:3001 | 허용 CORS origin |

---

## DB 초기화 전략

1. Docker Compose 시작 시 postgres 컨테이너 먼저 기동
2. backend 컨테이너 시작 시 Alembic `upgrade head` 자동 실행
3. 초기 Store 데이터는 별도 seed 스크립트 또는 초기 설정 API로 생성
