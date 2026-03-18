import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer({ isOpen, onClose }) {
  const { items, totalAmount, increaseQty, decreaseQty, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.drawer}>
        <div style={styles.header}>
          <span style={styles.title}>장바구니</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={styles.empty}>담긴 메뉴가 없습니다</div>
        ) : (
          <>
            <div style={styles.list}>
              {items.map((item) => (
                <div key={item.menuId} style={styles.item}>
                  <div style={styles.itemName}>{item.menuName}</div>
                  <div style={styles.itemRight}>
                    <span style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()}원</span>
                    <div style={styles.qtyRow}>
                      <button style={styles.qtyBtn} onClick={() => decreaseQty(item.menuId)}>-</button>
                      <span style={styles.qty}>{item.quantity}</span>
                      <button style={styles.qtyBtn} onClick={() => increaseQty(item.menuId)}>+</button>
                      <button style={styles.removeBtn} onClick={() => removeItem(item.menuId)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <div style={styles.total}>총 {totalAmount.toLocaleString()}원</div>
              <button style={styles.clearBtn} onClick={clearCart}>비우기</button>
              <button style={styles.orderBtn} onClick={() => { onClose(); navigate('/order/confirm') }}>
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 },
  drawer: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#fff', borderRadius: '16px 16px 0 0',
    maxHeight: '70vh', display: 'flex', flexDirection: 'column', zIndex: 101,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' },
  title: { fontWeight: 700, fontSize: 17 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', minWidth: 44, minHeight: 44 },
  empty: { padding: 40, textAlign: 'center', color: '#999' },
  list: { flex: 1, overflowY: 'auto', padding: '0 20px' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  itemName: { fontWeight: 500 },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  itemPrice: { fontWeight: 600, color: '#e53e3e' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: { minWidth: 44, minHeight: 44, border: '1px solid #ddd', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 16 },
  qty: { minWidth: 24, textAlign: 'center', fontWeight: 600 },
  removeBtn: { minWidth: 44, minHeight: 44, border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 },
  footer: { padding: '16px 20px', borderTop: '1px solid #eee', display: 'flex', gap: 8, alignItems: 'center' },
  total: { flex: 1, fontWeight: 700, fontSize: 16 },
  clearBtn: { padding: '0 16px', height: 44, border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer' },
  orderBtn: { padding: '0 24px', height: 44, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
}
