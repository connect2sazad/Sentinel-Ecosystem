"use strict";

const { baseFields } = require("../src/database/base-fields.cjs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("organizations", {
            ...baseFields(Sequelize),

            name: {
                type: Sequelize.STRING(150),
                allowNull: false
            },

            slug: {
                type: Sequelize.STRING(150),
                allowNull: false,
                unique: true
            },

            legal_name: {
                type: Sequelize.STRING(200),
                allowNull: true
            },

            email: {
                type: Sequelize.STRING(191),
                allowNull: true
            },

            phone: {
                type: Sequelize.STRING(50),
                allowNull: true
            },

            website: {
                type: Sequelize.STRING(255),
                allowNull: true
            }
        });

        await queryInterface.addIndex(
            "organizations",
            ["slug"],
            {
                name: "organizations_slug_index"
            }
        );

        await queryInterface.addIndex(
            "organizations",
            ["status"],
            {
                name: "organizations_status_index"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("organizations");
    }
};