"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSpecialModel = void 0;
exports.createSpecialModel = createSpecialModel;
class GenericSpecialModel {
    constructor(db, config) {
        this.db = db;
        this.config = config;
    }
    async count(filters = {}) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                conditions.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
        });
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        try {
            const query = `SELECT COUNT(*) FROM ${this.config.tableName} ${whereClause}`;
            const result = await this.db.query(query, params);
            return parseInt(result.rows[0].count);
        }
        catch (error) {
            throw new Error(`Failed to count ${this.config.entityName} records: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async health() {
        const startTime = Date.now();
        const issues = [];
        const checks = {
            tableExists: false,
            hasData: false,
            hasActiveRecords: false,
            recentActivity: false,
            indexHealth: false
        };
        let statistics = {
            total: 0,
            active: 0,
            inactive: 0,
            recent: 0
        };
        try {
            try {
                const tableExistsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `;
                const tableResult = await this.db.query(tableExistsQuery, [this.config.tableName]);
                checks.tableExists = tableResult.rows[0].exists;
                if (!checks.tableExists) {
                    issues.push(`Table '${this.config.tableName}' does not exist`);
                }
            }
            catch (error) {
                issues.push(`Failed to check table existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            if (checks.tableExists) {
                try {
                    const totalCountResult = await this.db.query(`SELECT COUNT(*) FROM ${this.config.tableName}`);
                    statistics.total = parseInt(totalCountResult.rows[0].count);
                    checks.hasData = statistics.total > 0;
                    if (!checks.hasData) {
                        issues.push('Table has no data');
                    }
                }
                catch (error) {
                    issues.push(`Failed to check data availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                try {
                    const activeCountResult = await this.db.query(`SELECT COUNT(*) FROM ${this.config.tableName} WHERE is_active = true`);
                    statistics.active = parseInt(activeCountResult.rows[0].count);
                    statistics.inactive = statistics.total - statistics.active;
                    checks.hasActiveRecords = statistics.active > 0;
                    if (!checks.hasActiveRecords && statistics.total > 0) {
                        issues.push('No active records found');
                    }
                }
                catch (error) {
                    issues.push(`Failed to check active records: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                try {
                    const recentActivityResult = await this.db.query(`SELECT COUNT(*) FROM ${this.config.tableName} 
             WHERE created_at >= NOW() - INTERVAL '7 days'`);
                    statistics.recent = parseInt(recentActivityResult.rows[0].count);
                    checks.recentActivity = statistics.recent > 0;
                    if (!checks.recentActivity && statistics.total > 10) {
                        issues.push('No recent activity (last 7 days)');
                    }
                }
                catch (error) {
                    issues.push(`Failed to check recent activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                try {
                    const primaryKeyField = this.config.primaryKey.fields[0];
                    const indexHealthQuery = `
            SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
            FROM pg_stat_user_indexes 
            WHERE tablename = $1 AND indexname LIKE '%pkey%'
          `;
                    const indexResult = await this.db.query(indexHealthQuery, [this.config.tableName]);
                    if (indexResult.rows.length > 0) {
                        const indexData = indexResult.rows[0];
                        const indexUsage = indexData.idx_tup_read || 0;
                        checks.indexHealth = indexUsage >= 0;
                    }
                    else {
                        issues.push('Primary key index not found or not being used');
                    }
                }
                catch (error) {
                    issues.push(`Failed to check index health: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        catch (error) {
            issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        let status = 'healthy';
        if (!checks.tableExists || !checks.hasData) {
            status = 'critical';
        }
        else if (issues.length > 0 || !checks.hasActiveRecords) {
            status = 'warning';
        }
        const responseTime = Date.now() - startTime;
        return {
            entityName: this.config.entityName,
            tableName: this.config.tableName,
            status,
            checks,
            statistics,
            issues,
            lastChecked: new Date(),
            responseTime
        };
    }
    async statistics() {
        const startTime = Date.now();
        const result = {
            entityName: this.config.entityName,
            tableName: this.config.tableName,
            overview: {
                total: 0,
                active: 0,
                inactive: 0
            },
            lastCalculated: new Date()
        };
        try {
            const overviewQuery = `
        SELECT 
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE is_active = true) as active_records,
          COUNT(*) FILTER (WHERE is_active = false) as inactive_records
        FROM ${this.config.tableName}
      `;
            const overviewResult = await this.db.query(overviewQuery);
            const overview = overviewResult.rows[0];
            result.overview.total = parseInt(overview.total_records);
            result.overview.active = parseInt(overview.active_records);
            result.overview.inactive = parseInt(overview.inactive_records);
        }
        catch (error) {
            console.error(`Failed to calculate statistics for ${this.config.entityName}:`, error);
        }
        return result;
    }
}
exports.GenericSpecialModel = GenericSpecialModel;
function createSpecialModel(db, config) {
    return new GenericSpecialModel(db, config);
}
exports.default = GenericSpecialModel;
