# Deployment Architecture - Admin Frontend (Unit 3)

## 접속 정보
| 항목 | 값 |
|------|-----|
| 관리자 UI URL | http://localhost:3001 |
| 로그인 | http://localhost:3001/login |
| 대시보드 | http://localhost:3001/ |
| 테이블 관리 | http://localhost:3001/tables |
| 메뉴 관리 | http://localhost:3001/menus |

## 전체 시스템 내 위치
```
[운영자 브라우저]
      |
      | HTTP :3001
      v
[admin-frontend container]
  Nginx:80
      |
      | /api/* proxy → :8000
      v
[backend container]
  FastAPI:8000
      |
      v
[postgres container]
```
