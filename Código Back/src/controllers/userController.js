const pool = require('../config/db')

async function getPublicProfile(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, name, bio, location, member_since, verified, verification_status
       FROM users WHERE id = ?`,
      [req.params.id]
    )
    if (users.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' })
    const u = users[0]

    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName
       FROM products p JOIN users u ON p.seller_id = u.id
       WHERE p.seller_id = ? ORDER BY p.created_at DESC`,
      [req.params.id]
    )

    let listings = []
    if (rows.length > 0) {
      const ids = rows.map(r => r.id)
      const [images] = await pool.query(
        `SELECT * FROM product_images WHERE product_id IN (${ids.map(() => '?').join(',')})`,
        ids
      )
      listings = rows.map(p => ({
        ...p,
        featured: !!p.featured,
        images: images
          .filter(img => img.product_id === p.id)
          .sort((a, b) => b.is_primary - a.is_primary)
          .map(img => img.url),
      }))
    }

    res.json({ ...u, listings })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar perfil' })
  }
}

async function deleteMe(req, res) {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.userId])
    res.json({ message: 'Conta excluída com sucesso' })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir conta' })
  }
}

module.exports = { getPublicProfile, deleteMe }
