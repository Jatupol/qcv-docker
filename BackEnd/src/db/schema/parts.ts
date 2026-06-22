// server/src/db/schema/parts.ts
// Parts Table Schema

import { pgTable, varchar, decimal, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const parts = pgTable('parts', {
  partno: varchar('partno', { length: 25 }).primaryKey(),
  partnoCustomer: varchar('partno_customer', { length: 50 }),
  productFamilies: varchar('product_families', { length: 10 }),
  versions: varchar('versions', { length: 20 }),
  customersSite: varchar('customers_site', { length: 10 }),
  tab: varchar('tab', { length: 5 }),
  productType: varchar('product_type', { length: 5 }),
  customerDriver: varchar('customer_driver', { length: 200 }),

  // LAR thresholds
  larAchieveThreshold: decimal('lar_achieve_threshold', { precision: 5, scale: 2 }).default('97.00'),
  larAcceptMinThreshold: decimal('lar_accept_min_threshold', { precision: 5, scale: 2 }).default('88.00'),
  larAcceptMaxThreshold: decimal('lar_accept_max_threshold', { precision: 5, scale: 2 }).default('97.00'),
  larAbnormalThreshold: decimal('lar_abnormal_threshold', { precision: 5, scale: 2 }).default('88.00'),

  // DPPM thresholds
  dppmAchieveThreshold: decimal('dppm_achieve_threshold', { precision: 8, scale: 2 }).default('300.00'),
  dppmAcceptMinThreshold: decimal('dppm_accept_min_threshold', { precision: 8, scale: 2 }).default('300.00'),
  dppmAcceptMaxThreshold: decimal('dppm_accept_max_threshold', { precision: 8, scale: 2 }).default('1000.00'),
  dppmAbnormalThreshold: decimal('dppm_abnormal_threshold', { precision: 8, scale: 2 }).default('1000.00'),

  // Underkill thresholds
  underkillAchieveThreshold: decimal('underkill_achieve_threshold', { precision: 5, scale: 2 }).default('0.02'),
  underkillAcceptMinThreshold: decimal('underkill_accept_min_threshold', { precision: 5, scale: 2 }).default('0.02'),
  underkillAcceptMaxThreshold: decimal('underkill_accept_max_threshold', { precision: 5, scale: 2 }).default('0.01'),
  underkillAbnormalThreshold: decimal('underkill_abnormal_threshold', { precision: 5, scale: 2 }).default('0.01'),

  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').default(0),
  updatedBy: integer('updated_by').default(0),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type Part = typeof parts.$inferSelect;
export type NewPart = typeof parts.$inferInsert;
