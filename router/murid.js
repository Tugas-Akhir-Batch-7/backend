const router = require('express').Router();
const murid = require('../controller/murid')
const { authentication, authorization } = require('../middlewares/auth');

// router.get('/', (req, res) => {
//     res.send('Murid')
// })

const muridMiddlewares = [authentication, authorization('murid')]
router.use(muridMiddlewares)

router.get('/get-ujian', murid.getUjian)
router.get('/get-piutang', murid.getPiutang)

module.exports = router;