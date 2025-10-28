
// models/captain_earnings.model.js
import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import Captain from '../../captain_user/models/captain_suggestion.models.js';

const CaptainEarnings = sequelize.define('captain_earnings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  captain_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Captain,
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  total_urls: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_earnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Any notes or system remarks',
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if the captain has been paid for this day',
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  paranoid: true, 
  tableName: 'captain_earnings',
});

export default CaptainEarnings;