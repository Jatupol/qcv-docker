// client/src/pages/training/T34_IQAResultCustomerPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  List,
  HelpBox,
} from '../../components/training/TrainingComponents';

/**
 * IQA Result Customer Report Training Page
 */
const T34_IQAResultCustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={34}
      totalCards={48}
      title="รายงานผล IQA สำหรับลูกค้า"
      subtitle="IQA Result Customer Report"
      icon="📋"
      nextLink="/training/iqa-trend-customer-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงานผล IQA ฉบับลูกค้า แสดงผลการตรวจสอบคุณภาพโดยลูกค้าในรูปแบบที่เหมาะสำหรับการนำเสนอ
            พร้อม Executive Summary และรายละเอียดที่ลดความซับซ้อน
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/sgt-iqa-result-report</code>
          </div>
        </div>

        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>💡 IQA = เสียงของลูกค้า</h4>
          <p style={{ margin: 0 }}>
            <strong>IQA Result</strong> แสดงว่าลูกค้ามองเราอย่างไร<br/>
            รายงานนี้ควรเปิดเผยกับลูกค้าเพื่อแสดงความโปร่งใสและความมุ่งมั่นในการปรับปรุง
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Customer Reports → IQA Result Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือกช่วงเวลา (Fiscal Year, Work Week)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิก "Generate Report"',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ทบทวน Executive Summary',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'Export PDF พร้อมส่งให้ลูกค้า',
            },
          ]}
        />
      </Section>

      {/* Simplified Features */}
      <Section title="สิ่งที่รวมอยู่ในรายงาน (ฉบับลูกค้า)">
        <List
          items={[
            '📋 Executive Summary - สรุปผลการตรวจสอบ',
            '📊 Pass/Fail Summary - สรุปผ่าน/ไม่ผ่าน',
            '📈 Performance Chart - กราฟผลการดำเนินงาน (แบบง่าย)',
            '🔍 Key Findings - ประเด็นที่พบ (เฉพาะสำคัญ)',
            '✅ Corrective Actions - มาตรการแก้ไข (ถ้ามี)',
            '🏢 Professional Format - รูปแบบมืออาชีพ',
          ]}
        />
      </Section>

      {/* Communication Guidelines */}
      <Section title="แนวทางการสื่อสารกับลูกค้า">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ เมื่อ Pass Rate สูง (&gt; 95%)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>ข้อความแนะนำ:</strong><br/>
              "เราภูมิใจที่ได้รับผลการตรวจสอบจากท่านในระดับ XX%
              แสดงถึงความมุ่งมั่นของเราในการส่งมอบผลิตภัณฑ์คุณภาพสูงให้ท่าน
              เราจะรักษามาตรฐานนี้ไว้และพัฒนาต่อไป"
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ เมื่อ Pass Rate ปานกลาง (90-95%)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>ข้อความแนะนำ:</strong><br/>
              "ผลการตรวจของท่านช่วยให้เราระบุจุดที่ต้องปรับปรุง
              เราได้จัดทำแผนแก้ไขและคาดว่าจะเห็นผลดีขึ้นในรอบหน้า"
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>❌ เมื่อ Pass Rate ต่ำ (&lt; 90%)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>ข้อความแนะนำ:</strong><br/>
              "เราต้องขอโทษสำหรับผลการตรวจที่ไม่เป็นที่พอใจ
              เราได้วิเคราะห์สาเหตุและจัดทำแผนแก้ไขเร่งด่วนแล้ว
              [แนบรายละเอียดแผนแก้ไข]
              เราจะอัพเดทความคืบหน้าให้ท่านทราบทุกสัปดาห์"
            </p>
          </div>
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>📧 เมื่อส่งรายงานนี้:</h4>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><strong>เตรียมตัว:</strong> อ่านรายงานให้เข้าใจทั้งหมดก่อน</li>
            <li><strong>ประเมิน:</strong> ผล Pass/Fail ดีหรือไม่ดี?</li>
            <li><strong>เตรียมคำอธิบาย:</strong> ถ้าไม่ดี ต้องมีคำอธิบายและแผนแก้ไข</li>
            <li><strong>ใช้ภาษาเชิงบวก:</strong> แม้ผลจะไม่ดี ก็เน้นที่การแก้ไขและปรับปรุง</li>
            <li><strong>แนบหลักฐาน:</strong> ถ้ามีการแก้ไข แนบหลักฐานที่แสดงการดำเนินการ</li>
            <li><strong>เปิดโอกาส:</strong> เชิญชวนให้ลูกค้าสอบถาม หรือเข้าเยี่ยมชมโรงงาน</li>
          </ol>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '👥 Customer Quality Feedback - ตอบสนองต่อผลการตรวจของลูกค้า',
            '📊 Transparency Reporting - แสดงความโปร่งใส',
            '🤝 Trust Building - สร้างความเชื่อมั่น',
            '📈 Progress Tracking - ติดตามความคืบหน้าการปรับปรุง',
            '💼 Relationship Management - การบริหารความสัมพันธ์',
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน IQA Result Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Customer Relations - การสื่อสารและจัดการความคาดหวัง</li>
          <li>Quality Manager - การอธิบายผลและแผนแก้ไข</li>
          <li>REPORTS_MANUAL.md หน้า "IQA Result Customer Report"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T34_IQAResultCustomerPage;
