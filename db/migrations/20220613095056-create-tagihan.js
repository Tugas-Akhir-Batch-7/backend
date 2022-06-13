'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tagihan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_murid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'murid',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      total_bill: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, 
      dp: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_lunas: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tagihan');
  }
};