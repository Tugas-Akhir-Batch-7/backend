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
            photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
            created_at: new Date(),
            updated_at: new Date()
        }
        let data = []
        for (let i = 1; i <= 10; i++) {
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Admin Ganteng ${i}`,
                email: `testAdmin${i}@gmail.com`,
                role: 'admin',
                id: i
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Guru Pintar ${i}`,
                email: `testGuru${i}@gmail.com`,
                role: 'guru',
                id: i + 10
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i}`,
                email: `testMurid${i}@gmail.com`,
                role: 'murid',
                id: i + 20
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 10}`,
                email: `testMurid${i + 10}@gmail.com`,
                role: 'murid',
                id: i + 30
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 20}`,
                email: `testMurid${i + 20}@gmail.com`,
                role: 'murid',
                id: i + 40
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 30}`,
                email: `testMurid${i + 30}@gmail.com`,
                role: 'murid',
                id: i + 50
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 40}`,
                email: `testMurid${i + 40}@gmail.com`,
                role: 'murid',
                id: i + 60
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 50}`,
                email: `testMurid${i + 50}@gmail.com`,
                role: 'murid',
                id: i + 70
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 60}`,
                email: `testMurid${i + 60}@gmail.com`,
                role: 'murid',
                id: i + 80
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 70}`,
                email: `testMurid${i + 70}@gmail.com`,
                role: 'murid',
                id: i + 90
            })
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Murid Rajin ${i + 80}`,
                email: `testMurid${i + 80}@gmail.com`,
                role: 'murid',
                id: i + 100
            })
        }
        data = []
        for (let i = 1; i <= 10; i++) {
            data.push({
                email_verified_at: new Date(),
                password: await encryptPassword('password'),
                photo: 'https://avatars0.githubusercontent.com/u/43890987?s=460&v=4',
                created_at: new Date(),
                updated_at: new Date(),
                name: `Admin Ganteng ${i}`,
                email: `testAdmin${i}@gmail.com`,
                role: 'admin',
                // id: i
            })
        }
        await queryInterface.bulkInsert('users', data)

        // await queryInterface.bulkInsert('users', data)

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
