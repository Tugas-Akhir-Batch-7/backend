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
        id_user: i+20,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i}`,
        birthday_date: new Date(),
        status: 'belum mendaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+10,
        id_user: i+30,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+30}`,
        birthday_date: new Date(),
        status: 'mendaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+30,
        id_user: i+40,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+40}`,
        birthday_date: new Date(),
        status: 'terdaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+40,
        id_user: i+50,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+50}`,
        birthday_date: new Date(),
        status: 'terdaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+50,
        id_user: i+60,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+60}`,
        birthday_date: new Date(),
        status: 'terdaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+60,
        id_user: i+70,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+70}`,
        birthday_date: new Date(),
        status: 'terdaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+70,
        id_user: i+80,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+80}`,
        birthday_date: new Date(),
        status: 'terdaftar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+80,
        id_user: i+90,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+90}`,
        birthday_date: new Date(),
        status: 'keluar',
        created_at: new Date(),
        updated_at: new Date()
      })
      data.push({
        id:i+90,
        id_user: i+100,
        id_batch: i,
        photo_ktp: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
        address: `Jl. Raya no:${i+100}`,
        birthday_date: new Date(),
        status: 'alumni',
        created_at: new Date(),
        updated_at: new Date()
      })
     }
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
