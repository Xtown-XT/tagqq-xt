import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Posters = sequelize.define('Posters', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  poster1: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  poster2:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
   poster3:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
   poster4:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
   poster5:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
   poster6:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, 
{
  tableName: 'posters',
  timestamps: true,
  underscored: true,
});

export default Posters;