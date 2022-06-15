const router = require('express').Router();
const murid = require('../controller/murid')
const { authentication, authorization } = require('../middlewares/auth');

router.get('/', (req, res) => {
    res.send('Murid')
})

router.get('/get-ujian', authentication, authorization('murid'), murid.getUjian)
router.get('/get-piutang', authentication, authorization('murid'), murid.getPiutang)

module.exports = router;