"use strict";

const { baseFields } = require("../src/database/base-fields.cjs");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("sessions", {
            ...baseFields(Sequelize),

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

            refresh_token_hash: {
                type: Sequelize.STRING(255),
                allowNull: false
            },

            ip_address: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            user_agent: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },

            last_used_at: {
                type: Sequelize.DATE,
                allowNull: true
            },

            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        await queryInterface.addIndex(
            "sessions",
            ["user_id"],
            {
                name: "sessions_user_index"
            }
        );

        await queryInterface.addIndex(
            "sessions",
            ["expires_at"],
            {
                name: "sessions_expires_index"
            }
        );

        await queryInterface.addIndex(
            "sessions",
            ["status"],
            {
                name: "sessions_status_index"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("sessions");
    }
};