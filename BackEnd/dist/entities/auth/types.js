"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_VALIDATION = exports.LOGIN_VALIDATION = exports.UserRole = void 0;
exports.validateLoginRequest = validateLoginRequest;
exports.validatePasswordChangeRequest = validatePasswordChangeRequest;
exports.createSessionUser = createSessionUser;
const types_1 = require("../user/types");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return types_1.UserRole; } });
exports.LOGIN_VALIDATION = {
    username: {
        required: true,
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_.-]+$/
    },
    password: {
        required: true,
        minLength: 6,
        maxLength: 128
    }
};
exports.PASSWORD_VALIDATION = {
    currentPassword: {
        minLength: 6,
        maxLength: 128
    },
    newPassword: {
        required: true,
        minLength: 6,
        maxLength: 128
    }
};
function validateLoginRequest(data) {
    return (data &&
        typeof data.username === 'string' &&
        data.username.trim().length >= exports.LOGIN_VALIDATION.username.minLength &&
        data.username.trim().length <= exports.LOGIN_VALIDATION.username.maxLength &&
        typeof data.password === 'string' &&
        data.password.length >= exports.LOGIN_VALIDATION.password.minLength &&
        data.password.length <= exports.LOGIN_VALIDATION.password.maxLength);
}
function validatePasswordChangeRequest(data) {
    return (data &&
        typeof data.newPassword === 'string' &&
        data.newPassword.length >= exports.PASSWORD_VALIDATION.newPassword.minLength &&
        data.newPassword.length <= exports.PASSWORD_VALIDATION.newPassword.maxLength &&
        (!data.currentPassword || (typeof data.currentPassword === 'string' &&
            data.currentPassword.length >= exports.PASSWORD_VALIDATION.currentPassword.minLength &&
            data.currentPassword.length <= exports.PASSWORD_VALIDATION.currentPassword.maxLength)));
}
function createSessionUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        position: user.position || '',
        is_active: user.is_active,
        work_shift: user.work_shift,
        team: user.team,
        linevi: user.linevi
    };
}
