// client/src/pages/training/T14_InterfacePage.tsx

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
 * Interface Overview Training Page
 *
 * Quick Reference Card #14: ภาพรวมเมนู Interface - การเชื่อมต่อข้อมูลจากระบบภายนอก
 */
const T14_InterfacePage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={14}
      totalCards={48}
      title="Interface (ภาพรวม)"
      subtitle="การเชื่อมต่อและนำเข้าข้อมูลจากระบบภายนอก"
      icon="🔗"
      nextLink="/training/checkin-import"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของเมนู Interface">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            เมนู Interface ใช้สำหรับเชื่อมต่อและนำเข้าข้อมูลจากระบบภายนอก (External Systems)
            เข้าสู่ระบบ QC เพื่อให้ข้อมูลพร้อมใช้งานในการบันทึก Inspection และรายงานต่างๆ
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Sidebar Menu → Interface
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#856404' }}>
            <strong>สิทธิ์การเข้าถึง:</strong> Admin, Manager เท่านั้น (เมนู Sidebar)
          </p>
        </div>
      </Section>

      {/* Section 2: Available Interfaces */}
      <Section title="หน้าจอทั้งหมดในเมนู Interface">
        <Table
          headers={['หน้าจอ', 'เส้นทาง', 'วัตถุประสงค์', 'แหล่งข้อมูล']}
          rows={[
            ['Check In Import', '/interface/checkin-import', 'ดูและ Sync ข้อมูลการ Check-in พนักงาน', 'ระบบ Check-in ภายนอก'],
            ['Lot Input Import', '/interface/lotinput-import', 'ดูข้อมูล Lot Input จากระบบการผลิต', 'ระบบ Manufacturing'],
            ['User Operation', '/interface/useroperation', 'ดูและ Sync ข้อมูลพนักงาน/Operator', 'ฐานข้อมูล MSSQL'],
          ]}
        />
      </Section>

      {/* Section 3: Data Flow */}
      <Section title="การไหลของข้อมูล (Data Flow)">
        <div style={{ background: '#f0f4f8', padding: '20px', borderRadius: '8px' }}>
          <Subsection title="ขั้นตอนการ Sync ข้อมูล (4 ขั้นตอน)">
            <StepBox
              steps={[
                {
                  label: 'Step 1: Connect',
                  description: 'ระบบเชื่อมต่อกับแหล่งข้อมูลภายนอก (External Database / API)',
                },
                {
                  label: 'Step 2: Fetch',
                  description: 'ดึงข้อมูลจากระบบภายนอก',
                },
                {
                  label: 'Step 3: Import',
                  description: 'นำเข้าข้อมูลเข้าสู่ฐานข้อมูล QC (เพิ่มใหม่ / อัปเดตที่มีอยู่)',
                },
                {
                  label: 'Step 4: Results',
                  description: 'แสดงผลลัพธ์: จำนวน Imported, Updated, Skipped, Failed',
                },
              ]}
            />
          </Subsection>
        </div>
      </Section>

      {/* Section 4: Common Features */}
      <Section title="ฟีเจอร์ร่วมของทุกหน้า Interface">
        <Subsection title="การค้นหาและกรอง">
          <List
            items={[
              'ช่องค้นหา (Search) สำหรับค้นหาตามฟิลด์ต่างๆ',
              'ตัวกรอง (Filters) หลายเงื่อนไขพร้อมกัน',
              'การกรองตามช่วงวันที่ (Date Range)',
              'Pagination สำหรับข้อมูลจำนวนมาก (ค่าเริ่มต้น 50 รายการ/หน้า)',
            ]}
          />
        </Subsection>

        <Subsection title="ผลลัพธ์การ Sync">
          <Table
            headers={['สถานะ', 'ความหมาย']}
            rows={[
              ['Imported', 'รายการใหม่ที่เพิ่มเข้าระบบ QC'],
              ['Updated', 'รายการที่มีอยู่แล้วและถูกอัปเดต'],
              ['Skipped', 'รายการที่ข้ามเนื่องจากไม่มีการเปลี่ยนแปลง'],
              ['Failed', 'รายการที่นำเข้าไม่สำเร็จ (ดูรายละเอียดข้อผิดพลาด)'],
            ]}
          />
        </Subsection>
      </Section>

      {/* Section 5: Connection to Inspection */}
      <Section title="ความเชื่อมโยงกับระบบ Inspection">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🔗 ข้อมูลจาก Interface ถูกใช้ใน:</h4>
          <Table
            headers={['ข้อมูล', 'ใช้ใน', 'ตัวอย่าง']}
            rows={[
              ['Check-in Data', 'ตรวจสอบพนักงานที่ Check-in', 'ยืนยันว่าพนักงานมาทำงาน'],
              ['Lot Input', 'เลือก Lot ใน Inspection Step 2', 'ค้นหา Lot Number สำหรับตรวจสอบ'],
              ['User Operation', 'ข้อมูลพนักงาน QC, Inspector', 'แสดงชื่อผู้ตรวจสอบในรายงาน'],
            ]}
          />
        </div>
      </Section>

      {/* Section 6: Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <List
          items={[
            'ทำการ Sync ข้อมูลเป็นประจำเพื่อให้ข้อมูลเป็นปัจจุบัน',
            'ตรวจสอบผลลัพธ์หลัง Sync ทุกครั้ง โดยเฉพาะจำนวน Failed',
            'หาก Sync ล้มเหลว ตรวจสอบการเชื่อมต่อกับระบบภายนอก',
            'ใช้ตัวกรอง Date Range เพื่อจำกัดข้อมูลที่แสดง',
            'ติดต่อ IT หากพบข้อมูลไม่ตรงกันระหว่างระบบ',
          ]}
        />
      </Section>

      {/* Section 7: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['Sync ล้มเหลว (Connection Error)', 'ตรวจสอบการเชื่อมต่อเครือข่ายและสถานะระบบภายนอก'],
            ['ข้อมูลไม่แสดง', 'ตรวจสอบตัวกรอง Date Range, รีเฟรชหน้า (F5)'],
            ['จำนวน Failed สูง', 'ตรวจสอบรายละเอียดข้อผิดพลาด อาจมีปัญหาข้อมูลต้นทาง'],
            ['ข้อมูลไม่ตรงกับระบบภายนอก', 'ทำ Sync ใหม่ หรือติดต่อ IT Support'],
            ['ไม่เห็นเมนู Interface', 'ตรวจสอบสิทธิ์ผู้ใช้ ต้องเป็น Admin หรือ Manager'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Interface:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ดูคู่มือเฉพาะหน้า: Check In Import, Lot Input Import, User Operation</li>
          <li>ติดต่อ IT Support สำหรับปัญหาการเชื่อมต่อ</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T14_InterfacePage;
