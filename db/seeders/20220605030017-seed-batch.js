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

    await queryInterface.bulkInsert('batch', [
      {
        name: "Fullstack Javascript Batch 1",
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Fullstack Javascript Batch 2",
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
    ]
    )

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
