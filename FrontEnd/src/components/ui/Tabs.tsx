// src/components/ui/Tabs.tsx
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Card from './Card';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="border-b border-border-light">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

// Settings Page Component
const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    reports: true,
  });

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      content: (
        <Card title="Profile Information" subtitle="Update your personal information">
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">JD</span>
              </div>
              <div>
                <Button size="sm" variant="outline">Change Photo</Button>
                <p className="text-xs text-text-secondary mt-2">JPG, PNG or GIF (max. 2MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={profile.firstName}
                onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
              />
              <Input
                label="Last Name"
                value={profile.lastName}
                onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="pt-4 border-t border-border-light">
              <Button>Save Changes</Button>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      content: (
        <Card title="Notification Preferences" subtitle="Choose how you want to be notified">
          <div className="space-y-6">
            {[
              { key: 'email', label: 'Email notifications', description: 'Get notified via email for important updates' },
              { key: 'push', label: 'Push notifications', description: 'Receive push notifications in your browser' },
              { key: 'sms', label: 'SMS notifications', description: 'Get text messages for critical alerts' },
              { key: 'reports', label: 'Weekly reports', description: 'Receive weekly summary reports via email' },
            ].map((option) => (
              <div key={option.key} className="flex items-center justify-between p-4 border border-border-light rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-text-primary">{option.label}</h4>
                  <p className="text-sm text-text-secondary">{option.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[option.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [option.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}

            <div className="pt-4 border-t border-border-light">
              <Button>Save Preferences</Button>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <Card title="" subtitle="Update your account password">
            <div className="space-y-4">
              <Input label="Current Password" type="password" />
              <Input label="New Password" type="password" />
              <Input label="Confirm New Password" type="password" />
              <div className="pt-2">
                <Button>Update Password</Button>
              </div>
            </div>
          </Card>

          <Card title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-text-primary">Two-Factor Authentication</h4>
                <p className="text-sm text-text-secondary">Secure your account with 2FA</p>
              </div>
              <Button size="sm" variant="outline">Enable 2FA</Button>
            </div>
          </Card>

          <Card title="Active Sessions" subtitle="Manage your active login sessions">
            <div className="space-y-3">
              {[
                { device: 'MacBook Pro', location: 'New York, NY', current: true },
                { device: 'iPhone 12', location: 'New York, NY', current: false },
                { device: 'Chrome Browser', location: 'Boston, MA', current: false },
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {session.device} {session.current && <span className="text-xs text-primary-600">(Current)</span>}
                      </p>
                      <p className="text-xs text-text-secondary">{session.location}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button size="sm" variant="outline">Revoke</Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="mt-2 text-text-secondary">Manage your account settings and preferences</p>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
};

export default SettingsPage;