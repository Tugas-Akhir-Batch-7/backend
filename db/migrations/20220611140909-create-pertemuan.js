'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pertemuan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_batch: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "batch",
        },
        onDelete: 'set null',
        onUpdate: 'cascade'
      },
      id_guru: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "guru",
        },
        onDelete: 'set null',
        onUpdate: 'cascade'
      },
      name: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      upload: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('pertemuan');
  }
};