"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
exports.createUserController = createUserController;
const generic_controller_1 = require("../../generic/entities/serial-id-entity/generic-controller");
const types_1 = require("./types");
class UserController extends generic_controller_1.GenericSerialIdController {
    constructor(userService) {
        super(userService, types_1.DEFAULT_USER_CONFIG);
        this.create = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const result = await this.userService.createUser(req.body, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message,
                        errors: result.errors
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const result = await this.userService.getAllUsers(req.query, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data.data,
                        pagination: result.data.pagination,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id) || id <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                const result = await this.userService.getUserProfile(id);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.user?.id || 0;
                console.log('📡 Update request received:', {
                    id,
                    userId,
                    user: req.user,
                    body: req.body
                });
                if (isNaN(id) || id <= 0) {
                    console.error('❌ Invalid user ID in params:', req.params.id);
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                console.log('🔄 Calling userService.updateUser...');
                const result = await this.userService.updateUser(id, req.body, userId);
                console.log('📨 Service result:', result);
                if (result.success && result.data) {
                    console.log('✅ Update successful, sending 200 response');
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    console.error('❌ Update failed, sending 400 response:', result.message, result.errors);
                    res.status(400).json({
                        success: false,
                        message: result.message,
                        errors: result.errors
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.authenticate = async (req, res, next) => {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    res.status(400).json({
                        success: false,
                        message: 'Username and password are required'
                    });
                    return;
                }
                const result = await this.userService.authenticate(username, password);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(401).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.changePassword = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.user?.id || 0;
                if (isNaN(id) || id <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                if (id !== userId && req.user?.role !== types_1.UserRole.ADMIN) {
                    res.status(403).json({
                        success: false,
                        message: 'Forbidden: You can only change your own password'
                    });
                    return;
                }
                const result = await this.userService.changePassword(id, req.body, userId);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message,
                        errors: result.errors
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getCurrentProfile = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                    return;
                }
                const result = await this.userService.getUserProfile(userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCurrentProfile = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                    return;
                }
                const updateData = { ...req.body };
                if (req.user?.role !== types_1.UserRole.ADMIN) {
                    delete updateData.role;
                    delete updateData.is_active;
                }
                const result = await this.userService.updateUser(userId, updateData, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message,
                        errors: result.errors
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getUsersByRole = async (req, res, next) => {
            try {
                if (req.user?.role !== types_1.UserRole.ADMIN && req.user?.role !== types_1.UserRole.MANAGER) {
                    res.status(403).json({
                        success: false,
                        message: 'Forbidden: Manager or Admin access required'
                    });
                    return;
                }
                const role = req.params.role;
                if (!Object.values(types_1.UserRole).includes(role)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid role specified'
                    });
                    return;
                }
                const result = await this.userService.getUsersByRole(role);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserStatistics = async (req, res, next) => {
            try {
                const result = await this.userService.getUserStatistics();
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getSessionData = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id) || id <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                if (id !== req.user?.id && req.user?.role !== types_1.UserRole.ADMIN) {
                    res.status(403).json({
                        success: false,
                        message: 'Forbidden: You can only access your own session data'
                    });
                    return;
                }
                const result = await this.userService.getSessionData(id);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.validateUsername = async (req, res, next) => {
            try {
                const { username, excludeId } = req.body;
                if (!username) {
                    res.status(400).json({
                        success: false,
                        message: 'Username is required'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { available: true },
                    message: 'Username validation completed'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.validateEmail = async (req, res, next) => {
            try {
                const { email, excludeId } = req.body;
                if (!email) {
                    res.status(400).json({
                        success: false,
                        message: 'Email is required'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { available: true },
                    message: 'Email validation completed'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.checkin = async (req, res, next) => {
            try {
                const { username } = req.body;
                if (!username) {
                    res.status(400).json({
                        success: false,
                        message: 'Username is required'
                    });
                    return;
                }
                const result = await this.userService.checkin(username);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: result.message
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.userService = userService;
    }
}
exports.UserController = UserController;
function createUserController(service) {
    return new UserController(service);
}
