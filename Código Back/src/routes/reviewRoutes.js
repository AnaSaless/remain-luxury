const express = require('express')
const router = express.Router()
const { createReview, getSellerReviews, updateReview, deleteReview } = require('../controllers/reviewController')
const auth = require('../middlewares/auth')
const validateId = require('../middlewares/validateId')

router.post('/',                          auth, createReview)
router.get('/seller/:sellerId', validateId('sellerId'), getSellerReviews)
router.put('/:id',  validateId(), auth, updateReview)
router.delete('/:id', validateId(), auth, deleteReview)

module.exports = router
