const pool = require('../config/db')

async function addFavorite(req, res) {
  try {
    const [prod] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.productId])
    if (prod.length === 0) return res.status(404).json({ message: 'Produto não encontrado' })

    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
      [req.userId, req.params.productId]
    )
    res.json({ favorited: true })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao favoritar' })
  }
}

async function removeFavorite(req, res) {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.userId, req.params.productId]
    )
    res.json({ favorited: false })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao desfavoritar' })
  }
}

async function checkFavorite(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.userId, req.params.productId]
    )
    res.json({ favorited: rows.length > 0 })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao verificar favorito' })
  }
}

async function getFavorites(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       JOIN users u ON p.seller_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.userId]
    )
    if (rows.length === 0) return res.json([])
    const ids = rows.map(r => r.id)
    const [images] = await pool.query(
      `SELECT * FROM product_images WHERE product_id IN (${ids.map(() => '?').join(',')})`,
      ids
    )
    const products = rows.map(p => ({
      ...p,
      featured: !!p.featured,
      images: images
        .filter(img => img.product_id === p.id)
        .sort((a, b) => b.is_primary - a.is_primary)
        .map(img => img.url),
    }))
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar favoritos' })
  }
}

module.exports = { addFavorite, removeFavorite, checkFavorite, getFavorites }
