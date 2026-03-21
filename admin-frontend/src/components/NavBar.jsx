import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>
        <img src="/logo.jpeg" alt="로고" style={styles.logo} onError={e => { e.target.style.display='none' }} />
        🍽️ 관리자
      </span>
      <div style={styles.links}>
        <NavLink to="/" end style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>대시보드</NavLink>
        <NavLink to="/tables" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>테이블</NavLink>
        <NavLink to="/menus" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>메뉴</NavLink>
      </div>
      <button style={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
    </nav>
  )
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, background: '#1a1a2e', color: '#fff', gap: 24, position: 'sticky', top: 0, zIndex: 50 },
  brand: { fontWeight: 700, fontSize: 16, marginRight: 8, display: 'flex', alignItems: 'center', gap: 8 },
  logo: { height: 32, width: 'auto', objectFit: 'contain' },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: { padding: '6px 14px', borderRadius: 6, color: '#ccc', textDecoration: 'none', fontSize: 14 },
  active: { background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 },
  logoutBtn: { marginLeft: 'auto', padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#ccc', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
}
