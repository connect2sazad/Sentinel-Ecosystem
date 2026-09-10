import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const User = sequelize.define(
    "User",
    {
        ...baseFields,

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,

            validate: {
                notEmpty: {
                    msg: "Name is required."
                },

                len: {
                    args: [2, 100],
                    msg: "Name must contain between 2 and 100 characters."
                }
            }
        },

        email: {
            type: DataTypes.STRING(191),
            allowNull: false,
            unique: true,

            validate: {
                notEmpty: {
                    msg: "Email is required."
                },

                isEmail: {
                    msg: "Please provide a valid email address."
                }
            }
        },

        username: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        email_verified_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },

    {
        ...baseOptions,

        tableName: "users",

        indexes: [
            {
                fields: ["email"]
            },

            {
                fields: ["status"]
            }
        ]
    }
);

export default User;