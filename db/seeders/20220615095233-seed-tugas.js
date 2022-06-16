'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let data = []
    let obj = {
      id_pertemuan: 1,
      name: 'tugas OOP 1',
      description: 'description tugas OOP 1',
      created_at: new Date(),
      updated_at: new Date()
    }
    data.push(obj)
    obj = {
      id_pertemuan: 1,
      name: 'tugas MVC 1',
      description: 'description tugas MVC 1',
      created_at: new Date(),
      updated_at: new Date()
    }
    data.push(obj)
    await queryInterface.bulkInsert('tugas', data);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
