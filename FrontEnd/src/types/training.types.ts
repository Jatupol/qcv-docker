/**
 * Training Module Type Definitions
 *
 * Defines types and interfaces for training/documentation system
 */

// ==================== TRAINING CARD ====================

/**
 * Training Card - Represents a training manual/guide card
 */
export interface TrainingCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  path: string;
  filename?: string;
  isActive: boolean;
}

// ==================== TRAINING PAGE ====================

/**
 * Training Page Props
 */
export interface TrainingPageProps {
  cardNumber: number;
  totalCards: number;
  title: string;
  subtitle?: string;
  icon: string;
  previousLink?: string;
  nextLink?: string;
}

// ==================== TRAINING CONTENT ====================

/**
 * Step Item - Individual step in a procedure
 */
export interface StepItem {
  label: string;
  description: string;
  substeps?: string[];
}

/**
 * List Item - Item in a bulleted or numbered list
 */
export interface ListItem {
  label?: string;
  description: string;
}

/**
 * Table Data - Data for rendering tables
 */
export interface TableData {
  headers: string[];
  rows: string[][];
}

/**
 * Section Content - Content for a documentation section
 */
export interface SectionContent {
  title: string;
  content: React.ReactNode;
}

// ==================== MESSAGE TYPES ====================

/**
 * Message Type - Type of message box
 */
export type MessageType = 'success' | 'warning' | 'info' | 'help';

/**
 * Message Box Data
 */
export interface MessageBoxData {
  type: MessageType;
  title: string;
  content: string | string[];
}

// ==================== TRAINING ROUTES ====================

/**
 * Training Route Configuration
 */
export interface TrainingRoute {
  path: string;
  component: React.ComponentType<any>;
  title: string;
  cardNumber: number;
}

// ==================== NAVIGATION ====================

/**
 * Training Navigation Item
 */
export interface TrainingNavItem {
  label: string;
  path: string;
  icon?: string;
}

// ==================== CONSTANTS ====================

/**
 * Default Total Cards
 */
export const DEFAULT_TOTAL_CARDS = 4;

/**
 * Training Base Path
 */
export const TRAINING_BASE_PATH = '/training';

// ==================== UTILITY TYPES ====================

/**
 * Optional Props - Makes all properties optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Required Props - Makes all properties required
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};
