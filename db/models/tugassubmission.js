'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TugasSubmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TugasSubmission.belongsTo(models.Tugas, { targetKey: 'id', foreignKey: 'id_tugas' })
      TugasSubmission.belongsTo(models.Murid, { targetKey: 'id', foreignKey: 'id_murid' })
    }
  }
  TugasSubmission.init({
    id_tugas: DataTypes.INTEGER,
    id_murid: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    submit_date: DataTypes.DATE,
    submit_link: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TugasSubmission',
    underscored: true,
    tableName: 'tugas_submission'
  });
  return TugasSubmission;
};