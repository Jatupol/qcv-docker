// client/src/pages/training/IndexPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useOutlet } from 'react-router-dom';
import './Training.css';
import sysconfigService from '../../services/sysconfigService';

interface MenuItem {
  icon: string;
  title: string;
  path: string;
}

interface MenuSection {
  icon: string;
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    icon: '🏠',
    title: 'Dashboard',
    items: [
      { icon: '🔐', title: 'การเข้าสู่ระบบ & Dashboard', path: '/training/t01' },
    ],
  },
  {
    icon: '👥',
    title: 'Customer Format',
    items: [
      { icon: '📋', title: 'OQA Customer', path: '/training/oqa-customer' },
      { icon: '📄', title: 'SGT Format Report', path: '/training/sgt-format-report' },
      { icon: '📊', title: 'LAR Customer', path: '/training/lar-customer-report' },
      { icon: '⚖️', title: 'IQA-OQA Customer', path: '/training/iqa-oqa-customer-report' },
      { icon: '📈', title: 'Overall OQA Customer', path: '/training/overall-oqa-customer-report' },
      { icon: '📋', title: 'IQA Result Customer', path: '/training/iqa-result-customer-report' },
      { icon: '📉', title: 'IQA Trend Customer', path: '/training/iqa-trend-customer-report' },
      { icon: '📈', title: 'Graph OQA Customer', path: '/training/graph-oqa-customer' },
      { icon: '📊', title: 'Overview OQA Customer', path: '/training/overview-oqa-customer-report' },
    ],
  },
  {
    icon: '🔍',
    title: 'Inspection',
    items: [
      { icon: '📋', title: 'ภาพรวม OQA', path: '/training/t02' },
      { icon: '📝', title: 'OQA Inspection', path: '/training/t03' },
      { icon: '📝', title: 'OBA Inspection', path: '/training/t04' },
      { icon: '📝', title: 'SIV Inspection', path: '/training/t05' },
      { icon: '📸', title: 'Defect Record', path: '/training/t06' },
      { icon: '📊', title: 'IQA Import', path: '/training/t07' },
      { icon: '✅', title: 'Validation with DBFVI', path: '/training/fvi-inspection' },
      { icon: '📊', title: 'Defect Type Analysis', path: '/training/defect-type-analysis' },
      { icon: '🔴', title: 'OQA Reject All Defect', path: '/training/oqa-reject-all-defect-report' },
    ],
  },
  {
    icon: '🗄️',
    title: 'Master Data',
    items: [
      { icon: '📋', title: 'ภาพรวม Master Data', path: '/training/t16' },
      { icon: '🔧', title: 'Inspection Data Setup', path: '/training/t13' },
      { icon: '👤', title: 'Customers', path: '/training/t11' },
      { icon: '📋', title: 'Sampling Reasons', path: '/training/sampling-reasons' },
      { icon: '⚠️', title: 'Defects', path: '/training/t12' },
      { icon: '🏭', title: 'Products Site', path: '/training/t10' },
      { icon: '🔩', title: 'Parts', path: '/training/parts' },
      { icon: '📅', title: 'Fiscal Calendar', path: '/training/fiscal-calendar' },
    ],
  },
  {
    icon: '📰',
    title: 'News',
    items: [
      { icon: '📰', title: 'ข่าวสารและประกาศ', path: '/training/t09' },
    ],
  },
  {
    icon: '👤',
    title: 'Users',
    items: [
      { icon: '👥', title: 'การจัดการผู้ใช้งาน', path: '/training/t08' },
      { icon: '🌐', title: 'Active Sessions', path: '/training/active-sessions' },
      { icon: '📜', title: 'Login Log', path: '/training/login-logs' },
      { icon: '🗑️', title: 'Purge Policies', path: '/training/purge-policies' },
    ],
  },
  {
    icon: '📊',
    title: 'Reports',
    items: [
      { icon: '📊', title: 'LAR Report', path: '/training/lar-report' },
      { icon: '⚖️', title: 'SGT IQA vs NHK OQA', path: '/training/sgt-iqa-oqa-report' },
      { icon: '📈', title: 'Overall OQA DPPM', path: '/training/overall-oqa-report' },
      { icon: '🔝', title: 'Top Defect Report', path: '/training/top-defect-report' },
      { icon: '📋', title: 'SGT IQA Result', path: '/training/sgt-iqa-result-report' },
      { icon: '📉', title: 'SGT IQA Trend', path: '/training/sgt-iqa-trend-report' },
      { icon: '🌳', title: 'Defect Root Cause', path: '/training/root-cause-report' },
      { icon: '🗺️', title: 'Production Line Heatmap', path: '/training/production-heatmap' },
      { icon: '🎯', title: 'Product Quality Scorecard', path: '/training/quality-scorecard' },
      { icon: '📅', title: 'Monthly Quality Trend', path: '/training/monthly-trend-report' },
      { icon: '🔍', title: 'History Tracking', path: '/training/history-tracking' },
      { icon: '📸', title: 'Defect Image Summary', path: '/training/defect-image-summary' },
      { icon: '📋', title: 'SOQM - Daily', path: '/training/soqm-daily' },
      { icon: '📊', title: 'SOQM - Weekly', path: '/training/soqm-weekly' },
    ],
  },
  {
    icon: '🔗',
    title: 'Interface',
    items: [
      { icon: '🔗', title: 'Interface (ภาพรวม)', path: '/training/t14' },
      { icon: '📥', title: 'Check In Import', path: '/training/checkin-import' },
      { icon: '📦', title: 'Lot Input Import', path: '/training/lotinput-import' },
      { icon: '👥', title: 'User Operation', path: '/training/useroperation' },
    ],
  },
  {
    icon: '⚙️',
    title: 'Settings',
    items: [
      { icon: '⚙️', title: 'การตั้งค่าระบบ', path: '/training/t15' },
    ],
  },
];

/**
 * Training Index Page (Layout)
 *
 * Sidebar tree layout mirroring the actual system menu structure.
 * Renders child training pages via <Outlet /> in the right panel.
 */
const IndexPage: React.FC = () => {
  const [systemName, setSystemName] = useState<string>('Sampling Inspection Control System');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const outlet = useOutlet();
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll content area to top when navigating between pages
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadSystemName = async () => {
      try {
        const response = await sysconfigService.getActiveSystemSetup();
        if (response && response.success && response.data && response.data.system_name) {
          setSystemName(response.data.system_name);
        }
      } catch (error) {
        console.error('Failed to load system name:', error);
      }
    };
    loadSystemName();

    // Expand all sections by default
    const allExpanded: Record<string, boolean> = {};
    menuSections.forEach(s => { allExpanded[s.title] = true; });
    setExpandedSections(allExpanded);
  }, []);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    menuSections.forEach(s => { all[s.title] = true; });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    menuSections.forEach(s => { all[s.title] = false; });
    setExpandedSections(all);
  };

  const totalItems = menuSections.reduce((sum, s) => sum + s.items.length, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="tix-layout">
      {/* Sidebar */}
      <aside className="tix-sidebar">
        <div className="tix-sidebar-header">
          <Link to="/training" className="tix-logo">
            <span className="tix-logo-icon">📚</span>
            <div className="tix-logo-text">
              <span className="tix-logo-title">คู่มือการใช้งาน</span>
              <span className="tix-logo-subtitle">{systemName}</span>
            </div>
          </Link>
        </div>

        <div className="tix-sidebar-actions">
          <button onClick={expandAll} className="tix-action-btn" title="ขยายทั้งหมด">
            ▼ ขยายทั้งหมด
          </button>
          <button onClick={collapseAll} className="tix-action-btn" title="ยุบทั้งหมด">
            ▶ ยุบทั้งหมด
          </button>
        </div>

        <nav className="tix-menu">
          {menuSections.map((section) => (
            <div key={section.title} className="tix-menu-group">
              <button
                className={`tix-menu-section ${expandedSections[section.title] ? 'tix-expanded' : ''}`}
                onClick={() => toggleSection(section.title)}
              >
                <span className="tix-menu-section-icon">{section.icon}</span>
                <span className="tix-menu-section-title">{section.title}</span>
                <span className="tix-menu-section-badge">{section.items.length}</span>
                <span className="tix-menu-chevron">{expandedSections[section.title] ? '▼' : '▶'}</span>
              </button>

              {expandedSections[section.title] && (
                <div className="tix-menu-items">
                  {section.items.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className={`tix-menu-item ${isActive(item.path) ? 'tix-active' : ''}`}
                    >
                      <span className="tix-item-icon">{item.icon}</span>
                      <span className="tix-item-title">{item.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="tix-sidebar-footer">
          <span>{totalItems} หน้าคู่มือ</span>
          <span>มีนาคม 2026</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="tix-main">
        {outlet ? (
          <div className="tix-content-area" ref={contentRef}>
            <Outlet />
          </div>
        ) : (
          <>
          <div className="tix-topbar">
            <Link to="/" className="tix-topbar-btn">
              🏠 กลับสู่หน้าหลัก
            </Link>
            <button onClick={() => window.print()} className="tix-topbar-btn tix-print-btn">
              🖨️ พิมพ์
            </button>
          </div>
          <div className="tix-welcome">
            <h1>📚 คู่มือการใช้งาน</h1>
            <p className="tix-welcome-system">{systemName}</p>
            <p className="tix-welcome-desc">เลือกหัวข้อจากเมนูด้านซ้ายเพื่อดูคู่มือ</p>

            {/* Quick Stats */}
            <div className="tix-stats">
              {menuSections.map((section) => (
                <div key={section.title} className="tix-stat-card">
                  <span className="tix-stat-icon">{section.icon}</span>
                  <span className="tix-stat-title">{section.title}</span>
                  <span className="tix-stat-count">{section.items.length}</span>
                </div>
              ))}
            </div>

            {/* Quick Links Grid */}
            <div className="tix-quick-grid">
              {menuSections.map((section) => (
                <div key={section.title} className="tix-quick-section">
                  <h3 className="tix-quick-title">
                    <span>{section.icon}</span> {section.title}
                  </h3>
                  <ul className="tix-quick-list">
                    {section.items.map((item, idx) => (
                      <li key={idx}>
                        <Link to={item.path} className="tix-quick-link">
                          <span className="tix-quick-icon">{item.icon}</span>
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          </>
        )}
      </main>
    </div>
  );
};

export default IndexPage;
