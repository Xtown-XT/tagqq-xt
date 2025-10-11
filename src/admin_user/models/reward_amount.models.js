import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const RewardAmount = sequelize.define('reward_amount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  referral_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  points_redeemed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 200,
  },
  status: {
    type: DataTypes.ENUM('Applied', 'Approved', 'Declined', 'Success'),
    allowNull: false,
    defaultValue: 'Applied',
  },
  remarks: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  payment_sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'reward_amounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

export default RewardAmount;
