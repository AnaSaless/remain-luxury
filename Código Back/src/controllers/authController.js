const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

function safeUser(user) {
  const { password_hash, ...rest } = user
  return {
    ...rest,
    verified: !!rest.verified,
    verificationStatus: rest.verification_status || 'none',
    memberSince: rest.member_since,
    stats: { anuncios: 0, vendas: 0, avaliacao: 0, resposta: 0 },
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function register(req, res) {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos' })
  }
  if (!EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ message: 'Digite um e-mail válido' })
  }
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso' })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    )
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
    const token = generateToken(result.insertId)
    res.status(201).json({ user: safeUser(rows[0]), token })
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos' })
  }
  if (!EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ message: 'Digite um e-mail válido' })
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' })
    }
    const user = rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' })
    }
    const token = generateToken(user.id)
    res.json({ user: safeUser(user), token })
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' })
    const [[{ total: anuncios }]] = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE seller_id = ?', [req.userId]
    )
    const [[{ total: vendas }]] = await pool.query(
      'SELECT COUNT(*) as total FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id WHERE p.seller_id = ?',
      [req.userId]
    )
    const [[avgRow]] = await pool.query(
      'SELECT AVG(rating) as avg FROM reviews WHERE seller_id = ?', [req.userId]
    )
    const user = safeUser(rows[0])
    user.stats.anuncios = anuncios
    user.stats.vendas   = vendas
    user.stats.avaliacao = avgRow.avg ? Number(Number(avgRow.avg).toFixed(1)) : 0
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

async function requestVerification(req, res) {
  try {
    await pool.query(
      "UPDATE users SET verification_status = 'pending' WHERE id = ?",
      [req.userId]
    )
    res.json({ message: 'Solicitação de verificação enviada' })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao solicitar verificação' })
  }
}

async function verifyUser(req, res) {
  const { status } = req.body
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido' })
  }
  try {
    await pool.query(
      'UPDATE users SET verification_status = ?, verified = ? WHERE id = ?',
      [status, status === 'approved' ? 1 : 0, req.params.id]
    )
    res.json({ message: 'Status atualizado' })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao verificar usuário' })
  }
}

module.exports = { register, login, me, requestVerification, verifyUser }
