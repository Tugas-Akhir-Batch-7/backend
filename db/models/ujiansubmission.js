'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UjianSubmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UjianSubmission.belongsTo(models.Ujian, { targetKey: 'id', foreignKey: 'id_ujian' })
      UjianSubmission.belongsTo(models.Murid, { targetKey: 'id', foreignKey: 'id_murid' })
    }
  }
  UjianSubmission.init({
    id_ujian: DataTypes.INTEGER,
    id_murid: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    submit_date: DataTypes.DATE,
    submit_link: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UjianSubmission',
    underscored: true,
    tableName: 'ujian_submission'
  });
  return UjianSubmission;
};