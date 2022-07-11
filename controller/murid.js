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
const Tugas = db.Tugas
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
                u.id,
                u.name,
                u.pengawas,
                u.date,
                u.time,
                us2.submit_link,
                us2.score,
                us2.id_ujian,
                (select count(*) from ujian_submission us where us.id_ujian = u.id and us.score >= us2.score) as rangking
            from murid m  
                inner join ujian u  on m.id_batch = u.id_batch and m.id = ${token.id_murid}
                left join ujian_submission us2  ON m.id = us2.id_murid and u.id = us2.id_ujian 
            ORDER BY u.date DESC
            `))[0]

            // mencari peringkat ujian
            // for (let i = 0; i < dataUjian.length; i++) {
            //     dataUjian[i].peringkat = null
            //     const peringkat = await UjianSubmission.findAll({attributes:['score', 'id_murid'],order:[['score', 'DESC']], where:{id_ujian: dataUjian[i].id_ujian}})
            //     for (let x = 0; x < peringkat.length; x++) {
            //         if(peringkat[x].id_murid == token.id_murid) dataUjian[i].peringkat = x+1
            //     }
            // }
            
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
    static async dataPertemuan(req, res, next){
        try {            
            //ambil token
            const token = verify(req.headers.token)
            if(token.role != "murid") throw 'anda bukan murid'

            //ambil data
            let dataPertemuan = (await sequelize.query(`
            select 
              p.id as id_pertemuan, p."name" as name_pertemuan, p.ket as ket_pertemuan, p."date" ,
              a.id as absen,
              pf.id as id_file, pf.file , pf.ket as ket_file,
              t.id as id_tugas, t."name" as name_tugas , t.description ,
              ts.id as id_submit , ts.score , ts.submit_date , ts.submit_link 
            from murid m 
              join pertemuan p on m.id_batch = p.id_batch  
              left join absensi a on p.id = a.id_pertemuan and a.id_murid = 71
              left join pertemuan_file pf ON p.id = pf.id_pertemuan 
              left join tugas t on p.id = t.id_pertemuan
              left join tugas_submission ts on t.id = ts.id_tugas and ts.id_murid = 71
            where m.id = 71
            order by p."date" desc, t.created_at desc, pf.created_at 
            `))[0]

            let data = []
            for (let i = 0; i < dataPertemuan.length; i++) {
              //p = data oertemuan (hasil query)
              //d = data (hasil proses)
              const p = dataPertemuan[i]
              let newP = true
              // if(!data.includes(p.name_pertemuan)) data.push(p.name_pertemuan)
              for (let u = 0; u < data.length; u++) {
                const d = data[u]
                if(d.id == p.id_pertemuan){ //pertemuan telah tersedia
                  newP = false
                  let newF = true
                  let newT = true
                  // === file
                  for (let o = 0; o < d.file.length; o++) {
                    //file telah tersedia
                    if(d.file[o].id == p.id_file) newF = false
                  }
                  if(newF && p.id_file && p.absen && p.date <= new Date()) { //membuat pertemuan
                    data[u].file.push({
                      id: p.id_file,
                      file: p.file,
                      ket: p.ket_file,
                    })
                  }
                  // === tugas
                  for (let o = 0; o < d.tugas.length; o++) {
                    //tugas telah tersedia
                    if(d.tugas[o].id == p.id_tugas) newT = false
                  }
                  if(newT && p.id_tugas && p.date <= new Date()) { //membuat pertemuan
                    data[u].tugas.push({
                      id: p.id_tugas,
                      name: p.name_tugas,
                      description: p.description,
                      id_submit: p.id_submit,
                      score: p.score,
                      submit_date: p.submit_date,
                      submit_link: p.submit_link,
                    })
                  }
                }
              }
              // === pertemuan
              if(newP) { //membuat pertemuan
                data.push({
                  id: p.id_pertemuan,
                  name: p.name_pertemuan,
                  ket: p.ket_pertemuan,
                  date: p.date,
                  absen: p.absen,
                  file: p.id_file && p.absen && p.date <= new Date()?[{
                    id: p.id_file,
                    file: p.file,
                    ket: p.ket_file,
                  }] : [],
                  tugas: p.id_tugas && p.date <= new Date()?[{
                    id: p.id_tugas,
                    name: p.name_tugas,
                    description: p.description,
                    id_submit: p.id_submit,
                    score: p.score,
                    submit_date: p.submit_date,
                    submit_link: p.submit_link,
                  }] : [],
                })
              }
            }
            console.log(data.length)

            // const dataAbsen = (await sequelize.query(`
            //     SELECT 
            //         pertemuan.name,
            //         pertemuan.ket,
            //         pertemuan.date,
            //         absensi.id_murid as absen,
            //         pertemuan.id
            //     FROM
            //         murid INNER JOIN pertemuan on murid.id_batch = pertemuan.id_batch AND murid.id = ${token.id_murid}
            //         LEFT JOIN absensi on absensi.id_pertemuan = pertemuan.id And absensi.id_murid = ${token.id_murid}
            //     ORDER BY pertemuan.date DESC
            // `))[0]
            // for (let i = 0; i < dataAbsen.length; i++) {
            //     if(new Date(dataAbsen[i].date) > new Date()) continue
            //     dataAbsen[i].tugas = []
            //     dataAbsen[i].tugas = (await Tugas.findAll({where:{id_pertemuan:dataAbsen[i].id}}))
            //     dataAbsen[i].file = []
            //     if(!dataAbsen[i].id_murid) continue
            //     dataAbsen[i].file = (await PertemuanFile.findAll({where:{id_pertemuan:dataAbsen[i].id_pertemuan}}))
            // }
            
            res.json({
                success: true,
                message: 'menampilkan daftar absensi',
                data
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async detailPertemuan(req, res, next){
        try {
            //input
            const id = req.params.id
            if(!id) throw 'masukkan id pertemuan 123'
            const absen = req.body.absen == 'hadir' ? false:true
            console.log('==========')
            console.log( req.body.absen)
            
            // throw 'jalan'

            // ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'tidak memiliki akses'
            
            const materi = absen || await PertemuanFile.findAll({where:{id_pertemuan:id}})
            const tugas = (await sequelize.query(`
                SELECT 
                    tugas.id as id_tugas,
                    tugas."name" ,
                    tugas.description ,
                    tugas_submission.score ,
                    tugas_submission.submit_date ,
                    tugas_submission.submit_link 
                FROM 
                    tugas LEFT JOIN tugas_submission ON tugas_submission.id_murid = ${token.id_murid} and tugas.id = tugas_submission.id_tugas
                WHERE tugas.id_pertemuan = ${id}
            `))[0]

            res.json({
                success: true,
                message: 'daftar tugas submit',
                data: {materi, tugas}
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
    static async listTugasSubmit(req, res, next){
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id tugas'

            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'tidak memiliki akses'
            
            //get batch
            const result = await tugasSubmit.findAll({where:{id_tugas: id, id_murid: token.id_murid}})

            res.json({
                success: true,
                message: 'daftar tugas submit',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async updateTugas(req, res, next) {
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id tugas'
            if(!(req.body.link)) throw ApiError.badRequest("data tidak lengkap")

            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'anda bukan murid'

            //update tugas submit
            let result = await tugasSubmit.update({submit_link: req.body.link}, {where:{id_murid: token.id_murid,id_tugas: id}})
            //buat tugas submit
            if(result[0] == 0){
                result = await tugasSubmit.create({
                    id_tugas: id,
                    id_murid: token.id_murid,
                    submit_date: new Date(),
                    submit_link: req.body.link
                })

            }
            
            res.json({
                success: true,
                message: 'berhasil mengupdate tugas',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async updateUjian(req, res, next) {
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id ujian'
            if(!(req.body.link)) throw ApiError.badRequest("data tidak lengkap")

            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'anda bukan murid'
            
            // //proses kirim ujian
            // const result = ujianSubmit.create({
            //     id_ujian: id,
            //     id_murid: token.id_murid,
            //     submit_date: new Date(),
            //     submit_link: req.body.link
            // })
            //proses kirim ujian
            let result = await ujianSubmit.update({submit_link: req.body.link}, {where:{id_murid: token.id_murid, id_ujian: id}})
            //buat ujian submit
            if(result[0] == 0){
                result = await ujianSubmit.create({
                    id_ujian: id,
                    id_murid: token.id_murid,
                    submit_date: new Date(),
                    submit_link: req.body.link
                })

            }

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
    static async listUjianSubmit(req, res, next){
        try {
            //input
            let id = req.params.id
            if(!id) throw 'masukkan id ujian'

            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'murid') throw 'tidak memiliki akses'
            
            //get batch
            const result = await ujianSubmit.findAll({where:{id_ujian: id, id_murid: token.id_murid}})

            res.json({
                success: true,
                message: 'daftar ujian submit',
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