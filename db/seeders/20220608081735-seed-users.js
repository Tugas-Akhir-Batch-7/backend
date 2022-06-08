'use strict';
const {encryptPassword} = require('../../helpers/bcrypt');

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
   await queryInterface.bulkInsert('users',  [
     {
        name: 'Admin',
        email: 'testadmin@gmail.com',
        password: await encryptPassword('password'), 
        email_verified_at: new Date(),
        photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
     }
   ])
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
