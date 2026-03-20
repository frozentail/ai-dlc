import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, uploadImage } from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || '/admin/api'

export default function MenuForm({ menu, categories, onSave, onClose }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    name: menu?.name || '',
    price: menu?.price || '',
    description: menu?.description || '',
    category_id: menu?.category_id || (categories[0]?.id || ''),
    image_path: menu?.image_path || null,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(
    menu?.image_path ? `${API_URL}/static/uploads/${menu.image_path}` : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const validate = () => {
    if (!form.name.trim()) return '메뉴명을 입력해주세요'
    if (!form.price || Number(form.price) <= 0) return '올바른 가격을 입력해주세요'
    if (!form.category_id) return '카테고리를 선택해주세요'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)

    setIsLoading(true)
    setError(null)
    try {
      let imagePath = form.image_path
      if (imageFile) {
        const res = await uploadImage(imageFile, token)
        imagePath = res.image_path
      }

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim() || null,
        category_id: form.category_id,
        image_path: imagePath,
      }

      let result
      if (menu) {
        result = await api.put(`/menus/${menu.id}`, payload, token)
      } else {
        result = await api.post('/menus', payload, token)
      }
      onSave(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>{menu ? '메뉴 수정' : '메뉴 등록'}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>메뉴명 *</label>
          <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <label style={styles.label}>가격 *</label>
          <input style={styles.input} type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />

          <label style={styles.label}>카테고리 *</label>
          <select style={styles.input} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label style={styles.label}>설명</label>
          <textarea style={{ ...styles.input, height: 72, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <label style={styles.label}>이미지</label>
          {imagePreview && <img src={imagePreview} alt="preview" style={styles.preview} />}
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 13 }} />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>취소</button>
            <button type="submit" style={styles.saveBtn} disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 },
  modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 440, zIndex: 101, maxHeight: '90vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 700, fontSize: 16 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', minWidth: 44, minHeight: 44 },
  form: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontWeight: 600, fontSize: 13, marginTop: 4 },
  input: { height: 40, padding: '0 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%' },
  preview: { width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 4 },
  error: { padding: 10, background: '#fff5f5', color: '#e53e3e', borderRadius: 8, fontSize: 13 },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  cancelBtn: { flex: 1, height: 44, border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer' },
  saveBtn: { flex: 1, height: 44, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
}
