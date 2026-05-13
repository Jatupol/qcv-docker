// client/src/pages/admin/PurgePoliciesPage.tsx
// Admin-only configuration page for per-target purge policies.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  PlayIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CircleStackIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  XMarkIcon,
  LockClosedIcon,
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
import purgePolicyService, {
  type PurgePolicy,
  type PurgeStatus,
  type PurgeTargetType,
  type AllowedTable,
} from '../../services/purgePolicyService';

interface Notice { type: 'success' | 'error' | 'warning' | 'info'; message: string; }

interface RowDraft {
  retention_days: number;
  enabled: boolean;
  dirty: boolean;
}

const PurgePoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<PurgePolicy[]>([]);
  const [status, setStatus] = useState<PurgeStatus | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Per-row pending action (so spinners stay isolated)
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pendingRun, setPendingRun] = useState<PurgePolicy | null>(null);
  const [pendingRunAll, setPendingRunAll] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PurgePolicy | null>(null);

  // Add-policy modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [allowedTables, setAllowedTables] = useState<AllowedTable[]>([]);
  const [addForm, setAddForm] = useState<{ tableIndex: number; targetKey: string; label: string; retentionDays: number }>({
    tableIndex: -1, targetKey: '', label: '', retentionDays: 90,
  });
  const [addBusy, setAddBusy] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);

    const [policiesRes, statusRes, allowedRes] = await Promise.all([
      purgePolicyService.listPolicies(),
      purgePolicyService.getStatus(),
      purgePolicyService.listAllowedTables(),
    ]);

    setRefreshing(false);
    if (!silent) setLoading(false);

    if (policiesRes.success && policiesRes.data) {
      setPolicies(policiesRes.data);
      // Reset drafts to match server state
      const next: Record<string, RowDraft> = {};
      for (const p of policiesRes.data) {
        next[p.target_key] = { retention_days: p.retention_days, enabled: p.enabled, dirty: false };
      }
      setDrafts(next);
    } else {
      setError(policiesRes.message || 'Failed to load policies');
    }

    if (statusRes.success && statusRes.data) setStatus(statusRes.data);
    if (allowedRes.success && allowedRes.data) setAllowedTables(allowedRes.data);
  }, []);

  const openAddModal = () => {
    setAddForm({ tableIndex: -1, targetKey: '', label: '', retentionDays: 90 });
    setShowAddModal(true);
  };

  const onPickTable = (idx: number) => {
    const t = allowedTables[idx];
    if (!t) return;
    setAddForm(f => ({
      ...f,
      tableIndex: idx,
      // suggest target_key = table name; admin can override but rarely needs to
      targetKey: t.tableName,
      label: t.label,
    }));
  };

  const handleCreatePolicy = async () => {
    const t = allowedTables[addForm.tableIndex];
    if (!t) {
      setNotice({ type: 'error', message: 'Select a table from the list.' });
      return;
    }
    if (!/^[a-z][a-z0-9_]{0,49}$/.test(addForm.targetKey)) {
      setNotice({ type: 'error', message: 'target_key must start with a lowercase letter, contain only lowercase letters/digits/underscore, and be ≤50 chars.' });
      return;
    }
    if (!Number.isInteger(addForm.retentionDays) || addForm.retentionDays < 1) {
      setNotice({ type: 'error', message: 'Retention days must be an integer ≥ 1.' });
      return;
    }
    setAddBusy(true);
    const res = await purgePolicyService.createPolicy({
      target_key: addForm.targetKey,
      label: addForm.label || t.label,
      db_table_name: t.tableName,
      db_timestamp_column: t.timestampColumn,
      retention_days: addForm.retentionDays,
      enabled: true,
    });
    setAddBusy(false);
    if (res.success && res.data) {
      setNotice({ type: 'success', message: `Policy "${res.data.label}" created.` });
      setShowAddModal(false);
      void load(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Create failed' });
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusyKey(pendingDelete.target_key);
    const res = await purgePolicyService.deletePolicy(pendingDelete.target_key);
    setBusyKey(null);
    setPendingDelete(null);
    if (res.success) {
      setNotice({ type: 'success', message: `Policy "${pendingDelete.label}" deleted.` });
      void load(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Delete failed' });
    }
  };

  useEffect(() => { void load(); }, [load]);

  const setDraft = (key: string, patch: Partial<RowDraft>) => {
    setDrafts(prev => {
      const cur = prev[key] || { retention_days: 0, enabled: true, dirty: false };
      return { ...prev, [key]: { ...cur, ...patch, dirty: true } };
    });
  };

  const handleSave = async (p: PurgePolicy) => {
    const draft = drafts[p.target_key];
    if (!draft || !draft.dirty) return;
    if (!Number.isInteger(draft.retention_days) || draft.retention_days < 1) {
      setNotice({ type: 'error', message: 'Retention days must be an integer >= 1.' });
      return;
    }
    setBusyKey(p.target_key);
    const res = await purgePolicyService.updatePolicy(p.target_key, {
      retention_days: draft.retention_days,
      enabled: draft.enabled,
    });
    setBusyKey(null);
    if (res.success) {
      setNotice({ type: 'success', message: `Saved "${p.label}"` });
      void load(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Save failed' });
    }
  };

  const handleDryRun = async (p: PurgePolicy) => {
    setBusyKey(p.target_key);
    const res = await purgePolicyService.dryRun(p.target_key);
    setBusyKey(null);
    if (res.success && res.data) {
      setNotice({
        type: 'info',
        message: `Dry run "${p.label}": ${res.data.wouldRemove} item(s) would be removed (retention ${res.data.retentionDays}d).`,
      });
      void load(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Dry run failed' });
    }
  };

  const handleRunOne = async () => {
    if (!pendingRun) return;
    setBusyKey(pendingRun.target_key);
    const res = await purgePolicyService.runOne(pendingRun.target_key);
    setBusyKey(null);
    setPendingRun(null);
    if (res.success && res.data) {
      setNotice({ type: 'success', message: `Removed ${res.data.removed} item(s) for "${pendingRun.label}".` });
      void load(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Run failed' });
    }
  };

  const handleRunAll = async () => {
    setBusyKey('__all__');
    const res = await purgePolicyService.runAll();
    setBusyKey(null);
    setPendingRunAll(false);
    if (res.success && res.data) {
      setNotice({ type: 'success', message: `Run all complete — ${res.data.totalRemoved} item(s) removed across ${res.data.results.length} target(s).` });
      void load(true);
    } else {
      setNotice({ type: 'error', message: res.message || 'Run all failed' });
    }
  };

  const totalEnabled = useMemo(() => policies.filter(p => p.enabled).length, [policies]);

  return (
    <div className="p-6 space-y-6">
      {notice && <Toast type={notice.type} message={notice.message} onClose={() => setNotice(null)} />}

      <Breadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'Purge Policies' },
        ]}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrashIcon className="w-7 h-7" />
              Purge Policies
            </h1>
            <p className="text-white/90 mt-1 text-sm">
              Configure per-target retention. Old data is removed daily based on each policy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={() => load()}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="success"
              size="sm"
              leftIcon={<PlusIcon className="w-4 h-4" />}
              onClick={openAddModal}
            >
              Add Policy
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<PlayIcon className="w-4 h-4" />}
              onClick={() => setPendingRunAll(true)}
              disabled={totalEnabled === 0}
            >
              Run All Enabled
            </Button>
          </div>
        </div>
      </div>

      {/* Scheduler status */}
      {status && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat label="Scheduler" value={status.isEnabled ? 'Enabled' : 'Disabled'} valueColor={status.isEnabled ? 'text-green-600' : 'text-red-600'} />
              <Stat label="Schedule" value={`${status.cronExpression}`} hint={status.timezone} />
              <Stat label="Started At" value={formatDateTime(status.startedAt)} />
              <Stat label="Last Full Run" value={formatDateTime(status.lastRunAt)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Policies <span className="ml-2 text-xs font-normal text-gray-500">{policies.length} target(s)</span>
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
          ) : policies.length === 0 ? (
            <EmptyState
              title="No purge policies"
              description="No policies are registered. Restart the server to seed the default targets."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Target</Th>
                    <Th>Type</Th>
                    <Th>Retention (days)</Th>
                    <Th>Enabled</Th>
                    <Th>Last Run</Th>
                    <Th>Last Dry Run</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policies.map(p => {
                    const draft = drafts[p.target_key];
                    const isBusy = busyKey === p.target_key;
                    return (
                      <tr key={p.target_key} className="hover:bg-gray-50">
                        <Td>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-1">
                              {p.label}
                              {p.is_builtin && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200" title="Built-in target — cannot be deleted">
                                  <LockClosedIcon className="w-3 h-3" /> built-in
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {p.target_key}
                              {p.db_table_name && (
                                <span className="ml-1 text-gray-400">→ {p.db_table_name}.{p.db_timestamp_column}</span>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td><TypeBadge type={p.target_type} /></Td>
                        <Td>
                          <Input
                            type="number"
                            min={1}
                            value={draft?.retention_days ?? p.retention_days}
                            onChange={(e) => setDraft(p.target_key, { retention_days: parseInt(e.target.value || '0', 10) })}
                            className="w-24"
                          />
                        </Td>
                        <Td>
                          {(() => {
                            const isOn = draft?.enabled ?? p.enabled;
                            return (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isOn}
                                  aria-label={`Toggle ${p.label}`}
                                  onClick={() => setDraft(p.target_key, { enabled: !isOn })}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                    isOn ? 'bg-primary-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isOn ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className={`text-xs font-medium ${isOn ? 'text-green-700' : 'text-gray-500'}`}>
                                  {isOn ? 'On' : 'Off'}
                                </span>
                              </div>
                            );
                          })()}
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-700">{formatDateTime(p.last_run_at)}</div>
                          <div className="text-xs text-gray-500">{p.last_removed_count} removed</div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-700">{formatDateTime(p.last_dry_run_at)}</div>
                          <div className="text-xs text-gray-500">{p.last_dry_run_count} would remove</div>
                        </Td>
                        <Td align="right">
                          <div className="flex items-center justify-end gap-1">
                            {draft?.dirty && (
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => handleSave(p)}
                                isLoading={isBusy}
                              >
                                Save
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="xs"
                              leftIcon={<EyeIcon className="w-3 h-3" />}
                              onClick={() => handleDryRun(p)}
                              isLoading={isBusy}
                              disabled={draft?.dirty}
                              title={draft?.dirty ? 'Save first, then dry-run' : ''}
                            >
                              Dry Run
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              leftIcon={<PlayIcon className="w-3 h-3" />}
                              onClick={() => setPendingRun(p)}
                              disabled={isBusy || draft?.dirty || !p.enabled}
                              title={
                                !p.enabled ? 'Enable first' :
                                draft?.dirty ? 'Save first, then run' : ''
                              }
                            >
                              Run Now
                            </Button>
                            {!p.is_builtin && (
                              <Button
                                variant="ghost"
                                size="xs"
                                leftIcon={<TrashIcon className="w-3 h-3" />}
                                onClick={() => setPendingDelete(p)}
                                disabled={isBusy}
                                title="Delete this policy"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run-one confirm */}
      <Modal
        isOpen={!!pendingRun}
        onClose={() => busyKey === null && setPendingRun(null)}
        title="Run purge now?"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This will permanently remove items older than{' '}
            <strong>{pendingRun?.retention_days} day(s)</strong> for{' '}
            <strong>{pendingRun?.label}</strong>.
            {pendingRun?.last_dry_run_at && (
              <>
                {' '}Last dry run on {formatDateTime(pendingRun.last_dry_run_at)} reported{' '}
                <strong>{pendingRun.last_dry_run_count}</strong> item(s).
              </>
            )}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingRun(null)} disabled={busyKey !== null}>Cancel</Button>
            <Button variant="danger" onClick={handleRunOne} isLoading={busyKey === pendingRun?.target_key}>Run</Button>
          </div>
        </div>
      </Modal>

      {/* Run-all confirm */}
      <Modal
        isOpen={pendingRunAll}
        onClose={() => busyKey === null && setPendingRunAll(false)}
        title="Run all enabled policies?"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This will execute every <strong>enabled</strong> purge policy ({totalEnabled} target(s)) sequentially.
            Items older than each policy's retention will be removed permanently.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingRunAll(false)} disabled={busyKey !== null}>Cancel</Button>
            <Button variant="danger" onClick={handleRunAll} isLoading={busyKey === '__all__'}>Run All</Button>
          </div>
        </div>
      </Modal>

      {/* Add policy modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => !addBusy && setShowAddModal(false)}
        title="Add purge policy"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pick a table from the allowed list. The engine will delete rows where the
            timestamp column is older than the retention you set.
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Table</label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
              value={addForm.tableIndex}
              onChange={(e) => onPickTable(parseInt(e.target.value, 10))}
            >
              <option value={-1}>— Select a table —</option>
              {allowedTables.map((t, idx) => (
                <option key={t.tableName} value={idx} disabled={t.alreadyConfigured}>
                  {t.label} ({t.tableName}.{t.timestampColumn}){t.alreadyConfigured ? ' — already configured' : ''}
                </option>
              ))}
            </select>
            {allowedTables.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No allowed tables available. Contact dev team to extend the whitelist.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target key</label>
              <Input
                type="text"
                value={addForm.targetKey}
                onChange={(e) => setAddForm(f => ({ ...f, targetKey: e.target.value.toLowerCase() }))}
                placeholder="auto-filled from table name"
              />
              <p className="text-[11px] text-gray-500 mt-1">lowercase, letters/digits/underscore, ≤50 chars</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Retention (days)</label>
              <Input
                type="number"
                min={1}
                value={addForm.retentionDays}
                onChange={(e) => setAddForm(f => ({ ...f, retentionDays: parseInt(e.target.value || '0', 10) }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label (display name)</label>
            <Input
              type="text"
              value={addForm.label}
              onChange={(e) => setAddForm(f => ({ ...f, label: e.target.value }))}
              placeholder="auto-filled from table"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={addBusy} leftIcon={<XMarkIcon className="w-4 h-4" />}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreatePolicy} isLoading={addBusy} disabled={addForm.tableIndex < 0}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!pendingDelete}
        onClose={() => busyKey === null && setPendingDelete(null)}
        title="Delete policy?"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Remove the policy <strong>{pendingDelete?.label}</strong> ({pendingDelete?.target_key})?
            This deletes the configuration only — no data is purged.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={busyKey !== null}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={busyKey === pendingDelete?.target_key}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ===== helpers =====

const Stat: React.FC<{ label: string; value: React.ReactNode; valueColor?: string; hint?: string }> = ({
  label, value, valueColor = 'text-gray-900', hint,
}) => (
  <div>
    <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    <div className={`text-base font-semibold ${valueColor}`}>{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
  </div>
);

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
  <th className={`px-4 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
  <td className={`px-4 py-3 text-sm text-${align}`}>{children}</td>
);

const TypeBadge: React.FC<{ type: PurgeTargetType }> = ({ type }) => {
  if (type === 'file') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        <DocumentDuplicateIcon className="w-3 h-3" /> File
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
      <CircleStackIcon className="w-3 h-3" /> DB Table
    </span>
  );
};

export default PurgePoliciesPage;
