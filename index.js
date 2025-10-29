import dotenv from 'dotenv';
import app from './src/index.js';
import { sequelize } from './src/db/index.js';
import { initializeSuperAdmin } from './src/utils/admin_user_init.js';

// Load environment variables FIRST
dotenv.config();

const port = process.env.PORT || 5000;


app.listen(port, async () => {
  try {
    await sequelize.sync();
    await initializeSuperAdmin();
    console.log(`✅ Server is running on port ${port}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
});
