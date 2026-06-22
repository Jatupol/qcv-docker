// client/src/pages/training/IndexReportPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Report Training Index Page
 * Main navigation page for all report training modules
 */
const IndexReportPage: React.FC = () => {
  const reportCategories = [
    {
      category: 'Internal Reports - Quality Monitoring',
      icon: '🏭',
      color: '#0066cc',
      reports: [
        { number: 20, name: 'LAR Report', subtitle: 'Line Acceptance Rate', path: '/training/lar-report', icon: '📊' },
        { number: 21, name: 'SGT IQA vs NHK OQA', subtitle: 'IQA vs OQA Comparison', path: '/training/sgt-iqa-oqa-report', icon: '⚖️' },
        { number: 22, name: 'Overall OQA DPPM', subtitle: 'Overall Quality Metrics', path: '/training/overall-oqa-report', icon: '📈' },
        { number: 24, name: 'SGT IQA Result', subtitle: 'Customer IQA Details', path: '/training/sgt-iqa-result-report', icon: '📋' },
        { number: 25, name: 'SGT IQA Trend', subtitle: 'IQA Trend Analysis', path: '/training/sgt-iqa-trend-report', icon: '📉' },
      ],
    },
    {
      category: 'Internal Reports - Problem Analysis',
      icon: '🔍',
      color: '#dc2626',
      reports: [
        { number: 23, name: 'Top Defect Report', subtitle: 'Most Frequent Defects', path: '/training/top-defect-report', icon: '🔝' },
        { number: 26, name: 'Defect Root Cause', subtitle: 'Root Cause Analysis', path: '/training/root-cause-report', icon: '🌳' },
      ],
    },
    {
      category: 'Internal Reports - Analytics & Tracking',
      icon: '📊',
      color: '#10b981',
      reports: [
        { number: 27, name: 'Production Line Heatmap', subtitle: 'Visual Performance Map', path: '/training/production-heatmap', icon: '🗺️' },
        { number: 28, name: 'Product Quality Scorecard', subtitle: 'Multi-metric Dashboard', path: '/training/quality-scorecard', icon: '🎯' },
        { number: 29, name: 'Monthly Quality Trend', subtitle: 'Long-term Trends', path: '/training/monthly-trend-report', icon: '📅' },
        { number: 36, name: 'History Tracking', subtitle: 'Lot Number Lookup', path: '/training/history-tracking', icon: '🔍' },
        { number: 37, name: 'Defect Image Summary', subtitle: 'Defect Image Collection', path: '/training/defect-image-summary', icon: '📸' },
        { number: 38, name: 'Validation with DBFVI', subtitle: 'FVI Inspection Validation', path: '/training/fvi-inspection', icon: '✅' },
      ],
    },
    {
      category: 'Customer Reports',
      icon: '👥',
      color: '#f97316',
      reports: [
        { number: 30, name: 'SGT Format Report', subtitle: 'Seagate Format (Public)', path: '/training/sgt-format-report', icon: '📄' },
        { number: 31, name: 'LAR Customer', subtitle: 'Customer LAR Report', path: '/training/lar-customer-report', icon: '📊' },
        { number: 32, name: 'IQA-OQA Customer', subtitle: 'Customer IQA vs OQA', path: '/training/iqa-oqa-customer-report', icon: '⚖️' },
        { number: 33, name: 'Overall OQA Customer', subtitle: 'Customer DPPM Report', path: '/training/overall-oqa-customer-report', icon: '📈' },
        { number: 34, name: 'IQA Result Customer', subtitle: 'Customer IQA Results', path: '/training/iqa-result-customer-report', icon: '📋' },
        { number: 35, name: 'IQA Trend Customer', subtitle: 'Customer IQA Trends', path: '/training/iqa-trend-customer-report', icon: '📉' },
        { number: 39, name: 'Overview OQA Customer', subtitle: 'OQA Pivot Table Report', path: '/training/overview-oqa-customer-report', icon: '📊' },
        { number: 40, name: 'OQA Reject All Defect', subtitle: 'All Defect Details with Images', path: '/training/oqa-reject-all-defect-report', icon: '🔴' },
      ],
    },
  ];

  const getStatusColor = (_number: number) => {
    return '#10b981'; // Green - All Completed
  };

  const getStatusText = (_number: number) => {
    return '✅ Complete';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: '30px 20px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/training" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px', display: 'inline-block', marginBottom: '15px' }}>
            ← กลับไปหน้าหลัก Training
          </Link>
          <h1 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '36px', fontWeight: 'bold' }}>
            📊 Report Training Modules
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '18px' }}>
            คู่มือการใช้งานรายงานทั้งหมดในระบบ QCV
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Total Reports</div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>21</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.3)', padding: '12px 20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Completed</div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>21</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {reportCategories.map((category, catIndex) => (
          <div key={catIndex} style={{ marginBottom: '40px' }}>
            {/* Category Header */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px 12px 0 0', borderBottom: `4px solid ${category.color}` }}>
              <h2 style={{ margin: 0, color: category.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{category.icon}</span>
                <span>{category.category}</span>
              </h2>
            </div>

            {/* Reports Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {category.reports.map((report) => (
                <Link
                  key={report.number}
                  to={report.path}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = category.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: getStatusColor(report.number),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}>
                    {getStatusText(report.number)}
                  </div>

                  {/* Report Number */}
                  <div style={{
                    background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                  }}>
                    {report.number}
                  </div>

                  {/* Icon */}
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                    {report.icon}
                  </div>

                  {/* Report Name */}
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    {report.name}
                  </h3>

                  {/* Subtitle */}
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    {report.subtitle}
                  </p>

                  {/* Arrow */}
                  <div style={{ marginTop: '15px', color: category.color, fontSize: '14px', fontWeight: '600' }}>
                    เรียนรู้เพิ่มเติม →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Help Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', marginTop: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '24px' }}>📚 Additional Resources</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>📖 Reports Manual</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Complete detailed guide for all reports<br/>
                <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>REPORTS_MANUAL.md</code>
              </p>
            </div>
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#10b981' }}>⚡ Quick Reference</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                One-page cheat sheet<br/>
                <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>REPORTS_QUICK_REFERENCE.md</code>
              </p>
            </div>
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#f97316' }}>🎯 Decision Guide</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Which report should I use?<br/>
                <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>REPORTS_DECISION_GUIDE.md</code>
              </p>
            </div>
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>❓ Need Help?</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Contact Quality Manager<br/>
                or IT Support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexReportPage;
