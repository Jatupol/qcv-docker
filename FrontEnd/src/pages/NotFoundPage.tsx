// ===================================
// client/src/pages/NotFoundPage.tsx
// 404 error page

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          
          <Button variant="outline" size="lg" className="w-full" onClick={() => history.back()}>
            Go Back
          </Button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-sm text-text-secondary mb-4">
            Need help? Try these options:
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 hover:underline">
              Dashboard
            </Link>
            <Link to="/settings" className="text-primary-600 hover:text-primary-700 hover:underline">
              Settings
            </Link>
            <button className="text-primary-600 hover:text-primary-700 hover:underline">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;