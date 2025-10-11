import { name } from 'ejs';
import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';

const Captainuser = sequelize.define('Captainuser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  emp_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  selfi_image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  aadhaar: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
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
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'captain_user',
  timestamps: true,
  deletedAt: 'deletedAt',
  paranoid: true,

  hooks: {
    beforeUpdate: (user) => {
      if (user.changed('is_active')) {
        if (user.is_active === false) {
          user.setDataValue('deletedAt', new Date());
          user.changed('deletedAt', true);
        } else if (user.is_active === true) {
          user.setDataValue('deletedAt', null);
          user.changed('deletedAt', true);
        }
      }
    }
  }



});

export default Captainuser;