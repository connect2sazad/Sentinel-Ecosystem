const baseFields = (Sequelize) => ({
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    remarks: {
        type: Sequelize.TEXT,
        allowNull: true
    },

    tags: {
        type: Sequelize.JSON,
        allowNull: true
    },

    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    created_at: {
        type: Sequelize.DATE,
        allowNull: false
    },

    updated_at: {
        type: Sequelize.DATE,
        allowNull: false
    },

    deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
    }
});

module.exports = {
    baseFields
};