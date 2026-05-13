// client/src/pages/training/T27_ProductionHeatmapPage.tsx

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
 * Production Line Heatmap Training Page
 */
const T27_ProductionHeatmapPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={27}
      totalCards={48}
      title="แผนที่ความร้อนสายการผลิต"
      subtitle="Production Line Heatmap"
      icon="🗺️"
      nextLink="/training/quality-scorecard"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            Production Line Heatmap เป็นแผนที่ความร้อนที่แสดงประสิทธิภาพคุณภาพของแต่ละสายการผลิต
            ผ่านการใช้สีเพื่อให้มองเห็นปัญหาได้ทันที โดยไม่ต้องอ่านตัวเลข
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/production-line-heatmap</code>
          </div>
        </div>

        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>💡 ทำไมต้องใช้ Heatmap?</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            <strong>"A picture is worth a thousand words"</strong><br/>
            Heatmap ทำให้เห็นปัญหาทันที ไม่ต้องอ่านตารางตัวเลขเป็นร้อยๆ บรรทัด
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ background: '#10b981', color: 'white', padding: '5px 10px', borderRadius: '4px' }}>🟢 สีเขียว = ดี</span>
            <span style={{ background: '#fbbf24', color: 'white', padding: '5px 10px', borderRadius: '4px' }}>🟡 สีเหลือง = พอใช้</span>
            <span style={{ background: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '4px' }}>🔴 สีแดง = ปัญหา</span>
          </div>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → Production Line Heatmap',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Date Range - ช่วงเวลาที่ต้องการดู',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: '(Optional) เลือก Production Line เฉพาะสาย',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Quality Metric - DPPM, LAR, หรือตัวชี้วัดอื่น',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Heatmap" เพื่อดูแผนที่ความร้อน',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 เคล็ดลับ:</strong> เริ่มต้นด้วย All Lines เพื่อเห็นภาพรวม แล้วค่อย Zoom in เข้าไปดูสายที่มีปัญหา
        </div>
      </Section>

      {/* Understanding the Heatmap */}
      <Section title="การอ่านแผนที่ความร้อน">
        <Subsection title="1. Heatmap Grid">
          <p>ตารางสีที่แสดงข้อมูลคุณภาพ</p>
          <ul>
            <li><strong>Rows (แถว):</strong> สายการผลิต (Line 1, Line 2, ...)</li>
            <li><strong>Columns (คอลัมน์):</strong> เวลา (วัน/สัปดาห์/เดือน)</li>
            <li><strong>Cell Color (สีช่อง):</strong> ระดับคุณภาพในช่วงนั้น</li>
          </ul>

          <div style={{ marginTop: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
            <strong>ตัวอย่างการอ่าน:</strong>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <div style={{ width: '30px', height: '30px', background: '#10b981', borderRadius: '4px' }}></div>
                <span>Line 1, Week 1: คุณภาพดีมาก (DPPM &lt; 300)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <div style={{ width: '30px', height: '30px', background: '#fbbf24', borderRadius: '4px' }}></div>
                <span>Line 2, Week 2: คุณภาพพอใช้ (DPPM 300-800)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', background: '#ef4444', borderRadius: '4px' }}></div>
                <span>Line 3, Week 3: มีปัญหา (DPPM &gt; 800)</span>
              </div>
            </div>
          </div>
        </Subsection>

        <Subsection title="2. Interactive Features">
          <p>คุณสมบัติที่ช่วยในการวิเคราะห์</p>
          <ul>
            <li><strong>Hover Tooltip:</strong> ชี้เมาส์ที่ช่องเพื่อดูรายละเอียด</li>
            <li><strong>Click to Drill Down:</strong> คลิกเพื่อดูข้อมูลเชิงลึก</li>
            <li><strong>Zoom & Pan:</strong> ขยาย/เลื่อนแผนที่</li>
            <li><strong>Filter:</strong> กรองเฉพาะสายหรือช่วงเวลา</li>
          </ul>
        </Subsection>

        <Subsection title="3. Color Legend">
          <p>คำอธิบายความหมายของสี</p>
          <Table
            headers={['สี', 'ระดับ', 'DPPM', 'การดำเนินการ']}
            rows={[
              ['🟢 เขียวเข้ม', 'ดีเยี่ยม', '< 300', 'รักษาระดับ'],
              ['🟢 เขียวอ่อน', 'ดี', '300-500', 'ติดตาม'],
              ['🟡 เหลือง', 'พอใช้', '500-800', 'ปรับปรุง'],
              ['🟠 ส้ม', 'ต้องระวัง', '800-1000', 'แก้ไขเร็ว'],
              ['🔴 แดง', 'ปัญหา', '> 1000', 'แก้ไขทันที'],
            ]}
          />
        </Subsection>
      </Section>

      {/* How to Use */}
      <Section title="วิธีใช้งานแผนที่ความร้อน">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>🔍 Quick Scan</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>ใช้เวลา 5 วินาที</strong><br/>
              มองดูแผนที่ ช่องสีแดง = มีปัญหา<br/>
              รู้ทันทีว่าสายไหนต้องดูแลเร่งด่วน
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>📊 Pattern Recognition</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>มองหารูปแบบ</strong><br/>
              สีแดงเป็นแถว = สายนี้มีปัญหา<br/>
              สีแดงเป็นคอลัมน์ = ช่วงนั้นทุกสายมีปัญหา
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>🎯 Prioritization</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>จัดลำดับความสำคัญ</strong><br/>
              แก้สีแดงก่อน → ส้ม → เหลือง<br/>
              ใช้ทรัพยากรอย่างมีประสิทธิภาพ
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>📈 Trend Spotting</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>ดูแนวโน้ม</strong><br/>
              เห็นว่าคุณภาพดีขึ้น/แย่ลง<br/>
              ป้องกันปัญหาก่อนเกิด
            </p>
          </div>
        </div>
      </Section>

      {/* Common Patterns */}
      <Section title="รูปแบบที่พบบ่อยและความหมาย">
        <Table
          headers={['รูปแบบ', 'ลักษณะ', 'สาเหตุที่เป็นไปได้', 'แนวทางแก้ไข']}
          rows={[
            [
              'Hot Row',
              'แถวนึงแดงทั้งแถว',
              'สายผลิตมีปัญหาต่อเนื่อง',
              'ตรวจสอบเครื่องจักร, คนงาน, วัตถุดิบ',
            ],
            [
              'Hot Column',
              'คอลัมน์นึงแดงทั้งคอลัมน์',
              'ช่วงนั้นทุกสายมีปัญหา',
              'ตรวจสอบวัตถุดิบ lot นั้น, การเปลี่ยนแปลง',
            ],
            [
              'Isolated Spot',
              'จุดแดงโดดเดี่ยว',
              'เหตุการณ์แบบครั้งเดียว',
              'ตรวจสอบว่าเกิดอะไรขึ้นในช่วงนั้น',
            ],
            [
              'Diagonal Pattern',
              'แนวทแยงเป็นจุดแดง',
              'ปัญหาค่อยๆ กระจาย',
              'ระวัง! อาจเป็นปัญหาที่กำลังแพร่',
            ],
            [
              'Checkerboard',
              'สีสลับกันเป็นหมากรุก',
              'ปัญหาสลับกัน อาจเกี่ยวกับกะ',
              'ตรวจสอบ shift patterns',
            ],
          ]}
        />
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '🏭 ประชุมเช้า - Quick scan คุณภาพของเมื่อวาน',
            '👷 Shift Handover - บอกกะต่อไปว่าสายไหนต้องระวัง',
            '💼 Management Review - ภาพรวมคุณภาพทั้งโรงงาน',
            '🎯 Problem Identification - หาจุดที่ต้องแก้ไขเร่งด่วน',
            '📊 Performance Comparison - เปรียบเทียบประสิทธิภาพระหว่างสาย',
            '📈 Trend Analysis - ดูว่าสายไหนกำลังดีขึ้น/แย่ลง',
          ]}
        />
      </Section>

      {/* Daily Workflow */}
      <Section title="ขั้นตอนการใช้งานประจำวัน">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>☀️ ทุกเช้า 8:00 AM:</h4>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>เปิด Production Line Heatmap</li>
            <li>เลือกวันที่ = เมื่อวาน</li>
            <li>Quick Scan หาช่องสีแดง</li>
            <li>ถ้าเจอสีแดง:
              <ul>
                <li>คลิกที่ช่องนั้นเพื่อดูรายละเอียด</li>
                <li>บันทึกสายที่มีปัญหาและ DPPM</li>
                <li>มอบหมายทีมไปตรวจสอบ</li>
              </ul>
            </li>
            <li>รายงานในที่ประชุมเช้า</li>
            <li>ติดตามผลการแก้ไข</li>
          </ol>
        </div>
      </Section>

      {/* Export Options */}
      <Section title="การส่งออกรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📄 PDF Export (Image)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ส่งออกเป็นรูปภาพ Heatmap<br/>
              <strong>ใช้สำหรับ:</strong> นำเสนอ, รายงาน, เก็บบันทึก
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Excel Export (Data)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข้อมูลตัวเลขเต็ม<br/>
              <strong>ใช้สำหรับ:</strong> การวิเคราะห์เชิงลึก, คำนวณเพิ่ม
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
              'Heatmap ว่างเปล่า',
              'ตรวจสอบว่าเลือก Date Range ที่มีข้อมูล',
            ],
            [
              'สีดูไม่ชัดเจน',
              'ปรับ Color Scale Threshold ใน Settings',
            ],
            [
              'ช่องสีแดงเยอะมาก',
              'เป็นเรื่องปกติถ้าคุณภาพแย่ - ต้องแก้ไขทันที!',
            ],
            [
              'ไม่แน่ใจว่าสีหมายถึงอะไร',
              'ดูที่ Color Legend หรือชี้เมาส์ที่ช่องเพื่อดูค่าจริง',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Production Line Heatmap:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Production Manager - การตีความ patterns และการแก้ไข</li>
          <li>Quality Team - ข้อมูลคุณภาพและเกณฑ์</li>
          <li>REPORTS_MANUAL.md หน้า "Production Line Heatmap"</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T27_ProductionHeatmapPage;
