// client/src/pages/training/T43_DefectTypeAnalysisPage.tsx

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
 * Defect Type Analysis Training Page
 * Covers the defect analysis page at /inspection/defect-type-analysis
 */
const T43_DefectTypeAnalysisPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={43}
      totalCards={48}
      title="Defect Type Analysis"
      subtitle="การวิเคราะห์ประเภทข้อบกพร่อง"
      icon="📊"
      nextLink="/training/oqa-reject-all-defect-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            หน้าวิเคราะห์ข้อบกพร่อง แสดงกราฟและตารางข้อมูล Defect
            เพื่อระบุ <strong>ข้อบกพร่องที่พบบ่อยที่สุด</strong> และ <strong>Model ที่มีปัญหามาก</strong>
            ช่วยในการตัดสินใจปรับปรุงกระบวนการผลิต
          </p>
          <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/inspection/defect-type-analysis</code><br/>
            <strong>📂 เมนู:</strong> Inspection → Defect Type Analysis<br/>
            <strong>🔑 สิทธิ์:</strong> admin, manager
          </div>
        </div>
      </Section>

      {/* How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู Inspection → Defect Type Analysis',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือกช่วงวันที่ (Date Range) ที่ต้องการวิเคราะห์',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Model ที่ต้องการ (เลือกได้หลายรายการ) หรือเลือกทั้งหมด',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'กดปุ่ม Search เพื่อโหลดข้อมูล',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'ดูผลลัพธ์ในส่วน Summary Cards, กราฟ 3 แบบ, และตารางข้อมูล',
            },
          ]}
        />
      </Section>

      {/* Filters */}
      <Section title="ตัวกรอง (Filters)">
        <Table
          headers={['ตัวกรอง', 'คำอธิบาย']}
          rows={[
            ['Date Range (วันที่เริ่ม-สิ้นสุด)', 'เลือกช่วงวันที่ที่ต้องการวิเคราะห์'],
            ['Model (Multi-Select)', 'เลือก Model ที่ต้องการ — เลือกได้หลายรายการพร้อมกัน'],
            ['Search', 'กดปุ่มเพื่อดึงข้อมูลจาก Server'],
            ['Export Excel', 'กดปุ่มเพื่อ Export ข้อมูลเป็น Excel (ปิดเมื่อไม่มีข้อมูล)'],
          ]}
        />
      </Section>

      {/* Summary Cards */}
      <Section title="การ์ดสรุปข้อมูล (Summary Cards)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h5 style={{ margin: '0 0 5px 0', color: '#991b1b' }}>Total NG Qty</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>จำนวนชิ้นที่ไม่ผ่านทั้งหมด</p>
          </div>
          <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h5 style={{ margin: '0 0 5px 0', color: '#1e40af' }}>Unique Defect Types</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>จำนวนประเภท Defect ที่พบ</p>
          </div>
          <div style={{ background: '#d1fae5', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h5 style={{ margin: '0 0 5px 0', color: '#065f46' }}>Unique Models</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>จำนวน Model ที่มี Defect</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h5 style={{ margin: '0 0 5px 0', color: '#92400e' }}>Unique Lots</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>จำนวน Lot ที่มี Defect</p>
          </div>
        </div>
      </Section>

      {/* Charts */}
      <Section title="กราฟวิเคราะห์ (3 กราฟ)">
        <Subsection title="1. Top 10 Defect Types (กราฟแท่งแนวนอน)">
          <p>
            แสดง 10 ประเภท Defect ที่พบมากที่สุด เรียงจากมากไปน้อย<br/>
            <strong>แกน X:</strong> จำนวน NG Qty | <strong>แกน Y:</strong> ชื่อ Defect Type
          </p>
        </Subsection>

        <Subsection title="2. Defect Type Distribution (กราฟวงกลม Donut)">
          <p>
            แสดงสัดส่วนของ Defect แต่ละประเภท เป็น % ของทั้งหมด<br/>
            แสดง Top 10 พร้อม Legend สีเพื่อแยกแยะ
          </p>
        </Subsection>

        <Subsection title="3. Top 10 Models by NG Qty (กราฟแท่งแนวตั้ง)">
          <p>
            แสดง 10 Model ที่มี NG มากที่สุด<br/>
            <strong>แกน X:</strong> ชื่อ Model (เอียง 45°) | <strong>แกน Y:</strong> จำนวน NG Qty
          </p>
        </Subsection>
      </Section>

      {/* Data Table */}
      <Section title="ตารางข้อมูล">
        <Table
          headers={['คอลัมน์', 'คำอธิบาย', 'ฟีเจอร์']}
          rows={[
            ['Date', 'วันที่พบ Defect', 'คลิก Sort ได้'],
            ['Item No', 'หมายเลขชิ้นส่วน', 'คลิก Sort ได้'],
            ['Model', 'ชื่อ Model', 'คลิก Sort ได้'],
            ['Version', 'เวอร์ชันของ Model', 'คลิก Sort ได้'],
            ['Lot No', 'หมายเลข Lot', 'คลิก Sort ได้'],
            ['Defect Type', 'ประเภท Defect', 'คลิก Sort + Filter Dropdown'],
            ['Defect Name', 'ชื่อ Defect', 'คลิก Sort + Filter Dropdown'],
            ['Description', 'รายละเอียด Defect', '—'],
            ['NG Qty', 'จำนวน NG', 'คลิก Sort + สีตามระดับ'],
          ]}
        />

        <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
          <strong>🎨 สี NG Qty:</strong><br/>
          <span style={{ color: '#dc2626' }}>🔴 แดง</span> = 10 ขึ้นไป (วิกฤต) |{' '}
          <span style={{ color: '#ea580c' }}>🟠 ส้ม</span> = 5-9 (เฝ้าระวัง) |{' '}
          <span style={{ color: '#16a34a' }}>🟢 เขียว</span> = น้อยกว่า 5 (ปกติ)
        </div>

        <div style={{ marginTop: '10px' }}>
          <strong>📄 แบ่งหน้า:</strong> 10, 20, 50, 100 รายการต่อหน้า
        </div>
      </Section>

      {/* Export */}
      <Section title="การส่งออกข้อมูล (Export)">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h5 style={{ margin: '0 0 8px 0' }}>📥 Export to Excel</h5>
          <p style={{ margin: 0 }}>
            กดปุ่ม Export เพื่อดาวน์โหลดข้อมูลที่กรองแล้วเป็น Excel<br/>
            <strong>คอลัมน์:</strong> Inspection Date, Item No, Model, Version, Lot No, Defect Type, Defect Name, Description, NG Qty<br/>
            <strong>ชื่อไฟล์:</strong> <code>Defect_Type_Analysis_[startDate]_[endDate].xlsx</code>
          </p>
        </div>
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            '🔝 ระบุ Top Defect ที่เกิดบ่อยที่สุดเพื่อจัดลำดับการแก้ไข',
            '📊 วิเคราะห์สัดส่วน Defect แต่ละประเภท (Pareto Analysis)',
            '🏭 ระบุ Model ที่มีปัญหามากที่สุดเพื่อปรับปรุงกระบวนการ',
            '📅 เปรียบเทียบแนวโน้ม Defect ระหว่างช่วงเวลา',
            '📋 รายงานผลวิเคราะห์ให้ผู้จัดการและทีมคุณภาพ',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่มีข้อมูลแสดง',
              'ตรวจสอบ Date Range และ Model ที่เลือก — ลองขยายช่วงวันที่',
            ],
            [
              'กราฟไม่แสดง',
              'ต้องมีข้อมูล Defect อย่างน้อย 1 รายการ — กด Search ก่อน',
            ],
            [
              'ปุ่ม Export ไม่ทำงาน',
              'ปุ่ม Export จะปิดเมื่อไม่มีข้อมูล — กด Search ให้มีข้อมูลก่อน',
            ],
            [
              'ตาราง Filter ไม่ทำงาน',
              'Filter Dropdown ใช้ได้เฉพาะคอลัมน์ Defect Type และ Defect Name',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับ Defect Type Analysis:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - การวิเคราะห์และตีความข้อมูล</li>
          <li>Process Engineer - การปรับปรุงกระบวนการจากผล Defect</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T43_DefectTypeAnalysisPage;
