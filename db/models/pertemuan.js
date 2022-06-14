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
    }
  }
  pertemuan.init({
    id_batch: DataTypes.INTEGER,
    name: DataTypes.STRING,
    ket: DataTypes.STRING,
    file: DataTypes.JSON,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Pertemuan',
    underscored: true,
    tableName: 'pertemuan',
  });
  return pertemuan;
};