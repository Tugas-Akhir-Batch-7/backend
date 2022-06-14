//setup npm
const express = require('express')
const multer = require('multer')

//setup import
const user = require('../controller/user')
const admin = require('../controller/admin')
const guru = require('../controller/guru')
const murid = require('../controller/murid')

const userRoute = require('./user')
const adminRoute = require('./admin')
// const guruRoute = require('./guru')
// const muridRoute = require('./murid')

const authGoogle = require('./google')

const router = express.Router()


//konfigurasi multer
const storage = multer.diskStorage({
    //letak file
    destination: function (req, file, cb) {
      cb(null, 'public/-')
    },
    //format penulisan file
    filename: function (req, file, cb) {
      cb(null, new Date().getTime() + '-' +file.originalname)
    }
})
const multerImg = multer({ storage: storage }).fields([{name: 'profile', maxCount: 1}, {name: 'ktp', maxCount: 1}, {name: 'file', maxCount: 10}])


//user
router.post('/login', user.login)
router.post('/register', multerImg, user.register)
router.post('/registerOtp', user.createOtpRegister)
router.post('/resetOtp', user.createOtpReset)
router.post('/validResetOtp', user.validResetOtp)
router.post('/resetPassword', user.resetPassword)

//guru
router.post('/guru/addPertemuan', multerImg, guru.addPertemuan)
router.get('/guru/daftarAbsensi', guru.daftarAbsensi)
router.post('/guru/prosesAbsensi', guru.prosesAbsensi)
router.get('/guru/daftarPertemuan', guru.daftarPertemuan)
router.get('/guru/daftarJadwalPertemuan', guru.daftarJadwalPertemuan)

//murid
router.get('/murid/data', murid.data)

router.use('/user', userRoute)
router.use('/admin', adminRoute)
// router.use('/guru', guruRoute)
// router.use('/murid', muridRoute)


router.use('/auth/google', authGoogle)


module.exports = router