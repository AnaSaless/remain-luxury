const pool = require('../config/db')

async function createReview(req, res) {
  const { seller_id, product_id, rating, comment } = req.body
  if (!seller_id || !rating) {
    return res.status(400).json({ message: 'Informe o vendedor e a nota' })
  }
  const numRating = Number(rating)
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Nota deve ser um número inteiro entre 1 e 5' })
  }
  if (Number(seller_id) === req.userId) {
    return res.status(400).json({ message: 'Você não pode avaliar a si mesmo' })
  }
  try {
    if (product_id) {
      const [existing] = await pool.query(
        'SELECT id FROM reviews WHERE reviewer_id = ? AND product_id = ?',
        [req.userId, product_id]
      )
      if (existing.length > 0) return res.status(409).json({ message: 'Você já avaliou este produto' })
    }
    const [result] = await pool.query(
      'INSERT INTO reviews (reviewer_id, seller_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [req.userId, seller_id, product_id || null, numRating, comment || null]
    )
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.id = ?`,
      [result.insertId]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar avaliação' })
  }
}

async function getSellerReviews(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.seller_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.sellerId]
    )
    const avg = rows.length > 0
      ? Number((rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1))
      : null
    res.json({ average: avg, count: rows.length, reviews: rows })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar avaliações' })
  }
}

async function updateReview(req, res) {
  const { id } = req.params
  const { rating, comment } = req.body
  const numRating = Number(rating)
  if (rating !== undefined && (!Number.isInteger(numRating) || numRating < 1 || numRating > 5)) {
    return res.status(400).json({ message: 'Nota deve ser um número inteiro entre 1 e 5' })
  }
  try {
    const [rows] = await pool.query('SELECT reviewer_id FROM reviews WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Avaliação não encontrada' })
    if (Number(rows[0].reviewer_id) !== Number(req.userId)) return res.status(403).json({ message: 'Sem permissão' })

    await pool.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [numRating, comment ?? null, id]
    )
    const [updated] = await pool.query(
      `SELECT r.*, u.name AS reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.id = ?`,
      [id]
    )
    res.json(updated[0])
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar avaliação' })
  }
}

async function deleteReview(req, res) {
  const { id } = req.params
  try {
    const [rows] = await pool.query('SELECT reviewer_id FROM reviews WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Avaliação não encontrada' })
    if (Number(rows[0].reviewer_id) !== Number(req.userId)) return res.status(403).json({ message: 'Sem permissão' })
    await pool.query('DELETE FROM reviews WHERE id = ?', [id])
    res.json({ message: 'Avaliação removida' })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover avaliação' })
  }
}

module.exports = { createReview, getSellerReviews, updateReview, deleteReview }
