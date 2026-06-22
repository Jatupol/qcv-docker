// client/src/pages/training/T48_UserOperationPage.tsx

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
 * User Operation Import Training Page
 *
 * Quick Reference Card #48: User Operation
 */
const T48_UserOperationPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={48}
      totalCards={48}
      title="User Operation"
      subtitle="การดูและ Sync ข้อมูลพนักงานจาก MSSQL"
      icon="👥"
      nextLink="/training/t15"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวม User Operation">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            User Operation ใช้สำหรับดูและ Sync ข้อมูลพนักงาน/Operator จากฐานข้อมูล MSSQL ภายนอก
            เข้าสู่ระบบ QC เพื่อใช้อ้างอิงข้อมูลผู้ตรวจสอบ (QC, Inspector) ในการบันทึก Inspection และรายงาน
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Interface → User Operation &nbsp; | &nbsp; /interface/useroperation
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
            ['Username', 'ค้นหาตามชื่อผู้ใช้ (Case-insensitive)', 'john.doe'],
            ['Operator Name', 'ค้นหาตามชื่อพนักงาน', 'สมชาย ใจดี'],
            ['Role Code', 'กรองตามรหัสบทบาท', 'QC, Inspector, Lead'],
            ['Line Number', 'กรองตามหมายเลขสายการผลิต', 'L01, L02'],
            ['Work Shift', 'กรองตามกะทำงาน', 'A, B, Day, Night'],
            ['Active Status', 'กรองตามสถานะใช้งาน', 'Active / Inactive'],
            ['MRB Status', 'กรองตามสถานะ Materials Review Board', 'Yes / No'],
          ]}
        />
      </Section>

      {/* Section 3: Data Table */}
      <Section title="ตารางข้อมูล">
        <p>ตารางแสดงข้อมูลพนักงาน/Operator โดยมี Pagination (ค่าเริ่มต้น 30 รายการ/หน้า)</p>
        <Subsection title="ข้อมูลที่แสดง">
          <List
            items={[
              'Username - ชื่อผู้ใช้ในระบบ',
              'Operator Name - ชื่อพนักงาน',
              'Role Code - รหัสบทบาท (QC, Inspector, Lead ฯลฯ)',
              'Line Number - หมายเลขสายการผลิต',
              'Work Shift - กะทำงาน',
              'Active Status - สถานะใช้งาน',
              'MRB Status - สถานะ Materials Review Board',
            ]}
          />
        </Subsection>
      </Section>

      {/* Section 4: Sync Process */}
      <Section title="การ Sync ข้อมูล">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'คลิกปุ่ม "Sync" เพื่อเริ่มการ Sync ข้อมูลจากฐานข้อมูล MSSQL',
            },
            {
              label: 'Step 1: Connect',
              description: 'ระบบเชื่อมต่อกับฐานข้อมูล MSSQL ภายนอก',
            },
            {
              label: 'Step 2: Fetch',
              description: 'ดึงข้อมูลพนักงาน/Operator ล่าสุด',
            },
            {
              label: 'Step 3: Import',
              description: 'นำเข้าข้อมูลใหม่ / อัปเดตข้อมูลที่มีอยู่ในระบบ QC',
            },
            {
              label: 'Step 4: Results',
              description: 'แสดงสรุปผล: Imported, Updated, Skipped, Failed',
            },
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 หมายเหตุ:</strong> การ Sync จะเปรียบเทียบข้อมูลปัจจุบันกับข้อมูลใน MSSQL
            หากข้อมูลเหมือนกันจะถูก Skip เพื่อไม่ให้อัปเดตซ้ำโดยไม่จำเป็น
          </p>
        </div>
      </Section>

      {/* Section 5: Sync Statistics */}
      <Section title="สถิติผลการ Sync">
        <Table
          headers={['สถิติ', 'ความหมาย']}
          rows={[
            ['Imported', 'พนักงานใหม่ที่เพิ่มเข้าระบบ QC'],
            ['Updated', 'พนักงานที่มีอยู่แล้วและอัปเดตข้อมูล (เช่น เปลี่ยนสาย, เปลี่ยนกะ)'],
            ['Skipped', 'พนักงานที่ข้อมูลไม่เปลี่ยนแปลง'],
            ['Failed', 'รายการที่นำเข้าล้มเหลว (ดูรายละเอียดข้อผิดพลาด)'],
          ]}
        />
      </Section>

      {/* Section 6: MSSQL Connection */}
      <Section title="การเชื่อมต่อ MSSQL">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🔗 แหล่งข้อมูล</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>ข้อมูลพนักงานจะถูกดึงจากฐานข้อมูล <strong>MSSQL</strong> ของระบบภายนอก</li>
            <li>การตั้งค่าการเชื่อมต่อ MSSQL สามารถจัดการได้ที่หน้า <strong>Settings</strong></li>
            <li>หากการเชื่อมต่อล้มเหลว ตรวจสอบ: Host, Port, Database Name, Credentials ใน Settings</li>
          </ul>
        </div>
      </Section>

      {/* Section 7: Connection to Inspection */}
      <Section title="ความเชื่อมโยงกับระบบอื่น">
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>🔗 User Operation → ระบบ QC</h4>
          <Table
            headers={['ข้อมูล', 'ใช้ใน', 'วัตถุประสงค์']}
            rows={[
              ['Operator Name', 'รายงาน OQA Reject All Defect', 'แสดงชื่อ QC, QC Lead, Inspector'],
              ['Role Code', 'การกำหนดสิทธิ์', 'แยกบทบาท QC กับ Inspector'],
              ['Line Number', 'การกรองข้อมูล Inspection', 'แสดงข้อมูลตามสายการผลิต'],
              ['Work Shift', 'การกรองข้อมูล Inspection', 'แสดงข้อมูลตามกะทำงาน'],
            ]}
          />
        </div>
      </Section>

      {/* Section 8: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['Sync ล้มเหลว (Connection Error)', 'ตรวจสอบการตั้งค่า MSSQL ใน Settings, ตรวจสอบเครือข่าย'],
            ['ไม่พบพนักงาน', 'ตรวจสอบตัวกรอง, ลองล้างตัวกรองทั้งหมด'],
            ['ข้อมูลพนักงานไม่อัปเดต', 'ทำ Sync ใหม่เพื่อดึงข้อมูลล่าสุดจาก MSSQL'],
            ['Role Code ไม่ถูกต้อง', 'ตรวจสอบข้อมูลต้นทางในระบบ MSSQL'],
            ['Active Status ไม่ตรง', 'ทำ Sync ใหม่ หรือตรวจสอบข้อมูลใน MSSQL'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ User Operation:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ IT Support สำหรับปัญหาการเชื่อมต่อ MSSQL</li>
          <li>ติดต่อ HR สำหรับข้อมูลพนักงานที่ไม่ถูกต้อง</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T48_UserOperationPage;
