// client/src/pages/training/T39_OverviewOQACustomerPage.tsx

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
 * Overview OQA Customer Report Training Page
 *
 * Quick Reference Card #39: Overview OQA Customer
 */
const T39_OverviewOQACustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={39}
      totalCards={48}
      title="Overview OQA Customer"
      subtitle="ภาพรวม OQA สำหรับลูกค้า"
      icon="📊"
      nextLink="/training/t02"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของรายงาน Overview OQA Customer">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์ของรายงาน</h4>
          <p style={{ margin: 0 }}>
            Overview OQA Customer แสดงข้อมูลคุณภาพ OQA แบบ Pivot Table จัดกลุ่มตาม Customer Product
            โดยแสดง DPPM, LAR, จำนวน Lot และ NG Quantity ของแต่ละ Defect Group เป็นคอลัมน์
            พร้อมระบบ Target ที่ปรับแต่งได้ และ Conditional Formatting (สีเขียว/แดง)
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Customer Format → Overview OQA &nbsp; | &nbsp; /customer-data/overview-oqa
          </p>
        </div>
      </Section>

      {/* Section 2: How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Customer Format" → เลือก "Overview OQA"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Fiscal Year (FY) และ Work Week (WW)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Model (ถ้าต้องการกรองเฉพาะรุ่น)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ตั้งค่า Target (DPPM/LAR) ทั้ง Overall และ Product Level แล้วคลิก "Apply Target"',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Search" เพื่อค้นหาข้อมูล ตารางจะแสดง Conditional Formatting อัตโนมัติ',
            },
          ]}
        />
      </Section>

      {/* Section 3: Filters & Target */}
      <Section title="ตัวกรองและค่าเป้าหมาย">
        <Subsection title="ตัวกรอง (Filters)">
          <Table
            headers={['Filter', 'รายละเอียด', 'ค่าเริ่มต้น']}
            rows={[
              ['Fiscal Year (FY)', 'ปีงบประมาณ', 'ปีปัจจุบัน'],
              ['Work Week (WW)', 'สัปดาห์ทำงาน', 'สัปดาห์ปัจจุบัน'],
              ['Model', 'รุ่นผลิตภัณฑ์ (เลือกได้หลายรุ่น)', 'ทั้งหมด'],
            ]}
          />
        </Subsection>

        <Subsection title="ค่าเป้าหมาย (Target)">
          <Table
            headers={['Target', 'ค่าเริ่มต้น', 'คำอธิบาย']}
            rows={[
              ['Overall DPPM Target', '180', 'เป้าหมาย DPPM รวม'],
              ['Overall LAR Target', '98.4%', 'เป้าหมาย LAR รวม'],
              ['Product DPPM Target', '220', 'เป้าหมาย DPPM ต่อผลิตภัณฑ์'],
              ['Product LAR Target', '98.0%', 'เป้าหมาย LAR ต่อผลิตภัณฑ์'],
            ]}
          />
        </Subsection>

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 เคล็ดลับ:</strong> เมื่อปรับ Target แล้ว ต้องคลิก "Apply Target" เพื่อให้ Conditional Formatting อัปเดต
          </p>
        </div>
      </Section>

      {/* Section 4: Understanding the Table */}
      <Section title="การเข้าใจตาราง Pivot">
        <Subsection title="โครงสร้างตาราง">
          <p>แต่ละ Product จะแสดง 2 แถว:</p>
          <ul>
            <li><strong>แถว DPPM:</strong> ค่า DPPM ของแต่ละ Defect Group</li>
            <li><strong>แถว Qty:</strong> จำนวน NG ของแต่ละ Defect Group</li>
          </ul>
        </Subsection>

        <Subsection title="Conditional Formatting (สี)">
          <Table
            headers={['สี', 'ความหมาย']}
            rows={[
              ['เขียว', 'ค่า DPPM ต่ำกว่า Target = ดี'],
              ['แดง', 'ค่า DPPM สูงกว่า Target = ต้องปรับปรุง'],
              ['เขียว (LAR)', 'ค่า LAR สูงกว่า Target = ดี'],
              ['แดง (LAR)', 'ค่า LAR ต่ำกว่า Target = ต้องปรับปรุง'],
            ]}
          />
        </Subsection>

        <Subsection title="Lot Detail Modal">
          <p>คลิกที่ค่าในตารางเพื่อดูรายละเอียดระดับ Lot Number:</p>
          <ul>
            <li>Lot No</li>
            <li>NG Qty</li>
            <li>Inspection No</li>
          </ul>
        </Subsection>
      </Section>

      {/* Section 5: Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 ดูภาพรวมคุณภาพ OQA ทั้งหมดในหนึ่งหน้า',
            '🎯 เปรียบเทียบ DPPM กับ Target ของแต่ละผลิตภัณฑ์',
            '📋 ส่งรายงาน OQA Overview ให้ลูกค้า',
            '🔍 ระบุ Defect Group ที่มีปัญหาสูง',
            '📈 ติดตามผลประจำสัปดาห์',
          ]}
        />
      </Section>

      {/* Section 6: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ตารางว่าง', 'ตรวจสอบว่ามีข้อมูลใน FY/WW ที่เลือก'],
            ['สีไม่อัปเดต', 'คลิก "Apply Target" หลังเปลี่ยน Target'],
            ['Lot Detail ไม่แสดง', 'รีเฟรชหน้า, ตรวจสอบการเชื่อมต่อ'],
            ['ข้อมูลไม่ครบ', 'ตรวจสอบว่า Import ข้อมูลเรียบร้อยแล้ว'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Overview OQA Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T39_OverviewOQACustomerPage;
