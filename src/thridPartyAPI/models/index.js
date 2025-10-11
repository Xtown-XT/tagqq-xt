import Apikey from './apiKeys.models.js'
import Payment from './payment.js'
import { user as User } from '../../endUser/models/index.js';
import TwilioCall from './callLogs.js';


export function associateModels() {
  Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
}

export {
    Apikey, 
    Payment,
    TwilioCall
}
