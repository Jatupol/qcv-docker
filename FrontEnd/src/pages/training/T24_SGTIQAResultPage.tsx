// client/src/pages/training/T24_SGTIQAResultPage.tsx

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
 * SGT IQA Result Report Training Page
 */
const T24_SGTIQAResultPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={24}
      totalCards={48}
      title="รายงานผล SGT IQA"
      subtitle="SGT IQA Result Report"
      icon="📋"
      nextLink="/training/sgt-iqa-trend-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงานผล SGT IQA แสดงผลการตรวจสอบคุณภาพโดย Seagate (Customer IQA Inspection)
            อย่างละเอียด รวมถึงผลการตรวจ ข้อบกพร่องที่พบ และสถิติคุณภาพจากการตรวจสอบของลูกค้า
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/sgt-iqa-result-report</code>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 ความสำคัญ</h4>
          <p style={{ margin: 0 }}>
            <strong>IQA (Incoming Quality Audit)</strong> คือการตรวจสอบคุณภาพจากลูกค้า<br/>
            รายงานนี้แสดงว่าลูกค้าเห็นคุณภาพผลิตภัณฑ์ของเราอย่างไร ต้องเอาใจใส่เป็นพิเศษ
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → SGT IQA Result Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Fiscal Year (FY)* - ปีงบประมาณ เช่น FY24',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Work Week (WW)* - สัปดาห์ทำงาน เช่น WW01-WW52',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: '(Optional) เลือก Model เพื่อดูเฉพาะรุ่นที่ต้องการ',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Report" เพื่อดูผล',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#f8d7da', padding: '12px', borderRadius: '6px' }}>
          <strong>⚠️ หมายเหตุ:</strong> Fiscal Year และ Work Week เป็นตัวกรองที่จำเป็น (Required)
        </div>
      </Section>

      {/* Required Filters */}
      <Section title="ตัวกรองที่จำเป็น">
        <Table
          headers={['Filter', 'รายละเอียด', 'ตัวอย่าง']}
          rows={[
            ['Fiscal Year*', 'ปีงบประมาณของ Seagate', 'FY24, FY25'],
            ['Work Week*', 'สัปดาห์ทำงาน (1-52)', 'WW01, WW26, WW52'],
            ['Model', 'รุ่นผลิตภัณฑ์ (Optional)', 'ST4000, ST8000'],
          ]}
        />
      </Section>

      {/* Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. Results Summary Dashboard">
          <p>ภาพรวมผลการตรวจสอบในช่วงเวลาที่เลือก</p>
          <ul>
            <li><strong>Total Inspected:</strong> จำนวนชิ้นงานที่ลูกค้าตรวจทั้งหมด</li>
            <li><strong>Pass Count:</strong> จำนวนที่ผ่านการตรวจ</li>
            <li><strong>Fail Count:</strong> จำนวนที่ไม่ผ่านการตรวจ</li>
            <li><strong>Pass Rate %:</strong> เปอร์เซ็นต์ที่ผ่าน (ต้องสูง &gt; 95%)</li>
          </ul>
        </Subsection>

        <Subsection title="2. Pass/Fail Ratio Pie Chart">
          <p>กราฟวงกลมแสดงสัดส่วน Pass vs Fail</p>
          <div style={{ background: '#d4edda', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>
            <strong>เป้าหมาย:</strong> พื้นที่สีเขียว (Pass) ควรมากกว่า 95%
          </div>
        </Subsection>

        <Subsection title="3. Defect Breakdown Charts">
          <p>แสดงรายละเอียดข้อบกพร่องที่ลูกค้าพบ</p>
          <ul>
            <li>ประเภทข้อบกพร่อง (Defect Type)</li>
            <li>จำนวนแต่ละประเภท</li>
            <li>เปอร์เซ็นต์ของข้อบกพร่อง</li>
          </ul>
        </Subsection>

        <Subsection title="4. Model-Specific Results">
          <p>ผลการตรวจแยกตามรุ่นผลิตภัณฑ์</p>
          <ul>
            <li>รุ่นไหน Pass Rate สูง/ต่ำ</li>
            <li>รุ่นไหนมีปัญหาบ่อย</li>
            <li>การเปรียบเทียบระหว่างรุ่น</li>
          </ul>
        </Subsection>
      </Section>

      {/* Key Metrics */}
      <Section title="ตัวชี้วัดหลัก">
        <Table
          headers={['Metric', 'ค่าที่ดี', 'การตีความ']}
          rows={[
            [
              'Pass Rate',
              '> 95%',
              'เปอร์เซ็นต์ผ่านการตรวจของลูกค้า ยิ่งสูงยิ่งดี',
            ],
            [
              'Fail Count',
              '< 5%',
              'จำนวนที่ไม่ผ่าน ควรต่ำที่สุด',
            ],
            [
              'Major Defects',
              '= 0',
              'ข้อบกพร่องร้ายแรงต้องเป็นศูนย์',
            ],
            [
              'Trend',
              'ดีขึ้น',
              'Pass Rate ควรดีขึ้นเรื่อยๆ',
            ],
          ]}
        />
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '👥 รายงานผลคุณภาพให้ลูกค้า (Customer Quality Feedback)',
            '🔍 วิเคราะห์หาสาเหตุข้อบกพร่องที่ลูกค้าพบ',
            '📊 วางแผนปรับปรุงคุณภาพ (Quality Improvement Planning)',
            '🎯 ตั้งเป้าหมายคุณภาพ',
            '📈 ติดตามประสิทธิภาพการผลิต',
            '⚠️ ตรวจจับปัญหาก่อนที่จะร้ายแรง',
          ]}
        />
      </Section>

      {/* Action Plan */}
      <Section title="แผนการดำเนินการเมื่อ Pass Rate ต่ำ">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Pass Rate 90-95%</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Action:</strong><br/>
              - ตรวจสอบข้อบกพร่องที่พบ<br/>
              - วิเคราะห์สาเหตุ<br/>
              - ทำ Corrective Action Plan
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>❌ Pass Rate &lt; 90%</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Immediate Action:</strong><br/>
              - แจ้งผู้บริหารทันที<br/>
              - หยุดส่งของถ้าจำเป็น<br/>
              - ประชุมฉุกเฉิน<br/>
              - Root Cause Analysis
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Pass Rate &gt; 95%</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Maintain:</strong><br/>
              - รักษาระดับคุณภาพ<br/>
              - บันทึกแนวปฏิบัติที่ดี<br/>
              - ติดตามต่อเนื่อง
            </p>
          </div>
        </div>
      </Section>

      {/* Export Options */}
      <Section title="การส่งออกรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📄 PDF Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              รายงานฉบับเต็ม พร้อมกราฟและตาราง<br/>
              <strong>ใช้สำหรับ:</strong> นำเสนอผู้บริหาร, เก็บบันทึก
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Excel Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข้อมูลดิบสำหรับวิเคราะห์เพิ่มเติม<br/>
              <strong>ใช้สำหรับ:</strong> การวิเคราะห์เชิงลึก, สร้างกราฟเพิ่ม
            </p>
          </div>
        </div>
      </Section>

      {/* Weekly Schedule */}
      <Section title="ตารางการตรวจสอบที่แนะนำ">
        <Table
          headers={['ความถี่', 'เวลา', 'วัตถุประสงค์']}
          rows={[
            [
              'รายวัน',
              'หลัง IQA แต่ละครั้ง',
              'ตรวจสอบผลทันทีหลังลูกค้าตรวจ',
            ],
            [
              'รายสัปดาห์',
              'วันศุกร์',
              'สรุปผลการตรวจสอบของสัปดาห์',
            ],
            [
              'รายเดือน',
              'สัปดาห์แรก',
              'วิเคราะห์แนวโน้มรายเดือน',
            ],
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'Pass Rate ต่ำผิดปกติ',
              'ตรวจสอบ Defect Breakdown, ดูว่าข้อบกพร่องอะไรทำให้ Fail',
            ],
            [
              'ข้อมูลไม่ตรงกับที่ลูกค้าแจ้ง',
              'ตรวจสอบ FY และ WW ให้ตรงกับเอกสารลูกค้า',
            ],
            [
              'ไม่มีข้อมูล',
              'อาจยังไม่มีการ Import ข้อมูล IQA จากลูกค้า',
            ],
            [
              'Major Defect ปรากฏ',
              'แจ้งผู้บริหารทันที และทำ Root Cause Analysis',
            ],
          ]}
        />
      </Section>

      {/* Red Flags */}
      <Section title="🚨 Red Flags - ต้องดำเนินการทันที">
        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><strong>Pass Rate &lt; 90%</strong> - แจ้งผู้บริหารทันที</li>
            <li><strong>Major Defects พบ</strong> - ประชุมฉุกเฉิน</li>
            <li><strong>Pass Rate ลดลงต่อเนื่อง 3 สัปดาห์</strong> - Root Cause Analysis</li>
            <li><strong>ข้อบกพร่องใหม่ที่ไม่เคยพบ</strong> - สอบสวนทันที</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน SGT IQA Result:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - คำถามเกี่ยวกับ IQA และการตีความผล</li>
          <li>Customer Relations - ประสานงานกับ Seagate</li>
          <li>REPORTS_MANUAL.md หน้า "SGT IQA Result Report"</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T24_SGTIQAResultPage;
