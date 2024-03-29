const mv = require('mv')
const sharp = require('sharp')
class validate {
    //profile
    static async validProfile(image){
        return new Promise((resolve, reject)=>{
            //filter tipe data
            if(!(image && /jpeg|jpg|png/.test(image.mimetype))) reject(`masukkan profile`)
            sharp(`./public/-/${image.filename}`)
                .resize(200,200)
                .toFile(`./public/img-profile/${image.filename}`)
                .then( data => {resolve(image.filename)})
                .catch( err => {reject(['gagal menyimpan gambar', err])})
        })
    }
    //ktp
    static async validKtp(image){
        return new Promise((resolve, reject)=>{
            //filter tipe data
            if(!(image && /jpeg|jpg|png/.test(image.mimetype))) reject(`masukkan ktp`)
            console.log(image)
            console.log(image.mimetype)
            sharp(`./public/-/${image.filename}`)
                .toFile(`./public/img-ktp/${image.filename}`)
                .then( data => {resolve(image.filename)})
                .catch( err => {reject(['gagal menyimpan gambar', err])})
        })
    }
    static async validFile(file, folder){
        return new Promise((resolve, reject)=>{
            //filter tipe data
            if(file && /jpeg|jpg|png/.test(file.mimetype)) {
                sharp(`./public/-/${file.filename}`)
                    .toFile(`./public/${folder}/${file.filename}`)
                    .then( data => {resolve(file.filename)})
                    .catch( err => {reject(['gagal menyimpan gambar', err])})
            }else{
                // menyimpan data
                mv(
                    `./public/-/${file.filename}`, 
                    `./public/${folder}/${file.filename}`, 
                    {clobber: false}, 
                    (err) => { if (err) reject('gagal menyimpan gambar')}
                )
                resolve(file.filename)
            }
        })
    }
}
module.exports = validate