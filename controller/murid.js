const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize } = require("../db/models");
const validFile = require('../middlewares/validate_file');
// const ujiansubmission = require('../db/models/ujiansubmission');

//db
const Guru = db.Guru
const murid = db.Murid
const pertemuan = db.Pertemuan
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
    static async cekMurid(id, pass) {
        let cek = await sequelize.query(`
            SELECT * FROM murid INNER JOIN users ON murid.id_user = users.id 
            WHERE murid.id = '${id}' AND users.password = '${pass}'
        `)
        return cek[1].rowCount == true
    }
    // ambil materi pertemuan
    static async getPertemuan(req, res, next) {
        try {
            //validasi
            if (!(req.body.id && req.body.password && await Murid.cekMurid(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")

            //ambil data absensi
            let dataAbsen = await sequelize.query(`
                SELECT 
                    pertemuan.name AS materi,
                    pertemuan.ket, 
                    pertemuan.file, 
                    pertemuan.date, 
                    absensi.id_pertemuan as absen, 
                    murid.id, 
                    pertemuan.id
                FROM 
                    murid INNER JOIN pertemuan ON murid.id_batch = pertemuan.id_batch AND murid.id = ${req.body.id}
                    LEFT JOIN absensi ON absensi.id_pertemuan = pertemuan.id
                ORDER BY pertemuan.date DESC
            `)

            // mengubah file
            for (let i = 0; i < dataAbsen[0].length; i++) {
                if (dataAbsen[0][i].absen == null) {
                    dataAbsen[0][i].file = null
                }
            }
            res.json(['berhasil', dataAbsen[0]])
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async addTugas(req, res, next) {
        try {
            //validasi
            if (!(req.body.id && req.body.password && await Murid.cekMurid(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.tugas && req.body.link)) throw ApiError.badRequest("data tidak lengkap")
            if((await sequelize.query(`
                SELECT * 
                FROM 
                    tugas inner join pertemuan on tugas.id_pertemuan = pertemuan.id and tugas.id = ${req.body.tugas}
                    inner join murid on murid.id_batch = pertemuan.id_batch and murid.id = ${req.body.id} and murid.status = 'terdaftar'
            `))[1].rowCount == 0) throw ApiError.badRequest("data tidak valid")

            //proses kirim ujian
            tugasSubmit.create({
                id_tugas: req.body.tugas,
                id_murid: req.body.id,
                submit_date: new Date(),
                submit_link: req.body.link
            })

            res.json('berhasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async addUjian(req, res, next) {
        try {
            //validasi
            if (!(req.body.id && req.body.password && await Murid.cekMurid(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.ujian && req.body.link)) throw ApiError.badRequest("data tidak lengkap")
            if((await sequelize.query(`
                SELECT * 
                FROM ujian INNER JOIN murid ON ujian.id_batch = murid.id_batch AND ujian.id = '${req.body.ujian}' AND murid.id = '${req.body.id}' AND murid.status = 'terdaftar' AND ujian.date + ujian.time >= now()
            `))[1].rowCount == 0) throw ApiError.badRequest("data tidak valid")

            //proses kirim ujian
            ujianSubmit.create({
                id_ujian: req.body.ujian,
                id_murid: req.body.id,
                submit_date: new Date(),
                submit_link: req.body.link
            })

            res.json('berhasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
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