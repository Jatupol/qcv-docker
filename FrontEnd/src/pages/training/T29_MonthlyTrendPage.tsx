// client/src/pages/training/T29_MonthlyTrendPage.tsx

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
 * Monthly Quality Trend Report Training Page
 */
const T29_MonthlyTrendPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={29}
      totalCards={48}
      title="รายงานแนวโน้มคุณภาพรายเดือน"
      subtitle="Monthly Quality Trend Report"
      icon="📅"
      nextLink="/training/history-tracking"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            รายงานแนวโน้มคุณภาพรายเดือนติดตามประสิทธิภาพคุณภาพแบบ Month-over-Month
            แสดงแนวโน้ม ความแปรปรวนตามฤดูกาล และทิศทางคุณภาพระยะยาว
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/report/monthly-quality-trend</code>
          </div>
        </div>

        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>📊 Monthly vs Weekly Trends</h4>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><strong>Weekly:</strong> ดูความผันผวนระยะสั้น เหมาะกับการแก้ไขทันที</li>
            <li><strong>Monthly:</strong> ดูภาพรวมระยะยาว เหมาะกับการวางแผนและกำหนดเป้าหมาย</li>
            <li><strong>Use Both:</strong> ใช้ทั้งสองแบบควบคู่กันจะได้ภาพที่สมบูรณ์</li>
          </ul>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → Monthly Quality Trend',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Start Month - เดือนเริ่มต้น เช่น 2024-01 (มกราคม 2024)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก End Month - เดือนสิ้นสุด เช่น 2024-12 (ธันวาคม 2024)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เลือก Metric Selection - เลือกตัวชี้วัด (LAR, DPPM, etc.)',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Generate Report" เพื่อดูกราฟแนวโน้ม',
            },
          ]}
        />

        <div style={{ marginTop: '15px', background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
          <strong>💡 แนะนำ:</strong> ใช้ช่วงเวลา 12 เดือนเพื่อเห็นแนวโน้มรายปีและความแปรปรวนตามฤดูกาล
        </div>
      </Section>

      {/* Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. Monthly Trend Lines">
          <p>กราฟเส้นแสดงการเปลี่ยนแปลงของคุณภาพแต่ละเดือน</p>
          <ul>
            <li><strong>X-axis:</strong> เดือน (Jan, Feb, Mar, ...)</li>
            <li><strong>Y-axis:</strong> ค่าตัวชี้วัด (%, DPPM, Count)</li>
            <li><strong>Line Color:</strong> แต่ละสีแทนปีต่างกัน</li>
          </ul>

          <div style={{ marginTop: '10px', padding: '10px', background: '#e7f3ff', borderRadius: '6px' }}>
            <strong>การอ่านแนวโน้ม:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
              <li>📈 เส้นขาขึ้น = คุณภาพดีขึ้นเรื่อยๆ</li>
              <li>📉 เส้นขาลง = คุณภาพแย่ลงเรื่อยๆ</li>
              <li>〰️ เส้นขึ้นลง = มีรูปแบบตามฤดูกาล (Seasonal)</li>
            </ul>
          </div>
        </Subsection>

        <Subsection title="2. Year-over-Year Comparison">
          <p>เปรียบเทียบระหว่างปี</p>
          <Table
            headers={['เดือน', '2023', '2024', 'Change']}
            rows={[
              ['มกราคม', '96.5%', '97.8%', '+1.3% ✅'],
              ['กุมภาพันธ์', '95.8%', '98.1%', '+2.3% ✅'],
              ['มีนาคม', '97.2%', '96.5%', '-0.7% ⚠️'],
            ]}
          />
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            <strong>การตีความ:</strong> ดูว่าปีนี้ดีขึ้นหรือแย่ลงกว่าปีที่แล้วในช่วงเดียวกัน
          </div>
        </Subsection>

        <Subsection title="3. Goal vs Actual Tracking">
          <p>เปรียบเทียบผลจริงกับเป้าหมาย</p>
          <ul>
            <li><strong>Target Line:</strong> เส้นเป้าหมาย (เส้นประ)</li>
            <li><strong>Actual Line:</strong> ผลจริง (เส้นทึบ)</li>
            <li><strong>Gap Area:</strong> พื้นที่ระหว่างเส้น = ส่วนต่าง</li>
          </ul>
          <div style={{ marginTop: '8px', padding: '10px', background: '#d4edda', borderRadius: '6px' }}>
            <strong>เป้าหมาย:</strong> ให้เส้น Actual อยู่เหนือเส้น Target ตลอด
          </div>
        </Subsection>
      </Section>

      {/* Seasonal Patterns */}
      <Section title="การระบุรูปแบบตามฤดูกาล (Seasonality)">
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🌦️ Seasonality คืออะไร?</h4>
          <p style={{ margin: 0 }}>
            คือรูปแบบที่เกิดซ้ำในช่วงเวลาที่แน่นอน เช่น คุณภาพอาจแย่ลงทุกเดือนธันวาคม
            (เพราะช่วงปีใหม่มีพนักงานใหม่เยอะ) หรือดีขึ้นทุกเดือนมีนาคม (หลังจากอบรม)
          </p>
        </div>

        <Table
          headers={['Pattern', 'ตัวอย่าง', 'สาเหตุที่เป็นไปได้', 'การจัดการ']}
          rows={[
            [
              'Holiday Effect',
              'คุณภาพแย่ช่วงปีใหม่',
              'พนักงานหยุดเยอะ, คนใหม่',
              'เตรียมทีมสำรองล่วงหน้า',
            ],
            [
              'Training Impact',
              'ดีขึ้นหลังอบรม',
              'พนักงานได้รับการอบรม',
              'วางแผนอบรมเป็นประจำ',
            ],
            [
              'Weather Effect',
              'แย่ช่วงฝน',
              'ความชื้นสูง',
              'ควบคุม HVAC เข้มขึ้น',
            ],
            [
              'Budget Cycle',
              'แย่ช่วงต้นปี',
              'งบประมาณถูกตัด',
              'จัดสรรงบล่วงหน้า',
            ],
          ]}
        />
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '📊 Monthly Quality Reviews - ทบทวนคุณภาพประจำเดือน',
            '🎯 Annual Planning - วางแผนประจำปี',
            '📈 Goal Setting & Tracking - กำหนดและติดตามเป้าหมาย',
            '💼 Management Reporting - รายงานผู้บริหาร',
            '📅 Budget Planning - วางแผนงบประมาณ',
            '🏆 Performance Review - ประเมินผลประจำปี',
          ]}
        />
      </Section>

      {/* Monthly Review Process */}
      <Section title="กระบวนการทบทวนรายเดือน">
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>📅 ต้นเดือนทุกเดือน - Monthly Quality Review:</h4>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><strong>Week 1:</strong> Generate Monthly Trend Report (12 เดือนย้อนหลัง)</li>
            <li><strong>Analyze:</strong>
              <ul>
                <li>เดือนที่แล้วดีขึ้นหรือแย่ลง?</li>
                <li>เทียบกับเดือนเดียวกันปีที่แล้วอย่างไร?</li>
                <li>บรรลุเป้าหมายหรือไม่?</li>
                <li>มีรูปแบบตามฤดูกาลหรือไม่?</li>
              </ul>
            </li>
            <li><strong>Action Planning:</strong>
              <ul>
                <li>ถ้าไม่บรรลุเป้าหมาย → ทำ Root Cause Analysis</li>
                <li>ถ้ามีแนวโน้มลง → จัดทำ Improvement Plan</li>
                <li>ถ้ามี Seasonality → เตรียมรับมือล่วงหน้า</li>
              </ul>
            </li>
            <li><strong>Report:</strong> สรุปผลและนำเสนอผู้บริหาร</li>
            <li><strong>Follow-up:</strong> ติดตามการดำเนินการ</li>
          </ol>
        </div>
      </Section>

      {/* Goal Setting */}
      <Section title="การกำหนดเป้าหมายรายเดือน">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#004085' }}>🎯 SMART Goals</h4>
          <p style={{ margin: '0 0 15px 0' }}>เป้าหมายที่ดีต้องเป็น SMART:</p>

          <Table
            headers={['ตัวอักษร', 'ความหมาย', 'ตัวอย่าง']}
            rows={[
              ['S', 'Specific (ชัดเจน)', 'เพิ่ม LAR ของ Line 3'],
              ['M', 'Measurable (วัดได้)', 'จาก 95% เป็น 97%'],
              ['A', 'Achievable (ทำได้)', 'ไม่เกินความสามารถ'],
              ['R', 'Relevant (เกี่ยวข้อง)', 'สอดคล้องกับ Business Goal'],
              ['T', 'Time-bound (มีกำหนดเวลา)', 'ภายในไตรมาส 2/2024'],
            ]}
          />

          <div style={{ marginTop: '15px', background: 'white', padding: '12px', borderRadius: '6px' }}>
            <strong>ตัวอย่าง SMART Goal:</strong><br/>
            "เพิ่ม LAR ของ Production Line 3 จาก 95% เป็น 97% ภายในเดือนมิถุนายน 2024
            โดยการอบรมพนักงานและปรับปรุงเครื่องจักร"
          </div>
        </div>
      </Section>

      {/* Export Options */}
      <Section title="การส่งออกรายงาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📄 PDF Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              กราฟแนวโน้มพร้อมคำอธิบาย<br/>
              <strong>ใช้สำหรับ:</strong> รายงานผู้บริหาร, การประชุม
            </p>
          </div>
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Excel Export</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข้อมูลรายเดือนเต็ม<br/>
              <strong>ใช้สำหรับ:</strong> การคำนวณ, วิเคราะห์เพิ่ม
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
              'แนวโน้มผันผวนมาก',
              'ปกติ - ลองใช้ Moving Average หรือดูรายไตรมาสแทน',
            ],
            [
              'ไม่เห็น Seasonality',
              'อาจต้องข้อมูลหลายปี (2-3 ปี) จึงจะเห็นชัดเจน',
            ],
            [
              'ไม่บรรลุเป้าหมายหลายเดือนติด',
              'ต้องทำ Root Cause Analysis และปรับ Action Plan ใหม่',
            ],
            [
              'เป้าหมายง่ายเกินไป',
              'ปรับเป้าหมายให้ท้าทายขึ้น แต่ยังทำได้',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับรายงาน Monthly Quality Trend:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การตีความแนวโน้มและ Goal Setting</li>
          <li>Planning Team - การวางแผนประจำปี</li>
          <li>Data Analyst - การวิเคราะห์ Seasonality</li>
          <li>REPORTS_MANUAL.md หน้า "Monthly Quality Trend Report"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T29_MonthlyTrendPage;
