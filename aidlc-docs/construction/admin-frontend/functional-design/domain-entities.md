# Domain Entities - Admin Frontend (Unit 3)

## AdminSession
```js
{ token: string, storeId: string, username: string }
```

## Table
```js
{ id: string, table_number: number, session_id: string }
```

## Order
```js
{
  id: string,
  table_id: string,
  table_number: number,
  status: 'pending' | 'preparing' | 'completed',
  total_amount: number,
  created_at: string,
  items: OrderItem[]
}
```

## OrderItem
```js
{ menu_name: string, quantity: number, unit_price: number }
```

## Category
```js
{ id: string, name: string, sort_order: number }
```

## Menu
```js
{
  id: string,
  category_id: string,
  name: string,
  price: number,
  description: string | null,
  image_path: string | null,
  sort_order: number
}
```

## SessionHistory
```js
{
  session_id: string,
  ended_at: string,
  orders: Order[]
}
```
