import {
    DataTypes
} from "sequelize";

import sequelize from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const PasswordResetRequest =
    sequelize.define(
        "PasswordResetRequest",
        {
            ...baseFields,

            user_id: {
                type:
                    DataTypes.BIGINT.UNSIGNED,

                allowNull: false
            },

            email: {
                type:
                    DataTypes.STRING(150),

                allowNull: false
            },

            otp_hash: {
                type:
                    DataTypes.STRING(255),

                allowNull: false
            },

            expires_at: {
                type:
                    DataTypes.DATE,

                allowNull: false
            },

            attempts: {
                type:
                    DataTypes.INTEGER,

                allowNull: false,

                defaultValue: 0
            },

            verified_at: {
                type:
                    DataTypes.DATE,

                allowNull: true
            },

            reset_token_hash: {
                type:
                    DataTypes.STRING(64),

                allowNull: true
            },

            reset_token_expires_at: {
                type:
                    DataTypes.DATE,

                allowNull: true
            },

            consumed_at: {
                type:
                    DataTypes.DATE,

                allowNull: true
            }
        },
        {
            ...baseOptions,

            tableName:
                "password_reset_requests"
        }
    );

export default PasswordResetRequest;