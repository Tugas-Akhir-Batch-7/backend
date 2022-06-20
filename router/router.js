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
router.get('/guru/listAnggotaBatch/:id', guru.listAnggotaBatch)
router.get('/guru/accAnggotaBatch/:id', guru.accAnggotaBatch)
router.put('/guru/updateBatch/:id', guru.updateBatch)
router.delete('/guru/deleteBatch/:id', guru.deleteBatch)

//pertemuan
router.post('/guru/addPertemuan/', multer, guru.addPertemuan)
router.get('/guru/listPertemuan', guru.listPertemuan)
router.get('/guru/listJadwalPertemuan', guru.listJadwalPertemuan) 
router.put('/guru/updatePertemuan/:id', guru.updatePertemuan)
router.delete('/guru/deletePertemuan/:id', guru.deletePertemuan)

//tugas
router.get('/guru/listTugas/:id', guru.listTugas)
router.get('/guru/listTugasSubmit/:id', guru.listTugasSubmit)
router.post('/guru/addTugas/:id', guru.addTugas)
router.put('/guru/updateTugas/:id', guru.updateTugas)
router.delete('/guru/deleteTugas/:id', guru.deleteTugas)

//absensi
router.get('/guru/listAbsensi/:id', guru.listAbsensi)
router.post('/guru/prosesAbsensi/:id', guru.prosesAbsensi)

//ujian
router.get('/guru/listUjian/:id', guru.listUjian)
router.get('/guru/listUjianSubmit/:id', guru.listUjianSubmit)
router.post('/guru/addUjian/:id', guru.addUjian)

router.post('/guru/addScoreTugas', guru.addScoreTugas)
router.get('/guru/getPesertaUjian', guru.getPesertaUjian)
router.post('/guru/addScoreUjian', guru.addScoreUjian)

//murid
router.get('/murid/dataUjian', murid.dataUjian)
router.get('/murid/dataAbsenMateri', murid.dataAbsenMateri)
router.post('/murid/addTugas/:id', murid.addTugas)
router.post('/murid/addUjian/:id', murid.addUjian)

router.get('/murid/listBatch', murid.listBatch)
router.get('/murid/addBatch/:id', murid.addBatch)

router.use('/user', userRoute)
router.use('/admin', adminRoute)
// router.use('/guru', guruRoute)
router.use('/murid', muridRoute)


router.use('/auth/google', authGoogle)


module.exports = router