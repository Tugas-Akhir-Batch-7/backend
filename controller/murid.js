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
const Tagihan = db.Tagihan
const Pembayaran = db.Pembayaran
const Ujian = db.Ujian
const Batch = db.Batch
const User = db.User
const UjianSubmission = db.UjianSubmission




class Murid {
    static async cekMurid(id, pass) {
        let cek = await sequelize.query(`
            SELECT * FROM murid INNER JOIN users ON murid.id_user = users.id 
            WHERE murid.id = '${id}' AND users.password = '${pass}'
        `)
        return cek[1].rowCount == true
    }
    // ambil materi pertemuan
    static async data(req, res, next) {
        try {
            //validasi
            if (!(req.body.id && req.body.password && await Murid.cekMurid(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")

            //ambil data absensi
            let dataAbsen = await sequelize.query(`
                SELECT pertemuan.name AS materi, (pertemuan.upload), pertemuan.date, absensi.id_pertemuan as absen, murid.id, pertemuan.id
                FROM murid INNER JOIN absensi ON absensi.id_murid = murid.id AND murid.id = ${req.body.id} RIGHT JOIN pertemuan ON absensi.id_pertemuan = pertemuan.id
            `)

            //mengubah file
            for (let i = 0; i < dataAbsen[0].length; i++) {
                if (dataAbsen[0][i].absen == null) {
                    dataAbsen[0][i].upload.file = null
                }
            }
            res.json(['berhasil', dataAbsen[0]])
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }

    static async getUjian(req, res, next) {
        try {
            // console.log(req.user)
            const { id } = req.user
            console.log(id)

            // ambil ujian berdsarakan id batch murid
            let muridGet = await murid.findOne({
                where: {
                    id_user: id
                },
                attributes: [],
                // includeIgnoreAttributes: false,
                include: [{
                    model: Batch,
                    attributes: ['id'],
                    include: [{
                        model: Ujian,
                        attributes: ['name', 'date'],
                        include: [{
                            model: Guru,
                            attributes: ['id'],
                            include: [{
                                model: User,
                                attributes: ['name']
                            }]
                        },
                        {
                            model: UjianSubmission,
                            where : {
                                id_murid : id
                            }
                        }
                    ]
                    }]
                }]
            })

            console.log(muridGet.toJSON())
            res.json(['berhasil', muridGet.toJSON()])

            // console.log(muridGet.toJSON().Batch.Ujians[0].Guru.User)
            // console.log(muridGet.toJSON().Batch.Ujians[0])

            // return res.send(id)

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
                    piutang: hutangPembayaran,
                }
            })
            let jumlahPiutang = await sequelize.query(``)
        } catch (error) {
            next(error)
        }
    }
}
module.exports = Murid