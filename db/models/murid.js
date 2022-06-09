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
      Murid.belongsTo(models.User),
      Murid.belongsTo(models.Batch)
    }
  }
  Murid.init({
    photo_ktp: DataTypes.STRING,
    address: DataTypes.STRING,
    birthday_date : DataTypes.DATE,
    status: DataTypes.STRING,
    id_user: DataTypes.INTEGER,
    id_batch: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Murid',
    underscored: true,
    tableName: 'murid'

  });
  return Murid;
};