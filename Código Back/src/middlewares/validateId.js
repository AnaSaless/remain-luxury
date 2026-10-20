// Rejects requests where :param is not a positive integer
function validateId(param = 'id') {
  return (req, res, next) => {
    const val = req.params[param]
    if (!/^\d+$/.test(val) || Number(val) < 1) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    next()
  }
}

module.exports = validateId
