import React from 'react';
import './TrainingComponents.css';

// ==================== TYPE DEFINITIONS ====================

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

interface StepBoxProps {
  steps?: { label: string; description: string }[];
  children?: React.ReactNode;
}

interface TableProps {
  headers: string[];
  rows: string[][];
}

interface MessageBoxProps {
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'info' | 'help';
}

interface ListProps {
  items: { label?: string; description: string }[];
  ordered?: boolean;
}

// ==================== SECTION COMPONENT ====================

/**
 * Section - Main content section with blue border and title
 */
export const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="training-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// ==================== STEP BOX COMPONENT ====================

/**
 * StepBox - Blue box for displaying step-by-step instructions
 */
export const StepBox: React.FC<StepBoxProps> = ({ steps, children }) => {
  return (
    <div className="training-step-box">
      {steps && steps.length > 0 ? (
        steps.map((step, index) => (
          <p key={index}>
            <strong>{step.label}:</strong> {step.description}
          </p>
        ))
      ) : (
        children
      )}
    </div>
  );
};

// ==================== TABLE COMPONENT ====================

/**
 * Table - Styled table with blue header
 */
export const Table: React.FC<TableProps> = ({ headers, rows }) => {
  return (
    <table className="training-table">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ==================== MESSAGE BOX COMPONENTS ====================

/**
 * MessageBox - Colored box for success, warning, info, or help messages
 */
export const MessageBox: React.FC<MessageBoxProps> = ({ title, children, type = 'info' }) => {
  const className = `training-message-box training-${type}-box`;

  return (
    <div className={className}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

/**
 * SuccessBox - Green box for success messages
 */
export const SuccessBox: React.FC<Omit<MessageBoxProps, 'type'>> = ({ title, children }) => {
  return <MessageBox type="success" title={title}>{children}</MessageBox>;
};

/**
 * WarningBox - Red box for warning messages
 */
export const WarningBox: React.FC<Omit<MessageBoxProps, 'type'>> = ({ title, children }) => {
  return <MessageBox type="warning" title={title}>{children}</MessageBox>;
};

/**
 * InfoBox - Yellow box for informational messages
 */
export const InfoBox: React.FC<Omit<MessageBoxProps, 'type'>> = ({ title, children }) => {
  return <MessageBox type="info" title={title}>{children}</MessageBox>;
};

/**
 * HelpBox - Blue box for help/support messages
 */
export const HelpBox: React.FC<Omit<MessageBoxProps, 'type'>> = ({ title, children }) => {
  return <MessageBox type="help" title={title}>{children}</MessageBox>;
};

// ==================== LIST COMPONENT ====================

/**
 * List - Styled unordered or ordered list
 */
export const List: React.FC<ListProps> = ({ items, ordered = false }) => {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag className="training-list">
      {items.map((item, index) => (
        <li key={index}>
          {item.label && <strong>{item.label}: </strong>}
          {item.description}
        </li>
      ))}
    </ListTag>
  );
};

// ==================== SUBSECTION COMPONENT ====================

/**
 * Subsection - H3 heading for subsections
 */
export const Subsection: React.FC<{ title: string }> = ({ title }) => {
  return <h3 className="training-subsection">{title}</h3>;
};

// ==================== PARAGRAPH COMPONENT ====================

/**
 * Paragraph - Standard paragraph with proper spacing
 */
export const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="training-paragraph">{children}</p>;
};

// ==================== HIGHLIGHT COMPONENT ====================

/**
 * Highlight - Inline highlighted text
 */
export const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <strong className="training-highlight">{children}</strong>;
};

// ==================== EXPORT ALL COMPONENTS ====================

export default {
  Section,
  StepBox,
  Table,
  MessageBox,
  SuccessBox,
  WarningBox,
  InfoBox,
  HelpBox,
  List,
  Subsection,
  Paragraph,
  Highlight,
};
