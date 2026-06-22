// client/src/pages/training/T32_IQAOQACustomerPage.tsx

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
 * IQA-OQA Customer Report Training Page
 */
const T32_IQAOQACustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={32}
      totalCards={48}
      title="รายงาน IQA vs OQA สำหรับลูกค้า"
      subtitle="IQA-OQA Customer Report"
      icon="⚖️"
      nextLink="/training/overall-oqa-customer-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงานเปรียบเทียบ IQA (ลูกค้าตรวจ) กับ OQA (เราตรวจ) ฉบับลูกค้า
            แสดงความสอดคล้องระหว่างการตรวจสอบของทั้งสองฝ่าย ในรูปแบบที่เป็นมิตรกับลูกค้า
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/sgt-iqa-nhk-oqa-report</code>
          </div>
        </div>

        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>⚖️ ทำไมต้องเปรียบเทียบ?</h4>
          <p style={{ margin: 0 }}>
            <strong>การเปรียบเทียบ IQA vs OQA แสดงให้ลูกค้าเห็นว่า:</strong><br/>
            ✅ ระบบตรวจสอบของเราเข้มงวดเท่ากับของลูกค้า<br/>
            ✅ เราตรวจจับปัญหาได้ก่อนส่งของให้ลูกค้า<br/>
            ✅ มีความโปร่งใสในการควบคุมคุณภาพ
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Customer Reports → IQA-OQA Comparison',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Date Range',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Model (ถ้าต้องการ)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิก "Generate Report"',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'Export PDF ส่งให้ลูกค้า',
            },
          ]}
        />
      </Section>

      {/* Key Features for Customer */}
      <Section title="สิ่งที่รวมอยู่ในรายงาน (ฉบับลูกค้า)">
        <List
          items={[
            '📋 Executive Summary - สรุปผู้บริหาร',
            '⚖️ IQA vs OQA Comparison Chart - กราฟเปรียบเทียบแบบง่าย',
            '✅ Alignment Score - คะแนนความสอดคล้อง',
            '📊 Simplified Statistics - สถิติแบบย่อ',
            '🎯 Key Findings - ประเด็นสำคัญ',
            '📝 Professional Layout - รูปแบบมืออาชีพ',
          ]}
        />
      </Section>

      {/* What to Highlight */}
      <Section title="สิ่งที่ต้องเน้นเมื่อส่งให้ลูกค้า">
        <Table
          headers={['สถานการณ์', 'ข้อความที่ควรสื่อสาร']}
          rows={[
            [
              'IQA = OQA (ตรงกันดี)',
              '"ระบบตรวจสอบของเรามีประสิทธิภาพสอดคล้องกับการตรวจของท่าน แสดงถึงความเข้มงวดในการควบคุมคุณภาพ"',
            ],
            [
              'OQA เข้มกว่า IQA',
              '"ระบบของเราตรวจจับปัญหาได้มากกว่า เป็นการป้องกันไม่ให้ปัญหาไปถึงลูกค้า"',
            ],
            [
              'IQA พบปัญหาที่ OQA พลาด',
              '"เราได้ทบทวนและปรับปรุงกระบวนการตรวจสอบเพื่อป้องกันการเกิดซ้ำ"',
            ],
          ]}
        />
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>✅ ก่อนส่งให้ลูกค้า:</h4>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>ตรวจสอบความแตกต่างระหว่าง IQA และ OQA</li>
            <li>ถ้ามีส่วนต่าง เตรียมคำอธิบาย</li>
            <li>เน้นสิ่งที่ดี (OQA เข้มงวด = ดี)</li>
            <li>ถ้ามีปัญหา แนบแผนแก้ไข</li>
            <li>ใช้ภาษาเชิงบวก</li>
          </ol>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '👥 Monthly Customer Reviews - ทบทวนรายเดือนกับลูกค้า',
            '🤝 Building Trust - สร้างความเชื่อมั่นให้ลูกค้า',
            '📊 Transparency Reporting - รายงานความโปร่งใส',
            '📜 Contract Compliance - ยืนยันการปฏิบัติตามสัญญา',
            '✅ Quality Assurance Proof - พิสูจน์การประกันคุณภาพ',
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน IQA-OQA Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Customer Relations - การสื่อสารกับลูกค้า</li>
          <li>Quality Manager - การอธิบายความแตกต่าง</li>
          <li>REPORTS_MANUAL.md หน้า "IQA-OQA Customer Report"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T32_IQAOQACustomerPage;
