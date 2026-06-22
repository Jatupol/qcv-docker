// server/src/db/schema/customers.ts
// Customers Table Schema

import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { auditColumns, activeColumn } from './common';

export const customers = pgTable('customers', {
  code: varchar('code', { length: 5 }).primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  ...activeColumn,
  ...auditColumns,
});

// Type inference
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
