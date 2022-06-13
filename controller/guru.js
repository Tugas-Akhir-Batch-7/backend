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
            let file = []
            for (let i = 0; i < req.files.file.length; i++) {
                const el =  req.files.file[i]    
                await validFile.validImg(el, 'upload')
                file.push(el.filename)
            }
            let date = req.body.date || new Date()

            //kirim data pertemuan ke database
            let result = await pertemuan.create({
                id_guru: req.body.id,
                id_batch: req.body.batch,
                name: req.body.name,
                date,
                upload: {
                    file: file || null,
                    text: req.body.pesan || null,
                    link: req.body.link || null,
                }
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
            let data = await pertemuan.findAll({
                attributes:['id','id_batch','name','date','upload'],
                where:{id_guru:req.body.id},
                order:[['date', 'desc']]
            })
            
            res.json(data)
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
            let idBatch = await pertemuan.findOne({where:{id:req.body.pertemuan}})
            if(!idBatch) throw ApiError.badRequest("pertemuan tidak ada")
            idBatch = idBatch.id

            // ambil daftar murid
            let daftarMurid = await sequelize.query(`
                SELECT users.name, murid.id
                FROM murid INNER JOIN users ON murid.id_user = users.id
                WHERE murid.status = 'terdaftar' AND murid.id_batch = '${idBatch}'
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
