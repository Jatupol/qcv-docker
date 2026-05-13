// client/src/pages/report/customer/OQARejectAllDefectPage.tsx
// ===== OQA REJECT ALL DEFECT PAGE =====
// Shows all defect data from OQA inspections with filter and data table

import React, { useState, useCallback, useEffect } from 'react';
import { DatePicker, Table, Card, Button, Space, Spin, Select, Image, message } from 'antd';
import {
  SearchOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import ExcelJS from 'exceljs';
import { getDefectTypeAnalysis, getAvailableModels } from '../../../services/reportService';
import { useShiftOptions } from '../../../services/sysconfigService';
import { formatDate } from '../../../utils/formatUtils';
import { getRuntimeEnv } from '../../../config/runtimeConfig';

const { RangePicker } = DatePicker;

const API_BASE = getRuntimeEnv('VITE_API_BASE_URL') ?? '';

// ============ INTERFACES ============

interface DefectTypeAnalysisRecord {
  inspection_date: string;
  itemno: string;
  model: string;
  version: string;
  lotno: string;
  shift: string;
  tab: string;
  station: string;
  defect_id: number;
  defect_type: string;
  name: string;
  description: string;
  ng_qty: number;
  qc_name: string;
  qc_fullname: string;
  qclead_name: string;
  qclead_fullname: string;
  inspector: string;
  inspector_fullname: string;
  groupvi: string;
  defect_station: string;
  mbr_name: string;
  defect_date: string;
  defect_detail: string;
  image_ids: number[] | null;
  photo_magnification: string;
  stamp: string;
}

// ============ COMPONENT ============

const OQARejectAllDefectPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DefectTypeAnalysisRecord[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const { options: shiftOptions } = useShiftOptions();

  // ============ LOAD MODEL OPTIONS ============

  useEffect(() => {
    const loadModels = async () => {
      try {
        const result = await getAvailableModels();
        if (result.success && result.data) {
          setModelOptions(result.data);
        }
      } catch {
        // silently ignore
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
      const params: { dateFrom: string; dateTo: string; models?: string[]; shifts?: string[] } = {
        dateFrom: dateRange[0].format('YYYY-MM-DD'),
        dateTo: dateRange[1].format('YYYY-MM-DD'),
      };
      if (selectedModels.length > 0) {
        params.models = selectedModels;
      }
      if (selectedShifts.length > 0) {
        params.shifts = selectedShifts;
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
    } catch {
      message.error('Failed to fetch defect data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedModels, selectedShifts]);

  // ============ EXPORT ============

  const handleExport = async () => {
    if (data.length === 0) {
      message.warning('No data to export');
      return;
    }

    setExporting(true);
    const hideLoading = message.loading('กำลังส่งออก Excel พร้อมรูปภาพ...', 0);

    try {
      // Column definitions with bilingual headers
      const excelColumns = [
        { key: 'no', header: 'No.\n(ลำดับ)', width: 7 },
        { key: 'defect_date', header: 'Defect Date\n(วันที่บันทึก)', width: 13 },
        { key: 'shift', header: 'Shift\n(กะ)', width: 7 },
        { key: 'model', header: 'Model & Version', width: 18 },
        { key: 'tab', header: 'Tab', width: 7 },
        { key: 'lotno', header: 'Lot no.', width: 15 },
        { key: 'defect_type', header: 'Defect type', width: 15 },
        { key: 'station', header: 'Sampling station\n(OQA, SIV, OBA)', width: 15 },
        { key: 'name', header: 'Defect name\n(ชื่อข้อบกพร่อง)', width: 18 },
        { key: 'defect_photo', header: 'Defect photo\n(ภาพถ่าย)', width: 22, isImage: true },
        { key: 'photo_magnification', header: 'Photo Mag.\n(กำลังขยาย)', width: 13 },
        { key: 'ng_qty', header: "Defect Q'ty\n(จำนวน Reject)", width: 12 },
        { key: 'stamp', header: 'N stamp\n(หมายเลข LB)', width: 12 },
        { key: 'qc_name', header: 'QC reject Name\n(QC ตรวจจับ)', width: 20 },
        { key: 'qclead_name', header: 'QC Leader Name\n(หัวหน้างาน QC)', width: 18 },
        { key: 'inspector', header: 'FVI Inspector Name\n(พนักงาน FVI)', width: 20 },
        { key: 'groupvi', header: 'Group\n(Streamline)', width: 10 },
        { key: 'defect_station', header: 'Station\n(ตำแหน่ง)', width: 14 },
        { key: 'mbr_name', header: 'FVI Leader Confirm\nName\n(หัวหน้างาน MFG)', width: 18 },
        { key: 'defect_date', header: 'Recording time\n(เวลาบันทึก)', width: 14 },
        { key: 'defect_detail', header: 'Remark\n(หมายเหตุ)', width: 20 },
      ];
      const IMAGE_COL_INDEX = excelColumns.findIndex(c => c.key === 'defect_photo');

      // 1. Explode rows: 1 image per row
      const explodedData: (DefectTypeAnalysisRecord & { image_id: number | null })[] = [];
      data.forEach((r) => {
        if (r.image_ids && r.image_ids.length > 0) {
          r.image_ids.forEach((imgId) => {
            explodedData.push({ ...r, image_id: imgId });
          });
        } else {
          explodedData.push({ ...r, image_id: null });
        }
      });

      // 2. Fetch all unique images as base64
      const uniqueImageIds = [...new Set(explodedData.filter(r => r.image_id).map(r => r.image_id!))];
      const imageBase64Map = new Map<number, string>();
      await Promise.all(
        uniqueImageIds.map(async (id) => {
          try {
            const response = await fetch(`${API_BASE}/api/defect-image/${id}`, { credentials: 'include' });
            if (response.ok) {
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
              });
              imageBase64Map.set(id, base64);
            }
          } catch { /* skip failed images */ }
        })
      );

      // 3. Group by shift
      const uniqueShifts = [...new Set(explodedData.map(r => r.shift))].sort();
      const sheetGroups = uniqueShifts.length > 1
        ? uniqueShifts.map(s => ({ shift: s, rows: explodedData.filter(r => r.shift === s) }))
        : [{ shift: uniqueShifts[0] || '', rows: explodedData }];

      // 4. Build workbook
      const workbook = new ExcelJS.Workbook();
      const dateStr = `${dateRange[0].format('DD-MM-YYYY')} - ${dateRange[1].format('DD-MM-YYYY')}`;

      // Add images to workbook (reusable across sheets)
      const excelImageIds = new Map<number, number>();
      for (const [imgId, base64] of imageBase64Map) {
        excelImageIds.set(imgId, workbook.addImage({ base64, extension: 'jpeg' }));
      }

      // Helper: get cell value for a row
      const getCellValue = (row: DefectTypeAnalysisRecord & { image_id: number | null }, key: string, idx: number): string | number => {
        switch (key) {
          case 'no': return idx + 1;
          case 'model': return `${row.model} ${row.version}`;
          case 'qc_name': return row.qc_fullname ? `${row.qc_name} (${row.qc_fullname})` : (row.qc_name || '');
          case 'qclead_name': return row.qclead_fullname ? `${row.qclead_name} (${row.qclead_fullname})` : (row.qclead_name || '');
          case 'inspector': return row.inspector_fullname ? `${row.inspector} (${row.inspector_fullname})` : (row.inspector || '');
          case 'defect_date': return row.defect_date ? formatDate(row.defect_date) : '';
          case 'defect_photo': return '';
          default: return (row as any)[key] ?? '';
        }
      };

      for (const { shift, rows } of sheetGroups) {
        const sheetName = uniqueShifts.length > 1 ? `Shift ${shift}` : 'OQA Reject All Defect';
        const ws = workbook.addWorksheet(sheetName);

        // Set column widths
        excelColumns.forEach((col, idx) => {
          ws.getColumn(idx + 1).width = col.width;
        });

        // Row 1: Title
        ws.mergeCells(1, 1, 1, excelColumns.length);
        const titleCell = ws.getCell(1, 1);
        titleCell.value = `งาน QC Reject สรุปสำหรับวันที่ ${dateStr} Shift: ${shift}`;
        titleCell.font = { bold: true, size: 14, color: { argb: 'FF000080' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getRow(1).height = 30;

        // Row 2: Empty

        // Row 3: Headers (yellow background, bilingual, wrap text)
        const headerRow = ws.getRow(3);
        excelColumns.forEach((col, idx) => {
          const cell = headerRow.getCell(idx + 1);
          cell.value = col.header;
          cell.font = { bold: true, size: 10 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        headerRow.height = 55;

        // Row 4+: Data
        rows.forEach((row, idx) => {
          const excelRowNum = idx + 4;
          const dataRow = ws.getRow(excelRowNum);
          const hasImage = row.image_id !== null && excelImageIds.has(row.image_id!);

          excelColumns.forEach((col, colIdx) => {
            const cell = dataRow.getCell(colIdx + 1);
            cell.value = getCellValue(row, col.key, idx);
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });

          // Embed image
          if (hasImage) {
            ws.addImage(excelImageIds.get(row.image_id!)!, {
              tl: { col: IMAGE_COL_INDEX + 0.05, row: excelRowNum - 1 + 0.05 } as any,
              ext: { width: 140, height: 90 },
            });
            dataRow.height = 70;
          } else {
            dataRow.height = 20;
          }
        });
      }

      // 5. Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OQA_Reject_All_Defect_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      message.error('Failed to export Excel');
    } finally {
      hideLoading();
      setExporting(false);
    }
  };

  // ============ TABLE COLUMNS ============

  const columns: ColumnsType<DefectTypeAnalysisRecord> = [
    {
      title: <span>No.<br/><span style={{ fontSize: 10, color: '#888' }}>(ลำดับ)</span></span>,
      key: 'no',
      width: 50,
      align: 'center',
      fixed: 'left',
      render: (_val, _record, index) => index + 1,
    },
    {
      title: <span>Defect Date<br/><span style={{ fontSize: 10, color: '#888' }}>(วันที่บันทึก)</span></span>,
      dataIndex: 'defect_date',
      key: 'defect_date_col',
      sorter: (a, b) => (a.defect_date || '').localeCompare(b.defect_date || ''),
      render: (val: string) => val ? formatDate(val) : '',
      width: 110,
      fixed: 'left',
    },
    {
      title: <span>Shift<br/><span style={{ fontSize: 10, color: '#888' }}>(กะ)</span></span>,
      dataIndex: 'shift',
      key: 'shift',
      filters: shiftOptions.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.shift === value,
      width: 70,
      align: 'center',
    },
    {
      title: 'Model & Version',
      key: 'model_version',
      sorter: (a, b) => `${a.model} ${a.version}`.localeCompare(`${b.model} ${b.version}`),
      render: (_val, record) => `${record.model} ${record.version}`.trim(),
      width: 150,
    },
    {
      title: 'Tab',
      dataIndex: 'tab',
      key: 'tab',
      width: 70,
      align: 'center',
    },
    {
      title: 'Lot no.',
      dataIndex: 'lotno',
      key: 'lotno',
      sorter: (a, b) => a.lotno.localeCompare(b.lotno),
      width: 140,
    },
    {
      title: 'Defect type',
      dataIndex: 'defect_type',
      key: 'defect_type',
      filters: [...new Set(data.map((r) => r.defect_type))].map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.defect_type === value,
      width: 120,
    },
    {
      title: <span>Sampling station<br/><span style={{ fontSize: 10, color: '#888' }}>(OQA, SIV, OBA)</span></span>,
      dataIndex: 'station',
      key: 'station',
      filters: [...new Set(data.map((r) => r.station).filter(Boolean))].map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.station === value,
      width: 110,
      align: 'center',
    },
    {
      title: <span>Defect name<br/><span style={{ fontSize: 10, color: '#888' }}>(ชื่อข้อบกพร่อง)</span></span>,
      dataIndex: 'name',
      key: 'name',
      filters: [...new Set(data.map((r) => r.name))].map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.name === value,
      width: 150,
    },
    {
      title: <span>Defect photo<br/><span style={{ fontSize: 10, color: '#888' }}>(ภาพถ่าย)</span></span>,
      key: 'defect_photo',
      width: 100,
      align: 'center',
      render: (_val, record) => {
        if (!record.image_ids || record.image_ids.length === 0) return '-';
        return (
          <Image.PreviewGroup>
            {record.image_ids.map((imgId) => (
              <Image
                key={imgId}
                src={`${API_BASE}/api/defect-image/${imgId}`}
                width={40}
                height={40}
                style={{ objectFit: 'cover', marginRight: 2 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkQ0l6vQAAAABJRU5ErkJggg=="
              />
            ))}
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: <span>Photo Mag.<br/><span style={{ fontSize: 10, color: '#888' }}>(กำลังขยาย)</span></span>,
      dataIndex: 'photo_magnification',
      key: 'photo_magnification',
      width: 90,
      align: 'center',
      render: (val: string) => val || '-',
    },
    {
      title: <span>Defect Q'ty<br/><span style={{ fontSize: 10, color: '#888' }}>(จำนวน Reject)</span></span>,
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
    {
      title: <span>N stamp<br/><span style={{ fontSize: 10, color: '#888' }}>(หมายเลข LB)</span></span>,
      dataIndex: 'stamp',
      key: 'stamp',
      width: 90,
      align: 'center',
      render: (val: string) => val || '-',
    },
    {
      title: <span>QC reject Name<br/><span style={{ fontSize: 10, color: '#888' }}>(QC ตรวจจับ)</span></span>,
      dataIndex: 'qc_name',
      key: 'qc_name',
      width: 160,
      render: (_val: string, record) => {
        const id = record.qc_name;
        const name = record.qc_fullname;
        if (!id) return '';
        return name ? `${id} (${name})` : id;
      },
    },
    {
      title: <span>QC Leader Name<br/><span style={{ fontSize: 10, color: '#888' }}>(หัวหน้างาน QC)</span></span>,
      dataIndex: 'qclead_name',
      key: 'qclead_name',
      width: 160,
      render: (_val: string, record) => {
        const id = record.qclead_name;
        const name = record.qclead_fullname;
        if (!id) return '';
        return name ? `${id} (${name})` : id;
      },
    },
    {
      title: <span>FVI Inspector Name<br/><span style={{ fontSize: 10, color: '#888' }}>(พนักงาน FVI)</span></span>,
      dataIndex: 'inspector',
      key: 'inspector',
      width: 160,
      render: (_val: string, record) => {
        const id = record.inspector;
        const name = record.inspector_fullname;
        if (!id) return '';
        return name ? `${id} (${name})` : id;
      },
    },
    {
      title: <span>Group<br/><span style={{ fontSize: 10, color: '#888' }}>(Streamline)</span></span>,
      dataIndex: 'groupvi',
      key: 'groupvi',
      width: 80,
      align: 'center',
      render: (val: string) => val || '',
    },
    {
      title: <span>Station<br/><span style={{ fontSize: 10, color: '#888' }}>(ตำแหน่ง)</span></span>,
      dataIndex: 'defect_station',
      key: 'defect_station',
      width: 80,
      align: 'center',
      render: (val: string) => val || '',
    },
    {
      title: <span>FVI Leader Confirm<br/><span style={{ fontSize: 10, color: '#888' }}>(หัวหน้างาน MFG)</span></span>,
      dataIndex: 'mbr_name',
      key: 'mbr_name',
      width: 140,
      render: (val: string) => val || '',
    },
    {
      title: <span>Recording time<br/><span style={{ fontSize: 10, color: '#888' }}>(เวลาบันทึก)</span></span>,
      dataIndex: 'defect_date',
      key: 'defect_date',
      width: 120,
      render: (val: string) => val ? formatDate(val) : '',
    },
    {
      title: <span>Remark<br/><span style={{ fontSize: 10, color: '#888' }}>(หมายเหตุ)</span></span>,
      dataIndex: 'defect_detail',
      key: 'defect_detail',
      ellipsis: true,
      width: 150,
      render: (val: string) => val || '',
    },
  ];

  // ============ RENDER ============

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>OQA. Reject All Defect</h2>
        <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
          All defect data from OQA inspections
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
          <Select
            mode="multiple"
            allowClear
            placeholder="All Shifts"
            value={selectedShifts}
            onChange={setSelectedShifts}
            style={{ minWidth: 150 }}
            maxTagCount="responsive"
            options={shiftOptions.map((s) => ({ label: s.label, value: s.value }))}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData} loading={loading}>
            Search
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExport} disabled={data.length === 0 || exporting} loading={exporting}>
            Export Excel
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {/* Data Table */}
        <Card title={`Defect Data ${data.length > 0 ? `(${data.length} records)` : ''}`} size="small">
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(_record, index) => `${index}`}
            size="small"
            scroll={{ x: 2400 }}
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

export default OQARejectAllDefectPage;
