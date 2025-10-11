import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import User from './user.model.js';

const CustomerDoc = sequelize.define('customer_doc',{
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
   doc_type: {
    type: DataTypes.ENUM('license', 'aadhar','pancard','passport','insurance', 'registration', 'idproof','others'),
    allowNull: false,
    defaultValue: 'license',
  },
  doc_name: {
    type: DataTypes.STRING(50),
    allowNull:true,
  },
  doc_blob: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  doc_blob_back: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull:false
  },
  file_size: {
    type: DataTypes.FLOAT, 
    allowNull: true,
    validate: {
      max: 2.0, 
    },
  },
  remarks: {
    type: DataTypes.STRING(200),
    allowNull:true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.UUID,
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
},  
{
  tableName: 'customer_doc',
  timestamps: true,  
});

export default CustomerDoc;

CustomerDoc.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});