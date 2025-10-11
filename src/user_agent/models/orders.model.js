import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import Partner  from "./partner.model.js";
import User from '../../endUser/models/user.model.js';
import User_Agent from './user_agent.model.js';
import Adminuser from '../../admin_user/models/admin_user.models.js';

const Orders = sequelize.define('orders', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  order_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  no_of_qr_ordered: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  no_of_qr_delivered: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  partner_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Partner,
      key: 'id'
    }
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Adminuser,
      key: 'id'
    }
  },
  order_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
   status:{
    type: DataTypes.ENUM('processing','delivered', 'fulfillment'),
    defaultValue: 'processing',
    allowNull: false,
  },
  view: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    validate: {
      notEmpty: true
    }
  },
  view_time: {
    type: DataTypes.DATE,   
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
  tableName: 'orders',
  timestamps: true,   
  indexes: [
    {
      unique: true,
      fields: ['order_code']
    }
  ]
});

export default Orders;

