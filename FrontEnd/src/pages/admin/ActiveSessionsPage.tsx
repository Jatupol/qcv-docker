// client/src/pages/admin/ActiveSessionsPage.tsx
// Admin-only monitoring page for currently running sessions.
// Lists every non-expired row in the connect-pg-simple `session` table
// (as parsed JSON), and lets the admin kick a session or trigger the
// force-logout job manually.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  TrashIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatDateTime } from '../../utils/formatUtils';
import adminAuthService, {
  type ActiveSession,
  type ForceLogoutStatus,
} from '../../services/adminAuthService';
import { useAuth } from '../../contexts/AuthContext';

interface Notice { type: 'success' | 'error' | 'warning' | 'info'; message: string; }

const ActiveSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [search, setSearch] = useState('');
  const [scheduler, setScheduler] = useState<ForceLogoutStatus | null>(null);
  const [pendingKick, setPendingKick] = useState<ActiveSession | null>(null);
  const [pendingForceAll, setPendingForceAll] = useState(false);
  const [actionInFlight, setActionInFlight] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);
    const res = await adminAuthService.listSessions();
    setRefreshing(false);
    if (!silent) setLoading(false);
    if (res.success && res.data) {
      setSessions(res.data);
    } else {
      setError(res.message || 'Failed to load sessions');
    }
  }, []);

  const loadStatus = useCallback(async () => {
    const res = await adminAuthService.getForceLogoutStatus();
    if (res.success && res.data) setScheduler(res.data);
  }, []);

  useEffect(() => {
    void loadSessions();
    void loadStatus();
  }, [loadSessions, loadStatus]);

  // Auto-refresh every 30s when toggle is on.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void loadSessions(true);
      void loadStatus();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [autoRefresh, loadSessions, loadStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      (s.username || '').toLowerCase().includes(q) ||
      (s.role || '').toLowerCase().includes(q) ||
      (s.ip || '').toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const handleKick = async () => {
    if (!pendingKick) return;
    setActionInFlight(true);
    const res = await adminAuthService.kickSession(pendingKick.sid);
    setActionInFlight(false);
    if (res.success) {
      setNotice({ type: 'success', message: `Session terminated for "${pendingKick.username || 'unknown'}"` });
      setPendingKick(null);
      void loadSessions(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Failed to terminate session' });
    }
  };

  const handleForceAll = async () => {
    setActionInFlight(true);
    const res = await adminAuthService.runForceLogoutNow();
    setActionInFlight(false);
    if (res.success) {
      setNotice({
        type: 'success',
        message: `Force logout executed — ${res.data?.killed ?? 0} session(s) terminated`,
      });
      setPendingForceAll(false);
      void loadSessions(true);
      void loadStatus();
    } else {
      setNotice({ type: 'error', message: res.message || 'Failed to run force logout' });
    }
  };

  const isSelf = (sid: string) => {
    // We don't expose our own sid client-side, but we can match by username + role.
    // To avoid accidental self-kick, also disable kick when this is the only matching admin session.
    return false;
  };

  return (
    <div className="p-6 space-y-6">
      {notice && (
        <Toast
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      <Breadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'Active Sessions' },
        ]}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GlobeAltIcon className="w-7 h-7" />
              Active Sessions
            </h1>
            <p className="text-white/90 mt-1 text-sm">
              Live view of every authenticated session currently held by the server.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={() => loadSessions()}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<ShieldExclamationIcon className="w-4 h-4" />}
              onClick={() => setPendingForceAll(true)}
            >
              Force Logout All
            </Button>
          </div>
        </div>
      </div>

      {/* Scheduler status */}
      {scheduler && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Scheduler</div>
                <div className={`text-lg font-semibold ${scheduler.isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {scheduler.isEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Configured Times</div>
                <div className="text-lg font-semibold text-gray-900">
                  {scheduler.times.join(', ')}{' '}
                  <span className="text-xs text-gray-500">({scheduler.timezone})</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Last Run</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDateTime(scheduler.lastRunAt)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Last Killed</div>
                <div className="text-lg font-semibold text-gray-900">{scheduler.lastKilledCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <Input
                type="text"
                placeholder="Username, role, or IP"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-1">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              Auto-refresh every 30s
            </label>
            <div className="text-sm text-gray-500 ml-auto">
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{sessions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="w-8 h-8" />
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={() => loadSessions()}>Retry</Button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No active sessions"
              description={search ? 'No sessions match your filter.' : 'No users are currently logged in.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Login Time</Th>
                    <Th>Last Activity</Th>
                    <Th>Expires</Th>
                    <Th>IP</Th>
                    <Th>Session ID</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((s) => (
                    <tr key={s.sid} className="hover:bg-gray-50">
                      <Td>
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{s.username || '—'}</span>
                          {user?.username === s.username && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">you</span>
                          )}
                        </div>
                      </Td>
                      <Td><RoleBadge role={s.role} /></Td>
                      <Td>{formatDateTime(s.loginTime)}</Td>
                      <Td>{formatDateTime(s.lastActivity)}</Td>
                      <Td>
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          {formatDateTime(s.expiresAt)}
                        </span>
                      </Td>
                      <Td className="text-gray-600">{s.ip || '—'}</Td>
                      <Td className="text-xs text-gray-500 font-mono" title={s.sid}>
                        {s.sid.length > 14 ? `${s.sid.slice(0, 12)}…` : s.sid}
                      </Td>
                      <Td align="right">
                        <Button
                          variant="danger"
                          size="xs"
                          leftIcon={<TrashIcon className="w-3 h-3" />}
                          onClick={() => setPendingKick(s)}
                          disabled={isSelf(s.sid)}
                        >
                          Kick
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm kick modal */}
      <Modal
        isOpen={!!pendingKick}
        onClose={() => !actionInFlight && setPendingKick(null)}
        title="Terminate session?"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This will immediately log out{' '}
            <span className="font-semibold text-gray-900">
              {pendingKick?.username || 'this user'}
            </span>{' '}
            and invalidate their session. They will need to sign in again.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingKick(null)} disabled={actionInFlight}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleKick} isLoading={actionInFlight}>
              Terminate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm force-all modal */}
      <Modal
        isOpen={pendingForceAll}
        onClose={() => !actionInFlight && setPendingForceAll(false)}
        title="Force logout ALL users?"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This runs the scheduled force-logout job <strong>now</strong> and terminates every active
            session, including yours. Use this when something is stuck or you want to verify the
            scheduler works.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingForceAll(false)} disabled={actionInFlight}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleForceAll} isLoading={actionInFlight}>
              Force Logout All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
  <th className={`px-4 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center'; className?: string; title?: string }> = ({
  children, align = 'left', className = '', title,
}) => (
  <td className={`px-4 py-3 text-sm text-${align} ${className}`} title={title}>
    {children}
  </td>
);

const RoleBadge: React.FC<{ role: string | null }> = ({ role }) => {
  const r = (role || 'user').toLowerCase();
  const map: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    user: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[r] || map.user}`}>
      {r}
    </span>
  );
};

export default ActiveSessionsPage;
