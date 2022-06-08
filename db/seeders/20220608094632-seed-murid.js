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
    await queryInterface.bulkInsert('murid', [
      {
        id_user: 3,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: 'Jl. Raya',
        status: 'mendaftar',
        created_at: new Date(),
        updated_at: new Date()
      }]);
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
