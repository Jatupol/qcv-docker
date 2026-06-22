// ===================================
// client/src/components/common/MobileMenu.tsx
// Mobile menu component for responsive navigation

import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Mobile Menu Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600 border-b border-primary-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-600 font-bold text-lg">Q</span>
              </div>
              <span className="text-white font-semibold text-xl">QC System</span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-700 transition-colors"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Simple Navigation for Mobile */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-2">
              {[
                { name: 'Dashboard', href: '/dashboard', icon: '📊' },
                { name: 'Users', href: '/users', icon: '👥', adminOnly: true },
                { name: 'Profile', href: '/profile', icon: '👤' },
                { name: 'Settings', href: '/settings', icon: '⚙️' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              QC System v2.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
