import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'
import MenuCard from '../components/MenuCard'
import CartDrawer from '../components/CartDrawer'

export default function MenuPage() {
  const { auth } = useAuth()
  const { itemCount, totalAmount } = useCart()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [menus, setMenus] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, allMenus] = await Promise.all([
          api.get(`/public/categories?store_id=${auth.storeId}`),
          api.get(`/public/menus?store_id=${auth.storeId}`),
        ])
        setCategories(cats)
        setMenus(allMenus)
        if (cats.length > 0) setActiveCategory(cats[0].id)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [auth.storeId])

  const filteredMenus = activeCategory
    ? menus.filter((m) => m.category_id === activeCategory)
    : menus

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <img src="/logo.jpeg" alt="로고" style={styles.logo} onError={e => { e.target.style.display='none' }} />
        <span style={styles.tableInfo}>테이블 {auth.tableNumber}번</span>
        <button style={styles.historyBtn} onClick={() => navigate('/orders')}>주문내역</button>
      </div>

      {/* 카테고리 탭 */}
      <div style={styles.tabs}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            style={{ ...styles.tab, ...(activeCategory === cat.id ? styles.tabActive : {}) }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 메뉴 목록 */}
      <div style={styles.menuList}>
        {isLoading ? (
          <div style={styles.loading}>메뉴를 불러오는 중...</div>
        ) : filteredMenus.length === 0 ? (
          <div style={styles.loading}>메뉴가 없습니다</div>
        ) : (
          filteredMenus.map((menu) => <MenuCard key={menu.id} menu={menu} />)
        )}
      </div>

      {/* 장바구니 버튼 */}
      {itemCount > 0 && (
        <button style={styles.cartBtn} onClick={() => setIsCartOpen(true)}>
          🛒 {itemCount}개 · {totalAmount.toLocaleString()}원
        </button>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff', paddingBottom: 80 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10 },
  logo: { height: 36, width: 'auto', objectFit: 'contain' },
  tableInfo: { fontWeight: 700, fontSize: 16 },
  historyBtn: { minHeight: 44, padding: '0 16px', border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  tabs: { display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto', borderBottom: '1px solid #eee' },
  tab: { minHeight: 44, padding: '0 16px', border: '1px solid #ddd', background: '#fff', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 14 },
  tabActive: { background: '#e53e3e', color: '#fff', borderColor: '#e53e3e', fontWeight: 600 },
  menuList: { padding: '0 20px' },
  loading: { padding: 40, textAlign: 'center', color: '#999' },
  cartBtn: {
    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
    minHeight: 52, padding: '0 32px', background: '#e53e3e', color: '#fff',
    border: 'none', borderRadius: 26, fontWeight: 700, fontSize: 16,
    cursor: 'pointer', boxShadow: '0 4px 16px rgba(229,62,62,0.4)', whiteSpace: 'nowrap',
  },
}
