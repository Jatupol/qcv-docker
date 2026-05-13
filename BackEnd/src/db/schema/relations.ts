// server/src/db/schema/relations.ts
// Drizzle ORM Relations Definitions
// Manufacturing Quality Control System

import { relations } from 'drizzle-orm';

// Import all tables
import { customers } from './customers';
import { customersSite } from './customersSite';
import { defects } from './defects';
import { defectdata } from './defectdata';
import { defectdataCustomer } from './defectdataCustomer';
import { defectImage } from './defectImage';
import { defectCustomerImage } from './defectCustomerImage';
import { defectdataIqa } from './defectdataIqa';
import { inspectiondata } from './inspectiondata';
import { inspectiondataCustomer } from './inspectiondataCustomer';
import { iqadata } from './iqadata';
import { parts } from './parts';
import { samplingReasons } from './samplingReasons';
import { users } from './users';

// ==================== Customer Relations ====================

export const customersRelations = relations(customers, ({ many }) => ({
  sites: many(customersSite),
}));

export const customersSiteRelations = relations(customersSite, ({ one }) => ({
  customer: one(customers, {
    fields: [customersSite.customers],
    references: [customers.code],
  }),
}));

// ==================== Defects Relations ====================

export const defectsRelations = relations(defects, ({ many }) => ({
  defectdata: many(defectdata),
  defectdataCustomer: many(defectdataCustomer),
}));

export const defectdataRelations = relations(defectdata, ({ one, many }) => ({
  defect: one(defects, {
    fields: [defectdata.defectId],
    references: [defects.id],
  }),
  inspection: one(inspectiondata, {
    fields: [defectdata.inspectionNo],
    references: [inspectiondata.inspectionNo],
  }),
  images: many(defectImage),
}));

export const defectdataCustomerRelations = relations(defectdataCustomer, ({ one, many }) => ({
  defect: one(defects, {
    fields: [defectdataCustomer.defectId],
    references: [defects.id],
  }),
  images: many(defectCustomerImage),
}));

export const defectImageRelations = relations(defectImage, ({ one }) => ({
  defectdata: one(defectdata, {
    fields: [defectImage.defectId],
    references: [defectdata.id],
  }),
}));

export const defectCustomerImageRelations = relations(defectCustomerImage, ({ one }) => ({
  defectdataCustomer: one(defectdataCustomer, {
    fields: [defectCustomerImage.defectId],
    references: [defectdataCustomer.id],
  }),
}));

// ==================== Inspection Relations ====================

export const inspectiondataRelations = relations(inspectiondata, ({ one, many }) => ({
  samplingReason: one(samplingReasons, {
    fields: [inspectiondata.samplingReasonId],
    references: [samplingReasons.id],
  }),
 
  part: one(parts, {
    fields: [inspectiondata.itemno],
    references: [parts.partno],
  }),
  defects: many(defectdata),
  customerData: one(inspectiondataCustomer, {
    fields: [inspectiondata.inspectionNo],
    references: [inspectiondataCustomer.inspectionNo],
  }),
}));

export const inspectiondataCustomerRelations = relations(inspectiondataCustomer, ({ one }) => ({
  inspection: one(inspectiondata, {
    fields: [inspectiondataCustomer.inspectionNo],
    references: [inspectiondata.inspectionNo],
  }),
}));

// ==================== Sampling Reasons Relations ====================

export const samplingReasonsRelations = relations(samplingReasons, ({ many }) => ({
  inspections: many(inspectiondata),
}));


// ==================== Parts Relations ====================

export const partsRelations = relations(parts, ({ many }) => ({
  inspections: many(inspectiondata),
}));

// ==================== IQA Relations ====================

export const iqadataRelations = relations(iqadata, ({ many }) => ({
  defects: many(defectdataIqa),
}));

export const defectdataIqaRelations = relations(defectdataIqa, ({ one }) => ({
  iqa: one(iqadata, {
    fields: [defectdataIqa.iqaid],
    references: [iqadata.id],
  }),
  defect: one(defects, {
    fields: [defectdataIqa.defectId],
    references: [defects.id],
  }),
}));
