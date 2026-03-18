# Code Generation Plan - Admin Frontend (Unit 3)

## 방식: Standard
## 위치: workspace root / admin-frontend/

---

## 단계별 체크리스트

### Step 1: 프로젝트 구조 설정
- [x] 1.1 package.json
- [x] 1.2 vite.config.js
- [x] 1.3 index.html
- [x] 1.4 Dockerfile (multi-stage)
- [x] 1.5 nginx.conf
- [x] 1.6 .env.example

### Step 2: API 클라이언트
- [x] 2.1 src/api/client.js

### Step 3: Context
- [x] 3.1 src/context/AuthContext.jsx (JWT, 만료 검증, localStorage)

### Step 4: 커스텀 훅
- [x] 4.1 src/hooks/useSSE.js

### Step 5: 공통 컴포넌트
- [x] 5.1 src/components/ConfirmDialog.jsx
- [x] 5.2 src/components/OrderDetailModal.jsx
- [x] 5.3 src/components/TableCard.jsx
- [x] 5.4 src/components/OrderHistoryModal.jsx
- [x] 5.5 src/components/MenuForm.jsx
- [x] 5.6 src/components/NavBar.jsx

### Step 6: 페이지 컴포넌트
- [x] 6.1 src/pages/LoginPage.jsx
- [x] 6.2 src/pages/DashboardPage.jsx
- [x] 6.3 src/pages/TableManagementPage.jsx
- [x] 6.4 src/pages/MenuManagementPage.jsx

### Step 7: 앱 진입점
- [x] 7.1 src/App.jsx
- [x] 7.2 src/main.jsx
- [x] 7.3 src/index.css

---

## 스토리 커버리지
| Step | Story |
|------|-------|
| 3.1, 6.1 | US-13, US-14 |
| 6.2, 5.3, 4.1 | US-15, US-16 |
| 5.2 | US-17, US-18, US-19 |
| 6.3, 5.4 | US-20, US-21 |
| 6.4, 5.5 | US-22, US-23, US-24, US-25 |
