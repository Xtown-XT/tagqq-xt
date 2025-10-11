// userConfig.model.js
import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const UserConfig = sequelize.define('UserConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  has_profile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  has_vehicle: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  has_aadhar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  has_license: { 
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  has_emergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull:true
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true
  }

}, {
  tableName: 'userConfig',
  timestamps: true
});

export default UserConfig;

