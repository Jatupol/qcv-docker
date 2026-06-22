// client/src/pages/inspection/DefectTypeAnalysisPage.tsx
// ===== DEFECT TYPE ANALYSIS PAGE =====
// Visualizes defect data from inspections with charts and data table

import React, { useState, useCallback, useEffect } from 'react';
import { DatePicker, Table, Card, Row, Col, Statistic, Button, Space, Spin, Select, message } from 'antd';
import {
  SearchOutlined,
  FileExcelOutlined,
  BugOutlined,
  AppstoreOutlined,
  LaptopOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { getDefectTypeAnalysis, getAvailableModels } from '../../services/reportService';
import { exportToExcel } from '../../utils/excelUtils';
import { formatDate } from '../../utils/formatUtils';

const { RangePicker } = DatePicker;

// ============ INTERFACES ============

interface DefectTypeAnalysisRecord {
  inspection_date: string;
  itemno: string;
  model: string;
  version: string;
  lotno: string;
  defect_id: number;
  defect_type: string;
  name: string;
  description: string;
  ng_qty: number;
}

// ============ CONSTANTS ============

const CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#E7E9ED', '#7CB342', '#5C6BC0', '#26A69A',
  '#EF5350', '#AB47BC', '#42A5F5', '#66BB6A', '#FFA726',
];

// ============ COMPONENT ============

const DefectTypeAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DefectTypeAnalysisRecord[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // ============ LOAD MODEL OPTIONS ============

  useEffect(() => {
    const loadModels = async () => {
      try {
        const result = await getAvailableModels();
        if (result.success && result.data) {
          setModelOptions(result.data);
        }
      } catch {
        // silently ignore - models dropdown will just be empty
      }
    };
    loadModels();
  }, []);

  // ============ DATA FETCHING ============

  const fetchData = useCallback(async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning('Please select a date range');
      return;
    }

    setLoading(true);
    try {
      const params: { dateFrom: string; dateTo: string; models?: string[] } = {
        dateFrom: dateRange[0].format('YYYY-MM-DD'),
        dateTo: dateRange[1].format('YYYY-MM-DD'),
      };
      if (selectedModels.length > 0) {
        params.models = selectedModels;
      }
      const result = await getDefectTypeAnalysis(params);

      if (result.success && result.data) {
        setData(result.data);
        if (result.data.length === 0) {
          message.info('No data found for the selected date range');
        }
      } else {
        message.error(result.message || 'Failed to fetch data');
        setData([]);
      }
    } catch (err) {
      message.error('Failed to fetch defect type analysis data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedModels]);

  // ============ COMPUTED VALUES ============

  const totalNgQty = data.reduce((sum, r) => sum + Number(r.ng_qty), 0);
  const uniqueDefectTypes = new Set(data.map((r) => r.name)).size;
  const uniqueModels = new Set(data.map((r) => `${r.model} ${r.version}`)).size;
  const uniqueLots = new Set(data.map((r) => r.lotno)).size;

  // Top 10 defect types by total NG qty
  const defectTypeAgg = data.reduce<Record<string, number>>((acc, r) => {
    acc[r.name] = (acc[r.name] || 0) + Number(r.ng_qty);
    return acc;
  }, {});
  const top10Defects = Object.entries(defectTypeAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, qty]) => ({ name, qty }));

  // Pie chart data for defect type distribution
  const pieData = Object.entries(defectTypeAgg)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Top 10 models by NG qty
  const modelAgg = data.reduce<Record<string, number>>((acc, r) => {
    const modelName = `${r.model} ${r.version}`;
    acc[modelName] = (acc[modelName] || 0) + Number(r.ng_qty);
    return acc;
  }, {});
  const top10Models = Object.entries(modelAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, qty]) => ({ name, qty }));

  // ============ EXPORT ============

  const handleExport = () => {
    if (data.length === 0) {
      message.warning('No data to export');
      return;
    }
    exportToExcel(data, {
      filename: `Defect_Type_Analysis_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}`,
      sheetName: 'Defect Analysis',
      columns: [
        { key: 'inspection_date', header: 'Inspection Date', formatter: (v: string) => formatDate(v) },
        { key: 'itemno', header: 'Item No' },
        { key: 'model', header: 'Model' },
        { key: 'version', header: 'Version' },
        { key: 'lotno', header: 'Lot No' },
        { key: 'defect_type', header: 'Defect Type' },
        { key: 'name', header: 'Defect Name' },
        { key: 'description', header: 'Description' },
        { key: 'ng_qty', header: 'NG Qty' },
      ],
    });
  };

  // ============ TABLE COLUMNS ============

  const columns: ColumnsType<DefectTypeAnalysisRecord> = [
    {
      title: 'Date',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      sorter: (a, b) => a.inspection_date.localeCompare(b.inspection_date),
      render: (val: string) => formatDate(val),
      width: 110,
    },
    {
      title: 'Item No',
      dataIndex: 'itemno',
      key: 'itemno',
      sorter: (a, b) => (a.itemno || '').localeCompare(b.itemno || ''),
      width: 120,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      sorter: (a, b) => a.model.localeCompare(b.model),
      width: 120,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: 'Lot No',
      dataIndex: 'lotno',
      key: 'lotno',
      sorter: (a, b) => a.lotno.localeCompare(b.lotno),
      width: 140,
    },
    {
      title: 'Defect Type',
      dataIndex: 'defect_type',
      key: 'defect_type',
      filters: [...new Set(data.map((r) => r.defect_type))].map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.defect_type === value,
      width: 120,
    },
    {
      title: 'Defect Name',
      dataIndex: 'name',
      key: 'name',
      filters: [...new Set(data.map((r) => r.name))].map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.name === value,
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'NG Qty',
      dataIndex: 'ng_qty',
      key: 'ng_qty',
      sorter: (a, b) => Number(a.ng_qty) - Number(b.ng_qty),
      defaultSortOrder: 'descend',
      width: 100,
      align: 'right',
      render: (val: number) => {
        const num = Number(val);
        const color = num >= 10 ? '#f5222d' : num >= 5 ? '#fa8c16' : '#52c41a';
        return <span style={{ color, fontWeight: num >= 10 ? 700 : 400 }}>{num.toLocaleString()}</span>;
      },
    },
  ];

  // ============ CUSTOM TOOLTIP ============

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #d9d9d9', padding: '8px 12px', borderRadius: 4 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: payload[0].fill }}>NG Qty: {Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const pct = totalNgQty > 0 ? ((item.value / totalNgQty) * 100).toFixed(1) : '0';
    return (
      <div style={{ background: '#fff', border: '1px solid #d9d9d9', padding: '8px 12px', borderRadius: 4 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
        <p style={{ margin: 0 }}>NG Qty: {Number(item.value).toLocaleString()} ({pct}%)</p>
      </div>
    );
  };

  // ============ RENDER ============

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Defect Type Analysis</h2>
        <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
          Analyze defect data from inspections by date range
        </p>
      </div>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format="DD/MM/YYYY"
            style={{ width: 280 }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="All Models"
            value={selectedModels}
            onChange={setSelectedModels}
            style={{ minWidth: 240 }}
            maxTagCount="responsive"
            options={modelOptions.map((m) => ({ label: m, value: m }))}
            filterOption={(input, option) =>
              (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData} loading={loading}>
            Search
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExport} disabled={data.length === 0}>
            Export Excel
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {/* Summary Cards */}
        {data.length > 0 && (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Total NG Qty"
                    value={totalNgQty}
                    prefix={<BugOutlined style={{ color: '#f5222d' }} />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Unique Defect Types"
                    value={uniqueDefectTypes}
                    prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Unique Models"
                    value={uniqueModels}
                    prefix={<LaptopOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Unique Lots"
                    value={uniqueLots}
                    prefix={<InboxOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {/* Top 10 Defect Types - Horizontal Bar */}
              <Col xs={24} lg={12}>
                <Card title="Top 10 Defect Types by NG Qty" size="small">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={top10Defects} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="qty" fill="#FF6384" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Defect Type Distribution - Donut Chart */}
              <Col xs={24} lg={12}>
                <Card title="Defect Type Distribution" size="small">
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={pieData.slice(0, 10)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name.length > 12 ? name.substring(0, 12) + '...' : name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={{ strokeWidth: 1 }}
                      >
                        {pieData.slice(0, 10).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* Top 10 Models */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24}>
                <Card title="Top 10 Models by NG Qty" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={top10Models} margin={{ left: 20, right: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} height={70} />
                      <YAxis />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="qty" fill="#36A2EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Data Table */}
        <Card title={`Defect Data ${data.length > 0 ? `(${data.length} records)` : ''}`} size="small">
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(record, index) =>
              `${record.inspection_date}-${record.lotno}-${record.defect_id}-${index}`
            }
            size="small"
            scroll={{ x: 1200 }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default DefectTypeAnalysisPage;
