"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
exports.createUserModel = createUserModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToUser(row) {
    return {
        id: row.id,
        name: row.name,
        description: '',
        username: row.username,
        email: row.email || '',
        password_hash: row.passwordHash,
        role: row.role || types_1.UserRole.USER,
        position: row.position || '',
        work_shift: row.workShift || undefined,
        checkin: row.checkin || undefined,
        team: row.team || undefined,
        linevi: row.linevi || undefined,
        time_start_work: row.timeStartWork || undefined,
        time_off_work: row.timeOffWork || undefined,
        is_active: row.isActive ?? true,
        created_by: row.createdBy ?? 0,
        updated_by: row.updatedBy ?? 0,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    };
}
function mapDrizzleToProfile(row) {
    return {
        id: row.id,
        username: row.username,
        email: row.email || '',
        name: row.name,
        role: row.role || types_1.UserRole.USER,
        position: row.position || '',
        work_shift: row.workShift || undefined,
        checkin: row.checkin || undefined,
        team: row.team || undefined,
        linevi: row.linevi || undefined,
        time_start_work: row.timeStartWork || undefined,
        time_off_work: row.timeOffWork || undefined,
        is_active: row.isActive ?? true,
        created_by: row.createdBy ?? 0,
        updated_by: row.updatedBy ?? 0,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    };
}
class UserModel {
    constructor(db) {
        this.config = types_1.DEFAULT_USER_CONFIG;
        this.db = db;
    }
    formatLocalDateTime(date) {
        if (!date) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        }
        if (typeof date === 'string') {
            if (date.includes('T')) {
                const d = new Date(date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
            return date;
        }
        const d = date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    }
    async findById(id) {
        try {
            const result = await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
            return result[0] ? mapDrizzleToUser(result[0]) : null;
        }
        catch (error) {
            throw new Error(`Failed to find user by ID: ${error}`);
        }
    }
    async createUser(userData, createdBy = 0) {
        try {
            const nowStr = this.formatLocalDateTime(new Date());
            console.log('🔧 Executing user create query:', { username: userData.username });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        INSERT INTO users (
          username, email, password_hash, name, role, position,
          work_shift, team, linevi, is_active,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          ${userData.username},
          ${userData.email},
          ${userData.password_hash},
          ${userData.name},
          ${userData.role || types_1.UserRole.USER},
          ${userData.position || ''},
          ${userData.work_shift || null},
          ${userData.team || null},
          ${userData.linevi || null},
          ${userData.is_active ?? true},
          ${createdBy},
          ${createdBy},
          ${nowStr}::timestamp,
          ${nowStr}::timestamp
        )
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ UserModel.createUser - Created user:', rows[0].id);
                const row = rows[0];
                const mappedRow = {
                    id: row.id,
                    username: row.username,
                    email: row.email,
                    passwordHash: row.password_hash,
                    name: row.name,
                    role: row.role,
                    position: row.position,
                    workShift: row.work_shift,
                    checkin: row.checkin,
                    team: row.team,
                    linevi: row.linevi,
                    timeStartWork: row.time_start_work,
                    timeOffWork: row.time_off_work,
                    isActive: row.is_active,
                    createdBy: row.created_by,
                    updatedBy: row.updated_by,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
                return mapDrizzleToUser(mappedRow);
            }
            throw new Error('Failed to create user');
        }
        catch (error) {
            throw error;
        }
    }
    async updateUser(id, userData, updatedBy) {
        try {
            const nowStr = this.formatLocalDateTime(new Date());
            let checkinValue = null;
            if (userData.checkin !== undefined) {
                checkinValue = userData.checkin ? this.formatLocalDateTime(userData.checkin) : null;
            }
            console.log('🔧 Executing user update query:', { id, is_active: userData.is_active, typeof_is_active: typeof userData.is_active });
            const isActiveSql = typeof userData.is_active === 'boolean'
                ? (userData.is_active ? (0, drizzle_orm_1.sql) `TRUE` : (0, drizzle_orm_1.sql) `FALSE`)
                : (0, drizzle_orm_1.sql) `is_active`;
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        UPDATE users SET
          updated_by = ${updatedBy},
          updated_at = ${nowStr}::timestamp,
          username = COALESCE(${userData.username ?? null}, username),
          email = COALESCE(${userData.email ?? null}, email),
          password_hash = COALESCE(${userData.password_hash ?? null}, password_hash),
          name = COALESCE(${userData.name ?? null}, name),
          role = COALESCE(${userData.role ?? null}, role),
          position = COALESCE(${userData.position ?? null}, position),
          is_active = ${isActiveSql},
          work_shift = COALESCE(${userData.work_shift ?? null}, work_shift),
          team = COALESCE(${userData.team ?? null}, team),
          linevi = COALESCE(${userData.linevi ?? null}, linevi),
          checkin = COALESCE(${checkinValue}::timestamp, checkin)
        WHERE id = ${id}
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ UserModel.updateUser - Updated user:', rows[0].id);
                const row = rows[0];
                const mappedRow = {
                    id: row.id,
                    username: row.username,
                    email: row.email,
                    passwordHash: row.password_hash,
                    name: row.name,
                    role: row.role,
                    position: row.position,
                    workShift: row.work_shift,
                    checkin: row.checkin,
                    team: row.team,
                    linevi: row.linevi,
                    timeStartWork: row.time_start_work,
                    timeOffWork: row.time_off_work,
                    isActive: row.is_active,
                    createdBy: row.created_by,
                    updatedBy: row.updated_by,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
                return mapDrizzleToUser(mappedRow);
            }
            throw new Error('User not found');
        }
        catch (error) {
            throw error;
        }
    }
    async delete(id, actor = null, req) {
        return await this.db.transaction(async (tx) => {
            const [deleted] = await tx.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).returning();
            if (!deleted)
                return false;
            await (0, auditLogger_1.logDelete)(this.db, {
                entity: 'users',
                recordId: deleted.id,
                oldValues: deleted,
                actor,
                req,
                tx,
            });
            return true;
        });
    }
    async findByUsername(username) {
        try {
            const result = await this.db.select().from(schema_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.username, username), (0, drizzle_orm_1.eq)(schema_1.users.isActive, true)))
                .limit(1);
            return result[0] ? mapDrizzleToUser(result[0]) : null;
        }
        catch (error) {
            throw new Error(`Failed to find user by username: ${error}`);
        }
    }
    async findByEmail(email) {
        try {
            const result = await this.db.select().from(schema_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.email, email.toLowerCase()), (0, drizzle_orm_1.eq)(schema_1.users.isActive, true)))
                .limit(1);
            return result[0] ? mapDrizzleToUser(result[0]) : null;
        }
        catch (error) {
            throw new Error(`Failed to find user by email: ${error}`);
        }
    }
    async usernameExists(username, excludeId) {
        try {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.users.username, username)];
            if (excludeId) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.users.id} != ${excludeId}`);
            }
            const result = await this.db.select({ id: schema_1.users.id }).from(schema_1.users).where((0, drizzle_orm_1.and)(...conditions)).limit(1);
            return result.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to check username existence: ${error}`);
        }
    }
    async emailExists(email, excludeId) {
        try {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.users.email, email.toLowerCase())];
            if (excludeId) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.users.id} != ${excludeId}`);
            }
            const result = await this.db.select({ id: schema_1.users.id }).from(schema_1.users).where((0, drizzle_orm_1.and)(...conditions)).limit(1);
            return result.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to check email existence: ${error}`);
        }
    }
    async findAllUsers(options = {}) {
        try {
            const conditions = [];
            if (options.isActive !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.users.isActive, options.isActive));
            }
            if (options.search) {
                const searchPattern = `%${options.search}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.users.username, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.users.email, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.users.name, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.users.position, searchPattern)));
            }
            if (options.role) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, options.role));
            }
            if (options.position) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.users.position, `%${options.position}%`));
            }
            if (options.username) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.users.username, `%${options.username}%`));
            }
            if (options.email) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.users.email, `%${options.email}%`));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const page = options.page || 1;
            const limit = Math.min(options.limit || this.config.defaultLimit, this.config.maxLimit);
            const offset = (page - 1) * limit;
            const countResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.users).where(whereClause);
            const total = countResult[0]?.count || 0;
            const sortBy = options.sortBy || 'name';
            const sortOrder = options.sortOrder || 'ASC';
            const sortColumn = sortBy === 'username' ? schema_1.users.username :
                sortBy === 'email' ? schema_1.users.email :
                    sortBy === 'role' ? schema_1.users.role :
                        sortBy === 'position' ? schema_1.users.position :
                            sortBy === 'created_at' ? schema_1.users.createdAt :
                                sortBy === 'updated_at' ? schema_1.users.updatedAt :
                                    schema_1.users.name;
            const orderFn = sortOrder.toUpperCase() === 'DESC' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
            const data = await this.db.select().from(schema_1.users).where(whereClause).orderBy(orderFn(sortColumn)).limit(limit).offset(offset);
            return {
                data: data.map(mapDrizzleToProfile),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            };
        }
        catch (error) {
            throw new Error(`Failed to find users: ${error}`);
        }
    }
    async getUserStats() {
        try {
            const result = await this.db.select({
                total: (0, drizzle_orm_1.sql) `count(*)::int`,
                active: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.isActive} = true THEN 1 END)::int`,
                inactive: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.isActive} = false THEN 1 END)::int`,
                adminCount: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.role} = 'admin' THEN 1 END)::int`,
                managerCount: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.role} = 'manager' THEN 1 END)::int`,
                userCount: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.role} = 'user' THEN 1 END)::int`,
                viewerCount: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.role} = 'viewer' THEN 1 END)::int`,
                recentCount: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.users.createdAt} >= NOW() - INTERVAL '30 days' THEN 1 END)::int`
            }).from(schema_1.users);
            const stats = result[0];
            return {
                total_users: stats?.total || 0,
                active_users: stats?.active || 0,
                inactive_users: stats?.inactive || 0,
                role_distribution: {
                    admin: stats?.adminCount || 0,
                    manager: stats?.managerCount || 0,
                    user: stats?.userCount || 0,
                    viewer: stats?.viewerCount || 0
                },
                recent_registrations: stats?.recentCount || 0,
                position_distribution: {}
            };
        }
        catch (error) {
            throw new Error(`Failed to get user stats: ${error}`);
        }
    }
    async exists(id) {
        const result = await this.db.select({ id: schema_1.users.id }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
        return result.length > 0;
    }
    async count(options) {
        const conditions = [];
        if (options?.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.isActive, options.isActive));
        }
        if (options?.role) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, options.role));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const result = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.users).where(whereClause);
        return result[0]?.count || 0;
    }
}
exports.UserModel = UserModel;
function createUserModel(db) {
    return new UserModel(db);
}
exports.default = UserModel;
