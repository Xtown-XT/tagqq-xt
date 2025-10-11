import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import User from './user.model.js';

const Delivery_address = sequelize.define('delivery_address',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    address1: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    address2: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    district: {
        type: DataTypes.STRING,
        allownull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull:false
    },
    pincode: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
     is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
            notEmpty: true  
        }
    },
},  
{
  tableName: 'delivery_address',
  timestamps: true,  
});

export default Delivery_address;
