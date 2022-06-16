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
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          onDelete: 'cascade',
          onUpdate: 'cascade'
        },
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
        fields:['id_user', 'id_batch']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('murid');
  }
};