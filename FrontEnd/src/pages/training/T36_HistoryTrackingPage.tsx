// client/src/pages/training/T36_HistoryTrackingPage.tsx

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
 * History Tracking Training Page
 *
 * Quick Reference Card #36: History Tracking - Lot Number Lookup
 */
const T36_HistoryTrackingPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={36}
      totalCards={48}
      title="History Tracking"
      subtitle="การติดตามประวัติ Lot Number"
      icon="🔍"
      nextLink="/training/defect-image-summary"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของรายงาน History Tracking">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์ของรายงาน</h4>
          <p style={{ margin: 0 }}>
            History Tracking ใช้สำหรับค้นหาประวัติการตรวจสอบของ Lot Number โดยสามารถค้นหาได้สูงสุด 10 Lot Numbers พร้อมกัน
            แสดงข้อมูลการตรวจสอบทุกสถานี ผลการตรวจสอบ และรูปภาพข้อบกพร่อง (ถ้ามี)
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Reports → History Tracking &nbsp; | &nbsp; /report/history-tracking
          </p>
        </div>
      </Section>

      {/* Section 2: How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Reports" → เลือก "History Tracking"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'กรอก Lot Number ในช่อง (1 บรรทัดต่อ 1 Lot Number) สูงสุด 10 รายการ',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิกปุ่ม "Search" เพื่อค้นหาข้อมูล',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ดูผลลัพธ์ในตาราง คลิกรูปภาพเพื่อขยายดูรายละเอียดข้อบกพร่อง',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Export Excel" เพื่อดาวน์โหลดข้อมูลพร้อมรูปภาพ',
            },
          ]}
        />
      </Section>

      {/* Section 3: Input Format */}
      <Section title="รูปแบบการกรอก Lot Number">
        <Table
          headers={['รายละเอียด', 'ค่า']}
          rows={[
            ['จำนวนสูงสุด', '10 Lot Numbers ต่อครั้ง'],
            ['รูปแบบการกรอก', '1 บรรทัดต่อ 1 Lot Number'],
            ['ตัวอย่าง', 'ZLL1234\nZLL5678\nZLL9012'],
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 เคล็ดลับ:</strong> สามารถคัดลอก Lot Numbers จาก Excel แล้ววางได้เลย ระบบจะแยกตามบรรทัดให้อัตโนมัติ
          </p>
        </div>
      </Section>

      {/* Section 4: Understanding Results */}
      <Section title="การเข้าใจผลลัพธ์">
        <Subsection title="1. ตารางข้อมูล">
          <p>แสดงข้อมูลการตรวจสอบของแต่ละ Lot Number:</p>
          <ul>
            <li><strong>Lot Number:</strong> หมายเลขล็อต</li>
            <li><strong>Station:</strong> สถานีตรวจสอบ (OQA, OBA, SIV, IQA)</li>
            <li><strong>Inspection Date:</strong> วันที่ตรวจสอบ</li>
            <li><strong>Result:</strong> ผลการตรวจสอบ (Pass/Fail)</li>
            <li><strong>Defect Info:</strong> ข้อมูลข้อบกพร่อง (ถ้ามี)</li>
            <li><strong>Images:</strong> รูปภาพข้อบกพร่อง (คลิกเพื่อขยาย)</li>
          </ul>
        </Subsection>

        <Subsection title="2. รูปภาพข้อบกพร่อง (Defect Images)">
          <p>คลิกที่รูปภาพเพื่อเปิด Modal ดูภาพขนาดใหญ่:</p>
          <ul>
            <li>ใช้ปุ่มซ้าย-ขวาเพื่อเลื่อนดูรูปภาพ</li>
            <li>รูปภาพแสดงจากระบบ Defect Image</li>
          </ul>
        </Subsection>
      </Section>

      {/* Section 5: Export */}
      <Section title="การส่งออกรายงาน (Export)">
        <StepBox
          steps={[
            {
              label: 'Export to Excel',
              description: 'คลิกปุ่ม "Export Excel" เพื่อดาวน์โหลดข้อมูลในรูปแบบ Excel พร้อมรูปภาพข้อบกพร่อง (ถ้ามี)',
            },
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>⚠️ หมายเหตุ:</strong> การ Export รูปภาพอาจใช้เวลาเพิ่มขึ้นขึ้นอยู่กับจำนวนรูปภาพ
          </p>
        </div>
      </Section>

      {/* Section 6: Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '🔍 ค้นหาประวัติการตรวจสอบของ Lot ที่มีปัญหา',
            '📋 ตรวจสอบว่า Lot ผ่านสถานีใดบ้าง',
            '📸 ดูรูปภาพข้อบกพร่องที่ถูกบันทึก',
            '📊 ส่งข้อมูลประวัติการตรวจสอบให้ลูกค้า',
            '🔄 ติดตาม Lot ที่ต้องตรวจซ้ำ',
          ]}
        />
      </Section>

      {/* Section 7: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ไม่พบข้อมูล', 'ตรวจสอบว่า Lot Number ถูกต้อง, ตรวจสอบการสะกด'],
            ['เกินจำนวนสูงสุด', 'ลดจำนวน Lot Number ให้ไม่เกิน 10 รายการ'],
            ['รูปภาพไม่แสดง', 'รีเฟรชหน้า (F5), ตรวจสอบการเชื่อมต่อ'],
            ['Export ช้า', 'อาจเกิดจากจำนวนรูปภาพมาก รอสักครู่'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ History Tracking:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T36_HistoryTrackingPage;
