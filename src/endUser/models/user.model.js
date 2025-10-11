import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(60),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  referral_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true 
});

export default User;
