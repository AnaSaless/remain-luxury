const express = require('express')
const router = express.Router()
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController')
const auth = require('../middlewares/auth')
const validateId = require('../middlewares/validateId')

router.post('/',    auth,           createOrder)
router.get('/',     auth,           getOrders)
router.get('/:id',  validateId(), auth, getOrderById)

module.exports = router
