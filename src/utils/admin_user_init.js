import Adminuser from '../admin_user/models/admin_user.models.js';
import { hashPassword } from '../utils/index.js';

export const initializeSuperAdmin = async () => {
  const adminCount = await Adminuser.count();

  if (adminCount > 0) {
    console.log('Super Admin initialization skipped: Admin already exists');
    return;
  }

  const defaultSuperAdmin = {
    admin_username: 'Xtown',
    admin_email: 'xtown@gmail.com',
    admin_password: await hashPassword('Admin@123'),
    admin_phone: '9999999999',
    role: 'Super Admin',
    is_active: true,
  };

  try {
    const admin = await Adminuser.create(defaultSuperAdmin);
    console.log('✅ Super Admin created:', admin.admin_username);
  } catch (error) {
    console.error('❌ Failed to create Super Admin:', error.message);
  }
};
