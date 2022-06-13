const mv = require('mv')
class validate {
    static async valid(image, folder){
        return new Promise((resolve, reject)=>{
            //filter tipe data
            if(!(image && /jpeg|jpg|png/.test(image.mimetype))) reject(`masukkan ${folder}`)
            //menyimpan data
            mv(
                `./public/-/${image.filename}`, 
                `./public/${folder}/${image.filename}`, 
                {clobber: false}, 
                (err) => { if (err) reject('gagal menyimpan gambar')}
            )
            resolve('berhasil')
        })
    }
}
module.exports = validate