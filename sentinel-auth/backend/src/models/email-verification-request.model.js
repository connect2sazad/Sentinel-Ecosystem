import {
    DataTypes
} from "sequelize";

import sequelize from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const EmailVerificationRequest =
    sequelize.define(
        "EmailVerificationRequest",
        {
            ...baseFields,

            user_id: {
                type:
                    DataTypes.BIGINT.UNSIGNED,

                allowNull:
                    false
            },

            email: {
                type:
                    DataTypes.STRING(
                        150
                    ),

                allowNull:
                    false
            },

            otp_hash: {
                type:
                    DataTypes.STRING(
                        255
                    ),

                allowNull:
                    false
            },

            expires_at: {
                type:
                    DataTypes.DATE,

                allowNull:
                    false
            },

            attempts: {
                type:
                    DataTypes.INTEGER,

                allowNull:
                    false,

                defaultValue:
                    0
            },

            verified_at: {
                type:
                    DataTypes.DATE,

                allowNull:
                    true
            },

            consumed_at: {
                type:
                    DataTypes.DATE,

                allowNull:
                    true
            }
        },
        {
            ...baseOptions,

            tableName:
                "email_verification_requests"
        }
    );

export default EmailVerificationRequest;