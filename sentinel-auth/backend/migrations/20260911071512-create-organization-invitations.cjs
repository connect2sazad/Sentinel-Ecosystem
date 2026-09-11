"use strict";

const { baseFields } = require("../src/database/base-fields.cjs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("organization_invitations", {
            ...baseFields(Sequelize),

            organization_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: { model: "organizations", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT"
            },

            email: {
                type: Sequelize.STRING(191),
                allowNull: false
            },

            token_hash: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true
            },

            invited_by_user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: { model: "users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT"
            },

            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },

            accepted_by_user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: { model: "users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT"
            },

            accepted_at: {
                type: Sequelize.DATE,
                allowNull: true
            },

            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        await queryInterface.addIndex(
            "organization_invitations",
            ["organization_id", "email"],
            { name: "organization_invitations_org_email_index" }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("organization_invitations");
    }
};