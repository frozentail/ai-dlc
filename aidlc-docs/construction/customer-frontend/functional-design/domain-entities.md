# Domain Entities - Customer Frontend (Unit 2)

## 프론트엔드 도메인 모델

### TableCredentials (localStorage)
```js
{
  storeIdentifier: string,  // 매장 식별자
  tableNumber: number,      // 테이블 번호
  password: string          // 테이블 비밀번호
}
```

### TableSession (AuthContext)
```js
{
  token: string,            // JWT 토큰
  tableId: string,          // UUID
  sessionId: string,        // UUID (현재 세션)
  storeIdentifier: string,
  tableNumber: number
}
```

### Category
```js
{
  id: string,               // UUID
  name: string,
  sort_order: number
}
```

### Menu
```js
{
  id: string,               // UUID
  category_id: string,
  name: string,
  price: number,
  description: string | null,
  image_path: string | null
}
```

### CartItem (localStorage + CartContext)
```js
{
  menuId: string,
  menuName: string,
  price: number,
  quantity: number          // 1 이상
}
```

### Order
```js
{
  id: string,               // UUID
  created_at: string,       // ISO 8601
  status: 'pending' | 'preparing' | 'completed',
  total_amount: number,
  items: OrderItem[]
}
```

### OrderItem
```js
{
  menu_name: string,
  quantity: number,
  unit_price: number
}
```

### SSEEvent
```js
{
  type: 'order_status_updated',
  data: {
    order_id: string,
    status: 'pending' | 'preparing' | 'completed'
  }
}
```
