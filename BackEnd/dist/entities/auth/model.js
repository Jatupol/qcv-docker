"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthModel {
    constructor(database) {
        this.tableName = 'users';
        this.db = database;
    }
    async findUserByUsername(username) {
        try {
            const query = `
        SELECT id, username, email, password_hash, name, role, position,
               work_shift, checkin, team, linevi, time_start_work, time_off_work,
               is_active, created_at, updated_at
        FROM ${this.tableName}
        WHERE username = $1 AND is_active = true
        LIMIT 1
      `;
            const result = await this.db.query(query, [username.trim()]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            console.error('Find user by username error:', error);
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }
    async findUserByEmail(email) {
        try {
            const query = `
        SELECT id, username, email, password_hash, name, role, position,
               work_shift, checkin, team, linevi, time_start_work, time_off_work,
               is_active, created_at, updated_at
        FROM ${this.tableName}
        WHERE email = $1 AND is_active = true
        LIMIT 1
      `;
            const result = await this.db.query(query, [email.toLowerCase().trim()]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            console.error('Find user by email error:', error);
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }
    async verifyPassword(password, passwordHash) {
        try {
            return await bcrypt_1.default.compare(password, passwordHash);
        }
        catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }
    async updatePassword(userId, newPassword) {
        let client;
        try {
            const saltRounds = 12;
            const passwordHash = await bcrypt_1.default.hash(newPassword, saltRounds);
            client = await this.db.connect();
            await client.query('BEGIN');
            const query = `
        UPDATE ${this.tableName} 
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2 AND is_active = true
      `;
            const result = await client.query(query, [passwordHash, userId]);
            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return false;
            }
            await client.query('COMMIT');
            return true;
        }
        catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('Update password error:', error);
            throw new Error(`Failed to update password: ${error.message}`);
        }
        finally {
            if (client) {
                client.release();
            }
        }
    }
    async findUserById(userId) {
        try {
            const query = `
        SELECT id, username, email, password_hash, name, role, position, 
               is_active, created_at, updated_at
        FROM ${this.tableName} 
        WHERE id = $1
        LIMIT 1
      `;
            const result = await this.db.query(query, [userId]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            console.error('Find user by ID error:', error);
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }
    async updateLastLogin(userId) {
        try {
            const query = `
        UPDATE ${this.tableName} 
        SET updated_at = NOW()
        WHERE id = $1
      `;
            await this.db.query(query, [userId]);
        }
        catch (error) {
            console.error('Update last login error:', error);
        }
    }
    async healthCheck() {
        try {
            const result = await this.db.query('SELECT 1 as health');
            return result.rows.length > 0 && result.rows[0].health === 1;
        }
        catch (error) {
            console.error('Auth model health check failed:', error);
            return false;
        }
    }
    async getAuthStats() {
        try {
            const query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
        FROM ${this.tableName}
      `;
            const result = await this.db.query(query);
            const stats = result.rows[0];
            return {
                totalUsers: parseInt(stats.total_users),
                activeUsers: parseInt(stats.active_users)
            };
        }
        catch (error) {
            console.error('Get auth stats error:', error);
            return { totalUsers: 0, activeUsers: 0 };
        }
    }
    async getCurrentShiftData(username) {
        try {
            const query = `
        SELECT
          work_shift_id,
          created_on as checkin,
          time_start_work,
          time_off_work,
          team,
          line_no_id
        FROM public.inf_checkin
        WHERE gr_code = 'QC'
          AND username = $1
          AND CURRENT_TIMESTAMP BETWEEN date_time_start_work AND date_time_off_work
        ORDER BY created_on DESC
        LIMIT 1
      `;
            const result = await this.db.query(query, [username]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                work_shift_id: row.work_shift_id,
                checkin: row.checkin,
                time_start_work: row.time_start_work,
                time_off_work: row.time_off_work,
                team: row.team,
                line_no_id: row.line_no_id
            };
        }
        catch (error) {
            console.error('Get current shift data error:', error);
            return null;
        }
    }
    async updateUserShiftData(userId, shiftData) {
        try {
            const query = `
        UPDATE ${this.tableName}
        SET
          work_shift = $2,
          checkin = $3,
          time_start_work = $4::TIME WITH TIME ZONE,
          time_off_work = $5::TIME WITH TIME ZONE,
          team = $6,
          linevi = $7,
          updated_at = NOW()
        WHERE id = $1
      `;
            await this.db.query(query, [
                userId,
                shiftData.work_shift_id,
                shiftData.checkin,
                shiftData.time_start_work,
                shiftData.time_off_work,
                shiftData.team,
                shiftData.line_no_id
            ]);
            console.log(`✅ Updated shift data for user ID: ${userId}`);
            console.log(`   Work Shift: ${shiftData.work_shift_id || 'N/A'}`);
            console.log(`   Team: ${shiftData.team || 'N/A'}`);
            console.log(`   Line VI: ${shiftData.line_no_id || 'N/A'}`);
            console.log(`   Check-in: ${shiftData.checkin || 'N/A'}`);
            console.log(`   Work Hours: ${shiftData.time_start_work || 'N/A'} - ${shiftData.time_off_work || 'N/A'}`);
        }
        catch (error) {
            console.error('Update user shift data error:', error);
        }
    }
}
exports.AuthModel = AuthModel;
