# Build Instructions - 테이블 오더 애플리케이션

## 사전 요구사항

| 도구 | 버전 | 확인 명령 |
|------|------|----------|
| Docker | 24.0+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| (개발용) Python | 3.11+ | `python --version` |
| (개발용) Node.js | 20+ | `node --version` |

---

## 1. 환경 변수 설정

```bash
# 루트 디렉토리에서
cp .env.example .env
```

`.env` 파일 편집:
```env
POSTGRES_USER=tableorder
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key-minimum-32-chars
```

---

## 2. Docker Compose 전체 빌드 및 실행

```bash
# 전체 빌드 (최초 또는 코드 변경 시)
docker compose build

# 백그라운드 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 서비스별 로그
docker compose logs -f backend
docker compose logs -f customer-frontend
docker compose logs -f admin-frontend
```

---

## 3. 서비스별 개별 빌드

### Backend
```bash
cd backend
pip install -r requirements.txt

# DB 마이그레이션 (개발 환경)
alembic upgrade head

# 개발 서버 실행
uvicorn app.main:app --reload --port 8000
```

### Customer Frontend
```bash
cd customer-frontend
npm install
npm run build        # 프로덕션 빌드
# 개발 서버: npm run dev
```

### Admin Frontend
```bash
cd admin-frontend
npm install
npm run build        # 프로덕션 빌드
# 개발 서버: npm run dev
```

---

## 4. 초기 관리자 계정 설정

서비스 실행 후 최초 1회 실행:

```bash
curl -X POST http://localhost:8000/auth/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "store_identifier": "my-restaurant",
    "store_name": "내 식당",
    "username": "admin",
    "password": "admin1234"
  }'
```

---

## 5. 접속 URL

| 서비스 | URL |
|--------|-----|
| 고객 UI | http://localhost:3000 |
| 관리자 UI | http://localhost:3001 |
| Backend API | http://localhost:8000 |
| API 문서 (Swagger) | http://localhost:8000/docs |

---

## 6. 서비스 종료

```bash
docker compose down

# 볼륨(DB 데이터)까지 삭제
docker compose down -v
```
