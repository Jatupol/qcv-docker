// client/src/pages/training/T17_FiscalCalendarPage.tsx

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
 * Fiscal Calendar Training Page
 *
 * Quick Reference Card #17: Seagate Financial Calendar
 */
const T17_FiscalCalendarPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={17}
      totalCards={48}
      title="ปฏิทิน Fiscal Year"
      subtitle="Seagate Financial Calendar"
      icon="📅"
      nextLink="/training/t09"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            Seagate Financial Calendar แสดงปฏิทิน Fiscal Year ตามรูปแบบ Seagate
            ใช้สำหรับอ้างอิง Work Week (WW), YearMonth (YYMM) และ Fiscal Quarter (FQ1-FQ4)
            ข้อมูลนี้เป็นพื้นฐานในการกรองรายงานและบันทึกข้อมูลตรวจสอบทั้งหมดในระบบ
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Master Data → Fiscal Calendar &nbsp; | &nbsp; /master-data/fiscal-calendar
          </p>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#721c24' }}>
            ⚠️ สิทธิ์การเข้าถึง: เฉพาะ Admin และ Manager เท่านั้น
          </p>
        </div>
      </Section>

      {/* Fiscal Year Rules */}
      <Section title="กฎ Fiscal Year ของ Seagate">
        <Table
          headers={['กฎ', 'รายละเอียด']}
          rows={[
            ['วันเริ่มต้น', 'วันเสาร์ที่ใกล้ 1 กรกฎาคม มากที่สุด (อาจเป็นปลายมิถุนายน)'],
            ['สัปดาห์เริ่ม', 'วันเสาร์ (Saturday) ถึง วันศุกร์ (Friday)'],
            ['จำนวนสัปดาห์', '52 สัปดาห์เต็ม (364 วัน)'],
            ['การตั้งชื่อ', 'FY ตั้งชื่อตามปีสิ้นสุด เช่น FY2026 เริ่มประมาณ กรกฎาคม 2025'],
            ['Fiscal Quarter', 'FQ1 (ก.ค.-ก.ย.), FQ2 (ต.ค.-ธ.ค.), FQ3 (ม.ค.-มี.ค.), FQ4 (เม.ย.-มิ.ย.)'],
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#e8f4f8', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0066cc' }}>ตัวอย่างวันเริ่มต้น FY</h4>
          <Table
            headers={['Fiscal Year', 'Week 1 เริ่ม', '1 ก.ค. ตรงกับวัน']}
            rows={[
              ['FY2024', '1 กรกฎาคม 2023', 'เสาร์'],
              ['FY2025', '29 มิถุนายน 2024', 'จันทร์'],
              ['FY2026', '28 มิถุนายน 2025', 'อังคาร'],
            ]}
          />
        </div>
      </Section>

      {/* Calendar Layout */}
      <Section title="รูปแบบปฏิทิน">
        <Subsection title="โครงสร้างปฏิทิน">
          <p>ปฏิทินแสดงในรูปแบบ Grid โดยแบ่งเป็น 4 Fiscal Quarter (FQ1-FQ4) แต่ละ Quarter มี 3 เดือน</p>
          <ul>
            <li><strong>คอลัมน์วัน:</strong> S (เสาร์), S (อาทิตย์), M (จันทร์), T (อังคาร), W (พุธ), T (พฤหัส), F (ศุกร์)</li>
            <li><strong>คอลัมน์ FW:</strong> หมายเลข Fiscal Week (คลิกได้เพื่อแก้ไข)</li>
          </ul>
        </Subsection>

        <Subsection title="สีและสัญลักษณ์">
          <Table
            headers={['สี / สัญลักษณ์', 'ความหมาย']}
            rows={[
              ['สีส้ม (พื้นหลัง)', 'วันนี้ (Today)'],
              ['สีม่วงอ่อน', 'วันเสาร์ (Saturday) - วันเริ่มต้นสัปดาห์ Fiscal'],
              ['สีเขียว (FQ1)', 'Fiscal Quarter 1 (ก.ค. - ก.ย.)'],
              ['สีส้ม (FQ2)', 'Fiscal Quarter 2 (ต.ค. - ธ.ค.)'],
              ['สีน้ำเงิน (FQ3)', 'Fiscal Quarter 3 (ม.ค. - มี.ค.)'],
              ['สีชมพู (FQ4)', 'Fiscal Quarter 4 (เม.ย. - มิ.ย.)'],
              ['ตัวเลขสีเทาอ่อน', 'วันที่อยู่นอกเดือนปัจจุบัน (ของ Fiscal Month)'],
            ]}
          />
        </Subsection>
      </Section>

      {/* How to View */}
      <Section title="การดูปฏิทิน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู "Master Data" → เลือก "Fiscal Calendar"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Fiscal Year จาก Dropdown (ค่าเริ่มต้น: FY ปัจจุบัน)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ดูปฏิทิน 4 Quarters (FQ1-FQ4) แต่ละ Quarter มี 3 เดือน',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ดู FW (Fiscal Week) ที่คอลัมน์ขวาสุดของแต่ละสัปดาห์',
            },
          ]}
        />
      </Section>

      {/* Editing YearMonth */}
      <Section title="การแก้ไข YearMonth">
        <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>⚠️ ใช้เมื่อ:</strong> ต้องการปรับ YearMonth (YYMM) ของสัปดาห์ที่ไม่ตรงกับที่ต้องการ
            เช่น สัปดาห์ที่คร่อมเดือน อาจต้องปรับให้อยู่ในเดือนที่ถูกต้อง
          </p>
        </div>

        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'คลิกที่หมายเลข FW ในคอลัมน์ขวาสุด (ตัวเลขขีดเส้นใต้สีน้ำเงิน)',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'Modal จะเปิดขึ้นแสดง Fiscal Year, Work Week และ YearMonth ปัจจุบัน',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'แก้ไขค่า YearMonth (รูปแบบ YYMM เช่น 2607 = กรกฎาคม 2026)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิก "Save" เพื่อบันทึก ระบบจะอัปเดททุกวันในสัปดาห์นั้น',
            },
          ]}
        />

        <Subsection title="รูปแบบ YearMonth (YYMM)">
          <Table
            headers={['YearMonth', 'ความหมาย']}
            rows={[
              ['2507', 'กรกฎาคม 2025'],
              ['2601', 'มกราคม 2026'],
              ['2612', 'ธันวาคม 2026'],
            ]}
          />
        </Subsection>
      </Section>

      {/* Generate New FY */}
      <Section title="การสร้าง Fiscal Year ใหม่">
        <div style={{ background: '#d4edda', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 ใช้เมื่อ:</strong> ต้องการสร้างปฏิทิน Fiscal Year ใหม่สำหรับปีถัดไป
            ระบบจะคำนวณวันเริ่มต้น (Saturday ที่ใกล้ 1 กรกฎาคม) และสร้าง 52 สัปดาห์ (364 วัน) อัตโนมัติ
          </p>
        </div>

        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'คลิกปุ่ม "Generate FY" (สีเขียว) ที่มุมขวาบน',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'กรอกหมายเลข Fiscal Year ที่ต้องการสร้าง (เช่น 2027)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิก "Generate" เพื่อสร้างปฏิทิน',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ระบบจะสร้าง 52 สัปดาห์พร้อม YearMonth อัตโนมัติ และแสดงปฏิทินใหม่',
            },
          ]}
        />

        <div style={{ background: '#f8d7da', padding: '12px', borderRadius: '8px', marginTop: '15px', border: '1px solid #f5c6cb' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#721c24' }}>⚠️ ข้อควรระวัง</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>ตรวจสอบว่า FY ที่ต้องการยังไม่มีในระบบ</li>
            <li>หลังสร้างแล้ว ตรวจสอบ YearMonth ของสัปดาห์คร่อมเดือนว่าถูกต้อง</li>
            <li>ค่า FY ต้องอยู่ในช่วง 2000-2100</li>
          </ul>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📅 ตรวจสอบ Work Week ปัจจุบันและช่วงวันที่',
            '🔍 อ้างอิง FW เมื่อกรองรายงาน (LAR, SGT IQA, OQA)',
            '📊 ยืนยัน YearMonth ที่ใช้ในการจัดกลุ่มข้อมูลรายงาน',
            '➕ สร้าง Fiscal Year ใหม่ก่อนเริ่มปีงบประมาณ (ต้นกรกฎาคม)',
            '✏️ ปรับ YearMonth ของสัปดาห์ที่คร่อมเดือนให้ถูกต้อง',
            '📋 อ้างอิง Fiscal Quarter (FQ1-FQ4) สำหรับรายงานไตรมาส',
          ]}
        />
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>✅ ควรทำ</h4>
          <ul>
            <li>สร้าง FY ใหม่ล่วงหน้าก่อนเริ่มปีงบประมาณ</li>
            <li>ตรวจสอบ YearMonth ของสัปดาห์แรกและสัปดาห์สุดท้ายของแต่ละเดือน</li>
            <li>ใช้ปฏิทินนี้เป็นข้อมูลอ้างอิงเมื่อมีคำถามเรื่อง Work Week</li>
            <li>ตรวจสอบว่าวันปัจจุบัน (สีส้ม) ตรงกับ FW ที่ถูกต้อง</li>
          </ul>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ ไม่ควรทำ</h4>
          <ul>
            <li>ไม่ควรแก้ไข YearMonth โดยไม่เข้าใจผลกระทบต่อรายงาน</li>
            <li>ไม่ควรสร้าง FY ซ้ำที่มีอยู่แล้ว</li>
            <li>ไม่ควรลบข้อมูล Fiscal Calendar โดยตรงจากฐานข้อมูล</li>
          </ul>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ปฏิทินว่าง', 'ตรวจสอบว่า FY ที่เลือกมีข้อมูลในระบบ, ลอง Generate FY ใหม่'],
            ['FW ไม่ตรง', 'ตรวจสอบวันเริ่มต้น FY, อาจต้อง Generate ใหม่'],
            ['YearMonth ไม่ถูกต้อง', 'คลิกที่ FW เพื่อแก้ไข YearMonth (รูปแบบ YYMM)'],
            ['Generate ล้มเหลว', 'ตรวจสอบว่า FY ไม่ซ้ำ, ค่าต้องอยู่ในช่วง 2000-2100'],
            ['รายงานแสดงข้อมูลผิดเดือน', 'ตรวจสอบ YearMonth ในปฏิทินว่าถูกต้อง'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>ติดต่อ:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - สำหรับคำถามเรื่อง Fiscal Week</li>
          <li>IT Support - สำหรับปัญหาทางเทคนิค</li>
          <li>ดู flow/FISCAL_WEEK_FLOW.md สำหรับรายละเอียดเพิ่มเติม</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T17_FiscalCalendarPage;
