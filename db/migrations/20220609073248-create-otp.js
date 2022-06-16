'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otp', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,

      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: false,

      },
      otp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },{indexes:[
      {
        fields:['id_user']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('otp');
  }
};