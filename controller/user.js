// const jwb = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const mv = require('mv')
const {QueryTypes, Op} = require('sequelize')
const validImg = require('../middlewares/validate_image')

const db = require('../db/models')
const {mail, mailOptions} = require('../model/mail');
const { sequelize } = require("../db/models");
const { checkout } = require("../router/router")
const ApiError = require('../helpers/api-error');
const { generateToken, verify } = require("../helpers/jwt-auth")
//db
// const sequelize = db.index
const user = db.User
const murid = db.Murid
const otpRegistrasi = db.otp_registrasi

const timeOtp = 150

const SU = {
    email: 'faishalsample07@gmail.com',
    password: 'faishalSample__07'
}

class User {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userGet = await user.findOne({
                where: {
                    email: email
                }
            });
            if (userGet) {
                // console.log(password)
                const isPassword = bcrypt.compareSync(password, userGet.password);
                // console.log(isPassword)
                if (isPassword) {
                    userGet.password = undefined;
                    const payload = {
                        id: userGet.id,
                        name: userGet.name,
                        email: userGet.email,
                        role: userGet.role,
                    }
                    const token = generateToken(payload);
                    // const cobaVerify = verify(token)
                    return res.status(200).json({
                        success: true,
                        message: 'login berhasil',
                        data: userGet,
                        token: token,
                        // cobaVerify
                    })
                }
            }
            throw ApiError.badRequest('Username atau password salah');
        } catch (error) {
            next(error)
            // console.log(error)
            // res.status(400).send('terjadi error')
        }
    }
    static async register(req, res) {
        try {
            //variabel
            const name = req.body.username
            const password = bcrypt.hashSync(req.body.password, 10)
            const email = req.body.email
            const role = req.body.role
            const inOtp = req.body.otp
            let profile

            //cek
            if(!(name && password && email && role && inOtp)) throw 'masukkan semua data'
            //image
            if (req.files.profile) { //jika memasukkan photo profile
                profile = req.files.profile[0]
                await validImg.valid(profile, 'img-profile')
                profile = profile.filename
            } else {
                profile = 'default.png'
            }

            //cek otp
            let otp = await otpRegistrasi.findOne({ where: { otp: inOtp } })
            if (!otp) throw 'otp tidak valid'

            //cek data
            if (new Date() > otp.valid_until) throw 'waktu otp limit'
            if (!(email == otp.email)) throw 'data tidak lengkap'
            if (!(role == otp.role)) throw 'role berbeda'

            //kirim data register ke database
            if(role == 'murid'){
                const address = req.body.address
                const birthday = req.body.birthday
                const ktp = req.files.ktp[0]

                //validasi img
                await validImg.valid(ktp, 'img-ktp')

                //memasukkan data ke tabel user
                let hasilUser = await user.create({name, email, password, role, email_verified_at: new Date(), photo:profile})

                //memasukkan data ke tabel murid
                await murid.create({photo_ktp: ktp.filename, address, birthday, birthday_date:new Date(), id_user:hasilUser.id})

                await sequelize.transaction(async t=>{
                    const registrasi = await user.create({name, email, password, role, email_verified_at: new Date(), photo:profile})
                })
                // await sequelize.query(`INSERT INTO "murid" 
                //     ("id","photo_ktp","address","birthday_date","created_at","updated_at","id_user")
                //     VALUES (DEFAULT,?,?,?,?,?,?)`,{
                //     replacements: [ktp.filename, address, birthday, new Date().toISOString(), new Date().toISOString(), hasilUser.id]
                // })
                // const result = await sequelize.transaction(async(t)=>{
                //     // const registrasi = await user.create({name, email, password, role, email_verified_at: new Date(), photo:profile}, {transaction: t})
                //     //tabel user
                //     const registrasi = await sequelize.query(`INSERT INTO "users" 
                //         ("id","name","email","password","role","photo","email_verified_at","created_at","updated_at")
                //         VALUES (DEFAULT,?,?,?,?,?,?,?,?) 
                //         RETURNING "id"`,{
                //         replacements: [name, email, password, role, profile, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()],
                //         type: QueryTypes.INSERT
                //     }, {transaction: t})
                //     //tabel murid
                //     await registrasi.query(`INSERT INTO "murid" 
                //         ("id","photo_ktp","address","birthday_daate","created_at","updated_at","id_user")
                //         VALUES (DEFAULT,?,?,?,?,?,?)`,{
                //         replacements: [ktp.filename, address, birthday, new Date().toISOString(), new Date().toISOString(),registrasi[0][0].id],
                //         type: QueryTypes.INSERT
                //     }, {transaction: t})
                //     return registrasi
                // })
                // console.log(result)
            }else{
                await user.create({name, email, password, role, photo:profile})
            }

            //menghapus data otp jika sudah register
            await otpRegistrasi.destroy({where: {email}})

            res.send('register berhasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async createOtpRegister(req, res) {
        try {
            //variabel
            let emailOtp
            const email = req.body.email
            const role = req.body.role
            const usernameAdmin = req.body.usernameAdmin

            //cek email
            if (!(email && role)) throw 'lengkapi semua data'

            //role
            if (role == 'admin') {
                emailOtp = SU.email
            } else if (role == 'guru') {
                //cek penerima otp
                if (!usernameAdmin) throw 'masukkan username admin untuk menerima otp'
                //mencari email penerima
                emailOtp = await user.findOne({
                    attributes: ['email'],
                    where: { name: usernameAdmin, role: 'admin' }
                })
                //cek adat tidaknya username penerima email otp
                if (!emailOtp) throw 'username tidak ada'
                emailOtp = emailOtp.email
            } else if (role == 'murid') {
                //cek penerima otp
                if (!req.body.email) throw 'masukkan email'
                emailOtp = req.body.email
            } else {
                throw 'role tidak tersedia'
            }

            //otp
            let otp = 0
            while (otp < 100000 || otp > 999999) {
                otp = Math.ceil(Math.random() * 1000000)
            }

            //kirim data otp ke database
            await sequelize.query(`INSERT INTO "otp_registrasi" 
                ("email", "otp", "role", "valid_until", "updated_at", "created_at")
                VALUES (?,?,?,?,?,?)
                ON CONFLICT ("email")
                DO UPDATE SET
                    "email" = EXCLUDED."email",
                    "role" = EXCLUDED."role",
                    "otp" = EXCLUDED."otp",
                    "valid_until" = EXCLUDED.valid_until,
                    "updated_at" = EXCLUDED.updated_at;`,
              {
                replacements: [email, otp, role, new Date(new Date().getTime() + (1000*60* timeOtp)).toISOString(), new Date().toISOString(), new Date().toISOString()],
                type: QueryTypes.UPSERT
              }
            )

            //kirim otp via email
            mailOptions.to = emailOtp
            mailOptions.text = `code otp\n${otp}`
            mail.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err)
                    throw 'error saat kirim otp via email'
                }
            })
            res.send('behasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }

    static async profile(req, res, next) {
        try {
            // console.log(await user.findAll()
            let id
            if (req.params.id) {
                id = req.params.id
            } else {
                id = req.user.id
            }
            // console.log(req.params.id)
            // return
            // const id = req.params.id
            const userGet = await user.findByPk(id)

            if (!userGet) throw ApiError.badRequest("User tidak ditemukan")

            userGet.password = undefined
            return res.status(200).json({
                success: true,
                message: 'data user berhasil diambil',
                data: userGet
            })
            // console.log("All users:", JSON.stringify(users, null, 2));
            res.send(req.params.id)
        } catch (error) {
            next(error)
            // console.log(error)
            // res.status(400).send('terjadi error')

        }
    }
}
module.exports = User