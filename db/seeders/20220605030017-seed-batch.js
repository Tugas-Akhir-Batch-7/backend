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
    for (let i = 1; i <= 10; i++) {
      data.push({
        id:i,
        id_guru: i,
        pay: 1000000,
        name: `Fullstack Javascript Batch ${i}`,
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+10,
        id_guru: i,
        pay: 2000000,
        name: `Fullstack Javascript Batch ${i+10}`,
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+20,
        id_guru: i,
        pay: 3000000,
        name: `Fullstack Javascript Batch ${i+20}`,
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
    }
    await queryInterface.bulkInsert('batch',data)

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
