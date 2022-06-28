const router = require('express').Router();
const adminController = require('../controller/admin')
const { authentication, authorization } = require('../middlewares/auth');

router.get('/', (req, res) => {
    res.send('Admin')
})

const adminMiddlewares = [authentication, authorization('admin')]
router.use(adminMiddlewares)

// /list-by-role/?role=admin
router.get('/list-by-role', adminController.getAllByRole)

router.get('/guru', adminController.getAllGuru)
router.get('/murid', adminController.getAllMurid)

router.get('/list-tagihan', adminController.getAllTagihan)
router.post('/create-tagihan', adminController.createTagihan)
router.put('/update-tagihan/:id', adminController.updateTagihan)
router.get('/detail-tagihan/:id', adminController.detailTagihan)
// router.delete('/delete-tagihan/:id', adminController.createTagihan)

router.post('/create-pembayaran/:id_tagihan', adminController.createPembayaran)
router.get('/list-pembayaran', adminController.getAllPembayaran)






module.exports = router;