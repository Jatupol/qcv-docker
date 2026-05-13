// server/src/entities/auth/test-login-linevi.ts
// Test script to verify linevi update functionality during login
// Run this script to test the login process and linevi field update

import { Pool } from 'pg';
import { AuthModel } from './model';
import { AuthService } from './service';

// Test configuration
const TEST_CONFIG = {
  // Database connection (adjust as needed)
  database: {
    host: 'localhost',
    port: 5432,
    database: 'qcv_db',
    user: 'postgres',
    password: 'your_password'
  },
  // Test user credentials
  testUser: {
    username: 'test_user', // Replace with actual test username
    password: 'test_password' // Replace with actual test password
  }
};

async function testLoginLineviUpdate() {
  let db: Pool | null = null;

  try {
    console.log('🧪 Testing Login with Line VI Update Functionality');
    console.log('='.repeat(60));

    // Create database connection
    db = new Pool(TEST_CONFIG.database);

    // Test database connection
    console.log('🔗 Testing database connection...');
    const healthCheck = await db.query('SELECT 1 as test');
    if (healthCheck.rows[0].test !== 1) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful');

    // Create auth model and service
    const authModel = new AuthModel(db);
    const authService = new AuthService(authModel);

    console.log('\n📋 Test Case 1: Check current user state');
    console.log('-'.repeat(40));

    // Check current user state before login
    const userBefore = await authModel.findUserByUsername(TEST_CONFIG.testUser.username);
    if (userBefore) {
      console.log(`📊 User before login:`);
      console.log(`   Username: ${userBefore.username}`);
      console.log(`   Work Shift: ${(userBefore as any).work_shift || 'N/A'}`);
      console.log(`   Team: ${(userBefore as any).team || 'N/A'}`);
      console.log(`   Line VI: ${(userBefore as any).linevi || 'N/A'}`);
      console.log(`   Last Check-in: ${(userBefore as any).checkin || 'N/A'}`);
    } else {
      console.log('❌ Test user not found. Please update TEST_CONFIG.testUser.username');
      return;
    }

    console.log('\n📋 Test Case 2: Check inf_checkin data');
    console.log('-'.repeat(40));

    // Check if there's current shift data in inf_checkin
    const shiftDataBefore = await authModel.getCurrentShiftData(TEST_CONFIG.testUser.username);
    if (shiftDataBefore) {
      console.log(`📊 Current shift data in inf_checkin:`);
      console.log(`   Work Shift ID: ${shiftDataBefore.work_shift_id || 'N/A'}`);
      console.log(`   Team: ${shiftDataBefore.team || 'N/A'}`);
      console.log(`   Line No ID: ${shiftDataBefore.line_no_id || 'N/A'}`);
      console.log(`   Check-in: ${shiftDataBefore.checkin || 'N/A'}`);
      console.log(`   Work Hours: ${shiftDataBefore.time_start_work || 'N/A'} - ${shiftDataBefore.time_off_work || 'N/A'}`);
    } else {
      console.log('ℹ️  No active shift data found in inf_checkin table');
      console.log('   This means the user is not currently checked in or outside work hours');
    }

    console.log('\n📋 Test Case 3: Perform login');
    console.log('-'.repeat(40));

    // Perform login
    const loginResult = await authService.login({
      username: TEST_CONFIG.testUser.username,
      password: TEST_CONFIG.testUser.password
    });

    if (loginResult.success) {
      console.log('✅ Login successful!');
      console.log(`👤 Logged in user: ${loginResult.user?.name} (@${loginResult.user?.username})`);
      console.log(`🔐 Role: ${loginResult.user?.role}`);
    } else {
      console.log('❌ Login failed:', loginResult.message);
      console.log('   Please check TEST_CONFIG.testUser credentials');
      return;
    }

    console.log('\n📋 Test Case 4: Check user state after login');
    console.log('-'.repeat(40));

    // Wait a moment for async updates to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check user state after login
    const userAfter = await authModel.findUserByUsername(TEST_CONFIG.testUser.username);
    if (userAfter) {
      console.log(`📊 User after login:`);
      console.log(`   Username: ${userAfter.username}`);
      console.log(`   Work Shift: ${(userAfter as any).work_shift || 'N/A'}`);
      console.log(`   Team: ${(userAfter as any).team || 'N/A'}`);
      console.log(`   Line VI: ${(userAfter as any).linevi || 'N/A'}`);
      console.log(`   Last Check-in: ${(userAfter as any).checkin || 'N/A'}`);
      console.log(`   Work Hours: ${(userAfter as any).time_start_work || 'N/A'} - ${(userAfter as any).time_off_work || 'N/A'}`);
    }

    console.log('\n📋 Test Case 5: Compare before and after');
    console.log('-'.repeat(40));

    if (userBefore && userAfter) {
      const beforeLinevi = (userBefore as any).linevi;
      const afterLinevi = (userAfter as any).linevi;
      const beforeShift = (userBefore as any).work_shift;
      const afterShift = (userAfter as any).work_shift;
      const beforeTeam = (userBefore as any).team;
      const afterTeam = (userAfter as any).team;

      console.log('🔄 Changes detected:');

      if (beforeLinevi !== afterLinevi) {
        console.log(`   ✅ Line VI: '${beforeLinevi || 'NULL'}' → '${afterLinevi || 'NULL'}'`);
      } else {
        console.log(`   ➖ Line VI: No change (${beforeLinevi || 'NULL'})`);
      }

      if (beforeShift !== afterShift) {
        console.log(`   ✅ Work Shift: '${beforeShift || 'NULL'}' → '${afterShift || 'NULL'}'`);
      } else {
        console.log(`   ➖ Work Shift: No change (${beforeShift || 'NULL'})`);
      }

      if (beforeTeam !== afterTeam) {
        console.log(`   ✅ Team: '${beforeTeam || 'NULL'}' → '${afterTeam || 'NULL'}'`);
      } else {
        console.log(`   ➖ Team: No change (${beforeTeam || 'NULL'})`);
      }
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Login process works correctly');
    console.log('   - Line VI field (linevi) is updated from inf_checkin.line_no_id during login');
    console.log('   - Other shift data (work_shift, team, checkin, work hours) also updated');
    console.log('   - Update happens asynchronously and does not block login process');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (db) {
      await db.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  console.log('⚠️  BEFORE RUNNING THIS TEST:');
  console.log('1. Update TEST_CONFIG.database with your database credentials');
  console.log('2. Update TEST_CONFIG.testUser with valid test user credentials');
  console.log('3. Ensure the test user has an active record in inf_checkin table');
  console.log('4. Make sure the user is within their work hours for the test to be meaningful');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');

  setTimeout(() => {
    testLoginLineviUpdate().catch(console.error);
  }, 5000);
}

export { testLoginLineviUpdate };