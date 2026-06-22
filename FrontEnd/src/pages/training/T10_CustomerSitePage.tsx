// client/src/pages/training/T10_CustomerSitePage.tsx
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
 * Customer-Site Master Data Management Training Page
 *
 * Quick Reference Card #10: การจัดการข้อมูล Customer-Site Master Data
 */
const T10_CustomerSitePage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={10}
      totalCards={48}
      title="การจัดการข้อมูล Customer-Site Master Data"
      subtitle="Customer-Site Master Data Management"
      icon="🏢"
      nextLink="/training/parts"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมการจัดการ Customer-Site Master Data">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '16px' }}>
            📋 Customer-Site Master Data คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#0d47a1' }}>
            Customer-Site Master Data คือข้อมูลหลักที่เก็บความสัมพันธ์ระหว่าง Customer (ลูกค้า) และ Site (สถานที่/โรงงาน)
            ใช้สำหรับการจัดการและเชื่อมโยงข้อมูลการผลิตและการตรวจสอบคุณภาพสำหรับลูกค้าแต่ละรายในแต่ละสถานที่
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/10_CustomerSite_Overview.png"
            alt="Customer-Site Master Data Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการจัดการ Customer-Site Master Data
          </p>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🎯 ฟีเจอร์หลักของหน้านี้:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Create:</strong> เพิ่ม Customer-Site ใหม่ (Insert)</li>
            <li><strong>Update:</strong> แก้ไขข้อมูล Customer-Site ที่มีอยู่</li>
            <li><strong>Delete:</strong> ลบ Customer-Site ที่ไม่ใช้งาน</li>
            <li><strong>Toggle Status:</strong> เปลี่ยนสถานะ Active/Inactive</li>
            <li><strong>Search & Filter:</strong> ค้นหาและกรองข้อมูลตามเงื่อนไข</li>
            <li><strong>Bulk Operations:</strong> จัดการหลายรายการพร้อมกัน</li>
          </ul>
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🏗️ โครงสร้างข้อมูล Customer-Site:
          </p>
          <Table
            headers={['ฟิลด์', 'ประเภท', 'คำอธิบาย', 'Required']}
            rows={[
              ['Customer Code', 'Dropdown (Select)', 'รหัสลูกค้า จาก Customer Master Data', '✅'],
              ['Site Code', 'Dropdown (Select)', 'รหัสสถานที่ จาก System Configuration', '✅'],
              ['Code', 'Text (Auto)', 'รหัส Customer-Site (สร้างอัตโนมัติ)', '✅'],
              ['Is Active', 'Checkbox', 'สถานะการใช้งาน (Active/Inactive)', '❌'],
            ]}
          />
        </div>
      </Section>

      {/* Section 2: Navigation */}
      <Section title="การเข้าถึงหน้า Customer-Site Management">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Master Data" → เลือก "Customer-Site"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะแสดงหน้า Customer-Site Management พร้อมรายการข้อมูลทั้งหมด',
            },
          ]}
        />
      </Section>

      {/* Section 3: Page Layout */}
      <Section title="โครงสร้างหน้าจอ (Page Layout)">
        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📐 ส่วนประกอบของหน้า (3 ส่วนหลัก):
          </p>
          <div style={{ fontSize: '14px', color: '#1a237e', lineHeight: '1.8' }}>
            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>1. Header Section (ด้านบน):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Breadcrumb:</strong> Master Data → Customer-Sites</li>
              <li><strong>Title:</strong> "Customer-Site Management" พร้อมไอคอน 🏢</li>
              <li><strong>Statistics:</strong> Total, Active, Inactive counts</li>
              <li><strong>Action Buttons:</strong> Export, Import (ถ้ามี)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>2. Embedded Form Section (กลาง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Form Title:</strong> "🏢 Customer-Site Information"</li>
              <li><strong>Form Fields:</strong> Customer Code, Site Code, Code, Is Active (4-column layout)</li>
              <li><strong>Action Buttons:</strong> Create/Update, Clear</li>
              <li><strong>Mode Indicator:</strong> "Adding new" หรือ "Editing: {code}"</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>3. Data Table Section (ด้านล่าง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Search Bar:</strong> ค้นหาโดย code, customer, site, names</li>
              <li><strong>Status Filter:</strong> All / Active / Inactive</li>
              <li><strong>Data Table:</strong> แสดงรายการ Customer-Site ทั้งหมด</li>
              <li><strong>Pagination:</strong> แบ่งหน้า (20 items per page)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Section 4: CREATE Operation */}
      <Section title="การเพิ่ม Customer-Site ใหม่ (CREATE / INSERT)">
        <Subsection title="➕ ขั้นตอนการเพิ่มข้อมูล" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📝 Step-by-Step การสร้าง Customer-Site ใหม่:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ตรวจสอบว่าฟอร์มอยู่ในโหมด "Adding new customer-site" (สีเขียว)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'เลือก Customer Code จาก dropdown (แสดงรายการลูกค้าทั้งหมดที่ Active)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'เลือก Site Code จาก dropdown (แสดงรายการ Site จาก System Configuration)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ฟิลด์ "Code" จะถูกสร้างอัตโนมัติจาก {customer_code}_{site_code} (readonly)',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ติ๊ก "Is Active" ถ้าต้องการให้ Customer-Site นี้ Active ทันที (default: checked)',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'คลิกปุ่ม "Create Customer-Site" สีเขียว',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'ระบบจะ validate ข้อมูล: ตรวจสอบว่า Customer Code + Site Code ไม่ซ้ำ',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'หากสำเร็จ แสดง Success message และ reload ตาราง + ล้างฟอร์ม',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ⚡ การทำงานอัตโนมัติของระบบ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Auto-generate Code:</strong> Code = customer_code + "_" + site_code (เช่น "CUST001_SITE01")</li>
            <li><strong>Validation:</strong> ตรวจสอบว่า Code ไม่ซ้ำในระบบ</li>
            <li><strong>Default Active:</strong> Is Active = true (checked) เป็นค่าเริ่มต้น</li>
            <li><strong>Real-time Feedback:</strong> แสดง validation errors ทันที (ถ้ามี)</li>
          </ul>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ⚠️ Validation Rules (กฎการ Validate):
          </p>
          <Table
            headers={['ฟิลด์', 'กฎ', 'ข้อความแจ้งเตือน']}
            rows={[
              ['Customer Code', 'Required', '"Customer code is required"'],
              ['Site Code', 'Required', '"Site code is required"'],
              ['Code', 'Unique, Max 10 chars', '"Customer-site code already exists"'],
              ['Combination', 'Unique (customer + site)', '"This customer-site combination already exists"'],
            ]}
          />
        </div>
      </Section>

      {/* Section 5: READ/VIEW Operation */}
      <Section title="การดูและค้นหาข้อมูล (READ / VIEW)">
        <Subsection title="📊 Data Table - รายการ Customer-Site" />

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📋 คอลัมน์ที่แสดงในตาราง (5 คอลัมน์):
          </p>
          <Table
            headers={['คอลัมน์', 'คำอธิบาย', 'รูปแบบการแสดงผล', 'Sortable']}
            rows={[
              ['Customer', 'รหัสลูกค้า', 'Badge สีน้ำเงิน (bg-blue-100)', '✅'],
              ['Customer Name', 'ชื่อลูกค้า', 'Text สีเทาเข้ม', '❌'],
              ['Site', 'รหัสสถานที่', 'Badge สีเขียว (bg-green-100)', '✅'],
              ['Code', 'รหัส Customer-Site', 'Badge สีม่วง (bg-purple-100)', '✅'],
              ['Status', 'สถานะ Active/Inactive', 'Badge สีเขียว/แดง', '✅'],
            ]}
          />
        </div>

        <Subsection title="🔍 Search & Filter (การค้นหาและกรองข้อมูล)" />

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🔎 Search Bar - ช่องค้นหา:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a148c' }}>
            <li><strong>Placeholder:</strong> "Search by code, customer, site, or names..."</li>
            <li><strong>Searchable Fields:</strong> Code (weight: 4), Customer Code (weight: 3), Site Code (weight: 3), Customer Name (weight: 1)</li>
            <li><strong>Debounce:</strong> 300ms (รอ 0.3 วินาที หลังพิมพ์เสร็จจึงค้นหา)</li>
            <li><strong>Min Length:</strong> 1 ตัวอักษร</li>
            <li><strong>Case Insensitive:</strong> ไม่สนใจตัวพิมพ์เล็ก/ใหญ่</li>
            <li><strong>Highlighting:</strong> ไฮไลท์คำที่ค้นหาในผลลัพธ์</li>
          </ul>
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🎚️ Status Filter - ตัวกรองสถานะ:
          </p>
          <Table
            headers={['ตัวเลือก', 'คำอธิบาย', 'ผลลัพธ์']}
            rows={[
              ['All Customer-Sites', 'แสดงทั้งหมด', 'แสดง Active และ Inactive ทั้งหมด'],
              ['Active ✓', 'แสดงเฉพาะที่ใช้งาน', 'แสดงเฉพาะ is_active = true'],
              ['Inactive ✗', 'แสดงเฉพาะที่ไม่ใช้งาน', 'แสดงเฉพาะ is_active = false'],
            ]}
          />
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🔢 Sorting (การเรียงลำดับ):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>คลิกที่หัวคอลัมน์:</strong> เพื่อเรียงลำดับตามคอลัมน์นั้น (Customer, Site, Code, Status)</li>
            <li><strong>▲ Ascending:</strong> เรียงจากน้อยไปมาก (A-Z, 0-9, false-true)</li>
            <li><strong>▼ Descending:</strong> เรียงจากมากไปน้อย (Z-A, 9-0, true-false)</li>
            <li><strong>Toggle:</strong> คลิกซ้ำเพื่อสลับทิศทาง</li>
          </ul>
        </div>

        <Subsection title="📄 Pagination (การแบ่งหน้า)" />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            📖 การใช้งาน Pagination:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Items Per Page:</strong> 20 รายการต่อหน้า (default)</li>
            <li><strong>Navigation:</strong> ใช้ปุ่มลูกศร (Previous / Next) หรือคลิกเลขหน้าโดยตรง</li>
            <li><strong>Info Display:</strong> "Showing X to Y of Z customer-sites"</li>
            <li><strong>Auto Scroll:</strong> เลื่อนขึ้นบนสุดอัตโนมัติเมื่อเปลี่ยนหน้า</li>
          </ul>
        </div>
      </Section>

      {/* Section 6: UPDATE Operation */}
      <Section title="การแก้ไขข้อมูล Customer-Site (UPDATE / EDIT)">
        <Subsection title="✏️ ขั้นตอนการแก้ไขข้อมูล" />

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            📝 Step-by-Step การแก้ไข Customer-Site:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหารายการ Customer-Site ที่ต้องการแก้ไขในตาราง (ใช้ Search หรือ Filter)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Edit" (ดินสอสีน้ำเงิน) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ฟอร์มจะเปลี่ยนเป็นโหมด "Editing" พร้อมแสดง Code ที่กำลังแก้ไข (สีส้ม)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ข้อมูลปัจจุบันจะถูกโหลดเข้าฟอร์มอัตโนมัติ',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'แก้ไขข้อมูลที่ต้องการ: Customer Code, Site Code, หรือ Is Active',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: '⚠️ หมายเหตุ: ฟิลด์ "Code" ไม่สามารถแก้ไขได้ (readonly)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'คลิกปุ่ม "Update Customer-Site" สีส้ม',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'หากสำเร็จ แสดง Success message, reload ตาราง, และกลับสู่โหมด "Adding new"',
              },
            ]}
          />
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            🔄 การ Cancel Edit (ยกเลิกการแก้ไข):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#01579b' }}>
            <li><strong>คลิกปุ่ม "Clear":</strong> ล้างฟอร์มและกลับสู่โหมด "Adding new"</li>
            <li><strong>ไม่มีการบันทึก:</strong> ข้อมูลเดิมจะไม่ถูกเปลี่ยนแปลง</li>
            <li><strong>ฟอร์มรีเซ็ต:</strong> ฟิลด์ทั้งหมดจะว่างเปล่า</li>
          </ul>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ⚠️ ข้อควรระวังเมื่อแก้ไข:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#7f0000' }}>
            <li><strong>Code ไม่สามารถแก้ไขได้:</strong> หากต้องการเปลี่ยน Code ต้องลบและสร้างใหม่</li>
            <li><strong>ตรวจสอบความเกี่ยวข้อง:</strong> การเปลี่ยน Customer หรือ Site อาจส่งผลต่อข้อมูลอื่น</li>
            <li><strong>Validation ยังทำงาน:</strong> ระบบยังตรวจสอบว่า Customer-Site combination ไม่ซ้ำ</li>
            <li><strong>ไม่สามารถแก้ไขซ้ำหลายคนพร้อมกัน:</strong> ระวัง race condition</li>
          </ul>
        </div>
      </Section>

      {/* Section 7: DELETE Operation */}
      <Section title="การลบข้อมูล Customer-Site (DELETE)">
        <Subsection title="🗑️ ขั้นตอนการลบข้อมูล" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ❌ Step-by-Step การลบ Customer-Site:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหารายการ Customer-Site ที่ต้องการลบในตาราง',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Delete" (ถังขยะสีแดง) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'จะมี Confirmation Dialog ปรากฏขึ้น: "Are you sure you want to delete this customer-site?"',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Confirm" เพื่อยืนยันการลบ หรือ "Cancel" เพื่อยกเลิก',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'หากยืนยัน ระบบจะลบข้อมูลจากฐานข้อมูล',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'แสดง Success message: "Customer-site deleted successfully"',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'Reload ตารางและอัปเดตสถิติ (Total, Active, Inactive)',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ⚠️ ข้อควรระวังก่อนลบ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>ข้อมูลจะถูกลบถาวร:</strong> ไม่สามารถกู้คืนได้ (Permanent Delete)</li>
            <li><strong>ตรวจสอบความเกี่ยวข้อง:</strong> ตรวจสอบว่าไม่มีข้อมูลอื่นอ้างอิงถึง Customer-Site นี้</li>
            <li><strong>แนะนำ Inactive แทน Delete:</strong> ในกรณีส่วนใหญ่ควรใช้ Toggle Status เป็น Inactive แทนการลบ</li>
            <li><strong>Foreign Key Constraints:</strong> หากมี FK constraints ระบบจะไม่ให้ลบและแสดง Error</li>
          </ul>
        </div>

        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            💡 Best Practice - ใช้ Inactive แทน Delete:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#0d47a1' }}>
            <li><strong>เก็บ History:</strong> ข้อมูลยังคงอยู่ในระบบเพื่อการตรวจสอบย้อนหลัง</li>
            <li><strong>ป้องกัน Data Loss:</strong> หลีกเลี่ยงการสูญเสียข้อมูลโดยไม่ตั้งใจ</li>
            <li><strong>สามารถ Reactivate:</strong> สามารถเปิดใช้งานใหม่ได้ถ้าจำเป็น</li>
            <li><strong>เป็นไปตามมาตรฐาน:</strong> Soft Delete เป็น Best Practice ใน Enterprise Systems</li>
          </ul>
        </div>
      </Section>

      {/* Section 8: TOGGLE STATUS Operation */}
      <Section title="การเปลี่ยนสถานะ (TOGGLE STATUS)">
        <Subsection title="🔄 การเปลี่ยนสถานะ Active/Inactive" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🔀 ขั้นตอนการเปลี่ยนสถานะ (แบบรายการเดียว):
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหารายการ Customer-Site ที่ต้องการเปลี่ยนสถานะ',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Toggle Status" (สวิตช์สีเขียว/แดง) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'จะมี Confirmation Dialog: "Toggle status for this customer-site?"',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Confirm" เพื่อเปลี่ยนสถานะ (Active ↔ Inactive)',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'แสดง Success message และ reload ตาราง',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'Status badge จะเปลี่ยนสี: Active (เขียว) ↔ Inactive (แดง)',
              },
            ]}
          />
        </div>

        <Subsection title="📦 Bulk Status Toggle (เปลี่ยนสถานะหลายรายการ)" />

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            ⚡ ขั้นตอนการเปลี่ยนสถานะหลายรายการพร้อมกัน:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ติ๊ก Checkbox หน้ารายการ Customer-Site ที่ต้องการเปลี่ยนสถานะ',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'สามารถติ๊ก Checkbox ที่หัวตารางเพื่อเลือกทั้งหน้า',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'เมื่อเลือกแล้ว ปุ่ม "Toggle Status (X selected)" จะปรากฏที่ด้านบน',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิกปุ่ม "Toggle Status" → ยืนยันการเปลี่ยนสถานะ',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ระบบจะเปลี่ยนสถานะทีละรายการในพื้นหลัง',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'แสดงผลลัพธ์: "Successfully toggled status for X customer-site(s)"',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            💡 ข้อควรทราบเกี่ยวกับ Toggle Status:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>ไม่ลบข้อมูล:</strong> เปลี่ยนเฉพาะค่า is_active (true ↔ false)</li>
            <li><strong>Instant Effect:</strong> การเปลี่ยนสถานะมีผลทันที</li>
            <li><strong>Reversible:</strong> สามารถเปลี่ยนกลับได้ทุกเวลา</li>
            <li><strong>Filter Integration:</strong> สามารถใช้ Status Filter เพื่อดู Active/Inactive แยกกัน</li>
            <li><strong>Statistics Update:</strong> ตัวเลขสถิติ (Active/Inactive counts) จะอัปเดตทันที</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            🎯 Use Cases สำหรับ Toggle Status:
          </p>
          <Table
            headers={['สถานการณ์', 'การดำเนินการ']}
            rows={[
              ['ลูกค้าหยุดใช้งานชั่วคราว', 'Toggle เป็น Inactive แทนการลบ'],
              ['เปิดใช้งาน Site ใหม่', 'Toggle เป็น Active เมื่อพร้อมใช้งาน'],
              ['ปิด Customer-Site ที่ไม่ Active', 'Bulk Toggle หลายรายการเป็น Inactive'],
              ['Testing/Maintenance', 'Toggle เป็น Inactive ระหว่าง maintenance'],
            ]}
          />
        </div>
      </Section>

      {/* Section 9: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'สร้าง Customer-Site ไม่สำเร็จ',
              'ตรวจสอบ: (1) เลือก Customer และ Site ครบ (2) Code ไม่ซ้ำ (3) Combination ไม่ซ้ำ',
            ],
            [
              'Customer หรือ Site dropdown ว่างเปล่า',
              'ตรวจสอบว่ามีข้อมูล Customer Master Data และ Site Configuration ในระบบ',
            ],
            [
              'แก้ไขข้อมูลไม่สำเร็จ',
              'ตรวจสอบว่า: (1) มีสิทธิ์แก้ไข (2) Customer-Site ยังอยู่ในระบบ (3) ไม่มี Validation Error',
            ],
            [
              'ลบข้อมูลไม่ได้',
              'อาจมีข้อมูลอื่นอ้างอิงถึง Customer-Site นี้ - ใช้ Toggle Status แทน',
            ],
            [
              'Search ไม่พบข้อมูล',
              'ตรวจสอบ: (1) สะกดถูกต้อง (2) Status Filter (All/Active/Inactive) (3) ข้อมูลอยู่ในระบบ',
            ],
            [
              'Toggle Status ไม่ทำงาน',
              'ตรวจสอบสิทธิ์ - รีเฟรชหน้า (F5) - ติดต่อ Admin',
            ],
            [
              'Bulk Toggle ล้มเหลวบางรายการ',
              'ดู Error Message - บางรายการอาจมี constraints - ลองทีละรายการ',
            ],
            [
              'Code ไม่ถูกสร้างอัตโนมัติ',
              'ตรวจสอบว่าเลือกทั้ง Customer Code และ Site Code แล้ว - รีเฟรชหน้า',
            ],
            [
              'ตารางไม่แสดงข้อมูล',
              'ตรวจสอบ Status Filter - ล้าง Search - รีเฟรชหน้า (F5)',
            ],
            [
              'ปุ่ม Create/Update Disabled',
              'ตรวจสอบว่ากรอกข้อมูล Required fields ครบ (Customer Code, Site Code)',
            ],
          ]}
        />
      </Section>

      {/* Section 10: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี (Best Practices)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            ✅ การจัดการ Master Data อย่างมีประสิทธิภาพ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li><strong>ใช้ Naming Convention:</strong> ใช้รูปแบบการตั้งชื่อที่สอดคล้องกัน</li>
            <li><strong>ตรวจสอบก่อนสร้าง:</strong> ตรวจสอบว่ายังไม่มี Customer-Site นี้ในระบบ</li>
            <li><strong>ใช้ Inactive แทน Delete:</strong> เปลี่ยนสถานะแทนการลบเพื่อเก็บ history</li>
            <li><strong>Bulk Operations:</strong> ใช้ Bulk Toggle เมื่อต้องการเปลี่ยนสถานะหลายรายการ</li>
            <li><strong>Regular Review:</strong> ทบทวนข้อมูลเป็นประจำ ลบหรือ Inactive ข้อมูลที่ไม่ใช้</li>
            <li><strong>Documentation:</strong> บันทึกเหตุผลเมื่อเปลี่ยนสถานะหรือลบข้อมูลสำคัญ</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '16px' }}>
            💡 เคล็ดลับการใช้งาน:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
            <li><strong>Search เพื่อหาข้อมูล:</strong> ใช้ Search bar ค้นหาเร็วกว่าเลื่อนหา</li>
            <li><strong>Filter ตามสถานะ:</strong> ใช้ Status Filter เพื่อแยก Active/Inactive</li>
            <li><strong>Sort ข้อมูล:</strong> คลิกหัวคอลัมน์เพื่อเรียงลำดับตามต้องการ</li>
            <li><strong>Keyboard Shortcuts:</strong> ใช้ Tab เพื่อเคลื่อนที่ระหว่างฟิลด์ในฟอร์ม</li>
            <li><strong>Clear Form:</strong> คลิก Clear เพื่อล้างฟอร์มและเริ่มใหม่</li>
            <li><strong>Check Validation:</strong> สังเกต Validation Errors ก่อนบันทึก</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            🎯 ประโยชน์ของการจัดการ Customer-Site Master Data ที่ดี:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#5d4037' }}>
            <li><strong>Data Accuracy:</strong> ข้อมูลถูกต้อง ครบถ้วน ไม่ซ้ำซ้อน</li>
            <li><strong>Operational Efficiency:</strong> ค้นหาและใช้งานได้รวดเร็ว</li>
            <li><strong>Reporting:</strong> รายงานมีความแม่นยำและเชื่อถือได้</li>
            <li><strong>Integration:</strong> เชื่อมโยงกับระบบอื่นได้อย่างราบรื่น</li>
            <li><strong>Compliance:</strong> ปฏิบัติตามมาตรฐานการจัดการข้อมูล</li>
            <li><strong>Scalability:</strong> รองรับการขยายธุรกิจในอนาคต</li>
          </ul>
        </div>
      </Section>

      {/* Section 11: Statistics Dashboard */}
      <Section title="Dashboard และสถิติ (Statistics)">
        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📊 สถิติที่แสดงในหน้า:
          </p>
          <Table
            headers={['สถิติ', 'คำอธิบาย', 'การคำนวณ']}
            rows={[
              ['Total', 'จำนวน Customer-Site ทั้งหมด', 'นับทั้ง Active และ Inactive'],
              ['Active', 'จำนวน Customer-Site ที่ใช้งาน', 'นับเฉพาะ is_active = true'],
              ['Inactive', 'จำนวน Customer-Site ที่ไม่ใช้งาน', 'นับเฉพาะ is_active = false'],
            ]}
          />
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📈 การใช้งานสถิติ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li><strong>Overview:</strong> ดูภาพรวมของข้อมูล Customer-Site ทั้งหมด</li>
            <li><strong>Health Check:</strong> ตรวจสอบอัตราส่วน Active/Inactive</li>
            <li><strong>Quick Filter:</strong> คลิกที่ตัวเลขเพื่อกรองข้อมูล (ถ้ามีฟีเจอร์)</li>
            <li><strong>Real-time Update:</strong> สถิติอัปเดตทันทีเมื่อมีการเปลี่ยนแปลงข้อมูล</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
        <p style={{ marginTop: '10px' }}>หรือดูคู่มือการใช้งานเพิ่มเติมในเมนู Training</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>สำหรับ Master Data อื่น ๆ:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Customer Master Data</li>
          <li>Site Configuration</li>
          <li>Defect Master Data</li>
          <li>Inspection Configuration</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T10_CustomerSitePage;
