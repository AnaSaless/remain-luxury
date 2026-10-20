require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes         = require('./routes/authRoutes')
const productRoutes      = require('./routes/productRoutes')
const favoriteRoutes     = require('./routes/favoriteRoutes')
const orderRoutes        = require('./routes/orderRoutes')
const reviewRoutes       = require('./routes/reviewRoutes')
const conversationRoutes = require('./routes/conversationRoutes')
const userRoutes         = require('./routes/userRoutes')

const app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads')))

app.use('/api/auth',          authRoutes)
app.use('/api/products',      productRoutes)
app.use('/api/favorites',     favoriteRoutes)
app.use('/api/orders',        orderRoutes)
app.use('/api/reviews',       reviewRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/users',        userRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Global error handler — catches multer errors and unhandled exceptions
// Must have 4 parameters for Express to recognize as error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ message: err.message })
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Arquivo muito grande. Máximo 5MB por imagem.' })
  }
  // Never expose internal error details
  res.status(500).json({ message: 'Erro interno do servidor' })
})

module.exports = app
