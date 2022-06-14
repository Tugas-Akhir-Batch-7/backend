'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ujian_submission', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_ujian: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ujian',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
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
      score: {
        type: Sequelize.INTEGER
      },
      submit_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      submit_link: {
        allowNull: false,
        type: Sequelize.STRING
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
    await queryInterface.dropTable('ujian_submission');
  }
};