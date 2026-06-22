// server/src/db/schema/sysconfig.ts
// System Configuration Table Schema

import { pgTable, serial, varchar, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { auditColumns } from './common';

export const sysconfig = pgTable('sysconfig', {
  id: serial('id').primaryKey(),
  systemName: varchar('system_name', { length: 100 }),
  systemVersion: varchar('system_version', { length: 20 }),
  systemUpdated: timestamp('system_updated', { withTimezone: false }).defaultNow(),

  // SMTP Configuration
  smtpServer: varchar('smtp_server', { length: 100 }),
  smtpPort: integer('smtp_port').default(587),
  smtpUsername: varchar('smtp_username', { length: 100 }),
  smtpPassword: varchar('smtp_password', { length: 100 }),

  // MSSQL Configuration (external sync)
  mssqlServer: varchar('mssql_server', { length: 100 }),
  mssqlPort: integer('mssql_port').default(1433),
  mssqlDatabase: varchar('mssql_database', { length: 100 }),
  mssqlUsername: varchar('mssql_username', { length: 100 }),
  mssqlPassword: varchar('mssql_password', { length: 100 }),
  mssqlSync: integer('mssql_sync').default(60),
  mssqlEnabled: boolean('mssql_enabled').default(true),
  mssqlExcludeKeywords: text('mssql_exclude_keywords'),

  // System content
  news: text('news'),

  // Sampling quantities
  fviLotQty: varchar('fvi_lot_qty', { length: 100 }),
  generalOqaQty: varchar('general_oqa_qty', { length: 100 }),
  crackOqaQty: varchar('crack_oqa_qty', { length: 100 }),
  generalSivQty: varchar('general_siv_qty', { length: 100 }),
  crackSivQty: varchar('crack_siv_qty', { length: 100 }),

  // Defect configuration
  defectType: varchar('defect_type', { length: 500 }),
  defectGroup: varchar('defect_group', { length: 3000 }),
  defectColor: varchar('defect_color', { length: 3000 }),

  // Lookup values
  shift: varchar('shift', { length: 100 }),
  site: varchar('site', { length: 100 }),
  tabs: varchar('tabs', { length: 100 }),
  productType: varchar('product_type', { length: 50 }),
  productFamilies: varchar('product_families', { length: 3000 }),

  // Notification
  defectNotificationEmails: text('defect_notification_emails'),

  // Audit columns
  ...auditColumns,
});

// Type inference
export type Sysconfig = typeof sysconfig.$inferSelect;
export type NewSysconfig = typeof sysconfig.$inferInsert;
