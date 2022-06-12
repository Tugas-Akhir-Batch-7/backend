const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize } = require("../db/models");
const validFile = require('../middlewares/validate_file')

//db
const guru = db.Guru
const murid = db.Murid
const pertemuan = db.Pertemuan
const absensi = db.Absensi

class Murid{
    static async cekMurid(id, pass){
        let cek = await sequelize.query(`
            SELECT * FROM murid INNER JOIN users ON murid.id_user = users.id 
            WHERE murid.id = '${id}' AND users.password = '${pass}'
        `)
        return cek[1].rowCount == true
    }
    static async data(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Murid.cekMurid(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")

            //ambil data absensi
            let dataAbsen = await sequelize.query(`
                SELECT pertemuan.name AS materi, (pertemuan.upload), pertemuan.date, absensi.id_pertemuan as absen, murid.id, pertemuan.id
                FROM murid INNER JOIN absensi ON absensi.id_murid = murid.id AND murid.id = ${req.body.id} RIGHT JOIN pertemuan ON absensi.id_pertemuan = pertemuan.id
            `)

            //mengubah file
            for (let i = 0; i < dataAbsen[0].length; i++) {
                if(dataAbsen[0][i].absen == null){
                    dataAbsen[0][i].upload.file = null
                }
            }
            res.json(['berhasil', dataAbsen[0]])
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
}
module.exports = Murid