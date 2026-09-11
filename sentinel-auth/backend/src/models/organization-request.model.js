import {
    DataTypes
} from "sequelize";

import sequelize
    from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const OrganizationRequest =
    sequelize.define(
        "OrganizationRequest",
        {
            ...baseFields,

            organization_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true
            },

            requested_by_user_id: {
                type:
                    DataTypes.BIGINT.UNSIGNED,

                allowNull:
                    false
            },

            name: {
                type:
                    DataTypes.STRING(
                        150
                    ),

                allowNull:
                    false
            },

            legal_name: {
                type:
                    DataTypes.STRING(
                        200
                    ),

                allowNull:
                    true
            },

            business_identifier: {
                type:
                    DataTypes.STRING(
                        150
                    ),

                allowNull:
                    true
            },

            country: {
                type:
                    DataTypes.STRING(
                        100
                    ),

                allowNull:
                    true
            },

            email: {
                type:
                    DataTypes.STRING(
                        150
                    ),

                allowNull:
                    true
            },

            website: {
                type:
                    DataTypes.STRING(
                        255
                    ),

                allowNull:
                    true
            },

            domain: {
                type:
                    DataTypes.STRING(
                        255
                    ),

                allowNull:
                    true
            },

            verification_method: {
                type:
                    DataTypes.ENUM(
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
                    DataTypes.ENUM(
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
                    DataTypes.BIGINT.UNSIGNED,

                allowNull:
                    true
            },

            reviewed_at: {
                type:
                    DataTypes.DATE,

                allowNull:
                    true
            },

            rejection_reason: {
                type:
                    DataTypes.TEXT,

                allowNull:
                    true
            }
        },
        {
            ...baseOptions,

            tableName:
                "organization_requests"
        }
    );

export default OrganizationRequest;