const express = require('express')
const router = express.Router()
const { addFavorite, removeFavorite, checkFavorite, getFavorites } = require('../controllers/favoriteController')
const auth = require('../middlewares/auth')
const validateId = require('../middlewares/validateId')

router.get('/',                                          auth, getFavorites)
router.get('/:productId/check', validateId('productId'), auth, checkFavorite)
router.post('/:productId',      validateId('productId'), auth, addFavorite)
router.delete('/:productId',    validateId('productId'), auth, removeFavorite)

module.exports = router
