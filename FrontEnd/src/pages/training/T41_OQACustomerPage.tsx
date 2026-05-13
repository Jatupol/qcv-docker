// client/src/pages/training/T41_OQACustomerPage.tsx

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
 * OQA Customer Inspection Data Training Page
 * Covers the customer OQA inspection data viewer at /customer-data/oqa
 */
const T41_OQACustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={41}
      totalCards={48}
      title="OQA Sampling (Customer)"
      subtitle="ข้อมูลการตรวจสอบ OQA สำหรับลูกค้า"
      icon="📋"
      nextLink="/training/sgt-format-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#f3e8ff', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#7c3aed' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            หน้าดูข้อมูลการตรวจสอบ OQA ในฝั่ง <strong>Customer</strong>
            ข้อมูลจะแยกจากฝั่ง Internal (ใช้ตาราง <code>inspectiondata_customer</code>)
            มีธีมสี <strong>ม่วง (Violet)</strong> เพื่อแยกแยะจากหน้า OQA ภายในที่เป็นสีส้ม
          </p>
          <div style={{ background: '#ede9fe', padding: '10px', borderRadius: '6px' }}>
            <strong>📍 Path:</strong> <code>/customer-data/oqa</code><br/>
            <strong>🎨 Theme:</strong> Violet / Purple<br/>
            <strong>🔑 สิทธิ์:</strong> user, manager, admin, viewer
          </div>
        </div>
      </Section>

      {/* Difference from Internal OQA */}
      <Section title="ความแตกต่างจาก OQA ภายใน">
        <Table
          headers={['รายการ', 'OQA (ภายใน)', 'OQA Customer']}
          rows={[
            ['Path', '/inspection/oqa', '/customer-data/oqa'],
            ['Theme สี', 'ส้ม (Amber)', 'ม่วง (Violet)'],
            ['ข้อมูล', 'inspectiondata', 'inspectiondata_customer'],
            ['สร้าง SIV', 'ได้ (เมื่อ Pass)', 'ไม่มีปุ่มนี้'],
            ['หน้า Defect', '/inspection/defect/new', '/customer-data/defect/new'],
            ['Role viewer', 'ไม่มี', 'มี'],
          ]}
        />
      </Section>

      {/* Page Header */}
      <Section title="ส่วนหัวของหน้า">
        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
          <h5 style={{ margin: '0 0 8px 0' }}>📊 สรุปสถิติ (Pass Rate Card)</h5>
          <List
            items={[
              'Total Sampling Records — จำนวนรายการทั้งหมด',
              'Pass Rate (%) — อัตราผ่าน = (Pass / (Pass + Reject)) × 100',
              'Passed / Rejected / Pending — จำนวนแยกตามสถานะ',
              'Total Sampling Qty / Total NG Qty — จำนวนชิ้นตรวจ และ NG',
            ]}
          />
        </div>
      </Section>

      {/* Filters */}
      <Section title="ตัวกรองข้อมูล">
        <Table
          headers={['ตัวกรอง', 'ประเภท', 'คำอธิบาย']}
          rows={[
            ['Date Range (วันที่เริ่ม-สิ้นสุด)', 'Server-side', 'กรองจาก Database — กดปุ่ม Search เพื่อโหลดข้อมูลใหม่'],
            ['Judgment (ผลการตรวจ)', 'Client-side', 'เลือก All / Pass / Reject / Pending'],
            ['Production Site', 'Client-side', 'เลือกจาก Dropdown (ดึงจากข้อมูลที่โหลด)'],
            ['Model', 'Client-side', 'เลือกจาก Dropdown (ดึงจากข้อมูลที่โหลด)'],
            ['Lot No (ค้นหา)', 'Client-side', 'พิมพ์ค้นหา — Highlight ข้อความที่ตรงในตาราง'],
            ['FVI Line No', 'Client-side', 'พิมพ์ค้นหาหมายเลข FVI Line'],
          ]}
        />
        <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
          <strong>💡 เคล็ดลับ:</strong> ตัวกรอง Client-side ทำงานทันทีไม่ต้องกด Search
          แต่ Date Range ต้องกดปุ่ม Search เพื่อดึงข้อมูลจาก Server ใหม่
        </div>
      </Section>

      {/* Data Table */}
      <Section title="ตารางข้อมูล">
        <Table
          headers={['คอลัมน์', 'เนื้อหา']}
          rows={[
            ['No.', 'ลำดับรายการ'],
            ['Sampling No', 'หมายเลขการตรวจสอบ'],
            ['Sampling Date', 'วันที่ตรวจ + WW + เหตุผลการ Sampling (ถ้ามี)'],
            ['Lot No', 'หมายเลข Lot (คลิกเพื่อดูรายละเอียด Lot) + Partsite & MC Line No'],
            ['Item No', 'หมายเลขชิ้นส่วน + Model (ตัวหนา)'],
            ['Round', 'รอบการตรวจ + FVI Line No'],
            ['Quantities', 'FVI Lot Qty / General Sampling Qty / Crack Sampling Qty'],
            ['Status', 'Pass (เขียว) / Reject (แดง) / Pending (เทา) + จำนวน Defect/NG'],
            ['Actions', 'ปุ่มดำเนินการ (ดูด้านล่าง)'],
          ]}
        />
      </Section>

      {/* Actions */}
      <Section title="ปุ่มดำเนินการ (Actions)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>✏️ Edit (แก้ไข)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เปิดหน้าฟอร์มแก้ไขข้อมูลการตรวจสอบ
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#721c24' }}>🗑️ Delete (ลบ)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ลบรายการ — มี Modal ยืนยันก่อนลบ<br/>
              <strong>ลบแล้วไม่สามารถกู้คืนได้</strong>
            </p>
          </div>

          <div style={{ background: '#e2e8f0', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#374151' }}>📄 Details (รายละเอียด)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เปิด Modal แสดงข้อมูลครบทุกฟิลด์<br/>
              พร้อมปุ่ม Print
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Input Defect (บันทึกข้อบกพร่อง)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              แสดงเฉพาะรายการ <strong>Reject</strong> เท่านั้น<br/>
              เปิดหน้า Defect ของ Customer ใน Tab ใหม่
            </p>
          </div>
        </div>
      </Section>

      {/* Modals */}
      <Section title="หน้าต่างป๊อปอัพ (Modals)">
        <Subsection title="1. Record Detail Modal">
          <p>แสดงข้อมูลการตรวจสอบครบทุกฟิลด์: ID, Station, Timestamps, QC Info, Lot Details, Model, Quantities, Judgment พร้อมปุ่ม Print</p>
        </Subsection>

        <Subsection title="2. Lot Information Modal">
          <p>คลิกที่ <strong>Lot No</strong> ในตาราง — แสดงข้อมูล Lot จาก inf_lotinput: Supplier, Product, Quantity, Dates</p>
        </Subsection>

        <Subsection title="3. Delete Confirmation Modal">
          <p>ยืนยันก่อนลบ — แสดงหมายเลข Inspection พร้อมปุ่ม Cancel และ Confirm Delete</p>
        </Subsection>
      </Section>

      {/* Export */}
      <Section title="การส่งออกข้อมูล (Export)">
        <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
          <h5 style={{ margin: '0 0 8px 0' }}>📥 Excel Export</h5>
          <p style={{ margin: 0 }}>
            กดปุ่ม Download ที่ Header — Export ข้อมูลที่กรองแล้วเป็น Excel<br/>
            <strong>คอลัมน์:</strong> No., Station, Sampling No, Date, WW, Shift, Lot No, MC Line No, Item No, Model, Round, Quantities, Judgment, Inspector<br/>
            <strong>ชื่อไฟล์:</strong> <code>OQA_Inspection_Records_[timestamp].xlsx</code>
          </p>
        </div>
      </Section>

      {/* Pagination */}
      <Section title="การแบ่งหน้า (Pagination)">
        <List
          items={[
            'เลือกจำนวนต่อหน้า: 25, 50, 100, 200, 500 รายการ (ค่าเริ่มต้น 25)',
            'ปุ่มนำทาง: First / Previous / Next / Last',
            'แสดง "Showing X to Y of Z results"',
          ]}
        />
      </Section>

      {/* How to Use */}
      <Section title="วิธีการใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่เมนู Customer Format → OQA',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'ระบบจะโหลดข้อมูลวันนี้อัตโนมัติ — เปลี่ยน Date Range แล้วกด Search เพื่อดูช่วงอื่น',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ใช้ตัวกรอง Judgment / Model / Lot No เพื่อค้นหาเฉพาะข้อมูลที่ต้องการ',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิก Lot No เพื่อดูรายละเอียด หรือกดปุ่ม Actions เพื่อดำเนินการ',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'กดปุ่ม Download เพื่อ Export เป็น Excel',
            },
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่พบข้อมูล',
              'ตรวจสอบ Date Range — ค่าเริ่มต้นเป็นวันนี้ ลองขยายช่วงวันที่',
            ],
            [
              'ปุ่ม Input Defect ไม่แสดง',
              'แสดงเฉพาะรายการที่ Judgment = Reject เท่านั้น',
            ],
            [
              'Lot Info ไม่แสดง',
              'Lot No อาจไม่มีในระบบ inf_lotinput — จะแสดงข้อความเตือน',
            ],
            [
              'ข้อมูลไม่อัพเดท',
              'กดปุ่ม Search ใหม่เพื่อดึงข้อมูลล่าสุดจาก Server',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับ OQA Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>QC Supervisor - การบันทึกและแก้ไขข้อมูลการตรวจ</li>
          <li>Quality Manager - การวิเคราะห์ผลการตรวจของลูกค้า</li>
          <li>IT Support - ปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T41_OQACustomerPage;
