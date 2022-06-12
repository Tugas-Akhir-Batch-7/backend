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
     await queryInterface.bulkInsert('pertemuan', [{
       id_batch:'1',
       id_guru:'1',
       name:'materi ujian',
       upload:`{
        "file":["123.jpg", "file.docx"],
        "text":["materi ujian, silahkan dipejari di google"],
        "link":["google.com"]
       }`,
       created_at: new Date(),
       updated_at: new Date()
      }], {});
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
