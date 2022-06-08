const bcrypt = require('bcrypt');

const saltRounds = 10;

class Encrypt {
  static encryptPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        // Store hash in your password DB.
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  static comparePassword(passwordEncrypted, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, passwordEncrypted, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = Encrypt;
