// client/src/pages/training/T35_IQATrendCustomerPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  List,
  HelpBox,
} from '../../components/training/TrainingComponents';

/**
 * IQA Trend Customer Report Training Page
 */
const T35_IQATrendCustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={35}
      totalCards={48}
      title="รายงานแนวโน้ม IQA สำหรับลูกค้า"
      subtitle="IQA Trend Customer Report"
      icon="📉"
      nextLink="/training/graph-oqa-customer"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงานแนวโน้ม IQA ฉบับลูกค้า แสดงการเปลี่ยนแปลงของผลการตรวจสอบจากลูกค้าในช่วงเวลายาว
            เพื่อแสดงความมุ่งมั่นในการปรับปรุงอย่างต่อเนื่อง
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/sgt-iqa-trend-report</code>
          </div>
        </div>

        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>📈 แนวโน้ม = การพัฒนา</h4>
          <p style={{ margin: 0 }}>
            <strong>Trend Report แสดงให้ลูกค้าเห็น:</strong><br/>
            ✅ เราปรับปรุงคุณภาพอย่างต่อเนื่อง<br/>
            ✅ มีการติดตามและแก้ไขปัญหาอย่างเป็นระบบ<br/>
            ✅ ความมุ่งมั่นระยะยาวในการส่งมอบคุณภาพ
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Customer Reports → IQA Trend Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Start Date และ End Date (แนะนำ 6-12 เดือน)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิก "Generate Report"',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'ตรวจสอบแนวโน้ม - ดีขึ้นหรือแย่ลง?',
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
            '📋 Executive Summary - สรุปแนวโน้มโดยรวม',
            '📈 Trend Chart - กราฟแนวโน้ม (ง่ายต่อการอ่าน)',
            '📊 Period Comparison - เปรียบเทียบแต่ละช่วง',
            '🎯 Key Improvements - จุดที่ปรับปรุงได้',
            '✅ Success Stories - เรื่องราวความสำเร็จ (ถ้ามี)',
            '📝 Professional Presentation - การนำเสนอแบบมืออาชีพ',
          ]}
        />
      </Section>

      {/* How to Present Trends */}
      <Section title="วิธีนำเสนอแนวโน้มให้ลูกค้า">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>📈 เมื่อแนวโน้มดีขึ้น (Upward Trend)</h5>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>สิ่งที่ต้องเน้น:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>แสดงกราฟการปรับปรุงอย่างชัดเจน</li>
              <li>อธิบายว่าทำอะไรจึงทำให้ดีขึ้น</li>
              <li>แสดงความมุ่งมั่นที่จะรักษาและพัฒนาต่อ</li>
              <li>ขอบคุณลูกค้าสำหรับข้อเสนอแนะที่ช่วยให้ปรับปรุง</li>
            </ul>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>➡️ เมื่อแนวโน้มคงที่ (Stable)</h5>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>สิ่งที่ต้องเน้น:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>ถ้าระดับสูงอยู่แล้ว → เน้นความมั่นคงและความน่าเชื่อถือ</li>
              <li>ถ้าระดับต่ำอยู่ → อธิบายแผนปรับปรุง</li>
              <li>แสดงความมุ่งมั่นในการพัฒนา</li>
            </ul>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>📉 เมื่อแนวโน้มแย่ลง (Downward Trend)</h5>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>สิ่งที่ต้องทำ:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li><strong>อย่าปกปิด</strong> - ยอมรับปัญหาอย่างตรงไปตรงมา</li>
              <li>อธิบายสาเหตุที่เป็นไปได้</li>
              <li>แสดงแผนแก้ไขอย่างละเอียด</li>
              <li>กำหนดกรอบเวลาที่จะเห็นผล</li>
              <li>เสนอการเข้าพบหรือโทรประชุมเพื่ออธิบายเพิ่มเติม</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Email Template */}
      <Section title="ตัวอย่างอีเมลส่งรายงาน">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📧 Email Subject:</h4>
          <div style={{ background: 'white', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
            <code>IQA Trend Report - [Month/Quarter] [Year]</code>
          </div>

          <h4 style={{ margin: '15px 0 10px 0' }}>📝 Email Body (แนวโน้มดี):</h4>
          <div style={{ background: 'white', padding: '15px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}>
            <p style={{ margin: 0 }}>
              เรียน คุณ [ชื่อลูกค้า],<br/><br/>
              ขอส่งรายงานแนวโน้มการตรวจสอบคุณภาพจากท่านในช่วง [ระบุช่วงเวลา]<br/><br/>
              <strong>สรุปสำคัญ:</strong><br/>
              • Pass Rate เพิ่มขึ้นจาก XX% เป็น YY%<br/>
              • ข้อบกพร่องหลักลดลง ZZ%<br/>
              • แนวโน้มโดยรวมดีขึ้นอย่างต่อเนื่อง<br/><br/>
              ความสำเร็จนี้เป็นผลมาจาก [อธิบายสั้นๆ] และข้อเสนอแนะอันมีค่าจากท่าน<br/><br/>
              เราจะดำเนินการต่อเนื่องเพื่อรักษาและพัฒนาคุณภาพให้ดียิ่งขึ้น<br/><br/>
              หากมีข้อสงสัยหรือต้องการหารือเพิ่มเติม กรุณาติดต่อได้ทุกเมื่อ<br/><br/>
              ขอแสดงความนับถือ,<br/>
              [ชื่อของคุณ]<br/>
              [ตำแหน่ง]
            </p>
          </div>
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>✅ Do's (ควรทำ):</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>✅ ส่งรายงานสม่ำเสมอ (ไตรมาสละครั้ง)</li>
            <li>✅ ใช้ภาษาเชิงบวก แม้ผลไม่ดีก็เน้นที่การปรับปรุง</li>
            <li>✅ แสดงข้อมูลอย่างตรงไปตรงมา ไม่บิดเบือน</li>
            <li>✅ แนบหลักฐานการปรับปรุง (ถ้ามี)</li>
            <li>✅ เปิดโอกาสให้ลูกค้าถามคำถาม</li>
          </ul>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>❌ Don'ts (ไม่ควรทำ):</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>❌ อย่าส่งเฉพาะเมื่อผลดี ซ่อนเมื่อผลไม่ดี</li>
            <li>❌ อย่าใช้คำแก้ตัว โทษสิ่งอื่น</li>
            <li>❌ อย่าบิดเบือนข้อมูลหรือใช้กราฟที่ทำให้เข้าใจผิด</li>
            <li>❌ อย่าสัญญาสิ่งที่ทำไม่ได้</li>
            <li>❌ อย่าปล่อยให้ลูกค้าติดต่อมาถามเอง</li>
          </ul>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 Quarterly Business Reviews - ประชุมทบทวนรายไตรมาส',
            '📈 Progress Demonstration - แสดงความก้าวหน้า',
            '🤝 Relationship Building - สร้างความสัมพันธ์ระยะยาว',
            '💼 Contract Renewal - การต่อสัญญา',
            '🏆 Success Celebration - ฉลองความสำเร็จร่วมกัน',
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน IQA Trend Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Customer Relations - การนำเสนอและการสื่อสาร</li>
          <li>Quality Manager - การตีความแนวโน้มและการวางแผน</li>
          <li>REPORTS_MANUAL.md หน้า "IQA Trend Customer Report"</li>
        </ul>
        <div style={{ marginTop: '15px', padding: '15px', background: '#d4edda', borderRadius: '6px' }}>
          <strong>🎓 เสร็จสิ้นการเรียน Report Training!</strong><br/>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            กลับไปที่ <a href="/training">Training Index</a> เพื่อทบทวนรายงานอื่นๆ
          </p>
        </div>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T35_IQATrendCustomerPage;
