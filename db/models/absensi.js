'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class absensi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      absensi.belongsTo(models.Murid, { targetKey: 'id', foreignKey: 'id_murid' }),
      absensi.belongsTo(models.Pertemuan, { targetKey: 'id', foreignKey: 'id_pertemuan' })
    }
  }
  absensi.init({
    id_pertemuan: DataTypes.INTEGER,
    id_murid: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Absensi',
    underscored: true,
    tableName: 'absensi',
  });
  return absensi;
};