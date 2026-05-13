// client/src/pages/NewsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  NewspaperIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import sysconfigService from '../services/sysconfigService';
import Toast from '../components/ui/Toast';
import { soundNotification } from '../utils/soundNotification';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<string>('');
  const [originalNews, setOriginalNews] = useState<string>('');
  const [sysconfigId, setSysconfigId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });

  // Load news content
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await sysconfigService.getSysconfig();
      setSysconfigId(config.id);
      setNews(config.news || '');
      setOriginalNews(config.news || '');
    } catch (err) {
      console.error('Error loading news:', err);
      soundNotification.play('error');
      setError(err instanceof Error ? err.message : 'Failed to load news');
      showToast('Failed to load news content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNews(originalNews);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!sysconfigId) {
      soundNotification.play('error');
      showToast('Configuration ID not found', 'error');
      return;
    }

    try {
      setSaving(true);
      console.log('Updating news for sysconfig ID:', sysconfigId);
      console.log('News content:', news);

      const response = await sysconfigService.updateSysconfig(sysconfigId, { news });
      console.log('Update response:', response);

      if (response.success) {
        soundNotification.play('success');
        setOriginalNews(news);
        setIsEditing(false);
        showToast('News updated successfully', 'success');
      } else {
        console.error('Update failed:', response);
        soundNotification.play('error');
        showToast(response.message || 'Failed to update news', 'error');
      }
    } catch (err) {
      console.error('Error saving news:', err);
      soundNotification.play('error');
      showToast(err instanceof Error ? err.message : 'Failed to save news', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ show: true, message, type });
  };

  const hasChanges = news !== originalNews;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mx-auto" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '3px' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <NewspaperIcon className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl mb-6 overflow-hidden border-2 border-transparent bg-clip-padding" style={{ backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}>
          <div className="px-6 py-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-2xl blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                    <NewspaperIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                    News Management
                  </h1>
                  <p className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mt-1">
                    Manage system news and announcements
                  </p>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="relative inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
                >
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Edit News
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center px-5 py-2.5 border-2 border-gray-300 rounded-xl shadow-md text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Banner */}
          {isEditing && hasChanges && (
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-l-4 border-gradient-to-b from-yellow-400 to-orange-400 px-6 py-4 shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-50 animate-pulse"></div>
                    <ExclamationTriangleIcon className="relative h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold bg-gradient-to-r from-yellow-800 to-orange-800 bg-clip-text text-transparent">
                    You have unsaved changes. Click "Save Changes" to apply your updates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-5 mb-6 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-400 rounded-full blur opacity-50 animate-pulse"></div>
                  <ExclamationTriangleIcon className="relative h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Error</h3>
                <p className="text-sm text-red-700 mt-1 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* News Content Editor */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border-2 border-transparent bg-clip-padding" style={{ backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}>
          <div className="px-6 py-5 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-b-2 border-transparent" style={{ borderImage: 'linear-gradient(to right, #a855f7, #ec4899, #f97316) 1' }}>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">News Content</h2>
            <p className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mt-1">
              {isEditing
                ? 'Edit the news content below. You can use plain text or add formatting.'
                : 'Current news content displayed to users.'}
            </p>
          </div>

          <div className="px-6 py-5">
            {isEditing ? (
              <div>
                <label htmlFor="news-editor" className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  News Text
                </label>
                <textarea
                  id="news-editor"
                  rows={15}
                  value={news}
                  onChange={(e) => setNews(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl shadow-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm transition-all duration-200 bg-gradient-to-br from-white to-purple-50"
                  placeholder="Enter news content here..."
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Character count: {news.length}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {news ? (
                  <div className="prose max-w-none">
                    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-6 border-2 border-purple-200 shadow-inner">
                      <pre className="whitespace-pre-wrap font-sans text-gray-900">{news}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-50"></div>
                      <InformationCircleIcon className="relative mx-auto h-12 w-12 text-purple-500" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">No news content</h3>
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      Click "Edit News" to add content.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-50"></div>
                <InformationCircleIcon className="relative h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm">
              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Tips:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium">
                <li>Keep news content concise and clear</li>
                <li>Use line breaks to separate different announcements</li>
                <li>Include dates for time-sensitive information</li>
                <li>Review content before saving</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default NewsPage;
 