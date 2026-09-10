"use strict";

const { baseFields } = require("../src/database/base-fields.cjs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            ...baseFields(Sequelize),

            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            email: {
                type: Sequelize.STRING(191),
                allowNull: false,
                unique: true
            },

            username: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: true
            },

            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },

            email_verified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },

            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        await queryInterface.addIndex(
            "users",
            ["email"],
            {
                name: "users_email_index"
            }
        );

        await queryInterface.addIndex(
            "users",
            ["status"],
            {
                name: "users_status_index"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("users");
    }
};