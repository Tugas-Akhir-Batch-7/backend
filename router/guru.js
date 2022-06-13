const router = require('express').Router();
const guruController = require('../controller/guru')
const { authentication, authorization } = require('../middlewares/auth');

router.get('/', (req, res) => {
    res.send('Guru')
})

// router.get('list-by-batch', guruController.getAllByBatch)

module.exports = router;