'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Otp.init({
    id_user: DataTypes.INTEGER,
    valid_until: DataTypes.DATE,
    otp: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Otp',
    underscored: true,
    tableName: 'otp'
  });
  return Otp;
};