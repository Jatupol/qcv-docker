"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_USER_CONFIG = exports.USER_BUSINESS_RULES = exports.USER_CONSTRAINTS = exports.UserRole = void 0;
exports.isValidUserRole = isValidUserRole;
exports.sanitizeUser = sanitizeUser;
exports.isValidUsername = isValidUsername;
exports.isValidEmail = isValidEmail;
exports.isValidPassword = isValidPassword;
exports.isValidName = isValidName;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["USER"] = "user";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.USER_CONSTRAINTS = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-Z0-9_-]+$/,
        RESERVED: ['admin', 'root', 'system', 'api', 'null', 'undefined']
    },
    EMAIL: {
        MAX_LENGTH: 255,
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL: false
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 250,
        PATTERN: /^[a-zA-Z\s\-'\.]+$/
    },
    POSITION: {
        MAX_LENGTH: 30
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    }
};
exports.USER_BUSINESS_RULES = {
    BCRYPT_ROUNDS: 12,
    SESSION_DURATION: 12 * 60 * 60 * 1000,
    PASSWORD_HISTORY: 5,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000,
    ADMIN_ROLE_REQUIRED_FOR: ['user_management', 'system_config'],
    MANAGER_ROLE_REQUIRED_FOR: ['reports', 'defect_management']
};
function isValidUserRole(role) {
    return Object.values(UserRole).includes(role);
}
function sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
}
function isValidUsername(username) {
    if (!username || typeof username !== 'string')
        return false;
    if (username.length < exports.USER_CONSTRAINTS.USERNAME.MIN_LENGTH)
        return false;
    if (username.length > exports.USER_CONSTRAINTS.USERNAME.MAX_LENGTH)
        return false;
    if (exports.USER_CONSTRAINTS.USERNAME.RESERVED.includes(username.toLowerCase()))
        return false;
    return true;
}
function isValidEmail(email) {
    if (!email || typeof email !== 'string')
        return false;
    if (email.length > exports.USER_CONSTRAINTS.EMAIL.MAX_LENGTH)
        return false;
    return exports.USER_CONSTRAINTS.EMAIL.PATTERN.test(email);
}
function isValidPassword(password) {
    if (!password || typeof password !== 'string')
        return false;
    if (password.length < exports.USER_CONSTRAINTS.PASSWORD.MIN_LENGTH)
        return false;
    if (password.length > exports.USER_CONSTRAINTS.PASSWORD.MAX_LENGTH)
        return false;
    return true;
}
function isValidName(name) {
    if (!name || typeof name !== 'string')
        return false;
    if (name.length < exports.USER_CONSTRAINTS.NAME.MIN_LENGTH)
        return false;
    if (name.length > exports.USER_CONSTRAINTS.NAME.MAX_LENGTH)
        return false;
    return exports.USER_CONSTRAINTS.NAME.PATTERN.test(name.trim());
}
exports.DEFAULT_USER_CONFIG = {
    entityName: 'user',
    tableName: 'users',
    apiPath: '/api/users',
    searchableFields: ['username', 'email', 'name', 'position'],
    defaultLimit: 10,
    maxLimit: 100
};
