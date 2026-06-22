// server/src/db/schema/customersSite.ts
// Customers Site Table Schema

import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { auditColumns, activeColumn } from './common';

export const customersSite = pgTable('customers_site', {
  code: varchar('code', { length: 10 }).primaryKey(),
  customers: varchar('customers', { length: 5 }),
  site: varchar('site', { length: 5 }),
  ...activeColumn,
  ...auditColumns,
});

// Type inference
export type CustomersSite = typeof customersSite.$inferSelect;
export type NewCustomersSite = typeof customersSite.$inferInsert;
