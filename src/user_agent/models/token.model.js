import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import User_Agent from './user_agent.model.js';

const Token = sequelize.define('token', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  useragent_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User_Agent,
      key: 'id'
    }
  },
  token:{
    type: DataTypes.STRING(500),
    allowNull: false,
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
  tableName: 'token',
  timestamps: true,   
  indexes: [
    {
      unique: true,
      fields: ['token']
    },    
  ]
});

export default Token;