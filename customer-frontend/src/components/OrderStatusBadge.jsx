const STATUS_MAP = {
  pending: { label: '대기중', color: '#f59e0b' },
  preparing: { label: '준비중', color: '#3b82f6' },
  completed: { label: '완료', color: '#10b981' },
}

export default function OrderStatusBadge({ status }) {
  const { label, color } = STATUS_MAP[status] || { label: status, color: '#6b7280' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      backgroundColor: color,
      color: '#fff',
      fontSize: '13px',
      fontWeight: 600,
    }}>
      {label}
    </span>
  )
}
