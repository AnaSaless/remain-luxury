const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { getAll, getFeatured, getById, getByUser, getRelated, create, update, remove } = require('../controllers/productController')
const auth = require('../middlewares/auth')
const validateId = require('../middlewares/validateId')

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../src/uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(Object.assign(new Error('Apenas imagens JPEG, PNG ou WEBP são permitidas'), { code: 'INVALID_FILE_TYPE' }))
    }
  },
})

router.get('/',                          getAll)
router.get('/featured',                  getFeatured)
router.get('/user/:userId', validateId('userId'), getByUser)
router.get('/:id/related',  validateId(),          getRelated)
router.get('/:id',          validateId(),          getById)
router.post('/',            auth, upload.array('images', 5), create)
router.put('/:id',          validateId(), auth, upload.array('images', 5), update)
router.delete('/:id',       validateId(), auth, remove)

module.exports = router
