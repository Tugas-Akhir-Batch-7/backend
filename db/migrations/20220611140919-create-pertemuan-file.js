'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pertemuan_file', {
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
          model: "pertemuan",
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      file: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ket: {
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
        fields:['id_pertemuan']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pertemuan_file');
  }
};