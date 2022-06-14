const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize } = require("../db/models");
const validFile = require('../middlewares/validate_file')

//db
const guru = db.Guru
const murid = db.Murid
const pertemuan = db.Pertemuan
const absensi = db.Absensi

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
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.name && req.body.batch)) throw ApiError.badRequest("data tidak lengkap")

            //menyimpan file
            let ket = req.body.ket || null
            let date = req.body.date || new Date()
            let cat = req.body.catatan || []
            let file = []
            for (let i = 0; i < req.files.file.length; i++) {
                const el =  req.files.file[i]
                await validFile.validImg(el, 'upload')
                file.push([el.filename, cat[i]])
            }

            //kirim data pertemuan ke database
            let result = await pertemuan.create({
                id_guru: req.body.id,
                id_batch: req.body.batch,
                name: req.body.name,
                ket,
                date,
                file,
            })
            
            res.json({status:'berhasil',idPertemuan:result.id})
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async daftarPertemuan(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")

            //ambil data
            let data = await sequelize.query(`
            SELECT 
                batch.name AS "name batch",
                pertemuan.name AS "name pertemuan",
                pertemuan.ket AS "keterangan",
                pertemuan.file AS "file",
                pertemuan.date AS "date",
                guru.id AS "id guru",
                batch.id AS "id batch",
                pertemuan.id AS "id pertemuan"
            FROM guru INNER JOIN batch ON guru.id = batch.id_guru AND guru.id = '${req.body.id}' 
            INNER JOIN pertemuan ON batch.id = pertemuan.id_batch
        `)
            
            res.json(data[0])
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async daftarJadwalPertemuan(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")

            //ambil data
            let data = await sequelize.query(`
            SELECT 
                batch.name AS "name batch",
                pertemuan.name AS "name pertemuan",
                pertemuan.ket AS "keterangan",
                pertemuan.file AS "file",
                pertemuan.date AS "date",
                pertemuan.id_guru AS "id guru",
                batch.id AS "id batch",
                pertemuan.id AS "id pertemuan"
            FROM batch INNER JOIN pertemuan ON batch.id = pertemuan.id_batch AND pertemuan.id_guru = '${req.body.id}'
        `)
            
            res.json(data[0])
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }

    static async daftarAbsensi(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.pertemuan)) throw ApiError.badRequest("data tidak lengkap")

            //cari id batch
            let idBatch = await pertemuan.findOne({where:{id:req.body.pertemuan, id_guru:req.body.id}})
            if(!idBatch) throw ApiError.badRequest("pertemuan tidak ada")
            console.log(idBatch)
            idBatch = idBatch.id_batch

            // ambil daftar murid
            let daftarMurid = await sequelize.query(`
                SELECT users.name, murid.id
                FROM murid INNER JOIN users ON murid.id_user = users.id AND murid.status = 'terdaftar' AND murid.id_batch = '${idBatch}'
            `)

            res.json(daftarMurid[0])
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async prosesAbsensi(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.pertemuan && req.body.idMurid)) throw ApiError.badRequest("data tidak lengkap / masukkan minimal 1 murid")

            //olah data absensi
            let idMurid = req.body.idMurid.split('|')
            idMurid.forEach(el => {
                absensi.create({id_murid:el, id_pertemuan:req.body.pertemuan})
                console.log({id_murid:el, id_pertemuan:req.body.pertemuan})
            });

            res.send('berhasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
}
module.exports = Guru
