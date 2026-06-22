// client/src/pages/training/T01LoginPage.tsx

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
 * Login & Navigation Training Page
 *
 * Quick Reference Card #1: การเข้าสู่ระบบและการนำทาง
 */
const T01LoginPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={1}
      totalCards={10}
      title="การเข้าสู่ระบบ"
      subtitle="Login & Navigation"
      icon="🔐"
      nextLink="/training/oqa-inspection"
    >
      {/* Section 1: การเข้าสู่ระบบ */}
      <Section title="การเข้าสู่ระบบ">
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/01_Login.png"
            alt="Login Screen"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการเข้าสู่ระบบ Sampling Inspection Control System
          </p>
        </div>

        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เปิดเว็บเบราว์เซอร์และไปที่ URL ของระบบ (ตามที่ได้รับจากผู้ดูแลระบบ)',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'ใส่ข้อมูลรับรองของคุณในช่องที่กำหนด: ชื่อผู้ใช้ (Username) และรหัสผ่าน (Password)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิกปุ่ม "Login" สีน้ำเงินเพื่อเข้าสู่ระบบ',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'หากข้อมูลถูกต้อง คุณจะถูกนำไปยังหน้า Dashboard โดยอัตโนมัติ',
            },
          ]}
        >
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#495057' }}>
              📝 คำแนะนำสำหรับการเข้าสู่ระบบ:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>ชื่อผู้ใช้: ใช้ชื่อผู้ใช้ที่ได้รับมอบหมายจากผู้ดูแลระบบ</li>
              <li>รหัสผ่าน: กรอกรหัสผ่านที่คุณได้รับ (ควรเปลี่ยนรหัสผ่านเป็นครั้งแรกหลังจากเข้าสู่ระบบ)</li>
              <li>ตรวจสอบให้แน่ใจว่าปุ่ม Caps Lock ปิดอยู่ เนื่องจากรหัสผ่านคำนึงถึงตัวพิมพ์ใหญ่-เล็ก</li>
              <li>เก็บข้อมูลการเข้าสู่ระบบของคุณเป็นความลับและไม่แชร์ให้ผู้อื่น</li>
            </ul>
          </div>
        </StepBox>
      </Section>

       <Section title="หน้า Dashboard หลังการเข้าสู่ระบบ">
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/01_Dashboard.png"
            alt="Login Screen"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 2: หน้า Dashboard หลังจากเข้าสู่ระบบสำเร็จ
          </p>
        </div>
 
      </Section>

      {/* Section 3: การออกจากระบบ */}
      <Section title="การออกจากระบบ">
        <StepBox
          steps={[
            {
              label: 'วิธีที่ 1',
              description: 'คลิกไอคอน โปรไฟล์ (มุมขวาบน) → เลือก Logout',
            },
            {
              label: 'วิธีที่ 2',
              description: 'ปิดเบราว์เซอร์ (เซสชันหมดอายุใน 12 ชั่วโมง)',
            },
            {
              label: 'อัตโนมัติ',
              description: 'หากเซสชันหมดอายุ ระบบจะนำคุณกลับไปยังหน้าเข้าสู่ระบบพร้อมแจ้งเตือนโดยอัตโนมัติ นอกจากนี้ระบบจะบังคับออกจากระบบอัตโนมัติเวลา 07:35 น. และ 19:20 น. ทุกวัน',
            },
          ]}
        />
      </Section>
 
      {/* Section 4: การแก้ไขปัญหา */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ข้อความ "Invalid credentials"',
              'ตรวจสอบชื่อผู้ใช้/รหัสผ่าน, ตรวจสอบว่า Caps Lock ปิดอยู่',
            ],
            [
              'ข้อความ "Session expired"',
              'เป็นปกติหลังจาก 6 ชั่วโมง หรือเมื่อถึงเวลาบังคับออกจากระบบ (07:35 น. / 19:20 น.) - เพียงเข้าสู่ระบบอีกครั้ง',
            ],
            [
              'หน้าเว็บไม่โหลด',
              'รีเฟรชหน้า (F5), ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T01LoginPage;
