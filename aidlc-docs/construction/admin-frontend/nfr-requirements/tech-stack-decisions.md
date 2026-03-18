# Tech Stack Decisions - Admin Frontend (Unit 3)

## 기술 스택 (Customer Frontend와 동일)

| 영역 | 기술 |
|------|------|
| UI 프레임워크 | React 18 (JavaScript) |
| 빌드 도구 | Vite |
| 라우팅 | React Router v6 |
| 상태 관리 | React Context API |
| HTTP 클라이언트 | fetch API (native) |
| 실시간 통신 | EventSource (SSE) |
| 드래그 앤 드롭 | HTML5 Drag and Drop API (라이브러리 없음) |
| 컨테이너 | Docker (Nginx) |

## 주요 결정

### 드래그 앤 드롭: HTML5 기본 API
- react-dnd, dnd-kit 등 외부 라이브러리 미사용
- 메뉴 순서 조정 단일 기능에 라이브러리 추가 불필요
- `draggable`, `onDragStart`, `onDragOver`, `onDrop` 이벤트로 구현

## 패키지 의존성

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.1"
  }
}
```
