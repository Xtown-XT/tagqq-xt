import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import BloodGroup from '../models/bloodgroup.models.js';
import District from '../../endUser/models/address.district.models.js';

const BloodDonor = sequelize.define('BloodDonor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  mobile_no: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  report_incorrect_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: District, 
      key: 'id'
    }
  },
   blood_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BloodGroup, 
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: '0'
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'blood_donor',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  underscored: true
});


BloodDonor.belongsTo(BloodGroup, { foreignKey: 'blood_group_id', as: 'blood_group' });
BloodDonor.belongsTo(District, { foreignKey: 'district_id', as: 'district' });
export default BloodDonor;
