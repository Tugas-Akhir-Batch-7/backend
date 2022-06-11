//setup npm
const express = require('express')
const multer = require('multer')

//setup import
const user = require('../controller/user')
const admin = require('../controller/admin')
const guru = require('../controller/guru')
const murid = require('../controller/murid')

const userRoute = require('./user')
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
const multerImg = multer({ storage: storage }).fields([{name: 'profile'}, {name: 'ktp'}])


//user
router.post('/login', user.login)
router.post('/register', multerImg, user.register)
router.post('/registerOtp', user.createOtpRegister)
router.post('/resetOtp', user.createOtpReset)
router.post('/validResetOtp', user.validResetOtp)
router.post('/resetPassword', user.resetPassword)

router.use('/user', userRoute)
router.use('/auth/google', authGoogle)


module.exports = router