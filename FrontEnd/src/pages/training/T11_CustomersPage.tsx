// client/src/pages/training/T11_CustomersPage.tsx
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
 * Customers Master Data Management Training Page
 *
 * Quick Reference Card #11: การจัดการข้อมูล Customers Master Data
 */
const T11_CustomersPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={11}
      totalCards={48}
      title="การจัดการข้อมูล Customers Master Data"
      subtitle="Customers Master Data Management"
      icon="👥"
      nextLink="/training/sampling-reasons"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมการจัดการ Customers Master Data">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '16px' }}>
            📋 Customers Master Data คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#0d47a1' }}>
            Customers Master Data คือข้อมูลหลักของลูกค้าทั้งหมดในระบบ ใช้สำหรับการจัดการข้อมูลลูกค้า
            เชื่อมโยงกับการผลิต การตรวจสอบคุณภาพ และการจัดส่งสินค้า เป็นข้อมูลพื้นฐานที่สำคัญสำหรับระบบทั้งหมด
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/11_Customers_Overview.png"
            alt="Customers Master Data Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการจัดการ Customers Master Data
          </p>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🎯 ฟีเจอร์หลักของหน้านี้:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Create:</strong> เพิ่มลูกค้าใหม่ (Insert)</li>
            <li><strong>Read:</strong> ดูรายการและค้นหาลูกค้า (View/Search)</li>
            <li><strong>Update:</strong> แก้ไขข้อมูลลูกค้าที่มีอยู่</li>
            <li><strong>Delete:</strong> ลบลูกค้าที่ไม่ใช้งาน</li>
            <li><strong>Toggle Status:</strong> เปลี่ยนสถานะ Active/Inactive</li>
            <li><strong>Bulk Operations:</strong> จัดการหลายรายการพร้อมกัน</li>
          </ul>
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🏗️ โครงสร้างข้อมูล Customer:
          </p>
          <Table
            headers={['ฟิลด์', 'ประเภท', 'คำอธิบาย', 'Required', 'Validation']}
            rows={[
              ['Code', 'Text (VARCHAR 5)', 'รหัสลูกค้า (Primary Key)', '✅', '1-5 chars, A-Z, 0-9'],
              ['Name', 'Text (VARCHAR 100)', 'ชื่อลูกค้า', '✅', '1-100 characters'],
              ['Is Active', 'Checkbox (Boolean)', 'สถานะการใช้งาน', '❌', 'true/false'],
            ]}
          />
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ⚡ ข้อกำหนดสำคัญของ Customer Code:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Length:</strong> 1-5 ตัวอักษร (ไม่น้อยกว่า 1, ไม่เกิน 5)</li>
            <li><strong>Format:</strong> ตัวพิมพ์ใหญ่ (A-Z) และตัวเลข (0-9) เท่านั้น</li>
            <li><strong>Examples:</strong> CUS01, MAIN, CORP, ABC, 12345</li>
            <li><strong>Invalid:</strong> cus01 (lowercase), CUS-01 (special chars), TOLONG (มากกว่า 5 ตัวอักษร)</li>
            <li><strong>Unique:</strong> ต้องไม่ซ้ำกันในระบบ (Primary Key)</li>
          </ul>
        </div>
      </Section>

      {/* Section 2: Navigation */}
      <Section title="การเข้าถึงหน้า Customers Management">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Master Data" → เลือก "Customers"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะแสดงหน้า Customers Management พร้อมรายการลูกค้าทั้งหมด',
            },
          ]}
        />

        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📍 Breadcrumb Navigation:
          </p>
          <div style={{ padding: '10px', background: 'white', borderRadius: '5px', fontFamily: 'monospace', color: '#424242' }}>
            Home → Master Data → Customers
          </div>
        </div>
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
              <li><strong>Breadcrumb:</strong> Home → Master Data → Customers</li>
              <li><strong>Title:</strong> "Customer Management" พร้อมไอคอน 👥</li>
              <li><strong>Statistics Cards:</strong> Total, Active, Inactive counts (พร้อมไอคอนและสี)</li>
              <li><strong>Action Buttons:</strong> Export, Import (ถ้ามี)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>2. Form Section (กลาง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Mode Indicator:</strong> "Adding new customer" (สีเขียว) หรือ "Editing: code" (สีส้ม)</li>
              <li><strong>Customer Code Field:</strong> Text input (uppercase, alphanumeric, 1-5 chars)</li>
              <li><strong>Customer Name Field:</strong> Text input (any text, 1-100 chars)</li>
              <li><strong>Is Active Checkbox:</strong> Toggle Active/Inactive (default: checked)</li>
              <li><strong>Action Buttons:</strong> Create/Update (สีเขียว/ส้ม), Clear (สีเทา)</li>
              <li><strong>Validation Messages:</strong> Real-time error display</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>3. Data Table Section (ด้านล่าง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Search Bar:</strong> ค้นหาโดย Customer Code หรือ Name</li>
              <li><strong>Status Filter Tabs:</strong> All Customers / Active / Inactive</li>
              <li><strong>Data Table:</strong> แสดง Code, Name, Status, Actions (Edit, Delete, Toggle)</li>
              <li><strong>Bulk Selection:</strong> Checkbox เพื่อเลือกหลายรายการ</li>
              <li><strong>Pagination:</strong> แบ่งหน้าพร้อมตัวเลขและลูกศร</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Section 4: CREATE Operation */}
      <Section title="การเพิ่มลูกค้าใหม่ (CREATE / INSERT)">
        <Subsection title="➕ ขั้นตอนการเพิ่มข้อมูล" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📝 Step-by-Step การสร้างลูกค้าใหม่:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ตรวจสอบว่าฟอร์มอยู่ในโหมด "Adding new customer" (แถบสีเขียว)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'กรอก "Customer Code": ตัวพิมพ์ใหญ่และตัวเลข 1-5 ตัวอักษร (เช่น CUS01, MAIN)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'กรอก "Customer Name": ชื่อลูกค้าเต็ม 1-100 ตัวอักษร (เช่น Main Customer Corp)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ติ๊ก "Is Active" ถ้าต้องการให้ลูกค้านี้ Active ทันที (default: checked)',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ระบบจะ validate แบบ Real-time: แสดง ✓ (ถูก) หรือ ✗ (ผิด) พร้อม error message',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'คลิกปุ่ม "Create Customer" สีเขียว (ปุ่มจะ disable ถ้ามี validation errors)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'ระบบจะ validate ข้อมูล: ตรวจสอบว่า Code ไม่ซ้ำ และรูปแบบถูกต้อง',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'หากสำเร็จ: แสดง Success toast, reload ตาราง, ล้างฟอร์ม, อัปเดตสถิติ',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ⚡ Real-time Validation (การ Validate แบบทันที):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>พิมพ์ไปเช็คไป:</strong> ระบบตรวจสอบทันทีที่พิมพ์ (ไม่ต้องรอกด Submit)</li>
            <li><strong>สีและไอคอน:</strong> ✓ สีเขียว (ถูกต้อง), ✗ สีแดง (ผิดพลาด)</li>
            <li><strong>Error Message:</strong> แสดงข้อความบอกปัญหาและวิธีแก้ไข</li>
            <li><strong>Button State:</strong> ปุ่ม Create จะ disable ถ้ามี errors หรือฟิลด์ required ว่าง</li>
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
              ['Customer Code', 'Min 1 char', '"Customer code must be at least 1 character"'],
              ['Customer Code', 'Max 5 chars', '"Customer code must not exceed 5 characters"'],
              ['Customer Code', 'Pattern: ^[A-Z0-9]+$', '"Customer code must contain only uppercase letters and numbers (1-5 characters)"'],
              ['Customer Code', 'Unique', '"Customer code already exists"'],
              ['Customer Name', 'Required', '"Customer name is required"'],
              ['Customer Name', 'Min 1 char', '"Customer name must be at least 1 character"'],
              ['Customer Name', 'Max 100 chars', '"Customer name must not exceed 100 characters"'],
            ]}
          />
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📝 ตัวอย่าง Customer Codes ที่ถูกต้อง:
          </p>
          <Table
            headers={['Customer Code', 'Customer Name', 'Valid?', 'หมายเหตุ']}
            rows={[
              ['CUS01', 'Customer One Corp', '✅', 'ถูกต้อง: 5 chars, uppercase + number'],
              ['MAIN', 'Main Customer', '✅', 'ถูกต้อง: 4 chars, uppercase only'],
              ['A', 'Customer A', '✅', 'ถูกต้อง: 1 char, uppercase'],
              ['12345', 'Numeric Customer', '✅', 'ถูกต้อง: 5 chars, numbers only'],
              ['ABC', 'ABC Manufacturing', '✅', 'ถูกต้อง: 3 chars, uppercase'],
              ['cus01', 'Customer One', '❌', 'ผิด: ตัวพิมพ์เล็ก (ต้องเป็น CUS01)'],
              ['CUS-01', 'Customer Dash', '❌', 'ผิด: มี special character (-)'],
              ['TOOLONG', 'Too Long Name', '❌', 'ผิด: เกิน 5 ตัวอักษร'],
              ['', 'Empty Code', '❌', 'ผิด: ต้องกรอก Code'],
            ]}
          />
        </div>
      </Section>

      {/* Section 5: READ/VIEW Operation */}
      <Section title="การดูและค้นหาข้อมูล (READ / VIEW)">
        <Subsection title="📊 Data Table - รายการลูกค้า" />

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📋 คอลัมน์ที่แสดงในตาราง:
          </p>
          <Table
            headers={['คอลัมน์', 'คำอธิบาย', 'รูปแบบการแสดงผล', 'Sortable']}
            rows={[
              ['#', 'หมายเลขลำดับ', 'ตัวเลขเรียงลำดับ (1, 2, 3, ...)', '❌'],
              ['Code', 'รหัสลูกค้า', 'Badge สีน้ำเงิน (bg-blue-100)', '✅'],
              ['Name', 'ชื่อลูกค้า', 'Text สีเทาเข้ม (font-medium)', '✅'],
              ['Status', 'สถานะ Active/Inactive', 'Badge สีเขียว/แดง', '✅'],
              ['Actions', 'ปุ่มจัดการ', 'Edit (ดินสอ), Delete (ถังขยะ), Toggle (สวิตช์)', '❌'],
            ]}
          />
        </div>

        <Subsection title="🔍 Search & Filter (การค้นหาและกรองข้อมูล)" />

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🔎 Search Bar - ช่องค้นหา:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a148c' }}>
            <li><strong>Placeholder:</strong> "Search customers by code or name..."</li>
            <li><strong>Searchable Fields:</strong> Customer Code (weight: 1.0), Customer Name (weight: 0.8)</li>
            <li><strong>Weighted Search:</strong> ผลลัพธ์ที่ตรงกับ Code จะแสดงก่อนผลลัพธ์ที่ตรงกับ Name</li>
            <li><strong>Debounce:</strong> 300ms (รอ 0.3 วินาที หลังพิมพ์เสร็จจึงค้นหา)</li>
            <li><strong>Min Length:</strong> 1 ตัวอักษร (ค้นหาได้ทันทีที่พิมพ์อักษรแรก)</li>
            <li><strong>Case Insensitive:</strong> ไม่สนใจตัวพิมพ์เล็ก/ใหญ่ (CUS = cus = Cus)</li>
            <li><strong>Highlighting:</strong> ไฮไลท์คำที่ค้นหาในผลลัพธ์</li>
            <li><strong>Max Results:</strong> แสดงสูงสุด 100 รายการ</li>
          </ul>
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🎚️ Status Filter Tabs - ตัวกรองสถานะ:
          </p>
          <Table
            headers={['Tab', 'คำอธิบาย', 'ไอคอน', 'ผลลัพธ์']}
            rows={[
              ['All Customers', 'แสดงทั้งหมด', '📋', 'แสดงทั้ง Active และ Inactive'],
              ['Active Customers', 'แสดงเฉพาะที่ใช้งาน', '✓', 'แสดงเฉพาะ is_active = true'],
              ['Inactive Customers', 'แสดงเฉพาะที่ไม่ใช้งาน', '✗', 'แสดงเฉพาะ is_active = false'],
            ]}
          />
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🔢 Sorting (การเรียงลำดับ):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>คลิกที่หัวคอลัมน์:</strong> Code, Name, หรือ Status เพื่อเรียงลำดับ</li>
            <li><strong>▲ Ascending:</strong> A → Z, 0 → 9, false → true</li>
            <li><strong>▼ Descending:</strong> Z → A, 9 → 0, true → false</li>
            <li><strong>Toggle:</strong> คลิกซ้ำเพื่อสลับทิศทาง</li>
            <li><strong>Visual Indicator:</strong> ลูกศรปรากฏที่หัวคอลัมน์ที่กำลังเรียง</li>
          </ul>
        </div>

        <Subsection title="📄 Pagination (การแบ่งหน้า)" />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            📖 การใช้งาน Pagination:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Items Per Page:</strong> กำหนดได้ตามต้องการ (default: 20 items)</li>
            <li><strong>Page Numbers:</strong> แสดงเลขหน้าแบบคลิกได้ (1, 2, 3, ...)</li>
            <li><strong>Previous/Next:</strong> ปุ่มลูกศร ◀ และ ▶ สำหรับเลื่อนหน้า</li>
            <li><strong>Current Page:</strong> หน้าปัจจุบันจะมีสีเน้น (highlighted)</li>
            <li><strong>Info Display:</strong> "Showing X to Y of Z customers"</li>
            <li><strong>Auto Scroll:</strong> เลื่อนขึ้นบนสุดอัตโนมัติเมื่อเปลี่ยนหน้า</li>
            <li><strong>Disabled State:</strong> ปุ่มจะ disable เมื่ออยู่หน้าแรก/สุดท้าย</li>
          </ul>
        </div>
      </Section>

      {/* Section 6: UPDATE Operation */}
      <Section title="การแก้ไขข้อมูลลูกค้า (UPDATE / EDIT)">
        <Subsection title="✏️ ขั้นตอนการแก้ไขข้อมูล" />

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            📝 Step-by-Step การแก้ไขลูกค้า:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหาลูกค้าที่ต้องการแก้ไขในตาราง (ใช้ Search หรือ Filter)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Edit" (ดินสอสีน้ำเงิน) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ฟอร์มจะเปลี่ยนเป็นโหมด "Editing" พร้อมแสดง Code ที่กำลังแก้ (แถบสีส้ม)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ข้อมูลปัจจุบันจะถูกโหลดเข้าฟอร์มอัตโนมัติ: Code (readonly), Name, Is Active',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'แก้ไขข้อมูลที่ต้องการ: Customer Name หรือ Is Active',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: '⚠️ หมายเหตุ: ฟิลด์ "Customer Code" ไม่สามารถแก้ไขได้ (readonly)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'ระบบจะ validate แบบ Real-time: แสดง ✓/✗ และ error messages',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'คลิกปุ่ม "Update Customer" สีส้ม',
              },
              {
                label: 'ขั้นตอนที่ 9',
                description: 'หากสำเร็จ: แสดง Success toast, reload ตาราง, กลับสู่โหมด "Adding new"',
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
            <li><strong>Mode Change:</strong> แถบสีจะเปลี่ยนจากส้ม (Editing) เป็นเขียว (Adding new)</li>
          </ul>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ⚠️ ข้อควรระวังเมื่อแก้ไข:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#7f0000' }}>
            <li><strong>Code ไม่สามารถแก้ไขได้:</strong> หากต้องการเปลี่ยน Code ต้องลบและสร้างใหม่</li>
            <li><strong>ตรวจสอบการใช้งาน:</strong> การเปลี่ยน Name อาจส่งผลต่อรายงานและข้อมูลอื่น ๆ</li>
            <li><strong>Validation ยังทำงาน:</strong> Name ต้องมี 1-100 characters</li>
            <li><strong>สิทธิ์การแก้ไข:</strong> ตรวจสอบว่ามีสิทธิ์แก้ไขข้อมูล Customer หรือไม่</li>
          </ul>
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            💡 กรณีการใช้งาน Edit:
          </p>
          <Table
            headers={['สถานการณ์', 'การดำเนินการ']}
            rows={[
              ['แก้ไขชื่อลูกค้า', 'Edit → เปลี่ยน Name → Update'],
              ['แก้ไขสะกดผิด', 'Edit → แก้ไข Name → Update'],
              ['เปลี่ยนสถานะ', 'สามารถใช้ Toggle Status หรือ Edit → เปลี่ยน Is Active → Update'],
              ['เปลี่ยน Code', '❌ ไม่สามารถทำได้ → ต้องลบและสร้างใหม่'],
            ]}
          />
        </div>
      </Section>

      {/* Section 7: DELETE Operation */}
      <Section title="การลบข้อมูลลูกค้า (DELETE)">
        <Subsection title="🗑️ ขั้นตอนการลบข้อมูล" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ❌ Step-by-Step การลบลูกค้า:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหาลูกค้าที่ต้องการลบในตาราง',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Delete" (ถังขยะสีแดง) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'จะมี Confirmation Dialog ปรากฏขึ้น: "Are you sure you want to delete customer {code}?"',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'แสดงข้อมูลลูกค้าที่จะลบ: Code และ Name',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'คลิก "Confirm" เพื่อยืนยันการลบ หรือ "Cancel" เพื่อยกเลิก',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'หากยืนยัน ระบบจะลบข้อมูลจากฐานข้อมูล (Permanent Delete)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'แสดง Success toast: "Customer deleted successfully"',
              },
              {
                label: 'ขั้นตอนที่ 8',
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
            <li><strong>ตรวจสอบ Foreign Key:</strong> หากมีข้อมูลอื่นอ้างอิงถึง Customer นี้ การลบจะล้มเหลว</li>
            <li><strong>ตัวอย่าง FK:</strong> Customer-Site, Production Orders, Shipments, Invoices</li>
            <li><strong>Error Message:</strong> "Cannot delete customer: referenced by other records"</li>
            <li><strong>แนะนำ Inactive:</strong> ในกรณีส่วนใหญ่ควรใช้ Toggle Status เป็น Inactive แทน</li>
          </ul>
        </div>

        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            💡 Best Practice - ใช้ Inactive แทน Delete:
          </p>
          <Table
            headers={['Delete', 'vs', 'Inactive']}
            rows={[
              ['ลบข้อมูลถาวร', '↔', 'เก็บข้อมูลไว้'],
              ['ไม่สามารถกู้คืน', '↔', 'สามารถ Reactivate ได้'],
              ['อาจทำให้ FK error', '↔', 'ไม่มีปัญหา FK'],
              ['สูญเสีย History', '↔', 'เก็บ History ไว้'],
              ['ใช้เมื่อ: ข้อมูลผิดพลาด', '↔', 'ใช้เมื่อ: ไม่ใช้งานชั่วคราว'],
            ]}
          />
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
                description: 'ค้นหาลูกค้าที่ต้องการเปลี่ยนสถานะในตาราง',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Toggle Status" (สวิตช์สีเขียว/แดง) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'จะมี Confirmation Dialog: "Toggle status for customer {code}?"',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Confirm" เพื่อเปลี่ยนสถานะ (Active ↔ Inactive)',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'แสดง Success toast: "Customer status updated successfully"',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'Status badge จะเปลี่ยนสีทันที: Active (เขียว) ↔ Inactive (แดง)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'สถิติจะอัปเดตอัตโนมัติ (Active/Inactive counts)',
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
                description: 'ติ๊ก Checkbox หน้ารายการลูกค้าที่ต้องการเปลี่ยนสถานะ',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'สามารถติ๊ก Checkbox ที่หัวตารางเพื่อเลือกทั้งหน้า (Select All)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'เมื่อเลือกแล้ว ปุ่ม "Toggle Status (X selected)" จะปรากฏที่ด้านบน',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'แสดงจำนวนรายการที่เลือก (เช่น "Toggle Status (5 selected)")',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'คลิกปุ่ม "Toggle Status" → ยืนยันการเปลี่ยนสถานะ',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'ระบบจะเปลี่ยนสถานะทีละรายการในพื้นหลัง (Sequential processing)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'แสดงผลลัพธ์: "Successfully toggled status for X customer(s)"',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'Reload ตารางและอัปเดตสถิติ, ล้างการเลือก (Clear selection)',
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
            <li><strong>Reversible:</strong> สามารถเปลี่ยนกลับได้ทุกเวลา (Toggle)</li>
            <li><strong>System Impact:</strong> Inactive customers จะไม่แสดงใน dropdown/selection lists</li>
            <li><strong>Reporting:</strong> สามารถกรองรายงานตาม Active/Inactive</li>
            <li><strong>Audit Trail:</strong> ระบบบันทึก timestamp การเปลี่ยนสถานะ</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            🎯 Use Cases สำหรับ Toggle Status:
          </p>
          <Table
            headers={['สถานการณ์', 'การดำเนินการ']}
            rows={[
              ['ลูกค้าหยุดสั่งชั่วคราว', 'Toggle เป็น Inactive แทนการลบ'],
              ['ลูกค้ากลับมาใช้งาน', 'Toggle เป็น Active เมื่อเริ่มสั่งอีกครั้ง'],
              ['ปิดลูกค้าที่ไม่ Active (Bulk)', 'Select หลายรายการ → Bulk Toggle เป็น Inactive'],
              ['Testing/Maintenance', 'Toggle เป็น Inactive ระหว่าง maintenance'],
              ['End of Contract', 'Toggle เป็น Inactive แทนการลบ (เก็บ history)'],
            ]}
          />
        </div>
      </Section>

      {/* Section 9: Statistics Dashboard */}
      <Section title="Dashboard และสถิติ (Statistics)">
        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📊 สถิติที่แสดงในหน้า (3 Cards):
          </p>
          <Table
            headers={['สถิติ', 'คำอธิบาย', 'ไอคอน', 'สี']}
            rows={[
              ['Total', 'จำนวนลูกค้าทั้งหมด (Active + Inactive)', '📋', 'สีน้ำเงิน'],
              ['Active', 'จำนวนลูกค้าที่ใช้งาน (is_active = true)', '✓', 'สีเขียว'],
              ['Inactive', 'จำนวนลูกค้าที่ไม่ใช้งาน (is_active = false)', '✗', 'สีแดง'],
            ]}
          />
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📈 การใช้งานสถิติ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li><strong>Overview:</strong> ดูภาพรวมของข้อมูลลูกค้าทั้งหมด</li>
            <li><strong>Health Check:</strong> ตรวจสอบอัตราส่วน Active/Inactive</li>
            <li><strong>Quick Filter:</strong> คลิกที่ Card (ถ้ามีฟีเจอร์) เพื่อกรองข้อมูล</li>
            <li><strong>Real-time Update:</strong> สถิติอัปเดตทันทีเมื่อมีการเปลี่ยนแปลง (Create, Delete, Toggle)</li>
            <li><strong>Visual Indicators:</strong> สีและไอคอนช่วยให้เข้าใจง่าย</li>
          </ul>
        </div>
      </Section>

      {/* Section 10: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'สร้างลูกค้าไม่สำเร็จ',
              'ตรวจสอบ: (1) Code ตัวพิมพ์ใหญ่เท่านั้น (2) Code 1-5 chars (3) Code ไม่ซ้ำ (4) Name 1-100 chars',
            ],
            [
              'Code ไม่ผ่าน Validation',
              'ตรวจสอบว่า: Code เป็น A-Z และ 0-9 เท่านั้น, ไม่มีตัวพิมพ์เล็ก, ไม่มี special characters',
            ],
            [
              'แก้ไขข้อมูลไม่สำเร็จ',
              'ตรวจสอบ: (1) มีสิทธิ์แก้ไข (2) Customer ยังอยู่ในระบบ (3) Name validation ผ่าน',
            ],
            [
              'ไม่สามารถแก้ไข Code',
              'Code เป็น Primary Key ไม่สามารถแก้ไขได้ - ต้องลบและสร้างใหม่',
            ],
            [
              'ลบข้อมูลไม่ได้ (FK Error)',
              'มีข้อมูลอื่นอ้างอิงถึง Customer นี้ - ใช้ Toggle Status เป็น Inactive แทน',
            ],
            [
              'Search ไม่พบข้อมูล',
              'ตรวจสอบ: (1) สะกดถูกต้อง (2) Status Filter (All/Active/Inactive) (3) Case-insensitive',
            ],
            [
              'Toggle Status ไม่ทำงาน',
              'ตรวจสอบสิทธิ์ - รีเฟรชหน้า (F5) - ดู Console errors - ติดต่อ Admin',
            ],
            [
              'Bulk Toggle ล้มเหลวบางรายการ',
              'ดู Error Message - บางรายการอาจมีปัญหา - ลองทีละรายการ',
            ],
            [
              'สถิติไม่ถูกต้อง',
              'รีเฟรชหน้า (F5) - ตรวจสอบ API response - Clear cache - ติดต่อ Admin',
            ],
            [
              'ตารางไม่แสดงข้อมูล',
              'ตรวจสอบ: (1) Status Filter (2) Search query (3) Pagination (4) รีเฟรชหน้า',
            ],
            [
              'ปุ่ม Create Disabled',
              'ตรวจสอบว่ากรอก Code และ Name ครบ และผ่าน Validation ทั้งหมด',
            ],
            [
              'Real-time Validation ไม่ทำงาน',
              'รีเฟรชหน้า (F5) - ล้าง Browser Cache - ลองใน Incognito mode',
            ],
          ]}
        />
      </Section>

      {/* Section 11: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี (Best Practices)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            ✅ การจัดการ Customers Master Data อย่างมีประสิทธิภาพ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li><strong>Code Naming Convention:</strong> ใช้รูปแบบที่สม่ำเสมอ เช่น CUS01, CUS02, ... หรือ A, B, C, ...</li>
            <li><strong>ตรวจสอบก่อนสร้าง:</strong> Search หา Customer Code ก่อนเพื่อป้องกันการสร้างซ้ำ</li>
            <li><strong>ใช้ Inactive แทน Delete:</strong> เก็บ history และป้องกัน FK errors</li>
            <li><strong>Name Standards:</strong> ใช้ชื่อเต็มและชัดเจน (เช่น "ABC Manufacturing Co., Ltd.")</li>
            <li><strong>Regular Review:</strong> ทบทวนข้อมูลเป็นประจำ Inactive ลูกค้าที่ไม่ใช้งาน</li>
            <li><strong>Bulk Operations:</strong> ใช้ Bulk Toggle เมื่อต้องการเปลี่ยนสถานะหลายรายการ</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '16px' }}>
            💡 เคล็ดลับการใช้งาน:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
            <li><strong>Real-time Validation:</strong> ดู Validation errors ขณะพิมพ์เพื่อแก้ไขทันที</li>
            <li><strong>Search Efficiently:</strong> ค้นหาทั้ง Code และ Name (ไม่สนใจตัวพิมพ์เล็ก/ใหญ่)</li>
            <li><strong>Use Status Filter:</strong> กรอง Active/Inactive เพื่อจัดการข้อมูลแต่ละกลุ่ม</li>
            <li><strong>Keyboard Shortcuts:</strong> Tab เพื่อเคลื่อนที่ระหว่างฟิลด์, Enter เพื่อ Submit</li>
            <li><strong>Clear Form:</strong> คลิก Clear เพื่อล้างฟอร์มและเริ่มใหม่</li>
            <li><strong>Pagination:</strong> ใช้เลขหน้าเพื่อกระโดดไปหน้าที่ต้องการโดยตรง</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            🎯 ประโยชน์ของการจัดการ Customers Master Data ที่ดี:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#5d4037' }}>
            <li><strong>Data Accuracy:</strong> ข้อมูลลูกค้าถูกต้อง ครบถ้วน ไม่ซ้ำซ้อน</li>
            <li><strong>Operational Efficiency:</strong> ค้นหาและใช้งานได้รวดเร็ว</li>
            <li><strong>Integration:</strong> เชื่อมโยงกับระบบอื่นได้อย่างราบรื่น (Production, Shipping, Billing)</li>
            <li><strong>Reporting:</strong> รายงานมีความแม่นยำและเชื่อถือได้</li>
            <li><strong>Customer Service:</strong> ให้บริการลูกค้าได้อย่างมีประสิทธิภาพ</li>
            <li><strong>Compliance:</strong> ปฏิบัติตามมาตรฐานการจัดการข้อมูล</li>
            <li><strong>Scalability:</strong> รองรับการขยายธุรกิจและลูกค้าใหม่</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
        <p style={{ marginTop: '10px' }}>หรือดูคู่มือการใช้งานเพิ่มเติมในเมนู Training</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Master Data ที่เกี่ยวข้อง:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Customer-Site (เชื่อมโยง Customer กับ Site)</li>
          <li>Site Configuration (ข้อมูล Site/โรงงาน)</li>
          <li>Production Orders (คำสั่งผลิตสำหรับลูกค้า)</li>
          <li>Shipments (การจัดส่งให้ลูกค้า)</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T11_CustomersPage;
