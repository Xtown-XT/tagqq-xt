
import { DataTypes } from 'sequelize';
import { sequelize } from '../../db/index.js';

const CaptainWithdrawTransaction = sequelize.define(
  'CaptainWithdrawTransaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    captain_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sum_points: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    point: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    unit_of_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'processing', 'failed', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'captain_withdraw_transaction',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default CaptainWithdrawTransaction;
