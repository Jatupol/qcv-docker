// server/src/config/features.ts
// Drizzle ORM Configuration
// Manufacturing Quality Control System
//
// Drizzle ORM is now the default database layer.
// The feature flag system has been simplified - all entities use Drizzle.

/**
 * Drizzle is now enabled for all entities by default.
 * This constant is kept for backward compatibility with model-factory files.
 */
export const USE_DRIZZLE = {
  // All entities now use Drizzle by default
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
} as const;

/**
 * Drizzle is always enabled
 */
export const DRIZZLE_ALL_ENABLED = true;

/**
 * Check if Drizzle is enabled for a specific entity
 * Always returns true since Drizzle is now the default
 */
export function isDrizzleEnabled(_entity: keyof typeof USE_DRIZZLE): boolean {
  return true;
}

/**
 * Log current Drizzle status on startup
 */
export function logDrizzleStatus(): void {
  console.log('📊 Drizzle ORM Status:');
  console.log('   ✅ ALL entities using Drizzle ORM');
}
