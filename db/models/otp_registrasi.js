'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class otp_registrasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  otp_registrasi.init({
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    otp: DataTypes.INTEGER,
    valid_until: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Otp_registrasi',
    underscored: true,
    tableName: 'otp_registrasi'
  });
  return otp_registrasi;
};