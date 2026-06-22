// client/src/pages/training/T25_SGTIQATrendPage.tsx

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
 * SGT IQA Trend Report Training Page
 */
const T25_SGTIQATrendPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={25}
      totalCards={48}
      title="รายงานแนวโน้ม SGT IQA"
      subtitle="SGT IQA Trend Report"
      icon="📉"
      nextLink="/training/top-defect-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงานแนวโน้ม SGT IQA ติดตามผลการตรวจสอบคุณภาพจาก Seagate ในช่วงเวลายาว
            เพื่อระบุรูปแบบ (Patterns) การปรับปรุง หรือการเสื่อมถอยของคุณภาพ
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/sgt-iqa-trend-report</code>
          </div>
        </div>

        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>📈 ประโยชน์ของการดูแนวโน้ม</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>เห็นภาพรวมระยะยาว ไม่ติดอยู่แค่ข้อมูลชั่วคราว</li>
            <li>ตรวจจับปัญหาที่กำลังเกิดขึ้น ก่อนที่จะร้ายแรง</li>
            <li>ยืนยันว่าโครงการปรับปรุงได้ผลจริง</li>
            <li>วางแผนและพยากรณ์คุณภาพในอนาคต</li>
          </ul>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → SGT IQA Trend Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Start Date - วันที่เริ่มต้น เช่น 2024-01-01',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก End Date - วันที่สิ้นสุด เช่น 2024-12-31',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: '(Optional) เลือก Model เพื่อดูแนวโน้มเฉพาะรุ่น',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Report" เพื่อดูกราฟแนวโน้ม',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 แนะนำ:</strong> ใช้ช่วงเวลาอย่างน้อย 3-6 เดือนเพื่อเห็นแนวโน้มที่ชัดเจน
        </div>
      </Section>

      {/* Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. Multi-Period Trend Lines">
          <p>กราฟเส้นแสดงการเปลี่ยนแปลงของคุณภาพตามเวลา</p>
          <ul>
            <li><strong>X-axis:</strong> เวลา (วัน/สัปดาห์/เดือน)</li>
            <li><strong>Y-axis:</strong> ค่าคุณภาพ (Pass Rate %, DPPM, etc.)</li>
            <li><strong>เส้นโค้ง:</strong> แนวโน้มของข้อมูล</li>
          </ul>

          <div style={{ marginTop: '10px', padding: '10px', background: '#e7f3ff', borderRadius: '6px' }}>
            <strong>การอ่านกราฟ:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
              <li>📈 <strong>เส้นขึ้น</strong> = คุณภาพดีขึ้น (ดี!)</li>
              <li>📉 <strong>เส้นลง</strong> = คุณภาพแย่ลง (ต้องแก้ไข)</li>
              <li>➡️ <strong>เส้นราบ</strong> = คุณภาพคงที่ (รักษาระดับ)</li>
            </ul>
          </div>
        </Subsection>

        <Subsection title="2. Moving Average Overlay">
          <p>เส้นค่าเฉลี่ยเคลื่อนที่ ช่วยดูแนวโน้มโดยรวมโดยลดความผันผวน</p>
          <ul>
            <li>ทำให้เห็นทิศทางโดยรวมชัดเจนขึ้น</li>
            <li>กรองสัญญาณรบกวนออก</li>
            <li>ช่วยตัดสินใจได้แม่นยำขึ้น</li>
          </ul>
        </Subsection>

        <Subsection title="3. Period-over-Period Comparison">
          <p>เปรียบเทียบช่วงเวลาต่างๆ</p>
          <ul>
            <li><strong>Week-over-Week:</strong> สัปดาห์นี้ vs สัปดาห์ที่แล้ว</li>
            <li><strong>Month-over-Month:</strong> เดือนนี้ vs เดือนที่แล้ว</li>
            <li><strong>Year-over-Year:</strong> ปีนี้ vs ปีที่แล้ว</li>
          </ul>
        </Subsection>
      </Section>

      {/* Trend Patterns */}
      <Section title="รูปแบบแนวโน้มและความหมาย">
        <Table
          headers={['รูปแบบ', 'ภาพ', 'ความหมาย', 'การดำเนินการ']}
          rows={[
            [
              'Upward Trend',
              '📈',
              'คุณภาพดีขึ้นต่อเนื่อง',
              '✅ รักษาระดับ, บันทึก Best Practices',
            ],
            [
              'Downward Trend',
              '📉',
              'คุณภาพแย่ลงต่อเนื่อง',
              '⚠️ ต้องแก้ไขทันที, หาสาเหตุ',
            ],
            [
              'Stable/Flat',
              '➡️',
              'คุณภาพคงที่',
              '👍 ดีถ้าอยู่ในระดับสูง, ปรับปรุงถ้าระดับต่ำ',
            ],
            [
              'Spike Up',
              '⬆️',
              'คุณภาพดีขึ้นทันที',
              '🔍 หาว่าทำอะไรถูก, ทำซ้ำ',
            ],
            [
              'Spike Down',
              '⬇️',
              'คุณภาพแย่ลงทันที',
              '🚨 ตรวจสอบทันที, อาจมีปัญหาร้ายแรง',
            ],
            [
              'Seasonal',
              '〰️',
              'มีรูปแบบตามฤดูกาล',
              '📅 วางแผนรับมือล่วงหน้า',
            ],
          ]}
        />
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 ติดตามคุณภาพระยะยาว (Long-term Quality Tracking)',
            '✅ ยืนยันผลโครงการปรับปรุง (Validate Improvement Initiatives)',
            '🔮 พยากรณ์และวางแผน (Forecasting and Planning)',
            '💼 นำเสนอผู้บริหาร (Management Presentations)',
            '🎯 ตั้งเป้าหมายคุณภาพ',
            '📈 วัดผล KPI',
          ]}
        />
      </Section>

      {/* How to Use for Improvement */}
      <Section title="วิธีใช้รายงานเพื่อปรับปรุง">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>1️⃣ ระบุแนวโน้ม</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ดูว่าคุณภาพกำลังดีขึ้น แย่ลง หรือคงที่<br/>
              ใช้ Moving Average ช่วยตัดสินใจ
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>2️⃣ หาจุดเปลี่ยน</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ดูว่าเมื่อไหร่ที่คุณภาพเปลี่ยน<br/>
              เกิดอะไรขึ้นในช่วงนั้น?
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>3️⃣ วัดผลการปรับปรุง</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เปรียบเทียบก่อน-หลังทำโครงการ<br/>
              ได้ผลจริงหรือไม่?
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>4️⃣ วางแผนอนาคต</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ใช้แนวโน้มพยากรณ์<br/>
              เตรียมรับมือปัญหาล่วงหน้า
            </p>
          </div>
        </div>
      </Section>

      {/* Monthly Review */}
      <Section title="การทบทวนรายเดือน">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>📋 Checklist ทบทวนแนวโน้มทุกเดือน:</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>✅ Generate Trend Report (3-6 เดือนล่าสุด)</li>
            <li>✅ ระบุทิศทางแนวโน้ม (ขึ้น/ลง/คงที่)</li>
            <li>✅ เปรียบเทียบกับเดือนที่แล้ว</li>
            <li>✅ ตรวจสอบว่า Moving Average ดีขึ้นหรือไม่</li>
            <li>✅ หาสาเหตุของการเปลี่ยนแปลง</li>
            <li>✅ อัพเดทแผนปรับปรุงถ้าจำเป็น</li>
            <li>✅ รายงานให้ผู้บริหารทราบ</li>
          </ul>
        </div>
      </Section>

      {/* Export Options */}
      <Section title="การส่งออกรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📄 PDF Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              กราฟแนวโน้มพร้อมคำอธิบาย<br/>
              <strong>ใช้สำหรับ:</strong> นำเสนอผู้บริหาร, รายงาน
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Excel Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข้อมูลดิบสำหรับวิเคราะห์เพิ่ม<br/>
              <strong>ใช้สำหรับ:</strong> สร้างกราฟเอง, การคำนวณ
            </p>
          </div>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'กราฟแนวโน้มดูสับสน',
              'เพิ่มช่วงเวลา หรือใช้ Moving Average เพื่อดูแนวโน้มชัดขึ้น',
            ],
            [
              'ข้อมูลขาดช่วง',
              'ตรวจสอบว่ามีการ Import ข้อมูล IQA ครบทุกช่วงหรือไม่',
            ],
            [
              'แนวโน้มผันผวนมาก',
              'ปกติ - ใช้ Moving Average ช่วย หรือตรวจสอบว่ามีการเปลี่ยนแปลงกระบวนการ',
            ],
            [
              'Downward Trend ต่อเนื่อง',
              'ต้องหาสาเหตุและแก้ไขทันที - ใช้ Root Cause Analysis',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน SGT IQA Trend:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การตีความแนวโน้มและการวางแผน</li>
          <li>Data Analyst - การวิเคราะห์สถิติ</li>
          <li>REPORTS_MANUAL.md หน้า "SGT IQA Trend Report"</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T25_SGTIQATrendPage;
