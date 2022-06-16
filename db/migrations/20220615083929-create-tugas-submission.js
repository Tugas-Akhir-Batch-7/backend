'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tugas_submission', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_tugas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tugas',
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
        type: Sequelize.DATE,
        defaultValue:Sequelize.NOW
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
    },{indexes:[
      {
        fields:['id_tugas', 'id_murid']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tugas_submission');
  }
};