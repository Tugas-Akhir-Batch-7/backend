const router = require('express').Router();
const murid = require('../controller/murid')
const { authentication, authorization } = require('../middlewares/auth');

router.get('/', (req, res) => {
    res.send('Murid')
})

module.exports = router;