import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { baseFields, baseOptions } from "./base.model.js";

const OrganizationInvitation = sequelize.define(
    "OrganizationInvitation",
    {
        ...baseFields,

        organization_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(191),
            allowNull: false,
            validate: { isEmail: true }
        },

        token_hash: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },

        invited_by_user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        accepted_by_user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true
        },

        accepted_at: {
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
        tableName: "organization_invitations",
        indexes: [
            {
                name: "organization_invitations_org_email_index",
                fields: ["organization_id", "email"]
            }
        ]
    }
);

export default OrganizationInvitation;