'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ujian', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_guru: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'guru',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      id_batch: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'batch',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,

      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:Sequelize.NOW

      },
      time: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '02:00:00'

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
        fields:['id_guru', 'id_batch']
      }
    ]});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ujian');
  }
};