const jwb = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const mv = require('mv')
const {QueryTypes, Op} = require('sequelize')

const db = require('../db/models')
const {mail, mailOptions} = require('../model/mail');
const { sequelize } = require("../db/models");
//db
// const sequelize = db.index
const user = db.User
const otpRegistrasi = db.otp_registrasi

const timeOtp = 15

const SU = {
    email: 'faishalsample07@gmail.com',
    password: 'faishalSample__07'
}

class User{
    static async login(req, res){
        try {
            //variabel
            const username = req.body.username
            const password = req.body.password

            //data user
            const data = await user.findOne({
                where: {
                    [Op.or]:{
                        name: username,
                        email: username
                    }
                }
            })

            //cek
            if(!data) throw 'username / email tidak ada'
            if(!bcrypt.compareSync(password, data.password)) throw 'password salah'

            console.log(data)
            res.json(data)
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async register(req, res){
        try {
            //variabel
            const name = req.body.username
            const password = bcrypt.hashSync(req.body.password, 10)
            const email = req.body.email
            const role = req.body.role
            const inOtp = req.body.otp
            let photo
            
            //cek
            if(!(name && password && email && role && inOtp)) throw 'masukkan semua data'
            
            //image
            if(req.file){ //jika memasukkan photo profile
                photo = req.file.filename
                if(!(req.file && /jpeg|jpg|png/.test(req.file.mimetype))) throw 'masukkan photo'
                mv(
                    `./public/-/${photo}`, 
                    `./public/img-profile/${photo}`, 
                    {clobber: false}, 
                    (err) => { if (err) throw 'gagal menyimpan gambar' }
                )
            }else{
                photo = 'default.png'
            }

            //cek otp
            let otp = await otpRegistrasi.findOne({where:{otp: inOtp}})
            if(!otp) throw 'otp tidak valid'

            //cek data
            if(new Date() > otp.valid_until) throw 'waktu otp limit'
            if(!(email == otp.email)) throw 'data tidak lengkap'

            //kirim data register ke database
            if(role == 'murid'){
                await user.create({name, email, password, role, email_verified_at: new Date(), photo})
            }else{
                await user.create({name, email, password, role, photo})
            }

            res.send('register berhasil')
        } catch (error) {
            console.log(error)
            res.status(400).json(['terjadi error', error])
        }
    }
    static async createOtpRegister(req, res){
        try {
            //variabel
            let emailOtp
            const email = req.body.email
            const role = req.body.role
            const usernameAdmin = req.body.usernameAdmin
            
            //cek email
            if(!(email && role)) throw 'lengkapi semua data'

            //role
            if(role == 'admin'){
                emailOtp = SU.email
            }else if(role == 'guru'){
                //cek penerima otp
                if(!usernameAdmin) throw 'masukkan username admin untuk menerima otp'
                //mencari email penerima
                emailOtp = await user.findOne({
                    attributes: ['email'],
                    where: {name: usernameAdmin, role: 'admin'}
                })
                //cek adat tidaknya username penerima email otp
                if(!emailOtp) throw 'username tidak ada'
                emailOtp = emailOtp.email
            }else if(role == 'murid'){
                //cek penerima otp
                if(!req.body.email) throw 'masukkan email'
                emailOtp = req.body.email
            }else{
                throw 'role tidak tersedia'
            }

            //otp
            let otp = 0
            while(otp < 100000 || otp > 999999){
                otp = Math.ceil(Math.random() * 1000000)
            }

            await sequelize.query(`INSERT INTO "otp_registrasi" 
                ("email", "otp", "valid_until", "updated_at", "created_at")
                VALUES ('${email}', '${otp}', '${new Date(new Date().getTime() + (1000*60* timeOtp)).toISOString()}', '${new Date().toISOString()}', '${new Date().toISOString()}')
                ON CONFLICT ("email")
                DO UPDATE SET
                    "email" = EXCLUDED."email",
                    "otp" = EXCLUDED."otp",
                    "valid_until" = EXCLUDED.valid_until,
                    "updated_at" = EXCLUDED.updated_at;`,
              {
                // replacements: [email, otp, new Date(new Date().getTime() + (1000*60* timeOtp)), new Date()],
                type: QueryTypes.UPSERT
              }
            )

            //kirim otp via email
            mailOptions.to = emailOtp
            mailOptions.text = `code otp\n${otp}`
            mail.sendMail(mailOptions, (err, info)=>{
                if(err){
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
}
module.exports = User