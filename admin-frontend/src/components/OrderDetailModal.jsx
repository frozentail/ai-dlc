import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import ConfirmDialog from './ConfirmDialog'

const NEXT_STATUS = { pending: 'preparing', preparing: 'completed' }
const STATUS_LABEL = { pending: '대기중 → 준비중', preparing: '준비중 → 완료' }

export default function OrderDetailModal({ order, onClose, onStatusChange, onDelete, onOrderUpdate }) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState(null)
  const [error, setError] = useState(null)

  if (!order) return null

  const handleStatusChange = async () => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setIsLoading(true)
    try {
      await api.put(`/orders/${order.id}/status`, { status: next }, token)
      onStatusChange(order.id, next)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await api.delete(`/orders/${order.id}`, token)
      onDelete(order.id)
      onClose()
    } catch (e) {
      setError(e.message)
      setShowDeleteConfirm(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    setDeletingItemId(itemId)
    try {
      const result = await api.delete(`/orders/${order.id}/items/${itemId}`, token)
      if (result?.order_deleted) {
        onDelete(order.id)
        onClose()
      } else {
        // 주문 업데이트 (아이템 제거 후 남은 주문)
        if (onOrderUpdate) onOrderUpdate(result)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingItemId(null)
    }
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>주문 #{order.id.slice(0, 8).toUpperCase()}</div>
            <div style={styles.meta}>
              {order.table_number}번 테이블 · {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.itemList}>
          {order.items.map((item, i) => (
            <div key={i} style={styles.item}>
              <span style={styles.itemName}>{item.menu_name}</span>
              <span style={styles.itemQty}>x{item.quantity}</span>
              <span style={styles.itemPrice}>{(item.unit_price * item.quantity).toLocaleString()}원</span>
              <button
                style={styles.itemDeleteBtn}
                onClick={() => handleDeleteItem(item.id)}
                disabled={deletingItemId === item.id}
                title="이 항목 삭제"
              >
                {deletingItemId === item.id ? '...' : '✕'}
              </button>
            </div>
          ))}
        </div>

        <div style={styles.totalRow}>
          <span>합계</span>
          <span style={styles.totalAmount}>{order.total_amount.toLocaleString()}원</span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.actions}>
          <button
            style={styles.deleteBtn}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
          >
            삭제
          </button>
          {NEXT_STATUS[order.status] && (
            <button style={styles.statusBtn} onClick={handleStatusChange} disabled={isLoading}>
              {STATUS_LABEL[order.status]}
            </button>
          )}
          {order.status === 'completed' && (
            <span style={styles.completedBadge}>✅ 완료</span>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          message="이 주문을 삭제하시겠습니까?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 },
  modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 440, zIndex: 101, maxHeight: '80vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontWeight: 700, fontSize: 16 },
  meta: { color: '#666', fontSize: 13, marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', minWidth: 44, minHeight: 44 },
  itemList: { borderTop: '1px solid #eee', marginBottom: 12 },
  item: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  itemName: { flex: 1, fontSize: 14 },
  itemQty: { color: '#666', fontSize: 13 },
  itemPrice: { fontWeight: 600, minWidth: 70, textAlign: 'right', fontSize: 14 },
  itemDeleteBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14, padding: '0 4px', marginLeft: 4 },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #eee', fontWeight: 700 },
  totalAmount: { color: '#e53e3e', fontSize: 17 },
  error: { padding: 10, background: '#fff5f5', color: '#e53e3e', borderRadius: 8, fontSize: 13, marginBottom: 12 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  deleteBtn: { height: 44, padding: '0 16px', border: '1px solid #e53e3e', color: '#e53e3e', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  statusBtn: { flex: 1, height: 44, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  completedBadge: { flex: 1, textAlign: 'center', fontSize: 14, color: '#10b981', fontWeight: 600, lineHeight: '44px' },
}
