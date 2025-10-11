import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Partner = sequelize.define('partner',{
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  partner_type: {
    type: DataTypes.ENUM('showroom', 'workshop', 'delivery_partner', 'ambulance'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },  
  pincode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    // allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      notEmpty: true
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
  gst_in: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  udyog_aadhar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
},
{
  tableName: 'partner',
  timestamps: true, 
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['phone']
     },    
  ]
});

export default Partner;