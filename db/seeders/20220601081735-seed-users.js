'use strict';
const { encryptPassword } = require('../../helpers/bcrypt');

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
        let template = {
            email_verified_at: new Date(),
            password: await encryptPassword('password'),
            photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
            created_at: new Date(),
            updated_at: new Date()
        }
        let data = []
        async function buat(name, email, role, ulang) {
            for (let i = 1; i <= ulang; i++) {
                data.push({
                    email_verified_at: new Date(),
                    password: await encryptPassword('password'),
                    photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                    created_at: new Date(),
                    updated_at: new Date(),
                    name: `${name} ${i}`,
                    email: `${email}${i}@gmail.com`,
                    role
                })
            }
        }
        await buat('Admin Ganteng', 'testAdmin', 'admin', 5)
        await buat('Guru Rajin', 'testGuru', 'guru', 10)
        await buat('Murid Pintar', 'testPintar', 'murid', 120)
        await queryInterface.bulkInsert('users', data)
    },


    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('users', null, {});

    }
};
