# Logical Components - Admin Frontend (Unit 3)

## 컴포넌트 구성

```
admin-frontend/
├── [Browser Storage]
│   └── localStorage: admin_token
├── [Memory State]
│   └── AuthContext (token, admin)
├── [Network Layer]
│   ├── API Client (fetch wrapper)
│   └── EventSource (SSE /sse/admin)
└── [UI Layer]
    ├── Pages (LoginPage, DashboardPage, TableManagementPage, MenuManagementPage)
    └── Components (TableCard, OrderDetailModal, OrderHistoryModal, MenuForm, ConfirmDialog)
```

## 배포 구성

```
Docker Container: admin-frontend
  └── Nginx (포트 3001 → 내부 80)
       ├── /          → dist/ (React 빌드)
       ├── /api/*     → backend:8000 (프록시)
       └── /api/sse/* → backend:8000/sse/* (SSE 프록시, 버퍼링 off)
```
