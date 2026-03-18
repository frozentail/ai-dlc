const BASE_URL = import.meta.env.VITE_API_URL || ''

const request = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
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
  put: (path, body, token) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }, token),
  delete: (path, token) => request(path, { method: 'DELETE' }, token),
}

export const uploadImage = async (file, token) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/menus/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw new Error('이미지 업로드 실패')
  return res.json()
}

export const getSSEUrl = () => `${BASE_URL}/sse/admin`
