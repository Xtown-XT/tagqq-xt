import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Adminuser = sequelize.define('Adminuser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  admin_username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  admin_email: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  admin_password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  admin_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
  },
  role:{
    type: DataTypes.ENUM('Admin','Super Admin','Support Team'),
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: true, 
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      notEmpty: true
    }
  },
  
}, {
  tableName: 'admin_user',
  indexes: [
    {
      unique: true,
      fields: ['admin_username']
    },
    {
      unique: true,
      fields: ['admin_email']
    },
    {
      unique: true,
      fields: ['admin_phone']
    },
    // {
    //   unique: true,
    //   fields: ['id']
    // },
    
  ]
});

export default Adminuser;