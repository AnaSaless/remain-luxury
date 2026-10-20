const pool = require('../config/db')
const path = require('path')
const fs   = require('fs')

async function buildProducts(rows) {
  if (rows.length === 0) return []
  const ids = rows.map(r => r.id)
  const [images] = await pool.query(
    `SELECT * FROM product_images WHERE product_id IN (${ids.map(() => '?').join(',')})`,
    ids
  )
  return rows.map(p => ({
    ...p,
    featured: !!p.featured,
    images: images
      .filter(img => img.product_id === p.id)
      .sort((a, b) => b.is_primary - a.is_primary)
      .map(img => img.url),
  }))
}

async function getAll(req, res) {
  try {
    const { categoria, marca, condicao, q, minPrice, maxPrice, orderBy } = req.query
    let sql = `
      SELECT p.*, u.name AS sellerName
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE 1=1
    `
    const params = []
    if (categoria) { sql += ' AND p.category = ?'; params.push(categoria) }
    if (marca)     { sql += ' AND p.brand = ?';    params.push(marca) }
    if (condicao)  { sql += ' AND p.condition = ?'; params.push(condicao) }
    if (minPrice)  { sql += ' AND p.price >= ?';   params.push(Number(minPrice)) }
    if (maxPrice)  { sql += ' AND p.price <= ?';   params.push(Number(maxPrice)) }
    if (q) {
      sql += ' AND (p.title LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)'
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    if (orderBy === 'price_asc')  sql += ' ORDER BY p.price ASC'
    else if (orderBy === 'price_desc') sql += ' ORDER BY p.price DESC'
    else sql += ' ORDER BY p.created_at DESC'

    const [rows] = await pool.query(sql, params)
    const products = await buildProducts(rows)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos' })
  }
}

async function getFeatured(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName
       FROM products p JOIN users u ON p.seller_id = u.id
       WHERE p.featured = 1
       ORDER BY p.created_at DESC LIMIT 6`
    )
    const products = await buildProducts(rows)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar destaques' })
  }
}

async function getById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName, u.id AS sellerId
       FROM products p JOIN users u ON p.seller_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' })
    const [products] = await buildProducts(rows)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produto' })
  }
}

async function getByUser(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName
       FROM products p JOIN users u ON p.seller_id = u.id
       WHERE p.seller_id = ?
       ORDER BY p.created_at DESC`,
      [req.params.userId]
    )
    const products = await buildProducts(rows)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos do usuário' })
  }
}

async function create(req, res) {
  const { title, brand, category, size, condition, price, description, featured } = req.body
  if (!title || !brand || !category || !size || !condition || !price) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' })
  }
  if (Number(price) <= 0) {
    return res.status(400).json({ message: 'O preço deve ser maior que zero' })
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO products (title, brand, category, size, \`condition\`, price, description, seller_id, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, brand, category, size, condition, Number(price), description || '', req.userId, featured ? 1 : 0]
    )
    const productId = result.insertId
    const files = req.files || []
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await pool.query(
          'INSERT INTO product_images (product_id, url, is_primary) VALUES (?, ?, ?)',
          [productId, `/uploads/${files[i].filename}`, i === 0 ? 1 : 0]
        )
      }
    } else {
      const placeholder = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(brand)}`
      await pool.query('INSERT INTO product_images (product_id, url, is_primary) VALUES (?, ?, 1)', [productId, placeholder])
    }
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?`,
      [productId]
    )
    const [product] = await buildProducts(rows)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar produto' })
  }
}

async function update(req, res) {
  const { id } = req.params
  try {
    const [ownership] = await pool.query('SELECT seller_id FROM products WHERE id = ?', [id])
    if (ownership.length === 0) return res.status(404).json({ message: 'Produto não encontrado' })
    if (ownership[0].seller_id !== req.userId) return res.status(403).json({ message: 'Sem permissão' })

    const { title, brand, category, size, condition, price, description, featured } = req.body
    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({ message: 'O preço deve ser maior que zero' })
    }
    await pool.query(
      `UPDATE products SET title=?, brand=?, category=?, size=?, \`condition\`=?, price=?, description=?, featured=? WHERE id=?`,
      [title, brand, category, size, condition, Number(price), description || '', featured ? 1 : 0, id]
    )

    const files = req.files || []
    // Accept URL array from JSON body for admin/seed use
    const imageUrls = req.body.imageUrls
      ? (Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls])
      : []

    if (files.length > 0 || imageUrls.length > 0) {
      const [oldImgs] = await pool.query('SELECT url FROM product_images WHERE product_id = ?', [id])
      await pool.query('DELETE FROM product_images WHERE product_id = ?', [id])
      for (const img of oldImgs) {
        if (img.url.startsWith('/uploads/')) {
          const p = path.join(__dirname, '../../src/uploads', path.basename(img.url))
          if (fs.existsSync(p)) fs.unlinkSync(p)
        }
      }
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await pool.query(
            'INSERT INTO product_images (product_id, url, is_primary) VALUES (?, ?, ?)',
            [id, `/uploads/${files[i].filename}`, i === 0 ? 1 : 0]
          )
        }
      } else {
        for (let i = 0; i < imageUrls.length; i++) {
          await pool.query(
            'INSERT INTO product_images (product_id, url, is_primary) VALUES (?, ?, ?)',
            [id, imageUrls[i], i === 0 ? 1 : 0]
          )
        }
      }
    }

    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?`,
      [id]
    )
    const [product] = await buildProducts(rows)
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar produto' })
  }
}

async function getRelated(req, res) {
  try {
    const [productRows] = await pool.query(
      'SELECT category FROM products WHERE id = ?',
      [req.params.id]
    )
    if (productRows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' })
    const { category } = productRows[0]
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS sellerName
       FROM products p JOIN users u ON p.seller_id = u.id
       WHERE p.category = ? AND p.id != ?
       ORDER BY p.created_at DESC LIMIT 4`,
      [category, req.params.id]
    )
    const products = await buildProducts(rows)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos relacionados' })
  }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    const [ownership] = await pool.query('SELECT seller_id FROM products WHERE id = ?', [id])
    if (ownership.length === 0) return res.status(404).json({ message: 'Produto não encontrado' })
    if (ownership[0].seller_id !== req.userId) return res.status(403).json({ message: 'Sem permissão' })
    await pool.query('DELETE FROM products WHERE id = ?', [id])
    res.json({ message: 'Produto removido' })
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover produto' })
  }
}

module.exports = { getAll, getFeatured, getById, getByUser, getRelated, create, update, remove }
