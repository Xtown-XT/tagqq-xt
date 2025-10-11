import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Enhancements = sequelize.define('Enhancements', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  submitter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: { isUUID: 4 },
  },
  submitter_role: {              
    type: DataTypes.ENUM('admin', 'captain', 'user'),
    allowNull: false,
  },
  docs_name: {
    type: DataTypes.ENUM('Suggestions', 'Issues'),
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  status: {
    type: DataTypes.ENUM('processing', 'addressed', 'cleared'),
    defaultValue: 'processing',
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: { isUUID: 4 },
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: { isUUID: 4 },
  },
}, {
  tableName: 'enhancements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

export default Enhancements;