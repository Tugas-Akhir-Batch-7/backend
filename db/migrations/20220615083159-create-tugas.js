'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tugas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_pertemuan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pertemuan',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,

      },
      description: {
        type: Sequelize.STRING,
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
        fields:['id_pertemuan']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tugas');
  }
};