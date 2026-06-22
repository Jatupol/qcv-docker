// server/src/db/schema/common.ts
// Shared column definitions for Drizzle ORM
// Manufacturing Quality Control System

import { timestamp, integer, boolean, customType } from 'drizzle-orm/pg-core';

/**
 * Audit columns - track created/updated by and timestamps
 * Used by most entity tables
 * Note: Database allows NULL, defaults handle missing values
 * Using timestamp WITHOUT timezone to preserve local time exactly as entered
 */
export const auditColumns = {
  createdBy: integer('created_by').default(0),
  updatedBy: integer('updated_by').default(0),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
};

/**
 * Active status column
 * Used for soft delete functionality
 * Note: Database allows NULL, default is true
 */
export const activeColumn = {
  isActive: boolean('is_active').default(true),
};

/**
 * Custom bytea type for PostgreSQL binary data (images)
 */
export const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return 'bytea';
  },
  toDriver(value: Buffer): string {
    // Convert Buffer to PostgreSQL hex format for parameterized queries
    return '\\x' + value.toString('hex');
  },
  fromDriver(value: unknown): Buffer {
    if (Buffer.isBuffer(value)) return value;
    if (typeof value === 'string') {
      // Handle PostgreSQL hex format (\x prefix)
      if (value.startsWith('\\x')) {
        return Buffer.from(value.slice(2), 'hex');
      }
      return Buffer.from(value, 'hex');
    }
    throw new Error('Invalid bytea value');
  },
});
