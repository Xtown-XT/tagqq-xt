import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import Orders from './orders.model.js';

const Qrcode = sequelize.define('qrcode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Orders,
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      notEmpty: true
    }
  },      
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
}, 
{
  tableName: 'qrcode',
  timestamps: true,   
  
});

export default Qrcode;         