// client/src/pages/training/T06_DefectRecordPage.tsx
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
 * Defect Recording Training Page
 *
 * Quick Reference Card #6: การบันทึก Defect
 */
const T06_DefectRecordPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={6}
      totalCards={48}
      title="การบันทึก Defect"
      subtitle="Defect Recording Process"
      icon="📝"
      nextLink="/training/t07"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมการบันทึก Defect">
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            📋 การบันทึก Defect คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#5d4037' }}>
            การบันทึก Defect เป็นกระบวนการบันทึกข้อมูลข้อบกพร่องที่พบในระหว่างการตรวจสอบคุณภาพชิ้นงาน
            เพื่อติดตามและวิเคราะห์ปัญหาคุณภาพที่พบในแต่ละสถานีการผลิต (FVI Line)
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/06_DefectInput.png"
            alt="Defect Input Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการบันทึก Defect Input
          </p>
        </div>
      </Section>

      {/* Section 2: Navigation */}
      <Section title="การเข้าถึงหน้า Defect Input">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Inspection" → เลือก "Defect Input"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'หรือเข้าจากหน้า OQA/OBA Inspection Lists โดยคลิกปุ่ม "Defect Input" จากรายการ',
            },
          ]}
        />
      </Section>

      {/* Section 3: Main Process */}
      <Section title="ขั้นตอนการบันทึก Defect (3 ส่วนหลัก)">

        {/* Part 1: FVI Line Setup */}
        <Subsection title="📍 ส่วนที่ 1: ตั้งค่า FVI Line และ Station" />
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            🏭 การเลือก FVI Line และ Shift:
          </p>
          <StepBox
            steps={[
              {
                label: 'เลือกวันที่',
                description: 'เลือกวันที่ผลิต (Date) - ระบบจะโหลดรายการ FVI Lines ที่มีในวันนั้น',
              },
              {
                label: 'เลือกสายการผลิต',
                description: 'เลือก FVI Line จาก dropdown - ระบบจะแสดงเฉพาะ Lines ที่มีข้อมูล Check-in',
              },
              {
                label: 'เลือกกะ',
                description: 'เลือก Shift (A, B, C, etc.) ตามกะที่ทำงาน',
              },
              {
                label: 'รอโหลดแผนผัง',
                description: 'ระบบจะโหลด FVI Station Mapping และแสดงแผนผังสถานีอัตโนมัติ',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🎯 การเลือก Station จากแผนผัง FVI Line:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li>แผนผังจะแสดงตำแหน่งสถานีทั้งหมดบน FVI Line</li>
            <li>คลิกที่สถานีที่ต้องการ (Station Card) เพื่อเลือก</li>
            <li>สถานีที่เลือกจะแสดงสีเน้น และระบบจะดึง Inspector ID อัตโนมัติ</li>
            <li>หากไม่มีข้อมูล Inspector ให้เลือกจาก Modal ที่เปิดขึ้นมา</li>
          </ul>
        </div>

        {/* Part 2: Defect Form */}
        <Subsection title="📝 ส่วนที่ 2: กรอกข้อมูล Defect" />
        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            📋 ข้อมูลที่ต้องกรอก:
          </p>
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'ตัวอย่าง']}
            rows={[
              [
                'Tray Number',
                'หมายเลข Tray ที่พบ Defect',
                'T001, T002',
              ],
              [
                'Position on Tray',
                'ตำแหน่งบน Tray (1-20)',
                '1, 2, 3, ..., 20',
              ],
              [
                'Color Group',
                'กลุ่มสีของชิ้นงาน (พิมพ์เอง)',
                'RED, BLUE, GREEN',
              ],
              [
                'QC Name',
                'ชื่อ QC ผู้ตรวจสอบ',
                'นายสมชาย ใจดี',
              ],
              [
                'QC Leader Name',
                'ชื่อ QC Leader ผู้ยืนยัน',
                'นางสาวสมหญิง มีชัย',
              ],
              [
                'FVI Leader Confirm Name',
                'ชื่อผู้ยืนยัน MRB',
                'นายวิชัย สุขใจ',
              ],
              [
                'Inspector ID',
                'รหัสผู้ตรวจ (ดึงจาก Station)',
                'INS001, INS002',
              ],
              [
                'Defect Type',
                'ประเภท Defect (เลือกจาก dropdown)',
                'VISUAL, CRACK, DIMENSION',
              ],
              [
                'Defect',
                'รายละเอียด Defect (เลือกจาก dropdown)',
                'Scratch, Crack, Missing Part',
              ],
              [
                'Defect Quantity',
                'จำนวน Defect (ตัวเลข)',
                '1, 2, 3, ...',
              ],
            ]}
          />
        </div>

        {/* Part 3: Photo Upload */}
        <Subsection title="📸 ส่วนที่ 3: อัปโหลดรูปภาพ Defect" />
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📷 การอัปโหลดรูปภาพ:
          </p>
          <StepBox
            steps={[
              {
                label: 'คลิกปุ่ม Upload',
                description: 'คลิกปุ่ม "Camera" หรือ "Upload" เพื่อเลือกรูปภาพ',
              },
              {
                label: 'เลือกรูปภาพ',
                description: 'สามารถเลือกได้หลายรูปพร้อมกัน (Multiple Upload)',
              },
              {
                label: 'ตรวจสอบ Preview',
                description: 'ระบบจะแสดง Preview รูปภาพที่อัปโหลด - สามารถลบรูปแต่ละรูปได้',
              },
              {
                label: 'ข้อกำหนด',
                description: 'รูปภาพต้องเป็นไฟล์ image เท่านั้น, ขนาดไม่เกิน 5MB ต่อรูป',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            💾 บันทึกข้อมูล:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>คลิกปุ่ม "Save Record"</strong> สีส้มเพื่อบันทึกข้อมูล Defect</li>
            <li>ระบบจะทำการ validation ตรวจสอบข้อมูลทั้งหมด</li>
            <li>หากผ่านการ validation ข้อมูลจะถูกบันทึกและแสดงในรายการด้านล่าง</li>
            <li>สามารถบันทึก Defect หลายรายการได้โดยกรอกฟอร์มและบันทึกซ้ำ</li>
          </ul>
        </div>
      </Section>

      {/* Section 4: Records View */}
      <Section title="การดูและจัดการรายการ Defect">
        <Subsection title="📊 รายการ Defect ที่บันทึกแล้ว" />
        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📋 ฟีเจอร์การจัดการรายการ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1a237e' }}>
            <li><strong>ดูรายการทั้งหมด:</strong> คลิกปุ่ม "View Records" เพื่อแสดงรายการ Defect ที่บันทึกแล้ว</li>
            <li><strong>ดูรูปภาพ:</strong> คลิกไอคอน "Eye" เพื่อดูรูปภาพ Defect ในรายการนั้น</li>
            <li><strong>ลบรายการ:</strong> คลิกไอคอน "Trash" เพื่อลบรายการ Defect (จะมี confirmation dialog)</li>
            <li><strong>ข้อมูลที่แสดง:</strong> Timestamp, Tray, Position, Color, QC Names, Defect Type/Defect, Quantity</li>
          </ul>
        </div>

        <div style={{ background: '#ffe0b2', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            ⚠️ ข้อควรระวัง:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li>ตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก เพราะจะส่งผลต่อการรายงานและวิเคราะห์</li>
            <li>ถ่ายรูปให้ชัดเจน แสดงตำแหน่ง Defect ให้เห็นอย่างชัดเจน</li>
            <li>เลือก Defect Type และ Defect ให้ตรงกับปัญหาที่พบ</li>
            <li>กรอก QC Names ให้ครบถ้วนเพื่อความโปร่งใสในการตรวจสอบ</li>
          </ul>
        </div>
      </Section>

 

      {/* Section 5: Email Alert */}
      <Section title="การแจ้งเตือนทางอีเมล (Email Alert)">
        <div style={{ background: '#fce4ec', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#b71c1c', fontSize: '16px' }}>
            🚨 ระบบจะส่ง Email แจ้งเตือนอัตโนมัติเมื่อบันทึก Defect ที่ตรงเงื่อนไข
          </p>
          <p style={{ margin: 0, color: '#5d4037' }}>
            หลังจากบันทึก Defect สำเร็จ ระบบจะตรวจสอบ <strong>ประเภทสถานี (Station)</strong> และ <strong>ประเภท Defect (Defect Type)</strong>
            หากตรงเงื่อนไข จะส่ง Email แจ้งเตือนอัตโนมัติภายใน <strong>3 วินาที</strong> โดยไม่กระทบการบันทึกข้อมูล
          </p>
        </div>

        <Subsection title="📋 เงื่อนไขการส่ง Email" />
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            ต้องตรงทั้ง 2 เงื่อนไข:
          </p>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#5d4037' }}>
            เงื่อนไขที่ 1: สถานี (Station) ต้องเป็น OQA, SIV หรือ OBA เท่านั้น
          </p>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#5d4037' }}>
            ระบบจะดูจาก 3 ตัวอักษรแรกของ Inspection Number (เช่น <code>OQA250311-151234</code> → OQA)
            สถานีอื่น เช่น IQA, FQA จะ <strong>ไม่ส่ง Email</strong>
          </p>

          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#5d4037' }}>
            เงื่อนไขที่ 2: Defect Type ต้องตรงตามตาราง:
          </p>
          <Table
            headers={['สถานี', 'Defect Type ที่ส่ง Email', 'ไม่ส่ง Email']}
            rows={[
              [
                'OQA',
                '• Abnormal defect ≥1\n• Normal repeat problem & area ≥3',
                'Defect Type อื่นนอกเหนือจากนี้',
              ],
              [
                'SIV',
                '• Abnormal defect ≥1\n• Normal repeat problem & area ≥3',
                'Defect Type อื่นนอกเหนือจากนี้',
              ],
              [
                'OBA',
                '• Normal defect\n• Abnormal defect ≥1\n• Normal repeat problem & area ≥3',
                'Defect Type อื่นนอกเหนือจากนี้',
              ],
              [
                'IQA / อื่นๆ',
                '— ไม่ส่ง Email ทุกกรณี —',
                'ทุก Defect Type',
              ],
            ]}
          />
        </div>

        <Subsection title="📧 เนื้อหาใน Email" />
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            หัวข้อ Email:
          </p>
          <div style={{ background: '#bbdefb', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontFamily: 'monospace', fontSize: '13px' }}>
            🚨 OQA Abnormal defect ≥1 Scratch ModelXYZ v1.2_14-Mar-26_Shift A
          </div>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            เนื้อหาประกอบด้วย:
          </p>
          <List
            items={[
              '🔵 ข้อมูลการตรวจสอบ — Station, Sampling No, Date, FY/WW, Shift, QC Inspector',
              '🟣 ข้อมูลสินค้า — Lot No, Item No, Model, Version, Part Site, FVI Line No',
              '🟤 ข้อมูล Judgment & Defect — ผล Pass/Reject, Defect Type, Defect Name, NG Qty, QC Name, QC Leader',
              '📸 รูปภาพ Defect — แสดงสูงสุด 5 รูป พร้อม Tray No, Position, Magnification',
              '⚠️ Action Required — แจ้งให้ Visual Operator ระวัง และทำ Rescreening ตาม Recall Protocol',
            ]}
          />
        </div>

        <Subsection title="👥 ผู้รับ Email" />
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li>ผู้รับ Email ตั้งค่าในหน้า <strong>Settings</strong> → ช่อง <strong>Defect Notification Emails</strong></li>
            <li>สามารถใส่ได้หลาย Email คั่นด้วยเครื่องหมาย , (comma)</li>
            <li>ต้องตั้งค่า SMTP Server ในหน้า Settings ให้ถูกต้องก่อนจึงจะส่งได้</li>
          </ul>
        </div>

        <Subsection title="🔄 ส่ง Email ซ้ำ (Resend)" />
        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#4a148c' }}>
            หาก Email ไม่ถูกส่งหรือต้องการส่งซ้ำ สามารถกดปุ่ม <strong>"Resend Email"</strong> ในตาราง Defect Records ได้
            ระบบจะส่ง Email ใหม่ด้วยข้อมูลเดิม
          </p>
        </div>
      </Section>

      {/* Section 6: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่แสดง FVI Lines',
              'ตรวจสอบว่าเลือกวันที่ถูกต้อง และมีข้อมูล Check-in ในวันนั้น',
            ],
            [
              'ไม่แสดงแผนผัง FVI Station',
              'ตรวจสอบว่าเลือก Date, Line และ Shift ครบถ้วน - รอ 2-3 วินาทีเพื่อให้ระบบโหลดข้อมูล',
            ],
            [
              'ไม่มี Inspector ID ในสถานี',
              'คลิกที่สถานี จะมี Modal เปิดขึ้นให้เลือก Inspector จากรายการ',
            ],
            [
              'อัปโหลดรูปภาพไม่ได้',
              'ตรวจสอบว่าไฟล์เป็น image และขนาดไม่เกิน 5MB - ลองเลือกไฟล์ใหม่',
            ],
            [
              'ไม่พบ Defect Type หรือ Defect ใน dropdown',
              'ตรวจสอบการตั้งค่าระบบ (System Configuration) และ Defect Master Data',
            ],
            [
              'บันทึกไม่สำเร็จ',
              'ตรวจสอบว่ากรอกข้อมูลครบทุกฟิลด์ที่ required - ดู error message ที่แสดงขึ้น',
            ],
            [
              'ไม่สามารถลบรายการได้',
              'ตรวจสอบสิทธิ์ในการลบ หรือติดต่อ Admin',
            ],
            [
              'ไม่สามารถส่งข้อมูลได้',
              'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต, รีเฟรชหน้า (F5), หรือติดต่อฝ่าย IT',
            ],
          ]}
        />
      </Section>

      {/* Section 6: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี (Best Practices)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            ✅ ข้อแนะนำสำหรับการบันทึก Defect:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li><strong>บันทึกทันที:</strong> บันทึกข้อมูล Defect ทันทีที่พบเพื่อความแม่นยำของข้อมูล</li>
            <li><strong>รูปภาพคุณภาพดี:</strong> ถ่ายรูปให้ชัดเจน แสดง Defect และตำแหน่งอย่างชัดเจน - หลายมุมมองถ้าจำเป็น</li>
            <li><strong>ข้อมูลครบถ้วน:</strong> กรอกข้อมูลให้ครบทุกฟิลด์ โดยเฉพาะ QC Names และ Defect Type/Defect</li>
            <li><strong>ตรวจสอบก่อนบันทึก:</strong> ทบทวนข้อมูลทุกครั้งก่อนคลิก Save Record</li>
            <li><strong>Position ถูกต้อง:</strong> ระบุตำแหน่งบน Tray ให้ถูกต้องเพื่อง่ายต่อการติดตาม</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '16px' }}>
            💡 เคล็ดลับการทำงานอย่างมีประสิทธิภาพ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
            <li><strong>ใช้ FVI Line Mapping:</strong> เลือกสถานีจากแผนผังเพื่อให้ Inspector ID ถูกต้องอัตโนมัติ</li>
            <li><strong>อัปโหลดหลายรูป:</strong> สามารถเลือกหลายรูปพร้อมกันเพื่อประหยัดเวลา</li>
            <li><strong>ใช้ Color Group ที่สอดคล้อง:</strong> ใช้ชื่อ Color Group ที่เป็นมาตรฐานเดียวกันทั้งทีม</li>
            <li><strong>บันทึกเป็นชุด:</strong> หาก Defect หลายชิ้นในสถานีเดียวกัน บันทึกทีละรายการเพื่อความถูกต้อง</li>
            <li><strong>Review Records:</strong> ใช้ "View Records" เพื่อตรวจสอบข้อมูลที่บันทึกไปแล้ว</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            🎯 ความสำคัญของการบันทึก Defect ที่ถูกต้อง:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#5d4037' }}>
            <li><strong>การวิเคราะห์ข้อมูล:</strong> ข้อมูลที่บันทึกจะใช้ในการวิเคราะห์ Trend และหาสาเหตุปัญหา</li>
            <li><strong>การปรับปรุงกระบวนการ:</strong> ช่วยในการระบุจุดปัญหาและปรับปรุงกระบวนการผลิต</li>
            <li><strong>การรายงาน:</strong> ข้อมูลจะถูกใช้ในรายงานคุณภาพและการประชุม Management Review</li>
            <li><strong>Traceability:</strong> สามารถติดตามย้อนกลับไปยังสถานี Inspector และเวลาที่พบ Defect</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T06_DefectRecordPage;
