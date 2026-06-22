// server/src/db/schema/index.ts
// Drizzle ORM Schema Barrel Export
// Manufacturing Quality Control System

// ==================== Common ====================
export * from './common';

// ==================== Priority 1: Foundation (Low Risk) ====================
export * from './sysconfig';
export * from './systemInfo';
export * from './fiscalCalendar';
export * from './logInterface';

// ==================== Audit ====================
export * from './auditLog';

// ==================== Priority 2: Master Data (Low Risk) ====================
export * from './customers';
export * from './customersSite';
export * from './defects';
export * from './samplingReasons';
export * from './parts';

// ==================== Priority 3: Interface Tables (Low Risk) ====================
export * from './infCheckin';
export * from './infLotinput';
export * from './infUseroperation';

// ==================== Priority 4: Auth & Users (Medium Risk) ====================
export * from './users';
export * from './sessions';

// ==================== Priority 5: Core Business (High Risk) ====================
export * from './inspectiondata';
export * from './inspectiondataCustomer';
export * from './defectdata';
export * from './defectdataCustomer';
export * from './defectImage';
export * from './defectCustomerImage';
export * from './iqadata';
export * from './defectdataIqa';

// ==================== Special Tables ====================
export * from './tblDocument';

// ==================== Relations ====================
export * from './relations';
