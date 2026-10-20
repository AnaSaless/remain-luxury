const express = require('express')
const router = express.Router()
const { register, login, me, requestVerification, verifyUser } = require('../controllers/authController')
const auth = require('../middlewares/auth')
const validateId = require('../middlewares/validateId')

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, me)
router.post('/request-verification', auth, requestVerification)
router.put('/:id/verify', validateId(), verifyUser)

module.exports = router
