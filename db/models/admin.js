'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.belongsTo(models.User, { targetKey: 'id', foreignKey: 'id_user' })
    }
  }
  Admin.init({
    id_user: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Admin',
    underscored: true,
    tableName: 'admin'
  });
  return Admin;
};