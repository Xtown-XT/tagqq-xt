// models/captainTransactionModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../db/index.js';

const CaptainTransaction = sequelize.define('CaptainTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Transaction ID',
  },
  captain_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Captain who owns the transaction',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User who triggered the transaction (optional)',
  },
  public_url_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Linked QR public URL',
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Points earned',
  },
  status: {
    type: DataTypes.ENUM('redeemed', 'not_yet_redeemed'),
    defaultValue: 'not_yet_redeemed',
    comment: 'Redemption status',
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'captain_transactions',
  timestamps: true,
  underscored: true,
  paranoid: true,
  deletedAt: 'deleted_at',
});

export default CaptainTransaction;
