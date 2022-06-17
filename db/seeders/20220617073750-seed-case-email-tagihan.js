'use strict';
const { sequelize } = require("../../db/models");
const bcrypt = require('bcrypt');

const User = require('../../db/models').User;
const Batch = require('../../db/models').Batch;

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
    const t = await sequelize.transaction();
    try {
      // const newBatch = await User.create({
      //   name: 'Batch Case Belum Bayar',
      //   // email: '

      //   // email: 
      // })
      const newUser = await User.create({
        name: "Murid Belum Bayar",
        email: "belumBayar" + Math.floor(Math.random() * 100) + "@gmail.com",
        password: bcrypt.hashSync("password", 10),
        role: "murid",
        email_verified_at: new Date(),
        // createdAt: new Date(),
        // updatedAt: new Date(),
        photo: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
      }, { transaction: t });
      console.log(newUser.id);
      // const 
      const newMurid = await Murid.create({
        user_id: newUser.id,
        // nama: "Murid Belum Bayar",
      })

      t.commit();
      // console.log(User)
      return

    } catch (error) {
      t.rollback();
      console.log(error)
    }

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
