'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Murid extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Murid.belongsTo(models.User, { targetKey: 'id', foreignKey: 'id_user' }),
      Murid.belongsTo(models.Batch, { targetKey: 'id', foreignKey: 'id_batch' })
    }
  }
  Murid.init({
    id_user: DataTypes.INTEGER,
    id_batch: DataTypes.INTEGER,
    photo_ktp: DataTypes.STRING,
    address: DataTypes.STRING,
    contact: DataTypes.STRING,
    birthday_date : DataTypes.DATE,
    status: DataTypes.ENUM('belum mendaftar', 'mendaftar', 'terdaftar', 'alumni', 'keluar')
  }, {
    sequelize,
    modelName: 'Murid',
    underscored: true,
    tableName: 'murid'

  });
  return Murid;
};