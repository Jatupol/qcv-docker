// client/src/pages/training/T49_SOQMDailyPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  HelpBox,
  List,
} from '../../components/training/TrainingComponents';

/**
 * SOQM Daily Report Training Page
 */
const T49_SOQMDailyPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={49}
      totalCards={50}
      title="รายงาน SOQM - Daily"
      subtitle="SOQM - Daily Report"
      icon="📋"
      nextLink="/training/soqm-weekly"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน SOQM - Daily แสดงรายละเอียดจำนวน NG (Not Good) รายวัน จากสถานี OQA
            แยกตาม Lot เพื่อใช้ในการติดตามคุณภาพแบบรายวัน
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>Reports &rarr; SOQM - Daily</code>
          </div>
        </div>
      </Section>

      {/* How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู Reports → SOQM - Daily',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Year From และ WW From - ปีงบประมาณและสัปดาห์เริ่มต้น',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Year To และ WW To - ปีงบประมาณและสัปดาห์สิ้นสุด',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Model (เลือกได้หลายรุ่น) หรือปล่อยว่างเพื่อดูทุกรุ่น',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'กรอก Lot no. เพื่อค้นหาเฉพาะ Lot (ไม่บังคับ)',
            },
            {
              label: 'ขั้นตอนที่ 6',
              description: 'คลิกปุ่ม "Search" เพื่อแสดงข้อมูล',
            },
          ]}
        />
      </Section>

      {/* Understanding the Data */}
      <Section title="การอ่านข้อมูลในตาราง">
        <Table
          headers={['คอลัมน์', 'ความหมาย']}
          rows={[
            ['WW', 'สัปดาห์ (Work Week) ตามปีงบประมาณ'],
            ['Inspection Date', 'วันที่ตรวจสอบ'],
            ['Model', 'รุ่นสินค้า (Model + Version)'],
            ['Inspector ID', 'รหัสผู้ตรวจสอบ (Username)'],
            ['Lot no.', 'หมายเลข Lot ที่ถูกตรวจ'],
            ['Total NG', 'จำนวนชิ้นงานที่ไม่ผ่าน (NG) ทั้งหมดใน Lot นั้น'],
          ]}
        />

        <div style={{ marginTop: '15px', background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 หมายเหตุ:</strong> รายงานแสดงเฉพาะ Lot ที่มี NG มากกว่า 0 เท่านั้น
          ตัวเลข Total NG ที่มีสีแดงหมายถึงมี NG ตั้งแต่ 10 ชิ้นขึ้นไป
        </div>
      </Section>

      {/* Table Features */}
      <Section title="ฟีเจอร์ของตาราง">
        <List
          items={[
            '🔢 เรียงลำดับ (Sort) - คลิกที่หัวคอลัมน์เพื่อเรียงข้อมูล',
            '🔍 กรอง (Filter) - กรองตาม WW หรือ Model ได้ที่ไอคอนหัวคอลัมน์',
            '📄 แบ่งหน้า (Pagination) - เลือกจำนวนแถวต่อหน้า 20, 50, 100, 200',
          ]}
        />
      </Section>

      {/* Export */}
      <Section title="การส่งออก Excel">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ค้นหาข้อมูลที่ต้องการก่อน',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกปุ่ม "Export Excel" เพื่อดาวน์โหลดไฟล์ .xlsx',
            },
          ]}
        />
        <div style={{ marginTop: '10px', background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
          <strong>📊 ไฟล์ Excel:</strong> จะมีคอลัมน์เดียวกันกับตาราง (WW, Inspection Date, Model, Inspector ID, Lot no., Total NG)
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📋 ตรวจสอบ NG รายวันจากสถานี OQA',
            '🔍 ค้นหา Lot ที่มีปัญหาคุณภาพ',
            '👤 ติดตามผลการตรวจของผู้ตรวจสอบแต่ละคน',
            '📊 ส่งออกข้อมูลไปวิเคราะห์ต่อใน Excel',
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน SOQM - Daily:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Engineer - การวิเคราะห์ข้อมูล NG รายวัน</li>
          <li>QC Leader - ติดตามผลการตรวจสอบของทีม</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T49_SOQMDailyPage;
