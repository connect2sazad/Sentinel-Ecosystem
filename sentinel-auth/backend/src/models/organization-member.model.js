import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const OrganizationMember = sequelize.define(
    "OrganizationMember",
    {
        ...baseFields,

        organization_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "member",

            validate: {
                isIn: {
                    args: [[
                        "owner",
                        "admin",
                        "member"
                    ]],

                    msg: "Invalid organization role."
                }
            }
        },

        joined_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },

    {
        ...baseOptions,

        tableName: "organization_members",

        indexes: [
            {
                unique: true,

                fields: [
                    "organization_id",
                    "user_id"
                ]
            },

            {
                fields: ["organization_id"]
            },

            {
                fields: ["user_id"]
            }
        ]
    }
);

export default OrganizationMember;