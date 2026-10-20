const pool = require('../config/db')

async function createConversation(req, res) {
  const { seller_id, product_id } = req.body
  if (!seller_id) return res.status(400).json({ message: 'seller_id é obrigatório' })
  if (Number(seller_id) === req.userId) {
    return res.status(400).json({ message: 'Você não pode conversar com você mesmo' })
  }
  try {
    const prodId = product_id || null
    const [existing] = await pool.query(
      'SELECT id FROM conversations WHERE buyer_id = ? AND seller_id = ? AND (product_id = ? OR (product_id IS NULL AND ? IS NULL))',
      [req.userId, seller_id, prodId, prodId]
    )
    if (existing.length > 0) return res.json(existing[0])

    const [result] = await pool.query(
      'INSERT INTO conversations (buyer_id, seller_id, product_id) VALUES (?, ?, ?)',
      [req.userId, seller_id, prodId]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar conversa' })
  }
}

async function getConversations(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*,
        b.name AS buyer_name,
        s.name AS seller_name,
        p.title AS product_title,
        p.brand  AS product_brand,
        pi.url   AS product_image,
        (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_message_at
       FROM conversations c
       JOIN users b ON c.buyer_id  = b.id
       JOIN users s ON c.seller_id = s.id
       LEFT JOIN products p ON c.product_id = p.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE c.buyer_id = ? OR c.seller_id = ?
       ORDER BY c.created_at DESC`,
      [req.userId, req.userId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar conversas' })
  }
}

async function getMessages(req, res) {
  try {
    const [conv] = await pool.query('SELECT * FROM conversations WHERE id = ?', [req.params.id])
    if (conv.length === 0) return res.status(404).json({ message: 'Conversa não encontrada' })
    if (conv[0].buyer_id !== req.userId && conv[0].seller_id !== req.userId) {
      return res.status(403).json({ message: 'Sem permissão' })
    }
    const [msgs] = await pool.query(
      `SELECT m.*, u.name AS sender_name
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [req.params.id]
    )
    res.json(msgs)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar mensagens' })
  }
}

async function sendMessage(req, res) {
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ message: 'Mensagem não pode ser vazia' })
  try {
    const [conv] = await pool.query('SELECT * FROM conversations WHERE id = ?', [req.params.id])
    if (conv.length === 0) return res.status(404).json({ message: 'Conversa não encontrada' })
    if (conv[0].buyer_id !== req.userId && conv[0].seller_id !== req.userId) {
      return res.status(403).json({ message: 'Sem permissão' })
    }
    const [result] = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)',
      [req.params.id, req.userId, text.trim()]
    )
    const [rows] = await pool.query(
      `SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
      [result.insertId]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Erro ao enviar mensagem' })
  }
}

module.exports = { createConversation, getConversations, getMessages, sendMessage }
