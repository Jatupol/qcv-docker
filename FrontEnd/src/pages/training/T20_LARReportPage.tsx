// client/src/pages/training/T20_LARReportPage.tsx

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
 * LAR Report Training Page
 *
 * Quick Reference Card #20: LAR Report - Line Acceptance Rate
 */
const T20_LARReportPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={20}
      totalCards={48}
      title="รายงาน LAR"
      subtitle="LAR Report - Line Acceptance Rate"
      icon="📊"
      nextLink="/training/sgt-iqa-oqa-report"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของรายงาน LAR">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์ของรายงาน</h4>
          <p style={{ margin: 0 }}>
            รายงาน LAR (Line Acceptance Rate) ใช้สำหรับติดตามและตรวจสอบอัตราการยอมรับของสถานี OQA VMI
            โดยแสดงเปอร์เซ็นต์ของล็อตที่ผ่านการตรวจสอบในครั้งแรก (Round 1)
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            /report/lar-report
          </p>
        </div>
      </Section>

      {/* Section 2: How to Generate Report */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Reports" → เลือก "LAR Report"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'กรอกตัวกรอง (Filters) ที่จำเป็น: เลือก Fiscal Year (FY) และ Work Week (WW)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Model (รุ่นผลิตภัณฑ์) ที่ต้องการดูรายงาน',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิกปุ่ม "Generate Report" หรือ "Search"',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'รอระบบโหลดข้อมูลและแสดงผลกราฟและตาราง',
            },
          ]}
        />
      </Section>

      {/* Section 3: Required Filters */}
      <Section title="ตัวกรองที่จำเป็น (Required Filters)">
        <Table
          headers={['Filter', 'รายละเอียด', 'ตัวอย่าง']}
          rows={[
            [
              'Fiscal Year (FY)',
              'ปีงบประมาณตามปฏิทิน Seagate',
              'FY2024',
            ],
            [
              'Work Week (WW)',
              'สัปดาห์ทำงาน (1-52)',
              'WW15',
            ],
            [
              'Model (*)',
              'รุ่นผลิตภัณฑ์',
              'ST2000NM0008',
            ],
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>⚠️ หมายเหตุ:</strong> ตัวกรองทั้งหมดที่มีเครื่องหมาย (*) เป็นตัวกรองที่จำเป็น คุณต้องกรอกข้อมูลเหล่านี้เพื่อให้รายงานทำงาน
          </p>
        </div>
      </Section>

      {/* Section 4: Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. กราฟแนวโน้ม LAR (LAR Trend Chart)">
          <p>แสดงเปอร์เซ็นต์ LAR ตามช่วงเวลาที่เลือก</p>
          <ul>
            <li><strong>แกน Y:</strong> เปอร์เซ็นต์ LAR (0-100%)</li>
            <li><strong>แกน X:</strong> ช่วงเวลา (สัปดาห์หรือเดือน)</li>
            <li><strong>เส้นแนวโน้ม:</strong> แสดงทิศทางของ LAR</li>
          </ul>
        </Subsection>

        <Subsection title="2. ตารางรายละเอียดข้อบกพร่อง (Defect Breakdown)">
          <p>แสดงรายละเอียดข้อบกพร่องที่พบในการตรวจสอบ</p>
          <ul>
            <li>ชื่อข้อบกพร่อง (Defect Name)</li>
            <li>จำนวนข้อบกพร่อง (Defect Count)</li>
            <li>เปอร์เซ็นต์ของข้อบกพร่องทั้งหมด</li>
          </ul>
        </Subsection>

        <Subsection title="3. สถิติสรุป (Summary Statistics)">
          <p>แสดงตัวเลขสำคัญในรูปแบบการ์ด</p>
          <ul>
            <li><strong>LAR %:</strong> อัตราการยอมรับรายการ</li>
            <li><strong>Total Lots:</strong> จำนวนล็อตทั้งหมด</li>
            <li><strong>Pass Lots:</strong> จำนวนล็อตที่ผ่าน</li>
            <li><strong>Fail Lots:</strong> จำนวนล็อตที่ไม่ผ่าน</li>
          </ul>
        </Subsection>
      </Section>

      {/* Section 5: Export Options */}
      <Section title="การส่งออกรายงาน (Export)">
        <StepBox
          steps={[
            {
              label: 'Export to PDF',
              description: 'คลิกปุ่ม "Export PDF" เพื่อดาวน์โหลดรายงานในรูปแบบ PDF พร้อมกราฟและตาราง',
            },
            {
              label: 'Export to Excel',
              description: 'คลิกปุ่ม "Export Excel" เพื่อดาวน์โหลดข้อมูลดิบในรูปแบบ Excel สำหรับการวิเคราะห์เพิ่มเติม',
            },
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 เคล็ดลับ:</strong> ใช้ PDF สำหรับการนำเสนอและรายงาน ใช้ Excel สำหรับการวิเคราะห์ข้อมูลเพิ่มเติม
          </p>
        </div>
      </Section>

      {/* Section 6: Key Metrics */}
      <Section title="ตัวชี้วัดหลัก (Key Metrics)">
        <Table
          headers={['Metric', 'ความหมาย', 'ค่าที่ดี', 'ระดับแจ้งเตือน']}
          rows={[
            [
              'LAR %',
              'เปอร์เซ็นต์การยอมรับล็อต',
              '> 95%',
              '< 90%',
            ],
            [
              'Pass Rate',
              'อัตราการผ่านการตรวจสอบ',
              '> 95%',
              '< 90%',
            ],
            [
              'Fail Count',
              'จำนวนล็อตที่ไม่ผ่าน',
              'ต่ำ',
              'สูง',
            ],
          ]}
        />
      </Section>

      {/* Section 7: Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📅 การติดตามประสิทธิภาพรายสัปดาห์ของสถานี OQA',
            '📊 การวิเคราะห์แนวโน้มคุณภาพตามช่วงเวลา',
            '🎯 การตรวจสอบว่าบรรลุเป้าหมาย LAR หรือไม่',
            '📈 การรายงานให้ฝ่ายบริหารและลูกค้า',
            '🔍 การระบุปัญหาคุณภาพที่เกิดขึ้น',
          ]}
        />
      </Section>

      {/* Section 8: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี">
        <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>✅ ควรทำ</h4>
          <ul>
            <li>ตรวจสอบรายงาน LAR ทุกสัปดาห์</li>
            <li>เปรียบเทียบกับเป้าหมายและสัปดาห์ก่อนหน้า</li>
            <li>ส่งออกรายงานและจัดเก็บไว้ในโฟลเดอร์ประจำสัปดาห์</li>
            <li>แจ้งเตือนทีมเมื่อ LAR ต่ำกว่าเป้าหมาย</li>
          </ul>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ ไม่ควรทำ</h4>
          <ul>
            <li>ไม่ควรละเว้นการตรวจสอบตัวกรอง</li>
            <li>ไม่ควรแชร์รายงานโดยไม่ได้ตรวจสอบความถูกต้อง</li>
            <li>ไม่ควรดำเนินการรายงานโดยไม่เข้าใจข้อมูล</li>
          </ul>
        </div>
      </Section>

      {/* Section 9: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'รายงานไม่โหลด',
              'ตรวจสอบว่ากรอกตัวกรองที่จำเป็นทั้งหมดแล้ว (*)',
            ],
            [
              'ไม่มีข้อมูล',
              'ตรวจสอบว่าช่วงเวลาที่เลือกมีข้อมูลหรือไม่, ลองเปลี่ยนช่วงเวลา',
            ],
            [
              'กราฟไม่แสดง',
              'รอ 30 วินาที, รีเฟรชหน้า (F5)',
            ],
            [
              'Export ไม่สำเร็จ',
              'ลดช่วงเวลา, ลองใหม่อีกครั้ง',
            ],
            [
              'ข้อมูลไม่ถูกต้อง',
              'ตรวจสอบตัวกรอง, ตรวจสอบรูปแบบวันที่',
            ],
          ]}
        />
      </Section>

      {/* Section 10: Quick Tips */}
      <Section title="เคล็ดลับ">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>⚡ ความเร็ว</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ใช้ตัวกรองที่เฉพาะเจาะจง (Model, Week) เพื่อโหลดรายงานได้เร็วขึ้น
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>🎯 ความแม่นยำ</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ตรวจสอบ Fiscal Year และ Work Week ให้ตรงกับปฏิทิน Seagate
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>💾 การบันทึก</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Export รายงานเป็น PDF ทุกสัปดาห์และจัดเก็บในโฟลเดอร์ประจำเดือน
            </p>
          </div>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับรายงาน LAR:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ดู REPORTS_MANUAL.md สำหรับข้อมูลโดยละเอียด</li>
          <li>ติดต่อ IT Support สำหรับปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T20_LARReportPage;
