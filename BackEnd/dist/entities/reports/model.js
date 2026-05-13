"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModel = void 0;
exports.createLARReportModel = createLARReportModel;
const shared_1 = require("@qcv/shared");
class ReportModel {
    constructor(db) {
        this.db = db;
    }
    async getModelsLAR(params = { isCustomerReport: false }) {
        try {
            const { isCustomerReport, yearFrom, wwFrom, yearTo, wwTo, productionSites, customerSites, productFamilies, productTypes, } = params;
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            const hasDateRange = yearFrom && wwFrom && yearTo && wwTo;
            if (hasDateRange) {
                conditions.push(`(i.fy || LPAD(i.ww::text, 2, '0')) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
                values.push(`${yearFrom}${wwFrom.toString().padStart(2, '0')}`);
                values.push(`${yearTo}${wwTo.toString().padStart(2, '0')}`);
                paramIndex += 2;
            }
            if (isCustomerReport) {
                conditions.push(`s.customers = $${paramIndex}`);
                values.push('SGT');
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                conditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                conditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                conditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                conditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const viewName = isCustomerReport ? 'v_inspectiondata_customer' : 'inspectiondata';
            const additionalConditions = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT
            i.model || ' ' ||  i.version  as model
        FROM ${viewName} i  
        INNER JOIN parts p ON p.partno = i.itemno
        INNER JOIN customers_site s on s.code = p.customers_site
        WHERE i.station = 'OQA'  AND i.round = 1
          AND p.product_families IS NOT NULL AND p.versions IS NOT null
          ${additionalConditions}
        GROUP BY  i.model, i.version
        HAVING COUNT(i.lotno) >0
        ORDER BY i.model, i.version
      `;
            const result = await this.db.query(query, values);
            const products = result.rows.map(row => row.model);
            return products;
        }
        catch (error) {
            console.error('❌ Error in getModelsLAR:', error);
            throw new Error(`Failed to get available models: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getModelsDashboard(params = {}) {
        try {
            const { productionSites, customerSites, productFamilies, productTypes, } = params;
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (productionSites && productionSites.length > 0) {
                conditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                conditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                conditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                conditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const additionalConditions = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT
            i.model || ' ' || i.version as model
        FROM inspectiondata i
        INNER JOIN parts p ON p.partno = i.itemno
        INNER JOIN customers_site s on s.code = p.customers_site
        WHERE i.station = 'OQA' AND i.round = 1
          ${additionalConditions}
        GROUP BY i.model, i.version
        HAVING COUNT(i.lotno) > 0
        ORDER BY i.model, i.version
      `;
            const result = await this.db.query(query, values);
            return result.rows.map(row => row.model);
        }
        catch (error) {
            console.error('❌ Error in getModelsDashboard:', error);
            throw new Error(`Failed to get dashboard models: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getLARDashboard(params = {}) {
        try {
            const { model, models, dateFrom, dateTo, productionSites, customerSites, productFamilies, productTypes, } = params;
            console.log('🔧 LARDashboardRecordModel.getLARDashboard called with params:', params);
            const values = [];
            const conditions = [];
            const mainConditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                mainConditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                mainConditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`TB.model = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`TB.model IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            if (productionSites && productionSites.length > 0) {
                mainConditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                mainConditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                mainConditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                mainConditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const viewConditions = ['v.model_version = TB.model'];
            if (dateFrom) {
                viewConditions.push(`v.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                viewConditions.push(`v.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                viewConditions.push(`v.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                viewConditions.push(`v.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                viewConditions.push(`v.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                viewConditions.push(`v.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const existsClause = `EXISTS (SELECT 1 FROM v_inspectiondata_month v WHERE ${viewConditions.join(' AND ')})`;
            conditions.push(existsClause);
            const mainWhereClause = mainConditions.length > 0 ? `AND ${mainConditions.join(' AND ')}` : '';
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT 
          L.*,
          CASE 
            WHEN L.lar  > L.lar_achieve_threshold THEN 'Achieve'
            WHEN L.lar  < L.lar_abnormal_threshold THEN 'Abnormal'
          ELSE 'Accept'
          END AS status
        FROM (  
          SELECT
            month_year,
            model,
            lar_achieve_threshold,
            lar_accept_min_threshold,
            lar_accept_max_threshold,
            lar_abnormal_threshold,
            (TOTAL_PASS_LOT / COALESCE(TOTAL_LOT, 0)) * 100.0 AS lar
          FROM (
            SELECT
              L.month_year,
              L.model || ' ' || L.version as model,
              p.lar_achieve_threshold,
              p.lar_accept_min_threshold,
              p.lar_accept_max_threshold,
              p.lar_abnormal_threshold,
              COUNT(L.lotno) AS TOTAL_LOT,
              COUNT(CASE WHEN L.judgment = true THEN 1 END)::Numeric AS TOTAL_PASS_LOT
            FROM inspectiondata L
            INNER JOIN parts p ON p.partno = L.itemno
            INNER JOIN customers_site s on s.code = p.customers_site
            WHERE  L.station = 'OQA' AND L.round = 1
            ${mainWhereClause}
            GROUP BY L.month_year, L.model, L.version,
              p.lar_achieve_threshold,
              p.lar_accept_min_threshold,
              p.lar_accept_max_threshold,
              p.lar_abnormal_threshold
          ) TB
          ${whereClause}
        ) L
        ORDER BY month_year, model
      `;
            console.log(`✅ getLARDashboard WHERE: ${whereClause}, dateRange: ${dateFrom} to ${dateTo}, models: ${modelsToFilter.length}`);
            const finalQuery_LAR = query.replace(/\$(\d+)/g, (_, i) => { const v = values[parseInt(i) - 1]; return Array.isArray(v) ? `ARRAY[${v.map((x) => `'${x}'`).join(',')}]` : `'${v}'`; });
            console.log(`[SQL] getLARDashboard FINAL QUERY:\n${finalQuery_LAR}`);
            const result = await this.db.query(query, values);
            console.log(`✅ LARReportModel.getLARDashboard: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in LARDashboardModel.getLARDashboard:', error);
            throw new Error(`Failed to get LAR Dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDPPMDashboard(params = {}) {
        try {
            const { model, models, dateFrom, dateTo, productionSites, customerSites, productFamilies, productTypes, } = params;
            console.log('🔧 DPPMDashboardModel.getDPPMDashboard called with params:', params);
            const values = [];
            const conditions = [];
            const mainConditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                mainConditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                mainConditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                mainConditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                mainConditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                mainConditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                mainConditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`TB.model = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`TB.model IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            const viewConditions = ['v.model_version = TB.model'];
            if (dateFrom) {
                viewConditions.push(`v.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                viewConditions.push(`v.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                viewConditions.push(`v.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                viewConditions.push(`v.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                viewConditions.push(`v.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                viewConditions.push(`v.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const existsClause = `EXISTS (SELECT 1 FROM v_inspectiondata_month v WHERE ${viewConditions.join(' AND ')})`;
            conditions.push(existsClause);
            const mainWhereClause = mainConditions.length > 0 ? `AND ${mainConditions.join(' AND ')}` : '';
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT
           D.*,
          CASE 
            WHEN D.dppm < D.dppm_achieve_threshold THEN 'Achieve'
            WHEN D.dppm > D.dppm_abnormal_threshold THEN 'Abnormal'
          ELSE 'Accept'
          END AS status
        FROM (
          SELECT
            month_year,
            model,
            dppm_achieve_threshold,
            dppm_accept_min_threshold,
            dppm_accept_max_threshold,
            dppm_abnormal_threshold,
            (COALESCE(Total_NG, 0)/ Total_Inspection::NUMERIC ) * 1000000.0 AS dppm
          FROM (
            SELECT
              L.month_year,
              L.model || ' ' || L.version as model,
              p.dppm_achieve_threshold,
              p.dppm_accept_min_threshold,
              p.dppm_accept_max_threshold,
              p.dppm_abnormal_threshold,
              SUM(general_sampling_qty) Total_Inspection,
              SUM(ng_qty) Total_NG
            FROM inspectiondata L
            INNER JOIN parts p ON p.partno = L.itemno
            INNER JOIN customers_site s ON s.code = p.customers_site
            LEFT JOIN  (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             )  D ON L.inspection_no = D.inspection_no
            WHERE L.station = 'OQA' AND L.round = 1
            ${mainWhereClause}
            GROUP BY L.month_year, L.model, L.version,
              p.dppm_achieve_threshold,
              p.dppm_accept_min_threshold,
              p.dppm_accept_max_threshold,
              p.dppm_abnormal_threshold
          ) TB
          ${whereClause}
        ) D
        ORDER BY month_year, model
      `;
            console.log(`✅ getDPPMDashboard WHERE: ${whereClause}, dateRange: ${dateFrom} to ${dateTo}, models: ${modelsToFilter.length}`);
            const finalQuery_DPPM = query.replace(/\$(\d+)/g, (_, i) => { const v = values[parseInt(i) - 1]; return Array.isArray(v) ? `ARRAY[${v.map((x) => `'${x}'`).join(',')}]` : `'${v}'`; });
            console.log(`[SQL] getDPPMDashboard FINAL QUERY:\n${finalQuery_DPPM}`);
            const result = await this.db.query(query, values);
            console.log(`✅ DPPMDashboardModel.getDPPMDashboard: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in DPPMDashboardModel.getDPPMDashboard:', error);
            throw new Error(`Failed to get DPPM Dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getUnderkillDashboard(params = {}) {
        try {
            const { model, models, dateFrom, dateTo, productionSites, customerSites, productFamilies, productTypes, } = params;
            console.log('🔧 UnderkillDashboardModel.getUnderkillDashboard called with params:', params);
            const values = [];
            const conditions = [];
            const mainConditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                mainConditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                mainConditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                mainConditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                mainConditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                mainConditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                mainConditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`TB.model = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`TB.model IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            const viewConditions = ['v.model_version = TB.model'];
            if (dateFrom) {
                viewConditions.push(`v.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                viewConditions.push(`v.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                viewConditions.push(`v.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                viewConditions.push(`v.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                viewConditions.push(`v.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                viewConditions.push(`v.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const existsClause = `EXISTS (SELECT 1 FROM v_inspectiondata_month v WHERE ${viewConditions.join(' AND ')})`;
            conditions.push(existsClause);
            const mainWhereClause = mainConditions.length > 0 ? `AND ${mainConditions.join(' AND ')}` : '';
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT 
          U.*,
          CASE 
            WHEN U.underkill  < U.underkill_achieve_threshold THEN 'Achieve'
            WHEN U.underkill  > U.underkill_abnormal_threshold THEN 'Abnormal'
            ELSE 'Accept'
           END AS status
        FROM (          
          SELECT
            month_year,
            model,
            underkill_achieve_threshold,
            underkill_accept_min_threshold,
            underkill_accept_max_threshold,
            underkill_abnormal_threshold,
            (COALESCE(Total_NG, 0)/ Total_Inspection::NUMERIC ) AS underkill
          FROM (
            SELECT
              L.month_year,
              L.model || ' ' || L.version as model,
              p.underkill_achieve_threshold,
              p.underkill_accept_min_threshold,
              p.underkill_accept_max_threshold,
              p.underkill_abnormal_threshold,
              SUM(general_sampling_qty) Total_Inspection,
              SUM(ng_qty) Total_NG
            FROM inspectiondata L
            INNER JOIN parts p ON p.partno = L.itemno
            INNER JOIN customers_site s ON s.code = p.customers_site
            LEFT JOIN  (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             )  D ON L.inspection_no = D.inspection_no
            WHERE L.station = 'OQA' AND L.round = 1
            ${mainWhereClause}
            GROUP BY L.month_year, L.model, L.version,
              p.underkill_achieve_threshold,
              p.underkill_accept_min_threshold,
              p.underkill_accept_max_threshold,
              p.underkill_abnormal_threshold
          ) TB
          ${whereClause}
        ) U
        ORDER BY month_year, model
      `;
            console.log(`✅ getUnderkillDashboard WHERE: ${whereClause}, dateRange: ${dateFrom} to ${dateTo}, models: ${modelsToFilter.length}`);
            const finalQuery_UK = query.replace(/\$(\d+)/g, (_, i) => { const v = values[parseInt(i) - 1]; return Array.isArray(v) ? `ARRAY[${v.map((x) => `'${x}'`).join(',')}]` : `'${v}'`; });
            console.log(`[SQL] getUnderkillDashboard FINAL QUERY:\n${finalQuery_UK}`);
            const result = await this.db.query(query, values);
            console.log(`✅ UnderkillDashboardModel.getUnderkillDashboard: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in UnderkillDashboardModel.getUnderkillDashboard:', error);
            throw new Error(`Failed to get Underkill Dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getTopDefect(params = {}) {
        try {
            const { dateFrom, dateTo, models, model, productionSites, customerSites, productFamilies, productTypes } = params;
            console.log('🔧 TopDefect called with params:', params);
            const values = [];
            const conditions = [];
            const mainConditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                mainConditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                mainConditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                mainConditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                mainConditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                mainConditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                mainConditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`t.model = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`t.model IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            const viewConditions = ['v.model_version = t.model'];
            if (dateFrom) {
                viewConditions.push(`v.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                viewConditions.push(`v.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                viewConditions.push(`v.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                viewConditions.push(`v.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                viewConditions.push(`v.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                viewConditions.push(`v.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const existsClause = `EXISTS (SELECT 1 FROM v_inspectiondata_month v WHERE ${viewConditions.join(' AND ')})`;
            conditions.push(existsClause);
            const mainWhereClause = mainConditions.length > 0 ? `AND ${mainConditions.join(' AND ')}` : '';
            const outerWhereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT month_year, model, defect_id, defect_name, defect_description, total_ng
        FROM (
            SELECT
                L.month_year,
                L.model || ' ' || L.version AS model,
                D.defect_id,
                F.name AS defect_name,
                F.description AS defect_description,
                SUM(D.ng_qty) AS total_ng,
                ROW_NUMBER() OVER (
                    PARTITION BY L.month_year, L.model, L.version
                    ORDER BY SUM(D.ng_qty) DESC NULLS LAST
                ) AS rn
            FROM inspectiondata L
            LEFT JOIN defectdata D ON L.inspection_no = D.inspection_no
            LEFT JOIN defects F ON F.id = D.defect_id
            INNER JOIN parts p ON p.partno = L.itemno
            INNER JOIN customers_site s ON s.code = p.customers_site
            WHERE L.station = 'OQA'
              AND L.round = 1
              ${mainWhereClause}
            GROUP BY
                L.month_year,
                L.model,
                L.version,
                D.defect_id,
                F.name,
                F.description
        ) t
        WHERE rn = 1
        ${outerWhereClause}
        ORDER BY month_year, model
      `;
            console.log(`✅ getTopDefect WHERE: ${mainWhereClause}, outerWHERE: ${outerWhereClause}, models: ${modelsToFilter.length}`);
            const finalQuery_TD = query.replace(/\$(\d+)/g, (_, i) => { const v = values[parseInt(i) - 1]; return Array.isArray(v) ? `ARRAY[${v.map((x) => `'${x}'`).join(',')}]` : `'${v}'`; });
            console.log(`[SQL] getTopDefect FINAL QUERY:\n${finalQuery_TD}`);
            const result = await this.db.query(query, values);
            console.log(`✅ TopDefect: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in TopDefect:', error);
            throw new Error(`Failed to get TopDefect: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getProductionLineHeatmap(params = {}) {
        try {
            const { dateFrom, dateTo } = params;
            console.log('🔧 ProductionLineHeatmap called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                conditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                conditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT
          D.linevi,
          D.groupvi,
          D.station,
          SUM(L.general_sampling_qty) AS total_inspections,
          SUM(D.ng_qty) AS total_ng,
          CASE
            WHEN COALESCE(SUM(L.general_sampling_qty), 0) > 0
            THEN ((SUM(D.ng_qty)::DECIMAL / SUM(L.general_sampling_qty)) * 1000000.0)
            ELSE 0
          END AS dppm,
          COUNT(D.defect_id) AS defect_count,
          (
            SELECT F.name
            FROM defectdata D2
            INNER JOIN defects F ON F.id = D2.defect_id
            WHERE D2.linevi = D.linevi
              AND D2.groupvi = D.groupvi
              AND D2.station = D.station
            GROUP BY F.name
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ) AS top_defect,
          CASE
            WHEN COALESCE(SUM(L.general_sampling_qty), 0) = 0 THEN 'normal'
            WHEN (SUM(D.ng_qty)::DECIMAL / SUM(L.general_sampling_qty) * 1000000) > 1000 THEN 'critical'
            WHEN (SUM(D.ng_qty)::DECIMAL / SUM(L.general_sampling_qty) * 1000000) > 500 THEN 'warning'
            ELSE 'normal'
          END AS alert_status
        FROM defectdata D
        INNER JOIN inspectiondata L ON L.inspection_no = D.inspection_no
        WHERE L.station = 'OQA'
          AND L.round = 1
          ${whereClause}
        GROUP BY D.linevi, D.groupvi, D.station
        ORDER BY dppm DESC, D.linevi, D.groupvi, D.station
      `;
            const result = await this.db.query(query, values);
            console.log(`✅ ProductionLineHeatmap: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ProductionLineHeatmap:', error);
            throw new Error(`Failed to get ProductionLineHeatmap: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getProductQualityScorecard(params = {}) {
        try {
            const { dateFrom, dateTo } = params;
            console.log('🔧 ProductQualityScorecard called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                conditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                conditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        WITH current_period AS (
          SELECT
            L.model || ' ' || L.version AS model,
            L.month_year,
            COUNT(DISTINCT L.inspection_no) AS total_lots,
            COUNT(DISTINCT CASE WHEN L.judgment = true THEN L.inspection_no END) AS pass_lots,
            SUM(general_sampling_qty) AS total_inspections,
            SUM(COALESCE(D.ng_qty, 0)) AS total_ng,
            (COUNT(DISTINCT CASE WHEN L.judgment = true THEN L.inspection_no END)::DECIMAL /
             COALESCE(COUNT(DISTINCT L.inspection_no), 0) * 100) AS current_lar,
            (SUM(COALESCE(D.ng_qty, 0))::DECIMAL /
             COALESCE(SUM(general_sampling_qty), 0) * 1000000.0) AS current_dppm
          FROM inspectiondata L
          LEFT JOIN  (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             )  D ON L.inspection_no = D.inspection_no
          WHERE L.station = 'OQA'
            AND L.round = 1
            ${whereClause}
          GROUP BY L.model, L.version, L.month_year
        ),
        previous_period AS (
          SELECT
            L.model || ' ' || L.version AS model,
            (COUNT(DISTINCT CASE WHEN L.judgment = true THEN L.inspection_no END)::DECIMAL /
             COALESCE(COUNT(DISTINCT L.inspection_no), 0) * 100) AS prev_lar,
            (SUM(COALESCE(D.ng_qty, 0))::DECIMAL /
             COALESCE(SUM(general_sampling_qty), 0) * 1000000.0) AS prev_dppm
          FROM inspectiondata L
          LEFT JOIN (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             ) D ON L.inspection_no = D.inspection_no
          WHERE L.station = 'OQA'
            AND L.round = 1
            AND L.month_year < COALESCE($1, '999999')
          GROUP BY L.model, L.version
        )
        SELECT
          cp.model,
          cp.current_lar,
          COALESCE(p.lar_accept_max_threshold, 97) AS target_lar,
          CASE
            WHEN cp.current_lar >= COALESCE(p.lar_achieve_threshold, 99) THEN 'excellent'
            WHEN cp.current_lar >= COALESCE(p.lar_accept_max_threshold, 97) THEN 'good'
            WHEN cp.current_lar >= COALESCE(p.lar_accept_min_threshold, 88) THEN 'warning'
            ELSE 'critical'
          END AS lar_status,
          CASE
            WHEN cp.current_lar > COALESCE(pp.prev_lar, cp.current_lar) THEN 'up'
            WHEN cp.current_lar < COALESCE(pp.prev_lar, cp.current_lar) THEN 'down'
            ELSE 'stable'
          END AS lar_trend,
          cp.current_dppm,
          COALESCE(p.dppm_achieve_threshold, 300) AS target_dppm,
          CASE
            WHEN cp.current_dppm <= COALESCE(p.dppm_achieve_threshold, 300) THEN 'excellent'
            WHEN cp.current_dppm <= COALESCE(p.dppm_accept_min_threshold, 500) THEN 'good'
            WHEN cp.current_dppm <= COALESCE(p.dppm_accept_max_threshold, 1000) THEN 'warning'
            ELSE 'critical'
          END AS dppm_status,
          CASE
            WHEN cp.current_dppm < COALESCE(pp.prev_dppm, cp.current_dppm) THEN 'up'
            WHEN cp.current_dppm > COALESCE(pp.prev_dppm, cp.current_dppm) THEN 'down'
            ELSE 'stable'
          END AS dppm_trend,
          cp.total_lots AS total_lot,
          cp.pass_lots AS total_lotpass,
          cp.total_inspections,
          cp.total_ng AS total_defects,
          cp.month_year
        FROM current_period cp
        LEFT JOIN parts p ON cp.model = p.partno
        LEFT JOIN previous_period pp ON cp.model = pp.model
        ORDER BY cp.model, cp.month_year
      `;
            const result = await this.db.query(query, values);
            console.log(`✅ ProductQualityScorecard: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ProductQualityScorecard:', error);
            throw new Error(`Failed to get ProductQualityScorecard: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDefectRootCause(params = {}) {
        try {
            const { dateFrom, dateTo } = params;
            console.log('🔧 DefectRootCause called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                conditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                conditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        WITH defect_analysis AS (
          SELECT
            F.name AS defect_name,
            F.defect_group,
            COUNT(D.id) AS total_occurrences,
            SUM(D.ng_qty) AS total_ng_qty,
            COUNT(DISTINCT L.model || ' ' || L.version) AS affected_products,
            MODE() WITHIN GROUP (ORDER BY L.model || ' ' || L.version) AS top_product,
            MODE() WITHIN GROUP (ORDER BY D.linevi) AS top_line,
            MODE() WITHIN GROUP (ORDER BY D.station) AS top_station,
            AVG(D.ng_qty) AS avg_ng_per_occurrence
          FROM defectdata D
          INNER JOIN defects F ON F.id = D.defect_id
          INNER JOIN inspectiondata L ON L.inspection_no = D.inspection_no
          WHERE L.station = 'OQA'
            ${whereClause}
          GROUP BY F.name, F.defect_group
        ),
        trend_calc AS (
          SELECT
            defect_name,
            'stable' AS trend
          FROM defect_analysis
        )
        SELECT
          da.defect_name,
          da.defect_group,
          da.total_occurrences,
          da.total_ng_qty,
          da.affected_products,
          da.top_product,
          da.top_line,
          da.top_station,
          tc.trend,
          ROUND(da.avg_ng_per_occurrence::numeric, 2) AS avg_ng_per_occurrence
        FROM defect_analysis da
        LEFT JOIN trend_calc tc ON da.defect_name = tc.defect_name
        ORDER BY da.total_ng_qty DESC
      `;
            const result = await this.db.query(query, values);
            console.log(`✅ DefectRootCause: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in DefectRootCause:', error);
            throw new Error(`Failed to get DefectRootCause: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getMonthlyQualityTrend(params = {}) {
        try {
            const { dateFrom, dateTo } = params;
            console.log('🔧 MonthlyQualityTrend called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                conditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                conditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
            const query = `
        WITH monthly_data AS (
          SELECT
            L.month_year,
            COUNT(DISTINCT L.inspection_no) AS total_lots,
            COUNT(DISTINCT CASE WHEN L.judgment = true THEN L.inspection_no END) AS pass_lots,
            COUNT(DISTINCT L.inspection_no) AS total_inspections,
            SUM(COALESCE(D.ng_qty, 0)) AS total_ng,
            (COUNT(DISTINCT CASE WHEN L.judgment = true THEN L.inspection_no END)::DECIMAL /
             COALESCE(COUNT(DISTINCT L.inspection_no), 0) * 100) AS lar,
            (SUM(COALESCE(D.ng_qty, 0))::DECIMAL /
             COALESCE(COUNT(DISTINCT L.inspection_no), 0) * 1000000) AS dppm,
            (
              SELECT F.name
              FROM defectdata D2
              INNER JOIN defects F ON F.id = D2.defect_id
              INNER JOIN inspectiondata L2 ON L2.inspection_no = D2.inspection_no
              WHERE L2.month_year = L.month_year
              GROUP BY F.name
              ORDER BY SUM(D2.ng_qty) DESC
              LIMIT 1
            ) AS top_defect,
            (
              SELECT COUNT(DISTINCT D3.defect_id)
              FROM defectdata D3
              INNER JOIN inspectiondata L3 ON L3.inspection_no = D3.inspection_no
              WHERE L3.month_year = L.month_year AND L3.station = 'OQA' AND L3.round = 1
            ) AS defect_count
          FROM inspectiondata L
          LEFT JOIN  (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             )  D ON L.inspection_no = D.inspection_no
          WHERE L.station = 'OQA'
            AND L.round = 1
            ${whereClause}
          GROUP BY L.month_year
        ),
        with_lag AS (
          SELECT
            *,
            LAG(lar) OVER (ORDER BY month_year) AS prev_lar,
            LAG(dppm) OVER (ORDER BY month_year) AS prev_dppm,
            AVG(lar) OVER (ORDER BY month_year ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_3month_lar,
            AVG(dppm) OVER (ORDER BY month_year ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_3month_dppm
          FROM monthly_data
        )
        SELECT
          month_year,
          total_lots AS total_lot,
          pass_lots AS total_lotpass,
          total_inspections,
          total_ng,
          ROUND(lar::numeric, 2) AS lar,
          ROUND(dppm::numeric, 0) AS dppm,
          ROUND((lar - COALESCE(prev_lar, lar))::numeric, 2) AS lar_change,
          ROUND((dppm - COALESCE(prev_dppm, dppm))::numeric, 0) AS dppm_change,
          ROUND(rolling_3month_lar::numeric, 2) AS rolling_3month_lar,
          ROUND(rolling_3month_dppm::numeric, 0) AS rolling_3month_dppm,
          top_defect,
          defect_count
        FROM with_lag
        ORDER BY month_year
      `;
            const result = await this.db.query(query, values);
            console.log(`✅ MonthlyQualityTrend: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in MonthlyQualityTrend:', error);
            throw new Error(`Failed to get MonthlyQualityTrend: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getLARChart(params = { isCustomerReport: false }) {
        try {
            const { isCustomerReport, model, models, yearFrom, wwFrom, yearTo, wwTo } = params;
            console.log('🔧 LARReportModel.getLARReport called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            const hasDateRange = yearFrom && wwFrom && yearTo && wwTo;
            if (hasDateRange) {
                conditions.push(`fyww BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
                values.push(`${yearFrom}${wwFrom.toString().padStart(2, '0')}`);
                values.push(`${yearTo}${wwTo.toString().padStart(2, '0')}`);
                paramIndex += 2;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`model = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`model IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            if (isCustomerReport) {
                conditions.push(`customers = $${paramIndex}`);
                values.push('SGT');
                paramIndex++;
            }
            const viewName = isCustomerReport ? 'v_inspectiondata_customer' : 'inspectiondata';
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `

        SELECT
          *,
          (TOTAL_PASS_LOT /  COALESCE(TOTAL_LOT,0)) * 100.0 AS LAR,
          (Total_NG::float /  COALESCE(Total_Inspection::float,0)) *1000000.0 AS DPPM
        FROM (
          SELECT
            (w.fiscal_year::text || w.ww::text) fyww, w.fiscal_year, 
            w.ww, L.model || ' ' ||  L.version  as model, customers,
            COUNT(L.lotno) AS TOTAL_LOT,
            COUNT(CASE WHEN L.judgment = true THEN 1 END)::Numeric AS TOTAL_PASS_LOT,
            COUNT(CASE WHEN L.judgment = false THEN 1 END)::Numeric AS TOTAL_FAIL_LOT,
            SUM(general_sampling_qty) Total_Inspection,
            SUM(ng_qty) Total_NG
          FROM fiscal_calendar w
		  LEFT JOIN ${viewName} L ON L.inspection_date  = w.calendar_date  
      INNER JOIN parts p ON p.partno::text = L.itemno::text
      INNER JOIN customers_site s on s.code = p.customers_site 
			AND L.station = 'OQA'  AND L.round = 1
          LEFT JOIN  (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             )  D ON L.inspection_no = D.inspection_no              
          GROUP BY w.fiscal_year, w.ww, L.model, L.version, customers
          HAVING COUNT(L.lotno) >0
        ) TB
         ${whereClause}
        ORDER BY fyww

      `;
            console.log(`✅ getLARChart using view: ${viewName}, isCustomerReport: ${isCustomerReport}, WHERE: ${whereClause}, values: ${values.length}`);
            const result = await this.db.query(query, values);
            console.log(`✅ LARReportModel.getLARChart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in LARChartModel.getLARReport:', error);
            throw new Error(`Failed to get LAR chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getLARDefect(params = { isCustomerReport: false }) {
        try {
            const { isCustomerReport, model, models, yearFrom, wwFrom, yearTo, wwTo } = params;
            const conditions = [];
            const values = [];
            let paramIndex = 1;
            if (yearFrom && wwFrom && yearTo && wwTo) {
                conditions.push(`(d.fyww BETWEEN $${paramIndex} AND $${paramIndex + 1})`);
                values.push(`${yearFrom}${wwFrom.toString().padStart(2, '0')}`);
                values.push(`${yearTo}${wwTo.toString().padStart(2, '0')}`);
                paramIndex += 2;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`(d.model || ' ' || d.version) = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`(d.model || ' ' || d.version) IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            const defectViewName = isCustomerReport ? 'v_oqa_defect_customer' : 'v_oqa_defect';
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT
          d.fy,
          d.ww,
          d.model || ' ' || d.version as model,
          d.defect_group as defectname,
          d.ng_qty
        FROM ${defectViewName} d
        ${whereClause}
        ORDER BY d.fy, d.ww, model, d.defect_group
      `;
            console.log(`✅ getLARDefect using view: ${defectViewName}, isCustomerReport: ${isCustomerReport}, WHERE: ${whereClause}`);
            const result = await this.db.query(query, values);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getLARDefect:', error);
            throw new Error(`Failed to get LAR defect data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getIQAOQADppmOverallChart(params = {}) {
        try {
            const { yearTo: yearParam, wwTo: wwParam } = params;
            const year = yearParam || (0, shared_1.getCurrentFiscalYear)().toString();
            const ww = wwParam || (0, shared_1.getCurrentFiscalWeek)().toString().padStart(2, '0');
            console.log('🔧 IQA OQA DPPM Overall Chart called with params:', params);
            console.log('🔧 Using year:', year, 'ww:', ww);
            const values = [];
            values.push(`${year}${ww.toString().padStart(2, '0')}`);
            const query = `
      SELECT yearmonthww as yearmonth,  dppmTarget, total_lot_oqa, total_pass_lot_oqa, 
             total_fail_lot_oqa, total_inspection_oqa, total_ng_oqa, 
			 LAR_oqa, DPPM_oqa, total_lot_iqa, total_pass_lot_iqa, 
             total_fail_lot_iqa, total_inspection_iqa, total_ng_iqa, 
			 LAR_iqa, DPPM_iqa	
      FROM (
      --TB_MM
            SELECT 
              (W.yearmonth||'99') yearmonthww, 150 as dppmTarget,    
              COALESCE(total_lot_oqa,0) total_lot_oqa, 
              COALESCE(total_pass_lot_oqa,0) total_pass_lot_oqa, 
              COALESCE(total_fail_lot_oqa,0) total_fail_lot_oqa,
              COALESCE(total_inspection_oqa,0) total_inspection_oqa, 
              COALESCE(total_ng_oqa,0) total_ng_oqa,
              COALESCE(LAR_oqa,0) LAR_oqa,
              COALESCE(DPPM_oqa,0) DPPM_oqa,             
              COALESCE(total_lot_iqa,0) total_lot_iqa, 
              COALESCE(total_pass_lot_iqa,0) total_pass_lot_iqa, 
              COALESCE(total_fail_lot_iqa,0) total_fail_lot_iqa,
              COALESCE(total_inspection_iqa,0) total_inspection_iqa, 
              COALESCE(total_ng_iqa,0) total_ng_iqa,
              COALESCE(LAR_iqa,0) LAR_iqa,
              COALESCE(DPPM_iqa,0) DPPM_iqa	         	  
            FROM  (select yearmonth from v_wwmonthyear group by yearmonth) W      
            LEFT JOIN 
              ( select yearmonth,
                  SUM(COALESCE(total_lot, 0)) total_lot_oqa, 
                  SUM(COALESCE(total_pass_lot, 0)) total_pass_lot_oqa, 
                  SUM(COALESCE(total_fail_lot, 0)) total_fail_lot_oqa,
                  SUM(COALESCE(total_inspection, 0)) total_inspection_oqa, 
                  SUM(COALESCE(total_ng, 0)) total_ng_oqa,
                  COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(COALESCE(TOTAL_LOT, 0)), 0) * 100.0 AS LAR_oqa,
                  COALESCE(SUM(Total_NG)::float /  SUM(COALESCE(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM_oqa                   
              from v_oqa_dppm_customer 
              group by yearmonth
              )Q ON Q.yearmonth = w.yearmonth            
            LEFT JOIN 
            (
              select yearmonth,
                SUM(COALESCE(total_lot, 0)) total_lot_iqa, 
                      SUM(COALESCE(total_pass_lot, 0)) total_pass_lot_iqa, 
                      SUM(COALESCE(total_fail_lot, 0)) total_fail_lot_iqa,
                      SUM(COALESCE(total_inspection, 0)) total_inspection_iqa, 
                      SUM(COALESCE(total_ng, 0)) total_ng_iqa,
                      COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(COALESCE(TOTAL_LOT, 0)), 0) * 100.0 AS LAR_iqa,
                      COALESCE(SUM(Total_NG)::float /  SUM(COALESCE(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM_iqa
              from v_iqa_dppm 
              group by yearmonth
            )I ON  I.yearmonth = w.yearmonth       
                WHERE W.yearmonth
                  BETWEEN TO_CHAR(TO_DATE(tiger_fn_fiscalweekToyearmonth($1), 'YYMM') - INTERVAL '5 months', 'YYMM')
                  AND tiger_fn_fiscalweekToyearmonth($1) 
      UNION ALL
      --TB_WW
            SELECT 
              W.yearmonthww, 150 as dppmTarget,    
              COALESCE(total_lot_oqa,0) total_lot_oqa, 
              COALESCE(total_pass_lot_oqa,0) total_pass_lot_oqa, 
              COALESCE(total_fail_lot_oqa,0) total_fail_lot_oqa,
              COALESCE(total_inspection_oqa,0) total_inspection_oqa, 
              COALESCE(total_ng_oqa,0) total_ng_oqa,
              COALESCE(LAR_oqa,0) LAR_oqa,
              COALESCE(DPPM_oqa,0) DPPM_oqa,             
              COALESCE(total_lot_iqa,0) total_lot_iqa, 
              COALESCE(total_pass_lot_iqa,0) total_pass_lot_iqa, 
              COALESCE(total_fail_lot_iqa,0) total_fail_lot_iqa,
              COALESCE(total_inspection_iqa,0) total_inspection_iqa, 
              COALESCE(total_ng_iqa,0) total_ng_iqa,
              COALESCE(LAR_iqa,0) LAR_iqa,
              COALESCE(DPPM_iqa,0) DPPM_iqa	         	  
            FROM  (select (yearmonth||ww) yearmonthww, yearmonth from v_wwmonthyear group by yearmonth, ww) W      
            LEFT JOIN 
              ( select  (yearmonth||ww) yearmonthww,
                  SUM(COALESCE(total_lot, 0)) total_lot_oqa, 
                  SUM(COALESCE(total_pass_lot, 0)) total_pass_lot_oqa, 
                  SUM(COALESCE(total_fail_lot, 0)) total_fail_lot_oqa,
                  SUM(COALESCE(total_inspection, 0)) total_inspection_oqa, 
                  SUM(COALESCE(total_ng, 0)) total_ng_oqa,
                  COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(COALESCE(TOTAL_LOT, 0)), 0) * 100.0 AS LAR_oqa,
                  COALESCE(SUM(Total_NG)::float /  SUM(COALESCE(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM_oqa                   
              from v_oqa_dppm_customer 
              where yearmonth = tiger_fn_fiscalweekToyearmonth($1) 
              group by yearmonth, fy, ww
              )Q ON Q.yearmonthww = w.yearmonthww               
            LEFT JOIN 
            (
              select  (yearmonth||ww) yearmonthww,
                SUM(COALESCE(total_lot, 0)) total_lot_iqa, 
                      SUM(COALESCE(total_pass_lot, 0)) total_pass_lot_iqa, 
                      SUM(COALESCE(total_fail_lot, 0)) total_fail_lot_iqa,
                      SUM(COALESCE(total_inspection, 0)) total_inspection_iqa, 
                      SUM(COALESCE(total_ng, 0)) total_ng_iqa,
                      COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(COALESCE(TOTAL_LOT, 0)), 0) * 100.0 AS LAR_iqa,
                      COALESCE(SUM(Total_NG)::float /  SUM(COALESCE(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM_iqa
              from v_iqa_dppm 
              where yearmonth = tiger_fn_fiscalweekToyearmonth($1) 
              group by yearmonth, fy, ww
            )I ON  I.yearmonthww = w.yearmonthww   
            WHERE W.yearmonth = tiger_fn_fiscalweekToyearmonth($1) 

        ) TB
		   ORDER BY yearmonth
      `;
            const result = await this.db.query(query, values);
            console.log(`✅ OQA DPPM OVerall Chart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in OQA DPPM OVerall Chart:', error);
            throw new Error(`Failed to get OQA DPPM OVerall Chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOQADppmOverallChart(params = {}) {
        try {
            const { isCustomerReport, yearTo: yearParam, wwTo: wwParam } = params;
            const year = yearParam || (0, shared_1.getCurrentFiscalYear)().toString();
            const ww = wwParam || (0, shared_1.getCurrentFiscalWeek)().toString().padStart(2, '0');
            console.log('🔧 OQA DPPM Overall Chart called with params:', params);
            console.log('🔧 Using year:', year, 'ww:', ww);
            const values = [];
            values.push(`${year}${ww.toString().padStart(2, '0')}`);
            const tableName = isCustomerReport ? 'v_oqa_dppm_customer' : 'v_oqa_dppm';
            const query = `
       SELECT yearmonthww as yearmonth,  dppmTarget, total_lot, total_pass_lot, 
             total_fail_lot, total_inspection, total_ng, LAR, DPPM	   
      FROM (
      --TB_MM
            SELECT 
              (W.yearmonth||'99') yearmonthww, 150 as dppmTarget,    
              COALESCE(total_lot_oqa,0) total_lot, 
              COALESCE(total_pass_lot_oqa,0) total_pass_lot, 
              COALESCE(total_fail_lot_oqa,0) total_fail_lot,
              COALESCE(total_inspection_oqa,0) total_inspection, 
              COALESCE(total_ng_oqa,0) total_ng,
              COALESCE(LAR_oqa,0) LAR,
              COALESCE(DPPM_oqa,0) DPPM       	  
            FROM  (select yearmonth from v_wwmonthyear group by yearmonth) W      
            LEFT JOIN 
              ( select yearmonth,
                  SUM(COALESCE(total_lot, 0)) total_lot_oqa, 
                  SUM(COALESCE(total_pass_lot, 0)) total_pass_lot_oqa, 
                  SUM(COALESCE(total_fail_lot, 0)) total_fail_lot_oqa,
                  SUM(COALESCE(total_inspection, 0)) total_inspection_oqa, 
                  SUM(COALESCE(total_ng, 0)) total_ng_oqa,
                  COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(COALESCE(TOTAL_LOT, 0)), 0) * 100.0 AS LAR_oqa,
                  COALESCE(SUM(Total_NG)::float /  SUM(COALESCE(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM_oqa                   
              from ${tableName} 
              group by yearmonth
              )Q ON Q.yearmonth = w.yearmonth              
                WHERE W.yearmonth
                  BETWEEN TO_CHAR(TO_DATE(tiger_fn_fiscalweekToyearmonth($1), 'YYMM') - INTERVAL '5 months', 'YYMM')
                  AND tiger_fn_fiscalweekToyearmonth($1) 
      UNION ALL
      --TB_WW
            SELECT 
              W.yearmonthww, 150 as dppmTarget,    
              COALESCE(total_lot_oqa,0) total_lot_oqa, 
              COALESCE(total_pass_lot_oqa,0) total_pass_lot_oqa, 
              COALESCE(total_fail_lot_oqa,0) total_fail_lot_oqa,
              COALESCE(total_inspection_oqa,0) total_inspection_oqa, 
              COALESCE(total_ng_oqa,0) total_ng_oqa,
              COALESCE(LAR_oqa,0) LAR_oqa,
              COALESCE(DPPM_oqa,0) DPPM_oqa      	  
            FROM  (select (yearmonth||ww) yearmonthww, yearmonth 
                    from v_wwmonthyear 
                    WHERE yearmonth = tiger_fn_fiscalweekToyearmonth($1) 
                    group by yearmonth, ww) W      
            LEFT JOIN 
              ( select  (yearmonth||ww) yearmonthww,
                  SUM(COALESCE(total_lot, 0)) total_lot_oqa, 
                  SUM(COALESCE(total_pass_lot, 0)) total_pass_lot_oqa, 
                  SUM(COALESCE(total_fail_lot, 0)) total_fail_lot_oqa,
                  SUM(COALESCE(total_inspection, 0)) total_inspection_oqa, 
                  SUM(COALESCE(total_ng, 0)) total_ng_oqa,
                  COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(COALESCE(TOTAL_LOT, 0)), 0) * 100.0 AS LAR_oqa,
                  COALESCE(SUM(Total_NG)::float /  SUM(COALESCE(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM_oqa                   
              from ${tableName} 
              where yearmonth = tiger_fn_fiscalweekToyearmonth($1) 
              group by yearmonth, fy, ww
              )Q ON Q.yearmonthww = w.yearmonthww               
 
        ) TB
		   ORDER BY yearmonth
 

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ OQA DPPM OVerall Chart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in OQA DPPM OVerall Chart:', error);
            throw new Error(`Failed to get OQA DPPM OVerall Chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOQADppmOverallDefect(params = {}) {
        try {
            const { isCustomerReport, yearTo: yearParam, wwTo: wwParam } = params;
            const year = yearParam || (0, shared_1.getCurrentFiscalYear)().toString();
            const ww = wwParam || (0, shared_1.getCurrentFiscalWeek)().toString().padStart(2, '0');
            console.log('🔧 OQA DPPM Overall Defect called with params:', params);
            console.log('🔧 Using year:', year, 'ww:', ww);
            const values = [];
            values.push(`${year}${ww.toString().padStart(2, '0')}`);
            const tableName = isCustomerReport ? 'v_oqa_defect_customer' : 'v_oqa_defect';
            const query = `
        SELECT yearmonth, defect_group as defectname, ng_qty
		    FROM (
          --TB_MM
          SELECT (W.yearmonth||'99') yearmonth, defect_group, sum(ng_qty) ng_qty
          FROM fiscal_calendar W
          INNER JOIN ${tableName} D on D.fy = W.fiscal_year AND D.ww = W.ww
          WHERE W.yearmonth 
            BETWEEN tiger_fn_fiscalweekToyearmonth($1) - 500 AND tiger_fn_fiscalweekToyearmonth($1)  
          GROUP BY W.yearmonth, defect_group

          UNION ALL
		  
		      SELECT (W.yearmonth||W.ww) yearmonth, defect_group, sum(ng_qty) ng_qty
          FROM fiscal_calendar W
          INNER JOIN ${tableName} D on D.fy = W.fiscal_year AND D.ww = W.ww
          WHERE W.yearmonth = tiger_fn_fiscalweekToyearmonth($1)  
          GROUP BY W.yearmonth, w.ww, defect_group
        ) TB
		   ORDER BY yearmonth
      `;
            const result = await this.db.query(query, values);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get OQA DPPM OVerall  chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSeagateIQAResult(params) {
        try {
            const { yearFrom: yearParam, wwFrom: wwParam } = params;
            console.log('🔧 SeagateIQAReportModel.getSeagateIQAResult called with params:', params);
            const values = [];
            if (yearParam && wwParam) {
                values.push(`${yearParam}${wwParam.padStart(2, '0')}`);
            }
            const query = `

        SELECT
            fy, ww, fyww, model, Total_Inspection_Lot
          , Acceptable_Lot, Rejected_Lot, Rejected_Qty
          , (Acceptable_Lot /  COALESCE(Total_Inspection_Lot,0)) * 100.0 AS LAR
        FROM (
          SELECT fy, ww, fy||ww as fyww, (P.product_families|| ' ' || P.versions) AS Model
          , COUNT(id) Total_Inspection_Lot
          , COUNT(CASE WHEN L.rej = 0 THEN 1 END)::Numeric Acceptable_Lot
          , COUNT(CASE WHEN L.rej > 0 THEN 1 END)::Numeric  Rejected_Lot
          , SUM(L.rej) Rejected_Qty
          FROM public.iqadata L
          INNER JOIN v_customerparts P ON L.item = P.partno_customer
          WHERE (fy || ww)= $1
          GROUP BY fy, ww, P.product_families, P.versions
          ) TB

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ SeagateIQAReportModel.getSeagateIQAResult: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in SeagateIQAReportModel.getSeagateIQAResult:', error);
            throw new Error(`Failed to get SeagateIQAResult chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSGTIQATrendChart(params = {}) {
        try {
            const { model, models, productFamilies, product_type, yearTo: yearParam, wwTo: wwParam } = params;
            const year = yearParam || (0, shared_1.getCurrentFiscalYear)().toString();
            const ww = wwParam || (0, shared_1.getCurrentFiscalWeek)().toString().padStart(2, '0');
            console.log('🔧 SGT IQA Trend Chart called with params:', params);
            console.log('🔧 Using year:', year, 'ww:', ww);
            const values = [];
            let paramIndex = 1;
            values.push(`${year}`);
            paramIndex++;
            values.push(`${ww.toString().padStart(2, '0')}`);
            paramIndex++;
            const conditions = [`Where 1=1`];
            if (productFamilies && productFamilies.length > 0) {
                if (productFamilies.length === 1) {
                    conditions.push(`P.product_families = $${paramIndex}`);
                    values.push(productFamilies[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = productFamilies.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`P.product_families IN (${placeholders})`);
                    productFamilies.forEach(pf => values.push(pf));
                    paramIndex += productFamilies.length;
                }
            }
            else {
                const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
                if (modelsToFilter.length > 0) {
                    if (modelsToFilter.length === 1) {
                        conditions.push(`P.versions = $${paramIndex}`);
                        values.push(modelsToFilter[0]);
                        paramIndex++;
                    }
                    else {
                        const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                        conditions.push(`P.versions IN (${placeholders})`);
                        modelsToFilter.forEach(m => values.push(m));
                        paramIndex += modelsToFilter.length;
                    }
                }
            }
            if (product_type) {
                conditions.push(`P.product_type = $${paramIndex}`);
                values.push(product_type);
                paramIndex++;
            }
            const whereClause = conditions.join(' AND ');
            console.log(`✅ getSGTIQATrendChart WHERE: ${whereClause}, values: ${values.length}`);
            const query = `
   
          SELECT *
          FROM (
            SELECT
              yearmonth, model, product_type,total_lot, total_pass_lot, total_fail_lot,
              total_inspection, total_ng,
              (TOTAL_PASS_LOT /  COALESCE(TOTAL_LOT,0)) * 100.0 AS LAR,
              (Total_NG::float /  COALESCE(Total_Inspection::float,0)) *1000000.0 AS DPPM
            FROM (
            -- TB_MM
              SELECT 
                (yymm||99)  yearmonth, P.product_families || ' ' ||  P.versions  as model, P.product_type,
                COUNT(lotno) AS TOTAL_LOT,
                COUNT(CASE WHEN rej = 0 THEN 1 END)::Numeric AS TOTAL_PASS_LOT,
                COUNT(CASE WHEN rej > 0 THEN 1 END)::Numeric AS TOTAL_FAIL_LOT,
                SUM(inspec) Total_Inspection,
                SUM(rej) Total_NG
              FROM 
              (
                WITH base AS (
                  SELECT TO_DATE(yearmonth, 'YYMM') start_month
                  FROM mv_fiscal_calendar
                  WHERE  fiscal_year = $1 AND ww = $2
                  GROUP BY yearmonth
                )
                SELECT TO_CHAR(m, 'YYMM') AS yymm
                FROM base,
                  generate_series(
                  start_month - INTERVAL '12 month',   
                  start_month,                         
                  INTERVAL '1 month'                   
              ) AS g(m)
            ) TB 
            INNER JOIN  mv_fiscal_calendar W  ON W.yearmonth  = TB.yymm
            LEFT JOIN  iqadata Q ON Q.ww = W.ww and Q.fy = W.fiscal_year
            INNER JOIN v_customerparts p ON p.partno_customer::text = Q.item::text
             ${whereClause}
            GROUP BY yymm, P.product_families, P.versions, P.product_type
            ) TB_MM

            UNION ALL

            SELECT
              (w.yearmonth||w.ww) yearmonth, model, product_type,
              COALESCE(total_lot, 0) total_lot,
              COALESCE(total_pass_lot, 0) total_pass_lot,
              COALESCE(total_fail_lot, 0) total_fail_lot,
              COALESCE(total_inspection, 0) total_inspection,
              COALESCE(total_ng, 0) total_ng,
              COALESCE((TOTAL_PASS_LOT /  COALESCE(TOTAL_LOT,0)) * 100.0, 0) AS LAR,
              COALESCE((Total_NG::float /  COALESCE(Total_Inspection::float,0)) *1000000.0, 0) AS DPPM
            FROM v_wwmonthyear w
            LEFT JOIN  (
            -- TB_WW
              SELECT Q.fy, Q.ww, (Q.fy||Q.ww) fyww,
                P.product_families || ' ' || P.versions as model,
                P.product_type,
                COUNT(lotno) AS TOTAL_LOT,
                COUNT(CASE WHEN rej = 0 THEN 1 END)::Numeric AS TOTAL_PASS_LOT,
                COUNT(CASE WHEN rej > 0 THEN 1 END)::Numeric AS TOTAL_FAIL_LOT,
                SUM(inspec) Total_Inspection,
                SUM(rej) Total_NG
              FROM   iqadata Q
              INNER JOIN v_customerparts p ON p.partno_customer::text = Q.item::text
              ${whereClause}
              GROUP BY  Q.fy,Q.ww,P.product_families, P.versions, P.product_type
              ) TB_WW ON TB_WW.fy = w.fy AND TB_WW.ww = w.ww
              WHERE  w.fy = $1 AND w.ww = $2
          ) TB   
          ORDER BY yearmonth

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ SGT IQA Trend Chart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in SGT IQA Trend Chart:', error);
            throw new Error(`Failed to get SGT IQA Trend Chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSGTIQATrendDefect(params = {}) {
        try {
            const { model, models, productFamilies, product_type, yearTo: yearParam, wwTo: wwParam } = params;
            const year = yearParam || (0, shared_1.getCurrentFiscalYear)().toString();
            const ww = wwParam || (0, shared_1.getCurrentFiscalWeek)().toString().padStart(2, '0');
            console.log('🔧 SGT IQA Trend Defect called with params:', params);
            console.log('🔧 Using year:', year, 'ww:', ww);
            const values = [];
            let paramIndex = 1;
            values.push(`${year}`);
            paramIndex++;
            values.push(`${ww.toString().padStart(2, '0')}`);
            paramIndex++;
            const conditions = [`Where 1=1`];
            if (productFamilies && productFamilies.length > 0) {
                if (productFamilies.length === 1) {
                    conditions.push(`P.product_families = $${paramIndex}`);
                    values.push(productFamilies[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = productFamilies.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`P.product_families IN (${placeholders})`);
                    productFamilies.forEach(pf => values.push(pf));
                    paramIndex += productFamilies.length;
                }
            }
            else {
                const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
                if (modelsToFilter.length > 0) {
                    if (modelsToFilter.length === 1) {
                        conditions.push(`P.versions = $${paramIndex}`);
                        values.push(modelsToFilter[0]);
                        paramIndex++;
                    }
                    else {
                        const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                        conditions.push(`P.versions IN (${placeholders})`);
                        modelsToFilter.forEach(m => values.push(m));
                        paramIndex += modelsToFilter.length;
                    }
                }
            }
            if (product_type) {
                conditions.push(`P.product_type = $${paramIndex}`);
                values.push(product_type);
                paramIndex++;
            }
            const whereClause = conditions.join(' AND ');
            console.log(`✅ getSGTIQATrendDefect  WHERE: ${whereClause}, values: ${values.length}`);
            const query = `
            SELECT yearmonth, model, defect, rej
            FROM (
              -- TB_MM (Monthly - 12 months)
              SELECT yearmonth, model, defect, SUM(rej) rej
              FROM (
                SELECT (TB.yymm||99) yearmonth, COALESCE(Q.rej, 0) rej,
                   P.product_families || ' ' || P.versions as model,
                   CASE WHEN COALESCE(Q.rej, 0) = 0 THEN ' ' ELSE COALESCE(D.defect_group, ' ') END defect
                FROM (
                  WITH base AS (
                    SELECT TO_DATE(yearmonth, 'YYMM') start_month
                    FROM mv_fiscal_calendar
                    WHERE fiscal_year = $1 AND ww = $2
                    GROUP BY yearmonth
                  )
                  SELECT TO_CHAR(m, 'YYMM') AS yymm
                  FROM base,
                    generate_series(
                      start_month - INTERVAL '12 month',
                      start_month,
                      INTERVAL '1 month'
                    ) AS g(m)
                ) TB
                INNER JOIN mv_fiscal_calendar W ON W.yearmonth = TB.yymm
                LEFT JOIN iqadata Q ON Q.ww = W.ww AND Q.fy = W.fiscal_year
                LEFT join  v_iqadefect D on D.iqaid = Q.id
                INNER JOIN v_customerparts P ON P.partno_customer::text = Q.item::text
                ${whereClause}
              ) TB_MM
              GROUP BY yearmonth, model, defect

              UNION ALL

              -- TB_WW (Weekly - current week)
              SELECT yearmonth, model, defect, SUM(rej) rej
              FROM (
                SELECT (W.yearmonth||W.ww) yearmonth, COALESCE(Q.rej, 0) rej,
                   P.product_families || ' ' || P.versions as model,
                   CASE WHEN COALESCE(Q.rej, 0) = 0 THEN ' ' ELSE COALESCE(D.defect_group, ' ') END defect
                FROM v_wwmonthyear W
                LEFT JOIN iqadata Q ON W.fy = Q.fy AND W.ww = Q.ww 
                LEFT join  v_iqadefect D on D.iqaid = Q.id
                INNER JOIN v_customerparts P ON P.partno_customer::text = Q.item::text
                ${whereClause}
                AND W.fy = $1 AND W.ww = $2
              ) TB_WW
              GROUP BY yearmonth, model, defect
            ) TB_ALL
            WHERE rej > 0
            ORDER BY yearmonth
      `;
            const result = await this.db.query(query, values);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get LAR chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getHistoryTracking(lotNumbers) {
        try {
            console.log('🔧 ReportModel.getHistoryTracking called with lotNumbers:', lotNumbers);
            const query = `
        SELECT v.ww, v.shift, v.sampling_reason_description, v.round, v.lotno, v.tab,
               v.model, v.partsite, v.mclineno, v.itemno, v.partno_customer,
               v.fvi_lot_qty, v.general_sampling_qty, v.crack_sampling_qty,
               v.qc_id, e.empname AS qc_name,
               v.judgment, v.rejqty, v.customers, v.defect_type, v.defectname,
               d.image_ids
        FROM v_history_tracking v
        LEFT JOIN v_defect_image_ids d ON d.defect_id = v.defectdata_id
        LEFT JOIN mv_employee e ON e.empid = v.qc_id::text
        WHERE v.lotno = ANY($1)
        ORDER BY v.lotno, v.ww
      `;
            const result = await this.db.query(query, [lotNumbers]);
            console.log(`✅ ReportModel.getHistoryTracking: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ReportModel.getHistoryTracking:', error);
            throw new Error(`Failed to get history tracking data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDefectImageSummary(params) {
        try {
            console.log('🔧 ReportModel.getDefectImageSummary called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            conditions.push(`v.inspection_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            values.push(params.dateFrom, params.dateTo);
            paramIndex += 2;
            if (params.sites && params.sites.length > 0) {
                conditions.push(`v.site = ANY($${paramIndex})`);
                values.push(params.sites);
                paramIndex++;
            }
            if (params.customerSites && params.customerSites.length > 0) {
                conditions.push(`v.customers_site = ANY($${paramIndex})`);
                values.push(params.customerSites);
                paramIndex++;
            }
            if (params.productFamilies && params.productFamilies.length > 0) {
                conditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(params.productFamilies);
                paramIndex++;
            }
            if (params.productTypes && params.productTypes.length > 0) {
                conditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(params.productTypes);
                paramIndex++;
            }
            if (params.models && params.models.length > 0) {
                conditions.push(`model_version = ANY($${paramIndex})`);
                values.push(params.models);
                paramIndex++;
            }
            if (params.defects && params.defects.length > 0) {
                conditions.push(`v.defectname = ANY($${paramIndex})`);
                values.push(params.defects);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT v.defectname, d.image_ids
        FROM v_defect_image_summary v
        LEFT JOIN v_defect_image_ids d ON d.defect_id = v.defectdata_id
        LEFT JOIN parts p ON p.partno = v.itemno
        ${whereClause}
        ORDER BY v.defectname
      `;
            console.log('[SIV getDefectImageSummary] query:', query);
            console.log('[SIV getDefectImageSummary] values:', JSON.stringify(values));
            const result = await this.db.query(query, values);
            console.log(`✅ ReportModel.getDefectImageSummary: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ReportModel.getDefectImageSummary:', error);
            throw new Error(`Failed to get defect image summary data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getPartsFilterOptions(params) {
        try {
            console.log('🔧 ReportModel.getPartsFilterOptions called with params:', params);
            const conditions = ['p.customers_site = ANY($1)'];
            const values = [params.customerSites];
            let paramIndex = 2;
            if (params.productFamilies && params.productFamilies.length > 0) {
                conditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(params.productFamilies);
                paramIndex++;
            }
            if (params.productTypes && params.productTypes.length > 0) {
                conditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(params.productTypes);
                paramIndex++;
            }
            const whereClause = conditions.join(' AND ');
            const query = `
        SELECT
          COALESCE(array_agg(DISTINCT p.product_families) FILTER (WHERE p.product_families IS NOT NULL), '{}') AS product_families,
          COALESCE(array_agg(DISTINCT p.product_type) FILTER (WHERE p.product_type IS NOT NULL), '{}') AS product_types,
          COALESCE(array_agg(DISTINCT i.model || ' ' || i.version) FILTER (WHERE i.model IS NOT NULL AND i.version IS NOT NULL), '{}') AS models
        FROM parts p
        INNER JOIN inspectiondata i ON i.itemno = p.partno
        WHERE ${whereClause}
      `;
            const result = await this.db.query(query, values);
            const row = result.rows[0] || { product_families: [], product_types: [], models: [] };
            return {
                productFamilies: row.product_families,
                productTypes: row.product_types,
                models: row.models,
            };
        }
        catch (error) {
            console.error('❌ Error in ReportModel.getPartsFilterOptions:', error);
            throw new Error(`Failed to get parts filter options: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getAvailableModels() {
        try {
            console.log('🔧 LARReportModel.getAvailableModels called');
            const query = `
        SELECT (model || ' ' || version) as model
        FROM public.inspectiondata
        WHERE model IS NOT NULL AND version IS NOT NULL
        GROUP BY model, version
        ORDER BY model, version
      `;
            const result = await this.db.query(query);
            const models = result.rows.map(row => row.model);
            console.log(`✅ LARReportModel.getAvailableModels: Retrieved ${models.length} models`);
            return models;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getAvailableModels:', error);
            throw new Error(`Failed to get available models: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSGAIQAModels(fyww) {
        try {
            console.log('🔧 LARReportModel.SGAIQAModels called with fyww:', fyww);
            const fywwValue = fyww || null;
            const query = `
        SELECT p.versions AS model
        FROM (
            SELECT fiscal_year, ww
            FROM public.mv_fiscal_calendar
            WHERE (fiscal_year || ww) <= $1
            ORDER BY (fiscal_year || ww) DESC
            LIMIT 52
        ) v
        INNER JOIN iqadata i ON i.fy = v.fiscal_year AND i.ww = v.ww
        INNER JOIN v_customerparts p ON p.partno_customer = i.item
        GROUP BY p.versions
        ORDER BY p.versions;
      `;
            const result = await this.db.query(query, [fywwValue]);
            const models = result.rows.map(row => row.model);
            console.log(`✅ LARReportModel.SGAIQAModels: Retrieved ${models.length} models`);
            return models;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.SGAIQAModels:', error);
            throw new Error(`Failed to get available models: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSGAIQAProductFamilies(fyww) {
        try {
            console.log('🔧 LARReportModel.getSGAIQAProductFamilies called with fyww:', fyww);
            const fywwValue = fyww || null;
            const query = `
        SELECT p.product_families
        FROM (
            SELECT fiscal_year, ww
            FROM public.mv_fiscal_calendar
            WHERE (fiscal_year || ww) <= $1
            ORDER BY (fiscal_year || ww) DESC
            LIMIT 52
        ) v
        INNER JOIN iqadata i ON i.fy = v.fiscal_year AND i.ww = v.ww
        INNER JOIN v_customerparts p ON p.partno_customer = i.item
        GROUP BY p.product_families
        ORDER BY p.product_families;
      `;
            const result = await this.db.query(query, [fywwValue]);
            const productFamilies = result.rows.map(row => row.product_families);
            console.log(`✅ LARReportModel.getSGAIQAProductFamilies: Retrieved ${productFamilies.length} product families`);
            return productFamilies;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getSGAIQAProductFamilies:', error);
            throw new Error(`Failed to get available product families: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFiscalYears(report) {
        try {
            console.log('🔧 LARReportModel.getFiscalYears called');
            const report_query = {
                LAR: 'SELECT fy AS fiscal_year FROM inspectiondata  GROUP BY fy ORDER BY fy',
                IQAOQA: 'SELECT fy AS fiscal_year FROM iqadata  GROUP BY fy ORDER BY fy',
                DPPM: 'SELECT fy AS fiscal_year FROM inspectiondata  GROUP BY fy ORDER BY fy',
                Result: 'SELECT fy AS fiscal_year FROM iqadata  GROUP BY fy ORDER BY fy',
                Trend: 'SELECT fy AS fiscal_year FROM iqadata  GROUP BY fy ORDER BY fy',
                OverviewOQA: "SELECT fy AS fiscal_year FROM v_inspectiondata_customer WHERE station='OQA' GROUP BY fy ORDER BY fy",
                SOQMDaily: "SELECT fy AS fiscal_year FROM inspectiondata WHERE station='OQA' AND round=1 GROUP BY fy ORDER BY fy",
            };
            const query = report_query[report];
            const result = await this.db.query(query);
            const fiscalYears = result.rows.map(row => row.fiscal_year);
            console.log(`✅ LARReportModel.getFiscalYears: Retrieved ${fiscalYears.length} fiscal years`);
            return fiscalYears;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getFiscalYears:', error);
            throw new Error(`Failed to get fiscal years: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getWorkWeeks(report, fiscalYear) {
        try {
            console.log('🔧 LARReportModel.getWorkWeeks called with fiscalYear:', fiscalYear);
            const values = [];
            if (fiscalYear) {
                values.push(fiscalYear);
            }
            const report_query = {
                LAR: 'SELECT ww FROM inspectiondata WHERE fy = $1 GROUP BY ww ORDER BY ww',
                IQAOQA: 'SELECT ww FROM iqadata WHERE fy = $1 GROUP BY ww ORDER BY ww',
                DPPM: 'SELECT ww FROM inspectiondata WHERE fy = $1 GROUP BY ww ORDER BY ww',
                Result: 'SELECT ww FROM iqadata WHERE fy = $1 GROUP BY ww ORDER BY ww',
                Trend: 'SELECT ww FROM iqadata WHERE fy = $1 GROUP BY ww ORDER BY ww',
                OverviewOQA: "SELECT ww FROM v_inspectiondata_customer WHERE station='OQA' AND fy = $1 GROUP BY ww ORDER BY ww",
                SOQMDaily: "SELECT ww FROM inspectiondata WHERE station='OQA' AND round=1 AND fy = $1 GROUP BY ww ORDER BY ww",
            };
            const query = report_query[report];
            const result = await this.db.query(query, values);
            const workWeeks = result.rows.map(row => row.ww);
            console.log(`✅ LARReportModel.getWorkWeeks: Retrieved ${workWeeks.length} work weeks`);
            return workWeeks;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getWorkWeeks:', error);
            throw new Error(`Failed to get work weeks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOverviewOQA(params) {
        try {
            const { yearFrom, wwFrom, models } = params;
            console.log('🔧 ReportModel.getOverviewOQA called with params:', params);
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (yearFrom) {
                conditions.push(`v.fy = $${paramIndex}`);
                values.push(yearFrom);
                paramIndex++;
            }
            if (wwFrom) {
                conditions.push(`v.ww = $${paramIndex}`);
                values.push(wwFrom);
                paramIndex++;
            }
            if (models && models.length > 0) {
                const placeholders = models.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                conditions.push(`v.model IN (${placeholders})`);
                models.forEach(m => values.push(m));
                paramIndex += models.length;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        select 
          partno_customer,
          model,
          product_type,
          total_lot_inspection,          
          total_lot_pass,
          total_lot_fail,
          total_sampling,
          defect_group,
          ng_qty,
          total_lot_pass / COALESCE(total_lot_inspection, 0::bigint)::numeric * 100.0 AS lar,
          ng_qty::double precision / COALESCE(total_sampling::double precision, 0::double precision) * 1000000.0::double precision AS dppm
        from(
          SELECT
            v.partno_customer,
            v.model,
            v.product_type,
            count(v.lotno) total_lot_inspection,          
            sum(v.pass_lot) total_lot_pass,
            sum(v.fail_lot) total_lot_fail,
            sum(v.general_sampling_qty) total_sampling,
            d.defect_group,
            ng_qty
          from public.v_oqa_overview v
          inner join  v_oqa_overview_defectgroup d on v.fy = d.fy and v.ww=d.ww and v.partno_customer = d.partno_customer
          ${whereClause}
          group by v.partno_customer, v.model, v.product_type, d.defect_group,ng_qty
          ) TB
      `;
            console.log('🔧 Overview OQA query:', query, values);
            const result = await this.db.query(query, values);
            console.log(`✅ ReportModel.getOverviewOQA: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ReportModel.getOverviewOQA:', error);
            throw new Error(`Failed to get Overview OQA data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOverviewOQALotDetail(fy, ww, partno_customer, defect_group) {
        try {
            const query = `
        SELECT l.lotno, l.inspection_no, SUM(d.ng_qty) AS ng_qty
        FROM v_inspectiondata_customer l
        JOIN parts p ON p.partno::text = l.itemno::text
        JOIN customers_site s ON s.customers = 'SGT' AND s.code::text = p.customers_site::text
        JOIN defectdata_customer d ON l.inspection_no::text = d.inspection_no::text
        JOIN defects f ON f.id = d.defect_id
        WHERE l.station = 'OQA' AND l.round = 1
          AND l.fy = $1 AND l.ww = $2 AND p.partno_customer = $3 AND f.defect_group = $4
        GROUP BY l.lotno, l.inspection_no
        ORDER BY l.lotno
      `;
            const result = await this.db.query(query, [fy, ww, partno_customer, defect_group]);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ReportModel.getOverviewOQALotDetail:', error);
            throw new Error(`Failed to get Overview OQA lot detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDefectTypeAnalysis(dateFrom, dateTo, models, shifts) {
        try {
            const values = [dateFrom + ' 00:00:00', dateTo + ' 23:59:59.999'];
            const conditions = ['d.defect_date BETWEEN $1 AND $2'];
            let paramIndex = 3;
            if (models && models.length > 0) {
                const placeholders = models.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                conditions.push(`(i.model || ' ' || i."version") IN (${placeholders})`);
                models.forEach(m => values.push(m));
                paramIndex += models.length;
            }
            if (shifts && shifts.length > 0) {
                const placeholders = shifts.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                conditions.push(`i.shift IN (${placeholders})`);
                shifts.forEach(s => values.push(s));
                paramIndex += shifts.length;
            }
            const query = `
        SELECT i.inspection_date, i.itemno, i.model, i."version", i.lotno, i.shift,
               COALESCE(p.tab, '') AS tab, i.station,
               d.defect_id, d.defect_type, f.name, f.description,
               SUM(d.ng_qty) AS ng_qty,
               d.qc_name,
               (SELECT e.empname FROM mv_employee e WHERE e.empid::text = d.qc_name::text OR e.empname::text = d.qc_name::text LIMIT 1) AS qc_fullname,
               d.qclead_name,
               (SELECT e.empname FROM mv_employee e WHERE e.empid::text = d.qclead_name::text OR e.empname::text = d.qclead_name::text LIMIT 1) AS qclead_fullname,
               d.inspector,
               (SELECT e.empname FROM mv_employee e WHERE e.empid::text = d.inspector::text OR e.empname::text = d.inspector::text LIMIT 1) AS inspector_fullname,
               d.groupvi, d.station AS defect_station,
               d.mbr_name, d.defect_date, d.defect_detail,
               (SELECT array_agg(di.id) FROM defect_image di WHERE di.defect_id = d.id) AS image_ids,
               (SELECT string_agg(DISTINCT di.photo_magnification, ', ') FROM defect_image di WHERE di.defect_id = d.id) AS photo_magnification,
               (SELECT string_agg(di.stamp, ', ') FROM defect_image di WHERE di.defect_id = d.id AND di.stamp IS NOT NULL AND di.stamp != '') AS stamp
        FROM public.inspectiondata i
        INNER JOIN defectdata d ON d.inspection_no = i.inspection_no
        INNER JOIN public.defects f ON f.id = d.defect_id
        LEFT JOIN public.parts p ON p.partno::text = i.itemno::text
        WHERE ${conditions.join(' AND ')}
        GROUP BY i.inspection_date, i.itemno, i.model, i."version", i.lotno, i.shift,
                 p.tab, i.station,
                 d.id, d.defect_id, d.defect_type, f.name, f.description,
                 d.qc_name, d.qclead_name, d.inspector,
                 d.groupvi, d.station, d.mbr_name, d.defect_date, d.defect_detail
        ORDER BY d.defect_date DESC, ng_qty DESC
      `;
            console.log('🔧 DefectTypeAnalysis query:', query, values);
            const result = await this.db.query(query, values);
            console.log(`✅ DefectTypeAnalysis: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in getDefectTypeAnalysis:', error);
            throw new Error(`Failed to get Defect Type Analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSOQMDaily(params) {
        try {
            const { yearFrom, wwFrom, yearTo, wwTo, models, model, customerSites } = params;
            const values = [];
            const conditions = ["L.station = 'OQA'", "L.round = 1"];
            let paramIndex = 1;
            if (yearFrom && wwFrom && yearTo && wwTo) {
                conditions.push(`(w.fiscal_year::text || LPAD(w.ww::text, 2, '0')) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
                values.push(`${yearFrom}${wwFrom.toString().padStart(2, '0')}`);
                values.push(`${yearTo}${wwTo.toString().padStart(2, '0')}`);
                paramIndex += 2;
            }
            if (customerSites && customerSites.length > 0) {
                conditions.push(`p.customers_site = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                conditions.push(`(L.model || ' ' || L.version) IN (${placeholders})`);
                modelsToFilter.forEach(m => values.push(m));
                paramIndex += modelsToFilter.length;
            }
            if (params.lotno) {
                conditions.push(`L.lotno ILIKE $${paramIndex}`);
                values.push(`%${params.lotno}%`);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const partsJoin = (customerSites && customerSites.length > 0)
                ? 'INNER JOIN parts p ON p.partno = L.itemno'
                : '';
            const query = `
        SELECT
          w.ww,
          L.inspection_date,
          L.model || ' ' || L.version AS model,
          (D.inspector::text) AS inspector_id,
          L.lotno,
          COALESCE(SUM(D.ng_qty), 0)::int AS total_ng
        FROM fiscal_calendar w
        INNER JOIN inspectiondata L ON L.inspection_date::date = w.calendar_date::date
        ${partsJoin}
        LEFT JOIN (
          SELECT inspection_no, inspector , SUM(ng_qty) AS ng_qty
          FROM defectdata
          GROUP BY inspection_no, inspector
        ) D ON L.inspection_no = D.inspection_no
        ${whereClause}
        GROUP BY w.ww, L.inspection_date, L.model, L.version, D.inspector, L.lotno
        HAVING COALESCE(SUM(D.ng_qty), 0) > 0
        ORDER BY w.ww, L.inspection_date, L.model, L.version, L.lotno
      `;
            console.log('🔧 SOQM Daily query:', query.substring(0, 200), '...', values);
            const result = await this.db.query(query, values);
            console.log(`✅ SOQM Daily: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in getSOQMDaily:', error);
            throw new Error(`Failed to get SOQM Daily data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSOQMWeekly(params) {
        try {
            const { yearFrom, wwFrom, yearTo, wwTo, models, model, customerSites } = params;
            const values = [];
            const conditions = ["L.station = 'OQA'", "L.round = 1"];
            let paramIndex = 1;
            if (yearFrom && wwFrom && yearTo && wwTo) {
                conditions.push(`(w.fiscal_year::text || LPAD(w.ww::text, 2, '0')) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
                values.push(`${yearFrom}${wwFrom.toString().padStart(2, '0')}`);
                values.push(`${yearTo}${wwTo.toString().padStart(2, '0')}`);
                paramIndex += 2;
            }
            if (customerSites && customerSites.length > 0) {
                conditions.push(`p.customers_site = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                conditions.push(`(L.model || ' ' || L.version) IN (${placeholders})`);
                modelsToFilter.forEach(m => values.push(m));
                paramIndex += modelsToFilter.length;
            }
            if (params.lotno) {
                conditions.push(`L.lotno ILIKE $${paramIndex}`);
                values.push(`%${params.lotno}%`);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const partsJoin = (customerSites && customerSites.length > 0)
                ? 'INNER JOIN parts p ON p.partno = L.itemno'
                : '';
            const summaryQuery = `
        SELECT
          L.model || ' ' || L.version AS model,
          COUNT(L.lotno) AS inspection_lot,
          COUNT(CASE WHEN L.judgment = true THEN 1 END) AS accept_lot,
          COUNT(CASE WHEN L.judgment = false THEN 1 END) AS reject_lot,
          SUM(L.general_sampling_qty) AS inspection_qty,
          COALESCE(SUM(D.ng_qty), 0)::int AS ng_qty
        FROM fiscal_calendar w
        INNER JOIN inspectiondata L ON L.inspection_date::date = w.calendar_date::date
        ${partsJoin}
        LEFT JOIN (
          SELECT inspection_no, SUM(ng_qty) AS ng_qty
          FROM defectdata
          GROUP BY inspection_no
        ) D ON L.inspection_no = D.inspection_no
        ${whereClause}
        GROUP BY L.model, L.version
        ORDER BY L.model, L.version
      `;
            const defectQuery = `
        SELECT
          L.model || ' ' || L.version AS model,
          f.name AS defect_name,
          SUM(d.ng_qty)::int AS ng_qty
        FROM fiscal_calendar w
        INNER JOIN inspectiondata L ON L.inspection_date::date = w.calendar_date::date
        ${partsJoin}
        INNER JOIN defectdata d ON d.inspection_no = L.inspection_no
        INNER JOIN defects f ON f.id = d.defect_id
        ${whereClause}
        GROUP BY L.model, L.version, f.name
        HAVING SUM(d.ng_qty) > 0
        ORDER BY L.model, L.version, ng_qty DESC
      `;
            const allDefectsQuery = `SELECT name AS defect_name FROM defects WHERE is_active = true ORDER BY id ASC`;
            console.log('🔧 SOQM Weekly summary query:', summaryQuery.substring(0, 200), '...', values);
            const [summaryResult, defectResult, allDefectsResult] = await Promise.all([
                this.db.query(summaryQuery, values),
                this.db.query(defectQuery, values),
                this.db.query(allDefectsQuery),
            ]);
            console.log(`✅ SOQM Weekly: ${summaryResult.rows.length} models, ${defectResult.rows.length} defect rows, ${allDefectsResult.rows.length} defect types`);
            return {
                summary: summaryResult.rows,
                defects: defectResult.rows,
                allDefectNames: allDefectsResult.rows.map((r) => r.defect_name),
            };
        }
        catch (error) {
            console.error('❌ Error in getSOQMWeekly:', error);
            throw new Error(`Failed to get SOQM Weekly data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFVIInspection(params) {
        try {
            const { inputDateFrom, inputDateTo, lotno, judgment } = params;
            const values = [];
            const conditions = ["L.lotno <> ''"];
            let paramIndex = 1;
            if (inputDateFrom) {
                conditions.push(`L.inputdate >= $${paramIndex}`);
                values.push(inputDateFrom);
                paramIndex++;
            }
            if (inputDateTo) {
                conditions.push(`L.inputdate <= $${paramIndex}`);
                values.push(inputDateTo + ' 23:59:59');
                paramIndex++;
            }
            if (lotno && lotno.trim() !== '') {
                conditions.push(`L.lotno ILIKE $${paramIndex}`);
                values.push(`%${lotno.trim()}%`);
                paramIndex++;
            }
            if (judgment === 'true') {
                conditions.push(`I.judgment = true`);
            }
            else if (judgment === 'false') {
                conditions.push(`I.judgment = false`);
            }
            else if (judgment === 'null') {
                conditions.push(`I.judgment IS NULL`);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT L.inputdate, L.lotno, L.partsite, L.lineno, L.itemno, L.model, L.version,
               I.station, I.round , I.fvilineno, I.judgment, I.inspection_date
        FROM (
         select Max(inputdate) as inputdate, lotno, partsite, lineno, itemno, model, version
         from inf_lotinput
          where lotno <> ''
          group by lotno, partsite, lineno, itemno, model, version
        ) L
        LEFT JOIN inspectiondata I ON L.lotno = I.lotno
        ${whereClause}
        ORDER BY L.inputdate DESC, L.lotno DESC, I.station, I.round
      `;
            console.log('🔧 FVI Inspection query:', query, values);
            const result = await this.db.query(query, values);
            console.log(`✅ FVI Inspection: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in getFVIInspection:', error);
            throw new Error(`Failed to get FVI Inspection data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteFVILotInput(lotno) {
        try {
            const result = await this.db.query(`DELETE FROM inf_lotinput WHERE lotno = $1`, [lotno]);
            const deletedCount = result.rowCount || 0;
            console.log(`✅ Deleted ${deletedCount} records from inf_lotinput for lotno: ${lotno}`);
            return { deletedCount };
        }
        catch (error) {
            console.error('❌ Error in deleteFVILotInput:', error);
            throw new Error(`Failed to delete inf_lotinput records: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOQAVisualInspection(params = { isCustomerReport: false }) {
        try {
            const { isCustomerReport, model, models, dateFrom, dateTo, productionSites, customerSites, productFamilies, productTypes, } = params;
            console.log('🔧 ReportModel.getOQAVisualInspection called with params:', params);
            const values = [];
            const conditions = [];
            const mainConditions = [];
            let paramIndex = 1;
            if (dateFrom) {
                mainConditions.push(`L.month_year >= $${paramIndex}`);
                values.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                mainConditions.push(`L.month_year <= $${paramIndex}`);
                values.push(dateTo);
                paramIndex++;
            }
            const modelsToFilter = models && models.length > 0 ? models : (model ? [model] : []);
            if (modelsToFilter.length > 0) {
                if (modelsToFilter.length === 1) {
                    conditions.push(`TB.model = $${paramIndex}`);
                    values.push(modelsToFilter[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = modelsToFilter.map((_, idx) => `$${paramIndex + idx}`).join(', ');
                    conditions.push(`TB.model IN (${placeholders})`);
                    modelsToFilter.forEach(m => values.push(m));
                    paramIndex += modelsToFilter.length;
                }
            }
            if (isCustomerReport) {
                mainConditions.push(`s.customers = $${paramIndex}`);
                values.push('SGT');
                paramIndex++;
            }
            if (productionSites && productionSites.length > 0) {
                mainConditions.push(`s.site = ANY($${paramIndex})`);
                values.push(productionSites);
                paramIndex++;
            }
            if (customerSites && customerSites.length > 0) {
                mainConditions.push(`s.code = ANY($${paramIndex})`);
                values.push(customerSites);
                paramIndex++;
            }
            if (productFamilies && productFamilies.length > 0) {
                mainConditions.push(`p.product_families = ANY($${paramIndex})`);
                values.push(productFamilies);
                paramIndex++;
            }
            if (productTypes && productTypes.length > 0) {
                mainConditions.push(`p.product_type = ANY($${paramIndex})`);
                values.push(productTypes);
                paramIndex++;
            }
            const viewName = isCustomerReport ? 'v_inspectiondata_customer' : 'inspectiondata';
            const mainWhereClause = mainConditions.length > 0 ? `AND ${mainConditions.join(' AND ')}` : '';
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `
        SELECT
          month_year,
          product_family,
          customer_site,
          site,
          model,
          total_pass_lot,
          total_lot,
          CASE WHEN total_lot > 0
            THEN (total_pass_lot::numeric / total_lot) * 100.0
            ELSE 0
          END AS lar,
          COALESCE(total_ng,0) total_ng,
          total_inspection,
          CASE WHEN total_inspection > 0
            THEN (COALESCE(total_ng, 0)::numeric / total_inspection) * 1000000.0
            ELSE 0
          END AS dppm
        FROM (
          SELECT
            L.month_year,
            p.product_families AS product_family,
            s.customers || ' (' || s.site || ')' AS customer_site,
            s.site AS site,
            L.model || ' ' || L.version AS model,
            COUNT(DISTINCT L.lotno) AS total_lot,
            COUNT(DISTINCT CASE WHEN L.judgment = true THEN L.lotno END)::numeric AS total_pass_lot,
            SUM(ng_qty) AS total_ng,
            SUM(general_sampling_qty) AS total_inspection
          FROM ${viewName} L
          INNER JOIN parts p ON p.partno = L.itemno
          INNER JOIN customers_site s ON s.code = p.customers_site
          LEFT JOIN  (
              select inspection_no , sum (ng_qty) ng_qty
              from defectdata
              group by inspection_no
             )  D ON L.inspection_no = D.inspection_no
          WHERE L.station = 'OQA' AND L.round = 1
          ${mainWhereClause}
          GROUP BY L.month_year, p.product_families, s.customers, s.site, L.model, L.version
        ) TB
        ${whereClause}
        ORDER BY product_family, model, month_year, site
      `;
            console.log(`✅ getOQAVisualInspection using view: ${viewName}, isCustomerReport: ${isCustomerReport}, dateRange: ${dateFrom} to ${dateTo}, models: ${modelsToFilter.length}`);
            const result = await this.db.query(query, values);
            console.log(`✅ ReportModel.getOQAVisualInspection: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in ReportModel.getOQAVisualInspection:', error);
            throw new Error(`Failed to get OQA Visual Inspection data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ReportModel = ReportModel;
function createLARReportModel(db) {
    return new ReportModel(db);
}
exports.default = ReportModel;
