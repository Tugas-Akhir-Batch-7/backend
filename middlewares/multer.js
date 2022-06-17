const multer = require('multer')
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
const multerImg = multer({ storage: storage }).fields([
    {name: 'profile', maxCount: 1}, 
    {name: 'ktp', maxCount: 1}, 
    {name: 'file', maxCount: 10}
])
module.exports = multerImg