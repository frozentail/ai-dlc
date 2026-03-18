# NFR Design Patterns - Admin Frontend (Unit 3)

## 패턴 1: JWT 만료 검증
```js
const isTokenExpired = (token) => {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]))
    return exp * 1000 < Date.now()
  } catch { return true }
}
// AuthContext 초기화 시 및 API 401 응답 시 검증
```

## 패턴 2: 신규 주문 하이라이트 (3초)
```js
// new_order SSE 이벤트 수신 시
setNewTableIds(prev => new Set([...prev, tableId]))
setTimeout(() => {
  setNewTableIds(prev => { const s = new Set(prev); s.delete(tableId); return s })
}, 3000)
```

## 패턴 3: HTML5 Drag & Drop 순서 변경
```js
// dragstart → draggingId ref 저장
// dragover → e.preventDefault()
// drop → 배열 재정렬 → PUT /menus/reorder
const reorder = (arr, fromId, toId) => {
  const from = arr.findIndex(m => m.id === fromId)
  const to = arr.findIndex(m => m.id === toId)
  const result = [...arr]
  result.splice(to, 0, result.splice(from, 1)[0])
  return result
}
```

## 패턴 4: SSE + API Client (Customer Frontend와 동일)
- API Client Wrapper: Authorization 헤더 공통 처리
- useSSE hook: EventSource cleanup
- Protected Route: token 없으면 /login 리다이렉트
