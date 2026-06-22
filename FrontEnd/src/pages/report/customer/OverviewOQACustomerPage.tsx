// client/src/pages/report/customer/OverviewOQACustomerPage.tsx
// ===== OVERVIEW OQA CUSTOMER PAGE =====
// Shows OQA quality data (DPPM, LAR) grouped by customer product with defect groups as columns

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Button, Table, Modal, Spin, Typography, Space, Card, Breadcrumb, InputNumber } from 'antd';
import { SearchOutlined, HomeOutlined, FileTextOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import {
  getOverviewOQA,
  getOverviewOQALotDetail,
  getFiscalYearsOverviewOQA,
  getWorkWeeksOverviewOQA,
} from '../../../services/reportService';
import { getCurrentFiscalYear, getCurrentFiscalWeek } from '@qcv/shared';
import type { OverviewOQARawRecord } from '../../../types/report';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Common header style - compact
const headerStyle = { backgroundColor: '#e6f7ff', fontWeight: 700 as const, textAlign: 'center' as const, padding: '4px 6px', fontSize: 12, borderBottom: '1px solid #333' };
const headerCell = () => ({ style: headerStyle });

// Compact table CSS injected once
const compactTableStyle = `
  .overview-oqa-compact .ant-table-cell { padding: 3px 6px !important; font-size: 12px; }
  .overview-oqa-compact .ant-table-thead > tr > th { border: 1px solid #333 !important; }
  .overview-oqa-compact .ant-table-bordered .ant-table-tbody > tr > td { border-bottom: 1px solid #e8e8e8; }
  .overview-oqa-compact .ant-table-bordered .ant-table-tbody > tr.oqa-row-qty > td { border-bottom: 2px solid #333; }
  .overview-oqa-compact .ant-table-bordered .ant-table-tbody > tr.oqa-row-dppm > td { border-bottom: 1px dashed #d9d9d9; }
  .overview-oqa-compact .ant-table-summary > tr:first-child > td { border-top: 2px solid #333 !important; border-bottom: 1px dashed #d9d9d9 !important; }
  .overview-oqa-compact .ant-table-summary > tr:last-child > td { border-bottom: 2px solid #333 !important; }
`;

// Pivoted row interface: each product emits 2 rows (dppm + qty)
interface PivotedRow {
  key: string;
  model: string;
  product_type: string;
  total_lot_inspection: number;
  total_lot_pass: number;
  total_lot_fail: number;
  lar: number;
  total_sampling: number;
  total_ng: number;
  overall_dppm: number;
  rowType: 'dppm' | 'qty';
  defectGroups: Record<string, { dppm: number; ng_qty: number }>;
}

const OverviewOQACustomerPage: React.FC = () => {
  // Filter state
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [workWeeks, setWorkWeeks] = useState<string[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>(getCurrentFiscalYear().toString());
  const [selectedWW, setSelectedWW] = useState<string>(getCurrentFiscalWeek().toString().padStart(2, '0'));
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Target input state (draft - editable)
  const [overallDppmTarget, setOverallDppmTarget] = useState<number>(180);
  const [overallLarTarget, setOverallLarTarget] = useState<number>(98.4);
  const [productDppmTarget, setProductDppmTarget] = useState<number>(220);
  const [productLarTarget, setProductLarTarget] = useState<number>(98.0);

  // Applied target state (used by tables for conditional formatting)
  const [appliedOverallDppm, setAppliedOverallDppm] = useState<number>(180);
  const [appliedOverallLar, setAppliedOverallLar] = useState<number>(98.4);
  const [appliedProductDppm, setAppliedProductDppm] = useState<number>(220);
  const [appliedProductLar, setAppliedProductLar] = useState<number>(98.0);

  // Check if targets have changed from applied values
  const targetsChanged = overallDppmTarget !== appliedOverallDppm
    || overallLarTarget !== appliedOverallLar
    || productDppmTarget !== appliedProductDppm
    || productLarTarget !== appliedProductLar;

  // Apply target handler
  const handleApplyTarget = () => {
    setAppliedOverallDppm(overallDppmTarget);
    setAppliedOverallLar(overallLarTarget);
    setAppliedProductDppm(productDppmTarget);
    setAppliedProductLar(productLarTarget);
  };

  // Data state
  const [rawData, setRawData] = useState<OverviewOQARawRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Lot detail modal state
  const [lotModalVisible, setLotModalVisible] = useState(false);
  const [lotModalData, setLotModalData] = useState<{ lotno: string; ng_qty: number; inspection_no: string }[]>([]);
  const [lotModalTitle, setLotModalTitle] = useState('');
  const [lotModalLoading, setLotModalLoading] = useState(false);

  // Load fiscal years on mount
  useEffect(() => {
    const loadFiscalYears = async () => {
      try {
        const result = await getFiscalYearsOverviewOQA();
        if (result.success && result.data) {
          setFiscalYears(result.data);
        }
      } catch (error) {
        console.error('Failed to load fiscal years:', error);
      }
    };
    loadFiscalYears();
  }, []);

  // Load work weeks when FY changes
  useEffect(() => {
    const loadWorkWeeks = async () => {
      if (!selectedFY) return;
      try {
        const result = await getWorkWeeksOverviewOQA(selectedFY);
        if (result.success && result.data) {
          setWorkWeeks(result.data);
        }
      } catch (error) {
        console.error('Failed to load work weeks:', error);
      }
    };
    loadWorkWeeks();
  }, [selectedFY]);

  // Auto-load data on mount
  useEffect(() => {
    if (initialLoad && selectedFY && selectedWW) {
      fetchData();
      setInitialLoad(false);
    }
  }, [selectedFY, selectedWW]); // eslint-disable-line react-hooks/exhaustive-deps

  // Available product options from raw data
  const productOptions = useMemo(() => {
    const models = new Set<string>();
    rawData.forEach(row => {
      models.add(row.model);
    });
    return Array.from(models).sort();
  }, [rawData]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!selectedFY || !selectedWW) return;

    setLoading(true);
    try {
      const result = await getOverviewOQA({
        yearFrom: selectedFY,
        wwFrom: selectedWW,
        models: selectedModels.length > 0 ? selectedModels : undefined,
      });

      if (result.success && result.data) {
        setRawData(result.data);
      } else {
        setRawData([]);
      }
    } catch (error) {
      console.error('Failed to fetch Overview OQA data:', error);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFY, selectedWW, selectedModels]);

  // Handle NG Qty click - fetch lot detail for a specific product + defect group
  const handleNgQtyClick = useCallback(async (model: string, defectGroup: string) => {
    if (!selectedFY || !selectedWW) return;
    setLotModalTitle(`${model} / ${defectGroup}`);
    setLotModalVisible(true);
    setLotModalLoading(true);
    try {
      const result = await getOverviewOQALotDetail(selectedFY, selectedWW, model, defectGroup);
      if (result.success && result.data) {
        setLotModalData(result.data);
      } else {
        setLotModalData([]);
      }
    } catch (error) {
      console.error('Failed to fetch lot detail:', error);
      setLotModalData([]);
    } finally {
      setLotModalLoading(false);
    }
  }, [selectedFY, selectedWW]);

  // Extract all unique defect groups (sorted) from rawData (excluding 'No Defect')
  const allDefectGroups = useMemo(() => {
    const groups = new Set<string>();
    rawData.forEach(row => {
      if (row.defect_group && row.defect_group !== 'No Defect') {
        groups.add(row.defect_group);
      }
    });
    return Array.from(groups).sort();
  }, [rawData]);

  // Build pivoted data: 2 rows per product (dppm row + qty row)
  const pivotedData = useMemo((): PivotedRow[] => {
    // Group rawData by model
    const productMap = new Map<string, {
      firstRow: OverviewOQARawRecord;
      defects: Map<string, { dppm: number; ng_qty: number }>;
    }>();

    rawData.forEach(row => {
      if (!productMap.has(row.model)) {
        productMap.set(row.model, {
          firstRow: row,
          defects: new Map(),
        });
      }
      const entry = productMap.get(row.model)!;
      if (row.defect_group && row.defect_group !== 'No Defect') {
        const ngQty = Number(row.ng_qty) || 0;
        const sampling = Number(entry.firstRow.total_sampling) || 0;
        const dppm = sampling > 0 ? Math.round((ngQty / sampling) * 1000000) : 0;
        entry.defects.set(row.defect_group, { dppm, ng_qty: ngQty });
      }
    });

    const rows: PivotedRow[] = [];

    // Sort products by model
    const sortedProducts = Array.from(productMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    sortedProducts.forEach(([partno, data]) => {
      const { firstRow, defects } = data;
      const totalNG = Array.from(defects.values()).reduce((sum, d) => sum + d.ng_qty, 0);
      const totalSampling = Number(firstRow.total_sampling) || 0;
      const overallDppm = totalSampling > 0 ? Math.round((totalNG / totalSampling) * 1000000) : 0;

      const defectGroupsObj: Record<string, { dppm: number; ng_qty: number }> = {};
      defects.forEach((val, key) => {
        defectGroupsObj[key] = val;
      });

      const baseRow = {
        model: firstRow.model,
        product_type: firstRow.product_type,
        total_lot_inspection: Number(firstRow.total_lot_inspection) || 0,
        total_lot_pass: Number(firstRow.total_lot_pass) || 0,
        total_lot_fail: Number(firstRow.total_lot_fail) || 0,
        lar: Number(firstRow.lar) || 0,
        total_sampling: totalSampling,
        total_ng: totalNG,
        overall_dppm: overallDppm,
        defectGroups: defectGroupsObj,
      };

      rows.push({ ...baseRow, key: `${partno}|dppm`, rowType: 'dppm' });
      rows.push({ ...baseRow, key: `${partno}|qty`, rowType: 'qty' });
    });

    return rows;
  }, [rawData]);

  // Grand totals for summary footer
  const grandTotals = useMemo(() => {
    const productMap = new Map<string, OverviewOQARawRecord>();
    rawData.forEach(row => {
      if (!productMap.has(row.model)) {
        productMap.set(row.model, row);
      }
    });

    let totalLot = 0, totalPass = 0, totalFail = 0, totalSampling = 0, totalNG = 0;
    productMap.forEach(row => {
      totalLot += Number(row.total_lot_inspection) || 0;
      totalPass += Number(row.total_lot_pass) || 0;
      totalFail += Number(row.total_lot_fail) || 0;
      totalSampling += Number(row.total_sampling) || 0;
    });
    rawData.forEach(row => {
      if (row.defect_group && row.defect_group !== 'No Defect') {
        totalNG += Number(row.ng_qty) || 0;
      }
    });

    // Per-defect-group totals
    const defectTotals: Record<string, { dppm: number; ng_qty: number }> = {};
    const defectNgMap = new Map<string, number>();
    rawData.forEach(row => {
      if (row.defect_group && row.defect_group !== 'No Defect') {
        const prev = defectNgMap.get(row.defect_group) || 0;
        defectNgMap.set(row.defect_group, prev + (Number(row.ng_qty) || 0));
      }
    });
    defectNgMap.forEach((ng, dg) => {
      defectTotals[dg] = {
        ng_qty: ng,
        dppm: totalSampling > 0 ? Math.round((ng / totalSampling) * 1000000) : 0,
      };
    });

    return {
      totalLot,
      totalPass,
      totalFail,
      lar: totalLot > 0 ? Math.round((totalPass / totalLot) * 100 * 100) / 100 : 0,
      totalSampling,
      totalNG,
      dppm: totalSampling > 0 ? Math.round((totalNG / totalSampling) * 1000000) : 0,
      defectTotals,
    };
  }, [rawData]);

  // onCell handler for product-level columns (rowSpan merge + white background)
  const mergeProductCell = (_: unknown, record: PivotedRow) => {
    if (record.rowType === 'dppm') return { rowSpan: 2, style: { backgroundColor: '#fff' } };
    return { rowSpan: 0 };
  };

  // Build dynamic columns
  const pivotColumns = useMemo((): ColumnsType<PivotedRow> => {
    const fixedLeft: ColumnsType<PivotedRow> = [
      {
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
        width: 110,
        onHeaderCell: headerCell,
        onCell: (record) => mergeProductCell(null, record),
      },
      {
        title: 'Lot Inspec.',
        dataIndex: 'total_lot_inspection',
        key: 'total_lot_inspection',
        width: 70,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => mergeProductCell(null, record),
        render: (val: number) => <span style={{ fontWeight: 600 }}>{val.toLocaleString()}</span>,
      },
      {
        title: 'Lot Pass',
        dataIndex: 'total_lot_pass',
        key: 'total_lot_pass',
        width: 65,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => mergeProductCell(null, record),
        render: (val: number) => <span style={{ fontWeight: 600 }}>{val.toLocaleString()}</span>,
      },
      {
        title: 'Lot Fail',
        dataIndex: 'total_lot_fail',
        key: 'total_lot_fail',
        width: 60,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => mergeProductCell(null, record),
        render: (val: number) => <span style={{ fontWeight: 600 }}>{val.toLocaleString()}</span>,
      },
      {
        title: 'Times Fail',
        key: 'times_fail',
        width: 70,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => {
          const base = mergeProductCell(null, record);
          const timesFail = Math.ceil(record.total_lot_fail / 2);
          const ng = record.total_ng;
          const highlight = (timesFail === 0 && ng > 0) || timesFail > ng;
          return { ...base, style: { ...base.style, backgroundColor: highlight ? '#FFFF00' : '#fff' } };
        },
        render: (_: unknown, record: PivotedRow) => {
          const timesFail = Math.ceil(record.total_lot_fail / 2);
          const ng = record.total_ng;
          const highlight = (timesFail === 0 && ng > 0) || timesFail > ng;
          return (
            <span style={{ color: highlight ? '#FF0000' : undefined, fontWeight: 600 }}>
              {timesFail.toLocaleString()}
            </span>
          );
        },
      },
      {
        title: 'LAR%',
        dataIndex: 'lar',
        key: 'lar',
        width: 65,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => {
          const base = mergeProductCell(null, record);
          const isPass = record.lar >= appliedProductLar;
          return { ...base, style: { ...base.style, backgroundColor: isPass ? '#00B050' : '#FF0000' } };
        },
        render: (val: number) => (
          <span style={{ color: '#fff', fontWeight: 600 }}>
            {val.toFixed(2)}%
          </span>
        ),
      },
      {
        title: 'Sampling',
        dataIndex: 'total_sampling',
        key: 'total_sampling',
        width: 70,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => mergeProductCell(null, record),
        render: (val: number) => <span style={{ fontWeight: 600 }}>{val.toLocaleString()}</span>,
      },
      {
        title: 'NG',
        dataIndex: 'total_ng',
        key: 'total_ng',
        width: 50,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => {
          const base = mergeProductCell(null, record);
          const timesFail = Math.ceil(record.total_lot_fail / 2);
          const ng = record.total_ng;
          const highlight = (timesFail === 0 && ng > 0) || timesFail > ng;
          return { ...base, style: { ...base.style, backgroundColor: highlight ? '#FFFF00' : '#fff' } };
        },
        render: (val: number, record) => {
          const timesFail = Math.ceil(record.total_lot_fail / 2);
          const ng = record.total_ng;
          const highlight = (timesFail === 0 && ng > 0) || timesFail > ng;
          return (
            <span style={{ color: highlight ? '#FF0000' : undefined, fontWeight: 600 }}>
              {val.toLocaleString()}
            </span>
          );
        },
      },
      {
        title: 'DPPM',
        dataIndex: 'overall_dppm',
        key: 'overall_dppm',
        width: 75,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record) => {
          if (record.rowType === 'dppm') {
            const isFail = record.overall_dppm >= appliedProductDppm;
            return { style: { backgroundColor: isFail ? '#FF0000' : '#fff' } };
          }
          return { style: { backgroundColor: '#f0f0f0' } };
        },
        render: (val: number, record) => {
          if (record.rowType === 'qty') {
            return <span style={{ fontWeight: 600, color: '#888' }}>จำนวนชิ้น</span>;
          }
          return (
            <span style={{ color: val >= appliedProductDppm ? '#fff' : undefined, fontWeight: 600 }}>
              {val.toLocaleString()}
            </span>
          );
        },
      },
    ];

    // Dynamic defect group columns
    const defectGroupCols: ColumnsType<PivotedRow> = allDefectGroups.map(dg => ({
      title: dg,
      key: `dg_${dg}`,
      width: 75,
      align: 'right' as const,
      onHeaderCell: headerCell,
      onCell: (record: PivotedRow) => ({
        style: { backgroundColor: record.rowType === 'qty' ? '#f0f0f0' : '#fff' },
      }),
      render: (_: unknown, record: PivotedRow) => {
        const data = record.defectGroups[dg];
        if (record.rowType === 'dppm') {
          const dppmVal = data?.dppm ?? 0;
          return (
            <span style={{ fontWeight: 600 }}>
              {dppmVal.toLocaleString()}
            </span>
          );
        } else {
          // qty row - clickable to show lot detail
          const ngVal = data?.ng_qty ?? 0;
          if (ngVal > 0) {
            return (
              <a
                onClick={() => handleNgQtyClick(record.model, dg)}
                style={{ color: 'inherit', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {ngVal.toLocaleString()}
              </a>
            );
          }
          return <span style={{ fontWeight: 600 }}>0</span>;
        }
      },
    }));

    // Wrap defect group columns under a grouped header
    const defectGroupHeader: ColumnsType<PivotedRow>[number] = {
      title: 'DPPM by Defect Group',
      onHeaderCell: headerCell,
      children: defectGroupCols as ColumnsType<PivotedRow>[number][],
    };

    // Overall DPPM column - uses same value as DPPM column (avoids rounding discrepancy from summing individually rounded defect DPPMs)
    const overallDppmCol: ColumnsType<PivotedRow> = [
      {
        title: 'Overall DPPM',
        key: 'overall_defect_dppm',
        width: 90,
        align: 'right',
        onHeaderCell: headerCell,
        onCell: (record: PivotedRow) => {
          if (record.rowType === 'dppm') {
            return { style: { backgroundColor: record.overall_dppm >= appliedProductDppm ? '#FF0000' : '#fff' } };
          }
          return { style: { backgroundColor: '#f0f0f0' } };
        },
        render: (_: unknown, record: PivotedRow) => {
          if (record.rowType === 'dppm') {
            return (
              <span style={{ color: record.overall_dppm >= appliedProductDppm ? '#fff' : undefined, fontWeight: 600 }}>
                {record.overall_dppm.toLocaleString()}
              </span>
            );
          }
          // qty row: sum of ng_qty
          return <span style={{ fontWeight: 600 }}>{record.total_ng.toLocaleString()}</span>;
        },
      },
    ];

    const columns: ColumnsType<PivotedRow> = [
      ...fixedLeft,
      ...(allDefectGroups.length > 0 ? [defectGroupHeader] : []),
      ...overallDppmCol,
    ];

    return columns;
  }, [allDefectGroups, appliedProductDppm, appliedProductLar, handleNgQtyClick]);

  // Number of fixed columns (product-level) for summary footer colSpan
  const fixedColCount = 9; // 9 product cols

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: <><HomeOutlined /> Home</> },
          { title: 'Customer Format' },
          { title: 'Overview OQA' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Title level={3} style={{ marginBottom: 24 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        Overview OQA
      </Title>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          {/* Left: Filters */}
          <Space wrap size="middle">
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Fiscal Year</Text>
              <Select
                style={{ width: 120 }}
                value={selectedFY}
                onChange={(val) => {
                  setSelectedFY(val);
                  setSelectedWW('');
                }}
                options={fiscalYears.map(fy => ({ label: `FY${fy}`, value: fy }))}
                placeholder="Select FY"
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Work Week</Text>
              <Select
                style={{ width: 120 }}
                value={selectedWW}
                onChange={setSelectedWW}
                options={workWeeks.map(ww => ({ label: `WW${ww}`, value: ww }))}
                placeholder="Select WW"
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Product</Text>
              <Select
                mode="multiple"
                style={{ minWidth: 250 }}
                value={selectedModels}
                onChange={setSelectedModels}
                options={productOptions.map(m => ({ label: m, value: m }))}
                placeholder="All Products"
                allowClear
                maxTagCount={2}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 18 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchData}
                loading={loading}
              >
                Search
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSelectedModels([]);
                  fetchData();
                }}
                style={{ marginLeft: 8 }}
              >
                Reset
              </Button>
            </div>
          </Space>

          {/* Right: Target inputs */}
          <Space wrap size="middle">
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Overall DPPM</Text>
              <InputNumber
                style={{ width: 100 }}
                value={overallDppmTarget}
                onChange={(val) => setOverallDppmTarget(val ?? 160)}
                min={0}
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Overall LAR%</Text>
              <InputNumber
                style={{ width: 100 }}
                value={overallLarTarget}
                onChange={(val) => setOverallLarTarget(val ?? 98.4)}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Product DPPM</Text>
              <InputNumber
                style={{ width: 100 }}
                value={productDppmTarget}
                onChange={(val) => setProductDppmTarget(val ?? 150)}
                min={0}
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Product LAR%</Text>
              <InputNumber
                style={{ width: 100 }}
                value={productLarTarget}
                onChange={(val) => setProductLarTarget(val ?? 100)}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 18 }}>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApplyTarget}
                disabled={!targetsChanged}
                style={{ backgroundColor: targetsChanged ? '#faad14' : undefined, borderColor: targetsChanged ? '#faad14' : undefined }}
              >
                Apply Target
              </Button>
            </div>
          </Space>
        </div>
      </Card>

      {/* Results */}
      <Spin spinning={loading}>
        <style>{compactTableStyle}</style>
        {/* Pivoted Table */}
        <div className="overview-oqa-compact">
        <Table<PivotedRow>
          columns={pivotColumns}
          dataSource={pivotedData}
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 900 + allDefectGroups.length * 75 }}
          rowClassName={(record) => record.rowType === 'qty' ? 'oqa-row-qty' : 'oqa-row-dppm'}
          summary={() => {
            if (pivotedData.length === 0) return undefined;
            return (
              <Table.Summary fixed>
                {/* Overall - DPPM row */}
                {(() => {
                  const fail = grandTotals.totalFail;
                  const ng = grandTotals.totalNG;
                  const timesFail = Math.ceil(fail / 2);
                  const highlightTimesFailNg = (timesFail === 0 && ng > 0) || timesFail > ng;
                  const larPass = grandTotals.lar >= appliedOverallLar;
                  const dppmFail = grandTotals.dppm >= appliedOverallDppm;
                  const cell = (bg: string, content: React.ReactNode) => (
                    <div style={{ backgroundColor: bg, margin: '-3px -6px', padding: '3px 6px' }}>{content}</div>
                  );
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        {cell('#fff', <strong>Overall</strong>)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        {cell('#fff', <span style={{ fontWeight: 600 }}>{grandTotals.totalLot.toLocaleString()}</span>)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        {cell('#fff', <span style={{ fontWeight: 600 }}>{grandTotals.totalPass.toLocaleString()}</span>)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        {cell('#fff',
                          <span style={{ fontWeight: 600 }}>
                            {grandTotals.totalFail.toLocaleString()}
                          </span>
                        )}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        {cell(highlightTimesFailNg ? '#FFFF00' : '#fff',
                          <span style={{ color: highlightTimesFailNg ? '#FF0000' : undefined, fontWeight: 600 }}>
                            {timesFail.toLocaleString()}
                          </span>
                        )}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        {cell(larPass ? '#00B050' : '#FF0000',
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {grandTotals.lar.toFixed(2)}%
                          </span>
                        )}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        {cell('#fff', <span style={{ fontWeight: 600 }}>{grandTotals.totalSampling.toLocaleString()}</span>)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7} align="right">
                        {cell(highlightTimesFailNg ? '#FFFF00' : '#fff',
                          <span style={{ color: highlightTimesFailNg ? '#FF0000' : undefined, fontWeight: 600 }}>
                            {grandTotals.totalNG.toLocaleString()}
                          </span>
                        )}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8} align="right">
                        {cell(dppmFail ? '#FF0000' : '#fff',
                          <span style={{ color: dppmFail ? '#fff' : undefined, fontWeight: 600 }}>
                            {grandTotals.dppm.toLocaleString()}
                          </span>
                        )}
                      </Table.Summary.Cell>
                      {allDefectGroups.map((dg, i) => (
                        <Table.Summary.Cell key={dg} index={fixedColCount + i} align="right">
                          {cell('#fff',
                            <span style={{ fontWeight: 600 }}>
                              {(grandTotals.defectTotals[dg]?.dppm ?? 0).toLocaleString()}
                            </span>
                          )}
                        </Table.Summary.Cell>
                      ))}
                      <Table.Summary.Cell index={fixedColCount + allDefectGroups.length} align="right">
                        {cell(dppmFail ? '#FF0000' : '#fff',
                          <span style={{ color: dppmFail ? '#fff' : undefined, fontWeight: 600 }}>
                            {grandTotals.dppm.toLocaleString()}
                          </span>
                        )}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                })()}
                {/* Overall - Qty row */}
                {(() => {
                  const cell = (bg: string, content: React.ReactNode) => (
                    <div style={{ backgroundColor: bg, margin: '-3px -6px', padding: '3px 6px' }}>{content}</div>
                  );
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={8}>
                        {cell('#fff', <span />)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8} align="right">
                        {cell('#f0f0f0', <span style={{ fontWeight: 600, color: '#888' }}>จำนวนชิ้น</span>)}
                      </Table.Summary.Cell>
                      {allDefectGroups.map((dg, i) => (
                        <Table.Summary.Cell key={dg} index={fixedColCount + i} align="right">
                          {cell('#f0f0f0',
                            <span style={{ fontWeight: 600 }}>
                              {(grandTotals.defectTotals[dg]?.ng_qty ?? 0).toLocaleString()}
                            </span>
                          )}
                        </Table.Summary.Cell>
                      ))}
                      <Table.Summary.Cell index={fixedColCount + allDefectGroups.length} align="right">
                        {cell('#f0f0f0',
                          <span style={{ fontWeight: 600 }}>
                            {grandTotals.totalNG.toLocaleString()}
                          </span>
                        )}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                })()}
              </Table.Summary>
            );
          }}
        />
        </div>

        {pivotedData.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No data found. Please select Fiscal Year and Work Week, then click Search.
          </div>
        )}
      </Spin>

      {/* Lot Detail Modal */}
      <Modal
        title={<span style={{ color: '#1677ff', fontWeight: 600 }}>{lotModalTitle}</span>}
        open={lotModalVisible}
        onCancel={() => setLotModalVisible(false)}
        footer={null}
        width={500}
      >
        <Spin spinning={lotModalLoading}>
          <Table
            size="small"
            bordered
            pagination={false}
            scroll={{ y: 400 }}
            dataSource={lotModalData.map((lot, i) => ({ key: i, no: i + 1, ...lot }))}
            onRow={(record) => ({
              style: {
                backgroundColor: (Number(record.ng_qty) || 0) > 0 ? '#fff1f0' : '#f6ffed',
              },
            })}
            columns={[
              {
                title: 'No',
                dataIndex: 'no',
                key: 'no',
                width: 50,
                align: 'center' as const,
                onHeaderCell: headerCell,
              },
              {
                title: 'Lot No',
                dataIndex: 'lotno',
                key: 'lotno',
                onHeaderCell: headerCell,
                render: (val: string, record: any) => (
                  <a
                    href={`/customer-data/oqa?inspection_no=${encodeURIComponent(record.inspection_no)}&lotno=${encodeURIComponent(record.lotno)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500, color: '#1677ff', textDecoration: 'underline' }}
                  >
                    {val}
                  </a>
                ),
              },
              {
                title: 'NG Qty',
                dataIndex: 'ng_qty',
                key: 'ng_qty',
                width: 80,
                align: 'right' as const,
                onHeaderCell: headerCell,
                render: (val: number) => {
                  const num = Number(val) || 0;
                  return (
                    <span style={{ color: num > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
                      {num.toLocaleString()}
                    </span>
                  );
                },
              },
            ]}
            summary={() => {
              const totalNG = lotModalData.reduce((sum, l) => sum + (Number(l.ng_qty) || 0), 0);
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ background: '#e6f7ff', fontWeight: 700 }}>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>Total: {lotModalData.length} lot(s)</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong style={{ color: '#ff4d4f' }}>
                        {totalNG.toLocaleString()}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default OverviewOQACustomerPage;
