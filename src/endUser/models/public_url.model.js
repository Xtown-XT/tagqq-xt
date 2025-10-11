import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Publicurl = sequelize.define('publicurl', {
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // references: {
    //   model: 'users',
    //   key: 'id',
    // },
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Expried', 'Not Paid', 'Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Not Paid'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      notEmpty: true,
    },
     },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
      model: 'orders',
      key: 'id',
    },
    },
    captain_id:{
      type: DataTypes.UUID,
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
},{
  tableName: 'publicurl',
  timestamps: true,  
});

export default Publicurl;