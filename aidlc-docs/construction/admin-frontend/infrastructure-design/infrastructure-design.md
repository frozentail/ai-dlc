# Infrastructure Design - Admin Frontend (Unit 3)

## 배포 환경
- **환경**: Docker Compose (로컬 단일 호스트)
- **컨테이너명**: `admin-frontend`
- **외부 포트**: 3001 → 내부 80 (Nginx)

## Dockerfile (Multi-stage)
```
Stage 1: builder (node:20-alpine)
  - npm install + vite build → dist/

Stage 2: production (nginx:alpine)
  - dist/ 복사 + nginx.conf 적용
```

## Nginx 설정
Customer Frontend와 동일 구조:
- SPA 라우팅: `try_files $uri $uri/ /index.html`
- `/api/*` → `backend:8000` 프록시
- `/api/sse/*` → SSE 프록시 (버퍼링 비활성화)

## 환경 변수
| 변수명 | 값 |
|--------|-----|
| `VITE_API_URL` | `http://localhost:8000` |

## Docker Compose 서비스 정의
```yaml
admin-frontend:
  build:
    context: ./admin-frontend
    args:
      VITE_API_URL: http://localhost:8000
  ports:
    - "3001:80"
  networks:
    - table-order-network
  restart: unless-stopped
```
