"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSCONFIG_CONSTANTS = exports.SYSCONFIG_ENTITY_CONFIG = void 0;
exports.isSysconfig = isSysconfig;
exports.isCreateSysconfigRequest = isCreateSysconfigRequest;
exports.isUpdateSysconfigRequest = isUpdateSysconfigRequest;
exports.parseConfigurationValues = parseConfigurationValues;
exports.createSysconfigWithParsed = createSysconfigWithParsed;
exports.SYSCONFIG_ENTITY_CONFIG = {
    entityName: 'Sysconfig',
    tableName: 'sysconfig',
    apiPath: '/api/sysconfig',
    searchableFields: [
        'system_name'
    ],
    defaultLimit: 20,
    maxLimit: 100
};
exports.SYSCONFIG_CONSTANTS = {
    DEFAULT_VALUES: {
        FVI_LOT_QTY: '2400,3000,3200,3300,3600',
        GENERAL_OQA_QTY: '0,78,91',
        CRACK_OQA_QTY: '0,80,100,120',
        GENERAL_SIV_QTY: '0,32,49',
        CRACK_SIV_QTY: '0,60,80',
        DEFECT_TYPE: 'Normal defect,Abnormal defect ≥1,Normal repeat problem & area ≥3',
        SHIFT: 'A,B',
        SITE: 'TNHK,JNHK',
        TABS: '1,2,3',
        PRODUCT_TYPE: 'SSA,DSA,CLA,TSA',
        PRODUCT_FAMILIES: 'Iris,Pine,Jupiter,Trident,Lithium',
        SMTP_PORT: 587
    },
    VALIDATION_LIMITS: {
        FIELD_MAX_LENGTH: 500,
        CONFIG_NAME_MAX_LENGTH: 100,
        CONFIG_DESCRIPTION_MAX_LENGTH: 500,
        SYSTEM_NAME_MAX_LENGTH: 100,
        SMTP_SERVER_MAX_LENGTH: 100,
        SMTP_USERNAME_MAX_LENGTH: 100,
        SMTP_PASSWORD_MAX_LENGTH: 100,
        MAX_FVI_LOT_QTY_VALUES: 10,
        MAX_GENERAL_OQA_QTY_VALUES: 10,
        MAX_CRACK_OQA_VALUES: 10,
        MAX_CRACK_OQA_QTY_VALUES: 10,
        MAX_GENERAL_SIV_QTY_VALUES: 10,
        MAX_CRACK_SIV_QTY_VALUES: 10,
        MAX_DEFECT_TYPE_VALUES: 5,
        MAX_SHIFT_VALUES: 5,
        MAX_SITE_VALUES: 10,
        MAX_TABS_VALUES: 10,
        MAX_PRODUCT_TYPE_VALUES: 10,
        MAX_PRODUCT_FAMILY_VALUES: 100,
        MIN_QTY_VALUE: 0,
        MAX_QTY_VALUE: 999999,
        MIN_TAB_VALUE: 1,
        MAX_TAB_VALUE: 99,
        MIN_SMTP_PORT: 1,
        MAX_SMTP_PORT: 65535,
        MIN_SYNC_INTERVAL: 1,
        MAX_SYNC_INTERVAL: 1440,
        MIN_CACHE_TIMEOUT: 1,
        MAX_CACHE_TIMEOUT: 1440,
        MIN_RECORDS_PER_PAGE: 10,
        MAX_RECORDS_PER_PAGE: 1000
    }
};
function isSysconfig(obj) {
    return obj &&
        typeof obj.id === 'number' &&
        typeof obj.fvi_lot_qty === 'string' &&
        typeof obj.general_oqa_qty === 'string' &&
        typeof obj.crack_oqa_qty === 'string' &&
        typeof obj.general_siv_qty === 'string' &&
        typeof obj.crack_siv_qty === 'string' &&
        typeof obj.defect_type === 'string' &&
        typeof obj.defect_group === 'string' &&
        typeof obj.shift === 'string' &&
        typeof obj.site === 'string' &&
        typeof obj.tabs === 'string' &&
        typeof obj.product_type === 'string' &&
        typeof obj.product_families === 'string' &&
        typeof obj.smtp_port === 'number' &&
        obj.created_at instanceof Date &&
        obj.updated_at instanceof Date &&
        typeof obj.created_by === 'number' &&
        typeof obj.updated_by === 'number';
}
function isCreateSysconfigRequest(obj) {
    return obj &&
        typeof obj.fvi_lot_qty === 'string' &&
        typeof obj.general_oqa_qty === 'string' &&
        typeof obj.crack_oqa_qty === 'string' &&
        typeof obj.general_siv_qty === 'string' &&
        typeof obj.crack_siv_qty === 'string' &&
        typeof obj.defect_type === 'string' &&
        typeof obj.defect_group === 'string' &&
        typeof obj.defect_color === 'string' &&
        typeof obj.shift === 'string' &&
        typeof obj.site === 'string' &&
        typeof obj.tabs === 'string' &&
        typeof obj.product_type === 'string' &&
        typeof obj.product_families === 'string';
}
function isUpdateSysconfigRequest(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    const validFields = [
        'fvi_lot_qty', 'general_oqa_qty', 'crack_oqa_qty', 'general_siv_qty',
        'crack_siv_qty', 'defect_type', 'defect_group', 'defect_color', 'shift', 'site', 'tabs',
        'product_type', 'product_families', 'smtp_server', 'smtp_port',
        'smtp_username', 'smtp_password', 'defect_notification_emails',
        'mssql_server', 'mssql_port', 'mssql_database', 'mssql_username', 'mssql_password', 'mssql_sync', 'mssql_enabled',
        'system_name', 'system_version', 'system_updated', 'news', 'is_active'
    ];
    const objKeys = Object.keys(obj);
    const validKeys = objKeys.filter(key => validFields.includes(key));
    const invalidKeys = objKeys.filter(key => !validFields.includes(key));
    if (invalidKeys.length > 0) {
        console.log('⚠️ Unknown keys in update request (will be ignored):', invalidKeys);
    }
    return validKeys.length > 0;
}
function parseConfigurationValues(sysconfig) {
    return {
        fvi_lot_qty: sysconfig.fvi_lot_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
        general_oqa_qty: sysconfig.general_oqa_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
        crack_oqa_qty: sysconfig.crack_oqa_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
        general_siv_qty: sysconfig.general_siv_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
        crack_siv_qty: sysconfig.crack_siv_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
        defect_type: sysconfig.defect_type.split(',').map(v => v.trim()).filter(v => v.length > 0),
        defect_group: sysconfig.defect_group.split(',').map(v => v.trim()).filter(v => v.length > 0),
        shift: sysconfig.shift.split(',').map(v => v.trim()).filter(v => v.length > 0),
        site: sysconfig.site.split(',').map(v => v.trim()).filter(v => v.length > 0),
        tabs: sysconfig.tabs.split(',').map(v => v.trim()).filter(v => v.length > 0),
        product_type: sysconfig.product_type.split(',').map(v => v.trim()).filter(v => v.length > 0),
        product_families: sysconfig.product_families.split(',').map(v => v.trim()).filter(v => v.length > 0)
    };
}
function createSysconfigWithParsed(sysconfig) {
    return {
        ...sysconfig,
        parsed: parseConfigurationValues(sysconfig)
    };
}
