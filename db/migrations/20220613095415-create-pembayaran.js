'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pembayaran', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_tagihan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tagihan',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
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
    },{indexes:[
      {
        fields:['id_tagihan']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pembayaran');
  }
};