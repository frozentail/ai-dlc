# Deployment Architecture - Customer Frontend (Unit 2)

## Docker Compose 서비스 정의

```yaml
customer-frontend:
  build:
    context: ./customer-frontend
    args:
      VITE_API_URL: http://localhost:8000
  ports:
    - "3000:80"
  networks:
    - table-order-network
  restart: unless-stopped
```

---

## 빌드 파이프라인

```
./customer-frontend/
  └─ Dockerfile (multi-stage)
       ├─ Stage 1 (builder): node:20-alpine
       │   ├─ COPY package.json + npm install
       │   ├─ COPY src/ + vite build
       │   └─ 산출물: dist/
       └─ Stage 2 (production): nginx:alpine
           ├─ COPY dist/ → /usr/share/nginx/html/
           ├─ COPY nginx.conf → /etc/nginx/conf.d/default.conf
           └─ EXPOSE 80
```

---

## 접속 정보

| 항목 | 값 |
|------|-----|
| 고객 UI URL | http://localhost:3000 |
| 초기 설정 화면 | http://localhost:3000/setup |
| 메뉴 화면 (홈) | http://localhost:3000/ |
| 주문 내역 | http://localhost:3000/orders |

---

## 전체 시스템 내 위치

```
[태블릿 브라우저]
      |
      | HTTP :3000
      v
[customer-frontend container]
  Nginx:80
      |
      | /api/* proxy → :8000
      v
[backend container]
  FastAPI:8000
      |
      v
[postgres container]
  PostgreSQL:5432
```
