const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const request = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '요청 실패' }))
    throw new Error(err.detail || '요청 실패')
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  get: (path, token) => request(path, { method: 'GET' }, token),
  post: (path, body, token) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }, token),
}

export const getSSEUrl = (sessionId) =>
  `${BASE_URL}/sse/table/${sessionId}`
