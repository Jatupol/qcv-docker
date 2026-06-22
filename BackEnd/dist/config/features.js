"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRIZZLE_ALL_ENABLED = exports.USE_DRIZZLE = void 0;
exports.isDrizzleEnabled = isDrizzleEnabled;
exports.logDrizzleStatus = logDrizzleStatus;
exports.USE_DRIZZLE = {
    sysconfig: true,
    systemInfo: true,
    fiscalCalendar: true,
    logInterface: true,
    customers: true,
    customersSite: true,
    defects: true,
    samplingReasons: true,
    parts: true,
    infCheckin: true,
    infLotinput: true,
    infUseroperation: true,
    users: true,
    inspectiondata: true,
    inspectiondataCustomer: true,
    defectdata: true,
    defectdataCustomer: true,
    defectImage: true,
    defectCustomerImage: true,
    iqadata: true,
    defectdataIqa: true,
    tblDocument: true,
};
exports.DRIZZLE_ALL_ENABLED = true;
function isDrizzleEnabled(_entity) {
    return true;
}
function logDrizzleStatus() {
    console.log('📊 Drizzle ORM Status:');
    console.log('   ✅ ALL entities using Drizzle ORM');
}
