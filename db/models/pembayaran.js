'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pembayaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pembayaran.belongsTo(models.Tagihan, { targetKey: 'id', foreignKey: 'id_tagihan' })
    }
  }
  Pembayaran.init({
    id_tagihan: DataTypes.INTEGER,
    date: DataTypes.DATE,
    amount: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Pembayaran',
    underscored: true,
    tableName: 'pembayaran'
  });
  return Pembayaran;
};