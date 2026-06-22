// client/src/pages/training/T46_CheckInImportPage.tsx

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
 * Check In Import Training Page
 *
 * Quick Reference Card #46: Check In Import
 */
const T46_CheckInImportPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={46}
      totalCards={48}
      title="Check In Import"
      subtitle="การดูและ Sync ข้อมูล Check-in พนักงาน"
      icon="📥"
      nextLink="/training/lotinput-import"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวม Check In Import">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            Check In Import ใช้สำหรับดูและ Sync ข้อมูลการ Check-in ของพนักงาน (Worker)
            จากระบบ Check-in ภายนอกเข้าสู่ระบบ QC เพื่อใช้อ้างอิงข้อมูลพนักงานที่มาทำงาน
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Interface → Check In Import &nbsp; | &nbsp; /interface/checkin-import
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#856404' }}>
            <strong>สิทธิ์การเข้าถึง:</strong> Admin, Manager
          </p>
        </div>
      </Section>

      {/* Section 2: Filters */}
      <Section title="ตัวกรอง (Filters)">
        <Table
          headers={['ตัวกรอง', 'รายละเอียด', 'ตัวอย่าง']}
          rows={[
            ['Username', 'ค้นหาตามชื่อผู้ใช้', 'john.doe'],
            ['Operator Name', 'ค้นหาตามชื่อพนักงาน', 'สมชาย'],
            ['Line Number', 'กรองตามหมายเลขสายการผลิต', 'L01, L02'],
            ['Group Code', 'กรองตามรหัสกลุ่ม', 'A, B'],
            ['Team', 'กรองตามทีม', 'Team 1'],
            ['Work Shift', 'กรองตามกะทำงาน', 'A, B, Day, Night'],
            ['Work Status', 'กรองตามสถานะการทำงาน', 'Active, Inactive'],
            ['Created Date (From/To)', 'ช่วงวันที่สร้างข้อมูล', '2026-01-01 ถึง 2026-01-31'],
          ]}
        />
      </Section>

      {/* Section 3: Data Table */}
      <Section title="ตารางข้อมูล">
        <p>ตารางแสดงข้อมูล Check-in ของพนักงาน โดยมี Pagination (ค่าเริ่มต้น 50 รายการ/หน้า)</p>
        <List
          items={[
            'ข้อมูลพนักงาน: Username, Operator Name',
            'ข้อมูลการทำงาน: Line Number, Group Code, Team',
            'ข้อมูลกะ: Work Shift, Work Status',
            'ข้อมูลเวลา: Created Date',
          ]}
        />
      </Section>

      {/* Section 4: Sync Process */}
      <Section title="การ Sync ข้อมูล">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'คลิกปุ่ม "Sync" เพื่อเริ่มการ Sync ข้อมูลจากระบบภายนอก',
            },
            {
              label: 'Step 1: Connect',
              description: 'ระบบเชื่อมต่อกับระบบ Check-in ภายนอก',
            },
            {
              label: 'Step 2: Fetch',
              description: 'ดึงข้อมูล Check-in ล่าสุด',
            },
            {
              label: 'Step 3: Import',
              description: 'นำเข้าข้อมูลใหม่ / อัปเดตข้อมูลที่มีอยู่',
            },
            {
              label: 'Step 4: Results',
              description: 'แสดงสรุปผล: Imported, Updated, Skipped, Failed',
            },
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 หมายเหตุ:</strong> ระหว่าง Sync จะมี Progress Indicator แสดงขั้นตอนปัจจุบัน
            กรุณารอจนกว่าจะเสร็จสิ้น อย่าปิดหน้าหรือรีเฟรช
          </p>
        </div>
      </Section>

      {/* Section 5: Sync Statistics */}
      <Section title="สถิติผลการ Sync">
        <Table
          headers={['สถิติ', 'ความหมาย']}
          rows={[
            ['Total Records', 'จำนวนรายการทั้งหมดที่อ่านจากระบบภายนอก'],
            ['Imported', 'จำนวนรายการใหม่ที่เพิ่มเข้าระบบ QC'],
            ['Updated', 'จำนวนรายการที่มีอยู่แล้วและอัปเดตข้อมูล'],
            ['Skipped', 'จำนวนรายการที่ข้าม (ไม่มีการเปลี่ยนแปลง)'],
            ['Failed', 'จำนวนรายการที่นำเข้าล้มเหลว'],
          ]}
        />
      </Section>

      {/* Section 6: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['Sync ล้มเหลว', 'ตรวจสอบการเชื่อมต่อเครือข่าย และสถานะระบบ Check-in ภายนอก'],
            ['ไม่พบข้อมูลพนักงาน', 'ตรวจสอบตัวกรอง, ลองล้างตัวกรองทั้งหมด'],
            ['ข้อมูลไม่เป็นปัจจุบัน', 'ทำ Sync ใหม่เพื่อดึงข้อมูลล่าสุด'],
            ['จำนวน Failed สูง', 'ตรวจสอบข้อมูลต้นทาง อาจมีรูปแบบไม่ถูกต้อง'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Check In Import:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ IT Support สำหรับปัญหาการเชื่อมต่อ</li>
          <li>ติดต่อ HR สำหรับข้อมูลพนักงานที่ไม่ถูกต้อง</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T46_CheckInImportPage;
