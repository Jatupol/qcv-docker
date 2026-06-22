// client/src/pages/admin/AuditLogPage.tsx
// Admin-only viewer for the audit_log table (DELETE-event trail across business entities).
//
// Reads /api/admin/audit-log. Supports filters for entity, actor, date range,
// pagination, and a side drawer to inspect old_values JSON for any row.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  FunnelIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
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
import auditLogService, { type AuditLogEntry } from '../../services/auditLogService';

interface Notice { type: 'success' | 'error' | 'warning' | 'info'; message: string; }

const PAGE_SIZE = 50;

const AuditLogPage: React.FC = () => {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [total, setTotal] = useState(0);

  // Filters
  const [from, setFrom] = useState<string>(defaultFromDate());
  const [to, setTo] = useState<string>(nowForInput());
  const [entity, setEntity] = useState<string>('');
  const [actor, setActor] = useState<string>('');
  const [page, setPage] = useState(1);

  // Drawer
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);

    const actorIdNum = actor.trim() ? Number(actor.trim()) : undefined;
    const res = await auditLogService.listAuditLog({
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      entity: entity || undefined,
      actorUserId: !Number.isNaN(actorIdNum) ? actorIdNum : undefined,
      page,
      pageSize: PAGE_SIZE,
    } as any);

    setRefreshing(false);
    if (!silent) setLoading(false);

    if (res.success && res.data) {
      setRows(res.data);
      setTotal(res.meta?.total ?? 0);
    } else {
      setError(res.message || 'Failed to load audit log');
      setRows([]);
      setTotal(0);
    }
  }, [from, to, entity, actor, page]);

  // Load entity dropdown values once
  useEffect(() => {
    void (async () => {
      const res = await auditLogService.listEntities();
      if (res.success && res.data) setEntities(res.data);
    })();
  }, []);

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  const onApplyFilters = () => {
    setPage(1);
    void load();
  };

  const onResetFilters = () => {
    setFrom(defaultFromDate());
    setTo(nowForInput());
    setEntity('');
    setActor('');
    setPage(1);
    setTimeout(() => void load(), 0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCsv = () => {
    if (rows.length === 0) {
      setNotice({ type: 'warning', message: 'No rows to export.' });
      return;
    }
    const header = ['createdAt', 'action', 'entity', 'recordId', 'actorUsername', 'actorRole', 'ipAddress', 'reason'];
    const csvRows = rows.map(r => header.map(k => csvCell((r as any)[k])).join(','));
    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
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
          { label: 'Audit Log' },
        ]}
      />

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheckIcon className="w-7 h-7" />
              Audit Log — Data Deletions
            </h1>
            <p className="text-white/90 mt-1 text-sm">
              Forensic trail of every DELETE across business data (defects, inspections, parts, users, etc.).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
              onClick={exportCsv}
              disabled={rows.length === 0}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Entity</label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All entities</option>
                {entities.map(en => (
                  <option key={en} value={en}>{en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Actor user ID</label>
              <Input
                type="number"
                placeholder="user id"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="primary" onClick={onApplyFilters}>Apply</Button>
              <Button variant="ghost" leftIcon={<XMarkIcon className="w-4 h-4" />} onClick={onResetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          ) : rows.length === 0 ? (
            <EmptyState
              title="No audit events"
              description="No deletions match the current filters."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>When</Th>
                      <Th>Action</Th>
                      <Th>Entity</Th>
                      <Th>Record</Th>
                      <Th>Actor</Th>
                      <Th>Role</Th>
                      <Th>IP</Th>
                      <Th>Reason</Th>
                      <Th>&nbsp;</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <Td className="text-gray-700 whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
                        <Td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${actionBadgeClass(r.action)}`}>
                            {r.action}
                          </span>
                        </Td>
                        <Td className="font-medium text-gray-900">{r.entity}</Td>
                        <Td className="font-mono text-xs text-gray-600">{r.recordId}</Td>
                        <Td className="text-gray-700">{r.actorUsername || (r.actorUserId ? `#${r.actorUserId}` : '—')}</Td>
                        <Td className="text-gray-600">{r.actorRole || '—'}</Td>
                        <Td className="text-gray-600">{r.ipAddress || '—'}</Td>
                        <Td className="text-gray-700">{r.reason || '—'}</Td>
                        <Td>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<EyeIcon className="w-4 h-4" />}
                            onClick={() => setSelected(r)}
                          >
                            View
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages} · Showing {rows.length} event(s)
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

      {/* Drawer-style detail panel */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-40 flex justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl bg-white h-full shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Audit event #{selected.id}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.action} on <span className="font-medium">{selected.entity}</span> · record{' '}
                  <span className="font-mono">{selected.recordId}</span>
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <DetailRow label="When">{formatDateTime(selected.createdAt)}</DetailRow>
              <DetailRow label="Actor">
                {selected.actorUsername || '—'}
                {selected.actorUserId != null && (
                  <span className="ml-2 text-xs text-gray-500">(id #{selected.actorUserId})</span>
                )}
              </DetailRow>
              <DetailRow label="Role">{selected.actorRole || '—'}</DetailRow>
              <DetailRow label="IP">{selected.ipAddress || '—'}</DetailRow>
              <DetailRow label="User agent">
                <span className="text-xs break-all">{selected.userAgent || '—'}</span>
              </DetailRow>
              <DetailRow label="Reason">{selected.reason || '—'}</DetailRow>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Old values (pre-delete snapshot)</div>
                <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto max-h-96">
                  {selected.oldValues ? JSON.stringify(selected.oldValues, null, 2) : '—'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== helpers =====

function toInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return toInputValue(d);
}

function nowForInput(): string {
  return toInputValue(new Date());
}

function actionBadgeClass(action: string): string {
  switch (action) {
    case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
    case 'CREATE': return 'bg-green-100 text-green-700 border-green-200';
    case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
    default:       return 'bg-gray-100 text-gray-700 border-gray-200';
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

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
    <div className="text-xs font-medium text-gray-500 sm:w-28 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

export default AuditLogPage;
