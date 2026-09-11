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
            "organization_requests",
            {
                ...baseFields(
                    Sequelize
                ),

                requested_by_user_id: {
                    type:
                        Sequelize.BIGINT.UNSIGNED,

                    allowNull:
                        false,

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

                name: {
                    type:
                        Sequelize.STRING(
                            150
                        ),

                    allowNull:
                        false
                },

                legal_name: {
                    type:
                        Sequelize.STRING(
                            200
                        ),

                    allowNull:
                        true
                },

                business_identifier: {
                    type:
                        Sequelize.STRING(
                            150
                        ),

                    allowNull:
                        true
                },

                country: {
                    type:
                        Sequelize.STRING(
                            100
                        ),

                    allowNull:
                        true
                },

                email: {
                    type:
                        Sequelize.STRING(
                            150
                        ),

                    allowNull:
                        true
                },

                website: {
                    type:
                        Sequelize.STRING(
                            255
                        ),

                    allowNull:
                        true
                },

                domain: {
                    type:
                        Sequelize.STRING(
                            255
                        ),

                    allowNull:
                        true
                },

                verification_method: {
                    type:
                        Sequelize.ENUM(
                            "manual",
                            "business_identifier",
                            "email_domain",
                            "domain_ownership"
                        ),

                    allowNull:
                        false,

                    defaultValue:
                        "manual"
                },

                verification_status: {
                    type:
                        Sequelize.ENUM(
                            "pending",
                            "approved",
                            "rejected"
                        ),

                    allowNull:
                        false,

                    defaultValue:
                        "pending"
                },

                reviewed_by_user_id: {
                    type:
                        Sequelize.BIGINT.UNSIGNED,

                    allowNull:
                        true,

                    references: {
                        model:
                            "users",

                        key:
                            "id"
                    },

                    onUpdate:
                        "CASCADE",

                    onDelete:
                        "SET NULL"
                },

                reviewed_at: {
                    type:
                        Sequelize.DATE,

                    allowNull:
                        true
                },

                rejection_reason: {
                    type:
                        Sequelize.TEXT,

                    allowNull:
                        true
                }
            }
        );

        await queryInterface.addIndex(
            "organization_requests",
            [
                "requested_by_user_id"
            ]
        );

        await queryInterface.addIndex(
            "organization_requests",
            [
                "verification_status"
            ]
        );

        await queryInterface.addIndex(
            "organization_requests",
            [
                "business_identifier"
            ]
        );
    },

    async down(
        queryInterface
    ) {
        await queryInterface.dropTable(
            "organization_requests"
        );
    }
};