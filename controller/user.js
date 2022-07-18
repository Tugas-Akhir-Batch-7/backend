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
const batch = db.Batch

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
                    const dataResponse = await User.profileLoginHelper(userGet.id)
                    // console.log(dataResponse[0][0]);
                    // dataResponse.password = undefined;
                    const payload = {
                        id: userGet.id,
                        [`id_${userGet.role}`]: (await sequelize.query(`SELECT id FROM ${userGet.role} WHERE id_user = ${userGet.id}`))[0][0].id,
                        name: userGet.name,
                        email: userGet.email,
                        role: userGet.role,
                    }
                    const token = generateToken(payload);
                    // const cobaVerify = verify(token)
                    return res.status(200).json({
                        success: true,
                        message: 'login berhasil',
                        data: dataResponse,
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
            const { name, email, otp } = req.body;
            const role = req.body.role || 'murid'
            let resUser, resRole, profile
 
            //validasi
            if (!(name && req.body.password && email && otp)) throw 'masukkan semua data'
            //cek otp
            if (!(await otpRegistrasi.findOne({ where: { otp, email, role } }))) throw 'otp tidak valid'

            //process
            //encript password
            const password = bcrypt.hashSync(req.body.password, 10)
            //image process profile
            req.files.profile ?
                profile = await validFile.validProfile(req.files.profile[0]) :
                profile = 'default.png'


            if (role == 'murid') {
                //variabel
                const { address, contact, birthday, id_batch } = req.body
                //proses
                if (!(address && contact && birthday && id_batch)) throw 'masukkan semua data murid'
                //image process ktp
                if (!req.files.ktp) throw 'masukkan ktp'
                let ktp = await validFile.validKtp(req.files.ktp[0])
                //kirim user
                resUser = await user.create({ name, email, password, role, email_verified_at: new Date(), photo: profile }, { transaction: t })

                //kirim murid
                resRole = await murid.create({
                    id_user: resUser.id,
                    photo_ktp: ktp,
                    address,
                    contact,
                    birthday_date: birthday,
                    id_batch
                }, { transaction: t })
            } else if (role == 'admin' || role == 'guru') {
                resUser = await user.create({ name, email, password, role, photo: profile }, { transaction: t })
                role == 'admin' ?
                    resRole = await admin.create({ id_user: resUser.id }, { transaction: t }) :
                    resRole = await guru.create({ id_user: resUser.id }, { transaction: t })
            }

            //hapus otp
            await otpRegistrasi.destroy({ where: { email: resUser.email } })

            await t.commit()

            res.json({
                success: true,
                message: 'login berhasil',
                data: resUser,
                token: generateToken({
                    id: resUser.id,
                    [`id_${resUser.role}`]: resRole.id,
                    name: resUser.name,
                    email: resUser.email,
                    role: resUser.role,
                })
            })
        } catch (error) {
            await t.rollback()
            // next(error)
            console.log(error)
            res.status(400).json({
                success: false,
                message: 'terjadi error',
                error
            })
        }
    }
    static async createOtpRegister(req, res, next) {
        try {
            const { Op } = require("sequelize");
            //variabel
            let emailOtp
            const email = req.body.email
            const role = req.body.role || 'murid'
            const userInvit = req.body.userInvit

            //cek email
            if (!(email)) throw 'isi email'

            //role
            switch (role) {
                case 'admin':
                    emailOtp = SU.email
                    break;
                case 'guru':
                    if (!userInvit) throw 'masukkan username invit untuk menerima otp'
                    // console.log(await user.findAll({where: {role: 'guru'}}))
                    if (!(emailOtp = (await user.findOne({ where: { name: userInvit, role: {[Op.or]: ['admin', 'guru']}}})))) throw 'username invit tidak ada'
                    emailOtp = emailOtp.email
                    break;
                case 'murid':
                    emailOtp = req.body.email
                    break;
                default:
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
                    replacements: [
                        email,
                        otp,
                        role,
                        new Date(new Date().getTime() + (1000 * 60 * timeOtp)).toISOString(),
                        new Date().toISOString(),
                        new Date().toISOString()
                    ],
                    type: QueryTypes.UPSERT
                }
            )

            //kirim otp email
            mailOptions.to = emailOtp
            mailOptions.text = `code otp\n${otp}`
            mail.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err)
                    throw 'error saat kirim otp via email'
                }
            })

            res.json({
                success: true,
                message: 'otp berhasil dikirim'
            })
        } catch (error) {
            // next(error)
            console.log(error)
            res.status(400).json({
                success: false,
                message: 'terjadi error',
                error
            })
        }
    }
    static async createOtpReset(req, res, next) {
        try {
            //ambil token
            const token = verify(req.headers.token)

            //otp
            let otp = 0
            while (otp < 100000 || otp > 999999) {
                otp = Math.ceil(Math.random() * 1000000)
            }

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
                    replacements: [token.id, otp, new Date(new Date().getTime() + (1000 * 60 * timeOtp)).toISOString(), new Date().toISOString(), new Date().toISOString()],
                    type: QueryTypes.UPSERT
                }
            )

            //kirim otp via email
            mailOptions.to = token.email
            mailOptions.text = `code otp\n${otp}`
            mail.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err)
                    throw 'error saat kirim otp via email'
                }
            })
            res.json({
                success: true,
                message: 'berhasil mengirim otp reset password'
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'terjadi error', error })
        }
    }

    static async validResetOtp(req, res, next) {
        try {
            if (!req.body.otp) throw 'masukkan otp'

            //ambil token
            const token = verify(req.headers.token)

            //validasi otp
            if (!(await totp.findOne({ where: { id_user: token.id, otp: req.body.otp } }))) throw 'otp salah'
            res.json({
                success: true,
                message: 'otp valid'
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'terjadi error', error })
        }
    }
    static async resetPassword(req, res, next) {
        try {
            let { otp, password } = req.body
            if (!(otp && password)) throw 'masukkan otp dan password'

            //ambil token
            const token = verify(req.headers.token)
            const { id, role, email } = token

            //verifikasi lebih lanjut
            if (!(await totp.findOne({ where: { id_user: id, otp } }))) throw 'otp atau id salah'

            //mengubah password
            await user.update({ password: bcrypt.hashSync(password, 10) }, { where: { id } })

            //menghapus data otp jika sudah register
            // await totp.destroy({where: {id_user: id}})

            const tokenRes = generateToken((await sequelize.query(`
                SELECT 
                    users.id,
                    ${role}.id AS id_${role},
                    users.name,
                    users.email,
                    users.role
                FROM 
                    users INNER JOIN ${role} ON users.id = ${role}.id_user AND users.email = '${email}'
            `))[0][0]);

            res.json({
                success: true,
                message: 'password berhasil diganti',
                token: tokenRes
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'terjadi error', error })
        }
    }

    static async createOtpResetByEmail(req, res, next) {
        try {
            const { email } = req.body
            if (!email) throw ApiError.badRequest('email is required')

            const userGet = await user.findOne({ where: { email } })
            if (!userGet) throw ApiError.badRequest('email tidak ditemukan')
            // console.log(userGet.id)
            //otp
            let otp = 0
            while (otp < 100000 || otp > 999999) {
                otp = Math.ceil(Math.random() * 1000000)
            }

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
                    replacements: [userGet.id, otp, new Date(new Date().getTime() + (1000 * 60 * timeOtp)).toISOString(), new Date().toISOString(), new Date().toISOString()],
                    type: QueryTypes.UPSERT
                }
            )

            //kirim otp via email
            mailOptions.to = userGet.email
            mailOptions.text = `code otp\n${otp}`
            mail.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err)
                    throw 'error saat kirim otp via email'
                }
            })
            res.json({
                success: true,
                message: 'berhasil mengirim otp reset password'
            })

        } catch (error) {
            next(error)
        }

    }

    static async confirmOtp(req, res, next) {
        try {

            if (!req.body.otp) throw ApiError.badRequest('masukkan otp')
            if (!req.body.email) throw ApiError.badRequest('masukkan email')

            const otpGet = await totp.findOne({ where: { otp: req.body.otp } })
            if (!otpGet) throw ApiError.badRequest('otp invalid')

            const userGet = await user.findOne({
                where: {
                    id: otpGet.id_user,
                }
            })

            if (userGet.email !== req.body.email) throw ApiError.badRequest('otp invalid')

            return res.status(200).json({
                success: true,
                message: 'otp valid'
            })


        } catch (error) {
            next(error)
        }
    }

    static async resetPasswordWithoutLogin(req, res, next) {
        try {
            let { otp, password, email } = req.body
            if (!(otp)) throw ApiError.badRequest('masukkan otp')
            if (!(password)) throw ApiError.badRequest('masukkan password')
            if (!(email)) throw ApiError.badRequest('masukkan email')

            const userGet = await user.findOne({ where: { email } })
            if (!userGet) throw ApiError.badRequest('email tidak ditemukan')
            const id = userGet.id
            // return res.send(userGet)


            //ambil token
            // const token = verify(req.headers.token)
            // const { id, role, email } = token

            //verifikasi lebih lanjut
            if (!(await totp.findOne({ where: { id_user: id, otp } }))) throw ApiError.badRequest('otp atau id salah')

            //mengubah password
            await user.update({ password: bcrypt.hashSync(password, 10) }, { where: { id } })

            //menghapus data otp jika sudah register
            await totp.destroy({where: {id_user: id}})



            res.json({
                success: true,
                message: 'password berhasil diganti',
                // token: tokenRes
            })
        } catch (error) {
            next(error)
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
            // console.log(userGet.role)

            userGet = userGet.toJSON()
            let profile
            let batchGet
            if (userGet.role === 'murid') {
                console.log("sini")
                profile = await murid.findOne({
                    where: { id_user: id },
                    attributes: ['address', 'birthday_date', 'status', 'id_batch', 'photo_ktp', 'contact'],
                })
                batchGet = await batch.findOne({
                    where: { id: profile.id_batch },
                })
                // batchGet = batchGet.dataValues
                userGet.batch = batchGet.name
                // console.log(batchGet)

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
                    contact: req.body.contact,
                    // birthday_date: req.body.birthday_date,
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

    static async profileLoginHelper(userId) {
        try {
            let userGet = await user.findByPk(userId)
            if (userGet.role === 'murid') {
                userGet = await sequelize.query(`
                SELECT u.name, u.id, u.email, u.photo, u.role, b.name as "nama_batch" FROM users as u 
                JOIN murid as m ON m.id_user=u.id
                JOIN batch as b ON b.id = m.id_batch
                WHERE u.id = :id;
                `,
                    {
                        replacements: { id: userId },
                    }
                )
                userGet = userGet[0][0]
                // console.log(userGet)
                return userGet
            }
            userGet = userGet.toJSON()
            return userGet
            // console.log(userComplete)

        } catch (error) {
            console.log(error)
            throw error
        }

    }

    static async getAvailableBatch(req, res, next) {
        try {
           
            let batchGet = await batch.findAll({
                attributes: ['id', 'name'],
                where: {
                    start_date: {
                        [Op.gt]: new Date()
                    }
                }
            })
            
            console.log(batchGet)
            return res.status(200).json({
                success: true,
                message: 'data batch berhasil diambil',
                data: batchGet
            })
            // console.log("All users:", JSON.stringify(users, null, 2));
            // res.send(req.params.id)
        } catch (error) {
            next(error)
            // console.log(error)
            // res.status(400).send('terjadi error')

        }
    }

}
module.exports = User