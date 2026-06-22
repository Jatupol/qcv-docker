// client/src/pages/admin/AuthLogPage.tsx
// Admin-only viewer for the login/logout audit log.
//
// Reads NDJSON files written by server/src/utils/authEventLogger.ts via
// /api/admin/auth-events. Supports filters for date range, username, and
// event type, plus simple pagination.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatDateTime } from '../../utils/formatUtils';
import adminAuthService, {
  type AuthEvent,
  type AuthEventType,
} from '../../services/adminAuthService';

interface Notice { type: 'success' | 'error' | 'warning' | 'info'; message: string; }

const ALL_TYPES: AuthEventType[] = [
  'login_success',
  'login_failed',
  'logout',
  'force_logout',
  'session_expired',
  'session_kicked',
];

const PAGE_SIZE = 50;

const AuthLogPage: React.FC = () => {
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);

  // Filters
  const [from, setFrom] = useState<string>(defaultFromDate());
  const [to, setTo] = useState<string>(nowForInput());
  const [username, setUsername] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<AuthEventType>>(new Set(ALL_TYPES));
  const [page, setPage] = useState(1);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);

    const types = Array.from(selectedTypes);
    const res = await adminAuthService.listAuthEvents({
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      username: username.trim() || undefined,
      type: types.length === ALL_TYPES.length ? undefined : types,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });

    setRefreshing(false);
    if (!silent) setLoading(false);

    if (res.success && res.data) {
      setEvents(res.data);
      setTotal(res.meta?.total ?? 0);
      setTruncated(!!res.meta?.truncated);
    } else {
      setError(res.message || 'Failed to load events');
      setEvents([]);
      setTotal(0);
    }
  }, [from, to, username, selectedTypes, page]);

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  const onApplyFilters = () => {
    setPage(1);
    void load();
  };

  const onResetFilters = () => {
    setFrom(defaultFromDate());
    setTo(nowForInput());
    setUsername('');
    setSelectedTypes(new Set(ALL_TYPES));
    setPage(1);
    setTimeout(() => void load(), 0);
  };

  const toggleType = (t: AuthEventType) => {
    const next = new Set(selectedTypes);
    if (next.has(t)) next.delete(t); else next.add(t);
    setSelectedTypes(next);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCsv = () => {
    if (events.length === 0) {
      setNotice({ type: 'warning', message: 'No events to export.' });
      return;
    }
    const header = ['ts', 'type', 'username', 'userId', 'sessionId', 'ip', 'reason', 'actor', 'userAgent'];
    const rows = events.map(e => header.map(k => csvCell((e as any)[k])).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-events-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {notice && (
        <Toast type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
      )}

      <Breadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'Login Logs' },
        ]}
      />

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DocumentTextIcon className="w-7 h-7" />
              Login &amp; Logout Logs
            </h1>
            <p className="text-white/90 mt-1 text-sm">
              Audit trail of every login, logout, force-logout and kicked session.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
              onClick={exportCsv}
              disabled={events.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={() => load()}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" /> Filters
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <Input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
              <Input
                type="text"
                placeholder="exact username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="primary" onClick={onApplyFilters}>Apply</Button>
              <Button variant="ghost" leftIcon={<XMarkIcon className="w-4 h-4" />} onClick={onResetFilters}>
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-gray-700 mb-2">Event types</div>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map(t => {
                const active = selectedTypes.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      active
                        ? typeBadgeClass(t)
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {labelForType(t)}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {truncated && (
        <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-2 rounded text-sm">
          The result was truncated for safety (large log range). Narrow the date range to see older events.
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Events
            <span className="ml-2 text-xs font-normal text-gray-500">
              {total.toLocaleString()} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="w-8 h-8" />
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={() => load()}>Retry</Button>
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              title="No events found"
              description="Try widening the date range or clearing filters."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>When</Th>
                      <Th>Type</Th>
                      <Th>User</Th>
                      <Th>IP</Th>
                      <Th>Reason</Th>
                      <Th>Actor</Th>
                      <Th>Session</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((e, i) => (
                      <tr key={`${e.ts}-${i}`} className="hover:bg-gray-50">
                        <Td className="text-gray-700 whitespace-nowrap">{formatDateTime(e.ts)}</Td>
                        <Td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${typeBadgeClass(e.type)}`}>
                            {labelForType(e.type)}
                          </span>
                        </Td>
                        <Td className="font-medium text-gray-900">{e.username || '—'}</Td>
                        <Td className="text-gray-600">{e.ip || '—'}</Td>
                        <Td className="text-gray-700">{e.reason || '—'}</Td>
                        <Td className="text-gray-700">{e.actor || '—'}</Td>
                        <Td className="text-xs font-mono text-gray-500" title={e.sessionId}>
                          {e.sessionId ? (e.sessionId.length > 14 ? `${e.sessionId.slice(0, 12)}…` : e.sessionId) : '—'}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages} · Showing {events.length} event(s)
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ===== helpers =====

function toInputValue(d: Date): string {
  // Format for <input type="datetime-local"> — local time, minute precision.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultFromDate(): string {
  // Beginning of today (local time).
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toInputValue(d);
}

function nowForInput(): string {
  return toInputValue(new Date());
}

function labelForType(t: AuthEventType): string {
  switch (t) {
    case 'login_success':   return 'Login OK';
    case 'login_failed':    return 'Login Failed';
    case 'logout':          return 'Logout';
    case 'force_logout':    return 'Force Logout';
    case 'session_expired': return 'Expired';
    case 'session_kicked':  return 'Kicked';
  }
}

function typeBadgeClass(t: AuthEventType): string {
  switch (t) {
    case 'login_success':   return 'bg-green-100 text-green-700 border-green-200';
    case 'login_failed':    return 'bg-red-100 text-red-700 border-red-200';
    case 'logout':          return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'force_logout':    return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'session_expired': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'session_kicked':  return 'bg-purple-100 text-purple-700 border-purple-200';
  }
}

function csvCell(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({
  children, className = '', title,
}) => (
  <td className={`px-4 py-3 text-sm ${className}`} title={title}>
    {children}
  </td>
);

export default AuthLogPage;
