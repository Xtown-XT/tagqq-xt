import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import State from '../models/address.state.models.js';

const District = sequelize.define('district', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: State,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: 0,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'district',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

export default District;
