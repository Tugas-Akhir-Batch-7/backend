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
router.post('/guru/addPertemuan', multer, guru.addPertemuan)
router.get('/guru/daftarAbsensi', guru.daftarAbsensi)
router.post('/guru/prosesAbsensi', guru.prosesAbsensi)
router.get('/guru/daftarPertemuan', guru.daftarPertemuan)
router.get('/guru/daftarJadwalPertemuan', guru.daftarJadwalPertemuan)
router.get('/guru/daftarTugas', guru.daftarTugas)
router.get('/guru/daftarTugasMurid', guru.daftarTugasMurid)
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