// server/src/services/purge/allowedTables.ts
// Whitelist of (table, timestamp_column) pairs that admins are allowed to
// configure as dynamic purge targets via the admin UI.
//
// Why a whitelist?
//   The purge engine builds DELETE statements with the table/column names
//   pulled from a DB row (`purge_policy`). To avoid letting an admin point
//   at a sensitive table (e.g. `users`, `session`) — even by typo — every
//   pair must appear here AND match a strict identifier regex before SQL
//   is constructed.
//
// To allow a new table for purge, add an entry here. No code change in the
// route layer or the executor is needed.

export interface AllowedTable {
  /** Postgres table name. Must match /^[a-z][a-z0-9_]*$/. */
  tableName: string;
  /** Timestamp column to compare against (NOW() - retention_days days). Same regex. */
  timestampColumn: string;
  /** Human label for the admin UI. */
  label: string;
}

export const ALLOWED_PURGE_TABLES: AllowedTable[] = [
  { tableName: 'log_interface',          timestampColumn: 'import_date',     label: 'MSSQL Sync Audit Log' },
  { tableName: 'defectdata',             timestampColumn: 'defect_date',     label: 'Defect Data' },
  { tableName: 'inspectiondata',         timestampColumn: 'inspection_date', label: 'Inspection Data' },
  { tableName: 'defectdata_customer',    timestampColumn: 'defect_date',     label: 'Defect Data (Customer)' },
  { tableName: 'inspectiondata_customer',timestampColumn: 'updated_at',      label: 'Inspection Data (Customer)' },
  { tableName: 'inf_checkin',            timestampColumn: 'imported_at',     label: 'INF Check-in' },
  { tableName: 'inf_lotinput',           timestampColumn: 'inputdate',       label: 'INF Lot Input' },
  { tableName: 'inf_useroperation',      timestampColumn: 'imported_at',     label: 'INF User Operation' },
];

const IDENT_RE = /^[a-z][a-z0-9_]*$/;

/** True if a string is a safe lowercase SQL identifier. */
export function isValidIdentifier(s: string): boolean {
  return typeof s === 'string' && IDENT_RE.test(s) && s.length <= 63;
}

/** Look up an allowed entry by table name. Returns undefined if not whitelisted. */
export function findAllowedTable(tableName: string): AllowedTable | undefined {
  return ALLOWED_PURGE_TABLES.find(t => t.tableName === tableName);
}

/**
 * Validate a (table, column) pair. Returns true only when both identifiers
 * pass the regex AND match a whitelisted entry exactly.
 */
export function isAllowedTableColumn(tableName: string, timestampColumn: string): boolean {
  if (!isValidIdentifier(tableName) || !isValidIdentifier(timestampColumn)) return false;
  const entry = findAllowedTable(tableName);
  return !!entry && entry.timestampColumn === timestampColumn;
}
