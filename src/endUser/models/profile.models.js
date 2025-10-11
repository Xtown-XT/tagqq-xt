import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Profile = sequelize.define('profile', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  docs_name: {
    type: DataTypes.ENUM('Aadhar', 'RC', 'Profile', 'license', 'Emergency', 'captain_bank', 'captain_profile'),
    allowNull: false,
    defaultValue: 'Aadhar',
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  id_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_image: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      notEmpty: true,
    },
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  captain_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // references: {
    //   model: 'captain_users',
    //   key: 'id',
    // },
  }
}, {
  tableName: 'profiles',
  timestamps: true,
});


export default Profile;
