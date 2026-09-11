"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("organization_requests", "organization_id", {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: "organizations",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("organization_requests", "organization_id");
    }
};