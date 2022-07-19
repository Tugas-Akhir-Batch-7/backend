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
    function buat(name, pay, ulang){
        for(let i = 1; i <= ulang; i++){
            data.push({
              id_guru: i,
              pay: pay,
              name: `${name} ${i}`,
              start_date: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            })
        }
    }
    buat('Fullstack Javascript Batch', 1000000, 5)
    buat('Fullstack PHP Batch', 1000000, 5)
    buat('Fullstack C++ Batch', 1000000, 5)

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
