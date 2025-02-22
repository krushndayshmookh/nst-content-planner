require('dotenv').config();
const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

async function createAdminUser() {
  try {
    // First, authenticate as admin
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL || 'admin@example.com',
      process.env.PB_ADMIN_PASSWORD || '1234567890'
    );

    console.log('✓ Authenticated as admin');

    // Check if admin user already exists
    const users = await pb.collection('users').getList(1, 1, {
      filter: `email = "${process.env.DEFAULT_ADMIN_EMAIL}"`,
    });

    if (users.items.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Create admin user
    const user = await pb.collection('users').create({
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: process.env.DEFAULT_ADMIN_PASSWORD,
      passwordConfirm: process.env.DEFAULT_ADMIN_PASSWORD,
      name: process.env.DEFAULT_ADMIN_NAME,
      role: 'admin',
    });

    // Create a log entry for user creation
    await pb.collection('logs').create({
      log: `Created admin user: ${user.name}`,
      created_at: new Date().toISOString(),
      related_items: {
        user_id: user.id,
        action: 'user_created',
        role: 'admin',
      },
      created_by: user.id,
    });

    console.log('✓ Created admin user');
    console.log('✓ Created user creation log');
    console.log('\nAdmin user creation completed successfully! 🎉');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 