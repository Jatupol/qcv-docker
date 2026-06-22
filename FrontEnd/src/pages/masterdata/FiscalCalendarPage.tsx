// client/src/pages/masterdata/FiscalCalendarPage.tsx
// Seagate Financial Calendar - Read-only calendar visualization

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Spin, Alert, Modal, Input, InputNumber, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchFiscalCalendar, updateYearMonth, generateFiscalYear } from '../../services/fiscalCalendarService';
import { getCurrentFiscalYear } from '@qcv/shared';
import type {
  FiscalCalendarRecord,
  CalendarWeekRow,
  MonthCalendar,
  QuarterData,
  CalendarDay,
} from '../../types/fiscal-calendar';

// ==================== HELPERS ====================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['S', 'S', 'M', 'T', 'W', 'T', 'F'];

// Quarter accent colors
const QUARTER_COLORS: Record<string, { bg: string; border: string; headerBg: string; text: string }> = {
  FQ1: { bg: '#e8f5e9', border: '#43a047', headerBg: '#2e7d32', text: '#1b5e20' },
  FQ2: { bg: '#fff3e0', border: '#fb8c00', headerBg: '#e65100', text: '#bf360c' },
  FQ3: { bg: '#e3f2fd', border: '#1e88e5', headerBg: '#1565c0', text: '#0d47a1' },
  FQ4: { bg: '#fce4ec', border: '#e53935', headerBg: '#c62828', text: '#b71c1c' },
};

function buildLookup(records: FiscalCalendarRecord[]): Map<string, FiscalCalendarRecord> {
  const map = new Map<string, FiscalCalendarRecord>();
  for (const r of records) {
    map.set(r.calendar_date.slice(0, 10), r);
  }
  return map;
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return fmtDate(new Date());
}

/**
 * Build a month grid driven by the fiscal `yearmonth` field.
 * E.g. for July 2025 (targetYM = '2507'), any date whose record has
 * yearmonth='2507' is treated as "current month" — even if the actual
 * calendar date is June 28-30.  Weeks are included if at least one
 * of their 7 days carries the target yearmonth.
 */
function buildMonthCalendar(
  year: number,
  month: number,
  lookup: Map<string, FiscalCalendarRecord>,
  todayKey: string,
): MonthCalendar {
  // Target yearmonth for this grid (e.g. 2025, July → '2507')
  const yy = String(year % 100).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  const targetYM = `${yy}${mm}`;

  // Collect all dates whose fiscal yearmonth matches
  const matchingDates: Date[] = [];
  for (const [dateKey, rec] of lookup.entries()) {
    if (rec.yearmonth === targetYM) {
      const [y, m, d] = dateKey.split('-').map(Number);
      matchingDates.push(new Date(y, m - 1, d));
    }
  }

  // Fallback: if no fiscal data, use original calendar-month logic
  if (matchingDates.length === 0) {
    return buildMonthCalendarFallback(year, month, lookup, todayKey);
  }

  matchingDates.sort((a, b) => a.getTime() - b.getTime());

  // Find unique Saturdays (fiscal-week starts) that cover these dates
  const satSet = new Set<number>();
  for (const d of matchingDates) {
    const dow = d.getDay();
    const sat = new Date(d);
    sat.setDate(sat.getDate() - (dow === 6 ? 0 : dow + 1));
    satSet.add(sat.getTime());
  }
  const saturdays = Array.from(satSet).sort((a, b) => a - b);

  // Build one week row per Saturday
  const weeks: CalendarWeekRow[] = [];
  for (const satTime of saturdays) {
    const cursor = new Date(satTime);
    const days = [];
    let satFw: string | null = null;

    for (let i = 0; i < 7; i++) {
      const dateKey = fmtDate(cursor);
      const rec = lookup.get(dateKey);
      const isSat = cursor.getDay() === 6;

      if (isSat && rec) satFw = rec.ww;

      days.push({
        date: new Date(cursor),
        day: cursor.getDate(),
        isCurrentMonth: rec?.yearmonth === targetYM,
        isSaturday: isSat,
        isToday: dateKey === todayKey,
        fw: null,
        inFY: !!rec,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    if (!satFw) {
      for (const d of days) {
        const rec = lookup.get(fmtDate(d.date));
        if (rec) { satFw = rec.ww; break; }
      }
    }

    weeks.push({ days, fw: satFw });
  }

  return { year, month, label: `${MONTH_NAMES[month]} ${year}`, weeks };
}

/** Fallback: original calendar-month-based grid (when no fiscal data exists) */
function buildMonthCalendarFallback(
  year: number,
  month: number,
  lookup: Map<string, FiscalCalendarRecord>,
  todayKey: string,
): MonthCalendar {
  const firstDay = new Date(year, month, 1);
  const firstDow = firstDay.getDay();
  const offsetToSat = firstDow === 6 ? 0 : -(firstDow + 1);

  const weeks: CalendarWeekRow[] = [];
  let cursor = new Date(year, month, 1 + offsetToSat);

  while (true) {
    const days = [];
    let satFw: string | null = null;

    for (let i = 0; i < 7; i++) {
      const dateKey = fmtDate(cursor);
      const rec = lookup.get(dateKey);
      const isCurrentMonth = cursor.getMonth() === month;
      const isSat = cursor.getDay() === 6;

      if (isSat && rec) satFw = rec.ww;

      days.push({
        date: new Date(cursor),
        day: cursor.getDate(),
        isCurrentMonth,
        isSaturday: isSat,
        isToday: dateKey === todayKey,
        fw: null,
        inFY: !!rec,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    if (!satFw) {
      for (const d of days) {
        const rec = lookup.get(fmtDate(d.date));
        if (rec) { satFw = rec.ww; break; }
      }
    }

    weeks.push({ days, fw: satFw });
    if (cursor.getMonth() !== month && cursor.getDate() > 1) break;
    if (weeks.length >= 7) break;
  }

  return { year, month, label: `${MONTH_NAMES[month]} ${year}`, weeks };
}

function buildQuarters(fy: string, records: FiscalCalendarRecord[]): QuarterData[] {
  const fyNum = parseInt(fy, 10);
  const lookup = buildLookup(records);
  const today = todayStr();

  const quarterDefs: { label: string; months: [number, number][] }[] = [
    { label: 'FQ1', months: [[fyNum - 1, 6], [fyNum - 1, 7], [fyNum - 1, 8]] },
    { label: 'FQ2', months: [[fyNum - 1, 9], [fyNum - 1, 10], [fyNum - 1, 11]] },
    { label: 'FQ3', months: [[fyNum, 0], [fyNum, 1], [fyNum, 2]] },
    { label: 'FQ4', months: [[fyNum, 3], [fyNum, 4], [fyNum, 5]] },
  ];

  return quarterDefs.map(qd => ({
    label: qd.label,
    months: qd.months.map(([y, m]) => buildMonthCalendar(y, m, lookup, today)),
  }));
}

// ==================== COMPONENTS ====================

const MonthGrid: React.FC<{
  month: MonthCalendar;
  quarterLabel: string;
  onFwClick: (weekDays: CalendarDay[]) => void;
}> = ({ month, quarterLabel, onFwClick }) => {
  const qc = QUARTER_COLORS[quarterLabel] || QUARTER_COLORS.FQ3;

  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 220,
      background: '#fff',
      borderRadius: 6,
      border: '1px solid #e0e0e0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Month header */}
      <div style={{
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 15,
        padding: '8px 0',
        background: qc.headerBg,
        color: '#fff',
        letterSpacing: 0.3,
      }}>
        {month.label}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {DAY_HEADERS.map((h, i) => (
              <th key={i} style={{
                padding: '5px 3px',
                textAlign: 'center',
                background: i === 0 ? '#6a1b9a' : '#f5f5f5',
                color: i === 0 ? '#fff' : '#555',
                fontWeight: 600,
                fontSize: 13,
                borderBottom: '2px solid #ddd',
              }}>
                {h}
              </th>
            ))}
            <th style={{
              padding: '5px 5px',
              textAlign: 'center',
              background: '#1565c0',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              borderBottom: '2px solid #ddd',
              minWidth: 36,
            }}>
              FW
            </th>
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week, wi) => {
            const isEvenRow = wi % 2 === 0;
            return (
              <tr key={wi} style={{ background: isEvenRow ? '#fff' : '#fafbfc' }}>
                {week.days.map((day, di) => {
                  const dimmed = !day.isCurrentMonth;
                  let bg = isEvenRow ? '#fff' : '#fafbfc';
                  let color = '#333';
                  let fontWeight: number = 400;
                  let border = '';

                  if (dimmed) {
                    bg = isEvenRow ? '#fdfdfd' : '#f8f8f9';
                    color = '#ccc';
                  } else if (day.isToday) {
                    bg = '#ff6f00';
                    color = '#fff';
                    fontWeight = 700;
                    border = '2px solid #e65100';
                  } else if (day.isSaturday) {
                    bg = '#ede7f6';
                    color = '#6a1b9a';
                    fontWeight = 600;
                  }

                  return (
                    <td key={di} style={{
                      padding: '4px 0',
                      textAlign: 'center',
                      background: bg,
                      color,
                      fontWeight,
                      borderBottom: '1px solid #eeefef',
                      borderRight: di < 6 ? '1px solid #f0f0f0' : 'none',
                      ...(border ? { border } : {}),
                      borderRadius: day.isToday ? 3 : 0,
                    }}>
                      {day.isCurrentMonth ? day.day : ''}
                    </td>
                  );
                })}
                <td
                  onClick={() => onFwClick(week.days)}
                  style={{
                    padding: '4px 5px',
                    textAlign: 'center',
                    background: week.fw ? '#e3f2fd' : (isEvenRow ? '#fff' : '#fafbfc'),
                    color: '#1565c0',
                    fontWeight: 700,
                    fontSize: 13,
                    borderBottom: '1px solid #eeefef',
                    borderLeft: '2px solid #bbdefb',
                    cursor: 'pointer',
                    textDecoration: week.fw ? 'underline' : 'none',
                  }}
                  title="Click to edit fiscal week"
                >
                  {week.fw || '+'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const QuarterSection: React.FC<{
  quarter: QuarterData;
  onFwClick: (weekDays: CalendarDay[]) => void;
}> = ({ quarter, onFwClick }) => {
  const qc = QUARTER_COLORS[quarter.label] || QUARTER_COLORS.FQ3;

  return (
    <div style={{
      background: qc.bg,
      borderRadius: 8,
      border: `1px solid ${qc.border}33`,
      padding: '14px 16px 16px',
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        color: qc.text,
        marginBottom: 10,
        borderLeft: `4px solid ${qc.border}`,
        paddingLeft: 10,
      }}>
        {quarter.label}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {quarter.months.map((m, i) => (
          <MonthGrid key={i} month={m} quarterLabel={quarter.label} onFwClick={onFwClick} />
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================

const FiscalCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<FiscalCalendarRecord[]>([]);
  const [availableFYs, setAvailableFYs] = useState<string[]>([]);
  const [selectedFY, setSelectedFY] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalDays, setModalDays] = useState<Date[]>([]);
  const [formFY, setFormFY] = useState('');
  const [formWW, setFormWW] = useState('');
  const [formYM, setFormYM] = useState('');

  // Generate FY modal state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateFY, setGenerateFY] = useState<number>(getCurrentFiscalYear() + 1);
  const [generating, setGenerating] = useState(false);

  const loadData = async (fy?: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchFiscalCalendar(fy);
      if (resp.success) {
        setRecords(resp.data);
        setAvailableFYs(resp.availableFYs);
        if (resp.selectedFY) setSelectedFY(resp.selectedFY);
      } else {
        setError(resp.message || 'Failed to load fiscal calendar');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(String(getCurrentFiscalYear())); }, []);

  const handleFYChange = (fy: string) => {
    setSelectedFY(fy);
    loadData(fy);
  };

  const recordLookup = useMemo(() => buildLookup(records), [records]);

  const quarters = useMemo(() => {
    if (!selectedFY || records.length === 0) return [];
    return buildQuarters(selectedFY, records);
  }, [selectedFY, records]);

  const handleFwClick = useCallback((weekDays: CalendarDay[]) => {
    // Find existing record from any day in the week
    let existing: FiscalCalendarRecord | undefined;
    for (const d of weekDays) {
      const rec = recordLookup.get(fmtDate(d.date));
      if (rec) { existing = rec; break; }
    }

    if (!existing) {
      message.info('No fiscal data for this week');
      return;
    }

    setModalDays(weekDays.map(d => d.date));
    setFormFY(existing.fiscal_year);
    setFormWW(existing.ww);
    setFormYM(existing.yearmonth);
    setModalOpen(true);
  }, [recordLookup]);

  const handleModalSave = async () => {
    if (!formYM) {
      message.warning('Please fill in YearMonth');
      return;
    }
    setModalSaving(true);
    try {
      const result = await updateYearMonth({
        fiscal_year: formFY,
        ww: formWW.padStart(2, '0'),
        yearmonth: formYM,
      });
      if (result.success) {
        message.success(result.message || 'Saved successfully');
        setModalOpen(false);
        loadData(selectedFY || undefined);
      } else {
        message.error(result.message || 'Save failed');
      }
    } catch (e: any) {
      message.error(e.message || 'Network error');
    } finally {
      setModalSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!generateFY || generateFY < 2000 || generateFY > 2100) {
      message.warning('Please enter a valid fiscal year (2000-2100)');
      return;
    }
    setGenerating(true);
    try {
      const result = await generateFiscalYear(String(generateFY));
      if (result.success) {
        message.success(result.message || `FY${generateFY} generated successfully`);
        setGenerateModalOpen(false);
        loadData(String(generateFY));
      } else {
        message.error(result.message || 'Generation failed');
      }
    } catch (e: any) {
      message.error(e.message || 'Network error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{
      padding: '20px 24px',
      maxWidth: 1600,
      margin: '0 auto',
      background: '#f4f6f9',
      minHeight: '100vh',
    }}>
      {/* Header card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
        background: '#fff',
        padding: '14px 20px',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #1565c0',
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a237e' }}>
          SEAGATE FINANCIAL CALENDAR
          {selectedFY && <span style={{ color: '#555', fontWeight: 400 }}> / FISCAL YEAR {selectedFY}</span>}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#666' }}>Fiscal Year:</span>
          <Select
            value={selectedFY || undefined}
            onChange={handleFYChange}
            style={{ width: 110 }}
            loading={loading}
            options={availableFYs.map(fy => ({ value: fy, label: `FY${fy}` }))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setGenerateModalOpen(true)}
            style={{ background: '#2e7d32' }}
          >
            Generate FY
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 20,
        marginBottom: 18,
        fontSize: 12,
        color: '#555',
        flexWrap: 'wrap',
        background: '#fff',
        padding: '8px 16px',
        borderRadius: 6,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 16, height: 16, background: '#ff6f00', borderRadius: 3 }} />
          Today
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 16, height: 16, background: '#ede7f6', border: '1px solid #ce93d8', borderRadius: 3 }} />
          Saturday
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 16, height: 16, background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 3 }} />
          FW = Fiscal Week
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {Object.entries(QUARTER_COLORS).map(([q, c]) => (
            <span key={q} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 16, height: 16, background: c.bg, border: `1px solid ${c.border}66`, borderRadius: 3 }} />
              {q}
            </span>
          ))}
        </span>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      {!loading && !error && quarters.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            minWidth: 1200,
          }}>
            {quarters.map((q, i) => (
              <QuarterSection key={i} quarter={q} onFwClick={handleFwClick} />
            ))}
          </div>
        </div>
      )}

      {/* Fiscal Week Edit Modal */}
      <Modal
        title={
          modalDays.length === 7
            ? `Fiscal Week — ${modalDays[0].toLocaleDateString('en-GB')} ~ ${modalDays[6].toLocaleDateString('en-GB')}`
            : 'Fiscal Week'
        }
        open={modalOpen}
        onOk={handleModalSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalSaving}
        okText="Save"
        destroyOnClose
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                Fiscal Year
              </label>
              <Input value={formFY} disabled />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                Work Week
              </label>
              <Input value={formWW} disabled />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
              YearMonth (YYMM)
            </label>
            <Input
              value={formYM}
              onChange={e => setFormYM(e.target.value)}
              placeholder="e.g. 2607"
              maxLength={4}
              autoFocus
            />
          </div>
        </div>
      </Modal>

      {/* Generate Fiscal Year Modal */}
      <Modal
        title="Generate Fiscal Year Calendar"
        open={generateModalOpen}
        onOk={handleGenerate}
        onCancel={() => setGenerateModalOpen(false)}
        confirmLoading={generating}
        okText="Generate"
        destroyOnClose
        width={400}
      >
        <div style={{ marginTop: 8 }}>
          <p style={{ color: '#666', marginBottom: 16 }}>
            Generate all 52 weeks (364 days) for a new fiscal year.
            Each week runs Saturday to Friday with auto-calculated YearMonth values.
          </p>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
            Fiscal Year
          </label>
          <InputNumber
            value={generateFY}
            onChange={v => setGenerateFY(v || getCurrentFiscalYear() + 1)}
            min={2000}
            max={2100}
            style={{ width: '100%' }}
            autoFocus
          />
          <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
            Example: FY{generateFY} starts on the Saturday closest to July 1, {generateFY - 1}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FiscalCalendarPage;
