'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pertemuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pertemuan.belongsTo(models.Batch, { targetKey: 'id', foreignKey: 'id_batch' })
      pertemuan.belongsTo(models.Guru, { targetKey: 'id', foreignKey: 'id_guru' })
    }
  }
  pertemuan.init({
    id_batch: DataTypes.INTEGER,
    id_guru: DataTypes.INTEGER,
    name: DataTypes.STRING,
    ket: DataTypes.STRING,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Pertemuan',
    underscored: true,
    tableName: 'pertemuan',
  });
  return pertemuan;
};