"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataController = void 0;
exports.createDefectDataController = createDefectDataController;
const generic_controller_1 = require("../../generic/entities/special-entity/generic-controller");
const generic_types_1 = require("../../generic/entities/special-entity/generic-types");
const types_1 = require("./types");
const emailService_1 = require("../../utils/emailService");
const sharp_1 = __importDefault(require("sharp"));
class DefectDataController extends generic_controller_1.GenericSpecialController {
    constructor(defectDataService, db) {
        super(defectDataService, types_1.DEFAULT_DEFECTDATA_CONFIG);
        this.emailService = null;
        this.db = null;
        this.getByInspectionNo = async (req, res, next) => {
            try {
                const { inspectionNo } = req.params;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.getByInspectionNo(inspectionNo, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for inspection ${inspectionNo}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDetailByInspectionNo = async (req, res, next) => {
            try {
                const { inspectionNo } = req.params;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.getDetailByInspectionNo(inspectionNo);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for inspection ${inspectionNo}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getByStationAndDateRange = async (req, res, next) => {
            try {
                const { station } = req.params;
                const { startDate, endDate, limit } = req.query;
                const userId = this.extractUserId(req);
                if (!startDate || !endDate) {
                    const response = {
                        success: false,
                        message: 'Start date and end date are required'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const start = new Date(startDate);
                const end = new Date(endDate);
                const limitNum = limit ? parseInt(limit, 10) : 100;
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    const response = {
                        success: false,
                        message: 'Invalid date format'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.getByStationAndDateRange(station, start, end, limitNum, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for station ${station}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getByInspector = async (req, res, next) => {
            try {
                const { inspector } = req.params;
                const { limit } = req.query;
                const userId = this.extractUserId(req);
                const limitNum = limit ? parseInt(limit, 10) : 100;
                const result = await this.defectDataService.getByInspector(inspector, limitNum, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for inspector ${inspector}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getProfile = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = this.extractUserId(req);
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    const response = {
                        success: false,
                        message: 'Invalid defect data ID'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.getProfile(idNum, userId);
                if (!result.success) {
                    const status = result.error?.includes('not found') ? generic_types_1.HTTP_STATUS.NOT_FOUND : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(status).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data profile retrieved successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSummary = async (req, res, next) => {
            try {
                const { startDate, endDate } = req.query;
                const userId = this.extractUserId(req);
                let start;
                let end;
                if (startDate) {
                    start = new Date(startDate);
                    if (isNaN(start.getTime())) {
                        const response = {
                            success: false,
                            message: 'Invalid start date format'
                        };
                        res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                        return;
                    }
                }
                if (endDate) {
                    end = new Date(endDate);
                    if (isNaN(end.getTime())) {
                        const response = {
                            success: false,
                            message: 'Invalid end date format'
                        };
                        res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                        return;
                    }
                }
                const result = await this.defectDataService.getSummary(start, end, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data summary retrieved successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTrends = async (req, res, next) => {
            try {
                const { days } = req.query;
                const userId = this.extractUserId(req);
                const daysNum = days ? parseInt(days, 10) : 7;
                if (isNaN(daysNum) || daysNum <= 0) {
                    const response = {
                        success: false,
                        message: 'Invalid days parameter'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.getTrends(daysNum, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Defect data trends for ${daysNum} days retrieved successfully`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getInspectorPerformance = async (req, res, next) => {
            try {
                const { inspector } = req.params;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.getInspectorPerformance(inspector, userId);
                if (!result.success) {
                    const status = result.error?.includes('No performance data found') ? generic_types_1.HTTP_STATUS.NOT_FOUND : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(status).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Performance data for inspector ${inspector} retrieved successfully`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.createDefectData = async (req, res, next) => {
            try {
                const data = req.body;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.createDefectData(data, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                if (result.data && result.data.id) {
                    const shouldSendEmail = this.shouldSendDefectEmail(data.inspection_no, data.defect_type);
                    if (shouldSendEmail) {
                        console.log(`📧 Email conditions met for inspection ${data.inspection_no} with defect_type: ${data.defect_type}`);
                        const defectId = result.data.id;
                        setTimeout(() => {
                            console.log(`📧 Sending delayed email for defect ID: ${defectId} (after 3s delay for image upload)`);
                            this.sendDefectEmail(defectId).catch(error => {
                                console.error('❌ Error sending defect email:', error);
                            });
                        }, 3000);
                    }
                    else {
                        console.log(`⏭️ Skipping email for inspection ${data.inspection_no} with defect_type: ${data.defect_type || 'N/A'} - conditions not met`);
                    }
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data created successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.CREATED).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateDefectData = async (req, res, next) => {
            try {
                const { id } = req.params;
                const data = req.body;
                const userId = this.extractUserId(req);
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    const response = {
                        success: false,
                        message: 'Invalid defect data ID'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.updateDefectData(idNum, data, userId);
                if (!result.success) {
                    const status = result.error?.includes('not found') ? generic_types_1.HTTP_STATUS.NOT_FOUND : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(status).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data updated successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.searchDefectData = async (req, res, next) => {
            try {
                const searchOptions = req.body;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.searchDefectData(searchOptions, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data?.data,
                    pagination: result.data?.pagination,
                    message: `Found ${result.data?.pagination.totalCount || 0} defect data records`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTodayDefectData = async (req, res, next) => {
            try {
                const { station } = req.query;
                const userId = this.extractUserId(req);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const searchOptions = {
                    defect_date_from: today,
                    defect_date_to: tomorrow,
                    station: station || undefined,
                    page: 1,
                    limit: 100,
                    sortBy: 'defect_date',
                    sortOrder: 'DESC'
                };
                const result = await this.defectDataService.searchDefectData(searchOptions, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data?.data,
                    pagination: result.data?.pagination,
                    message: `Found ${result.data?.pagination.totalCount || 0} defect records for today`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.resendDefectEmail = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = this.extractUserId(req);
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    const response = {
                        success: false,
                        message: 'Invalid defect data ID'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                console.log(`📧 Resending email for defect ID: ${idNum}`);
                const result = await this.sendDefectEmail(idNum);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.message
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    message: 'Email sent successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteDefectData = async (req, res, next) => {
            try {
                const { id } = req.params;
                console.log(`🗑️ Deleting defect data: ${id} `);
                const result = await this.defectDataService.delete(id, req.user ?? null, req);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Defect data deleted successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: 'Failed to delete defect data',
                        error: 'DELETE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error deleting defect data:', error);
                next(error);
            }
        };
        this.bulkCreateDefectData = async (req, res, next) => {
            try {
                const { records } = req.body;
                const userId = this.extractUserId(req);
                if (!Array.isArray(records) || records.length === 0) {
                    const response = {
                        success: false,
                        message: 'Records array is required and cannot be empty'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                if (records.length > 100) {
                    const response = {
                        success: false,
                        message: 'Cannot create more than 100 records at once'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const results = [];
                const errors = [];
                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    const result = await this.defectDataService.createDefectData(record, userId);
                    if (result.success && result.data) {
                        results.push(result.data);
                    }
                    else {
                        errors.push(`Record ${i + 1}: ${result.error}`);
                    }
                }
                const response = {
                    success: errors.length === 0,
                    data: results,
                    message: `Successfully created ${results.length} records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
                    errors: errors.length > 0 ? { bulk: errors } : undefined
                };
                const status = errors.length === 0 ? generic_types_1.HTTP_STATUS.CREATED : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                res.status(status).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.defectDataService = defectDataService;
        if (db) {
            this.db = db;
            this.emailService = new emailService_1.EmailService(db);
        }
    }
    shouldSendDefectEmail(inspection_no, defect_type) {
        if (!inspection_no || !defect_type) {
            return false;
        }
        const inspectionPrefix = inspection_no.substring(0, 3).toUpperCase();
        const oqaDefectTypes = [
            'Abnormal defect ≥1',
            'Normal repeat problem & area ≥3'
        ];
        const obaDefectTypes = [
            'Normal defect',
            'Abnormal defect ≥1',
            'Normal repeat problem & area ≥3'
        ];
        if (inspectionPrefix === 'OQA' || inspectionPrefix === 'SIV') {
            return oqaDefectTypes.includes(defect_type);
        }
        else if (inspectionPrefix === 'OBA') {
            return obaDefectTypes.includes(defect_type);
        }
        return false;
    }
    async sendDefectEmail(defectId) {
        if (!this.emailService || !this.db) {
            return { success: false, message: 'Email service not configured' };
        }
        try {
            const emailDataResult = await this.defectDataService.getEmailDetailById(defectId);
            if (!emailDataResult.success || !emailDataResult.data || emailDataResult.data.length === 0) {
                console.warn('⚠️ No email detail data found for:', defectId);
                return { success: false, message: 'Email detail data not found' };
            }
            const defectData = emailDataResult.data[0];
            const station = defectData.station || '';
            const inspectionNo = defectData.inspection_no || '';
            const model = defectData.model || '';
            const version = defectData.version || '';
            const shift = defectData.shift || '';
            const itemno = defectData.itemno || '';
            const fvilineno = defectData.fvilineno || '';
            const lotno = defectData.lotno || '';
            const tab = defectData.tab || '';
            const defectName = defectData.defect_name || '';
            const defectType = defectData.defect_type || '';
            const ngQty = defectData.ng_qty;
            const inspector = defectData.inspector_fullname || '';
            const qc_name = defectData.qc_fullname || '';
            const qclead_name = defectData.qclead_fullname || '';
            const mbr_name = defectData.mbr_fullname || '';
            const trayno = defectData.trayno || '';
            const tray_position = defectData.tray_position || '';
            const fy = defectData.fy || '';
            const ww = defectData.ww || '';
            const month_year = defectData.month_year || '';
            const qc_id = defectData.qc_name || '';
            const sampling_reason_name = defectData.sampling_reason_name || '';
            const fvi_lot_qty = defectData.fvi_lot_qty || '';
            const fvi_inspected_qty = defectData.fvi_inspected_qty || '';
            const general_sampling_qty = defectData.general_sampling_qty || '';
            const crack_sampling_qty = defectData.crack_sampling_qty || '';
            const judgment = defectData.judgment === true ? 'Pass' : defectData.judgment === false ? 'Reject' : defectData.judgment || 'N/A';
            const partsite = defectData.partsite || '';
            const mclineno = defectData.mclineno || '';
            const round = defectData.round || '';
            const defectDate = new Date(defectData.defect_date);
            const formattedDate = defectDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
            const subject = `🚨 ${station} ${defectType} ${defectName} ${model} ${version}_${formattedDate}_Shift ${shift}`;
            const imageDataResult = await this.db.query('SELECT id, imge_data, trayno, tray_row, tray_position, photo_magnification FROM defect_image WHERE defect_id = $1 ORDER BY id', [defectId]);
            const MAX_IMAGE_WIDTH = 800;
            const JPEG_QUALITY = 70;
            const MAX_IMAGES = 5;
            const MAX_EMAIL_SIZE = 2 * 1024 * 1024;
            const imageAttachments = [];
            const imagesToProcess = imageDataResult.rows.slice(0, MAX_IMAGES);
            let totalAttachmentSize = 0;
            let skippedDueToSize = 0;
            for (let index = 0; index < imagesToProcess.length; index++) {
                const row = imagesToProcess[index];
                try {
                    const compressedImage = await (0, sharp_1.default)(row.imge_data)
                        .resize(MAX_IMAGE_WIDTH, undefined, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                        .jpeg({ quality: JPEG_QUALITY })
                        .toBuffer();
                    if (totalAttachmentSize + compressedImage.length > MAX_EMAIL_SIZE) {
                        skippedDueToSize++;
                        console.log(`⚠️ Image ${index + 1} skipped: would exceed 2MB email size limit`);
                        continue;
                    }
                    imageAttachments.push({
                        filename: `defect_${defectId}_image_${index + 1}.jpg`,
                        content: compressedImage,
                        contentType: 'image/jpeg',
                        cid: `defect_image_${row.id}@qcv`,
                        trayno: row.trayno || '',
                        tray_row: row.tray_row || '',
                        tray_position: row.tray_position || '',
                        photo_magnification: row.photo_magnification || ''
                    });
                    totalAttachmentSize += compressedImage.length;
                    const originalSize = (row.imge_data.length / 1024).toFixed(1);
                    const compressedSize = (compressedImage.length / 1024).toFixed(1);
                    console.log(`📸 Image ${index + 1}: ${originalSize}KB → ${compressedSize}KB (compressed)`);
                }
                catch (imgError) {
                    console.error(`⚠️ Failed to compress image ${index + 1}, skipping:`, imgError);
                }
            }
            if (imageDataResult.rows.length > MAX_IMAGES) {
                console.log(`⚠️ Only processed ${MAX_IMAGES} of ${imageDataResult.rows.length} images (max limit)`);
            }
            if (skippedDueToSize > 0) {
                console.log(`⚠️ Skipped ${skippedDueToSize} images due to 2MB email size limit`);
            }
            const totalSizeMB = (totalAttachmentSize / (1024 * 1024)).toFixed(2);
            console.log(`📸 Image attachments for defect ${defectId}: ${imageAttachments.length} images, total size: ${totalSizeMB}MB`);
            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
          <!-- Main Container Table -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
            <tr>
              <td align="center" style="padding: 20px 10px;">
                <!-- Content Container (max 900px) -->
                <table width="900" border="0" cellspacing="0" cellpadding="0" style="max-width: 900px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">

                  <!-- Header Section with Red Background -->
                  <tr>
                    <td style="background-color: ${judgment === 'Pass' ? '#10b981' : judgment === 'Reject' ? '#ef4444' : '#6b7280'}; color: #ffffff; padding: 20px; text-align: left;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚨 Inspection Details - Defect Notification</h1>
                      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${station} Station - ID: ${defectId} - ${formattedDate}</p>
                    </td>
                  </tr>

                  <!-- Main Content Section -->
                  <tr>
                    <td style="padding: 20px;">

                      <!-- Greeting -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size: 14px; font-weight: 600; padding-bottom: 12px;">
                            Dear FVI team and all,
                          </td>
                        </tr>
                      </table>

                      <!-- Introduction Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                        <tr>
                          <td style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; font-size: 13px; line-height: 1.6;">
                            I would like to share <strong>${station} ${defectName}</strong> on <strong>${model} ${version}</strong>
                            found <strong style="color: #1e40af;">${ngQty} piece${ngQty > 1 ? 's' : ''}</strong>, please see more details as below.
                          </td>
                        </tr>
                      </table>

                      <!-- Section 1: Inspection Identification (Blue) -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 12px;">
                        <tr>
                          <td style="padding: 12px;">
                            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #1e3a8a;">🔍 Inspection Identification</h4>

                            <!-- 4-column table grid -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="6">
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Station:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${station}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Sampling No:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${inspectionNo}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Inspection Ref:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">N/A</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Date:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${formattedDate}</div>
                                </td>
                              </tr>
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">FY/WW:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${fy || 'N/A'}/${ww || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Month/Year:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${month_year || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Shift:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${shift}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">QC Inspector:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">QC${qc_id || 'N/A'}</div>
                                </td>
                              </tr>
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Sampling Reason:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${sampling_reason_name || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">FVI Lot Qty:</div>
                                  <div style="font-size: 12px; color: #1e40af; font-weight: 600;">${fvi_lot_qty ? fvi_lot_qty.toLocaleString() : 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">General Sampling:</div>
                                  <div style="font-size: 12px; color: #1e40af; font-weight: 600;">${general_sampling_qty ? general_sampling_qty.toLocaleString() : 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Crack Sampling:</div>
                                  <div style="font-size: 12px; color: #1e40af; font-weight: 600;">${crack_sampling_qty ? crack_sampling_qty.toLocaleString() : 'N/A'}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Section 2: Product Information (Purple) -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; margin-bottom: 12px;">
                        <tr>
                          <td style="padding: 12px;">
                            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #581c87;">📦 Product Information</h4>

                            <!-- 4-column table grid -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="6">
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Lot No:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${lotno}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Item No:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${itemno}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Model:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${model}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Version:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${version}</div>
                                </td>
                              </tr>
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Part Site:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${partsite || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Round:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${round || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">FVI Line No:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${fvilineno}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">MC Line No:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${mclineno || 'N/A'}</div>
                                </td>
                              </tr>
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Product tab:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${tab || ''}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;"></td>
                                <td width="25%" valign="top" style="padding: 4px;"></td>
                                <td width="25%" valign="top" style="padding: 4px;"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Section 3: Judgment & Defect Information (Indigo) -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; margin-bottom: 12px;">
                        <tr>
                          <td style="padding: 12px;">
                            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #3730a3;">⚖️ Judgment & Defect Information</h4>

                            <!-- Judgment Badge -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                              <tr>
                                <td>
                                  <span style="font-size: 12px; font-weight: 600; color: #4b5563;">Final Judgment:</span>
                                  <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px; background-color: ${judgment === 'Pass' ? '#d1fae5' : '#fee2e2'}; color: ${judgment === 'Pass' ? '#065f46' : '#991b1b'}; border: 1px solid ${judgment === 'Pass' ? '#6ee7b7' : '#fca5a5'};">
                                    ${judgment === 'Pass' ? '✓' : '✗'} ${judgment || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            </table>

                            <!-- Defect Details Grid -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="6">
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Defect Type:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${defectType || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Defect Name:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${defectName}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Reject Q'ty:</div>
                                  <div style="font-size: 12px; color: #dc2626; font-weight: 600;">${ngQty} piece${ngQty > 1 ? 's' : ''}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">Inspector:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${inspector || 'N/A'}</div>
                                </td>
                              </tr>
                              <tr>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">QC Name:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${qc_name || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">QC Leader:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${qclead_name || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;">
                                  <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">FVI Leader Confirm Name:</div>
                                  <div style="font-size: 12px; color: #1f2937; font-weight: 600;">${mbr_name || 'N/A'}</div>
                                </td>
                                <td width="25%" valign="top" style="padding: 4px;"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Section 4: Defect Sample Images -->
                      ${imageAttachments.length > 0 ? `
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                        <tr>
                          <td>
                            <h4 style="color: #dc2626; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">📸 Reject Sample Images (${imageAttachments.length})</h4>
                            <table width="100%" border="0" cellspacing="12" cellpadding="0">
                              ${(() => {
                const rows = [];
                for (let i = 0; i < imageAttachments.length; i += 3) {
                    const rowImages = imageAttachments.slice(i, i + 3);
                    const cells = rowImages.map(img => {
                        return `
                                    <td width="33%" align="center" valign="top">
                                      <img src="cid:${img.cid}" alt="Defect Sample" style="max-width: 100%; width: 280px; border: 2px solid #d1d5db; border-radius: 8px 8px 0 0; display: block;" />
                                      <table width="280" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-top: none; border-radius: 0 0 8px 8px; margin: 0 auto;">
                                        <tr>
                                          <td style="font-size: 10px; padding: 4px 6px; text-align: center;"><span style="color: #6b7280;">Tray:</span> <span style="color: #1f2937; font-weight: 600;">${img.trayno || '-'}</span></td>
                                          <td style="font-size: 10px; padding: 4px 6px; text-align: center;"><span style="color: #6b7280;">Row:</span> <span style="color: #1f2937; font-weight: 600;">${img.tray_row || '-'}</span></td>
                                          <td style="font-size: 10px; padding: 4px 6px; text-align: center;"><span style="color: #6b7280;">Pos:</span> <span style="color: #1f2937; font-weight: 600;">${img.tray_position || '-'}</span></td>
                                          <td style="font-size: 10px; padding: 4px 6px; text-align: center;"><span style="color: #6b7280;">Mag:</span> <span style="color: #1f2937; font-weight: 600;">${img.photo_magnification || '-'}</span></td>
                                        </tr>
                                      </table>
                                    </td>
                                  `;
                    }).join('');
                    const emptyCells = rowImages.length < 3 ? '<td width="33%"></td>'.repeat(3 - rowImages.length) : '';
                    rows.push(`<tr>${cells}${emptyCells}</tr>`);
                }
                return rows.join('');
            })()}
                            </table>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <!-- Action Required Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; margin-bottom: 16px;">
                        <tr>
                          <td style="padding: 12px;">
                            <p style="margin: 5px 0; font-weight: bold; color: #92400e;">⚠️ Action Required:</p>
                            <p style="margin: 5px 0;">• Please alert the visual operator to pay attention to this defect.</p>
                            <p style="margin: 5px 0;">• Please FVI do the rescreening as the recall protocol then share the result.</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Footer -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 2px solid #e5e7eb; margin-top: 24px; padding-top: 16px;">
                        <tr>
                          <td align="center" style="font-size: 11px; color: #6b7280;">
                            <p style="margin: 5px 0;"><strong>This is an automated notification from the Quality Control & Verification System.</strong></p>
                            <p style="margin: 5px 0;">Generated at ${new Date().toLocaleString()}</p>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
            const textContent = `
🚨 DEFECT NOTIFICATION
${station} Station - ${defectName} - ${formattedDate}

Dear FVI team and all,

I would like to share ${station} ${defectName} on ${model} ${version} found ${ngQty} piece${ngQty > 1 ? 's' : ''}, please see more details as below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DEFECT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Defect Type: ${defectName}
Reject Q'ty: ${ngQty} piece${ngQty > 1 ? 's' : ''}
Inspector: ${inspector || 'N/A'}
QC Name: ${qc_name || 'N/A'}
QC Leader: ${qclead_name || 'N/A'}
FVI Leader Confirm Name: ${mbr_name || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INSPECTION IDENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: ${station}
Sampling No: ${inspectionNo}
Date: ${formattedDate}
Shift: ${shift}
FY/WW: ${fy || 'N/A'}/${ww || 'N/A'}
Month/Year: ${month_year || 'N/A'}
QC Inspector: QC${qc_id || 'N/A'}
Sampling Reason: ${sampling_reason_name || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PRODUCT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lot No: ${lotno}
Item No: ${itemno}
Model: ${model} ${version}
Part Site: ${partsite || 'N/A'}
FVI Line No: ${fvilineno}
MC Line No: ${mclineno || 'N/A'}
Round: ${round || 'N/A'}
Product tab: ${tab || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SAMPLING QUANTITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FVI Lot Qty: ${fvi_lot_qty ? defectData.fvi_lot_qty.toLocaleString() : 'N/A'}
General Sampling: ${general_sampling_qty ? general_sampling_qty.toLocaleString() : 'N/A'}
Crack Sampling: ${crack_sampling_qty ? crack_sampling_qty.toLocaleString() : 'N/A'}
Judgment: ${judgment || 'N/A'}

⚠️ ACTION REQUIRED:
• Please alert the visual operator to pay attention to this defect.
• Please FVI do the rescreening as the recall protocol then share the result.

${imageAttachments.length > 0 ? `📸 Reject Sample Images: ${imageAttachments.length} image(s) attached` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from the Quality Control & Verification System.
Generated at ${new Date().toLocaleString()}
      `.trim();
            const sysconfigResult = await this.db.query('SELECT defect_notification_emails FROM sysconfig ORDER BY created_at DESC LIMIT 1');
            let recipientEmails = 'jatupol.sa@gmail.com';
            if (sysconfigResult.rows.length > 0 && sysconfigResult.rows[0].defect_notification_emails) {
                const configuredEmails = sysconfigResult.rows[0].defect_notification_emails.trim();
                if (configuredEmails) {
                    recipientEmails = configuredEmails;
                    console.log(`📧 Sending defect notification to configured recipients: ${recipientEmails}`);
                }
                else {
                    console.log(`📧 No configured emails found, using default: ${recipientEmails}`);
                }
            }
            else {
                console.log(`📧 No sysconfig found, using default recipient: ${recipientEmails}`);
            }
            console.log(`📧 Attempting to send email with ${imageAttachments.length} attachments to: ${recipientEmails}`);
            const emailResult = await this.emailService.sendEmail({
                to: recipientEmails,
                subject: subject,
                text: textContent,
                html: htmlContent,
                attachments: imageAttachments
            });
            console.log(`📧 Email send result - Success: ${emailResult.success}, MessageId: ${emailResult.messageId || 'N/A'}, Error: ${emailResult.error || 'N/A'}`);
            if (!emailResult.success) {
                console.error(`❌ Failed to send defect email: ${emailResult.error}`);
                return { success: false, message: emailResult.error || 'Failed to send email' };
            }
            console.log(`✅ Defect email sent successfully to: ${recipientEmails}`);
            return { success: true, message: 'Email sent successfully' };
        }
        catch (error) {
            console.error('❌ Error sending defect email:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    extractUserId(req) {
        const user = req.user || req.session?.user;
        return user?.id || 0;
    }
    formatValidationErrors(errors) {
        return {
            validation: errors
        };
    }
    buildQueryOptions(query) {
        const options = {};
        if (query.page)
            options.page = parseInt(query.page, 10);
        if (query.limit)
            options.limit = parseInt(query.limit, 10);
        if (query.sortBy)
            options.sortBy = query.sortBy;
        if (query.sortOrder)
            options.sortOrder = query.sortOrder;
        if (query.search)
            options.search = query.search;
        if (query.inspection_no)
            options.inspection_no = query.inspection_no;
        if (query.station)
            options.station = query.station;
        if (query.linevi)
            options.linevi = query.linevi;
        if (query.inspector)
            options.inspector = query.inspector;
        if (query.defect_id)
            options.defect_id = parseInt(query.defect_id, 10);
        if (query.defect_date_from)
            options.defect_date_from = new Date(query.defect_date_from);
        if (query.defect_date_to)
            options.defect_date_to = new Date(query.defect_date_to);
        if (query.ng_qty_min)
            options.ng_qty_min = parseInt(query.ng_qty_min, 10);
        if (query.ng_qty_max)
            options.ng_qty_max = parseInt(query.ng_qty_max, 10);
        if (query.today === 'true')
            options.today = true;
        if (query.yesterday === 'true')
            options.yesterday = true;
        if (query.this_week === 'true')
            options.this_week = true;
        if (query.this_month === 'true')
            options.this_month = true;
        return options;
    }
}
exports.DefectDataController = DefectDataController;
function createDefectDataController(defectDataService, db) {
    return new DefectDataController(defectDataService, db);
}
exports.default = DefectDataController;
