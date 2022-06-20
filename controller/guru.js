const ApiError = require('../helpers/api-error');
const db = require('../db/models')
const { sequelize } = require("../db/models");
const { QueryTypes, Op } = require('sequelize')
const validFile = require('../middlewares/validate_file')
const {verify } = require("../helpers/jwt-auth")

//db
const guru = db.Guru
const murid = db.Murid
const batch = db.Batch
const pertemuan = db.Pertemuan
const pertemuanFile = db.PertemuanFile
const absensi = db.Absensi
const tugas = db.Tugas
const tugasSub = db.TugasSubmission
const ujian = db.Ujian
const ujianSub = db.UjianSubmission

class Guru{
    static async cekGuru(id, pass){
        let cek = await sequelize.query(`
            SELECT * FROM guru INNER JOIN users ON guru.id_user = users.id 
            WHERE guru.id = '${id}' AND users.password = '${pass}'
        `)
        return cek[1].rowCount == true
    }
    //batch
    static async addBatch(req, res, next){
        try {
            //validasi
            if(!req.body.name) throw 'masukkan nama batch'

            //ambil token
            const token = verify(req.headers.token)
            if (token.role != 'guru') throw 'anda tidak bisa membuat batch'

            //ambil input
            const name = req.body.name
            const start_date = req.body.startDate || new Date()
            const pay = req.body.pay || 2000000

            //create batch
            const result = await batch.create({id_guru:token.id_guru, name, pay, start_date})

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
    static async listBatch(req, res, next){
        try {
            //ambil token
            const token = verify(req.headers.token)

            //get batch
            const result = await batch.findAll({where:{id_guru:token.id_guru}})

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
    static async listAnggotaBatch(req, res, next){
        try {
            //validasi
            let id = req.params.id
            if(!id) throw 'masukkan id batch'

            //ambil token
            const token = verify(req.headers.token)

            //get anggota batch
            const result = await murid.findAll({where:{id_batch:id}})

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
    static async accAnggotaBatch(req, res, next){
        try {
            //validasi
            let id = req.params.id
            if(!id) throw 'masukkan id murid'

            //ambil token
            const token = verify(req.headers.token)

            //update status murid
            const result = await murid.update({status: 'terdaftar'}, {where:{status: 'mendaftar', id}})

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
    static async updateBatch(req, res, next){
        try {
            //validasi
            if(!req.params.id) throw 'masukkan id batch'

            //ambil token
            const token = verify(req.headers.token)

            //ambil input
            let data = {}
            const id = req.params.id
            const {name, startDate, pay} = req.body
            name ? data.name = name : false
            startDate ? data.start_date = startDate : false
            pay ? data.pay = pay : false

            //update batch
            const result = await batch.update(data, {where: {id, id_guru: token.id_guru}})

            res.json({
                success: true,
                message: 'berhasil mengubah batch',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async deleteBatch(req, res, next){
        try {
            //validasi
            if(!req.params.id) throw 'masukkan id batch'

            //ambil token
            const token = verify(req.headers.token)

            //ambil input
            const id = req.params.id

            //delete batch
            const result = await batch.destroy({where:{id, id_guru:token.id_guru}})

            res.json({
                success: true,
                message: 'berhasil menghapus batch',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }

    //pertemuan
    static async addPertemuan(req, res, next){
        const t = await sequelize.transaction();
        try {
            //validasi
            if(!(req.body.name && req.params.id)) throw "name atau id batch tidak di inputkan"
            
            //ambil token
            const token = verify(req.headers.token)
            if(!await batch.findOne({where:{id_guru:token.id_guru, id: req.params.id}})) throw 'bukan batch anda'
            
            //pertemuan
            //ambil input pertemuan
            const id_batch = req.params.id
            const id_guru = req.body.pengajar || token.id_guru
            const ket = req.body.ket || null
            const name = req.body.name
            const date = req.body.date || new Date()
            //kirim pertemuan
            let resultPertemuan = await pertemuan.create({id_batch, id_guru, name, ket, date}, { transaction: t })
            
            //file
            //cek file
            if(req.files.file){
                //ambil file
                let dataFile = []
                if(!req.body.ketFile) req.body.ketFile = []
                //proses
                for (let i = 0; i < req.files.file.length; i++) {
                    dataFile.push({
                        id_pertemuan: resultPertemuan.id,
                        file: await validFile.validFile(req.files.file[i], 'upload'),
                        ket: req.body.ketFile[i] || null
                    })
                    
                }
                //kirim
                var resultFile = await pertemuanFile.bulkCreate(dataFile, { transaction: t })
            }
            
            //tugas
            //ambil input tugas
            let {tugasName, tugasDescription} = req.body
            //cek tugas
            if(tugasName && tugasDescription){
                let dataTugas = []
                //ubah ke array
                if(!Array.isArray(tugasName)) tugasName = [tugasName]
                if(!Array.isArray(tugasDescription)) tugasDescription = [tugasDescription]
                //proses
                for (let i = 0; i < tugasName.length; i++) {
                    dataTugas.push({
                        id_pertemuan: resultPertemuan.id,
                        name: tugasName[i],
                        description: tugasDescription[i] || tugasName[i]
                    })
                }
                //kirim
                var resultTugas = await tugas.bulkCreate(dataTugas, { transaction: t })
            }
            // throw [resultPertemuan||null, resultFile||null, resultTugas||null]

            await t.commit()
            
            res.json({
                success: true,
                message: 'berhasil membuat pertemuan',
                data: {
                    resultPertemuan : resultPertemuan||null,
                    resultFile : resultFile||null,
                    resultTugas : resultTugas||null,
                }
            })
        } catch (error) {
            await t.rollback()
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async listPertemuan(req, res, next){
        try {
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let data = await sequelize.query(`
                SELECT 
                    batch.name AS "name_batch",
                    pertemuan.name AS "name_pertemuan",
                    pertemuan.ket AS "keterangan",
                    pertemuan.date AS "date",
                    guru.id AS "id guru",
                    batch.id AS "id batch",
                    pertemuan.id AS "id_pertemuan"
                FROM 
                    guru INNER JOIN batch ON guru.id = batch.id_guru AND guru.id = '${token.id_guru}' 
                    INNER JOIN pertemuan ON batch.id = pertemuan.id_batch
            `)
            
            res.json({
                success: true,
                message: 'menampilkan daftar petemuan',
                data: data[0]
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async listJadwalPertemuan(req, res, next){
        try {
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let data = await sequelize.query(`
                SELECT 
                    batch.name AS "name batch",
                    pertemuan.name AS "name pertemuan",
                    pertemuan.ket AS "keterangan",
                    pertemuan.date AS "date",
                    pertemuan.id_guru AS "id guru",
                    batch.id AS "id batch",
                    pertemuan.id AS "id pertemuan"
                FROM 
                    batch INNER JOIN pertemuan ON batch.id = pertemuan.id_batch AND pertemuan.id_guru = '${token.id_guru}'
            `)
            
            res.json({
                success: true,
                message: 'menampilkan jadval petemuan',
                data: data[0]
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async updatePertemuan(req, res, next){
        try {
            //validasi
            if(!req.params.id) throw 'masukkan id pertemuan'

            //ambil token
            const token = verify(req.headers.token)

            //ambil input
            let data = {}
            const id = req.params.id
            const {name, ket, pengajar, date} = req.body
            name ? data.name = name : false
            ket ? data.ket = ket : false
            pengajar ? data.pengajar = pengajar : false
            date ? data.date = date : false

            //update pertemuan
            const result = await pertemuan.update(data, {where: {id, [Op.or]:[
                {id_guru: token.id_guru}

            ]}})

            res.json({
                success: true,
                message: 'berhasil mengubah pertemuan',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async deletePertemuan(req, res, next){
        try {
            //validasi
            if(!req.params.id) throw 'masukkan id pertemuan'

            //ambil token
            const token = verify(req.headers.token)

            //ambil input
            const id = req.params.id

            //delete pertemuan
            const result = await pertemuan.destroy({where:{id, id_guru:token.id_guru}})

            res.json({
                success: true,
                message: 'berhasil menghapus pertemuan',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }

    //tugas
    static async listTugas(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            if(!id) throw 'masukkan id pertemuan'
            
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let data = (await sequelize.query(`
                SELECT 
                    tugas.id,
                    tugas.name,
                    tugas.description
                FROM
                    pertemuan INNER JOIN tugas ON pertemuan.id = tugas.id_pertemuan AND id_pertemuan = ${id}
            `))[0] || null
            
            res.json({
                success: true,
                message: 'menampilkan daftar petemuan',
                data
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async listTugasSubmit(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            if(!id) throw 'masukkan id tugas'
            
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let data = (await sequelize.query(`
                SELECT 
                    tugas_submission.id,
                    tugas_submission.id_tugas,
                    tugas_submission.id_murid,
                    tugas_submission.score,
                    tugas_submission.submit_date,
                    tugas_submission.submit_link
                FROM
                    tugas INNER JOIN tugas_submission ON tugas.id = tugas_submission.id_tugas AND id_tugas = ${id}
            `))[0] || null
            
            res.json({
                success: true,
                message: 'menampilkan daftar petemuan',
                data
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async addTugas(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            let {tugasName, tugasDescription} = req.body
            
            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'guru') throw 'tidak memiliki akses untuk menambah tugas'

            //cek tugas
            if(!(tugasName && tugasDescription)) throw 'data tidak lengkap'
            let dataTugas = []
            //ubah ke array
            if(!Array.isArray(tugasName)) tugasName = [tugasName]
            if(!Array.isArray(tugasDescription)) tugasDescription = [tugasDescription]
            //proses
            for (let i = 0; i < tugasName.length; i++) {
                dataTugas.push({
                    id_pertemuan: id,
                    name: tugasName[i],
                    description: tugasDescription[i] || tugasName[i]
                })
            }
            //kirim
            var resultTugas = await tugas.bulkCreate(dataTugas)

            res.json({
                success: true,
                message: 'berhasil menambahkan batch',
                data: resultTugas
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async updateTugas(req, res, next){
        try {
            //input
            const id = req.params.id
            if(!id) throw 'masukkan id tugas'

            //ambil token
            const token = verify(req.headers.token)

            //cek
            let resPer = await sequelize.query(`
                SELECT pertemuan.id_batch
                FROM tugas INNER JOIN pertemuan ON tugas.id_pertemuan = pertemuan.id AND tugas.id = ${id}
            `)
            if(!resPer[0][0]){
                throw 'tugas tidak ada'
            }else if(resPer.id_guru != token.id_guru){ //cek pengajar pertemuan
                //cek penanggunga jawab batch
                if(!await batch.findOne({where:{id: resPer[0][0].id_batch, id_guru: token.id_guru}})) throw 'tidak memiliki akses'
            }

            //input
            let data = {}
            const {name, description} = req.body
            name ? data.name = name : false
            description ? data.description = description : false

            //update pertemuan
            const result = await tugas.update(data, {where: {id}})

            res.json({
                success: true,
                message: 'berhasil mengubah tugas',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async deleteTugas(req, res, next){
        try {
            //input
            const id = req.params.id //tugas
            if(!id) throw 'masukkan id tugas'

            //ambil token
            const token = verify(req.headers.token)

            //cek
            let resPer = await sequelize.query(`
                SELECT pertemuan.id_batch
                FROM tugas INNER JOIN pertemuan ON tugas.id_pertemuan = pertemuan.id AND tugas.id = ${id}
            `)
            if(!resPer[0][0]){
                throw 'tugas tidak ada'
            }else if(resPer.id_guru != token.id_guru){ //cek pengajar pertemuan
                //cek penanggunga jawab batch
                if(!await batch.findOne({where:{id: resPer[0][0].id_batch, id_guru: token.id_guru}})) throw 'tidak memiliki akses'
            }

            //delete tugas
            const result = await tugas.destroy({where:{id}})

            res.json({
                success: true,
                message: 'berhasil menghapus tugas',
                data: result
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }

    //absensi
    static async listAbsensi(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            if(!id) throw 'masukkan id pertemuan'
            
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let dataAbsen = (await sequelize.query(`
                SELECT 
                    murid.id AS id_murid,
                    murid.id_user,
                    murid.contact,
                    murid.status,
                    users.name,
                    users.email,
                    absensi.id AS id_absen
                FROM
                    pertemuan INNER JOIN murid ON pertemuan.id_batch = murid.id_batch AND pertemuan.id = ${id} AND murid.status = 'terdaftar'
                    INNER JOIN users ON users.id = murid.id_user
                    LEFT JOIN absensi ON absensi.id_murid = murid.id
            `))[0] || null
            
            res.json({
                success: true,
                message: 'menampilkan daftar petemuan',
                data: dataAbsen
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async prosesAbsensi(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            if(!id) throw 'masukkan id pertemuan'
            
            //ambil token
            const token = verify(req.headers.token)

            //cek
            let resPer = await pertemuan.findOne({where:{id}})
            if(!resPer){
                throw 'tugas tidak ada'
            }else if(resPer.id_guru != token.id_guru){ //cek pengajar pertemuan
                //cek penanggung jawab batch
                if(!await batch.findOne({where:{id: resPer.id_batch, id_guru: token.id_guru}})) throw 'tidak memiliki akses'
            }
            
            let dataAdd = []
            let dataDel = []
            for (const e in req.body) {
                if(!Number.isInteger(Number.parseInt(e))) continue
                if(!(await murid.findOne({where:{id: e, id_batch: resPer.id_batch}}))) continue
                switch (req.body[e]) {
                    case 'y':
                        if(await absensi.findOne({where:{id_pertemuan:id, id_murid:e}})) continue
                        dataAdd.push(await absensi.create({id_pertemuan:id, id_murid:e}))
                        break;
                    case 'x':
                        dataDel.push(e)
                        break;
                }
            }
            if(dataDel.length){
                console.log("hapus absen")
                dataDel = await absensi.destroy({where:{id_pertemuan:id, id_murid:{[Op.or]:dataDel}}})
            }

            res.json({
                success: true,
                message: 'berhasil menambahkan batch',
                data: [dataAdd, dataDel]
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }

    //ujian
    static async listUjian(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            if(!id) throw 'masukkan id batch'
            
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let data = await ujian.findAll({
                attributes:['id','id_batch', 'pengawas', 'name', 'date', 'time'],
                where:{id_batch:id}
            }) || null
            
            res.json({
                success: true,
                message: 'menampilkan daftar petemuan',
                data
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async listUjianSubmit(req, res, next){
        try {
            //input
            let id = req.params.id //id pertemuan
            if(!id) throw 'masukkan id ujian'
            
            //ambil token
            const token = verify(req.headers.token)

            //ambil data
            let data = (await sequelize.query(`
                SELECT 
                    users.name, 
                    ujian_submission.score, 
                    ujian_submission.submit_link, 
                    ujian_submission.submit_date, 
                    ujian_submission.id AS "id ujian submit", 
                    murid.id AS "id murid"
                FROM murid INNER JOIN ujian_submission ON murid.id = ujian_submission.id_murid AND ujian_submission.id_ujian = '${id}' 
                INNER JOIN users ON users.id = murid.id_user
            `))[0] || null
            
            res.json({
                success: true,
                message: 'menampilkan daftar petemuan',
                data
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }
    static async addUjian(req, res, next){
        try {
            //input
            let id = req.params.id //id batch
            let pengawas = req.body.pengawas
            let name = req.body.name
            let date = req.body.date || new Date()
            let time = req.body.time || '02:00:00'
            
            //cek input
            if(!(name && pengawas)) throw 'data tidak lengkap'
            if(!id) throw 'masukkan id batch'
            //ambil token
            const token = verify(req.headers.token)
            if(token.role != 'guru') throw 'tidak memiliki akses untuk menambah ujian'


            //kirim data pertemuan ke database
            let data = await ujian.create({
                pengawas:pengawas,
                id_batch: id,
                name: name,
                date,
                time
            })

            res.json({
                success: true,
                message: 'berhasil menambahkan batch',
                data
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message:'terjadi error', error})
        }
    }

    
    static async addScoreTugas(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.tugas && req.body.score)) throw ApiError.badRequest("data tidak lengkap")
            if(!(
                //pemilik batch
                (await sequelize.query(`
                    SELECT * 
                    FROM pertemuan INNER JOIN tugas ON pertemuan.id = tugas.id_pertemuan and tugas.id = ${req.body.tugas}
                    INNER JOIN batch on batch.id = pertemuan.id_batch and batch.id_guru =  ${req.body.id}
                `))[1].rowCount || 
                //pengajar pertemuan
                (await sequelize.query(`
                    SELECT * 
                    FROM pertemuan INNER JOIN tugas ON pertemuan.id = tugas.id_pertemuan AND pertemuan.id_guru = ${req.body.id} and tugas.id = ${req.body.tugas}
                `))[1].rowCount
            )) throw 'tidak memliliki hak untuk memberikan nilai pada tugas di batch ini'
            
            //proses
            //score[i][0] = id tugas submission
            //score[i][1] = nilai
            let score = req.body.score
            for (let i = 0; i < score.length; i++) {
                if(score[i][0] && score[i][1]){
                    //kirim data pertemuan ke database
                    await tugasSub.update({score:score[i][1]},{
                        where:{id_tugas:req.body.tugas, id:score[i][0]}
                    })
                }
            }

            res.json({status:'berhasil'})
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async updateUjian(req, res, next){
        try {
            //validasi{

        } catch (error) {
            next(error)
        }
    }
    static async deleteUjian(req, res, next){
        try {
            //validasi{

        } catch (error) {
            next(error)
        }
    }
    static async getPesertaUjian(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.batch && req.body.ujian)) throw ApiError.badRequest("data tidak lengkap")

            //ambil data peserta yang mengikuti ujian
            let data = await sequelize.query(`
                SELECT 
                    users.name, 
                    ujian_submission.score, 
                    ujian_submission.submit_link, 
                    ujian_submission.submit_date, 
                    ujian_submission.id AS "id ujian submit", 
                    murid.id AS "id murid"
                FROM murid INNER JOIN ujian_submission ON murid.id = ujian_submission.id_murid AND ujian_submission.id_ujian = '${req.body.ujian}' 
                INNER JOIN users ON users.id = murid.id_user
            `)

            res.json({status:'berhasil',data: data[0]})
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
            // next(error)         
        }
    }
    static async addScoreUjian(req, res, next){
        try {
            //validasi
            if(!(req.body.id && req.body.password && await Guru.cekGuru(req.body.id, req.body.password))) throw ApiError.badRequest("terdapat kesalahan data")
            if(!(req.body.ujian && req.body.score)) throw ApiError.badRequest("data tidak lengkap")
            if(!//pemilik batch
            (await sequelize.query(`
                SELECT * 
                FROM pertemuan INNER JOIN tugas ON pertemuan.id = tugas.id_pertemuan and tugas.id = ${req.body.tugas}
                INNER JOIN batch on batch.id = pertemuan.id_batch and batch.id_guru =  ${req.body.id}
            `))[1].rowCount) throw 'tidak memliliki hak untuk memberikan nilai pada ujian di batch ini'
            
            //proses
            //score[i][0] = id tugas submission
            //score[i][1] = nilai
            let score = req.body.score
            for (let i = 0; i < score.length; i++) {
                if(score[i][0] && score[i][1]){
                    //kirim data pertemuan ke database
                    await ujianSub.update({score:score[i][1]},{
                        where:{id_ujian:req.body.ujian, id:score[i][0]}
                    })
                }
            }

            res.json({status:'berhasil'})
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
            // next(error)         
        }
    }
}
module.exports = Guru
