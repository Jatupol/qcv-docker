// client/src/pages/training/T28_QualityScorecardPage.tsx

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
 * Product Quality Scorecard Training Page
 */
const T28_QualityScorecardPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={28}
      totalCards={48}
      title="บัตรคะแนนคุณภาพผลิตภัณฑ์"
      subtitle="Product Quality Scorecard"
      icon="🎯"
      nextLink="/training/monthly-trend-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            Product Quality Scorecard เป็น Dashboard แบบครบวงจรที่รวมตัวชี้วัดคุณภาพหลายมิติ
            ของแต่ละผลิตภัณฑ์ไว้ในหน้าเดียว ทำให้มองเห็นภาพรวมคุณภาพได้ชัดเจนและรวดเร็ว
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/product-quality-scorecard</code>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 Scorecard vs รายงานปกติ</h4>
          <p style={{ margin: 0 }}>
            <strong>รายงานปกติ:</strong> แสดงข้อมูลชนิดเดียว เช่น LAR อย่างเดียว<br/>
            <strong>Scorecard:</strong> แสดงหลายตัวชี้วัดพร้อมกัน (LAR, DPPM, Defects, Trends) ในหน้าเดียว
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → Product Quality Scorecard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Product/Model* - รุ่นผลิตภัณฑ์ที่ต้องการดู',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Time Period - ช่วงเวลาที่ต้องการวิเคราะห์',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: '(Optional) เลือก Quality Metrics ที่ต้องการแสดง',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Scorecard" เพื่อดู Dashboard',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 เคล็ดลับ:</strong> สร้าง Scorecard สำหรับผลิตภัณฑ์หลักแต่ละรุ่น แล้วติดไว้บนหน้าจอเพื่อดูทุกวัน
        </div>
      </Section>

      {/* Scorecard Components */}
      <Section title="ส่วนประกอบของ Scorecard">
        <Subsection title="1. Scorecard Tiles (กระเบื้อง KPI)">
          <p>กล่องสี่เหลี่ยมแสดง KPI แต่ละตัว พร้อมสถานะ</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
            <div style={{ background: '#10b981', color: 'white', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>LAR (Line Acceptance Rate)</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>98.5%</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>✅ Above Target (95%)</div>
            </div>
            <div style={{ background: '#ef4444', color: 'white', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>DPPM</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>1250</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>❌ Above Limit (1000)</div>
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            <strong>สี:</strong> 🟢 เขียว = ดี | 🟡 เหลือง = พอใช้ | 🔴 แดง = ต้องปรับปรุง
          </p>
        </Subsection>

        <Subsection title="2. Gauge Charts (เกจวัด)">
          <p>กราฟแบบมาตรวัด แสดงว่าค่าอยู่ในช่วงไหน</p>
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '40px' }}>📊</div>
              <div>
                <div><strong>LAR Gauge:</strong> เข็มชี้ที่ 98% (เขตเขียว)</div>
                <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                  เขตแดง: 0-85% | เขตเหลือง: 85-95% | เขตเขียว: 95-100%
                </div>
              </div>
            </div>
          </div>
        </Subsection>

        <Subsection title="3. Trend Sparklines (กราฟแนวโน้มขนาดเล็ก)">
          <p>กราฟเส้นขนาดเล็กแสดงแนวโน้ม 30 วันล่าสุด</p>
          <div style={{ background: '#e7f3ff', padding: '12px', borderRadius: '6px', marginTop: '8px' }}>
            <strong>ประโยชน์:</strong> เห็นทันทีว่า KPI กำลังดีขึ้น แย่ลง หรือคงที่
          </div>
        </Subsection>

        <Subsection title="4. Status Indicators (สัญญาณสถานะ)">
          <p>ไอคอนและสีแสดงสถานะปัจจุบัน</p>
          <ul>
            <li>✅ <strong>Green Check:</strong> บรรลุเป้าหมาย</li>
            <li>⚠️ <strong>Yellow Warning:</strong> ใกล้เกณฑ์ ต้องระวัง</li>
            <li>❌ <strong>Red Alert:</strong> เกินเกณฑ์ ต้องแก้ไข</li>
            <li>📈 <strong>Trend Arrow:</strong> ↗️ ดีขึ้น | ↘️ แย่ลง | → คงที่</li>
          </ul>
        </Subsection>
      </Section>

      {/* Metrics Displayed */}
      <Section title="ตัวชี้วัดที่แสดงใน Scorecard">
        <Table
          headers={['Metric', 'ความหมาย', 'เป้าหมาย', 'น้ำหนัก']}
          rows={[
            [
              'LAR',
              'Line Acceptance Rate - อัตราการผ่านสาย',
              '> 95%',
              '30%',
            ],
            [
              'DPPM',
              'Defects Per Million - ข้อบกพร่องต่อล้าน',
              '< 500',
              '30%',
            ],
            [
              'IQA Pass Rate',
              'Customer IQA ผ่าน',
              '> 95%',
              '20%',
            ],
            [
              'Top Defects',
              'ข้อบกพร่องอันดับ 1',
              'ลดลงเรื่อยๆ',
              '10%',
            ],
            [
              'Quality Trend',
              'แนวโน้มคุณภาพ',
              'ดีขึ้น',
              '10%',
            ],
          ]}
        />

        <div style={{ marginTop: '15px', background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 Overall Score:</strong> คำนวณจากน้ำหนักของแต่ละตัวชี้วัด (รวม 100%)
        </div>
      </Section>

      {/* How to Read Scorecard */}
      <Section title="วิธีอ่าน Scorecard">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Overall Score &gt; 90</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              คุณภาพดีเยี่ยม<br/>
              <strong>Action:</strong> รักษาระดับ, บันทึก Best Practices
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Overall Score 70-90</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              คุณภาพพอใช้<br/>
              <strong>Action:</strong> ดูว่า metric ไหนทำให้คะแนนต่ำ แล้วปรับปรุง
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>❌ Overall Score &lt; 70</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              คุณภาพต้องปรับปรุง<br/>
              <strong>Action:</strong> จัดทำแผนปรับปรุงทันที
            </p>
          </div>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 Product Quality Review - ทบทวนคุณภาพผลิตภัณฑ์',
            '👥 Customer Presentations - นำเสนอลูกค้า',
            '💼 Quality Planning Meetings - ประชุมวางแผนคุณภาพ',
            '🎯 Performance Dashboards - Dashboard ประจำห้องควบคุม',
            '📈 Executive Reports - รายงานผู้บริหาร',
            '🏆 Benchmarking - เปรียบเทียบระหว่างผลิตภัณฑ์',
          ]}
        />
      </Section>

      {/* Weekly Review Process */}
      <Section title="กระบวนการทบทวนรายสัปดาห์">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>📅 ทุกวันจันทร์ 10:00 AM - Product Quality Review:</h4>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Generate Scorecard สำหรับผลิตภัณฑ์แต่ละรุ่น</li>
            <li>เช็ค Overall Score:
              <ul>
                <li>ถ้า &lt; 70 → ต้องมี Action Plan ภายในวันนั้น</li>
                <li>ถ้า 70-90 → ทบทวนและวางแผนปรับปรุง</li>
                <li>ถ้า &gt; 90 → ดีมาก! รักษาไว้</li>
              </ul>
            </li>
            <li>ดู Trend Sparklines แต่ละ Metric</li>
            <li>ระบุ Metric ที่เป็นสีแดง</li>
            <li>มอบหมายงานแก้ไข</li>
            <li>บันทึกผลการประชุม</li>
            <li>ติดตามผลในสัปดาห์ถัดไป</li>
          </ol>
        </div>
      </Section>

      {/* Action Plan Template */}
      <Section title="แม่แบบแผนปรับปรุงคุณภาพ">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>เมื่อ Overall Score ต่ำ:</h4>
          <Table
            headers={['ขั้นตอน', 'การดำเนินการ', 'ผู้รับผิดชอบ', 'ระยะเวลา']}
            rows={[
              ['1. Identify', 'ระบุ metric ที่ทำให้คะแนนต่ำ', 'Quality Team', '1 วัน'],
              ['2. Analyze', 'วิเคราะห์สาเหตุ', 'QC Lead', '2 วัน'],
              ['3. Plan', 'จัดทำแผนปรับปรุง', 'Quality Manager', '3 วัน'],
              ['4. Implement', 'ดำเนินการแก้ไข', 'Production Team', '1-2 สัปดาห์'],
              ['5. Monitor', 'ติดตามผลใน Scorecard', 'Quality Team', 'ต่อเนื่อง'],
              ['6. Verify', 'ยืนยันว่าคะแนนดีขึ้น', 'Quality Manager', '1 เดือน'],
            ]}
          />
        </div>
      </Section>

      {/* Export Options */}
      <Section title="การส่งออกรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📄 PDF Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Scorecard แบบ Dashboard เต็ม<br/>
              <strong>ใช้สำหรับ:</strong> นำเสนอ, ประชุม, เก็บบันทึก
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Excel Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข้อมูลตัวเลขแต่ละ metric<br/>
              <strong>ใช้สำหรับ:</strong> วิเคราะห์เชิงลึก, ทำกราฟเพิ่ม
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
              'Overall Score ต่ำมาก',
              'ดู metric ไหนเป็นสีแดง แล้วเริ่มแก้ไขตัวนั้นก่อน',
            ],
            [
              'Scorecard ไม่แสดงข้อมูล',
              'ตรวจสอบว่าเลือก Product และ Time Period ถูกต้อง',
            ],
            [
              'ไม่เข้าใจ metric บางตัว',
              'ดูที่ REPORTS_MANUAL.md หรือคลิกที่ metric เพื่อดูคำอธิบาย',
            ],
            [
              'Trend Sparkline ไม่มี',
              'อาจยังไม่มีข้อมูลย้อนหลังพอ ต้องรอสักพัก',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Product Quality Scorecard:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การตีความคะแนนและการวางแผน</li>
          <li>Product Manager - ข้อมูลผลิตภัณฑ์</li>
          <li>REPORTS_MANUAL.md หน้า "Product Quality Scorecard"</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T28_QualityScorecardPage;
