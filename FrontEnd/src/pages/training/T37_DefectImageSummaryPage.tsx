// client/src/pages/training/T37_DefectImageSummaryPage.tsx

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
 * Defect Image Summary Training Page
 *
 * Quick Reference Card #37: Defect Image Summary
 */
const T37_DefectImageSummaryPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={37}
      totalCards={48}
      title="Defect Image Summary"
      subtitle="สรุปรูปภาพข้อบกพร่อง"
      icon="📸"
      nextLink="/training/t14"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของรายงาน Defect Image Summary">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์ของรายงาน</h4>
          <p style={{ margin: 0 }}>
            Defect Image Summary ใช้สำหรับดูรวมรูปภาพข้อบกพร่องทั้งหมดที่บันทึกในระบบ โดยสามารถกรองตาม
            Site, Station, Defect Type, Part และ Model พร้อมแสดงรูปภาพและรายละเอียดของแต่ละข้อบกพร่อง
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Reports → Defect Image Summary &nbsp; | &nbsp; /report/defect-image-summary
          </p>
        </div>
      </Section>

      {/* Section 2: How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Reports" → เลือก "Defect Image Summary"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือกตัวกรอง: Date Range (ช่วงวันที่), Site, Station, Defect Type, Part, Model',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิกปุ่ม "Search" เพื่อค้นหาข้อมูล',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ดูรูปภาพและรายละเอียดข้อบกพร่องในตาราง',
            },
          ]}
        />
      </Section>

      {/* Section 3: Filters */}
      <Section title="ตัวกรอง (Filters)">
        <Table
          headers={['Filter', 'รายละเอียด', 'จำเป็น']}
          rows={[
            ['Date Range', 'ช่วงวันที่ตรวจสอบ', 'ใช่'],
            ['Site', 'สถานที่ / Customer Site', 'ไม่'],
            ['Station', 'สถานีตรวจสอบ (OQA, OBA, SIV)', 'ไม่'],
            ['Defect Type', 'ประเภทข้อบกพร่อง', 'ไม่'],
            ['Part', 'ชิ้นส่วน', 'ไม่'],
            ['Model', 'รุ่นผลิตภัณฑ์', 'ไม่'],
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 เคล็ดลับ:</strong> สามารถเลือกหลายค่าในตัวกรอง (Multi-Select) เพื่อดูข้อมูลหลายรายการพร้อมกัน
          </p>
        </div>
      </Section>

      {/* Section 4: Understanding Results */}
      <Section title="การเข้าใจผลลัพธ์">
        <Subsection title="1. ตารางข้อมูล">
          <p>แสดงข้อมูลข้อบกพร่องที่มีรูปภาพ:</p>
          <ul>
            <li><strong>Inspection Date:</strong> วันที่ตรวจสอบ</li>
            <li><strong>Lot No:</strong> หมายเลขล็อต</li>
            <li><strong>Model:</strong> รุ่นผลิตภัณฑ์</li>
            <li><strong>Station:</strong> สถานีตรวจสอบ</li>
            <li><strong>Defect Type:</strong> ประเภทข้อบกพร่อง</li>
            <li><strong>NG Qty:</strong> จำนวนชิ้นที่ไม่ผ่าน</li>
            <li><strong>Images:</strong> รูปภาพข้อบกพร่อง</li>
          </ul>
        </Subsection>

        <Subsection title="2. การดูรูปภาพ">
          <p>คลิกที่รูปภาพเพื่อดูขนาดเต็ม รูปภาพจะแสดงผ่าน endpoint <code>/api/defect-image/:id</code></p>
        </Subsection>
      </Section>

      {/* Section 5: Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📸 รวบรวมรูปภาพข้อบกพร่องสำหรับการประชุมคุณภาพ',
            '📋 ส่งรูปภาพให้ลูกค้าเพื่อแสดงปัญหาที่พบ',
            '🔍 วิเคราะห์รูปแบบข้อบกพร่องจากรูปภาพ',
            '📊 ใช้ประกอบการอบรมพนักงานเรื่อง Defect Recognition',
            '📝 จัดทำรายงานสรุปข้อบกพร่องรายเดือน',
          ]}
        />
      </Section>

      {/* Section 6: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['รูปภาพไม่แสดง', 'ตรวจสอบการเชื่อมต่อ, รีเฟรชหน้า (F5)'],
            ['ไม่พบข้อมูล', 'ขยายช่วงวันที่, ลบตัวกรองที่ไม่จำเป็น'],
            ['โหลดช้า', 'เลือกช่วงวันที่สั้นลง หรือใช้ตัวกรองเพิ่ม'],
            ['ตัวกรองไม่มีตัวเลือก', 'ตรวจสอบว่ามีข้อมูลในช่วงวันที่ที่เลือก'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Defect Image Summary:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T37_DefectImageSummaryPage;
