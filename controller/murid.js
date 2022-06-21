const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize } = require("../db/models");
const validFile = require('../middlewares/validate_file');
const {verify } = require("../helpers/jwt-auth")
const { Op } = require("sequelize");
// const ujiansubmission = require('../db/models/ujiansubmission');

//db
const Guru = db.Guru
const murid = db.Murid
const pertemuan = db.Pertemuan
const PertemuanFile = db.PertemuanFile
const absensi = db.Absensi
const ujianSubmit = db.UjianSubmission
const Tagihan = db.Tagihan
const Pembayaran = db.Pembayaran
const Ujian = db.Ujian
const Batch = db.Batch
const User = db.User
const UjianSubmission = db.UjianSubmission
const tugasSubmit = db.TugasSubmission




class Murid {
    static async dataUjian(req, res, next){
        try {            
            //ambil token
            const token = verify(req.headers.token)
            if(token.role != "murid") throw 'anda bukan murid'

            //ambil data
            const dataUjian = (await sequelize.query(`
                SELECT 
                    ujian.id,
                    ujian.name,
                    ujian.pengawas,
                    ujian_submission.score,
                    ujian_submission.id_ujian
                from
                    murid inner join ujian on murid.id_batch = ujian.id_batch and murid.id = ${token.id_murid}
                    left join ujian_submission ON murid.id = ujian_submission.id_murid and ujian.id = ujian_submission.id_ujian 
            `))[0]
            // mencari peringkat ujian
            for (let i = 0; i < dataUjian.length; i++) {
                dataUjian[i].peringkat = null
                const peringkat = await UjianSubmission.findAll({attributes:['score', 'id_murid'],order:[['score', 'DESC']], where:{id_ujian: dataUjian[i].id_ujian}})
                for (let x = 0; x < peringkat.length; x++) {
                    if(peringkat[x].id_murid == token.id_murid) dataUjian[i].peringkat = x+1
                }
            }
            
            res.json({
                success: true,
                message: 'menampilkan daftar ujian',
                data: dataUjian
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async dataAbsenMateri(req, res, next){
        try {            
            //ambil token
            const token = verify(req.headers.token)
            if(token.role != "murid") throw 'anda bukan murid'

            //ambil data
            const dataAbsen = (await sequelize.query(`
                SELECT 
                    pertemuan.name,
                    pertemuan.ket,
                    pertemuan.date,
                    absensi.id_murid,
                    absensi.id_pertemuan
                FROM
                    murid INNER JOIN pertemuan on murid.id_batch = pertemuan.id_batch AND murid.id = ${token.id_murid}
                    LEFT JOIN absensi on absensi.id_pertemuan = pertemuan.id 
            `))[0]
            for (let i = 0; i < dataAbsen.length; i++) {
                dataAbsen[i].file = []
                if(!dataAbsen[i].id_murid) continue
                dataAbsen[i].file.push(await PertemuanFile.findAll({where:{id_pertemuan:dataAbsen[i].id_pertemuan}}))
            }
            
            res.json({
                success: true,
                message: 'menampilkan daftar absensi',
                data: dataAbsen
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async listBatch(req, res, next){
        try {
            //get batch
            const result = await Batch.findAll({where:{start_date:{[Op.gt]: new Date()} }})

            res.json({
                success: true,
                message: 'daftar batch',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async addBatch(req, res, next){
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id batch'

            //ambil token
            const token = verify(req.headers.token)

            let cek = await murid.findOne({where:{id:token.id_murid}})
            console.log(cek)
            if(!cek) throw 'acount tidak ditemukan'
            if(!(cek.status == 'belum mendaftar' && cek.status == 'mendaftar')){
                if(cek.status == 'terdaftar') throw 'anda sudah mendaftar pada batch lain'
                if(cek.status == 'alumni' || cek.status == 'keluar') throw 'anda tidak bisa masuk batch kembali'
            }

            //update status murid
            const result = await murid.update({status: 'mendaftar', id_batch: id}, {where:{id: token.id_murid}})

            res.json({
                success: true,
                message: 'berhasil menambahkan batch',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async addTugas(req, res, next) {
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id tugas'
            if(!(req.body.link)) throw ApiError.badRequest("data tidak lengkap")

            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'anda bukan murid'

            //proses kirim ujian
            const result = tugasSubmit.create({
                id_tugas: id,
                id_murid: req.body.id,
                submit_date: new Date(),
                submit_link: req.body.link
            })
            
            res.json({
                success: true,
                message: 'berhasil mengirim tugas',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async addUjian(req, res, next) {
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id ujian'
            if(!(req.body.link)) throw ApiError.badRequest("data tidak lengkap")

            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'anda bukan murid'
            
            //proses kirim ujian
            const result = ujianSubmit.create({
                id_ujian: id,
                id_murid: token.id_murid,
                submit_date: new Date(),
                submit_link: req.body.link
            })

            res.json({
                success: true,
                message: 'berhasil mengirim ujian',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }

    static async getUjian(req, res, next) {
        try {
            const { id } = req.user
            console.log(id)
            // ambil ujian berdsarakan id batch murid
            // let muridGet = await murid.findOne({
            //     where: {
            //         id_user: id
            //     },
            //     attributes: [],
            //     // includeIgnoreAttributes: false,
            //     include: [{
            //         model: Batch,
            //         attributes: ['id'],
            //         include: [{
            //             model: Ujian,
            //             attributes: ['name', 'date'],
            //             include: [{
            //                 model: Guru,
            //                 attributes: ['id'],
            //                 include: [{
            //                     model: User,
            //                     attributes: ['name']
            //                 }]
            //             },
            //             {
            //                 model: UjianSubmission,
            //                 where : {
            //                     id_murid : id
            //                 }
            //             }
            //         ]
            //         }]
            //     }]
            // })
            let ujianSubmissionDetailsGet = await sequelize.query(`
            SELECT uj.name as ujian_name, us.name as guru_name, uj_sub.score as nilai, uj_sub.submit_date, uj_sub.score_rank 
            FROM ( select id_ujian,
                        id_murid,
                        submit_date,
                        score,
                        DENSE_RANK() OVER(PARTITION BY id_ujian ORDER 								BY score DESC) score_rank
            FROM ujian_submission ORDER BY id, score_rank) uj_sub
            JOIN ujian AS uj ON uj.id = uj_sub.id_ujian
            JOIN guru as g ON g.id = uj.id_guru
            JOIN users as us ON us.id = g.id_user
            WHERE id_murid = :id_murid;`,
            { replacements: { id_murid: id } }
            )
            // console.log(muridGet.toJSON())
            let result = ujianSubmissionDetailsGet[0]
            console.log(result)
            res.status(200).json({
                success: true,
                message: 'data detail ujian submission berhasil diambil',
                data: result
            })
            // console.log(muridGet.toJSON().Batch.Ujians[0].Guru.User)
            // console.log(muridGet.toJSON().Batch.Ujians[0])
        } catch (error) {
            next(error)
        }
    }

    static async getPiutang(req, res, next) {
        try {
            // res.send(req.user)
            let muridGet = await murid.findOne({
                where: {
                    id_user: req.user.id
                }
            })
            // return res.json(muridGet)
            let tagihan_aktif = await Tagihan.findOne({
                where: {
                    id_murid: muridGet.id,
                    is_lunas: false
                }
            })
            // let terbayar = await Pembayaran.findAll({
            //     where: {
            //         id_tagihan: tagihan_aktif.id
            //     }
            // })
            let terbayarQuery = await sequelize.query(`SELECT SUM(amount) AS terbayar FROM pembayaran
                WHERE id_tagihan = :id_tagihan`,
                {
                    replacements: { id_tagihan: tagihan_aktif.id },
                    // type: QueryTypes.SELECT
                }
            )
            const terbayar = terbayarQuery[0][0].terbayar
            const hutangPembayaran = tagihan_aktif.total_bill - terbayar

            // terbayarQuery = terbayarRaw[0][0].terbayar
            // console.log(terbayarRaw)
            // console.log(terbayar)
            // console.log(tagihan_aktif)
            // console.log(tagihan_aktif.toJSON())
            return res.status(200).json({
                message: 'berhasil',
                data: {
                    biayaTotal: tagihan_aktif.total_bill,
                    dp: tagihan_aktif.dp,
                    kekuranganBayar: hutangPembayaran,
                    // tenggatWaktu perlu didiskusikan
                }
            })
            let jumlahPiutang = await sequelize.query(``)
        } catch (error) {
            next(error)
        }
    }
}
module.exports = Murid