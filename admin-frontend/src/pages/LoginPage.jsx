import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isSetup, setIsSetup] = useState(false)
  const [form, setForm] = useState({ storeIdentifier: '', storeName: '', username: '', password: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    const { storeIdentifier, username, password } = form
    if (!storeIdentifier.trim() || !username.trim() || !password) return setError('모든 항목을 입력해주세요')
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

  const handleSetup = async (e) => {
    e.preventDefault()
    const { storeIdentifier, storeName, username, password } = form
    if (!storeIdentifier.trim() || !storeName.trim() || !username.trim() || !password)
      return setError('모든 항목을 입력해주세요')
    setIsLoading(true)
    setError(null)
    try {
      await api.post('/auth/admin/setup', {
        store_identifier: storeIdentifier.trim(),
        store_name: storeName.trim(),
        username: username.trim(),
        password,
      })
      // setup 성공 후 바로 로그인
      await login(storeIdentifier.trim(), username.trim(), password)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || '초기 설정에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const toggle = () => { setIsSetup(!isSetup); setError(null) }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isSetup ? '초기 설정' : '관리자 로그인'}</h1>
        <form onSubmit={isSetup ? handleSetup : handleLogin} style={styles.form}>
          <label style={styles.label}>매장 식별자</label>
          <input style={styles.input} value={form.storeIdentifier} onChange={e => setForm({ ...form, storeIdentifier: e.target.value })} placeholder="예: my-restaurant" />
          {isSetup && (
            <>
              <label style={styles.label}>매장 이름</label>
              <input style={styles.input} value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} placeholder="예: 우리 식당" />
            </>
          )}
          <label style={styles.label}>사용자명</label>
          <input style={styles.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" />
          <label style={styles.label}>비밀번호</label>
          <input style={styles.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : isSetup ? '설정 완료 및 로그인' : '로그인'}
          </button>
        </form>
        <button style={styles.toggleBtn} onClick={toggle}>
          {isSetup ? '이미 계정이 있으신가요? 로그인' : '처음 사용하시나요? 초기 설정'}
        </button>
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
  toggleBtn: { marginTop: 16, width: '100%', background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' },
}
