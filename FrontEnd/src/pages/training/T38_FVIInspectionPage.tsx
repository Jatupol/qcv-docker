// client/src/pages/training/T38_FVIInspectionPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  HelpBox,
  Subsection,
  List,
} from '../../components/training/TrainingComponents';

/**
 * FVI Inspection (Validation with DBFVI) Training Page
 *
 * Quick Reference Card #38: Validation with DBFVI
 */
const T38_FVIInspectionPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={38}
      totalCards={48}
      title="Validation with DBFVI"
      subtitle="การตรวจสอบความถูกต้องกับ DBFVI"
      icon="✅"
      nextLink="/training/defect-type-analysis"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของ Validation with DBFVI">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            Validation with DBFVI ใช้สำหรับตรวจสอบข้อมูลการตรวจสอบ (Inspection Data) โดยเปรียบเทียบกับฐานข้อมูล FVI
            เพื่อยืนยันว่าข้อมูลในระบบ QCV ตรงกับข้อมูลจากระบบ FVI ของ Production
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Inspection → Validation with DBFVI &nbsp; | &nbsp; /report/fvi-inspection
          </p>
        </div>
      </Section>

      {/* Section 2: How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Inspection" → เลือก "Validation with DBFVI"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Date Range (Input Date From - To)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'กรอก Lot Number (ถ้าต้องการค้นหาเฉพาะล็อต)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Judgment: All / Pass / Reject / Not Inspect (ถ้าต้องการกรองผลการตรวจ)',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Search" เพื่อค้นหาข้อมูล',
            },
          ]}
        />
      </Section>

      {/* Section 3: Filters */}
      <Section title="ตัวกรอง (Filters)">
        <Table
          headers={['Filter', 'รายละเอียด', 'ค่าเริ่มต้น']}
          rows={[
            ['Input Date From', 'วันที่เริ่มต้น', 'วันนี้'],
            ['Input Date To', 'วันที่สิ้นสุด', 'วันนี้'],
            ['Lot Number', 'หมายเลขล็อต (ไม่บังคับ)', 'ว่าง'],
            ['Judgment', 'ผลการตรวจสอบ: All/Pass/Reject/Not Inspect', 'All'],
          ]}
        />
      </Section>

      {/* Section 4: Understanding Results */}
      <Section title="การเข้าใจผลลัพธ์">
        <Subsection title="ตารางข้อมูล">
          <p>แสดงข้อมูลเปรียบเทียบระหว่าง QCV กับ DBFVI:</p>
          <ul>
            <li><strong>Input Date:</strong> วันที่นำเข้าข้อมูล</li>
            <li><strong>Lot No:</strong> หมายเลขล็อต</li>
            <li><strong>Part Site:</strong> สถานที่ผลิตชิ้นส่วน</li>
            <li><strong>Line No:</strong> หมายเลขสาย</li>
            <li><strong>Item No:</strong> หมายเลขชิ้นส่วน</li>
            <li><strong>Model:</strong> รุ่นผลิตภัณฑ์</li>
            <li><strong>Version:</strong> เวอร์ชัน</li>
            <li><strong>Station:</strong> สถานีตรวจสอบ</li>
            <li><strong>Round:</strong> รอบการตรวจสอบ</li>
            <li><strong>FVI Line No:</strong> หมายเลขสายจาก FVI</li>
            <li><strong>Judgment:</strong> ผลการตรวจ (Pass / Reject / Not Inspect)</li>
            <li><strong>Inspection Date:</strong> วันที่ตรวจสอบ</li>
          </ul>
        </Subsection>
      </Section>

      {/* Section 5: Judgment Status */}
      <Section title="ผลการตรวจสอบ (Judgment)">
        <Table
          headers={['สถานะ', 'ความหมาย', 'สี']}
          rows={[
            ['Pass', 'ผ่านการตรวจสอบ FVI', 'เขียว'],
            ['Reject', 'ไม่ผ่านการตรวจสอบ FVI', 'แดง'],
            ['Not Inspect', 'ยังไม่ได้ตรวจสอบใน FVI', 'เทา'],
          ]}
        />
      </Section>

      {/* Section 6: Export */}
      <Section title="การส่งออกรายงาน (Export)">
        <StepBox
          steps={[
            {
              label: 'Export to Excel',
              description: 'คลิกปุ่ม "Export Excel" เพื่อดาวน์โหลดข้อมูลทั้งหมดในรูปแบบ Excel',
            },
          ]}
        />
      </Section>

      {/* Section 7: Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '✅ ตรวจสอบว่า Lot ผ่าน FVI ก่อนส่งมอบ',
            '🔍 ค้นหา Lot ที่ยังไม่ได้ตรวจสอบ FVI',
            '📋 ตรวจสอบ Lot ที่ Reject จาก FVI เพื่อดำเนินการแก้ไข',
            '📊 วิเคราะห์อัตราการ Pass/Reject ของ FVI ตามช่วงเวลา',
            '🔄 เปรียบเทียบข้อมูล QCV กับข้อมูล Production',
          ]}
        />
      </Section>

      {/* Section 8: Pagination */}
      <Section title="การแบ่งหน้า (Pagination)">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            ข้อมูลจะแสดง <strong>30 รายการต่อหน้า</strong> ใช้ปุ่มเลื่อนหน้าด้านล่างตารางเพื่อดูข้อมูลเพิ่มเติม
          </p>
        </div>
      </Section>

      {/* Section 9: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ไม่พบข้อมูล', 'ตรวจสอบช่วงวันที่, ลอง Lot Number ที่ถูกต้อง'],
            ['ข้อมูลไม่ตรง', 'ตรวจสอบว่า DBFVI มีการ sync ล่าสุด, ติดต่อ IT'],
            ['โหลดช้า', 'ลดช่วงวันที่ให้แคบลง'],
            ['Export ไม่สำเร็จ', 'ลดจำนวนข้อมูล, ลองใหม่อีกครั้ง'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Validation with DBFVI:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T38_FVIInspectionPage;
