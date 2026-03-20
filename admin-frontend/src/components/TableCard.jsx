const STATUS_LABEL = { pending: '대기중', preparing: '준비중', completed: '완료' }
const STATUS_COLOR = { pending: '#f59e0b', preparing: '#3b82f6', completed: '#10b981' }

export default function TableCard({ tableNumber, orders, isNew, onOrderClick, onMoreClick }) {
  const totalAmount = orders.reduce((s, o) => s + o.total_amount, 0)
  const latestOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 2)

  return (
    <div style={{ ...styles.card, ...(isNew ? styles.cardNew : {}) }}>
      <div style={styles.header}>
        <span style={styles.tableNum}>{tableNumber}번 테이블</span>
        {isNew && <span style={styles.newBadge}>NEW</span>}
      </div>
      <div style={styles.total}>{totalAmount.toLocaleString()}원</div>

      {orders.length === 0 ? (
        <div style={styles.empty}>주문 없음</div>
      ) : (
        <div style={styles.orderList}>
          {latestOrders.map((order) => (
            <div key={order.id} style={styles.orderRow} onClick={() => onOrderClick(order)}>
              <span style={styles.orderItems}>
                {order.items.slice(0, 2).map(i => i.menu_name).join(', ')}
                {order.items.length > 2 ? ` 외 ${order.items.length - 2}` : ''}
              </span>
              <span style={{ ...styles.statusDot, background: STATUS_COLOR[order.status] }}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>
          ))}
          {orders.length > 2 && (
            <div style={styles.moreOrders} onClick={onMoreClick}>+{orders.length - 2}개 더보기</div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '2px solid transparent', transition: 'border-color 0.3s' },
  cardNew: { borderColor: '#e53e3e', animation: 'pulse 1s ease-in-out' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tableNum: { fontWeight: 700, fontSize: 15 },
  newBadge: { background: '#e53e3e', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 },
  total: { fontSize: 18, fontWeight: 700, color: '#e53e3e', marginBottom: 10 },
  empty: { color: '#bbb', fontSize: 13, textAlign: 'center', padding: '8px 0' },
  orderList: { display: 'flex', flexDirection: 'column', gap: 6 },
  orderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0', borderBottom: '1px solid #f5f5f5' },
  orderItems: { fontSize: 13, color: '#444', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  statusDot: { fontSize: 11, color: '#fff', padding: '2px 8px', borderRadius: 10, marginLeft: 8, flexShrink: 0 },
  moreOrders: { fontSize: 12, color: '#3b82f6', textAlign: 'center', paddingTop: 4, cursor: 'pointer', textDecoration: 'underline' },
}
