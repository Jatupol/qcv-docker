// client/src/pages/training/T42_GraphOQACustomerPage.tsx

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
 * Graph OQA Customer Dashboard Training Page
 * Covers the DPPM & LAR% combo chart dashboard at /customer-data/oqa-vi-dashboard
 */
const T42_GraphOQACustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={42}
      totalCards={48}
      title="Graph OQA Customer"
      subtitle="กราฟ DPPM & LAR% แยกตาม Model สำหรับลูกค้า"
      icon="📈"
      nextLink="/training/overview-oqa-customer-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#fff7ed', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#c2410c' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            Dashboard แสดงกราฟ <strong>DPPM</strong> (แท่ง) และ <strong>LAR%</strong> (เส้น) รายเดือน
            แยกตาม Product Family และ Model เพื่อวิเคราะห์แนวโน้มคุณภาพ
            แสดงเฉพาะ <strong>Round 1</strong> เท่านั้น
          </p>
          <div style={{ background: '#fed7aa', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/oqa-vi-dashboard</code><br/>
            <strong>📊 ประเภท:</strong> Combo Chart (Bar + Line) รายเดือน<br/>
            <strong>🔑 สิทธิ์:</strong> user, manager, admin, viewer
          </div>
        </div>
      </Section>

      {/* Filter System */}
      <Section title="ระบบตัวกรอง (Cascading Filters)">
        <p style={{ marginBottom: '10px' }}>
          ตัวกรองทำงานแบบ <strong>Cascading</strong> — เลือกตัวบนจะกรองตัวล่างให้อัตโนมัติ:
        </p>
        <Table
          headers={['ลำดับ', 'ตัวกรอง', 'สี', 'คำอธิบาย']}
          rows={[
            ['1', 'From / To Month', '—', 'ช่วงเดือน (เช่น 2026-01 ถึง 2026-03) — ค่าเริ่มต้น ม.ค. ถึงเดือนปัจจุบัน'],
            ['2', 'Production Site', '🔵 น้ำเงิน', 'เลือกไซต์การผลิต (เช่น JNHK, TNHK) — เลือกได้หลายรายการ'],
            ['3', 'Customer Site', '🟣 ม่วง', 'เลือกไซต์ลูกค้า — กรองตาม Production Site ที่เลือก'],
            ['4', 'Product Family', '🟢 เขียวเข้ม', 'เลือก Product Family (เช่น Iris, Exos) — กรองตาม Customer Site'],
            ['5', 'Product Type', '🔴 ชมพู', 'เลือกประเภทสินค้า — กรองตาม Product Family'],
            ['6', 'Products (Models)', '🟤 คราม', 'เลือก Model เฉพาะ — กรองตาม Product Type'],
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div style={{ background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
            <strong>✅ Apply:</strong> กดปุ่มเพื่อโหลดข้อมูลตามตัวกรอง
          </div>
          <div style={{ background: '#e2e8f0', padding: '12px', borderRadius: '6px' }}>
            <strong>🔄 Clear:</strong> กดเพื่อ Reset ตัวกรองทั้งหมดกลับค่าเริ่มต้น
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
          <strong>💡 Cascading:</strong> เมื่อเปลี่ยน Production Site → Customer Site, Product Family, Product Type, Models จะ Reset และโหลดตัวเลือกใหม่ให้อัตโนมัติ
        </div>
      </Section>

      {/* Chart Display */}
      <Section title="การแสดงกราฟ">
        <Subsection title="โครงสร้างการจัดกลุ่ม">
          <List
            items={[
              '📂 Product Family — หัวข้อกลุ่มใหญ่ (เช่น Iris, Exos)',
              '📊 Model — แต่ละ Model มีกราฟของตัวเอง 1 กราฟ',
              '🏭 Site — แต่ละ Site แสดงเป็นแท่ง/เส้นคนละสี',
            ]}
          />
        </Subsection>

        <Subsection title="แกนของกราฟ (Dual Y-Axis)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: '#e7f3ff', padding: '12px', borderRadius: '6px' }}>
              <h5 style={{ margin: '0 0 5px 0' }}>📏 แกนซ้าย: LAR%</h5>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Line Acceptance Rate (0-100%)<br/>
                แสดงเป็น <strong>เส้น (Line)</strong> พร้อมค่า % ในกล่อง
              </p>
            </div>
            <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
              <h5 style={{ margin: '0 0 5px 0' }}>📐 แกนขวา: DPPM</h5>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Defects Per Million<br/>
                แสดงเป็น <strong>แท่ง (Bar)</strong> พร้อมตัวเลขในแท่ง
              </p>
            </div>
          </div>
        </Subsection>

        <Subsection title="สีของ Site">
          <Table
            headers={['Site', 'สีแท่ง (DPPM)', 'สีเส้น (LAR%)']}
            rows={[
              ['JNHK', '🔵 น้ำเงิน (#2563EB)', '🔵 น้ำเงินอ่อน (#3B82F6)'],
              ['TNHK', '🟠 ส้ม (#EA580C)', '🟠 ส้มสด (#F97316)'],
              ['อื่นๆ', 'หมุนเวียนสี ม่วง, เขียว, แดง, เทา', 'หมุนเวียนตามลำดับ'],
            ]}
          />
        </Subsection>

        <Subsection title="แกน X">
          <p>แสดงเดือนในรูปแบบ <code>Jan'2026</code>, <code>Feb'2026</code> — เอียง 35 องศา เพื่อไม่ให้ซ้อนกัน</p>
        </Subsection>
      </Section>

      {/* Data Modal */}
      <Section title="หน้าต่างข้อมูลเชิงลึก (Data Modal)">
        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
          <h5 style={{ margin: '0 0 8px 0' }}>📋 คลิกที่กราฟเพื่อดูรายละเอียด</h5>
          <p style={{ margin: '0 0 10px 0' }}>
            คลิกที่จุดข้อมูลใดก็ได้ในกราฟ — จะเปิด Modal แสดงตารางข้อมูลทั้งหมดของ Model นั้น
          </p>
          <Table
            headers={['คอลัมน์', 'คำอธิบาย']}
            rows={[
              ['Month', 'เดือน (Mon\'YYYY)'],
              ['Site', 'ไซต์การผลิต (ตัวหนา, สีตาม Site)'],
              ['Total Lot', 'จำนวน Lot ที่ตรวจ'],
              ['Pass Lot', 'จำนวน Lot ที่ผ่าน'],
              ['LAR%', 'อัตราการผ่าน (ตัวหนา, 2 ทศนิยม)'],
              ['Total Insp.', 'จำนวนชิ้นที่ตรวจ'],
              ['Total NG', 'จำนวนชิ้นที่ไม่ผ่าน'],
              ['DPPM', 'Defects Per Million (ตัวหนา)'],
            ]}
          />
        </div>
      </Section>

      {/* How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู Customer Format → Graph OQA',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'ระบบโหลดข้อมูล ม.ค. ถึงเดือนปัจจุบันอัตโนมัติ — ปรับ From/To Month ตามต้องการ',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Production Site, Customer Site, Product Family, Product Type, Models ตามต้องการ (Cascading)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'กดปุ่ม Apply เพื่อโหลดกราฟ',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'ดูกราฟ Combo (แท่ง DPPM + เส้น LAR%) แยกตาม Product Family และ Model',
            },
            {
              label: 'ขั้นตอนที่ 6',
              description: 'คลิกที่กราฟเพื่อดูข้อมูลเชิงลึกใน Data Modal',
            },
          ]}
        />
      </Section>

      {/* Metrics Explained */}
      <Section title="ตัวชี้วัดสำคัญ">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>📊 LAR% (Line Acceptance Rate)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>สูตร:</strong> (Pass Lots / Total Lots) × 100<br/>
              <strong>ช่วง:</strong> 0-100%<br/>
              <strong>ค่าที่ดี:</strong> ยิ่งสูงยิ่งดี (ใกล้ 100%)
            </p>
          </div>
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>📐 DPPM (Defects Per Million)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>สูตร:</strong> (Total NG / Total Inspections) × 1,000,000<br/>
              <strong>ช่วง:</strong> 0 ขึ้นไป<br/>
              <strong>ค่าที่ดี:</strong> ยิ่งต่ำยิ่งดี (ใกล้ 0)
            </p>
          </div>
        </div>
      </Section>

      {/* Print */}
      <Section title="การพิมพ์รายงาน">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <p style={{ margin: 0 }}>
            กดปุ่ม <strong>Print Report</strong> ที่ Header — ใช้ Browser Print (Ctrl+P)<br/>
            สามารถเลือก Save as PDF หรือพิมพ์เอกสารได้<br/>
            กราฟและข้อมูลที่แสดงบนหน้าจอจะถูกพิมพ์ตามที่เห็น
          </p>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📈 ติดตามแนวโน้ม DPPM และ LAR% รายเดือน',
            '🏭 เปรียบเทียบคุณภาพระหว่าง Site (JNHK vs TNHK)',
            '📊 วิเคราะห์คุณภาพแยกตาม Product Family และ Model',
            '📅 รายงานประจำเดือนให้ลูกค้า',
            '🔍 ระบุ Model ที่มีปัญหาคุณภาพจากแนวโน้มที่เพิ่มขึ้น',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่มีกราฟแสดง',
              'ตรวจสอบช่วง From/To Month และตัวกรอง — อาจไม่มีข้อมูลในช่วงที่เลือก กด Apply อีกครั้ง',
            ],
            [
              'ตัวกรองตัวล่างว่าง',
              'เป็นปกติ — Cascading Filter ต้องเลือกตัวบนก่อน ตัวล่างจะโหลดตามอัตโนมัติ',
            ],
            [
              'กราฟโหลดช้า',
              'ข้อมูลมาก — ลองเลือก Product Family หรือ Model เฉพาะแทนทั้งหมด',
            ],
            [
              'สีแท่ง/เส้นซ้ำกัน',
              'เมื่อมีหลาย Site สีจะหมุนเวียน — ดู Legend ใต้กราฟเพื่อแยกแยะ',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับ Graph OQA Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การวิเคราะห์แนวโน้มคุณภาพ</li>
          <li>Customer Relations - การนำเสนอข้อมูลให้ลูกค้า</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T42_GraphOQACustomerPage;
