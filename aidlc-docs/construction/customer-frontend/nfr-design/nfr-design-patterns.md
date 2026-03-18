# NFR Design Patterns - Customer Frontend (Unit 2)

## 패턴 1: Auto-Login with Graceful Degradation

**적용 NFR**: NFR-03-4 (자동 로그인 실패 시 graceful degradation)

```
앱 시작
  └─ AuthContext.autoLogin()
       ├─ 성공 → 정상 플로우
       └─ 실패 → 에러 상태 저장 → SetupPage 리다이렉트
            └─ 사용자에게 명확한 에러 메시지 표시
```

- localStorage 자격증명 없음 → 조용히 SetupPage 이동 (에러 없음)
- 자격증명 있지만 서버 인증 실패 → 에러 메시지 + SetupPage 이동

---

## 패턴 2: Optimistic Local State (장바구니)

**적용 NFR**: NFR-01-3 (장바구니 조작 즉시 응답), NFR-03-1 (localStorage 유지)

- 장바구니 조작은 서버 호출 없이 로컬 상태만 업데이트 → 즉각적인 UI 반응
- 변경 시마다 localStorage 동기화 (useEffect로 items 변경 감지)
- 주문 확정 시에만 서버 POST 호출

```js
// CartContext 패턴
useEffect(() => {
  localStorage.setItem('cart_items', JSON.stringify(items))
}, [items])
```

---

## 패턴 3: SSE Subscription with Cleanup

**적용 NFR**: NFR-03-2 (SSE 자동 재연결), NFR-03-3 (데이터 손실 없음)

```js
// useSSE 훅 패턴
useEffect(() => {
  const es = new EventSource(url, { withCredentials: false })
  // Authorization은 URL 쿼리 파라미터로 전달 (EventSource는 헤더 미지원)
  es.addEventListener('order_status_updated', handler)
  return () => es.close()  // cleanup
}, [url])
```

- EventSource 브라우저 기본 자동 재연결 활용
- 컴포넌트 언마운트 시 반드시 `close()` 호출로 리소스 해제

---

## 패턴 4: Protected Route

**적용 NFR**: NFR-04-3 (인증 필요 페이지 접근 제어)

```jsx
// PrivateRoute 패턴
const PrivateRoute = ({ children }) => {
  const { token, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!token) return <Navigate to="/setup" replace />
  return children
}
```

---

## 패턴 5: API Client Wrapper

**적용 NFR**: NFR-04-2 (Authorization 헤더), NFR-05-1 (API 로직 집중)

```js
// src/api/client.js 패턴
const apiClient = {
  get: (path, token) => fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  post: (path, body, token) => fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
}
```

- base URL 환경 변수(`VITE_API_URL`)로 관리
- 모든 API 호출 이 클라이언트를 통해 수행

---

## 패턴 6: Loading & Error State

**적용 NFR**: NFR-02-4 (로딩 피드백), NFR-02-5 (에러 메시지)

- 모든 비동기 작업: `isLoading` 상태로 버튼 비활성화 + 스피너 표시
- API 에러: `error` 상태에 메시지 저장 → UI에 표시
- 중복 제출 방지: `isLoading === true`이면 버튼 `disabled`
