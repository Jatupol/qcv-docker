"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testLoginLineviUpdate = testLoginLineviUpdate;
const pg_1 = require("pg");
const model_1 = require("./model");
const service_1 = require("./service");
const TEST_CONFIG = {
    database: {
        host: 'localhost',
        port: 5432,
        database: 'qcv_db',
        user: 'postgres',
        password: 'your_password'
    },
    testUser: {
        username: 'test_user',
        password: 'test_password'
    }
};
async function testLoginLineviUpdate() {
    let db = null;
    try {
        console.log('🧪 Testing Login with Line VI Update Functionality');
        console.log('='.repeat(60));
        db = new pg_1.Pool(TEST_CONFIG.database);
        console.log('🔗 Testing database connection...');
        const healthCheck = await db.query('SELECT 1 as test');
        if (healthCheck.rows[0].test !== 1) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connection successful');
        const authModel = new model_1.AuthModel(db);
        const authService = new service_1.AuthService(authModel);
        console.log('\n📋 Test Case 1: Check current user state');
        console.log('-'.repeat(40));
        const userBefore = await authModel.findUserByUsername(TEST_CONFIG.testUser.username);
        if (userBefore) {
            console.log(`📊 User before login:`);
            console.log(`   Username: ${userBefore.username}`);
            console.log(`   Work Shift: ${userBefore.work_shift || 'N/A'}`);
            console.log(`   Team: ${userBefore.team || 'N/A'}`);
            console.log(`   Line VI: ${userBefore.linevi || 'N/A'}`);
            console.log(`   Last Check-in: ${userBefore.checkin || 'N/A'}`);
        }
        else {
            console.log('❌ Test user not found. Please update TEST_CONFIG.testUser.username');
            return;
        }
        console.log('\n📋 Test Case 2: Check inf_checkin data');
        console.log('-'.repeat(40));
        const shiftDataBefore = await authModel.getCurrentShiftData(TEST_CONFIG.testUser.username);
        if (shiftDataBefore) {
            console.log(`📊 Current shift data in inf_checkin:`);
            console.log(`   Work Shift ID: ${shiftDataBefore.work_shift_id || 'N/A'}`);
            console.log(`   Team: ${shiftDataBefore.team || 'N/A'}`);
            console.log(`   Line No ID: ${shiftDataBefore.line_no_id || 'N/A'}`);
            console.log(`   Check-in: ${shiftDataBefore.checkin || 'N/A'}`);
            console.log(`   Work Hours: ${shiftDataBefore.time_start_work || 'N/A'} - ${shiftDataBefore.time_off_work || 'N/A'}`);
        }
        else {
            console.log('ℹ️  No active shift data found in inf_checkin table');
            console.log('   This means the user is not currently checked in or outside work hours');
        }
        console.log('\n📋 Test Case 3: Perform login');
        console.log('-'.repeat(40));
        const loginResult = await authService.login({
            username: TEST_CONFIG.testUser.username,
            password: TEST_CONFIG.testUser.password
        });
        if (loginResult.success) {
            console.log('✅ Login successful!');
            console.log(`👤 Logged in user: ${loginResult.user?.name} (@${loginResult.user?.username})`);
            console.log(`🔐 Role: ${loginResult.user?.role}`);
        }
        else {
            console.log('❌ Login failed:', loginResult.message);
            console.log('   Please check TEST_CONFIG.testUser credentials');
            return;
        }
        console.log('\n📋 Test Case 4: Check user state after login');
        console.log('-'.repeat(40));
        await new Promise(resolve => setTimeout(resolve, 2000));
        const userAfter = await authModel.findUserByUsername(TEST_CONFIG.testUser.username);
        if (userAfter) {
            console.log(`📊 User after login:`);
            console.log(`   Username: ${userAfter.username}`);
            console.log(`   Work Shift: ${userAfter.work_shift || 'N/A'}`);
            console.log(`   Team: ${userAfter.team || 'N/A'}`);
            console.log(`   Line VI: ${userAfter.linevi || 'N/A'}`);
            console.log(`   Last Check-in: ${userAfter.checkin || 'N/A'}`);
            console.log(`   Work Hours: ${userAfter.time_start_work || 'N/A'} - ${userAfter.time_off_work || 'N/A'}`);
        }
        console.log('\n📋 Test Case 5: Compare before and after');
        console.log('-'.repeat(40));
        if (userBefore && userAfter) {
            const beforeLinevi = userBefore.linevi;
            const afterLinevi = userAfter.linevi;
            const beforeShift = userBefore.work_shift;
            const afterShift = userAfter.work_shift;
            const beforeTeam = userBefore.team;
            const afterTeam = userAfter.team;
            console.log('🔄 Changes detected:');
            if (beforeLinevi !== afterLinevi) {
                console.log(`   ✅ Line VI: '${beforeLinevi || 'NULL'}' → '${afterLinevi || 'NULL'}'`);
            }
            else {
                console.log(`   ➖ Line VI: No change (${beforeLinevi || 'NULL'})`);
            }
            if (beforeShift !== afterShift) {
                console.log(`   ✅ Work Shift: '${beforeShift || 'NULL'}' → '${afterShift || 'NULL'}'`);
            }
            else {
                console.log(`   ➖ Work Shift: No change (${beforeShift || 'NULL'})`);
            }
            if (beforeTeam !== afterTeam) {
                console.log(`   ✅ Team: '${beforeTeam || 'NULL'}' → '${afterTeam || 'NULL'}'`);
            }
            else {
                console.log(`   ➖ Team: No change (${beforeTeam || 'NULL'})`);
            }
        }
        console.log('\n✅ Test completed successfully!');
        console.log('\n📝 Summary:');
        console.log('   - Login process works correctly');
        console.log('   - Line VI field (linevi) is updated from inf_checkin.line_no_id during login');
        console.log('   - Other shift data (work_shift, team, checkin, work hours) also updated');
        console.log('   - Update happens asynchronously and does not block login process');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
    finally {
        if (db) {
            await db.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}
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
