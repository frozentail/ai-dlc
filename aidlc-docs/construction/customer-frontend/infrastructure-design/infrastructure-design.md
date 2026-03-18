# Infrastructure Design - Customer Frontend (Unit 2)

## 배포 환경

- **환경**: Docker Compose (로컬 단일 호스트)
- **컨테이너명**: `customer-frontend`
- **외부 포트**: 3000 → 내부 80 (Nginx)

---

## 컨테이너 구성

### Dockerfile (Multi-stage Build)

```
Stage 1: builder
  - node:20-alpine
  - npm install + vite build → dist/

Stage 2: production
  - nginx:alpine
  - dist/ 복사
  - nginx.conf 적용
  - 포트 80 노출
```

### Nginx 설정

```nginx
server {
    listen 80;

    # React SPA - 모든 경로를 index.html로
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API 프록시
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SSE 프록시 (버퍼링 비활성화 필수)
    location /api/sse/ {
        proxy_pass http://backend:8000/sse/;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding on;
    }
}
```

---

## 환경 변수

| 변수명 | 값 | 용도 |
|--------|-----|------|
| `VITE_API_URL` | `http://localhost:8000` | API base URL (빌드 시 주입) |

> Vite 환경 변수는 빌드 타임에 번들에 포함됨. Docker build arg로 전달.

---

## 네트워크

- `table-order-network` (bridge) 공유
- Backend 컨테이너명 `backend`으로 내부 통신
- 외부에서는 `localhost:3000` 접속

---

## 의존성

- Backend 컨테이너 실행 후 시작 (docker-compose `depends_on` 불필요 - 정적 파일 서빙이므로)
- 런타임에 Backend API 호출 (브라우저에서 직접)
