export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <>
      <div style={styles.overlay} onClick={onCancel} />
      <div style={styles.dialog}>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button style={styles.confirmBtn} onClick={onConfirm}>확인</button>
        </div>
      </div>
    </>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 },
  dialog: {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    background: '#fff', borderRadius: 12, padding: 24, minWidth: 280, zIndex: 201,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  message: { margin: '0 0 20px', fontSize: 15, lineHeight: 1.5, textAlign: 'center' },
  buttons: { display: 'flex', gap: 8 },
  cancelBtn: { flex: 1, height: 44, border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  confirmBtn: { flex: 1, height: 44, border: 'none', background: '#e53e3e', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
