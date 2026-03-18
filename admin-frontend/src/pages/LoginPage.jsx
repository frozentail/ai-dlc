import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ storeIdentifier: '', username: '', password: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { storeIdentifier, username, password } = form
    if (!storeIdentifier.trim() || !username.trim() || !password) {
      return setError('모든 항목을 입력해주세요')
    }
    setIsLoading(true)
    setError(null)
    try {
      await login(storeIdentifier.trim(), username.trim(), password)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || '로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>관리자 로그인</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>매장 식별자</label>
          <input style={styles.input} value={form.storeIdentifier} onChange={e => setForm({ ...form, storeIdentifier: e.target.value })} placeholder="예: my-restaurant" />
          <label style={styles.label}>사용자명</label>
          <input style={styles.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" />
          <label style={styles.label}>비밀번호</label>
          <input style={styles.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  card: { background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 24px', fontSize: 22, fontWeight: 700, textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontWeight: 600, fontSize: 13 },
  input: { height: 44, padding: '0 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, outline: 'none' },
  error: { color: '#e53e3e', fontSize: 13, padding: '6px 0' },
  btn: { marginTop: 8, height: 48, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer' },
}
