// client/src/pages/training/T31_LARCustomerPage.tsx

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
 * LAR Customer Report Training Page
 */
const T31_LARCustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={31}
      totalCards={48}
      title="รายงาน LAR สำหรับลูกค้า"
      subtitle="LAR Customer Report"
      icon="📊"
      nextLink="/training/iqa-oqa-customer-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน LAR ฉบับลูกค้า แสดงข้อมูล Line Acceptance Rate ในรูปแบบที่เหมาะสำหรับนำเสนอลูกค้า
            ใช้ภาษาและการนำเสนอที่เป็นมิตรกับลูกค้า พร้อม Executive Summary
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/lar-report</code>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🔄 เทียบกับรายงาน LAR ภายใน</h4>
          <p style={{ margin: 0 }}>
            <strong>เหมือนกัน:</strong> ข้อมูล LAR, กราฟ, ตัวชี้วัด<br/>
            <strong>ต่างกัน:</strong> การนำเสนอแบบ Professional, ลดรายละเอียดทางเทคนิค, เน้น Executive Summary
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Customer Reports → LAR Customer Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Date Range - ช่วงเวลา',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: '(Optional) เลือก Model เพื่อกรองเฉพาะรุ่น',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิก "Generate Report"',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'Export เป็น PDF ก่อนส่งให้ลูกค้า',
            },
          ]}
        />
      </Section>

      {/* Key Differences from Internal Report */}
      <Section title="ความแตกต่างจากรายงานภายใน">
        <Table
          headers={['ด้าน', 'รายงานภายใน', 'รายงานลูกค้า']}
          rows={[
            ['ภาษา', 'ภาษาทางเทคนิค', 'ภาษาที่ลูกค้าเข้าใจง่าย'],
            ['รายละเอียด', 'ครบถ้วนทุกอย่าง', 'เฉพาะสิ่งสำคัญ'],
            ['การออกแบบ', 'เน้นการใช้งานภายใน', 'เน้นความเป็นมืออาชีพ'],
            ['Executive Summary', 'ไม่มี', 'มี - สรุปสั้นๆ ด้านบน'],
          ]}
        />
      </Section>

      {/* What's Included */}
      <Section title="สิ่งที่รวมอยู่ในรายงาน">
        <List
          items={[
            '📋 Executive Summary - สรุปผู้บริหารสั้นๆ',
            '📊 LAR Overview - ภาพรวม LAR',
            '📈 Trend Charts - กราฟแนวโน้ม (แบบง่าย)',
            '🎯 Key Highlights - จุดเด่นสำคัญ',
            '✅ Performance Status - สถานะผลการดำเนินงาน',
            '📝 Brief Analysis - การวิเคราะห์แบบสั้น',
          ]}
        />
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดีเมื่อส่งให้ลูกค้า">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>✅ ก่อนส่งรายงาน:</h4>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>ตรวจสอบข้อมูลให้ถูกต้อง 100%</li>
            <li>อ่าน Executive Summary ให้แน่ใจว่าชัดเจน</li>
            <li>ตรวจสอบว่า LAR อยู่ในเกณฑ์ที่ตกลงกับลูกค้า</li>
            <li>ถ้า LAR ต่ำ ต้องเตรียมคำอธิบายและแผนแก้ไข</li>
            <li>Export เป็น PDF ตั้งชื่อไฟล์ชัดเจน (เช่น LAR_Report_Jun2024_Customer.pdf)</li>
          </ol>
        </div>

        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>📧 เมื่อส่ง Email:</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>ใช้ Subject ชัดเจน: "Monthly LAR Report - June 2024"</li>
            <li>เขียนสรุปสั้นๆ ใน Email Body</li>
            <li>Highlight ผลลัพธ์ที่ดี (ถ้ามี)</li>
            <li>อธิบายปัญหา (ถ้ามี) พร้อมแผนแก้ไข</li>
            <li>เปิดโอกาสให้ลูกค้าถามคำถาม</li>
          </ul>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📅 Monthly Customer Reporting - รายงานประจำเดือนให้ลูกค้า',
            '👥 Customer Quality Reviews - ประชุมทบทวนคุณภาพกับลูกค้า',
            '📜 Contract Compliance - แสดงว่าปฏิบัติตามสัญญา',
            '🏅 Performance Proof - พิสูจน์ประสิทธิภาพ',
            '📊 Business Reviews - ประชุมทบทวนธุรกิจ',
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน LAR Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Customer Relations - การส่งรายงานและการติดต่อ</li>
          <li>Quality Manager - การอธิบายข้อมูลให้ลูกค้า</li>
          <li>REPORTS_MANUAL.md หน้า "LAR Customer Report"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T31_LARCustomerPage;
