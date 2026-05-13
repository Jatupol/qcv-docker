"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQADataService = void 0;
exports.createIQADataService = createIQADataService;
const generic_service_1 = require("../../generic/entities/special-entity/generic-service");
const types_1 = require("./types");
class IQADataService extends generic_service_1.GenericSpecialService {
    constructor(model) {
        super(model, types_1.DEFAULT_IQADATA_CONFIG);
        this.iqaDataModel = model;
    }
    async getAll(searchTerm) {
        try {
            console.log('🔧 IQADataService.getAll called', searchTerm ? `with search: "${searchTerm}"` : '');
            const data = await this.iqaDataModel.getAll(searchTerm);
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            console.error('❌ Error getting all IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to retrieve IQA data'
            };
        }
    }
    async getByKey(keyValues) {
        try {
            const { id } = keyValues;
            console.log('🔧 IQADataService.getByKey called:', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required'
                };
            }
            const data = await this.iqaDataModel.getByKey({ id });
            if (!data) {
                return {
                    success: false,
                    error: `IQA data with ID ${id} not found`
                };
            }
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            console.error('❌ Error getting IQA data by key:', error);
            return {
                success: false,
                error: error.message || 'Failed to retrieve IQA data'
            };
        }
    }
    async create(data, userId) {
        try {
            console.log('🔧 IQADataService.create called:', { userId });
            const result = await this.iqaDataModel.create(data, userId);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to create IQA data'
                };
            }
            return {
                success: true,
                data: result.data
            };
        }
        catch (error) {
            console.error('❌ Error creating IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to create IQA data'
            };
        }
    }
    async update(keyValues, data, userId) {
        try {
            const { id } = keyValues;
            console.log('🔧 IQADataService.update called:', { id, userId });
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for update'
                };
            }
            const result = await this.iqaDataModel.update({ id }, data, userId);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to update IQA data'
                };
            }
            return {
                success: true,
                data: result.data
            };
        }
        catch (error) {
            console.error('❌ Error updating IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to update IQA data'
            };
        }
    }
    async delete(keyValues, actor, req) {
        try {
            const { id } = keyValues;
            console.log('🔧 IQADataService.delete called:', { id });
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for delete'
                };
            }
            const result = await this.iqaDataModel.delete({ id }, actor ?? null, req);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to delete IQA data'
                };
            }
            return {
                success: true,
                data: true
            };
        }
        catch (error) {
            console.error('❌ Error deleting IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete IQA data'
            };
        }
    }
    async bulkImport(request, userId) {
        try {
            console.log('🔧 IQADataService.bulkImport called:', { recordCount: request.data.length });
            if (!request.data || !Array.isArray(request.data) || request.data.length === 0) {
                return {
                    success: false,
                    error: 'Import data is required and must be a non-empty array'
                };
            }
            const importedRecords = await this.iqaDataModel.bulkCreate(request.data);
            const response = {
                success: true,
                imported: importedRecords.length,
                failed: request.data.length - importedRecords.length,
                data: importedRecords
            };
            return {
                success: true,
                data: response
            };
        }
        catch (error) {
            console.error('❌ Error bulk importing IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to bulk import IQA data'
            };
        }
    }
    async upsert(request, userId) {
        try {
            console.log('🔧 IQADataService.upsert called:', { recordCount: request.data.length });
            if (!request.data || !Array.isArray(request.data) || request.data.length === 0) {
                return {
                    success: false,
                    error: 'Import data is required and must be a non-empty array'
                };
            }
            const result = await this.iqaDataModel.upsert(request.data);
            const transformedResult = {
                imported: result.inserted + result.updated,
                failed: result.failed,
                unchanged: result.unchanged,
                total: request.data.length,
                details: {
                    inserted: result.inserted,
                    updated: result.updated,
                    unchanged: result.unchanged,
                    duplicates: result.duplicates || []
                }
            };
            console.log('✅ Upsert completed:', transformedResult);
            return {
                success: true,
                data: transformedResult
            };
        }
        catch (error) {
            console.error('❌ Error upserting IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to upsert IQA data'
            };
        }
    }
    async deleteAll(userId, actor, req) {
        try {
            console.log('🔧 IQADataService.deleteAll called:', { userId });
            const deletedCount = await this.iqaDataModel.deleteAll(actor ?? null, req);
            return {
                success: true,
                data: deletedCount
            };
        }
        catch (error) {
            console.error('❌ Error deleting all IQA data:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete all IQA data'
            };
        }
    }
    async bulkDelete(ids, userId) {
        try {
            console.log('🔧 IQADataService.bulkDelete called:', { userId, idCount: ids.length });
            if (!ids || ids.length === 0) {
                return {
                    success: false,
                    error: 'No IDs provided for deletion'
                };
            }
            const result = await this.iqaDataModel.bulkDelete(ids);
            if (result.success) {
                console.log(`✅ Successfully deleted ${result.deletedCount} IQA record(s)`);
                return {
                    success: true,
                    data: { deletedCount: result.deletedCount }
                };
            }
            else {
                console.error('❌ Bulk delete failed:', result.error);
                return {
                    success: false,
                    error: result.error || 'Failed to bulk delete IQA data'
                };
            }
        }
        catch (error) {
            console.error('❌ Error in bulk delete:', error);
            return {
                success: false,
                error: error.message || 'Failed to bulk delete IQA data'
            };
        }
    }
    async getDistinctFY() {
        try {
            console.log('🔧 IQADataService.getDistinctFY called');
            const fyValues = await this.iqaDataModel.getDistinctFY();
            return {
                success: true,
                data: fyValues
            };
        }
        catch (error) {
            console.error('❌ Error getting distinct FY values:', error);
            return {
                success: false,
                error: error.message || 'Failed to get distinct FY values'
            };
        }
    }
    async getDistinctWW(fy) {
        try {
            console.log('🔧 IQADataService.getDistinctWW called', fy ? `with FY: ${fy}` : '');
            const wwValues = await this.iqaDataModel.getDistinctWW(fy || '');
            return {
                success: true,
                data: wwValues
            };
        }
        catch (error) {
            console.error('❌ Error getting distinct WW values:', error);
            return {
                success: false,
                error: error.message || 'Failed to get distinct WW values'
            };
        }
    }
}
exports.IQADataService = IQADataService;
function createIQADataService(iqaDataModel) {
    return new IQADataService(iqaDataModel);
}
exports.default = IQADataService;
