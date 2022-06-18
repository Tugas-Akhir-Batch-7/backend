'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pertemuanFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pertemuanFile.belongsTo(models.Pertemuan, { targetKey: 'id', foreignKey: 'id_pertemuan' })
    }
  }
  pertemuanFile.init({
    id_pertemuan: DataTypes.INTEGER,
    file: DataTypes.STRING,
    ket: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PertemuanFile',
    underscored: true,
    tableName: 'pertemuan_file',
  });
  return pertemuanFile;
};