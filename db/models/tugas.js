'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tugas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tugas.belongsTo(models.Pertemuan, { targetKey: 'id', foreignKey: 'id_pertemuan' })

      Tugas.hasMany(models.TugasSubmission, { targetKey: 'id', foreignKey: 'id_tugas' })
    }
  }
  Tugas.init({
    id_pertemuan: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Tugas',
    underscored: true,
    tableName: 'tugas'
  });
  return Tugas;
};