// client/src/pages/training/T47_LotInputImportPage.tsx

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
 * Lot Input Import Training Page
 *
 * Quick Reference Card #47: Lot Input Import
 */
const T47_LotInputImportPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={47}
      totalCards={48}
      title="Lot Input Import"
      subtitle="การดูข้อมูล Lot Input จากระบบการผลิต"
      icon="📦"
      nextLink="/training/useroperation"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวม Lot Input Import">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            Lot Input Import ใช้สำหรับดูข้อมูล Lot Input จากระบบการผลิต (Manufacturing System)
            ข้อมูลนี้จะถูกใช้เมื่อเลือก Lot ในขั้นตอนที่ 2 ของการบันทึก Inspection (OQA, OBA, SIV)
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Interface → Lot Input Import &nbsp; | &nbsp; /interface/lotinput-import
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#856404' }}>
            <strong>สิทธิ์การเข้าถึง:</strong> Admin, Manager
          </p>
        </div>
      </Section>

      {/* Section 2: Important Note */}
      <Section title="ลักษณะพิเศษของหน้านี้">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>📋 หน้านี้เป็นแบบ View Only</h4>
          <List
            items={[
              'แสดงข้อมูล Lot Input จากระบบการผลิตเท่านั้น (ไม่สามารถแก้ไขข้อมูลได้)',
              'ข้อมูลจะถูกดึงมาจากระบบภายนอกโดยอัตโนมัติ',
              'ใช้สำหรับตรวจสอบว่า Lot ที่ต้องการมีอยู่ในระบบ',
              'เป็นแหล่งข้อมูลสำหรับ Lot Selection ใน Inspection',
            ]}
          />
        </div>
      </Section>

      {/* Section 3: Filters */}
      <Section title="ตัวกรอง (Filters)">
        <Table
          headers={['ตัวกรอง', 'รายละเอียด', 'ตัวอย่าง']}
          rows={[
            ['Lot Number', 'ค้นหาตามหมายเลข Lot', 'LOT-2026-001'],
            ['Item Number', 'ค้นหาตามหมายเลขชิ้นส่วน', 'ABC-123'],
            ['Input Date From', 'วันที่เริ่มต้นของช่วงข้อมูล', '2026-01-01'],
            ['Input Date To', 'วันที่สิ้นสุดของช่วงข้อมูล', '2026-01-31'],
          ]}
        />
      </Section>

      {/* Section 4: Data Displayed */}
      <Section title="ข้อมูลที่แสดง">
        <p>ตารางแสดงรายการ Lot Input ที่ดึงจากระบบการผลิต โดยมี Pagination (ค่าเริ่มต้น 50 รายการ/หน้า)</p>
        <Subsection title="ข้อมูลหลัก">
          <List
            items={[
              'Lot Number - หมายเลข Lot',
              'Item Number - หมายเลขชิ้นส่วน',
              'Model / Version - รุ่นและเวอร์ชัน',
              'Part Site - ไซต์การผลิต',
              'Line No - หมายเลขสายการผลิต',
              'Input Date - วันที่ Input เข้าระบบ',
              'Quantity - จำนวนชิ้นงาน',
            ]}
          />
        </Subsection>
      </Section>

      {/* Section 5: How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Interface" → เลือก "Lot Input Import"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'ใช้ตัวกรอง Lot Number หรือ Item Number เพื่อค้นหา Lot ที่ต้องการ',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ใช้ Date Range เพื่อจำกัดช่วงเวลาข้อมูล',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ตรวจสอบข้อมูล Lot ที่แสดงในตาราง',
            },
          ]}
        />
      </Section>

      {/* Section 6: Connection to Inspection */}
      <Section title="ความเชื่อมโยงกับ Inspection">
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>🔗 Lot Input → Inspection</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>ข้อมูล Lot ที่แสดงในหน้านี้คือข้อมูลเดียวกับที่ใช้ใน <strong>Inspection Step 2: Lot Selection</strong></li>
            <li>เมื่อผู้ตรวจสอบ Browse Lot ใน Inspection จะดึงจากตารางนี้</li>
            <li>หาก Lot ไม่พบใน Inspection ให้มาตรวจสอบที่หน้านี้ว่ามีข้อมูลหรือไม่</li>
            <li>ถ้าไม่พบ อาจต้องรอระบบ Sync ข้อมูลจากระบบการผลิต</li>
          </ul>
        </div>
      </Section>

      {/* Section 7: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ไม่พบ Lot Number', 'ตรวจสอบว่า Lot ถูก Input ในระบบการผลิตแล้ว, ลองขยาย Date Range'],
            ['ข้อมูลไม่เป็นปัจจุบัน', 'รอการ Sync อัตโนมัติ หรือติดต่อ IT เพื่อ Sync ด้วยตนเอง'],
            ['ตารางว่าง', 'ตรวจสอบตัวกรอง, ลองล้างตัวกรองทั้งหมด'],
            ['Lot มีใน Interface แต่ไม่พบใน Inspection', 'ตรวจสอบว่า Part Number มีอยู่ใน Master Data → Parts'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Lot Input Import:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Production Team สำหรับข้อมูล Lot</li>
          <li>ติดต่อ IT Support สำหรับปัญหาการเชื่อมต่อ</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T47_LotInputImportPage;
