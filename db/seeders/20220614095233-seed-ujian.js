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
      id_batch: 1,
      pengawas: 'pengawas 1',
      name: 'Ujian OOP 1',
      date: new Date("2022-06-10T16:00:00"),
      time: "02:00:00",
      created_at: new Date(),
      updated_at: new Date()
    }
    data.push(obj)
    obj = {
      id_batch: 1,
      pengawas: 'pengawas 2',
      name: 'Ujian MVC 1',
      date: new Date("2022-06-17T16:00:00"),
      time: "02:00:00",
      created_at: new Date(),
      updated_at: new Date()
    }
    data.push(obj)
    await queryInterface.bulkInsert('ujian', data);
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
