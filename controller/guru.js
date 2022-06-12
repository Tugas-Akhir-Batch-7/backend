const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize } = require("../db/models");
const validFile = require('../middlewares/validate_file')

//db
const guru = db.Guru
const pertemuan = db.pertemuan

class Guru{
    static async cekGuru(id, pass){
        let cek = await sequelize.query(`
            SELECT * FROM guru INNER JOIN users ON guru.id_user = users.id 
            WHERE guru.id = '${id}' AND users.password = '${pass}'
        `)
        return cek[1].rowCount == true
    }
    static async addPertemuan(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && req.body.batch && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.name)) throw ApiError.badRequest("masukkan nama pertemuan")

            //menyimpan file
            let file = []
            for (let i = 0; i < req.files.file.length; i++) {
                const el =  req.files.file[i]    
                await validFile.validImg(el, 'upload')
                file.push(el.filename)
            }

            //kirim data pertemuan ke database
            pertemuan.create({
                id_guru: req.body.id,
                id_batch: req.body.batch,
                name: req.body.name,
                date: new Date(),
                upload: {
                    file: file || null,
                    text: req.body.pesan || null,
                    link: req.body.link || null,
                }
            })
            
            res.send('berhasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
}
module.exports = Guru