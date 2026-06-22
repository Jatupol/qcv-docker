// client/src/pages/training/T40_OQARejectAllDefectPage.tsx

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
 * OQA Reject All Defect Training Page
 *
 * Quick Reference Card #40: OQA Reject All Defect
 */
const T40_OQARejectAllDefectPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={40}
      totalCards={48}
      title="OQA Reject All Defect"
      subtitle="ข้อมูลข้อบกพร่องทั้งหมดจาก OQA"
      icon="🔴"
      nextLink="/training/t16"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของรายงาน OQA Reject All Defect">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์ของรายงาน</h4>
          <p style={{ margin: 0 }}>
            OQA Reject All Defect แสดงข้อมูลข้อบกพร่องทั้งหมดจากการตรวจสอบ OQA โดยละเอียด
            รวมถึงรูปภาพข้อบกพร่อง ข้อมูลพนักงาน (QC, QC Lead, Inspector) รายละเอียด Defect
            และสามารถ Export เป็น Excel พร้อมรูปภาพ
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Inspection → OQA Reject All Defect &nbsp; | &nbsp; /customer-data/oqa-reject-all-defect
          </p>
        </div>
      </Section>

      {/* Section 2: How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Inspection" → เลือก "OQA Reject All Defect"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Date Range (ค่าเริ่มต้น: เดือนปัจจุบัน)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Model (ถ้าต้องการกรองเฉพาะรุ่น, เลือกได้หลายรุ่น)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Shift (ถ้าต้องการกรองเฉพาะกะ)',
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
            ['Date Range', 'ช่วงวันที่ตรวจสอบ', 'ต้นเดือน - สิ้นเดือนปัจจุบัน'],
            ['Model', 'รุ่นผลิตภัณฑ์ (เลือกได้หลายรุ่น)', 'ทั้งหมด'],
            ['Shift', 'กะทำงาน (เลือกได้หลายกะ)', 'ทั้งหมด'],
          ]}
        />
      </Section>

      {/* Section 4: Data Table Details */}
      <Section title="ข้อมูลในตาราง">
        <Subsection title="ข้อมูลหลัก">
          <ul>
            <li><strong>Inspection Date:</strong> วันที่ตรวจสอบ</li>
            <li><strong>Item No:</strong> หมายเลขชิ้นส่วน</li>
            <li><strong>Model / Version:</strong> รุ่นและเวอร์ชัน</li>
            <li><strong>Lot No:</strong> หมายเลขล็อต</li>
            <li><strong>Shift / Tab:</strong> กะและรอบ</li>
            <li><strong>Station:</strong> สถานีตรวจสอบ</li>
          </ul>
        </Subsection>

        <Subsection title="ข้อมูลข้อบกพร่อง">
          <ul>
            <li><strong>Defect Type:</strong> ประเภทข้อบกพร่อง</li>
            <li><strong>Name / Description:</strong> ชื่อและรายละเอียด</li>
            <li><strong>NG Qty:</strong> จำนวนที่ไม่ผ่าน</li>
            <li><strong>Group VI:</strong> กลุ่ม VI</li>
            <li><strong>Defect Station:</strong> สถานีที่เกิดข้อบกพร่อง</li>
            <li><strong>Defect Detail:</strong> รายละเอียดเพิ่มเติม</li>
            <li><strong>Stamp / MBR Name:</strong> ข้อมูล Stamp และ MBR</li>
          </ul>
        </Subsection>

        <Subsection title="ข้อมูลพนักงาน">
          <ul>
            <li><strong>QC Name:</strong> ชื่อผู้ตรวจสอบ QC</li>
            <li><strong>QC Lead:</strong> ชื่อหัวหน้า QC</li>
            <li><strong>Inspector:</strong> ชื่อผู้ตรวจสอบ</li>
          </ul>
        </Subsection>

        <Subsection title="รูปภาพ">
          <p>แสดงรูปภาพข้อบกพร่องที่ถ่ายไว้ พร้อมข้อมูล Photo Magnification (กำลังขยาย)</p>
        </Subsection>
      </Section>

      {/* Section 5: Export */}
      <Section title="การส่งออกรายงาน (Export)">
        <StepBox
          steps={[
            {
              label: 'Export to Excel',
              description: 'คลิกปุ่ม "Export Excel" เพื่อดาวน์โหลดข้อมูลทั้งหมดในรูปแบบ Excel พร้อมรูปภาพข้อบกพร่อง',
            },
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>⚠️ หมายเหตุ:</strong> การ Export รูปภาพใน Excel อาจใช้เวลา โปรดรอจนกว่าจะดาวน์โหลดเสร็จ
          </p>
        </div>
      </Section>

      {/* Section 6: Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '🔍 ดูข้อมูลข้อบกพร่องทั้งหมดจาก OQA ในรายละเอียด',
            '📸 ตรวจสอบรูปภาพข้อบกพร่องที่ถูกบันทึก',
            '📊 วิเคราะห์รูปแบบข้อบกพร่องตาม Model, Shift หรือช่วงเวลา',
            '📋 ส่งข้อมูลข้อบกพร่องให้ลูกค้าหรือทีมแก้ไข',
            '👥 ตรวจสอบข้อมูลพนักงานที่ตรวจสอบ (QC, Inspector)',
            '📈 ใช้ข้อมูลประกอบการทำ Root Cause Analysis',
          ]}
        />
      </Section>

      {/* Section 7: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ไม่พบข้อมูล', 'ตรวจสอบช่วงวันที่, ลบตัวกรอง Model/Shift ที่ไม่จำเป็น'],
            ['รูปภาพไม่แสดง', 'ตรวจสอบการเชื่อมต่อ, รีเฟรชหน้า (F5)'],
            ['Export ช้า', 'ลดช่วงวันที่, อาจเกิดจากจำนวนรูปภาพมาก'],
            ['ข้อมูลพนักงานว่าง', 'ข้อมูลอาจไม่ได้กรอกในขั้นตอนการตรวจสอบ'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ OQA Reject All Defect:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T40_OQARejectAllDefectPage;
