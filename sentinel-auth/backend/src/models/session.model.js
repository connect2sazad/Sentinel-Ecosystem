import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const Session = sequelize.define(
    "Session",
    {
        ...baseFields,

        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        refresh_token_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        ip_address: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        last_used_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },

    {
        ...baseOptions,

        tableName: "sessions",

        indexes: [
            {
                fields: ["user_id"]
            },

            {
                fields: ["expires_at"]
            },

            {
                fields: ["status"]
            }
        ]
    }
);

export default Session;