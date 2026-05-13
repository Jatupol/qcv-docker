// client/src/pages/training/T50_SOQMWeeklyPage.tsx

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
 * SOQM Weekly Report Training Page
 */
const T50_SOQMWeeklyPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={50}
      totalCards={50}
      title="รายงาน SOQM - Weekly"
      subtitle="SOQM - Weekly Report"
      icon="📊"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน SOQM - Weekly แสดงสรุปคุณภาพรายสัปดาห์จากสถานี OQA ในรูปแบบ Pivot Table
            โดยแสดง Model เป็นคอลัมน์ พร้อมสรุปจำนวน Lot, อัตรา LAR%/LRR%, จำนวนตรวจ/NG
            และรายละเอียด Defect แต่ละประเภท
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>Reports &rarr; SOQM - Weekly</code>
          </div>
        </div>
      </Section>

      {/* How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู Reports → SOQM - Weekly',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Year - ปีงบประมาณ (Fiscal Year)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก WW - สัปดาห์ที่ต้องการดูสรุป',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Model (ไม่บังคับ) - เลือกรุ่นที่ต้องการดู หรือปล่อยว่างเพื่อดูทั้งหมด',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิกปุ่ม "Search" เพื่อแสดงตารางสรุป',
            },
          ]}
        />
      </Section>

      {/* Understanding the Report */}
      <Section title="การอ่านตารางสรุป">
        <Subsection title="1. ส่วนสรุป Lot">
          <Table
            headers={['แถว', 'ความหมาย']}
            rows={[
              ['Inspection lot', 'จำนวน Lot ที่ถูกตรวจทั้งหมด'],
              ['Accept lot', 'จำนวน Lot ที่ผ่านการตรวจ (Judgment = Pass)'],
              ['Reject lot', 'จำนวน Lot ที่ไม่ผ่านการตรวจ (Judgment = Fail)'],
            ]}
          />
        </Subsection>

        <Subsection title="2. อัตราคุณภาพ">
          <Table
            headers={['ตัวชี้วัด', 'สูตร', 'ความหมาย']}
            rows={[
              ['LAR%', '(Accept lot / Inspection lot) x 100', 'อัตราการยอมรับ Lot (สีเขียว) - ยิ่งสูงยิ่งดี'],
              ['LRR%', '(Reject lot / Inspection lot) x 100', 'อัตราการปฏิเสธ Lot (สีชมพู) - ยิ่งต่ำยิ่งดี'],
            ]}
          />
          <div style={{ marginTop: '10px', background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
            <strong>💡 หมายเหตุ:</strong> LAR% + LRR% = 100% เสมอ ถ้า LAR% แสดง "-" หมายถึงไม่มี Lot ในช่วงนั้น
          </div>
        </Subsection>

        <Subsection title="3. จำนวนตรวจและ NG">
          <Table
            headers={['แถว', 'ความหมาย']}
            rows={[
              ["INSPECTION Q'TY", 'จำนวนชิ้นงานที่สุ่มตรวจทั้งหมด (General Sampling Qty)'],
              ["NG Q'TY", 'จำนวนชิ้นงานที่ไม่ผ่าน (NG) ทั้งหมด'],
            ]}
          />
        </Subsection>

        <Subsection title="4. รายละเอียด Defect">
          <p>แสดงรายชื่อ Defect ทุกประเภทจากระบบ พร้อมจำนวน NG ต่อ Model</p>
          <div style={{ marginTop: '8px', background: '#e7f3ff', padding: '12px', borderRadius: '6px' }}>
            <strong>การอ่าน:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
              <li>แต่ละแถวแสดงประเภท Defect หนึ่งชนิด (มีสีแยกเพื่อให้อ่านง่าย)</li>
              <li>ตัวเลขในแต่ละช่อง = จำนวน NG ของ Defect นั้นใน Model นั้น</li>
              <li>ค่า 0 หมายถึงไม่พบ Defect ประเภทนั้นในสัปดาห์ที่เลือก</li>
            </ul>
          </div>
        </Subsection>
      </Section>

      {/* Export */}
      <Section title="การส่งออก Excel">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ค้นหาข้อมูลสัปดาห์ที่ต้องการก่อน',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกปุ่ม "Export Excel" เพื่อดาวน์โหลดไฟล์ .xlsx',
            },
          ]}
        />
        <div style={{ marginTop: '10px', background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
          <strong>📊 ไฟล์ Excel:</strong> จะมีรูปแบบเดียวกันกับตารางบนหน้าจอ (Pivot Table) รวมถึงชื่อรายงานและช่วงเวลา
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 สรุปคุณภาพ OQA ประจำสัปดาห์',
            '📈 ติดตาม LAR% และ LRR% แต่ละ Model',
            '🔍 วิเคราะห์ Defect ที่พบบ่อยในแต่ละ Model',
            '📋 ส่งรายงานสรุปให้ผู้บริหารหรือลูกค้า',
            '📊 เปรียบเทียบคุณภาพระหว่าง Model ในสัปดาห์เดียวกัน',
          ]}
        />
      </Section>

      {/* Tips */}
      <Section title="เคล็ดลับการใช้งาน">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>เปรียบเทียบสัปดาห์:</strong> เปิดหลายแท็บและเลือก WW ต่างกันเพื่อเปรียบเทียบ</li>
            <li><strong>โฟกัส Model:</strong> ใช้ตัวกรอง Model เพื่อดูเฉพาะรุ่นที่สนใจ</li>
            <li><strong>ใช้คู่กับ SOQM Daily:</strong> ดูสรุปที่ Weekly แล้วเจาะลึกรายวันที่ Daily</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน SOQM - Weekly:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การทบทวนคุณภาพประจำสัปดาห์</li>
          <li>QC Leader - การวิเคราะห์ Defect และวางแผนแก้ไข</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T50_SOQMWeeklyPage;
