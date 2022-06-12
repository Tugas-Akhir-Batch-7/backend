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
      absensi.belongsTo(models.Batch, { targetKey: 'id', foreignKey: 'id_batch' })
    }
  }
  absensi.init({
    id_batch: DataTypes.INTEGER,
    id_murid: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Absensi',
    underscored: true,
    tableName: 'absensi',
  });
  return absensi;
};