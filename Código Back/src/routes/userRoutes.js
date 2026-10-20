const express = require('express')
const router = express.Router()
const { getPublicProfile, deleteMe } = require('../controllers/userController')
const validateId = require('../middlewares/validateId')
const auth = require('../middlewares/auth')

router.delete('/me', auth, deleteMe)
router.get('/:id',   validateId(), getPublicProfile)

module.exports = router
