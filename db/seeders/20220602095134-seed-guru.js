'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
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
        id_user: i+5,
        created_at: new Date(),
        updated_at: new Date()
      })
    }
     await queryInterface.bulkInsert('guru', data);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
