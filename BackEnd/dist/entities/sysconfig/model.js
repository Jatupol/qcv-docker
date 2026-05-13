"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysconfigModel = void 0;
exports.createSysconfigModel = createSysconfigModel;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        id: row.id,
        name: row.systemName || '',
        description: row.news || '',
        fvi_lot_qty: row.fviLotQty || '',
        general_oqa_qty: row.generalOqaQty || '',
        crack_oqa_qty: row.crackOqaQty || '',
        general_siv_qty: row.generalSivQty || '',
        crack_siv_qty: row.crackSivQty || '',
        defect_type: row.defectType || '',
        defect_group: row.defectGroup || '',
        defect_color: row.defectColor || '',
        shift: row.shift || '',
        site: row.site || '',
        tabs: row.tabs || '',
        product_type: row.productType || '',
        product_families: row.productFamilies || '',
        smtp_server: row.smtpServer || '',
        smtp_port: row.smtpPort || 587,
        smtp_username: row.smtpUsername || '',
        smtp_password: row.smtpPassword || '',
        defect_notification_emails: row.defectNotificationEmails || '',
        mssql_server: row.mssqlServer || '',
        mssql_port: row.mssqlPort || 1433,
        mssql_database: row.mssqlDatabase || '',
        mssql_username: row.mssqlUsername || '',
        mssql_password: row.mssqlPassword || '',
        mssql_enabled: row.mssqlEnabled ?? true,
        mssql_exclude_keywords: row.mssqlExcludeKeywords || null,
        system_name: row.systemName || '',
        system_updated: row.systemUpdated ?? null,
        news: row.news || '',
        is_active: true,
        created_by: row.createdBy ?? 0,
        updated_by: row.updatedBy ?? 0,
        created_at: row.createdAt ?? new Date(),
        updated_at: row.updatedAt ?? new Date(),
    };
}
function mapDrizzleArrayToEntities(rows) {
    return rows.map(mapDrizzleToEntity);
}
class SysconfigModel {
    constructor(db) {
        this.config = types_1.SYSCONFIG_ENTITY_CONFIG;
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
        const result = await this.db
            .select()
            .from(schema_1.sysconfig)
            .where((0, drizzle_orm_1.eq)(schema_1.sysconfig.id, id))
            .limit(1);
        return result[0] ? mapDrizzleToEntity(result[0]) : null;
    }
    async findAll(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || this.config.defaultLimit;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'id';
        const sortOrder = options.sortOrder || 'DESC';
        const conditions = [];
        if (options.search) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.sysconfig.systemName, `%${options.search}%`));
        }
        if (options.system_name) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.sysconfig.systemName, `%${options.system_name}%`));
        }
        if (options.has_smtp_server !== undefined) {
            if (options.has_smtp_server) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.sysconfig.smtpServer} IS NOT NULL AND ${schema_1.sysconfig.smtpServer} != ''`);
            }
            else {
                conditions.push((0, drizzle_orm_1.sql) `(${schema_1.sysconfig.smtpServer} IS NULL OR ${schema_1.sysconfig.smtpServer} = '')`);
            }
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.sysconfig)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const sortColumn = sortBy === 'system_name' ? schema_1.sysconfig.systemName :
            sortBy === 'created_at' ? schema_1.sysconfig.createdAt :
                sortBy === 'updated_at' ? schema_1.sysconfig.updatedAt :
                    schema_1.sysconfig.id;
        const orderFn = sortOrder.toUpperCase() === 'DESC' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
        const data = await this.db
            .select()
            .from(schema_1.sysconfig)
            .where(whereClause)
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset);
        return {
            data: mapDrizzleArrayToEntities(data),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }
    async findAllSysconfigs(options = {}) {
        return this.findAll(options);
    }
    async create(data, userId) {
        if (!(0, types_1.isCreateSysconfigRequest)(data)) {
            throw new Error('Invalid sysconfig creation data provided');
        }
        const nowStr = this.formatLocalDateTime(new Date());
        const systemUpdatedStr = data.system_updated
            ? this.formatLocalDateTime(typeof data.system_updated === 'string' ? data.system_updated : data.system_updated)
            : nowStr;
        console.log('🔧 Executing sysconfig create query');
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO sysconfig (
        fvi_lot_qty, general_oqa_qty, crack_oqa_qty, general_siv_qty, crack_siv_qty,
        defect_type, defect_group, defect_color, shift, site, tabs,
        product_type, product_families, smtp_server, smtp_port, smtp_username, smtp_password,
        defect_notification_emails, mssql_server, mssql_port, mssql_database,
        mssql_username, mssql_password, system_name, system_updated, news,
        created_by, updated_by, created_at, updated_at
      ) VALUES (
        ${data.fvi_lot_qty},
        ${data.general_oqa_qty},
        ${data.crack_oqa_qty},
        ${data.general_siv_qty},
        ${data.crack_siv_qty},
        ${data.defect_type},
        ${data.defect_group || ''},
        ${data.defect_color || ''},
        ${data.shift},
        ${data.site},
        ${data.tabs},
        ${data.product_type},
        ${data.product_families},
        ${data.smtp_server || null},
        ${data.smtp_port || 587},
        ${data.smtp_username || null},
        ${data.smtp_password || null},
        ${data.defect_notification_emails || null},
        ${data.mssql_server || null},
        ${data.mssql_port || 1433},
        ${data.mssql_database || null},
        ${data.mssql_username || null},
        ${data.mssql_password || null},
        ${data.system_name || null},
        ${systemUpdatedStr}::timestamp,
        ${data.news || null},
        ${userId},
        ${userId},
        ${nowStr}::timestamp,
        ${nowStr}::timestamp
      )
      RETURNING *
    `);
        const rows = result.rows || result;
        if (rows && rows.length > 0) {
            console.log('✅ SysconfigModel.create - Created sysconfig:', rows[0].id);
            const row = rows[0];
            const mappedRow = {
                id: row.id,
                fviLotQty: row.fvi_lot_qty,
                generalOqaQty: row.general_oqa_qty,
                crackOqaQty: row.crack_oqa_qty,
                generalSivQty: row.general_siv_qty,
                crackSivQty: row.crack_siv_qty,
                defectType: row.defect_type,
                defectGroup: row.defect_group,
                defectColor: row.defect_color,
                shift: row.shift,
                site: row.site,
                tabs: row.tabs,
                productType: row.product_type,
                productFamilies: row.product_families,
                smtpServer: row.smtp_server,
                smtpPort: row.smtp_port,
                smtpUsername: row.smtp_username,
                smtpPassword: row.smtp_password,
                defectNotificationEmails: row.defect_notification_emails,
                mssqlServer: row.mssql_server,
                mssqlPort: row.mssql_port,
                mssqlDatabase: row.mssql_database,
                mssqlUsername: row.mssql_username,
                mssqlPassword: row.mssql_password,
                mssqlEnabled: row.mssql_enabled,
                systemName: row.system_name,
                systemUpdated: row.system_updated,
                news: row.news,
                createdBy: row.created_by,
                updatedBy: row.updated_by,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
            return mapDrizzleToEntity(mappedRow);
        }
        throw new Error('Failed to create sysconfig');
    }
    async update(id, data, userId) {
        if (!(0, types_1.isUpdateSysconfigRequest)(data)) {
            throw new Error('Invalid sysconfig update data provided');
        }
        if (Object.keys(data).length === 0) {
            throw new Error('No update data provided');
        }
        const nowStr = this.formatLocalDateTime(new Date());
        let systemUpdatedStr = null;
        if (data.system_updated !== undefined) {
            systemUpdatedStr = this.formatLocalDateTime(typeof data.system_updated === 'string' ? data.system_updated : data.system_updated);
        }
        console.log('🔧 Executing sysconfig update query:', { id });
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      UPDATE sysconfig SET
        updated_by = ${userId},
        updated_at = ${nowStr}::timestamp,
        fvi_lot_qty = COALESCE(${data.fvi_lot_qty ?? null}, fvi_lot_qty),
        general_oqa_qty = COALESCE(${data.general_oqa_qty ?? null}, general_oqa_qty),
        crack_oqa_qty = COALESCE(${data.crack_oqa_qty ?? null}, crack_oqa_qty),
        general_siv_qty = COALESCE(${data.general_siv_qty ?? null}, general_siv_qty),
        crack_siv_qty = COALESCE(${data.crack_siv_qty ?? null}, crack_siv_qty),
        defect_type = COALESCE(${data.defect_type ?? null}, defect_type),
        defect_group = COALESCE(${data.defect_group ?? null}, defect_group),
        defect_color = COALESCE(${data.defect_color ?? null}, defect_color),
        shift = COALESCE(${data.shift ?? null}, shift),
        site = COALESCE(${data.site ?? null}, site),
        tabs = COALESCE(${data.tabs ?? null}, tabs),
        product_type = COALESCE(${data.product_type ?? null}, product_type),
        product_families = COALESCE(${data.product_families ?? null}, product_families),
        smtp_server = COALESCE(${data.smtp_server ?? null}, smtp_server),
        smtp_port = COALESCE(${data.smtp_port ?? null}, smtp_port),
        smtp_username = COALESCE(${data.smtp_username ?? null}, smtp_username),
        smtp_password = COALESCE(${data.smtp_password ?? null}, smtp_password),
        defect_notification_emails = COALESCE(${data.defect_notification_emails ?? null}, defect_notification_emails),
        mssql_server = COALESCE(${data.mssql_server ?? null}, mssql_server),
        mssql_port = COALESCE(${data.mssql_port ?? null}, mssql_port),
        mssql_database = COALESCE(${data.mssql_database ?? null}, mssql_database),
        mssql_username = COALESCE(${data.mssql_username ?? null}, mssql_username),
        mssql_password = COALESCE(${data.mssql_password ?? null}, mssql_password),
        mssql_sync = COALESCE(${data.mssql_sync ?? null}, mssql_sync),
        mssql_enabled = COALESCE(${data.mssql_enabled ?? null}, mssql_enabled),
        system_name = COALESCE(${data.system_name ?? null}, system_name),
        system_version = COALESCE(${data.system_version ?? null}, system_version),
        system_updated = COALESCE(${systemUpdatedStr}::timestamp, system_updated),
        news = COALESCE(${data.news ?? null}, news)
      WHERE id = ${id}
      RETURNING *
    `);
        const rows = result.rows || result;
        if (rows && rows.length > 0) {
            console.log('✅ SysconfigModel.update - Updated sysconfig:', rows[0].id);
            const row = rows[0];
            const mappedRow = {
                id: row.id,
                fviLotQty: row.fvi_lot_qty,
                generalOqaQty: row.general_oqa_qty,
                crackOqaQty: row.crack_oqa_qty,
                generalSivQty: row.general_siv_qty,
                crackSivQty: row.crack_siv_qty,
                defectType: row.defect_type,
                defectGroup: row.defect_group,
                defectColor: row.defect_color,
                shift: row.shift,
                site: row.site,
                tabs: row.tabs,
                productType: row.product_type,
                productFamilies: row.product_families,
                smtpServer: row.smtp_server,
                smtpPort: row.smtp_port,
                smtpUsername: row.smtp_username,
                smtpPassword: row.smtp_password,
                defectNotificationEmails: row.defect_notification_emails,
                mssqlServer: row.mssql_server,
                mssqlPort: row.mssql_port,
                mssqlDatabase: row.mssql_database,
                mssqlUsername: row.mssql_username,
                mssqlPassword: row.mssql_password,
                mssqlSync: row.mssql_sync,
                mssqlEnabled: row.mssql_enabled,
                systemName: row.system_name,
                systemVersion: row.system_version,
                systemUpdated: row.system_updated,
                news: row.news,
                createdBy: row.created_by,
                updatedBy: row.updated_by,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
            return mapDrizzleToEntity(mappedRow);
        }
        throw new Error('Sysconfig not found or already deleted');
    }
    async delete(id) {
        const result = await this.db.delete(schema_1.sysconfig).where((0, drizzle_orm_1.eq)(schema_1.sysconfig.id, id)).returning();
        return result.length > 0;
    }
    async getActiveConfig() {
        const result = await this.db.select().from(schema_1.sysconfig).orderBy((0, drizzle_orm_1.desc)(schema_1.sysconfig.createdAt)).limit(1);
        return result[0] ? mapDrizzleToEntity(result[0]) : null;
    }
    async getActiveConfigWithParsed() {
        const config = await this.getActiveConfig();
        return config ? (0, types_1.createSysconfigWithParsed)(config) : null;
    }
    async findByIdWithParsed(id) {
        const config = await this.findById(id);
        return config ? (0, types_1.createSysconfigWithParsed)(config) : null;
    }
    async findAllWithParsed(options = {}) {
        const result = await this.findAll(options);
        return { ...result, data: result.data.map(config => (0, types_1.createSysconfigWithParsed)(config)) };
    }
    async exists(id) {
        const result = await this.db.select({ id: schema_1.sysconfig.id }).from(schema_1.sysconfig).where((0, drizzle_orm_1.eq)(schema_1.sysconfig.id, id)).limit(1);
        return result.length > 0;
    }
    async count() {
        const result = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.sysconfig);
        return result[0]?.count || 0;
    }
}
exports.SysconfigModel = SysconfigModel;
function createSysconfigModel(db) {
    return new SysconfigModel(db);
}
exports.default = SysconfigModel;
