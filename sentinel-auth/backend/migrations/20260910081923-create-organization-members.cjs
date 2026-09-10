"use strict";

const { baseFields } = require("../src/database/base-fields.cjs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "organization_members",
            {
                ...baseFields(Sequelize),

                organization_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,

                    references: {
                        model: "organizations",
                        key: "id"
                    },

                    onUpdate: "CASCADE",
                    onDelete: "CASCADE"
                },

                user_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,

                    references: {
                        model: "users",
                        key: "id"
                    },

                    onUpdate: "CASCADE",
                    onDelete: "CASCADE"
                },

                role: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                    defaultValue: "member"
                },

                joined_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal(
                        "CURRENT_TIMESTAMP"
                    )
                }
            }
        );

        await queryInterface.addConstraint(
            "organization_members",
            {
                fields: [
                    "organization_id",
                    "user_id"
                ],

                type: "unique",

                name: "organization_members_unique_user"
            }
        );

        await queryInterface.addIndex(
            "organization_members",
            ["organization_id"],
            {
                name: "organization_members_organization_index"
            }
        );

        await queryInterface.addIndex(
            "organization_members",
            ["user_id"],
            {
                name: "organization_members_user_index"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable(
            "organization_members"
        );
    }
};