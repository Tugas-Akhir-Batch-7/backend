'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ujian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ujian.belongsTo(models.Batch, { targetKey: 'id', foreignKey: 'id_batch' })
      Ujian.belongsTo(models.Guru, { targetKey: 'id', foreignKey: 'id_guru' })

      Ujian.hasMany(models.UjianSubmission, { targetKey: 'id', foreignKey: 'id_ujian' })
    }
  }
  Ujian.init({
    id_guru: DataTypes.INTEGER,
    id_batch: DataTypes.INTEGER,
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    time: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'Ujian',
    underscored: true,
    tableName: 'ujian'
  });
  return Ujian;
};