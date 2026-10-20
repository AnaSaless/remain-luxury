const pool = require('../config/db')

async function createOrder(req, res) {
  const { items, address, total, shipping } = req.body
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'O carrinho está vazio' })
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ message: 'Informe o endereço de entrega' })
  }
  try {
    // Validate each item: existence, ownership, and price
    for (const item of items) {
      if (!item.price || Number(item.price) <= 0) {
        return res.status(400).json({ message: 'Item com preço inválido no carrinho' })
      }
      if (item.id) {
        const [prod] = await pool.query('SELECT id, seller_id FROM products WHERE id = ?', [item.id])
        if (prod.length === 0) {
          return res.status(400).json({ message: `Produto "${item.title || item.id}" não encontrado` })
        }
        if (prod[0].seller_id === req.userId) {
          return res.status(400).json({ message: 'Você não pode comprar seu próprio produto' })
        }
      }
    }

    const [result] = await pool.query(
      'INSERT INTO orders (buyer_id, status, total, shipping, address) VALUES (?, "confirmed", ?, ?, ?)',
      [req.userId, Number(total), Number(shipping) || 0, address.trim()]
    )
    const orderId = result.insertId
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, title, brand, price, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.id || null, item.title, item.brand, Number(item.price), item.images?.[0] || null]
      )
    }
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId])
    const [orderItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId])
    res.status(201).json({ ...rows[0], items: orderItems })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar pedido' })
  }
}

async function getOrders(req, res) {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC',
      [req.userId]
    )
    if (orders.length === 0) return res.json([])
    const orderIds = orders.map(o => o.id)
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds
    )
    res.json(orders.map(o => ({ ...o, items: items.filter(i => i.order_id === o.id) })))
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar pedidos' })
  }
}

async function getOrderById(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
      [req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado' })
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id])
    res.json({ ...rows[0], items })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar pedido' })
  }
}

module.exports = { createOrder, getOrders, getOrderById }
