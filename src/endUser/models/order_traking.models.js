// models/order_tracking.model.js
import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';
import Payment from '../../thridPartyAPI/models/payment.js';
import User from './user.model.js';
import DeliveryAddressId from './delivery_address.model.js'

const OrderTracking = sequelize.define('order_tracking', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: true, // allow nulls, needed for ON DELETE SET NULL
    references: {
      model: Payment,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Processing', 'Packing', 'Fulfilment'),
    allowNull: false,
    defaultValue: 'Processing'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      notEmpty: true,
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  delivery_address_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: DeliveryAddressId,
      key: 'id'
    }
  },
  count_of_qr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue:1
  }
}, {
  tableName: 'order_trackings',
  timestamps: true,         
});

// Associations
// OrderTracking.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
// OrderTracking.belongsTo(User,    { foreignKey: 'user_id',    as: 'user' });

export default OrderTracking;
