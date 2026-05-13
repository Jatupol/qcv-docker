// client/src/pages/training/T30_SGTFormatPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  HelpBox,
  List,
  Subsection,
} from '../../components/training/TrainingComponents';

/**
 * SGT Format Report (Customer) Training Page
 * Covers the tabbed container page at /customer-data/format
 * Contains 5 sub-reports: LAR, IQA vs OQA, Overall OQA, IQA Result, IQA Trend
 */
const T30_SGTFormatPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={30}
      totalCards={48}
      title="รายงานรูปแบบ Seagate (สำหรับลูกค้า)"
      subtitle="SGT Format Report (Customer)"
      icon="📄"
      nextLink="/training/lar-customer-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            หน้ารายงานรวม 5 รายงานในที่เดียว สำหรับส่งให้ลูกค้า Seagate
            หน้านี้เป็น <strong>Public (ไม่ต้อง Login)</strong> เพื่อให้ลูกค้าเปิดดูได้ทันที
            และรองรับ <strong>Export PDF ครบทั้ง 5 รายงาน</strong> ในไฟล์เดียว
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/format</code><br/>
            <strong>🔓 Public URL:</strong> ไม่ต้อง Login — ลูกค้าเปิดลิงก์ได้เลย<br/>
            <strong>🔑 Hybrid:</strong> ถ้า Login แล้วจะเห็น Sidebar เมนูด้วย
          </div>
        </div>
      </Section>

      {/* 5 Tabs Structure */}
      <Section title="โครงสร้าง 5 Tab รายงาน">
        <p style={{ marginBottom: '15px' }}>
          หน้านี้รวม 5 รายงานเป็น <strong>Tab</strong> ให้สลับดูได้ทันที:
        </p>
        <Table
          headers={['Tab', 'ชื่อรายงาน', 'เนื้อหา']}
          rows={[
            ['1️⃣ LAR', 'LAR Report', 'อัตราการผ่านสายแยกตาม Model พร้อมกราฟและตารางข้อบกพร่อง'],
            ['2️⃣ IQA vs OQA', 'SGT IQA vs NHK OQA', 'เปรียบเทียบ DPPM & LAR% ระหว่าง IQA (Seagate) กับ OQA (NHK)'],
            ['3️⃣ Overall OQA', 'NHK OQA DPPM Overall', 'ภาพรวม LAR & DPPM ของ OQA ทั้งหมด'],
            ['4️⃣ IQA Result', 'Table Seagate IQA', 'ตารางผลการตรวจ IQA แบบละเอียด'],
            ['5️⃣ IQA Trend', 'SGT IQA Trend', 'แนวโน้ม IQA แยกตาม Model (12 สัปดาห์)'],
          ]}
        />

        <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginTop: '15px' }}>
          <strong>⚠️ สำคัญ:</strong> Fiscal Year และ Work Week ถูก <strong>ล็อค</strong> ไว้ตาม FY/WW ปัจจุบัน
          ไม่สามารถเปลี่ยนได้จากหน้านี้ — เพื่อให้ลูกค้าเห็นข้อมูลสัปดาห์ล่าสุดเสมอ
        </div>
      </Section>

      {/* How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู Customer Format → Seagate Format หรือเปิด URL โดยตรง /customer-data/format',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'หน้าจะแสดง Tab แรก (LAR) พร้อมข้อมูล FY/WW ล่าสุดอัตโนมัติ',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิก Tab ด้านบนเพื่อสลับดูรายงานแต่ละประเภท',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ใช้ปุ่ม "Export Current" เพื่อ Export เฉพาะ Tab ที่กำลังดู เป็น PDF',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'หรือใช้ปุ่ม "Export All Reports" เพื่อ Export ทั้ง 5 รายงาน เป็น PDF ไฟล์เดียว',
            },
          ]}
        />
      </Section>

      {/* Export Features */}
      <Section title="ฟีเจอร์ Export PDF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>📄 Export Current</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Export เฉพาะ Tab ที่กำลังดูอยู่<br/>
              <strong>ใช้เมื่อ:</strong> ต้องการส่งรายงานเฉพาะเรื่อง
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>📚 Export All Reports</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Export ทั้ง 5 รายงาน ในไฟล์ PDF เดียว<br/>
              <strong>ใช้เมื่อ:</strong> ส่งรายงานประจำสัปดาห์/เดือนให้ลูกค้า
            </p>
          </div>
        </div>

        <Subsection title="PDF ที่ได้จาก Export All Reports จะมี">
          <List
            items={[
              '📕 หน้าปก (Cover Page) พร้อม Gradient สีม่วง-ส้ม',
              '📑 สารบัญ (Table of Contents) พร้อมเลขหน้า',
              '📊 รายงานทั้ง 5 ฉบับ แยกหน้าชัดเจน',
              '📖 หน้าปิดท้าย (Back Cover)',
              '🔢 เลขหน้าและชื่อระบบที่ Footer ทุกหน้า',
            ]}
          />
        </Subsection>

        <div style={{ background: '#d1ecf1', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
          <strong>📁 ชื่อไฟล์:</strong> <code>SGT_Quality_Report_FY2026_WW38_20260324.pdf</code><br/>
          <strong>📐 ขนาด:</strong> A4 Landscape | <strong>🔤 ฟอนต์:</strong> Sarabun
        </div>
      </Section>

      {/* Key Features */}
      <Section title="คุณสมบัติพิเศษ">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>🔓 Public Access</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ไม่ต้อง Login — ส่งลิงก์ให้ลูกค้าเปิดได้ทันที<br/>
              ถ้า Login แล้วจะเห็น Sidebar เมนูเพิ่ม
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>📊 5 Reports in 1</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              รวม 5 รายงานใน Tab เดียว<br/>
              สลับดูได้รวดเร็ว ไม่ต้องเปลี่ยนหน้า
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>🔒 Locked FY/WW</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              FY และ WW ล็อคตามปัจจุบัน<br/>
              ลูกค้าเห็นข้อมูลล่าสุดเสมอ
            </p>
          </div>

          <div style={{ background: '#f0e6ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#6f42c1' }}>📄 Professional PDF</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              PDF มีหน้าปก สารบัญ เลขหน้า<br/>
              พร้อมส่งลูกค้าทันที
            </p>
          </div>
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <Table
          headers={['การใช้งาน', 'วิธีที่ดี', 'ข้อควรระวัง']}
          rows={[
            [
              'ส่งรายงาน',
              'ใช้ Export All Reports แล้วส่ง PDF ทาง Email พร้อม Summary',
              'อย่าส่งแค่ลิงก์โดยไม่มีคำอธิบาย',
            ],
            [
              'ประชุมลูกค้า',
              'เปิดหน้าเว็บตรงในห้องประชุม สลับ Tab อธิบายทีละรายงาน',
              'อย่าลืมเช็คข้อมูลก่อนประชุม',
            ],
            [
              'ส่ง PDF',
              'ตรวจสอบว่า FY/WW ที่แสดงถูกต้องก่อน Export',
              'อย่าส่ง PDF ที่มีข้อมูลสัปดาห์เก่า',
            ],
            [
              'แชร์ลิงก์',
              'ส่ง URL ให้ลูกค้าเพื่อดูแบบ Real-time',
              'ตรวจสอบว่า URL เข้าถึงได้จากภายนอก',
            ],
          ]}
        />
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📅 Weekly/Monthly Customer Reporting - ส่งรายงานประจำสัปดาห์/เดือนให้ลูกค้า',
            '👥 Customer Quality Reviews - ประชุมทบทวนคุณภาพกับลูกค้า',
            '🔍 Audit Documentation - เอกสารสำหรับ Audit จากลูกค้า',
            '📜 Contract Compliance - แสดงผลตามข้อตกลงคุณภาพ',
            '💼 Business Reviews - ทบทวนธุรกิจกับลูกค้า',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ลูกค้าเปิด URL ไม่ได้',
              'ตรวจสอบว่า URL ถูกต้อง และ Firewall ไม่ block',
            ],
            [
              'ข้อมูลไม่อัพเดท',
              'Refresh หน้าเว็บ — FY/WW จะอัพเดทอัตโนมัติตามสัปดาห์ปัจจุบัน',
            ],
            [
              'Export All Reports ช้า',
              'ระบบต้อง Render กราฟ 5 รายงาน — รอ Progress Bar จนครบ 100%',
            ],
            [
              'PDF แสดงผลไม่สมบูรณ์',
              'ใช้ Adobe Reader หรือ Chrome เพื่อเปิดไฟล์ PDF',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน SGT Format:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Customer Relations - การส่งรายงานและการติดต่อลูกค้า</li>
          <li>Quality Manager - ข้อมูลในรายงาน</li>
          <li>IT Support - ปัญหาทางเทคนิคและ URL</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T30_SGTFormatPage;
