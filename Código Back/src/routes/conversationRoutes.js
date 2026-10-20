const express = require('express')
const router = express.Router()
const { createConversation, getConversations, getMessages, sendMessage } = require('../controllers/conversationController')
const auth = require('../middlewares/auth')
const validateId = require('../middlewares/validateId')

router.post('/',                   auth, createConversation)
router.get('/',                    auth, getConversations)
router.get('/:id/messages',  validateId(), auth, getMessages)
router.post('/:id/messages', validateId(), auth, sendMessage)

module.exports = router
