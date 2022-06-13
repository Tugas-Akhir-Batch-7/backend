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
    function buat(name){
      for(let i = 1; i <= 15; i++){
        data.push({
          id_batch:i,
          name:`materi ujian ke ${i}`,
          ket: `${name} ${i}`,
          file:`[["123.jpg", null], ["file.docx", "materi tentang java script"]]`,
          date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    }
    buat('materi ini adalah untuk ujian ke')
    buat('basic jacavascript')
    buat('basic css')
    await queryInterface.bulkInsert('pertemuan', data);
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
