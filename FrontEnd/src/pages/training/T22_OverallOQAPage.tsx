// client/src/pages/training/T22_OverallOQAPage.tsx

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
 * Overall OQA DPPM Report Training Page
 */
const T22_OverallOQAPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={22}
      totalCards={48}
      title="รายงาน Overall OQA DPPM"
      subtitle="Overall OQA DPPM Report"
      icon="📈"
      nextLink="/training/sgt-iqa-result-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน Overall OQA DPPM แสดงภาพรวมของคุณภาพสถานี OQA วัดในหน่วย DPPM
            (Defects Per Million Opportunities) ซึ่งเป็นตัวชี้วัดหลักระดับองค์กร
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/oqaoverall-rereport</code>
          </div>
        </div>
      </Section>

      {/* Understanding DPPM */}
      <Section title="ความเข้าใจ DPPM">
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📚 DPPM คืออะไร?</h4>
          <p style={{ margin: 0 }}>
            <strong>DPPM = Defects Per Million Opportunities</strong><br/>
            คือจำนวนข้อบกพร่องต่อหนึ่งล้านโอกาส ยิ่งค่าต่ำยิ่งดี
          </p>
        </div>

        <Table
          headers={['ค่า DPPM', 'ระดับคุณภาพ', 'การดำเนินการ']}
          rows={[
            ['< 500', '✅ ดีเยี่ยม', 'รักษาระดับ'],
            ['500 - 1000', '⚠️ พอใช้', 'ตรวจสอบและปรับปรุง'],
            ['> 1000', '❌ ต้องปรับปรุง', 'แจ้งเตือนทันที, จัดทำแผนแก้ไข'],
          ]}
        />
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → Overall OQA DPPM',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Fiscal Year (FY) - ถ้าต้องการกรองตามปี',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Work Week (WW) - ถ้าต้องการกรองตามสัปดาห์',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Station (Optional) - OQA, OBA, SIV',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Report" เพื่อดูผล',
            },
          ]}
        />
      </Section>

      {/* Report Components */}
      <Section title="ส่วนประกอบของรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>📊 กราฟแนวโน้ม</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              แสดง DPPM ตามช่วงเวลา ดูแนวโน้มว่าดีขึ้นหรือแย่ลง
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>📈 สถิติสรุป</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ค่า DPPM ปัจจุบัน, ค่าเฉลี่ย, สูงสุด, ต่ำสุด
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>🏭 แยกตาม Station</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เปรียบเทียบ DPPM ของแต่ละสถานี
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>🎯 เป้าหมาย</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เส้นเป้าหมาย DPPM บนกราฟ
            </p>
          </div>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 รายงาน KPI ประจำเดือนให้ฝ่ายบริหาร',
            '🎯 ติดตามเป้าหมายคุณภาพขององค์กร',
            '📈 วิเคราะห์แนวโน้มคุณภาพระยะยาว',
            '⚖️ เปรียบเทียบประสิทธิภาพระหว่างสถานี',
            '🚨 ตรวจจับปัญหาคุณภาพที่เกิดขึ้น',
          ]}
        />
      </Section>

      {/* Weekly Schedule */}
      <Section title="กำหนดการตรวจสอบ">
        <Table
          headers={['ความถี่', 'เวลา', 'วัตถุประสงค์']}
          rows={[
            [
              'รายวัน',
              '8:00 AM',
              'ตรวจสอบ DPPM ของเมื่อวาน',
            ],
            [
              'รายสัปดาห์',
              'วันจันทร์',
              'รายงานสรุปสัปดาห์ก่อน',
            ],
            [
              'รายเดือน',
              'สัปดาห์ที่ 1',
              'รายงาน KPI ประจำเดือน',
            ],
            [
              'ไตรมาส',
              'ต้นไตรมาส',
              'การวิเคราะห์แนวโน้มระยะยาว',
            ],
          ]}
        />
      </Section>

      {/* Action Thresholds */}
      <Section title="เกณฑ์การดำเนินการ">
        <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>✅ DPPM &lt; 500 (ดีเยี่ยม)</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>รักษาระดับคุณภาพ</li>
            <li>บันทึกแนวปฏิบัติที่ดี</li>
            <li>แชร์ความสำเร็จกับทีม</li>
          </ul>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ DPPM 500-1000 (ต้องปรับปรุง)</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>ตรวจสอบสาเหตุ</li>
            <li>จัดทำแผนปรับปรุง</li>
            <li>ติดตามรายสัปดาห์</li>
          </ul>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ DPPM &gt; 1000 (วิกฤติ)</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>แจ้ง Quality Director ทันที</li>
            <li>จัดประชุมฉุกเฉิน</li>
            <li>หยุดผลิตถ้าจำเป็น</li>
            <li>Root Cause Analysis</li>
            <li>Corrective Action Plan</li>
          </ul>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'DPPM สูงผิดปกติ',
              'ตรวจสอบข้อมูล, ยืนยันกับ Top Defect Report',
            ],
            [
              'ข้อมูลไม่ตรงกับรายงานอื่น',
              'ตรวจสอบช่วงเวลาและตัวกรอง',
            ],
            [
              'แนวโน้มผิดปกติ',
              'ตรวจสอบการเปลี่ยนแปลงในกระบวนการ',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Overall OQA DPPM:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - คำถามเกี่ยวกับ DPPM และเกณฑ์</li>
          <li>REPORTS_MANUAL.md - คู่มือรายละเอียด</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T22_OverallOQAPage;
