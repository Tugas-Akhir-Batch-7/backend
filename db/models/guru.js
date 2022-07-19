'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guru extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Guru.belongsTo(models.User, { targetKey: 'id', foreignKey: 'id_user' })
    }
  }
  Guru.init({
    id_user: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Guru',
    underscored: true,
    tableName: 'guru'
  });
  return Guru;
};