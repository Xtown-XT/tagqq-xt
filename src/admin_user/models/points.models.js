// src/models/points.model.js
import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import User_Agent from '../../user_agent/models/user_agent.model.js';

const Points = sequelize.define(
  'Points',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    referral_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: 'user_agents',   
      //   key: 'id',
      // },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 0 },
    },
    remarks: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by', 
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'updated_by',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'points',
    underscored: false,
    timestamps: true,
    paranoid: true,
  }
);

export default Points;
