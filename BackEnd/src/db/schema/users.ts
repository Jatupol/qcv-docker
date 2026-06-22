// server/src/db/schema/users.ts
// Users Table Schema

import { pgTable, serial, varchar, boolean, integer, timestamp, time } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 250 }).notNull(),
  role: varchar('role', { length: 20 }).default('user'), // admin, manager, user, viewer
  position: varchar('position', { length: 30 }).default(''),
  workShift: varchar('work_shift', { length: 1 }),
  checkin: timestamp('checkin', { withTimezone: false }),
  team: varchar('team', { length: 5 }),
  linevi: varchar('linevi', { length: 100 }),
  timeStartWork: time('time_start_work', { withTimezone: false }),
  timeOffWork: time('time_off_work', { withTimezone: false }),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').default(0),
  updatedBy: integer('updated_by').default(0),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
