'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tagihan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tagihan.belongsTo(models.Murid, { targetKey: 'id', foreignKey: 'id_murid' })

    }
  }
  Tagihan.init({
    id_murid: DataTypes.INTEGER,
    total_bill: DataTypes.INTEGER,
    is_lunas: DataTypes.BOOLEAN,
    dp: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Tagihan',
    underscored: true,
    tableName: 'tagihan'
  });
  return Tagihan;
};