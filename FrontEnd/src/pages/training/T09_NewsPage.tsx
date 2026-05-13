// client/src/pages/training/T09_NewsPage.tsx

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
 * News & Announcements Training Page
 *
 * Quick Reference Card #9: ข่าวสารและประกาศ
 */
const T09_NewsPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={9}
      totalCards={48}
      title="ข่าวสารและประกาศ"
      subtitle="News & Announcements"
      icon="📰"
      nextLink="/training/t08"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            ระบบข่าวสารและประกาศใช้สำหรับแจ้งข้อมูลสำคัญ การอัพเดทระบบ การแจ้งเตือน
            และข่าวสารต่างๆ ให้กับผู้ใช้งานทั้งหมดในองค์กร
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 Path</h4>
          <code style={{ background: '#fff', padding: '8px', borderRadius: '4px', display: 'block' }}>
            /news
          </code>
        </div>
      </Section>

      {/* News Types */}
      <Section title="ประเภทของข่าวสาร">
        <Table
          headers={['ประเภท', 'ไอคอน', 'คำอธิบาย', 'ระดับความสำคัญ']}
          rows={[
            [
              'ข่าวสำคัญ (Critical)',
              '🔴',
              'การแจ้งเตือนสำคัญ, ปัญหาระบบ',
              'สูงมาก',
            ],
            [
              'ข่าวประกาศ (Announcement)',
              '📢',
              'ประกาศทั่วไป, นโยบายใหม่',
              'สูง',
            ],
            [
              'อัพเดทระบบ (Update)',
              '🔄',
              'ฟีเจอร์ใหม่, การปรับปรุงระบบ',
              'ปานกลาง',
            ],
            [
              'ข่าวทั่วไป (General)',
              'ℹ️',
              'ข้อมูลทั่วไป, เคล็ดลับ',
              'ต่ำ',
            ],
          ]}
        />
      </Section>

      {/* Viewing News */}
      <Section title="การดูข่าวสาร">
        <Subsection title="การเข้าถึงข่าวสาร">
          <List
            items={[
              '🏠 หน้า Dashboard - แสดงข่าวล่าสุด 3 รายการ',
              '📰 หน้า News - แสดงข่าวทั้งหมด (เรียงตามวันที่)',
              '🔔 Bell Icon (มุมขวาบน) - แสดงข่าวที่ยังไม่ได้อ่าน',
              '📧 Email Notification - ข่าวสำคัญจะส่งอีเมลแจ้งเตือน',
            ]}
          />
        </Subsection>

        <Subsection title="การอ่านข่าว">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'คลิกที่หัวข้อข่าวที่ต้องการอ่าน',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'อ่านรายละเอียดข่าวสาร (รูปภาพ, ไฟล์แนบ)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'คลิก "Mark as Read" (ถ้ายังไม่ได้อ่าน)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ดาวน์โหลดไฟล์แนบ (ถ้ามี)',
              },
            ]}
          />
        </Subsection>
      </Section>

      {/* Creating News (Admin/Manager) */}
      <Section title="การสร้างข่าวสาร (สำหรับ Admin/Manager)">
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
            ⚠️ เฉพาะผู้ใช้ที่มี Role: Admin หรือ Manager เท่านั้น
          </p>
        </div>

        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ News → คลิก "+ Create News"',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'กรอกข้อมูล: Title, Content, Type, Priority',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือกประเภทข่าว (Critical/Announcement/Update/General)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เพิ่มรูปภาพหรือไฟล์แนบ (ถ้ามี)',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'เลือกกลุ่มเป้าหมาย (All Users / Specific Roles)',
            },
            {
              label: 'ขั้นตอนที่ 6',
              description: 'ตั้งค่าการแจ้งเตือน (Email Notification ON/OFF)',
            },
            {
              label: 'ขั้นตอนที่ 7',
              description: 'Preview ก่อนเผยแพร่',
            },
            {
              label: 'ขั้นตอนที่ 8',
              description: 'คลิก "Publish" เพื่อเผยแพร่ข่าว',
            },
          ]}
        />

        <Subsection title="ฟิลด์ที่จำเป็น">
          <Table
            headers={['ฟิลด์', 'ต้องระบุ', 'คำอธิบาย']}
            rows={[
              ['Title', '✅', 'หัวข้อข่าว (สั้น ๆ กระชับ)'],
              ['Content', '✅', 'เนื้อหาข่าวสาร (รองรับ Rich Text)'],
              ['Type', '✅', 'ประเภทข่าว (Critical/Announcement/Update/General)'],
              ['Priority', '✅', 'ระดับความสำคัญ (High/Medium/Low)'],
              ['Target Audience', '✅', 'กลุ่มเป้าหมาย (All/Specific Roles)'],
              ['Publish Date', '❌', 'วันที่เผยแพร่ (เว้นว่าง = ทันที)'],
              ['Expiry Date', '❌', 'วันหมดอายุ (ข่าวจะซ่อนอัตโนมัติ)'],
              ['Attachments', '❌', 'ไฟล์แนบ (PDF, Excel, รูปภาพ)'],
            ]}
          />
        </Subsection>
      </Section>

      {/* Editing/Deleting News */}
      <Section title="การแก้ไข/ลบข่าวสาร">
        <Subsection title="การแก้ไขข่าว">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ไปที่รายการข่าวที่ต้องการแก้ไข',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Edit" (ไอคอนดินสอ)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'แก้ไขข้อมูลที่ต้องการ',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Save Changes" เพื่อบันทึก',
              },
            ]}
          />
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
            💡 หมายเหตุ: การแก้ไขข่าวจะมีการบันทึก Edit History
          </p>
        </Subsection>

        <Subsection title="การลบข่าว">
          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', border: '2px solid #f5c6cb' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>⚠️ คำเตือน</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>การลบข่าวจะลบข้อมูลถาวร ไม่สามารถกู้คืนได้</li>
              <li>แนะนำให้ใช้ "Archive" แทนการลบ</li>
              <li>ต้องยืนยันการลบ 2 ครั้ง</li>
            </ul>
          </div>
        </Subsection>
      </Section>

      {/* News Features */}
      <Section title="ฟีเจอร์ข่าวสาร">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📌 ปักหมุดข่าว (Pin)</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ข่าวที่ปักหมุดจะแสดงอยู่ด้านบนสุดเสมอ
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📝 Rich Text Editor</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              รองรับการจัดรูปแบบข้อความ, รูปภาพ, ลิงก์
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📧 Email Notification</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ส่งอีเมลแจ้งเตือนอัตโนมัติสำหรับข่าวสำคัญ
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 Read Statistics</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ดูสถิติการอ่านข่าว (จำนวนผู้อ่าน, เปอร์เซ็นต์)
            </p>
          </div>
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <List
          items={[
            '✅ ใช้หัวข้อข่าวที่ชัดเจน กระชับ ไม่เกิน 100 ตัวอักษร',
            '✅ เขียนเนื้อหาให้เข้าใจง่าย ตรงประเด็น',
            '✅ ใช้ประเภทข่าวและความสำคัญที่เหมาะสม',
            '✅ แนบไฟล์เอกสารสำคัญ (ถ้ามี)',
            '✅ ตรวจสอบความถูกต้องก่อนเผยแพร่',
            '✅ ตั้งวันหมดอายุสำหรับข่าวที่มีระยะเวลา',
            '✅ Archive ข่าวเก่าแทนการลบ',
            '✅ ตรวจสอบสถิติการอ่านข่าวสำคัญ',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่ได้รับการแจ้งเตือนข่าว',
              'ตรวจสอบการตั้งค่าอีเมล, ตรวจสอบ Spam folder',
            ],
            [
              'ไม่สามารถสร้างข่าวได้',
              'ตรวจสอบ Role ต้องเป็น Admin/Manager',
            ],
            [
              'รูปภาพไม่แสดงผล',
              'ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB), รูปแบบ (JPG/PNG)',
            ],
            [
              'ข่าวหายไป',
              'ตรวจสอบวันหมดอายุ, ตรวจสอบในส่วน Archived',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>ติดต่อ:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ฝ่ายสื่อสารองค์กร - สำหรับคำถามเกี่ยวกับการเผยแพร่ข่าว</li>
          <li>IT Support - สำหรับปัญหาทางเทคนิค</li>
          <li>ดู NEWS_MANUAL.md สำหรับข้อมูลเพิ่มเติม</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T09_NewsPage;
