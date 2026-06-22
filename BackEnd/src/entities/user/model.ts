// server/src/entities/user/model.ts
/**
 * User Entity Model - Drizzle ORM Implementation
 * SERIAL ID Pattern Implementation - Authentication Critical
 */

import { eq, or, and, sql, desc, asc, ilike } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import { users, User as DrizzleUser, NewUser } from '../../db/schema';
import {
  User,
  UserProfile,
  CreateUserData,
  UpdateUserData,
  UserQueryParams,
  UserStats,
  UserRole,
  DEFAULT_USER_CONFIG
} from './types';
import {
  SerialIdPaginatedResponse
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== TYPE MAPPING ====================

function mapDrizzleToUser(row: DrizzleUser): User {
  return {
    id: row.id,
    name: row.name,
    description: '',
    username: row.username,
    email: row.email || '',
    password_hash: row.passwordHash,
    role: row.role as UserRole || UserRole.USER,
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
    created_at: row.createdAt!,
    updated_at: row.updatedAt!,
  };
}

function mapDrizzleToProfile(row: DrizzleUser): UserProfile {
  return {
    id: row.id,
    username: row.username,
    email: row.email || '',
    name: row.name,
    role: row.role as UserRole || UserRole.USER,
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
    created_at: row.createdAt!,
    updated_at: row.updatedAt!,
  };
}

// ==================== USER MODEL CLASS ====================

export class UserModel {
  private db: DrizzleDb;
  private config = DEFAULT_USER_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  /**
   * Format datetime as local time string to preserve local timezone
   * This bypasses Drizzle's UTC conversion for timestamp WITHOUT timezone columns
   */
  private formatLocalDateTime(date: Date | string | null | undefined): string {
    if (!date) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    if (typeof date === 'string') {
      // Check if it's an ISO date string (contains 'T' and possibly 'Z')
      // Convert to Date object first to get local time
      if (date.includes('T')) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      }
      // Already a local time string (e.g., "2026-01-27 20:34:53")
      return date;
    }

    const d = date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  async findById(id: number): Promise<User | null> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] ? mapDrizzleToUser(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error}`);
    }
  }

  /**
   * Create new user
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async createUser(userData: CreateUserData, createdBy: number = 0): Promise<User> {
    try {
      const nowStr = this.formatLocalDateTime(new Date());

      console.log('🔧 Executing user create query:', { username: userData.username });

      // Use raw SQL to bypass Drizzle's timestamp handling
      const result = await this.db.execute(sql`
        INSERT INTO users (
          username, email, password_hash, name, role, position,
          work_shift, team, linevi, is_active,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          ${userData.username},
          ${userData.email},
          ${userData.password_hash},
          ${userData.name},
          ${userData.role || UserRole.USER},
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

      const rows = (result as any).rows || result;
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
        return mapDrizzleToUser(mappedRow as any);
      }

      throw new Error('Failed to create user');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async updateUser(id: number, userData: UpdateUserData, updatedBy: number): Promise<User> {
    try {
      const nowStr = this.formatLocalDateTime(new Date());

      // Format checkin if provided
      let checkinValue: string | null = null;
      if (userData.checkin !== undefined) {
        checkinValue = userData.checkin ? this.formatLocalDateTime(userData.checkin) : null;
      }

      console.log('🔧 Executing user update query:', { id, is_active: userData.is_active, typeof_is_active: typeof userData.is_active });

      // Build is_active SQL fragment: use explicit value when boolean is provided,
      // otherwise keep current column value
      const isActiveSql = typeof userData.is_active === 'boolean'
        ? (userData.is_active ? sql`TRUE` : sql`FALSE`)
        : sql`is_active`;

      // Use raw SQL with COALESCE to only update provided fields
      const result = await this.db.execute(sql`
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

      const rows = (result as any).rows || result;
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
        return mapDrizzleToUser(mappedRow as any);
      }

      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }

  async delete(
    id: number,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<boolean> {
    return await this.db.transaction(async (tx: any) => {
      const [deleted] = await tx.delete(users).where(eq(users.id, id)).returning();

      if (!deleted) return false;

      await logDelete(this.db, {
        entity: 'users',
        recordId: deleted.id,
        oldValues: deleted as any,
        actor,
        req,
        tx,
      });

      return true;
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.db.select().from(users)
        .where(and(eq(users.username, username), eq(users.isActive, true)))
        .limit(1);
      return result[0] ? mapDrizzleToUser(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user by username: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.select().from(users)
        .where(and(eq(users.email, email.toLowerCase()), eq(users.isActive, true)))
        .limit(1);
      return result[0] ? mapDrizzleToUser(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error}`);
    }
  }

  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    try {
      const conditions = [eq(users.username, username)];
      if (excludeId) {
        conditions.push(sql`${users.id} != ${excludeId}`);
      }
      const result = await this.db.select({ id: users.id }).from(users).where(and(...conditions)).limit(1);
      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to check username existence: ${error}`);
    }
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const conditions = [eq(users.email, email.toLowerCase())];
      if (excludeId) {
        conditions.push(sql`${users.id} != ${excludeId}`);
      }
      const result = await this.db.select({ id: users.id }).from(users).where(and(...conditions)).limit(1);
      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error}`);
    }
  }

  async findAllUsers(options: UserQueryParams = {}): Promise<SerialIdPaginatedResponse<UserProfile>> {
    try {
      const conditions = [];

      if (options.isActive !== undefined) {
        conditions.push(eq(users.isActive, options.isActive));
      }

      if (options.search) {
        const searchPattern = `%${options.search}%`;
        conditions.push(or(
          ilike(users.username, searchPattern),
          ilike(users.email, searchPattern),
          ilike(users.name, searchPattern),
          ilike(users.position, searchPattern)
        )!);
      }

      if (options.role) {
        conditions.push(eq(users.role, options.role));
      }

      if (options.position) {
        conditions.push(ilike(users.position, `%${options.position}%`));
      }

      if (options.username) {
        conditions.push(ilike(users.username, `%${options.username}%`));
      }

      if (options.email) {
        conditions.push(ilike(users.email, `%${options.email}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const page = options.page || 1;
      const limit = Math.min(options.limit || this.config.defaultLimit, this.config.maxLimit);
      const offset = (page - 1) * limit;

      const countResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(users).where(whereClause);
      const total = countResult[0]?.count || 0;

      const sortBy = options.sortBy || 'name';
      const sortOrder = options.sortOrder || 'ASC';

      const sortColumn = sortBy === 'username' ? users.username :
                         sortBy === 'email' ? users.email :
                         sortBy === 'role' ? users.role :
                         sortBy === 'position' ? users.position :
                         sortBy === 'created_at' ? users.createdAt :
                         sortBy === 'updated_at' ? users.updatedAt :
                         users.name;

      const orderFn = sortOrder.toUpperCase() === 'DESC' ? desc : asc;

      const data = await this.db.select().from(users).where(whereClause).orderBy(orderFn(sortColumn)).limit(limit).offset(offset);

      return {
        data: data.map(mapDrizzleToProfile),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    } catch (error) {
      throw new Error(`Failed to find users: ${error}`);
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const result = await this.db.select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(CASE WHEN ${users.isActive} = true THEN 1 END)::int`,
        inactive: sql<number>`count(CASE WHEN ${users.isActive} = false THEN 1 END)::int`,
        adminCount: sql<number>`count(CASE WHEN ${users.role} = 'admin' THEN 1 END)::int`,
        managerCount: sql<number>`count(CASE WHEN ${users.role} = 'manager' THEN 1 END)::int`,
        userCount: sql<number>`count(CASE WHEN ${users.role} = 'user' THEN 1 END)::int`,
        viewerCount: sql<number>`count(CASE WHEN ${users.role} = 'viewer' THEN 1 END)::int`,
        recentCount: sql<number>`count(CASE WHEN ${users.createdAt} >= NOW() - INTERVAL '30 days' THEN 1 END)::int`
      }).from(users);

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
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error}`);
    }
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0;
  }

  async count(options?: UserQueryParams): Promise<number> {
    const conditions = [];

    if (options?.isActive !== undefined) {
      conditions.push(eq(users.isActive, options.isActive));
    }

    if (options?.role) {
      conditions.push(eq(users.role, options.role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const result = await this.db.select({ count: sql<number>`count(*)::int` }).from(users).where(whereClause);
    return result[0]?.count || 0;
  }
}

// ==================== FACTORY FUNCTION ====================

export function createUserModel(db: DrizzleDb): UserModel {
  return new UserModel(db);
}

export default UserModel;
