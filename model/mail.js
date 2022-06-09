const nodemailer = require('nodemailer')
let mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'faishalsample07@gmail.com',
        pass: 'qtaysfmkucpsfmjq'
    }
})

let mailOptions = {
    from: 'faishalsample07@gmail.com',
    subject: 'code otp'
}
module.exports = {mail, mailOptions}