import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const BloodGroup = sequelize.define('BloodGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: 0
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'blood_group',
  timestamps: true,             
  createdAt: 'created_at',       
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',       
  paranoid: true,                
  underscored: true              
});

export default BloodGroup;
