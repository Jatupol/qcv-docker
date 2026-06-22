// client/src/pages/training/T26_RootCausePage.tsx

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
 * Defect Root Cause Analysis Training Page
 */
const T26_RootCausePage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={26}
      totalCards={48}
      title="การวิเคราะห์ต้นตอสาเหตุข้อบกพร่อง"
      subtitle="Defect Root Cause Analysis"
      icon="🌳"
      nextLink="/training/production-heatmap"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงาน Root Cause Analysis วิเคราะห์ข้อบกพร่องตามหมวดหมู่สาเหตุ
            เพื่อสนับสนุนการแก้ไขปัญหาอย่างเป็นระบบและการปรับปรุงอย่างต่อเนื่อง
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/defect-root-cause</code>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🌳 ทำไมต้องหา Root Cause?</h4>
          <p style={{ margin: 0 }}>
            <strong>"Don't treat symptoms, cure the disease"</strong><br/>
            การแก้ไขแค่อาการจะทำให้ปัญหากลับมาอีก<br/>
            ต้องหาและแก้ไขที่ <strong>รากเหง้าของปัญหา (Root Cause)</strong> จึงจะแก้ปัญหาได้จริง
          </p>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → Defect Root Cause Analysis',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Date Range - ช่วงเวลาที่ต้องการวิเคราะห์',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: '(Optional) เลือก Defect Type เพื่อกรองเฉพาะประเภท',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: '(Optional) เลือก Root Cause Category หมวดหมู่สาเหตุ',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Report" เพื่อดูผล',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 แนะนำ:</strong> เริ่มด้วย All Defects เพื่อเห็นภาพรวม แล้วค่อย Drill down เข้าไปดูแต่ละประเภท
        </div>
      </Section>

      {/* Root Cause Categories */}
      <Section title="หมวดหมู่สาเหตุหลัก (Root Cause Categories)">
        <Table
          headers={['หมวดหมู่', 'ตัวอย่างสาเหตุ', 'วิธีแก้ไข']}
          rows={[
            [
              '🏭 Machine (เครื่องจักร)',
              'เครื่องชำรุด, ตั้งค่าไม่ถูก, บำรุงรักษาไม่พอ',
              'ซ่อมแซม, PM, Calibration',
            ],
            [
              '👷 Man (คน)',
              'ฝึกอบรมไม่พอ, ล้า, ขาดทักษะ',
              'Training, Work rotation, Skill matrix',
            ],
            [
              '📦 Material (วัตถุดิบ)',
              'วัตถุดิบคุณภาพต่ำ, ความชื้น, การเก็บไม่ถูกต้อง',
              'เปลี่ยน Supplier, ควบคุมสต็อก',
            ],
            [
              '⚙️ Method (วิธีการ)',
              'ขั้นตอนไม่ชัด, SOP ล้าสมัย',
              'อัพเดท SOP, มาตรฐานใหม่',
            ],
            [
              '📏 Measurement (การวัด)',
              'เครื่องมือวัดไม่แม่นยำ',
              'Calibration, เปลี่ยนเครื่องมือ',
            ],
            [
              '🌍 Environment (สิ่งแวดล้อม)',
              'อุณหภูมิ, ความชื้น, ฝุ่น',
              'ควบคุม HVAC, Clean room',
            ],
          ]}
        />

        <div style={{ marginTop: '15px', background: '#e7f3ff', padding: '12px', borderRadius: '6px' }}>
          <strong>📚 6M Model:</strong> Machine, Man, Material, Method, Measurement, Environment (Mother Nature)
        </div>
      </Section>

      {/* Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. Pareto Chart (80/20 Analysis)">
          <p>กราฟแท่งและเส้นแสดงสาเหตุเรียงตามความสำคัญ</p>
          <ul>
            <li><strong>แท่ง:</strong> จำนวนข้อบกพร่องของแต่ละสาเหตุ</li>
            <li><strong>เส้น:</strong> เปอร์เซ็นต์สะสม</li>
            <li><strong>หลักการ 80/20:</strong> 80% ของปัญหามาจาก 20% ของสาเหตุ</li>
          </ul>

          <div style={{ marginTop: '10px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
            <strong>💡 วิธีใช้:</strong> มุ่งเน้นแก้ไขสาเหตุ 2-3 อันดับแรกจะได้ผลมากที่สุด
          </div>
        </Subsection>

        <Subsection title="2. Root Cause Breakdown">
          <p>ตารางแสดงรายละเอียดแต่ละสาเหตุ</p>
          <Table
            headers={['คอลัมน์', 'รายละเอียด']}
            rows={[
              ['Root Cause', 'หมวดหมู่สาเหตุ'],
              ['Defect Count', 'จำนวนข้อบกพร่องที่เกิดจากสาเหตุนี้'],
              ['Percentage', '% ของข้อบกพร่องทั้งหมด'],
              ['Cumulative %', '% สะสม'],
              ['Status', 'สถานะการแก้ไข (Open/In Progress/Closed)'],
            ]}
          />
        </Subsection>

        <Subsection title="3. Trend Analysis">
          <p>แนวโน้มของสาเหตุต่างๆ ตามเวลา</p>
          <ul>
            <li>ดูว่าสาเหตุไหนเพิ่มขึ้น (ปัญหาใหม่)</li>
            <li>สาเหตุไหนลดลง (การแก้ไขได้ผล)</li>
            <li>สาเหตุไหนคงที่ (ยังไม่ได้แก้)</li>
          </ul>
        </Subsection>
      </Section>

      {/* 8D Problem Solving */}
      <Section title="การใช้ร่วมกับ 8D Problem Solving">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>8D = 8 Disciplines (8 ขั้นตอนการแก้ปัญหา)</h4>

          <Table
            headers={['D', 'ขั้นตอน', 'ใช้รายงาน Root Cause อย่างไร']}
            rows={[
              ['D1', 'Team', 'ตั้งทีม - ใช้รายงานระบุผู้เชี่ยวชาญที่ต้องการ'],
              ['D2', 'Problem', 'อธิบายปัญหา - ใช้ Defect Count และ Impact'],
              ['D3', 'Containment', 'แก้ปัญหาชั่วคราว - กั้นข้อบกพร่องที่เกิด'],
              ['D4', 'Root Cause', '⭐ หาสาเหตุ - ใช้ Root Cause Breakdown'],
              ['D5', 'Solution', 'เลือกวิธีแก้ - จากหมวดหมู่สาเหตุ'],
              ['D6', 'Implement', 'ดำเนินการ - แก้ไขตาม Root Cause'],
              ['D7', 'Prevention', 'ป้องกัน - ทำให้ไม่เกิดซ้ำ'],
              ['D8', 'Congratulate', 'ยินดี - ยืนยันด้วยรายงานว่าลดลงจริง'],
            ]}
          />
        </div>
      </Section>

      {/* 5 Whys Technique */}
      <Section title="เทคนิค 5 Whys">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#004085' }}>❓ ถามคำว่า "ทำไม" 5 ครั้ง</h4>
          <p style={{ margin: '0 0 15px 0' }}>
            วิธีง่ายๆ ในการหา Root Cause คือถามทำไมซ้ำๆ จนถึงต้นตอจริงๆ
          </p>

          <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
            <strong>ตัวอย่าง:</strong>
            <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><strong>ปัญหา:</strong> พบ Scratch บนผลิตภัณฑ์
                <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '5px' }}>
                  <li>↓ Why 1: ทำไม? → ถูกขูดในสายพาน</li>
                  <li>↓ Why 2: ทำไมถูกขูด? → สายพานมีเศษโลหะ</li>
                  <li>↓ Why 3: ทำไมมีเศษโลหะ? → ไม่มีการทำความสะอาด</li>
                  <li>↓ Why 4: ทำไมไม่ทำความสะอาด? → ไม่มีในตาราง PM</li>
                  <li>↓ Why 5: ทำไมไม่มี? → SOP ไม่ได้ระบุ</li>
                </ul>
              </li>
            </ol>
            <div style={{ marginTop: '10px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
              <strong>🎯 Root Cause:</strong> SOP ไม่ครบถ้วน → <strong>วิธีแก้:</strong> อัพเดท SOP เพิ่ม PM สายพาน
            </div>
          </div>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '🔍 Root Cause Analysis (RCA) - หาต้นตอปัญหา',
            '📋 Corrective Action Planning - วางแผนแก้ไข',
            '🎯 Quality Improvement Projects - โครงการปรับปรุงคุณภาพ',
            '📊 8D Problem Solving - การแก้ปัญหา 8 ขั้นตอน',
            '💼 Management Review - ทบทวนกับผู้บริหาร',
            '📈 Prevent Recurrence - ป้องกันการเกิดซ้ำ',
          ]}
        />
      </Section>

      {/* Action Tracking */}
      <Section title="การติดตามการแก้ไข">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>📋 Template การติดตาม Corrective Action:</h4>
          <Table
            headers={['Root Cause', 'Action', 'Owner', 'Due Date', 'Status']}
            rows={[
              ['Machine', 'ซ่อมเครื่อง Line 3', 'Maintenance', '2024-06-30', '✅ Done'],
              ['Man', 'อบรมพนักงานใหม่', 'HR', '2024-07-15', '🟡 In Progress'],
              ['Material', 'เปลี่ยน Supplier', 'Procurement', '2024-08-01', '⏳ Planned'],
            ]}
          />

          <div style={{ marginTop: '15px', background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
            <strong>💡 เคล็ดลับ:</strong> ตรวจสอบรายงาน Root Cause ทุกสัปดาห์เพื่อยืนยันว่า Action ได้ผลจริง
          </div>
        </div>
      </Section>

      {/* Export Options */}
      <Section title="การส่งออกรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📄 PDF Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Pareto Chart และตารางสาเหตุ<br/>
              <strong>ใช้สำหรับ:</strong> 8D Report, RCA Documentation
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Excel Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข้อมูลเต็มสำหรับวิเคราะห์<br/>
              <strong>ใช้สำหรับ:</strong> Deep dive analysis, ทำกราฟเพิ่ม
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
              'Root Cause ยังไม่ถูกระบุ',
              'ใช้ 5 Whys หรือ Fishbone Diagram เพื่อหา',
            ],
            [
              'สาเหตุเดิมยังมีอยู่ใน Top 3',
              'Corrective Action ไม่ได้ผล ต้องทบทวนวิธีแก้',
            ],
            [
              'สาเหตุใหม่เพิ่มขึ้น',
              'อาจมีการเปลี่ยนแปลงในกระบวนการ ต้องตรวจสอบ',
            ],
            [
              'ไม่รู้จะเริ่มแก้จากไหน',
              'ใช้ Pareto - เริ่มจากสาเหตุอันดับ 1 ก่อน',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Root Cause Analysis:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Engineering - RCA methodology และ 8D</li>
          <li>Quality Manager - การวางแผน Corrective Actions</li>
          <li>Process Engineer - การแก้ไขกระบวนการ</li>
          <li>REPORTS_MANUAL.md หน้า "Defect Root Cause Report"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T26_RootCausePage;
