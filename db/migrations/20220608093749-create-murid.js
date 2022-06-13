'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('murid', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_batch: {
        type: Sequelize.INTEGER,
        references: {
          model: 'batch',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      photo_ktp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      birthday_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('belum mendaftar', 'mendaftar', 'terdaftar', 'alumni', 'keluar', '123'),
        defaultValue: 'belum mendaftar'
      },
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('murid');
  }
};