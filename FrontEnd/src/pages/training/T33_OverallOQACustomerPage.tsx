// client/src/pages/training/T33_OverallOQACustomerPage.tsx

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
 * Overall OQA Customer Report Training Page
 */
const T33_OverallOQACustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={33}
      totalCards={48}
      title="รายงาน Overall OQA สำหรับลูกค้า"
      subtitle="Overall OQA Customer Report"
      icon="📈"
      nextLink="/training/iqa-result-customer-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน Overall OQA DPPM ฉบับลูกค้า แสดงภาพรวมคุณภาพในรูปแบบที่เหมาะสมสำหรับลูกค้า
            เน้น Executive Summary และกราฟที่เข้าใจง่าย
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/nhk-oqa-dppm-overall-report</code>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📊 DPPM สำหรับลูกค้า</h4>
          <p style={{ margin: 0 }}>
            <strong>DPPM = Defects Per Million</strong><br/>
            ตัวชี้วัดสากลที่ลูกค้าเข้าใจและใช้เปรียบเทียบ Supplier ต่างๆ<br/>
            <strong>ยิ่งต่ำยิ่งดี</strong> - แสดงถึงคุณภาพสูง
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Customer Reports → Overall OQA Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือกช่วงเวลาที่ต้องการรายงาน',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิก "Generate Report"',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ตรวจสอบ Executive Summary',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'Export PDF พร้อมส่งให้ลูกค้า',
            },
          ]}
        />
      </Section>

      {/* Customer Report Features */}
      <Section title="คุณลักษณะพิเศษสำหรับลูกค้า">
        <List
          items={[
            '📋 Executive Summary - สรุปสั้นๆ สำหรับผู้บริหาร',
            '📈 Simplified Charts - กราฟง่ายๆ เข้าใจได้ทันที',
            '🎯 Key Highlights - ไฮไลท์ประเด็นสำคัญ',
            '✅ Performance vs Target - เทียบกับเป้าหมาย',
            '📊 Professional Layout - รูปแบบมืออาชีพ',
            '🏢 Company Branding - มี Logo และข้อมูลบริษัท',
          ]}
        />
      </Section>

      {/* DPPM Interpretation for Customer */}
      <Section title="การอธิบาย DPPM ให้ลูกค้าเข้าใจ">
        <Table
          headers={['DPPM Range', 'Quality Level', 'ข้อความที่ควรสื่อสาร']}
          rows={[
            [
              '< 500',
              '✅ ดีเยี่ยม',
              '"เราบรรลุและเกินเป้าหมายคุณภาพ แสดงถึงการควบคุมคุณภาพที่มีประสิทธิภาพสูง"',
            ],
            [
              '500-1000',
              '⚠️ พอใช้',
              '"เรากำลังปรับปรุงกระบวนการเพื่อลด DPPM ให้ต่ำกว่า 500"',
            ],
            [
              '> 1000',
              '❌ ต้องปรับปรุง',
              '"เราได้ระบุปัญหาและจัดทำแผนแก้ไขเร่งด่วน คาดว่าจะกลับมาอยู่ในเกณฑ์ภายใน..."',
            ],
          ]}
        />
      </Section>

      {/* Communication Tips */}
      <Section title="เคล็ดลับการสื่อสารกับลูกค้า">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ เมื่อ DPPM ต่ำ (ดี)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              - เน้นความสำเร็จ<br/>
              - แชร์ Best Practices<br/>
              - ยืนยันการรักษาระดับ
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ เมื่อ DPPM สูง (ไม่ดี)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              - ยอมรับปัญหา อย่าปกปิด<br/>
              - อธิบายสาเหตุ<br/>
              - แสดงแผนแก้ไข<br/>
              - กำหนดกรอบเวลา
            </p>
          </div>

          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>📈 เมื่อมีแนวโน้มดีขึ้น</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              - เน้นการปรับปรุง<br/>
              - แสดงข้อมูลก่อน-หลัง<br/>
              - แชร์สิ่งที่ทำ
            </p>
          </div>
        </div>
      </Section>

      {/* Before Sending Checklist */}
      <Section title="Checklist ก่อนส่งให้ลูกค้า">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>✅ ต้องตรวจสอบ:</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>☑️ DPPM ถูกต้อง และสมเหตุสมผล</li>
            <li>☑️ เปรียบเทียบกับเดือนที่แล้ว - ดีขึ้นหรือแย่ลง?</li>
            <li>☑️ ถ้าแย่ลง มีคำอธิบายและแผนแก้ไข</li>
            <li>☑️ Executive Summary ชัดเจน อ่านง่าย</li>
            <li>☑️ กราฟแสดงผลถูกต้อง ไม่บิดเบือน</li>
            <li>☑️ ใช้ภาษาที่มืออาชีพ ไม่ใช้คำสแลง</li>
            <li>☑️ Logo และข้อมูลบริษัทถูกต้อง</li>
          </ul>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📅 Monthly Customer Reporting - รายงานประจำเดือน',
            '💼 Business Review Meetings - ประชุมทบทวนธุรกิจ',
            '📊 Performance Tracking - ติดตามผลการดำเนินงาน',
            '📜 Contract Compliance - ยืนยันการปฏิบัติตามสัญญา',
            '🏆 Quality Achievement - แสดงความสำเร็จด้านคุณภาพ',
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Overall OQA Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Customer Relations - การสื่อสารและนำเสนอ</li>
          <li>Quality Manager - การอธิบาย DPPM และแนวโน้ม</li>
          <li>REPORTS_MANUAL.md หน้า "Overall OQA Customer Report"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T33_OverallOQACustomerPage;
