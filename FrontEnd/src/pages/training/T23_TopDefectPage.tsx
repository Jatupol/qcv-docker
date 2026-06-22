// client/src/pages/training/T23_TopDefectPage.tsx

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
 * Top Defect Report Training Page
 */
const T23_TopDefectPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={23}
      totalCards={48}
      title="รายงานข้อบกพร่องอันดับต้น"
      subtitle="Top Defect Report"
      icon="🔝"
      nextLink="/training/root-cause-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน Top Defect ช่วยระบุและจัดอันดับข้อบกพร่องที่พบบ่อยที่สุด
            เพื่อให้สามารถจัดลำดับความสำคัญในการปรับปรุงได้อย่างมีประสิทธิภาพ
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/top-defect-report</code>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 หลักการ Pareto (80/20)</h4>
          <p style={{ margin: 0 }}>
            โดยทั่วไปแล้ว <strong>80% ของปัญหา</strong> มาจาก <strong>20% ของสาเหตุ</strong><br/>
            การแก้ไขข้อบกพร่องอันดับต้น 2-3 อันดับ จะช่วยลดปัญหาได้มากที่สุด
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → Top Defect Report',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Start Month-Year (เริ่มต้น) เช่น 2024-06',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก End Month-Year (สิ้นสุด) เช่น 2024-12',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: '(Optional) เลือก Product/Model เพื่อกรองตามผลิตภัณฑ์',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Report"',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 แนะนำ:</strong> เริ่มต้นด้วยช่วง 3-6 เดือนเพื่อดูแนวโน้มที่ชัดเจน
        </div>
      </Section>

      {/* Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. ตารางอันดับข้อบกพร่อง (Defect Ranking Table)">
          <Table
            headers={['คอลัมน์', 'รายละเอียด']}
            rows={[
              ['Rank', 'อันดับข้อบกพร่อง (1, 2, 3...)'],
              ['Defect Name', 'ชื่อข้อบกพร่อง'],
              ['Count', 'จำนวนครั้งที่พบ'],
              ['Percentage', '% ของข้อบกพร่องทั้งหมด'],
              ['Cumulative %', '% สะสม (สำหรับ Pareto)'],
            ]}
          />
        </Subsection>

        <Subsection title="2. Product-Defect Matrix">
          <p>ตารางแสดงข้อบกพร่องแยกตามผลิตภัณฑ์และเดือน</p>
          <ul>
            <li><strong>Rows:</strong> รุ่นผลิตภัณฑ์</li>
            <li><strong>Columns:</strong> เดือน</li>
            <li><strong>Values:</strong> ประเภทข้อบกพร่องที่พบมากที่สุดในเดือนนั้น</li>
          </ul>
        </Subsection>

        <Subsection title="3. Summary Statistics">
          <ul>
            <li>Total Products Affected (จำนวนผลิตภัณฑ์ที่มีข้อบกพร่อง)</li>
            <li>Most Common Defect (ข้อบกพร่องที่พบบ่อยที่สุด)</li>
            <li>Defect Type Breakdown (แบ่งตามประเภท: Contamination, Crack, Dent, etc.)</li>
          </ul>
        </Subsection>
      </Section>

      {/* How to Use */}
      <Section title="วิธีใช้รายงานเพื่อปรับปรุง">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>1️⃣ ระบุ</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ดูข้อบกพร่อง 3 อันดับแรก
              นี่คือจุดที่ต้องมุ่งเน้น
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>2️⃣ วิเคราะห์</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ใช้ Root Cause Analysis Report
              เพื่อหาสาเหตุ
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>3️⃣ ดำเนินการ</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              สร้างโครงการปรับปรุง
              มอบหมายทีม
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>4️⃣ ติดตาม</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ตรวจสอบรายงานเป็นประจำ
              ยืนยันว่าได้ผล
            </p>
          </div>
        </div>
      </Section>

      {/* Action Plan Template */}
      <Section title="แม่แบบแผนปรับปรุง">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>สำหรับข้อบกพร่องอันดับ 1:</h4>

          <Table
            headers={['ขั้นตอน', 'การดำเนินการ', 'ผู้รับผิดชอบ']}
            rows={[
              ['1. ระบุปัญหา', 'ชื่อข้อบกพร่อง + ความถี่', 'Quality Team'],
              ['2. รากเหง้าของปัญหา', 'ใช้ Root Cause Analysis', 'QC Lead'],
              ['3. วางแผน', 'กำหนด Corrective Actions', 'Quality Manager'],
              ['4. ดำเนินการ', 'ปรับปรุงกระบวนการ', 'Production Team'],
              ['5. ตรวจสอบ', 'Monitor Top Defect Report', 'Quality Team'],
              ['6. มาตรฐาน', 'อัพเดท SOP', 'Quality Manager'],
            ]}
          />
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '🎯 จัดลำดับความสำคัญโครงการปรับปรุงคุณภาพ',
            '💼 การประชุมทบทวนคุณภาพรายเดือน',
            '📊 รายงานให้ฝ่ายบริหาร',
            '🔍 การวิเคราะห์แนวโน้มระยะยาว',
            '💰 การจัดสรรทรัพยากรเพื่อแก้ไขปัญหา',
            '📈 วัดผลโครงการปรับปรุง (ก่อน-หลัง)',
          ]}
        />
      </Section>

      {/* Monthly Review Checklist */}
      <Section title="Checklist การทบทวนรายเดือน">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📋 ทุกต้นเดือน:</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>✅ Generate Top Defect Report (เดือนที่แล้ว)</li>
            <li>✅ ระบุ Top 3 Defects</li>
            <li>✅ เปรียบเทียบกับเดือนก่อนหน้า</li>
            <li>✅ ตรวจสอบว่าข้อบกพร่องเดิมยังอยู่ใน Top 3 หรือไม่</li>
            <li>✅ ถ้ายังอยู่ → ต้องเร่งแก้ไข</li>
            <li>✅ ถ้าหายไป → บันทึกว่าแก้ไขสำเร็จอย่างไร</li>
            <li>✅ ถ้ามีใหม่ → เริ่มโครงการปรับปรุงใหม่</li>
          </ul>
        </div>
      </Section>

      {/* Success Criteria */}
      <Section title="เกณฑ์ความสำเร็จ">
        <Table
          headers={['ตัวชี้วัด', 'เป้าหมาย', 'การตีความ']}
          rows={[
            [
              'Top Defect %',
              '< 30%',
              'ข้อบกพร่องอันดับ 1 ไม่ควรเกิน 30% ของทั้งหมด',
            ],
            [
              'Trend',
              'ลดลง',
              'ข้อบกพร่องอันดับต้นควรลดลงเรื่อยๆ',
            ],
            [
              'Top 3 Changes',
              'เปลี่ยนทุก 3 เดือน',
              'ถ้าข้อบกพร่องเดิมอยู่ Top 3 นาน = ยังไม่แก้ไขได้',
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
              'ข้อบกพร่องเดิมยังอยู่ Top 3 มากกว่า 3 เดือน',
              'ทบทวน Corrective Actions, อาจต้องวิธีใหม่',
            ],
            [
              'ข้อบกพร่องใหม่ปรากฏใน Top 3',
              'ตรวจสอบว่ามีการเปลี่ยนแปลงกระบวนการหรือไม่',
            ],
            [
              'Top Defect % สูงมาก (>50%)',
              'ปัญหาร้ายแรง - ต้องแก้ไขทันที',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Top Defect:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การวางแผนปรับปรุง</li>
          <li>Quality Engineering - Root Cause Analysis</li>
          <li>REPORTS_MANUAL.md หน้า "Top Defect Report"</li>
          <li>REPORTS_DECISION_GUIDE.md สำหรับ scenarios</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T23_TopDefectPage;
