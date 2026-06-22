"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defectdataIqaRelations = exports.iqadataRelations = exports.partsRelations = exports.samplingReasonsRelations = exports.inspectiondataCustomerRelations = exports.inspectiondataRelations = exports.defectCustomerImageRelations = exports.defectImageRelations = exports.defectdataCustomerRelations = exports.defectdataRelations = exports.defectsRelations = exports.customersSiteRelations = exports.customersRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const customers_1 = require("./customers");
const customersSite_1 = require("./customersSite");
const defects_1 = require("./defects");
const defectdata_1 = require("./defectdata");
const defectdataCustomer_1 = require("./defectdataCustomer");
const defectImage_1 = require("./defectImage");
const defectCustomerImage_1 = require("./defectCustomerImage");
const defectdataIqa_1 = require("./defectdataIqa");
const inspectiondata_1 = require("./inspectiondata");
const inspectiondataCustomer_1 = require("./inspectiondataCustomer");
const iqadata_1 = require("./iqadata");
const parts_1 = require("./parts");
const samplingReasons_1 = require("./samplingReasons");
exports.customersRelations = (0, drizzle_orm_1.relations)(customers_1.customers, ({ many }) => ({
    sites: many(customersSite_1.customersSite),
}));
exports.customersSiteRelations = (0, drizzle_orm_1.relations)(customersSite_1.customersSite, ({ one }) => ({
    customer: one(customers_1.customers, {
        fields: [customersSite_1.customersSite.customers],
        references: [customers_1.customers.code],
    }),
}));
exports.defectsRelations = (0, drizzle_orm_1.relations)(defects_1.defects, ({ many }) => ({
    defectdata: many(defectdata_1.defectdata),
    defectdataCustomer: many(defectdataCustomer_1.defectdataCustomer),
}));
exports.defectdataRelations = (0, drizzle_orm_1.relations)(defectdata_1.defectdata, ({ one, many }) => ({
    defect: one(defects_1.defects, {
        fields: [defectdata_1.defectdata.defectId],
        references: [defects_1.defects.id],
    }),
    inspection: one(inspectiondata_1.inspectiondata, {
        fields: [defectdata_1.defectdata.inspectionNo],
        references: [inspectiondata_1.inspectiondata.inspectionNo],
    }),
    images: many(defectImage_1.defectImage),
}));
exports.defectdataCustomerRelations = (0, drizzle_orm_1.relations)(defectdataCustomer_1.defectdataCustomer, ({ one, many }) => ({
    defect: one(defects_1.defects, {
        fields: [defectdataCustomer_1.defectdataCustomer.defectId],
        references: [defects_1.defects.id],
    }),
    images: many(defectCustomerImage_1.defectCustomerImage),
}));
exports.defectImageRelations = (0, drizzle_orm_1.relations)(defectImage_1.defectImage, ({ one }) => ({
    defectdata: one(defectdata_1.defectdata, {
        fields: [defectImage_1.defectImage.defectId],
        references: [defectdata_1.defectdata.id],
    }),
}));
exports.defectCustomerImageRelations = (0, drizzle_orm_1.relations)(defectCustomerImage_1.defectCustomerImage, ({ one }) => ({
    defectdataCustomer: one(defectdataCustomer_1.defectdataCustomer, {
        fields: [defectCustomerImage_1.defectCustomerImage.defectId],
        references: [defectdataCustomer_1.defectdataCustomer.id],
    }),
}));
exports.inspectiondataRelations = (0, drizzle_orm_1.relations)(inspectiondata_1.inspectiondata, ({ one, many }) => ({
    samplingReason: one(samplingReasons_1.samplingReasons, {
        fields: [inspectiondata_1.inspectiondata.samplingReasonId],
        references: [samplingReasons_1.samplingReasons.id],
    }),
    part: one(parts_1.parts, {
        fields: [inspectiondata_1.inspectiondata.itemno],
        references: [parts_1.parts.partno],
    }),
    defects: many(defectdata_1.defectdata),
    customerData: one(inspectiondataCustomer_1.inspectiondataCustomer, {
        fields: [inspectiondata_1.inspectiondata.inspectionNo],
        references: [inspectiondataCustomer_1.inspectiondataCustomer.inspectionNo],
    }),
}));
exports.inspectiondataCustomerRelations = (0, drizzle_orm_1.relations)(inspectiondataCustomer_1.inspectiondataCustomer, ({ one }) => ({
    inspection: one(inspectiondata_1.inspectiondata, {
        fields: [inspectiondataCustomer_1.inspectiondataCustomer.inspectionNo],
        references: [inspectiondata_1.inspectiondata.inspectionNo],
    }),
}));
exports.samplingReasonsRelations = (0, drizzle_orm_1.relations)(samplingReasons_1.samplingReasons, ({ many }) => ({
    inspections: many(inspectiondata_1.inspectiondata),
}));
exports.partsRelations = (0, drizzle_orm_1.relations)(parts_1.parts, ({ many }) => ({
    inspections: many(inspectiondata_1.inspectiondata),
}));
exports.iqadataRelations = (0, drizzle_orm_1.relations)(iqadata_1.iqadata, ({ many }) => ({
    defects: many(defectdataIqa_1.defectdataIqa),
}));
exports.defectdataIqaRelations = (0, drizzle_orm_1.relations)(defectdataIqa_1.defectdataIqa, ({ one }) => ({
    iqa: one(iqadata_1.iqadata, {
        fields: [defectdataIqa_1.defectdataIqa.iqaid],
        references: [iqadata_1.iqadata.id],
    }),
    defect: one(defects_1.defects, {
        fields: [defectdataIqa_1.defectdataIqa.defectId],
        references: [defects_1.defects.id],
    }),
}));
