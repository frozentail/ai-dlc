import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SetupPage() {
  const { setup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ storeIdentifier: '', tableNumber: '', password: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { storeIdentifier, tableNumber, password } = form
    if (!storeIdentifier.trim()) return setError('매장 식별자를 입력해주세요')
    if (!tableNumber) return setError('테이블 번호를 입력해주세요')
    if (!password.trim()) return setError('비밀번호를 입력해주세요')

    setIsLoading(true)
    setError(null)
    try {
      await setup(storeIdentifier.trim(), parseInt(tableNumber), password)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || '설정에 실패했습니다. 입력 정보를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>테이블 초기 설정</h1>
        <p style={styles.desc}>매장 정보를 입력하면 이후 자동으로 로그인됩니다.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>매장 식별자</label>
          <input
            style={styles.input}
            value={form.storeIdentifier}
            onChange={(e) => setForm({ ...form, storeIdentifier: e.target.value })}
            placeholder="예: my-restaurant"
          />
          <label style={styles.label}>테이블 번호</label>
          <input
            style={styles.input}
            type="number"
            min="1"
            value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
            placeholder="예: 1"
          />
          <label style={styles.label}>비밀번호</label>
          <input
            style={styles.input}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="테이블 비밀번호"
          />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? '설정 중...' : '저장 및 시작'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', padding: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 700 },
  desc: { margin: '0 0 24px', color: '#666', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontWeight: 600, fontSize: 14 },
  input: { height: 44, padding: '0 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, outline: 'none' },
  error: { color: '#e53e3e', fontSize: 13, padding: '8px 0' },
  btn: { marginTop: 8, height: 48, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer' },
}
