import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import NavBar from '../components/NavBar'
import MenuForm from '../components/MenuForm'
import ConfirmDialog from '../components/ConfirmDialog'

const API_URL = import.meta.env.VITE_API_URL || '/admin/api'

export default function MenuManagementPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [menus, setMenus] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCatInput, setShowCatInput] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [catError, setCatError] = useState(null)
  const draggingId = useRef(null)

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return setCatError('카테고리명을 입력해주세요')
    setCatError(null)
    try {
      const created = await api.post('/categories', { name: newCatName.trim() }, token)
      setCategories(prev => [...prev, created])
      if (!activeCategory) setActiveCategory(created.id)
      setNewCatName('')
      setShowCatInput(false)
    } catch (e) {
      setCatError(e.message)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, allMenus] = await Promise.all([
          api.get('/categories', token),
          api.get('/menus', token),
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
  }, [token])

  const filteredMenus = activeCategory ? menus.filter(m => m.category_id === activeCategory) : menus

  // 드래그 앤 드롭
  const handleDragStart = (e, menuId) => { draggingId.current = menuId }
  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = async (e, targetId) => {
    e.preventDefault()
    const fromId = draggingId.current
    if (!fromId || fromId === targetId) return

    const reordered = [...menus]
    const fromIdx = reordered.findIndex(m => m.id === fromId)
    const toIdx = reordered.findIndex(m => m.id === targetId)
    reordered.splice(toIdx, 0, reordered.splice(fromIdx, 1)[0])
    setMenus(reordered)

    try {
      await api.put('/menus/reorder', { items: reordered.map((m, i) => ({ id: m.id, sort_order: i })) }, token)
    } catch (e) {
      console.error(e)
    }
    draggingId.current = null
  }

  const handleSave = (savedMenu) => {
    setMenus(prev => {
      const exists = prev.find(m => m.id === savedMenu.id)
      return exists ? prev.map(m => m.id === savedMenu.id ? savedMenu : m) : [...prev, savedMenu]
    })
    setShowForm(false)
    setEditingMenu(null)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/menus/${deleteTarget.id}`, token)
      setMenus(prev => prev.filter(m => m.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={styles.page}>
      <NavBar />
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h2 style={styles.heading}>메뉴 관리</h2>
          <button style={styles.addBtn} onClick={() => { setEditingMenu(null); setShowForm(true) }}>+ 메뉴 추가</button>
        </div>

        {/* 카테고리 탭 */}
        <div style={styles.tabs}>
          {categories.map(cat => (
            <button
              key={cat.id}
              style={{ ...styles.tab, ...(activeCategory === cat.id ? styles.tabActive : {}) }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
          <button style={styles.addCatBtn} onClick={() => setShowCatInput(v => !v)}>+ 카테고리</button>
        </div>
        {showCatInput && (
          <form onSubmit={handleAddCategory} style={styles.catForm}>
            <input
              style={styles.catInput}
              placeholder="카테고리명"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              autoFocus
            />
            <button style={styles.catSaveBtn} type="submit">추가</button>
            <button style={styles.catCancelBtn} type="button" onClick={() => { setShowCatInput(false); setNewCatName(''); setCatError(null) }}>취소</button>
            {catError && <span style={styles.catError}>{catError}</span>}
          </form>
        )}

        {isLoading ? (
          <div style={styles.loading}>불러오는 중...</div>
        ) : (
          <div style={styles.menuList}>
            {filteredMenus.map(menu => (
              <div
                key={menu.id}
                style={styles.menuRow}
                draggable
                onDragStart={e => handleDragStart(e, menu.id)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, menu.id)}
              >
                <span style={styles.dragHandle}>⠿</span>
                {menu.image_path && (
                  <img src={`${API_URL}/static/uploads/${menu.image_path}`} alt={menu.name} style={styles.menuImg} />
                )}
                <div style={styles.menuInfo}>
                  <span style={styles.menuName}>{menu.name}</span>
                  <span style={styles.menuPrice}>{menu.price.toLocaleString()}원</span>
                </div>
                <div style={styles.menuActions}>
                  <button style={styles.editBtn} onClick={() => { setEditingMenu(menu); setShowForm(true) }}>수정</button>
                  <button style={styles.deleteBtn} onClick={() => setDeleteTarget(menu)}>삭제</button>
                </div>
              </div>
            ))}
            {filteredMenus.length === 0 && <div style={styles.empty}>메뉴가 없습니다</div>}
          </div>
        )}
      </div>

      {showForm && (
        <MenuForm
          menu={editingMenu}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingMenu(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`"${deleteTarget.name}" 메뉴를 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  content: { padding: 24, maxWidth: 800, margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { margin: 0, fontSize: 20, fontWeight: 700 },
  addBtn: { height: 40, padding: '0 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: { height: 36, padding: '0 16px', border: '1px solid #ddd', background: '#fff', borderRadius: 18, cursor: 'pointer', fontSize: 13 },
  tabActive: { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e', fontWeight: 600 },
  loading: { padding: 40, textAlign: 'center', color: '#999' },
  menuList: { display: 'flex', flexDirection: 'column', gap: 8 },
  menuRow: { background: '#fff', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'grab' },
  dragHandle: { color: '#bbb', fontSize: 18, cursor: 'grab' },
  menuImg: { width: 48, height: 48, objectFit: 'cover', borderRadius: 6 },
  menuInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  menuName: { fontWeight: 600, fontSize: 14 },
  menuPrice: { color: '#e53e3e', fontSize: 13, fontWeight: 600 },
  menuActions: { display: 'flex', gap: 6 },
  editBtn: { height: 36, padding: '0 12px', border: '1px solid #3b82f6', color: '#3b82f6', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  deleteBtn: { height: 36, padding: '0 12px', border: '1px solid #e53e3e', color: '#e53e3e', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  empty: { padding: 40, textAlign: 'center', color: '#999' },
  addCatBtn: { height: 36, padding: '0 14px', border: '1px dashed #3b82f6', background: '#fff', color: '#3b82f6', borderRadius: 18, cursor: 'pointer', fontSize: 13 },
  catForm: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  catInput: { height: 36, padding: '0 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' },
  catSaveBtn: { height: 36, padding: '0 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  catCancelBtn: { height: 36, padding: '0 14px', border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  catError: { color: '#e53e3e', fontSize: 13 },
}
