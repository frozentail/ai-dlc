import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function MenuCard({ menu }) {
  const { addItem } = useCart()
  const imgSrc = menu.image_path
    ? `${API_URL}/static/uploads/${menu.image_path}`
    : null

  return (
    <div style={styles.card}>
      <div style={styles.imgWrap}>
        {imgSrc
          ? <img src={imgSrc} alt={menu.name} style={styles.img} />
          : <div style={styles.placeholder}>🍽️</div>
        }
      </div>
      <div style={styles.info}>
        <div style={styles.name}>{menu.name}</div>
        {menu.description && <div style={styles.desc}>{menu.description}</div>}
        <div style={styles.bottom}>
          <span style={styles.price}>{menu.price.toLocaleString()}원</span>
          <button style={styles.btn} onClick={() => addItem(menu)}>담기</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: { display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  imgWrap: { width: 80, height: 80, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  name: { fontWeight: 600, fontSize: 15 },
  desc: { fontSize: 13, color: '#666', flex: 1 },
  bottom: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontWeight: 700, color: '#e53e3e' },
  btn: {
    minWidth: 44, minHeight: 44, padding: '0 16px',
    background: '#e53e3e', color: '#fff', border: 'none',
    borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
}
