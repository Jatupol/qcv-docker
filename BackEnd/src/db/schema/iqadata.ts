// server/src/db/schema/iqadata.ts
// IQA Data Table Schema

import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

export const iqadata = pgTable('iqadata', {
  id: serial('id').primaryKey(),
  fy: varchar('fy', { length: 4 }),
  ww: varchar('ww', { length: 2 }),
  fw: varchar('fw', { length: 10 }),
  dateIqa: varchar('date_iqa', { length: 15 }),
  shiftToShift: varchar('shift_to_shift', { length: 10 }),
  expense: varchar('expense', { length: 15 }),
  reExpense: varchar('re_expense', { length: 15 }),
  qcOwner: varchar('qc_owner', { length: 50 }),
  model: varchar('model', { length: 50 }),
  item: varchar('item', { length: 20 }),
  telex: varchar('telex', { length: 5 }),
  supplier: varchar('supplier', { length: 10 }),
  descr: varchar('descr', { length: 250 }),
  location: varchar('location', { length: 10 }),
  qty: integer('qty'),
  supplierDo: varchar('supplier_do', { length: 15 }),
  remark: varchar('remark', { length: 250 }),
  po: varchar('po', { length: 15 }),
  sbr: varchar('sbr', { length: 15 }),
  dispositionCode: varchar('disposition_code', { length: 10 }),
  receiptDate: varchar('receipt_date', { length: 15 }),
  age: integer('age'),
  warehouse: varchar('warehouse', { length: 10 }),
  building: varchar('building', { length: 10 }),
  businessUnit: varchar('business_unit', { length: 10 }),
  stdCaseQty: integer('std_case_qty'),
  lpn: integer('lpn'),
  lotno: varchar('lotno', { length: 15 }),
  refCode: varchar('ref_code', { length: 30 }),
  dataOnWeb: varchar('data_on_web', { length: 5 }),
  inspec: integer('inspec'),
  rej: integer('rej'),
  defect: varchar('defect', { length: 30 }),
  vender: varchar('vender', { length: 50 }),
});

// Type inference
export type Iqadata = typeof iqadata.$inferSelect;
export type NewIqadata = typeof iqadata.$inferInsert;
