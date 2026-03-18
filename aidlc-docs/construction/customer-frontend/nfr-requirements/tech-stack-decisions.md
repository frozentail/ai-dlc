# Tech Stack Decisions - Customer Frontend (Unit 2)

## 확정된 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|----------|
| UI 프레임워크 | React 18 (JavaScript) | 프로젝트 전체 확정 스택 |
| 빌드 도구 | Vite | 빠른 개발 서버, HMR, 경량 번들 |
| 라우팅 | React Router v6 | SPA 라우팅 표준 |
| 상태 관리 | React Context API | 규모 대비 충분, 외부 라이브러리 불필요 |
| HTTP 클라이언트 | fetch API (native) | 의존성 최소화, 브라우저 기본 지원 |
| 실시간 통신 | EventSource (SSE) | 브라우저 기본 지원, 자동 재연결 내장 |
| 스타일링 | CSS Modules 또는 inline styles | 별도 CSS 라이브러리 없이 단순하게 |
| 컨테이너 | Docker (Nginx) | 프로젝트 전체 Docker Compose 배포 |

## 주요 결정 사항

### 상태 관리: Context API 선택
- Redux/Zustand 불필요 - 전역 상태가 AuthContext, CartContext 2개로 단순
- 추가 의존성 없이 React 내장 기능으로 충분

### HTTP 클라이언트: fetch API 선택
- axios 미사용 - 번들 크기 절감
- `src/api/client.js`에서 공통 헤더(Authorization), base URL, 에러 처리 래핑

### SSE: 브라우저 기본 EventSource 사용
- 별도 라이브러리 불필요
- 자동 재연결 기본 내장
- `useSSE` 커스텀 훅으로 추상화

### 빌드/배포: Vite + Nginx Docker
- Vite로 빌드 → `dist/` 생성
- Nginx 컨테이너에서 정적 파일 서빙
- `/api` 경로 Backend로 프록시 설정

## 패키지 의존성

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```
