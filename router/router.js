//setup npm
const express = require('express')

//setup import
const user = require('../controller/user')
const admin = require('../controller/admin')
const guru = require('../controller/guru')
const murid = require('../controller/murid')

const userRoute = require('./user')
const adminRoute = require('./admin')
// const guruRoute = require('./guru')
const muridRoute = require('./murid')

const authGoogle = require('./google')
//midleware
const multer = require('../middlewares/multer')

const router = express.Router()



//user
router.post('/login', user.login)
router.post('/register', multer, user.register)
router.post('/registerOtp', user.createOtpRegister)
router.post('/resetOtp', user.createOtpReset)
router.post('/validResetOtp', user.validResetOtp)
router.post('/resetPassword', user.resetPassword)

//guru
router.post('/guru/addBatch', guru.addBatch)
router.get('/guru/listBatch', guru.listBatch)
router.put('/guru/updateBatch/:id', guru.updateBatch)
router.delete('/guru/deleteBatch/:id', guru.deleteBatch)

router.post('/guru/addPertemuan/', multer, guru.addPertemuan)
router.get('/guru/listPertemuan', guru.listPertemuan)
router.get('/guru/listJadwalPertemuan', guru.listJadwalPertemuan)
router.get('/guru/detailPertemuan/:id', guru.detailPertemuan)
router.put('/guru/updatePertemuan/:id', guru.updatePertemuan)
router.delete('/guru/deletePertemuan/:id', guru.deletePertemuan)

router.get('/guru/listAbsensi', guru.listAbsensi)
router.post('/guru/prosesAbsensi', guru.prosesAbsensi)
router.get('/guru/listTugas', guru.listTugas)
router.get('/guru/listTugasMurid', guru.listTugasMurid)
router.post('/guru/addScoreTugas', guru.addScoreTugas)
router.post('/guru/addUjian', guru.addUjian)
router.get('/guru/getUjian', guru.getUjian)
router.get('/guru/getPesertaUjian', guru.getPesertaUjian)
router.post('/guru/addScoreUjian', guru.addScoreUjian)

//murid
router.get('/murid/getPertemuan', murid.getPertemuan)
router.post('/murid/addTugas', murid.addTugas)
router.post('/murid/addUjian', murid.addUjian)

router.use('/user', userRoute)
router.use('/admin', adminRoute)
// router.use('/guru', guruRoute)
router.use('/murid', muridRoute)


router.use('/auth/google', authGoogle)


module.exports = router