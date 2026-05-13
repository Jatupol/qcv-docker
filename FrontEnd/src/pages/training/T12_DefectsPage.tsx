// client/src/pages/training/T12_DefectsPage.tsx
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
 * Defects Master Data Management Training Page
 *
 * Quick Reference Card #12: การจัดการข้อมูล Defects Master Data
 */
const T12_DefectsPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={12}
      totalCards={48}
      title="การจัดการข้อมูล Defects Master Data"
      subtitle="Defects Master Data Management"
      icon="⚠️"
      nextLink="/training/t10"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมการจัดการ Defects Master Data">
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            📋 Defects Master Data คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#5d4037' }}>
            Defects Master Data คือข้อมูลหลักของประเภท Defect (ข้อบกพร่อง) ทั้งหมดในระบบ
            ใช้สำหรับบันทึกและจำแนกประเภทข้อบกพร่องที่พบในกระบวนการตรวจสอบคุณภาพ
            ช่วยให้สามารถวิเคราะห์และติดตามปัญหาคุณภาพได้อย่างเป็นระบบ
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/12_Defects_Overview.png"
            alt="Defects Master Data Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการจัดการ Defects Master Data
          </p>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            🎯 ฟีเจอร์หลักของหน้านี้:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#7f0000' }}>
            <li><strong>Create:</strong> เพิ่มประเภท Defect ใหม่ (Insert)</li>
            <li><strong>Read:</strong> ดูรายการและค้นหา Defects (View/Search)</li>
            <li><strong>Update:</strong> แก้ไขข้อมูล Defect ที่มีอยู่</li>
            <li><strong>Delete:</strong> ลบ Defect ที่ไม่ใช้งาน</li>
            <li><strong>Toggle Status:</strong> เปลี่ยนสถานะ Active/Inactive</li>
            <li><strong>Defect Group Filter:</strong> กรองตาม Defect Group</li>
            <li><strong>Bulk Operations:</strong> จัดการหลายรายการพร้อมกัน</li>
          </ul>
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🏗️ โครงสร้างข้อมูล Defect:
          </p>
          <Table
            headers={['ฟิลด์', 'ประเภท', 'คำอธิบาย', 'Required', 'Validation']}
            rows={[
              ['ID', 'SERIAL (Integer)', 'รหัส Defect (Auto-generated)', '✅', 'Auto-increment (1-2147483647)'],
              ['Name', 'Text (VARCHAR 100)', 'ชื่อ Defect', '✅', '3-100 chars, alphanumeric + punctuation'],
              ['Description', 'Text (VARCHAR 1000)', 'รายละเอียด Defect', '❌', '0-1000 characters (optional)'],
              ['Defect Group', 'Text (VARCHAR 100)', 'กลุ่ม Defect', '❌', 'Select or custom input'],
              ['Is Active', 'Checkbox (Boolean)', 'สถานะการใช้งาน', '❌', 'true/false (default: true)'],
            ]}
          />
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            ⚡ คุณสมบัติพิเศษของหน้า Defects:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li><strong>Auto-generated ID:</strong> ไม่ต้องกรอก ID ระบบจะสร้างอัตโนมัติ (SERIAL)</li>
            <li><strong>Defect Group Dropdown:</strong> กรองข้อมูลตาม Defect Group ที่ด้านบน</li>
            <li><strong>Flexible Group Input:</strong> สามารถเลือก Group จาก dropdown หรือพิมพ์ใหม่ได้</li>
            <li><strong>Pattern Validation:</strong> Name ต้องเป็น letters, numbers, spaces, และ punctuation</li>
            <li><strong>Group Auto-load:</strong> ระบบจะดึง Defect Groups จากข้อมูลที่มีอยู่มาแสดงใน dropdown</li>
          </ul>
        </div>
      </Section>

      {/* Section 2: Navigation */}
      <Section title="การเข้าถึงหน้า Defects Management">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Master Data" → เลือก "Defects"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะแสดงหน้า Defects Management พร้อมรายการ Defects ทั้งหมด',
            },
          ]}
        />

        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📍 Breadcrumb Navigation:
          </p>
          <div style={{ padding: '10px', background: 'white', borderRadius: '5px', fontFamily: 'monospace', color: '#424242' }}>
            Home → Master Data → Defects
          </div>
        </div>
      </Section>

      {/* Section 3: Page Layout */}
      <Section title="โครงสร้างหน้าจอ (Page Layout)">
        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📐 ส่วนประกอบของหน้า (4 ส่วนหลัก):
          </p>
          <div style={{ fontSize: '14px', color: '#1a237e', lineHeight: '1.8' }}>
            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>1. Header Section (ด้านบน):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Breadcrumb:</strong> Home → Master Data → Defects</li>
              <li><strong>Title:</strong> "Defect Management" พร้อมไอคอน ⚠️</li>
              <li><strong>Statistics Cards:</strong> Total, Active, Inactive counts (สีส้ม-แดง theme)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>2. Defect Group Filter (ด้านบน ใต้ Header):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Dropdown:</strong> "All Groups" หรือเลือก Defect Group เฉพาะ</li>
              <li><strong>Dynamic Options:</strong> โหลด Groups จากข้อมูลที่มีอยู่</li>
              <li><strong>Debug Info:</strong> แสดงจำนวน Groups และ Group ที่เลือก</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>3. Form Section (กลาง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Mode Indicator:</strong> "Adding new defect" (เขียว) หรือ "Editing: {name}" (ส้ม)</li>
              <li><strong>ID Field:</strong> Auto-generated (readonly, ไม่ต้องกรอก)</li>
              <li><strong>Name Field:</strong> Text input (3-100 chars, pattern validation)</li>
              <li><strong>Description Field:</strong> Textarea (0-1000 chars, optional)</li>
              <li><strong>Defect Group Field:</strong> Dropdown หรือ Text input (มีปุ่มสลับ ↓/+)</li>
              <li><strong>Is Active Checkbox:</strong> Toggle Active/Inactive (default: checked)</li>
              <li><strong>Action Buttons:</strong> Create/Update (สีส้ม), Clear (สีเทา)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>4. Data Table Section (ด้านล่าง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li><strong>Search Bar:</strong> ค้นหาโดย ID, Name, Description, Defect Group</li>
              <li><strong>Status Filter Tabs:</strong> All Defects / Active / Inactive</li>
              <li><strong>Data Table:</strong> แสดง ID, Name, Description, Defect Group, Status, Actions</li>
              <li><strong>Bulk Selection:</strong> Checkbox เพื่อเลือกหลายรายการ</li>
              <li><strong>Pagination:</strong> แบ่งหน้าพร้อมตัวเลขและลูกศร</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Section 4: CREATE Operation */}
      <Section title="การเพิ่ม Defect ใหม่ (CREATE / INSERT)">
        <Subsection title="➕ ขั้นตอนการเพิ่มข้อมูล" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📝 Step-by-Step การสร้าง Defect ใหม่:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ตรวจสอบว่าฟอร์มอยู่ในโหมด "Adding new defect" (แถบสีเขียว)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'ฟิลด์ "ID" จะแสดง "Auto-generated ID" (ระบบจะสร้าง ID อัตโนมัติ)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'กรอก "Name": ชื่อ Defect 3-100 ตัวอักษร (เช่น Surface Scratch, Dimensional Error)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'กรอก "Description" (Optional): รายละเอียด Defect 0-1000 ตัวอักษร',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'เลือก "Defect Group": (1) เลือกจาก dropdown หรือ (2) คลิก + เพื่อพิมพ์ Group ใหม่',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'ติ๊ก "Is Active" ถ้าต้องการให้ Defect นี้ Active ทันที (default: checked)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'ระบบจะ validate แบบ Real-time: แสดง ✓ (ถูก) หรือ ✗ (ผิด) พร้อม error message',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'คลิกปุ่ม "Create Defect" สีส้ม (ปุ่มจะ disable ถ้ามี validation errors)',
              },
              {
                label: 'ขั้นตอนที่ 9',
                description: 'หากสำเร็จ: แสดง Success toast, reload ตาราง, ล้างฟอร์ม, อัปเดตสถิติ',
              },
            ]}
          />
        </div>

        <Subsection title="🔄 การใช้ Defect Group Field (คุณสมบัติพิเศษ)" />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            🎛️ Defect Group - Dropdown Mode (โหมดเลือก):
          </p>
          <StepBox
            steps={[
              {
                label: 'Default Mode',
                description: 'ฟิลด์จะเป็น Dropdown พร้อมปุ่ม + สีส้มทางขวา',
              },
              {
                label: 'Select Group',
                description: 'เลือก Defect Group จาก dropdown (เช่น VISUAL, FUNCTIONAL, DIMENSIONAL)',
              },
              {
                label: 'Options',
                description: 'Dropdown แสดง Groups ที่มีอยู่ในระบบ (ดึงจากข้อมูล Defects ปัจจุบัน)',
              },
              {
                label: 'Empty Option',
                description: '"-- Select Group --" เป็น default option (ไม่เลือก Group)',
              },
            ]}
          />
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            ✏️ Defect Group - Custom Input Mode (โหมดพิมพ์):
          </p>
          <StepBox
            steps={[
              {
                label: 'คลิกปุ่ม +',
                description: 'คลิกปุ่ม + สีส้มเพื่อสลับเป็นโหมด Text Input',
              },
              {
                label: 'พิมพ์ Group ใหม่',
                description: 'กล่องข้อความจะปรากฏ พิมพ์ชื่อ Defect Group ใหม่ (เช่น PACKAGING)',
              },
              {
                label: 'Max Length',
                description: 'จำกัด 100 ตัวอักษร (maxLength=100)',
              },
              {
                label: 'คลิกปุ่ม ↓',
                description: 'คลิกปุ่ม ↓ สีเทาเพื่อสลับกลับเป็นโหมด Dropdown',
              },
            ]}
          />
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ⚠️ Validation Rules (กฎการ Validate):
          </p>
          <Table
            headers={['ฟิลด์', 'กฎ', 'ข้อความแจ้งเตือน']}
            rows={[
              ['ID', 'Auto-generated (SERIAL)', 'ไม่ต้องกรอก, ระบบจะสร้างอัตโนมัติ'],
              ['Name', 'Required', '"Defect name is required"'],
              ['Name', 'Min 3 chars', '"Defect name must be at least 3 characters"'],
              ['Name', 'Max 100 chars', '"Defect name must not exceed 100 characters"'],
              ['Name', 'Pattern: ^[a-zA-Z0-9\\s\\-_.,()]+$', '"Name can only contain letters, numbers, spaces, and common punctuation (-, _, ., , ())"'],
              ['Description', 'Optional', 'ไม่บังคับกรอก'],
              ['Description', 'Max 1000 chars', '"Description must not exceed 1000 characters"'],
              ['Defect Group', 'Optional', 'ไม่บังคับกรอก, สามารถเว้นว่างได้'],
            ]}
          />
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            📝 ตัวอย่าง Defect Names ที่ถูกต้อง:
          </p>
          <Table
            headers={['Defect Name', 'Defect Group', 'Valid?', 'หมายเหตุ']}
            rows={[
              ['Surface Scratch', 'VISUAL', '✅', 'ถูกต้อง: มี space และ letters'],
              ['Dimensional Error', 'DIMENSIONAL', '✅', 'ถูกต้อง: มี space'],
              ['Missing Part (A1)', 'ASSEMBLY', '✅', 'ถูกต้อง: มี () และ numbers'],
              ['Crack-Type-01', 'STRUCTURAL', '✅', 'ถูกต้อง: มี - และ numbers'],
              ['Color_Mismatch', 'VISUAL', '✅', 'ถูกต้อง: มี _ และ letters'],
              ['Dent, Minor', 'PHYSICAL', '✅', 'ถูกต้อง: มี , และ space'],
              ['AB', '', '❌', 'ผิด: น้อยกว่า 3 ตัวอักษร'],
              ['Defect#123', '', '❌', 'ผิด: มี # (special char ไม่ได้)'],
              ['Scratçh', '', '❌', 'ผิด: มีตัวอักษรพิเศษ (ç)'],
            ]}
          />
        </div>
      </Section>

      {/* Section 5: Defect Group Filter */}
      <Section title="การใช้ Defect Group Filter (กรองตามกลุ่ม)">
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🎚️ ขั้นตอนการใช้ Defect Group Filter:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'มองหา Dropdown "All Groups" ที่อยู่ด้านบนของตาราง (ใต้ Statistics Cards)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกที่ Dropdown จะแสดงรายการ Defect Groups ทั้งหมด',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'เลือก Defect Group ที่ต้องการกรอง (เช่น VISUAL, FUNCTIONAL)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ตารางจะแสดงเฉพาะ Defects ที่อยู่ใน Group ที่เลือก',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'เลือก "All Groups" เพื่อแสดงข้อมูลทั้งหมด (ล้าง Filter)',
              },
            ]}
          />
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            💡 ข้อมูลที่แสดงใน Defect Group Filter:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li><strong>Dynamic Loading:</strong> ระบบจะดึง Defect Groups ที่มีอยู่จากข้อมูล Defects</li>
            <li><strong>Unique Groups:</strong> แสดงเฉพาะ Groups ที่ไม่ซ้ำกัน</li>
            <li><strong>Sorted:</strong> เรียงลำดับตามตัวอักษร (A-Z)</li>
            <li><strong>Debug Info:</strong> แสดงจำนวน Groups และ Group ที่เลือก (เช่น "Groups: 5 | Selected: VISUAL")</li>
            <li><strong>Real-time Update:</strong> Filter ทำงานทันทีที่เลือก</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            🎯 Use Cases สำหรับ Defect Group Filter:
          </p>
          <Table
            headers={['สถานการณ์', 'การดำเนินการ']}
            rows={[
              ['ดู Defects ประเภท VISUAL', 'เลือก "VISUAL" จาก dropdown'],
              ['ตรวจสอบ DIMENSIONAL Defects', 'เลือก "DIMENSIONAL" จาก dropdown'],
              ['วิเคราะห์ FUNCTIONAL Issues', 'เลือก "FUNCTIONAL" จาก dropdown'],
              ['ดูข้อมูลทั้งหมด', 'เลือก "All Groups"'],
              ['นับจำนวน Defects แต่ละ Group', 'เลือก Group แล้วดูจำนวนรายการที่แสดง'],
            ]}
          />
        </div>
      </Section>

      {/* Section 6: READ/VIEW Operation */}
      <Section title="การดูและค้นหาข้อมูล (READ / VIEW)">
        <Subsection title="📊 Data Table - รายการ Defects" />

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📋 คอลัมน์ที่แสดงในตาราง (6 คอลัมน์):
          </p>
          <Table
            headers={['คอลัมน์', 'คำอธิบาย', 'รูปแบบการแสดงผล', 'Sortable']}
            rows={[
              ['#', 'หมายเลขลำดับ', 'ตัวเลขเรียงลำดับ (1, 2, 3, ...)', '❌'],
              ['ID', 'รหัส Defect (SERIAL)', 'ตัวเลข (1, 2, 3, ...)', '✅'],
              ['Name', 'ชื่อ Defect', 'Text สีเทาเข้ม (font-medium)', '✅'],
              ['Description', 'รายละเอียด Defect', 'Text สีเทา (truncated if long)', '✅'],
              ['Defect Group', 'กลุ่ม Defect', 'Text สีเทาเข้ม (หรือ - ถ้าว่าง)', '✅'],
              ['Status', 'สถานะ Active/Inactive', 'Badge สีเขียว/แดง', '✅'],
              ['Actions', 'ปุ่มจัดการ', 'Edit (ดินสอ), Delete (ถังขยะ), Toggle (สวิตช์)', '❌'],
            ]}
          />
        </div>

        <Subsection title="🔍 Search & Filter" />

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🔎 Search Bar - ช่องค้นหา:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a148c' }}>
            <li><strong>Searchable Fields:</strong> ID, Name, Description, Defect Group</li>
            <li><strong>Multi-field Search:</strong> ค้นหาได้ทุกฟิลด์พร้อมกัน</li>
            <li><strong>Case Insensitive:</strong> ไม่สนใจตัวพิมพ์เล็ก/ใหญ่</li>
            <li><strong>Real-time Search:</strong> ผลลัพธ์อัปเดตทันทีที่พิมพ์</li>
            <li><strong>Combined Filters:</strong> ทำงานร่วมกับ Status Filter และ Defect Group Filter</li>
          </ul>
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🎚️ Status Filter Tabs:
          </p>
          <Table
            headers={['Tab', 'คำอธิบาย', 'ไอคอน', 'ผลลัพธ์']}
            rows={[
              ['All Defects', 'แสดงทั้งหมด', '📋', 'แสดงทั้ง Active และ Inactive'],
              ['Active Defects', 'แสดงเฉพาะที่ใช้งาน', '✓', 'แสดงเฉพาะ is_active = true'],
              ['Inactive Defects', 'แสดงเฉพาะที่ไม่ใช้งาน', '✗', 'แสดงเฉพาะ is_active = false'],
            ]}
          />
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            🔢 การใช้ Filters ร่วมกัน (Combined Filtering):
          </p>
          <Table
            headers={['Filter 1', 'Filter 2', 'Filter 3', 'ผลลัพธ์']}
            rows={[
              ['Active Tab', 'VISUAL Group', 'Search: "scratch"', 'แสดงเฉพาะ Active VISUAL Defects ที่มีคำว่า "scratch"'],
              ['Inactive Tab', 'All Groups', 'Search: ""', 'แสดงทุก Inactive Defects'],
              ['All Tab', 'FUNCTIONAL', 'Search: "error"', 'แสดงทุก FUNCTIONAL Defects (Active+Inactive) ที่มีคำว่า "error"'],
            ]}
          />
        </div>
      </Section>

      {/* Section 7: UPDATE Operation */}
      <Section title="การแก้ไขข้อมูล Defect (UPDATE / EDIT)">
        <Subsection title="✏️ ขั้นตอนการแก้ไขข้อมูล" />

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            📝 Step-by-Step การแก้ไข Defect:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหา Defect ที่ต้องการแก้ไขในตาราง (ใช้ Search, Status Filter, หรือ Group Filter)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Edit" (ดินสอสีน้ำเงิน) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ฟอร์มจะเปลี่ยนเป็นโหมด "Editing" พร้อมแสดงชื่อ Defect ที่กำลังแก้ (แถบสีส้ม)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ข้อมูลปัจจุบันจะถูกโหลดเข้าฟอร์มอัตโนมัติ: ID (readonly), Name, Description, Defect Group, Is Active',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'แก้ไขข้อมูลที่ต้องการ: Name, Description, Defect Group, หรือ Is Active',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: '⚠️ หมายเหตุ: ฟิลด์ "ID" ไม่สามารถแก้ไขได้ (readonly, Auto-generated)',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'สามารถสลับระหว่าง Dropdown และ Custom Input ใน Defect Group (ปุ่ม ↓/+)',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'ระบบจะ validate แบบ Real-time: แสดง ✓/✗ และ error messages',
              },
              {
                label: 'ขั้นตอนที่ 9',
                description: 'คลิกปุ่ม "Update Defect" สีส้ม',
              },
              {
                label: 'ขั้นตอนที่ 10',
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
            <li><strong>ID ไม่สามารถแก้ไขได้:</strong> ID เป็น SERIAL PRIMARY KEY</li>
            <li><strong>Name Validation:</strong> ต้องผ่าน pattern validation (alphanumeric + punctuation)</li>
            <li><strong>ตรวจสอบการใช้งาน:</strong> Defect นี้อาจถูกใช้ในการบันทึก Defect Data แล้ว</li>
            <li><strong>Group Change Impact:</strong> การเปลี่ยน Group อาจส่งผลต่อการรายงาน</li>
          </ul>
        </div>
      </Section>

      {/* Section 8: DELETE & TOGGLE STATUS */}
      <Section title="การลบและเปลี่ยนสถานะ (DELETE & TOGGLE STATUS)">
        <Subsection title="🗑️ การลบข้อมูล Defect (DELETE)" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ❌ ขั้นตอนการลบ Defect:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหา Defect ที่ต้องการลบในตาราง',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Delete" (ถังขยะสีแดง) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'จะมี Confirmation Dialog: "Are you sure you want to delete defect {name}?"',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Confirm" เพื่อยืนยันการลบ หรือ "Cancel" เพื่อยกเลิก',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'หากยืนยัน ระบบจะลบข้อมูลจากฐานข้อมูล (Permanent Delete)',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'แสดง Success toast: "Defect deleted successfully"',
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
            <li><strong>Foreign Key Check:</strong> ถ้ามี Defect Data ที่อ้างอิงถึง Defect นี้ จะลบไม่ได้</li>
            <li><strong>Error Message:</strong> "Cannot delete defect: referenced by defect data records"</li>
            <li><strong>แนะนำ Inactive:</strong> ใช้ Toggle Status เป็น Inactive แทนการลบ</li>
          </ul>
        </div>

        <Subsection title="🔄 การเปลี่ยนสถานะ (TOGGLE STATUS)" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🔀 ขั้นตอนการเปลี่ยนสถานะ (Single):
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหา Defect ที่ต้องการเปลี่ยนสถานะ',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "Toggle Status" (สวิตช์สีเขียว/แดง) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'จะมี Confirmation Dialog: "Toggle status for defect {name}?"',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Confirm" เพื่อเปลี่ยนสถานะ (Active ↔ Inactive)',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'แสดง Success toast: "Defect status updated successfully"',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'Status badge จะเปลี่ยนสีทันที: Active (เขียว) ↔ Inactive (แดง)',
              },
            ]}
          />
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            📦 Bulk Toggle Status (เปลี่ยนสถานะหลายรายการ):
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ติ๊ก Checkbox หน้ารายการ Defects ที่ต้องการเปลี่ยนสถานะ',
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
                description: 'แสดงผลลัพธ์: "Successfully toggled status for X defect(s)"',
              },
            ]}
          />
        </div>
      </Section>

      {/* Section 9: Statistics */}
      <Section title="Dashboard และสถิติ (Statistics)">
        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📊 สถิติที่แสดงในหน้า (3 Cards):
          </p>
          <Table
            headers={['สถิติ', 'คำอธิบาย', 'ไอคอน', 'สี Theme']}
            rows={[
              ['Total', 'จำนวน Defects ทั้งหมด (Active + Inactive)', '📋', 'สีส้ม'],
              ['Active', 'จำนวน Defects ที่ใช้งาน (is_active = true)', '✓', 'สีเขียว'],
              ['Inactive', 'จำนวน Defects ที่ไม่ใช้งาน (is_active = false)', '✗', 'สีแดง'],
            ]}
          />
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📈 การใช้งานสถิติ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li><strong>Overview:</strong> ดูภาพรวมของข้อมูล Defects ทั้งหมด</li>
            <li><strong>Health Check:</strong> ตรวจสอบอัตราส่วน Active/Inactive</li>
            <li><strong>Real-time Update:</strong> สถิติอัปเดตทันทีเมื่อมีการเปลี่ยนแปลง</li>
            <li><strong>Color Coded:</strong> สีช่วยให้มองเห็นภาพรวมได้ง่าย</li>
          </ul>
        </div>
      </Section>

      {/* Section 10: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'สร้าง Defect ไม่สำเร็จ',
              'ตรวจสอบ: (1) Name 3-100 chars (2) Pattern validation ผ่าน (3) Description ไม่เกิน 1000 chars',
            ],
            [
              'Name Validation Error',
              'ตรวจสอบว่า: Name มีเฉพาะ letters, numbers, spaces, และ -, _, ., , () เท่านั้น',
            ],
            [
              'Defect Group dropdown ว่างเปล่า',
              'หมายความว่ายังไม่มี Defects ในระบบ หรือ Defects ที่มีไม่มี defect_group',
            ],
            [
              'ไม่สามารถสลับเป็น Custom Input',
              'คลิกปุ่ม + สีส้มทางขวาของ Defect Group dropdown',
            ],
            [
              'ไม่สามารถสลับกลับเป็น Dropdown',
              'คลิกปุ่ม ↓ สีเทาทางขวาของ Text Input',
            ],
            [
              'Group Filter ไม่ทำงาน',
              'รีเฟรชหน้า (F5) - ตรวจสอบว่ามี Defects ใน Group นั้น',
            ],
            [
              'ลบ Defect ไม่ได้ (FK Error)',
              'มี Defect Data ที่อ้างอิงถึง Defect นี้ - ใช้ Toggle Status เป็น Inactive แทน',
            ],
            [
              'Search ไม่พบข้อมูล',
              'ตรวจสอบ: (1) สะกดถูกต้อง (2) Status Filter (3) Group Filter (4) Case-insensitive',
            ],
            [
              'Toggle Status ไม่ทำงาน',
              'ตรวจสอบสิทธิ์ - รีเฟรชหน้า (F5) - ดู Console errors - ติดต่อ Admin',
            ],
            [
              'สถิติไม่ถูกต้อง',
              'รีเฟรชหน้า (F5) - ตรวจสอบ API response - Clear cache',
            ],
            [
              'ตารางไม่แสดงข้อมูล',
              'ตรวจสอบ: (1) Status Filter (2) Group Filter (3) Search query (4) รีเฟรชหน้า',
            ],
            [
              'ID ไม่ถูกสร้างอัตโนมัติ',
              'ID เป็น SERIAL จะถูกสร้างโดย Database - ไม่ต้องกรอก',
            ],
          ]}
        />
      </Section>

      {/* Section 11: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี (Best Practices)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            ✅ การจัดการ Defects Master Data อย่างมีประสิทธิภาพ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li><strong>Naming Convention:</strong> ใช้ชื่อที่ชัดเจนและเข้าใจง่าย (เช่น Surface Scratch, Dimensional Error)</li>
            <li><strong>Use Defect Groups:</strong> จัดกลุ่ม Defects เพื่อง่ายต่อการจัดการ (VISUAL, FUNCTIONAL, DIMENSIONAL, etc.)</li>
            <li><strong>Add Description:</strong> เขียน Description ที่ละเอียดเพื่อให้ทีมเข้าใจตรงกัน</li>
            <li><strong>Use Inactive:</strong> เปลี่ยนสถานะแทนการลบเพื่อเก็บ history</li>
            <li><strong>Regular Review:</strong> ทบทวนและอัปเดต Defects เป็นประจำ</li>
            <li><strong>Consistent Groups:</strong> ใช้ชื่อ Group ที่สอดคล้องกันทั้งทีม</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '16px' }}>
            💡 เคล็ดลับการใช้งาน:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
            <li><strong>Use Group Filter:</strong> กรองตาม Defect Group เพื่อจัดการแต่ละกลุ่ม</li>
            <li><strong>Toggle Input Mode:</strong> ใช้ปุ่ม +/↓ เพื่อสลับระหว่าง Dropdown และ Custom Input</li>
            <li><strong>Search Efficiently:</strong> ค้นหาได้ทุกฟิลด์ (ID, Name, Description, Group)</li>
            <li><strong>Bulk Operations:</strong> ใช้ Bulk Toggle เมื่อต้องการเปลี่ยนสถานะหลายรายการ</li>
            <li><strong>Real-time Validation:</strong> ดู Validation errors ขณะพิมพ์</li>
            <li><strong>Combined Filters:</strong> ใช้หลาย Filters ร่วมกัน (Status + Group + Search)</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            🎯 ประโยชน์ของการจัดการ Defects Master Data ที่ดี:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#5d4037' }}>
            <li><strong>Standardization:</strong> ชื่อ Defects ที่มาตรฐานเหมือนกันทั้งองค์กร</li>
            <li><strong>Data Analysis:</strong> วิเคราะห์ข้อมูล Defects ได้อย่างแม่นยำ</li>
            <li><strong>Quality Improvement:</strong> ช่วยในการปรับปรุงคุณภาพอย่างเป็นระบบ</li>
            <li><strong>Reporting:</strong> รายงานที่ชัดเจนและเข้าใจได้</li>
            <li><strong>Training:</strong> ง่ายต่อการฝึกอบรมพนักงานใหม่</li>
            <li><strong>Traceability:</strong> ติดตามย้อนกลับไปยังสาเหตุของปัญหา</li>
            <li><strong>Continuous Improvement:</strong> ใช้ข้อมูลเพื่อปรับปรุงอย่างต่อเนื่อง</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
        <p style={{ marginTop: '10px' }}>หรือดูคู่มือการใช้งานเพิ่มเติมในเมนู Training</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>ตัวอย่าง Defect Groups ที่ใช้กันทั่วไป:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li><strong>VISUAL:</strong> Surface Scratch, Color Mismatch, Stain</li>
          <li><strong>DIMENSIONAL:</strong> Over/Under Size, Misalignment</li>
          <li><strong>FUNCTIONAL:</strong> Performance Issue, Malfunction</li>
          <li><strong>STRUCTURAL:</strong> Crack, Break, Deformation</li>
          <li><strong>ASSEMBLY:</strong> Missing Part, Wrong Part, Loose Connection</li>
          <li><strong>PACKAGING:</strong> Damaged Package, Wrong Label</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T12_DefectsPage;
