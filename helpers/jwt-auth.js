require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET || 'nama saya siapa';

const generateToken = (payload) => {
//   console.log(secretKey);
  const token = jwt.sign(payload, secretKey, {
    expiresIn: '100h',
    algorithm: 'HS256',
    issuer: 'FosanAcademy',
    audience: [payload.email],
  });

  return token;
};

const verify = (token) => jwt.verify(token, secretKey);

module.exports = {
  generateToken,
  verify,
};
