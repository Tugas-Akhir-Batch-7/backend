'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Batch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Batch.belongsTo(models.Guru, { targetKey: 'id', foreignKey: 'id_guru' })
    }
  }
  Batch.init({
    id_guru:  DataTypes.INTEGER,
    name: DataTypes.STRING,
    start_date: DataTypes.DATE,
    pay:  DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Batch',
    underscored: true,
    tableName: 'batch'
  });
  return Batch;
};