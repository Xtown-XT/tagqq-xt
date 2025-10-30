import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Captainconfig = sequelize.define('Captainconfig', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
       captain_id: {                
        type: DataTypes.UUID,
        allowNull: true
    },
    target: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    point_per_sale: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    point_per_rupee: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    bonus_percent: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    tableName: 'captain_config',
    timestamps: true,
    paranoid: true,
});

export default Captainconfig;
