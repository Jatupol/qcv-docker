// client/src/pages/training/T45_PartsPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  HelpBox,
  Subsection,
  List,
} from '../../components/training/TrainingComponents';

/**
 * Parts Master Data Training Page
 *
 * Quick Reference Card #45: Parts Management
 */
const T45_PartsPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={45}
      totalCards={48}
      title="Parts (ชิ้นส่วน)"
      subtitle="การจัดการข้อมูลหลักชิ้นส่วนและผลิตภัณฑ์"
      icon="🔩"
      nextLink="/training/fiscal-calendar"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของ Parts">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            Parts ใช้สำหรับจัดการข้อมูลชิ้นส่วนและผลิตภัณฑ์ทั้งหมดในระบบ รวมถึงความสัมพันธ์กับลูกค้า,
            ค่า Threshold ของ LAR/DPPM/Underkill และการ Import ข้อมูลจาก Excel
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Master Data → Parts &nbsp; | &nbsp; /master-data/parts
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#856404' }}>
            <strong>สิทธิ์การเข้าถึง:</strong> Admin, Manager เท่านั้น
          </p>
        </div>
      </Section>

      {/* Section 2: Form Fields */}
      <Section title="ข้อมูลในฟอร์ม">
        <Subsection title="📋 Part Information (ข้อมูลหลัก)">
          <Table
            headers={['ฟิลด์', 'รายละเอียด', 'ข้อกำหนด']}
            rows={[
              ['Part Number', 'หมายเลขชิ้นส่วน (Primary Key)', 'ต้องกรอก, 1-25 ตัวอักษร, A-Z, 0-9, -, _ เท่านั้น'],
              ['Customer P/N', 'หมายเลขชิ้นส่วนของลูกค้า', 'ไม่บังคับ, สูงสุด 50 ตัวอักษร'],
              ['Product Family', 'กลุ่มผลิตภัณฑ์ (Dropdown)', 'ต้องเลือก, ค่าจาก Inspection Data Setup'],
              ['Version', 'เวอร์ชันชิ้นส่วน', 'ต้องกรอก, สูงสุด 10 ตัวอักษร'],
              ['Customer-Site', 'ความสัมพันธ์ลูกค้า-ไซต์ (Dropdown)', 'ต้องเลือก, ค่าจาก Products Site'],
              ['Tab', 'การจำแนกแท็บ (Dropdown)', 'ต้องเลือก, ค่าจาก Inspection Data Setup'],
              ['Product Type', 'ประเภทผลิตภัณฑ์ (Dropdown)', 'ต้องเลือก, ค่าจาก Inspection Data Setup'],
              ['Customer Driver', 'ข้อมูลข้อกำหนดของลูกค้า', 'ต้องกรอก, 1-200 ตัวอักษร'],
              ['Active', 'สถานะใช้งาน', 'ค่าเริ่มต้น: Active'],
            ]}
          />
        </Subsection>

        <Subsection title="📊 LAR Thresholds (ค่าเป้าหมาย LAR)">
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'ค่าเริ่มต้น']}
            rows={[
              ['LAR Achieve Threshold (%)', 'เป้าหมาย LAR ที่ต้องบรรลุ', '97.00%'],
              ['LAR Accept Min (%)', 'ค่าต่ำสุดที่ยอมรับได้', '88.00%'],
              ['LAR Accept Max (%)', 'ค่าสูงสุดที่ยอมรับได้', '97.00%'],
              ['LAR Abnormal (%)', 'ค่าที่ถือว่าผิดปกติ', '88.00%'],
            ]}
          />
        </Subsection>

        <Subsection title="⚠️ DPPM Thresholds (ค่าเป้าหมาย DPPM)">
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'ค่าเริ่มต้น']}
            rows={[
              ['DPPM Achieve Threshold', 'เป้าหมาย DPPM ที่ต้องบรรลุ', '300'],
              ['DPPM Accept Min', 'ค่าต่ำสุดที่ยอมรับได้', '300'],
              ['DPPM Accept Max', 'ค่าสูงสุดที่ยอมรับได้', '1,000'],
              ['DPPM Abnormal', 'ค่าที่ถือว่าผิดปกติ', '1,000'],
            ]}
          />
        </Subsection>

        <Subsection title="🎯 Underkill Thresholds (ค่าเป้าหมาย Underkill)">
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'ค่าเริ่มต้น']}
            rows={[
              ['Underkill Achieve (%)', 'เป้าหมาย Underkill ที่ต้องบรรลุ', '0.02%'],
              ['Underkill Accept Min (%)', 'ค่าต่ำสุดที่ยอมรับได้', '0.02%'],
              ['Underkill Accept Max (%)', 'ค่าสูงสุดที่ยอมรับได้', '0.01%'],
              ['Underkill Abnormal (%)', 'ค่าที่ถือว่าผิดปกติ', '0.01%'],
            ]}
          />
        </Subsection>

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 หมายเหตุ:</strong> ส่วน Thresholds (LAR, DPPM, Underkill) เป็นแบบ Collapsible
            สามารถคลิกเพื่อขยาย/ยุบได้ ค่าเหล่านี้จะถูกใช้ในรายงาน Customer Format เพื่อ Conditional Formatting
          </p>
        </div>
      </Section>

      {/* Section 3: Table Columns */}
      <Section title="คอลัมน์ในตารางข้อมูล">
        <Table
          headers={['คอลัมน์', 'คำอธิบาย', 'สามารถเรียงลำดับ']}
          rows={[
            ['Part Number (Code)', 'หมายเลขชิ้นส่วน (Primary Key)', 'ได้'],
            ['Customer P/N', 'หมายเลขชิ้นส่วนของลูกค้า', 'ได้'],
            ['Product Family', 'กลุ่มผลิตภัณฑ์', 'ได้'],
            ['Version', 'เวอร์ชัน', 'ได้'],
            ['Production site & customer', 'แสดงชื่อลูกค้าและรหัส Customer-Site', 'ได้'],
            ['Tab', 'แท็บ', 'ได้'],
            ['Type', 'ประเภทผลิตภัณฑ์ (แสดงเป็น Badge สีเหลือง)', 'ได้'],
            ['Customer Driver', 'ข้อมูลข้อกำหนดลูกค้า (ตัดที่ 40 ตัวอักษร)', 'ไม่ได้'],
            ['Status', 'Active/Inactive (แสดงเป็น Badge สี)', 'ได้'],
            ['Actions', 'ปุ่ม Edit, Delete, Toggle Status', '-'],
          ]}
        />
      </Section>

      {/* Section 4: CRUD Operations */}
      <Section title="การดำเนินการ CRUD">
        <Subsection title="การเพิ่ม Part ใหม่">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'คลิกปุ่ม "Create New" เพื่อเปิดฟอร์ม',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'กรอก Part Number, เลือก Product Family, Version, Customer-Site, Tab, Product Type',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'กรอก Customer Driver และปรับค่า Threshold ถ้าต้องการ (ขยายส่วน LAR/DPPM/Underkill)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Save" เพื่อบันทึก',
              },
            ]}
          />
        </Subsection>

        <Subsection title="การค้นหา">
          <p>สามารถค้นหาได้จากหลายฟิลด์:</p>
          <List
            items={[
              'Part Number (น้ำหนักสูงสุด)',
              'Customer P/N (น้ำหนักสูงสุด)',
              'Customer-Site',
              'Product Family',
              'Customer Driver',
            ]}
          />
        </Subsection>
      </Section>

      {/* Section 5: Excel Import/Export */}
      <Section title="การ Import/Export Excel">
        <Subsection title="การ Import ข้อมูลจาก Excel">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'คลิกปุ่ม "Import" ที่ด้านบนของหน้า',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'เลือกไฟล์ Excel (.xlsx) ที่ต้องการ Import',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ระบบจะตรวจสอบคอลัมน์และข้อมูล แสดงผลตัวอย่างให้ตรวจสอบ',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Import" เพื่อยืนยัน ระบบจะแสดงผลสำเร็จ/ล้มเหลว',
              },
            ]}
          />
        </Subsection>

        <Subsection title="คอลัมน์ที่รองรับใน Excel">
          <Table
            headers={['คอลัมน์ (บังคับ)', 'คอลัมน์ (ไม่บังคับ)']}
            rows={[
              ['partno (Part Number)', 'partno_customer, product_families, versions'],
              ['', 'customers_site, tab, product_type, customer_driver'],
              ['', 'lar_achieve_threshold, lar_accept_min_threshold, ...'],
              ['', 'dppm_achieve_threshold, dppm_accept_min_threshold, ...'],
              ['', 'underkill_achieve_threshold, underkill_accept_min_threshold, ...'],
            ]}
          />
          <div style={{ marginTop: '10px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>💡 เคล็ดลับ:</strong> ระบบรองรับชื่อคอลัมน์แบบ Alias เช่น "Part Number" แทน "partno",
              "Customer P/N" แทน "partno_customer" หรือตัวพิมพ์ใหญ่ เช่น "PARTNO"
            </p>
          </div>
        </Subsection>

        <Subsection title="การ Export Template">
          <p>คลิกปุ่ม "Download Template" เพื่อดาวน์โหลดไฟล์ Excel ตัวอย่างที่มีคอลัมน์ถูกต้อง สำหรับใช้เป็นแม่แบบในการ Import</p>
        </Subsection>
      </Section>

      {/* Section 6: Dropdown Dependencies */}
      <Section title="ความสัมพันธ์ของ Dropdown">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🔗 แหล่งข้อมูล Dropdown</h4>
          <Table
            headers={['Dropdown', 'แหล่งข้อมูล', 'จัดการที่']}
            rows={[
              ['Product Family', 'Inspection Data Setup → Product Families', 'Master Data → Inspection Data Setup'],
              ['Customer-Site', 'Products Site', 'Master Data → Products Site'],
              ['Tab', 'Inspection Data Setup → Tabs', 'Master Data → Inspection Data Setup'],
              ['Product Type', 'Inspection Data Setup → Product Type', 'Master Data → Inspection Data Setup'],
            ]}
          />
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#1565c0' }}>
            <strong>หมายเหตุ:</strong> หากไม่พบตัวเลือกใน Dropdown ให้ตรวจสอบว่าได้เพิ่มข้อมูลในหน้า Master Data ที่เกี่ยวข้องแล้ว
          </p>
        </div>
      </Section>

      {/* Section 7: Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <List
          items={[
            'ใช้ Part Number ตามรูปแบบมาตรฐานขององค์กร เช่น ABC-123-XYZ',
            'กรอก Customer P/N เพื่อใช้อ้างอิงกับลูกค้า',
            'ตั้งค่า Threshold ให้เหมาะสมกับแต่ละ Part เพื่อ Conditional Formatting ที่ถูกต้อง',
            'ใช้ Inactive แทนการลบ เพื่อเก็บประวัติข้อมูล',
            'ใช้ Import Excel สำหรับการเพิ่มข้อมูลจำนวนมาก แทนการกรอกทีละรายการ',
            'ตรวจสอบให้แน่ใจว่า Customer-Site, Product Family, Tab, Product Type มีข้อมูลพร้อมก่อนสร้าง Part',
          ]}
        />
      </Section>

      {/* Section 8: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['Dropdown ไม่มีตัวเลือก', 'เพิ่มข้อมูลใน Inspection Data Setup หรือ Products Site ก่อน'],
            ['Import ล้มเหลว', 'ตรวจสอบว่ามีคอลัมน์ "partno" ในไฟล์ Excel และชื่อคอลัมน์ถูกต้อง'],
            ['Part Number ซ้ำ', 'Part Number ต้องไม่ซ้ำกัน ตรวจสอบรายการที่มีอยู่'],
            ['บันทึกไม่สำเร็จ', 'ตรวจสอบว่าฟิลด์บังคับทุกช่องได้กรอกครบ'],
            ['Threshold ไม่แสดงในรายงาน', 'ตรวจสอบว่าได้ตั้งค่า Threshold และ Part มีสถานะ Active'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Parts:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T45_PartsPage;
