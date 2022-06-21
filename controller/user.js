// const jwb = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const { QueryTypes, Op } = require('sequelize')
var passport = require('passport'), OAuthStrategy = require('passport-oauth').OAuthStrategy;

const validFile = require('../middlewares/validate_file')
const db = require('../db/models')
const { sequelize } = require("../db/models");
const { mail, mailOptions } = require('../model/mail');
const { checkout } = require("../router/router")
const ApiError = require('../helpers/api-error');
const { generateToken, verify } = require("../helpers/jwt-auth")

//db
// const sequelize = db.index
const user = db.User
const murid = db.Murid
const admin = db.Admin
const guru = db.Guru
const otpRegistrasi = db.Otp_registrasi
const totp = db.Otp

const timeOtp = 150 //minute

passport.use('provider', new OAuthStrategy({
    requestTokenURL: 'https://oauth2.googleapis.com/token',
    accessTokenURL: 'https://accounts.google.com/o/oauth2/auth',
    userAuthorizationURL: 'https://www.googleapis.com/oauth2/v1/certs',
    consumerKey: '519018642220-egf6gb0qpeg5g5djmup1i8et73ee1khs.apps.googleusercontent.com',
    consumerSecret: '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',
    callbackURL: 'http://localhost:3000/authGoogleCB'
},
    function (token, tokenSecret, profile, done) {
        done(err, user);
        // User.findOrCreate(..., function(err, user) {
        // });
    }
));

const SU = {
    email: 'faishalsample07@gmail.com',
    password: 'faishalSample__07'
}

class User {
    static async google(req, res, next) {

    }
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
    static async register(req, res, next) {
        const t = await sequelize.transaction();
        try {
            //variabel
            const name = req.body.username
            const password = bcrypt.hashSync(req.body.password, 10)
            const email = req.body.email
            const role = req.body.role
            let profile = 'default.png'

            //validasi
            if (!(name && password && email && role)) throw 'masukkan semua data'
            //cek otp
            let otp = await otpRegistrasi.findOne({ where: { otp: req.body.otp, email, role } })
            if (!otp) throw 'otp tidak valid'

            //image process profile
            req.files.profile.length ?
                profile = await validFile.validProfile(req.files.profile[0]) :
                false

            //kirim data register ke database
            let resUser
            if (role == 'murid') {
                const address = req.body.address
                const contact = req.body.contact
                const birthday = req.body.birthday
                let ktp

                //image process ktp
                if (req.files.ktp.length) ktp = await validFile.validKtp(req.files.ktp[0])
                else throw 'masukkan ktp'
                console.log(ktp)

                //memasukkan data ke tabel user
                resUser = await user.create({ name, email, password, role, email_verified_at: new Date(), photo: profile }, { transaction: t })

                //memasukkan data ke tabel murid
                await murid.create({ id_user:resUser.id, photo_ktp: ktp, address, contact, birthday, birthday_date: new Date() }, { transaction: t })
            } else if (role == 'admin' || role == 'guru') {
                resUser = await user.create({ name, email, password, role, photo: profile }, { transaction: t })
                role == 'admin' ?
                    resUser = await admin.create({ id_user: resUser.id }, { transaction: t }) :
                    resUser = await guru.create({ id_user: resUser.id }, { transaction: t })
            }

            await t.commit()

            //menghapus data otp jika sudah register
            // await otpRegistrasi.destroy({ where: { email } })

            res.send('register berhasil')
        } catch (error) {
            await t.rollback()
            // next(error)
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async createOtpRegister(req, res, next) {
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
                    replacements: [email, otp, role, new Date(new Date().getTime() + (1000 * 60 * timeOtp)).toISOString(), new Date().toISOString(), new Date().toISOString()],
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
            next(error)
            // console.log(error)
            // res.status(400).json(['terjadi error', error])
        }
    }
    static async createOtpReset(req, res, next) {
        try {
            //otp
            let otp = 0
            while (otp < 100000 || otp > 999999) {
                otp = Math.ceil(Math.random() * 1000000)
            }

            //cek id dan email
            if (!await user.findOne({ where: { id: req.body.id, email: req.body.email } })) throw 'data tidak sinkron'

            //kirim data otp ke database
            await sequelize.query(`INSERT INTO "otp" 
                ("id_user", "otp", "valid_until", "updated_at", "created_at")
                VALUES (?,?,?,?,?)
                ON CONFLICT ("id_user")
                DO UPDATE SET
                    "otp" = EXCLUDED."otp",
                    "valid_until" = EXCLUDED.valid_until,
                    "updated_at" = EXCLUDED.updated_at;`,
                {
                    replacements: [req.body.id, otp, new Date(new Date().getTime() + (1000 * 60 * timeOtp)).toISOString(), new Date().toISOString(), new Date().toISOString()],
                    type: QueryTypes.UPSERT
                }
            )

            //kirim otp via email
            mailOptions.to = req.body.email
            mailOptions.text = `code otp\n${otp}`
            mail.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err)
                    throw 'error saat kirim otp via email'
                }
            })
            res.send('berhasil')
        } catch (error) {
            // next()
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async validResetOtp(req, res, next) {
        try {
            //validasi otp
            if (!(await totp.findOne({ where: { id_user: req.body.id, otp: req.body.otp } }))) throw 'otp salah'
            res.send('berhasil')
        } catch (error) {
            // next()
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async resetPassword(req, res, next) {
        try {
            //verifikasi lebih lanjut
            if (!(await totp.findOne({ where: { id_user: req.body.id, otp: req.body.otp } }))) throw 'otp atau id salah'

            //mengubah password
            await user.update({ password: bcrypt.hashSync(req.body.password, 10) }, { where: { id: req.body.id } })

            //menghapus data otp jika sudah register
            await totp.destroy({ where: { id_user: req.body.id } })
            res.send('berhasil')
        } catch (error) {
            // next()
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

            let userGet = await user.findByPk(id)

            if (!userGet) throw ApiError.badRequest("User tidak ditemukan")
            console.log(userGet.role)
            let profile
            if (userGet.role === 'murid') {
                console.log("sini")
                profile = await murid.findOne({
                    where: { id_user: id },
                    attributes: ['address', 'birthday_date', 'status', 'id_batch'],
                })
            } else if (userGet.role == "admin") {
                profile = await admin.findOne({
                    where: { id_user: id },
                })
            } else if (userGet.role == "guru") {
                profile = await guru.findOne({
                    where: { id_user: id },
                })
            }

            profile = profile.toJSON()
            userGet = userGet.toJSON()
            userGet.profile = profile
            userGet.password = undefined
            console.log(userGet)
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

    static async updateProfile(req, res, next) {
        const t = await sequelize.transaction()
        try {
            let id
            if (req.params.id) {
                id = req.params.id
            } else {
                id = req.user.id
            }

            let userGet = await user.findByPk(id)
            if (!userGet) throw ApiError.badRequest("User tidak ditemukan")
            console.log(userGet.role)

            let userUpdated = await user.update({
                name: req.body.name,
                // photo:
            }, { transaction: t, where: { id: id }, returning: true })
            // console.log(req.body.address)
            userUpdated = userUpdated[1][0].toJSON()
            userUpdated.password = undefined
            // console.log(userUpdated)

            let profileUpdated
            if (userGet.role === 'murid') {
                // console.log("sini")
                profileUpdated = await murid.update({
                    address: req.body.address,
                    birthday_date: req.body.birthday_date,
                },
                    {
                        returning: true,
                        transaction: t,
                        where: { id_user: id },
                    })
                // userUpdated.profile = profileUpdated[1][0]
                userUpdated.profile = profileUpdated[1][0].toJSON()
                // profile = await murid.findOne({
                //     where: { id_user: id },
                //     attributes: ['address', 'birthday_date', 'status', 'id_batch'],
                // })
            }
            // console.log(profileUpdated[1][0].toJSON())
            // console.log(userUpdated)
            //  else if (userGet.role == "admin") {
            //     profile = await admin.findOne({
            //         where: { id_user: id },
            //     })
            // } else if (userGet.role == "guru") {
            //     profile = await guru.findOne({
            //         where: { id_user: id },
            //     })
            // }

            // profile = profile.toJSON()
            // userGet = userGet.toJSON()
            // userGet.profile = profile
            // userGet.password = undefined
            
            // console.log(userUpdated)
            t.commit()
            return res.status(200).json({
                success: true,
                message: 'data user berhasil diambil',
                data: userUpdated
            })
            // console.log("All users:", JSON.stringify(users, null, 2));
            // res.send(req.params.id)
        } catch (error) {
            t.rollback()
            next(error)
        }
    }

}
module.exports = User