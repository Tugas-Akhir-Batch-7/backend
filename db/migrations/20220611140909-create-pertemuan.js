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
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      id_guru: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "guru",
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      name: {
        type: Sequelize.STRING
      },
      ket: {
        type: Sequelize.STRING
      },
      file: {
        type: Sequelize.JSON
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
        fields:['id_batch', 'id_guru']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pertemuan');
  }
};