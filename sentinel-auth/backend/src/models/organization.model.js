import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

import {
    baseFields,
    baseOptions
} from "./base.model.js";

const Organization = sequelize.define(
    "Organization",
    {
        ...baseFields,

        name: {
            type: DataTypes.STRING(150),
            allowNull: false,

            validate: {
                notEmpty: {
                    msg: "Organization name is required."
                },

                len: {
                    args: [2, 150],
                    msg: "Organization name must contain between 2 and 150 characters."
                }
            }
        },

        slug: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },

        legal_name: {
            type: DataTypes.STRING(200),
            allowNull: true
        },

        email: {
            type: DataTypes.STRING(191),
            allowNull: true,

            validate: {
                isEmail: {
                    msg: "Please provide a valid organization email address."
                }
            }
        },

        phone: {
            type: DataTypes.STRING(50),
            allowNull: true
        },

        website: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },

    {
        ...baseOptions,

        tableName: "organizations",

        indexes: [
            {
                fields: ["slug"]
            },

            {
                fields: ["status"]
            }
        ]
    }
);

export default Organization;