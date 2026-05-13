import React from 'react';
import { Link } from 'react-router-dom';
import './TrainingLayout.css';

interface TrainingLayoutProps {
  cardNumber: number;
  totalCards: number;
  title: string;
  subtitle: string;
  icon: string;
  previousLink?: string;
  nextLink?: string;
  children: React.ReactNode;
}

/**
 * TrainingLayout Component
 *
 * Base layout for all training/quick reference pages
 * Provides consistent navigation, header, and footer
 */
const TrainingLayout: React.FC<TrainingLayoutProps> = ({
  cardNumber,
  totalCards,
  title,
  subtitle,
  icon,
  previousLink,
  nextLink,
  children,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="training-card">
      {/* Navigation Bar */}
      <nav className="training-nav-bar">
        <div className="training-nav-left">
          <Link to="/training" className="training-nav-btn">
            🏠 หน้าหลัก
          </Link>
          <span className="training-card-indicator">
            หัวข้อ {cardNumber} จาก {totalCards}
          </span>
        </div>
        <div className="training-nav-right">
          {previousLink && (
            <Link to={previousLink} className="training-nav-btn">
              ← ก่อนหน้า
            </Link>
          )}
          {nextLink && (
            <Link to={nextLink} className="training-nav-btn">
              ถัดไป →
            </Link>
          )}
          <button onClick={handlePrint} className="training-nav-btn training-print-btn">
            🖨️ พิมพ์ PDF
          </button>
        </div>
      </nav>

      {/* Header Section */}
      <header className="training-header">
        <h1>
          {icon} หัวข้อการทำงาน #{cardNumber}
        </h1>
        <p>{title}</p>
        {subtitle && <p className="training-subtitle">{subtitle}</p>}
      </header>

      {/* Content Section */}
      <main className="training-content">{children}</main>

      {/* Footer Section */}
      <footer className="training-footer">
        <p>
          <strong>
            หัวข้อการทำงาน #{cardNumber} - {title}
          </strong>
        </p>
        <p>พิมพ์หัวข้อนี้เพื่อใช้อ้างอิงที่สถานีทำงานของคุณ</p>
        <p>Sampling Inspection Control System</p>
      </footer>
    </div>
  );
};

export default TrainingLayout;
