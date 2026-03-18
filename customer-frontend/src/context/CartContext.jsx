import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'cart_items'

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const addItem = (menu) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuId === menu.id)
      if (existing) {
        return prev.map((i) =>
          i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { menuId: menu.id, menuName: menu.name, price: menu.price, quantity: 1 }]
    })
  }

  const increaseQty = (menuId) =>
    setItems((prev) =>
      prev.map((i) => (i.menuId === menuId ? { ...i, quantity: i.quantity + 1 } : i))
    )

  const decreaseQty = (menuId) =>
    setItems((prev) => {
      const item = prev.find((i) => i.menuId === menuId)
      if (!item) return prev
      if (item.quantity === 1) return prev.filter((i) => i.menuId !== menuId)
      return prev.map((i) => (i.menuId === menuId ? { ...i, quantity: i.quantity - 1 } : i))
    })

  const removeItem = (menuId) => setItems((prev) => prev.filter((i) => i.menuId !== menuId))

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{ items, totalAmount, itemCount, addItem, increaseQty, decreaseQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
