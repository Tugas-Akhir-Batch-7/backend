'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('absensi', {
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
      id_murid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "murid",
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },{indexes: [
      {
        unique: true,
        fields: ['id_murid', 'id_pertemuan']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('absensi');
  }
};