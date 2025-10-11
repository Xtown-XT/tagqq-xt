// models/twilio_call.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../db/index.js'; // adjust path as needed

const TwilioCall = sequelize.define('TwilioCall', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  call_sid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photo: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('emergency', 'relay', 'whatsapp', 'sms', 'meta_whatsapp'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hospital: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  victim_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergency_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'twilio_calls',
  timestamps: true,
});

export default TwilioCall;
