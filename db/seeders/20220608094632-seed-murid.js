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
      let i = 1
      let x = 0
      let batch = 15
      function buat(status, ulang){
        for(; i <= 120 && x+(ulang*batch) > i;){
          for (let y = 1; y <= batch; y++) {
            let contact
            do {
              contact = Math.round(Math.random()*10000000000)
            } while (contact<1000000000);
            data.push({
            id_user: i+15,
            id_batch: y,
            photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
            address: `Jl. Raya no:${i}`,
            contact,
            birthday_date: new Date(),
            status,
            created_at: new Date(),
            updated_at: new Date()
            })
            i+=1
          }
        }
        x = i
      }
      buat('belum mendaftar', 1)
      buat('mendaftar', 1)
      buat('terdaftar', 4)
      buat('keluar', 1)
      buat('alumni', 1)
    await queryInterface.bulkInsert('murid', data);
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
