"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericVarcharCodeModel = void 0;
exports.createVarcharCodeModel = createVarcharCodeModel;
class GenericVarcharCodeModel {
    constructor(db, config) {
        this.db = db;
        this.config = config;
    }
    async getByCode(code) {
        const query = `
      SELECT * FROM ${this.config.tableName}
      WHERE code = $1
      LIMIT 1
    `;
        try {
            const result = await this.db.query(query, [code]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            throw new Error(`Failed to find ${this.config.entityName} by code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getAll(options = {}) {
        const { page = 1, limit = this.config.defaultLimit || 20, sortBy = 'code', sortOrder = 'ASC', search, isActive } = options;
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (isActive !== undefined) {
            conditions.push(`is_active = $${paramIndex}`);
            params.push(isActive);
            paramIndex++;
        }
        if (search && search.trim()) {
            const searchConditions = this.config.searchableFields.map(field => `LOWER(${field}::text) LIKE LOWER($${paramIndex})`);
            conditions.push(`(${searchConditions.join(' OR ')})`);
            params.push(`%${this.escapeLikeString(search.trim())}%`);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ?
            `WHERE ${conditions.join(' AND ')}` : '';
        const validSortField = this.validateSortField(sortBy);
        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        try {
            const dataParams = [...params, limit, offset];
            const [dataResult, countResult] = await Promise.all([
                this.db.query(dataQuery, dataParams),
                this.db.query(countQuery, params)
            ]);
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            return {
                data: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to find ${this.config.entityName} list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async create(data, userId) {
        const now = new Date();
        const fields = ['code', 'name', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'];
        const values = [
            data.code,
            data.name,
            data.is_active !== undefined ? data.is_active : true,
            userId,
            userId,
            now,
            now
        ];
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
        const query = `
      INSERT INTO ${this.config.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
        try {
            const result = await this.db.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            throw new Error(`Failed to create ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async update(code, data, userId) {
        const now = new Date();
        const setFields = [];
        const values = [];
        let paramIndex = 1;
        if (data.name !== undefined) {
            setFields.push(`name = $${paramIndex}`);
            values.push(data.name);
            paramIndex++;
        }
        if (data.is_active !== undefined) {
            setFields.push(`is_active = $${paramIndex}`);
            values.push(data.is_active);
            paramIndex++;
        }
        setFields.push(`updated_by = $${paramIndex}`);
        values.push(userId);
        paramIndex++;
        setFields.push(`updated_at = $${paramIndex}`);
        values.push(now);
        paramIndex++;
        values.push(code);
        const query = `
      UPDATE ${this.config.tableName}
      SET ${setFields.join(', ')}
      WHERE code = $${paramIndex}
      RETURNING *
    `;
        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error(`${this.config.entityName} not found`);
            }
            return result.rows[0];
        }
        catch (error) {
            throw new Error(`Failed to update ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async delete(code) {
        const now = new Date();
        const query = `
      DELETE FROM ${this.config.tableName}
      WHERE code = $1  
      RETURNING code
    `;
        try {
            const result = await this.db.query(query, [code]);
            return result.rows.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to delete ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async changeStatus(code, userId) {
        const now = new Date();
        const query = `
      UPDATE ${this.config.tableName}
      SET is_active = NOT is_active,
          updated_by = $1,
          updated_at = $2
      WHERE code = $3
      RETURNING is_active
    `;
        try {
            const result = await this.db.query(query, [userId, now, code]);
            return result.rows.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to change ${this.config.entityName} status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async count(options = {}) {
        const { search } = options;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (search && search.trim()) {
            const searchConditions = this.config.searchableFields.map(field => `LOWER(${field}::text) LIKE LOWER($${paramIndex})`);
            conditions.push(`(${searchConditions.join(' OR ')})`);
            params.push(`%${this.escapeLikeString(search.trim())}%`);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ?
            `WHERE ${conditions.join(' AND ')}` : '';
        const query = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        try {
            const result = await this.db.query(query, params);
            return parseInt(result.rows[0].total);
        }
        catch (error) {
            throw new Error(`Failed to count ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async exists(code) {
        const query = `
      SELECT 1 FROM ${this.config.tableName}
      WHERE code = $1
      LIMIT 1
    `;
        try {
            const result = await this.db.query(query, [code]);
            return result.rows.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to check ${this.config.entityName} existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async health() {
        const timestamp = new Date();
        const checks = {
            database: false,
            table: false,
            records: false
        };
        let metrics = {
            total: 0,
            active: 0,
            inactive: 0,
            lastUpdated: null
        };
        try {
            const dbTest = await this.db.query('SELECT 1');
            checks.database = dbTest.rowCount !== null;
            const tableCheck = await this.db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [this.config.tableName]);
            checks.table = tableCheck.rows[0].exists;
            if (checks.table) {
                const metricsQuery = await this.db.query(`
          SELECT 
            COUNT(*) as total_records,
            COUNT(*) FILTER (WHERE is_active = true) as active_records,
            COUNT(*) FILTER (WHERE is_active = false) as inactive_records,
            MAX(updated_at) as last_updated
          FROM ${this.config.tableName}
        `);
                if (metricsQuery.rows.length > 0) {
                    const row = metricsQuery.rows[0];
                    metrics = {
                        total: parseInt(row.total_records) || 0,
                        active: parseInt(row.active_records) || 0,
                        inactive: parseInt(row.inactive_records) || 0,
                        lastUpdated: row.last_updated ? new Date(row.last_updated) : null
                    };
                    checks.records = true;
                }
            }
            let status;
            if (checks.database && checks.table && checks.records) {
                status = 'healthy';
            }
            else if (checks.database && checks.table) {
                status = 'degraded';
            }
            else {
                status = 'unhealthy';
            }
            return {
                status,
                checks,
                metrics,
                timestamp
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                checks,
                metrics,
                timestamp
            };
        }
    }
    async statistics() {
        try {
            const overviewQuery = await this.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE is_active = false) as inactive
        FROM ${this.config.tableName}
      `);
            const overview = {
                total: parseInt(overviewQuery.rows[0].total) || 0,
                active: parseInt(overviewQuery.rows[0].active) || 0,
                inactive: parseInt(overviewQuery.rows[0].inactive) || 0
            };
            return { overview };
        }
        catch (error) {
            throw new Error(`Failed to get ${this.config.entityName} statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getByName(name, options = {}) {
        const { page = 1, limit = this.config.defaultLimit || 20, sortBy = 'code', sortOrder = 'ASC', isActive } = options;
        const offset = (page - 1) * limit;
        const conditions = ['LOWER(name) = LOWER($1)'];
        const params = [name];
        let paramIndex = 2;
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const validSortField = this.validateSortField(sortBy);
        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        try {
            const dataParams = [...params, limit, offset];
            const [dataResult, countResult] = await Promise.all([
                this.db.query(dataQuery, dataParams),
                this.db.query(countQuery, params)
            ]);
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            return {
                data: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to search ${this.config.entityName} by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async filterStatus(status, options = {}) {
        const { page = 1, limit = this.config.defaultLimit || 20, sortBy = 'code', sortOrder = 'ASC', search } = options;
        const offset = (page - 1) * limit;
        const conditions = ['is_active = $1'];
        const params = [status];
        let paramIndex = 2;
        if (search && search.trim()) {
            const searchConditions = this.config.searchableFields.map(field => `LOWER(${field}::text) LIKE LOWER($${paramIndex})`);
            conditions.push(`(${searchConditions.join(' OR ')})`);
            params.push(`%${this.escapeLikeString(search.trim())}%`);
            paramIndex++;
        }
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const validSortField = this.validateSortField(sortBy);
        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        try {
            const dataParams = [...params, limit, offset];
            const [dataResult, countResult] = await Promise.all([
                this.db.query(dataQuery, dataParams),
                this.db.query(countQuery, params)
            ]);
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            return {
                data: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to filter ${this.config.entityName} by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async search(pattern, options = {}) {
        const { page = 1, limit = this.config.defaultLimit || 20, sortBy = 'code', sortOrder = 'ASC' } = options;
        const offset = (page - 1) * limit;
        const conditions = ['(LOWER(code) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($1))'];
        const params = [`%${this.escapeLikeString(pattern)}%`];
        let paramIndex = 2;
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const validSortField = this.validateSortField(sortBy);
        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        try {
            const dataParams = [...params, limit, offset];
            const [dataResult, countResult] = await Promise.all([
                this.db.query(dataQuery, dataParams),
                this.db.query(countQuery, params)
            ]);
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            return {
                data: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to search ${this.config.entityName} by pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    validateSortField(sortBy) {
        const allowedFields = [
            'code',
            'name',
            'is_active',
            'created_at',
            'updated_at',
            ...this.config.searchableFields
        ];
        const uniqueAllowedFields = [...new Set(allowedFields)];
        if (uniqueAllowedFields.includes(sortBy)) {
            return sortBy;
        }
        return 'code';
    }
    escapeLikeString(str) {
        return str.replace(/[%_\\]/g, '\\$&');
    }
}
exports.GenericVarcharCodeModel = GenericVarcharCodeModel;
function createVarcharCodeModel(db, config) {
    return new GenericVarcharCodeModel(db, config);
}
exports.default = GenericVarcharCodeModel;
