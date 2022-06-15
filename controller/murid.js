const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize} = require("../db/models");
const validFile = require('../middlewares/validate_file')

//db
const guru = db.Guru
const murid = db.Murid
const pertemuan = db.Pertemuan
const absensi = db.Absensi
const ujianSubmit = db.UjianSubmission
const Tagihan = db.Tagihan
const Pembayaran = db.Pembayaran



class Murid {
    static async cekMurid(id, pass) {
        let cek = await sequelize.query(`
            SELECT * FROM murid INNER JOIN users ON murid.id_user = users.id 
            WHERE murid.id = '${id}' AND users.password = '${pass}'
        `)
        return cek[1].rowCount == true
    }
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
    static async addUjian(req, res, next) {
        try {
            //validasi
            if (!(req.body.id && req.body.password && await Murid.cekMurid(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.ujian && req.body.link)) throw ApiError.badRequest("data tidak lengkap")
            if((await sequelize.query(`
                SELECT * 
                FROM ujian INNER JOIN murid ON ujian.id_batch = murid.id_batch AND ujian.id = '${req.body.ujian}' AND murid.id = '${req.body.id}' AND murid.status = 'terdaftar' AND ujian.date + ujian.time >= now()
            `))[0].length == 0) throw ApiError.badRequest("data tidak valid")

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