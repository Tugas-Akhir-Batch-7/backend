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
        id:i,
        id_batch:i,
        name:`materi ujian ke ${i}`,
        upload:`{
        "file":["123.jpg", "file.docx"],
        "text":["materi ujian, silahkan dipejari di google"],
        "link":["google.com"]
        }`,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+10,
        id_batch:i,
        name:`materi ujian ke ${i+10}`,
        upload:`{
        "file":["123.jpg", "file.docx"],
        "text":["materi ujian, silahkan dipejari di google"],
        "link":["google.com"]
        }`,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+20,
        id_batch:i,
        name:`materi ujian ke ${i+20}`,
        upload:`{
        "file":["123.jpg", "file.docx"],
        "text":["materi ujian, silahkan dipejari di google"],
        "link":["google.com"]
        }`,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
    }
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
