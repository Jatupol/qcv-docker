"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDate = toDate;
exports.formatDateLocal = formatDateLocal;
exports.formatDateTimeLocal = formatDateTimeLocal;
exports.formatDateTimeDisplay = formatDateTimeDisplay;
function toDate(date) {
    if (!date) {
        return new Date();
    }
    if (date instanceof Date) {
        return date;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    const spaceMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (spaceMatch) {
        const [, year, month, day, hours, minutes, seconds, ms] = spaceMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds), ms ? parseInt(ms.substring(0, 3)) : 0);
    }
    const tMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (tMatch) {
        const [, year, month, day, hours, minutes, seconds, ms] = tMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds), ms ? parseInt(ms.substring(0, 3)) : 0);
    }
    console.warn(`⚠️ toDate: Unrecognized date format "${date}", using fallback parsing`);
    return new Date(date);
}
function formatDateLocal(date) {
    const dateObj = toDate(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatDateTimeLocal(date) {
    const dateObj = toDate(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
function formatDateTimeDisplay(date) {
    if (!date)
        return '-';
    const dateObj = toDate(date);
    if (isNaN(dateObj.getTime())) {
        return '-';
    }
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
