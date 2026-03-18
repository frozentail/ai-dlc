# Deployment Architecture - Backend API (Unit 1)

---

## Docker Compose 전체 구성

```yaml
# docker-compose.yml (전체 시스템)

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: tableorder
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - table-order-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/tableorder
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRE_HOURS: 16
      CORS_ORIGINS: http://localhost:3000,http://localhost:3001
    volumes:
      - backend_uploads:/app/static/uploads
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - table-order-network

  customer-frontend:
    build: ./customer-frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:8000
    networks:
      - table-order-network

  admin-frontend:
    build: ./admin-frontend
    ports:
      - "3001:80"
    environment:
      VITE_API_URL: http://localhost:8000
    networks:
      - table-order-network

volumes:
  postgres_data:
  backend_uploads:

networks:
  table-order-network:
    driver: bridge
```

---

## 시작 순서

```
1. postgres (healthcheck 통과까지 대기)
2. backend (postgres healthy 확인 후 시작, Alembic 마이그레이션 실행)
3. customer-frontend, admin-frontend (병렬 시작)
```

---

## 접속 URL

| 서비스 | URL |
|--------|-----|
| Backend API | http://localhost:8000 |
| API 문서 (Swagger) | http://localhost:8000/docs |
| 고객 UI | http://localhost:3000 |
| 관리자 UI | http://localhost:3001 |
| 이미지 파일 | http://localhost:8000/static/uploads/{filename} |
