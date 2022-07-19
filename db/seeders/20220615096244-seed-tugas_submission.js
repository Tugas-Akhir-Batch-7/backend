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
    //  31, 46, 61, 76
    const id_murid = [
      31, 46, 61, 76
    ]
    const seed = id_murid.map(id => {
      return {
        id_murid: id,
        id_tugas: 1,
        submit_link: 'https://www.google.com',
        score: Math.round(Math.random() * 100),
        submit_date: new Date("2022-06-10T18:00:00"),
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    await queryInterface.bulkInsert('tugas_submission', seed);
    const deleteOne = id_murid.pop()
    const seed2  = id_murid.map(id => {
      return {
        id_murid: id,
        id_tugas: 2,
        submit_link: 'https://www.google.com',
        submit_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    await queryInterface.bulkInsert('tugas_submission', seed2);

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
