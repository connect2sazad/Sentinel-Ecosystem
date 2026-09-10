import { DataTypes } from "sequelize";

export const baseFields = {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    tags: {
        type: DataTypes.JSON,
        allowNull: true
    },

    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
};

export const baseOptions = {
    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",

    paranoid: true,
    deletedAt: "deleted_at",

    underscored: true
};