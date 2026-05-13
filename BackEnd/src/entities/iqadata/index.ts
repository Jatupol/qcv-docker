// server/src/entities/iqadata/index.ts
/**
 * IQA Data Entity - Main Export Module
 * Complete Separation Entity Architecture - SERIAL ID Pattern
 *
 * Centralized exports for IQA Data entity components
 */

// Types
export * from './types';

// Model
export { IQADataModel, createIQADataModel } from './model';

// Service
export { IQADataService, createIQADataService } from './service';

// Controller
export { IQADataController, createIQADataController } from './controller';

// Routes
export { default as createIQADataRoutes, createIQADataRoutesWithController } from './routes';
