import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import Partner  from "./partner.model.js";

const User_Agent = sequelize.define('user_agent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  useragent_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
  },
   role:{
    type: DataTypes.ENUM('Admin','User'),
    allowNull: false,
  },
  partner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Partner,
      key: 'id'
    }
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
  tableName: 'user_agent',
  timestamps: true,   
  indexes: [
    {
      unique: true,
      fields: ['useragent_name']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['phone']
     },    
  ]
});

export default User_Agent;