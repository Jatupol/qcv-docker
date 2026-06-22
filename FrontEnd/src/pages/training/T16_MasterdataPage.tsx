// client/src/pages/training/T16_MasterdataPage.tsx

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
 * Master Data Management Training Page
 *
 * Quick Reference Card #16: การจัดการข้อมูลหลัก
 */
const T16_MasterdataPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={16}
      totalCards={48}
      title="การจัดการข้อมูลหลักทั้งหมด"
      subtitle="All Master Data Management"
      icon="📋"
      nextLink="/training/t13"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            การจัดการข้อมูลหลัก (Master Data) เป็นพื้นฐานสำคัญของระบบ
            ข้อมูลเหล่านี้ใช้ในการบันทึกการตรวจสอบ การรายงาน และการวิเคราะห์ทั้งหมด
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Master Data (เมนูด้านซ้าย) &nbsp; | &nbsp; /master-data/*
          </p>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#721c24' }}>
            ⚠️ สิทธิ์การเข้าถึง: เฉพาะ Admin และ Manager (ยกเว้น Defect Image Management เฉพาะ Admin)
          </p>
        </div>
      </Section>

      {/* Master Data Overview */}
      <Section title="ข้อมูลหลักทั้งหมดในระบบ">
        <Table
          headers={['ข้อมูลหลัก', 'เส้นทาง', 'คำอธิบาย', 'สิทธิ์']}
          rows={[
            ['Inspection Data Setup', '/master-data/inspection', 'ตั้งค่า Sampling, Shift, Site, Defect Config', 'Admin, Manager'],
            ['Customers', '/master-data/customers', 'ข้อมูลลูกค้า (CRUD)', 'Admin, Manager'],
            ['Products Site', '/master-data/products-site', 'ความสัมพันธ์ Customer-Site', 'Admin, Manager'],
            ['Defects', '/master-data/defects', 'ประเภทข้อบกพร่อง (CRUD)', 'Admin, Manager'],
            ['Sampling Reasons', '/master-data/samplingResons', 'เหตุผลการสุ่มตรวจ (CRUD)', 'Admin, Manager'],
            ['Parts', '/master-data/parts', 'ชิ้นส่วน/ผลิตภัณฑ์ (CRUD + Excel Import)', 'Admin, Manager'],
            ['Fiscal Calendar', '/master-data/fiscal-calendar', 'ปฏิทิน Fiscal Year (Seagate)', 'Admin, Manager'],
            ['Users', '/master-data/users', 'จัดการผู้ใช้งานระบบ', 'Admin, Manager'],
            ['Defect Image Management', '/master-data/defect-images', 'จัดการรูปภาพข้อบกพร่อง', 'Admin เท่านั้น'],
          ]}
        />
      </Section>

      {/* Inspection Data Setup */}
      <Section title="1. Inspection Data Setup (ตั้งค่าข้อมูลการตรวจสอบ)">
        <div style={{ background: '#e8f4f8', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>
            <strong>ลักษณะพิเศษ:</strong> เป็น Configuration เดียว (Single Record) ไม่ใช่รายการ CRUD
            ดูรายละเอียดเพิ่มเติมในบทที่ 13
          </p>
        </div>
        <Table
          headers={['กลุ่มการตั้งค่า', 'ฟิลด์', 'คำอธิบาย']}
          rows={[
            ['Sampling Quantities', 'FVI, OQA, OBA, SIV (General/Crack)', 'จำนวนการสุ่มตรวจแต่ละสถานี'],
            ['Organization', 'Shift, Site, Tabs, Product Type/Families', 'ข้อมูลองค์กรและผลิตภัณฑ์'],
            ['Defect Config', 'Defect Type, Group, Color', 'การตั้งค่าประเภทและสีข้อบกพร่อง'],
            ['Notifications', 'Defect Notification Emails', 'อีเมลแจ้งเตือนเมื่อพบข้อบกพร่อง'],
          ]}
        />
      </Section>

      {/* Customers */}
      <Section title="2. Customers (ข้อมูลลูกค้า)">
        <Table
          headers={['ฟิลด์', 'ต้องระบุ', 'คำอธิบาย']}
          rows={[
            ['Customer Code', '✅', 'รหัสลูกค้า (ไม่ซ้ำ)'],
            ['Customer Name', '✅', 'ชื่อบริษัทลูกค้า'],
            ['Short Name', '❌', 'ชื่อย่อ'],
            ['Contact Person', '❌', 'ผู้ติดต่อ'],
            ['Email', '❌', 'อีเมล'],
            ['Phone', '❌', 'เบอร์โทรศัพท์'],
            ['Status', '✅', 'Active/Inactive'],
          ]}
        />
      </Section>

      {/* Products Site */}
      <Section title="3. Products Site (ความสัมพันธ์ Customer-Site)">
        <Table
          headers={['ฟิลด์', 'ต้องระบุ', 'คำอธิบาย']}
          rows={[
            ['Customer', '✅', 'เลือกลูกค้า (Dropdown จาก Customers)'],
            ['Site', '✅', 'เลือก Site (Dropdown จาก System Config)'],
            ['Status', '✅', 'Active/Inactive'],
          ]}
        />
      </Section>

      {/* Defects */}
      <Section title="4. Defects (ประเภทข้อบกพร่อง)">
        <Table
          headers={['ฟิลด์', 'ต้องระบุ', 'คำอธิบาย']}
          rows={[
            ['Defect ID', '✅', 'รหัสข้อบกพร่อง (Auto-generated)'],
            ['Defect Name', '✅', 'ชื่อข้อบกพร่อง'],
            ['Defect Group', '✅', 'กลุ่มข้อบกพร่อง (มี Dropdown Filter)'],
            ['Description', '❌', 'รายละเอียด'],
            ['Status', '✅', 'Active/Inactive'],
          ]}
        />
      </Section>

      {/* Sampling Reasons */}
      <Section title="5. Sampling Reasons (เหตุผลการสุ่มตรวจ)">
        <Table
          headers={['ฟิลด์', 'ต้องระบุ', 'คำอธิบาย']}
          rows={[
            ['Reason ID', '✅', 'รหัสเหตุผล (Auto-generated)'],
            ['Description', '✅', 'คำอธิบายเหตุผลการสุ่มตรวจ'],
            ['Status', '✅', 'Active/Inactive'],
          ]}
        />
      </Section>

      {/* Parts */}
      <Section title="6. Parts (ชิ้นส่วน/ผลิตภัณฑ์)">
        <div style={{ background: '#d4edda', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>
            <strong>ฟีเจอร์พิเศษ:</strong> รองรับ Import/Export ผ่าน Excel สำหรับจัดการข้อมูลจำนวนมาก
          </p>
        </div>
        <Table
          headers={['ฟิลด์', 'ต้องระบุ', 'คำอธิบาย']}
          rows={[
            ['Part Number', '✅', 'หมายเลขชิ้นส่วน'],
            ['Part Name', '✅', 'ชื่อชิ้นส่วน'],
            ['Product Family', '❌', 'กลุ่มผลิตภัณฑ์ (Dropdown)'],
            ['Product Type', '❌', 'ประเภทผลิตภัณฑ์ (Dropdown)'],
            ['Tabs', '❌', 'แท็บ (Dropdown)'],
            ['Customer Site', '❌', 'Customer-Site (Dropdown)'],
            ['Status', '✅', 'Active/Inactive'],
          ]}
        />

        <Subsection title="การนำเข้า Parts จาก Excel" />
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'คลิกปุ่ม "Import Parts" ด้านบนตาราง',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิก "Download Template (.xlsx)" เพื่อดาวน์โหลดไฟล์ Template (Parts_Template.xlsx)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'กรอกข้อมูลใน Excel ตาม Template — คอลัมน์ที่ต้องมี: partno (Part Number)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Upload a file" เลือกไฟล์ Excel (.xlsx) หรือ CSV ที่กรอกแล้ว',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ระบบจะตรวจสอบ Format อัตโนมัติ — หาก Valid ให้คลิก "Import Parts" เพื่อนำเข้า',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'ตรวจสอบผลลัพธ์: จำนวนที่นำเข้าสำเร็จ และรายการที่ล้มเหลว (ถ้ามี)',
              },
            ]}
          >
            <div style={{ background: '#e1f5fe', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#01579b', fontSize: '14px' }}>
                คอลัมน์ใน Template:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#01579b' }}>
                <li><strong>ข้อมูลหลัก:</strong> partno, partno_customer, product_families, versions, customers_site, tab, product_type, customer_driver</li>
                <li><strong>LAR Thresholds:</strong> lar_achieve_threshold, lar_accept_min/max_threshold, lar_abnormal_threshold</li>
                <li><strong>DPPM Thresholds:</strong> dppm_achieve_threshold, dppm_accept_min/max_threshold, dppm_abnormal_threshold</li>
                <li><strong>Underkill Thresholds:</strong> underkill_achieve_threshold, underkill_accept_min/max_threshold, underkill_abnormal_threshold</li>
              </ul>
            </div>
            <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#e65100' }}>
                💡 <strong>หมายเหตุ:</strong> หาก Part Number มีอยู่แล้วในระบบ ระบบจะอัปเดตข้อมูลแทนการสร้างใหม่ (Upsert) — Threshold ที่ไม่ได้กรอกจะใช้ค่า Default
              </p>
            </div>
          </StepBox>
      </Section>

      {/* Fiscal Calendar */}
      <Section title="7. Fiscal Calendar (ปฏิทิน Fiscal Year)">
        <div style={{ background: '#e8f4f8', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>
            ปฏิทิน Fiscal Year ตามรูปแบบ Seagate แสดงสัปดาห์ทำงาน (Work Week) 52 สัปดาห์
            เริ่มวันเสาร์ที่ใกล้ 1 กรกฎาคมที่สุด แบ่งเป็น 4 ไตรมาส (FQ1-FQ4) แสดงด้วยสีที่แตกต่างกัน
          </p>
        </div>

        <Subsection title="ฟีเจอร์หลัก">
          <List
            items={[
              '📅 เลือกดู Fiscal Year ที่ต้องการ',
              '🎨 แสดงปฏิทินแบบ Grid พร้อมสี FQ1-FQ4',
              '✏️ แก้ไข Year-Month ของแต่ละสัปดาห์ผ่าน Modal',
              '➕ สร้าง Fiscal Year ใหม่ผ่าน Modal (กำหนดจำนวนสัปดาห์และวันเริ่มต้น)',
            ]}
          />
        </Subsection>
      </Section>

      {/* Users */}
      <Section title="8. Users (ผู้ใช้งานระบบ)">
        <div style={{ background: '#e8f4f8', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>
            ดูรายละเอียดเพิ่มเติมในบทที่ 8 (การจัดการผู้ใช้งาน)
          </p>
        </div>
        <Table
          headers={['ฟีเจอร์', 'คำอธิบาย']}
          rows={[
            ['ค้นหา', 'ค้นหาด้วย Username หรือชื่อ'],
            ['กรอง', 'กรองตาม Role (admin/manager/user/viewer) และ Active Status'],
            ['เรียงลำดับ', 'เรียงลำดับตามคอลัมน์'],
            ['แบ่งหน้า', 'Pagination สำหรับข้อมูลจำนวนมาก'],
            ['เพิ่ม/แก้ไข', 'ใช้ Modal Form สำหรับเพิ่มและแก้ไขผู้ใช้'],
          ]}
        />
      </Section>

      {/* Defect Image Management */}
      <Section title="9. Defect Image Management (จัดการรูปภาพข้อบกพร่อง)">
        <div style={{ background: '#f8d7da', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#721c24' }}>
            ⚠️ เฉพาะ Admin เท่านั้น | เข้าถึงผ่าน URL โดยตรง: /master-data/defect-images
          </p>
        </div>
        <Table
          headers={['ฟีเจอร์', 'คำอธิบาย']}
          rows={[
            ['2 ตาราง', 'จัดการ defect_image และ defect_customer_image แยกกัน (Tabbed View)'],
            ['ดูรูปภาพ', 'Preview รูปภาพข้อบกพร่อง'],
            ['Optimize', 'ปรับขนาดรูปภาพอัตโนมัติ (สูงสุด 2048px, คุณภาพ 92%)'],
            ['Bulk Optimize', 'ปรับขนาดรูปภาพทั้งหมดพร้อมกัน (แสดง Progress)'],
            ['สถิติ', 'แสดงจำนวนรูปภาพและพื้นที่ใช้งาน'],
          ]}
        />
      </Section>

      {/* Common Operations */}
      <Section title="การทำงานทั่วไป (สำหรับหน้า CRUD)">
        <Subsection title="การเพิ่มข้อมูลใหม่">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ไปที่หน้า Master Data ที่ต้องการ',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "+ Add New"',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'กรอกข้อมูลที่จำเป็นในฟอร์ม',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Save" เพื่อบันทึก',
              },
            ]}
          />
        </Subsection>

        <Subsection title="การแก้ไข / ลบข้อมูล">
          <List
            items={[
              '✏️ คลิกปุ่ม "Edit" (ไอคอนดินสอ) เพื่อแก้ไข',
              '🗑️ คลิกปุ่ม "Delete" เพื่อลบ (ระบบจะแจ้งเตือนถ้ามีข้อมูลเชื่อมโยง)',
              '🔄 ใช้ Status Active/Inactive แทนการลบเมื่อเป็นไปได้',
            ]}
          />
        </Subsection>
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <List
          items={[
            '✅ ใช้รหัสที่มีระบบ (เช่น CUST001, CUST002)',
            '✅ ตรวจสอบข้อมูลก่อนนำเข้าจาก Excel (Parts)',
            '✅ ใช้ Status Active/Inactive แทนการลบ',
            '✅ อัปเดทข้อมูลให้เป็นปัจจุบันเสมอ',
            '✅ ตรวจสอบ Fiscal Calendar ต้นปีงบประมาณใหม่',
            '✅ Optimize รูปภาพข้อบกพร่องเป็นประจำ',
            '✅ ตั้งชื่อที่ชัดเจน เข้าใจง่าย',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ไม่สามารถลบข้อมูลได้', 'ข้อมูลนี้ถูกใช้งานอยู่ ใช้ Deactivate แทน'],
            ['Import Excel ล้มเหลว', 'ตรวจสอบ Template และรูปแบบข้อมูล'],
            ['ข้อมูลซ้ำ', 'ตรวจสอบ Code ที่ไม่ซ้ำ'],
            ['ไม่สามารถบันทึกได้', 'ตรวจสอบฟิลด์ที่จำเป็น (*) ให้ครบ'],
            ['Dropdown ไม่มีตัวเลือก', 'ตรวจสอบว่าข้อมูลหลักที่เกี่ยวข้อง (เช่น Customer) ถูกเพิ่มแล้ว'],
            ['ไม่เห็นเมนู Master Data', 'ต้องเป็น Admin หรือ Manager'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>ทรัพยากร:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>📖 บทที่ 10-13 - คู่มือรายละเอียดแต่ละหน้า</li>
          <li>👨‍💼 Data Administrator - ติดต่อสอบถาม</li>
          <li>🔧 IT Support - สำหรับปัญหาทางเทคนิค</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T16_MasterdataPage;
