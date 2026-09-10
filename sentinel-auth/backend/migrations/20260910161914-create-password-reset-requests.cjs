"use strict";

const {
    baseFields
} = require("../src/database/base-fields.cjs");

module.exports = {
    async up(
        queryInterface,
        Sequelize
    ) {
        await queryInterface.createTable(
            "password_reset_requests",
            {
                ...baseFields(
                    Sequelize
                ),

                user_id: {
                    type:
                        Sequelize.BIGINT.UNSIGNED,

                    allowNull: false,

                    references: {
                        model:
                            "users",

                        key:
                            "id"
                    },

                    onUpdate:
                        "CASCADE",

                    onDelete:
                        "CASCADE"
                },

                email: {
                    type:
                        Sequelize.STRING(
                            150
                        ),

                    allowNull:
                        false
                },

                otp_hash: {
                    type:
                        Sequelize.STRING(
                            255
                        ),

                    allowNull:
                        false
                },

                expires_at: {
                    type:
                        Sequelize.DATE,

                    allowNull:
                        false
                },

                attempts: {
                    type:
                        Sequelize.INTEGER,

                    allowNull:
                        false,

                    defaultValue:
                        0
                },

                verified_at: {
                    type:
                        Sequelize.DATE,

                    allowNull:
                        true
                },

                reset_token_hash: {
                    type:
                        Sequelize.STRING(
                            64
                        ),

                    allowNull:
                        true
                },

                reset_token_expires_at: {
                    type:
                        Sequelize.DATE,

                    allowNull:
                        true
                },

                consumed_at: {
                    type:
                        Sequelize.DATE,

                    allowNull:
                        true
                }
            }
        );

        await queryInterface.addIndex(
            "password_reset_requests",
            [
                "user_id"
            ]
        );

        await queryInterface.addIndex(
            "password_reset_requests",
            [
                "email"
            ]
        );

        await queryInterface.addIndex(
            "password_reset_requests",
            [
                "reset_token_hash"
            ]
        );

        await queryInterface.addIndex(
            "password_reset_requests",
            [
                "expires_at"
            ]
        );
    },

    async down(
        queryInterface
    ) {
        await queryInterface.dropTable(
            "password_reset_requests"
        );
    }
};