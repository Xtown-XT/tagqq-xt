// models/payment.js
import { DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../../db/index.js'; 



const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  user_type: {
    type: DataTypes.ENUM('USER', 'AGENT'),
    allowNull: false,
  },
  razorpay_order_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  razorpay_payment_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  razorpay_signature: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.CHAR(3),
    allowNull: false,
    defaultValue: 'INR',
  },
  status: {
    type: DataTypes.ENUM('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'CANCELLED'),
    allowNull: false,
  },
  agent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // references: {
    //   model: 'Agents',
    //   key: 'id',
    // },
    onDelete: 'RESTRICT',
  },
  receipt: {
    type: DataTypes.STRING(2000),
    allowNull: false,
  
  },
  payment_method: {
    type: DataTypes.ENUM('CARD', 'UPI', 'NETBANKING', 'WALLET'),
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true, 
});

export default Payment;
