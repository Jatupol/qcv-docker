// client/src/pages/training/T15_SettingPage.tsx

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
 * System Settings Training Page
 *
 * Quick Reference Card #15: การตั้งค่าระบบ (SMTP + MSSQL Connection)
 */
const T15_SettingPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={15}
      totalCards={48}
      title="การตั้งค่าระบบ"
      subtitle="System Settings - SMTP & MSSQL Connection"
      icon="⚙️"
      nextLink="/training/t01"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            หน้าตั้งค่าระบบใช้สำหรับกำหนดค่าการเชื่อมต่อ 2 ส่วนหลัก:
            <strong> SMTP Server</strong> (สำหรับส่งอีเมล) และ <strong>MSSQL Server</strong> (สำหรับเชื่อมต่อฐานข้อมูลภายนอก)
            โดยมี Active Configuration เพียง 1 รายการที่ใช้งานอยู่
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Settings (เมนูด้านซ้ายล่าง) &nbsp; | &nbsp; /settings
          </p>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#721c24' }}>
            ⚠️ สิทธิ์การเข้าถึง: เฉพาะ Admin และ Manager เท่านั้น
          </p>
        </div>
      </Section>

      {/* SMTP Settings */}
      <Section title="1. การตั้งค่า SMTP (Email Server)">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>
            SMTP ใช้สำหรับส่งอีเมลแจ้งเตือนจากระบบ เช่น การแจ้งเตือนข้อบกพร่อง (Defect Notification Emails)
          </p>
        </div>

        <Table
          headers={['ฟิลด์', 'คำอธิบาย', 'ตัวอย่าง']}
          rows={[
            ['SMTP Server', 'ที่อยู่ SMTP Server', 'smtp.gmail.com'],
            ['SMTP Port', 'พอร์ตของ SMTP Server', '587'],
            ['SMTP Username', 'ชื่อผู้ใช้สำหรับ SMTP', 'qcv@company.com'],
            ['SMTP Password', 'รหัสผ่าน SMTP (มีปุ่มแสดง/ซ่อน)', '********'],
          ]}
        />

        <Subsection title="การทดสอบ SMTP">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'กรอกข้อมูล SMTP Server, Port, Username, Password',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Test SMTP" เพื่อทดสอบการเชื่อมต่อ',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'หรือคลิก "Send Test Email" เพื่อส่งอีเมลทดสอบจริง',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ตรวจสอบผลลัพธ์ (สำเร็จ/ล้มเหลว) ที่แสดงบนหน้าจอ',
              },
            ]}
          />
        </Subsection>
      </Section>

      {/* MSSQL Settings */}
      <Section title="2. การตั้งค่า MSSQL Connection">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>
            MSSQL Connection ใช้สำหรับเชื่อมต่อกับฐานข้อมูล SQL Server ภายนอก
            เพื่อดึงข้อมูลจากระบบอื่น (เช่น ข้อมูล Production) สามารถเปิด/ปิดการเชื่อมต่อได้
          </p>
        </div>

        <Table
          headers={['ฟิลด์', 'คำอธิบาย', 'ตัวอย่าง']}
          rows={[
            ['MSSQL Enabled', 'เปิด/ปิดการเชื่อมต่อ (Toggle)', 'On / Off'],
            ['MSSQL Server', 'ที่อยู่ MSSQL Server', '192.168.1.100'],
            ['MSSQL Port', 'พอร์ตของ MSSQL Server', '1433'],
            ['MSSQL Database', 'ชื่อฐานข้อมูล', 'ProductionDB'],
            ['MSSQL Username', 'ชื่อผู้ใช้สำหรับ MSSQL', 'sa'],
            ['MSSQL Password', 'รหัสผ่าน MSSQL (มีปุ่มแสดง/ซ่อน)', '********'],
          ]}
        />

        <Subsection title="การทดสอบ MSSQL Connection">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'เปิด Toggle "MSSQL Enabled" ให้เป็น On',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'กรอกข้อมูล Server, Port, Database, Username, Password',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'คลิกปุ่ม "Test MSSQL Connection" เพื่อทดสอบ',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ตรวจสอบผลลัพธ์: สำเร็จ (เขียว) หรือ ล้มเหลว (แดง พร้อมรายละเอียดข้อผิดพลาด)',
              },
            ]}
          />
        </Subsection>

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 เคล็ดลับ:</strong> เมื่อปิด MSSQL Enabled ระบบจะไม่พยายามเชื่อมต่อกับ SQL Server
            ฟีเจอร์ที่ต้องใช้ข้อมูลจาก MSSQL จะไม่ทำงาน
          </p>
        </div>
      </Section>

      {/* How to Save */}
      <Section title="การบันทึกการตั้งค่า">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'แก้ไขค่าที่ต้องการเปลี่ยนแปลง',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกปุ่ม "Save" เพื่อบันทึก (ระบบจะบันทึกเฉพาะค่าที่เปลี่ยนแปลง)',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะแสดงข้อความยืนยันเมื่อบันทึกสำเร็จ',
            },
          ]}
        />

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>⚠️ หมายเหตุ:</strong> ระบบจะบันทึกเฉพาะฟิลด์ที่มีการเปลี่ยนแปลง (diff-only update)
            หากไม่มีการเปลี่ยนแปลงจะไม่สามารถบันทึกได้
          </p>
        </div>
      </Section>

      {/* Password Security */}
      <Section title="ความปลอดภัยรหัสผ่าน">
        <List
          items={[
            '🔒 รหัสผ่าน SMTP และ MSSQL จะถูกซ่อนด้วย ******** โดยอัตโนมัติ',
            '👁️ คลิกปุ่ม "แสดง/ซ่อน" (ไอคอนตา) เพื่อดูรหัสผ่าน',
            '🔐 รหัสผ่านจะถูกเข้ารหัสก่อนบันทึกในฐานข้อมูล',
            '⚠️ ไม่ควรแชร์รหัสผ่านกับผู้อื่น',
          ]}
        />
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>✅ ควรทำ</h4>
          <ul>
            <li>ทดสอบการเชื่อมต่อทุกครั้งหลังเปลี่ยนค่า</li>
            <li>ใช้ Send Test Email เพื่อยืนยันว่า SMTP ทำงาน</li>
            <li>ปิด MSSQL Enabled เมื่อไม่ต้องใช้งาน</li>
            <li>บันทึกค่าตั้งค่าเดิมก่อนเปลี่ยนแปลง</li>
          </ul>
        </div>

        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ ไม่ควรทำ</h4>
          <ul>
            <li>ไม่ควรใช้รหัสผ่านง่ายเกินไป</li>
            <li>ไม่ควรแชร์หน้า Settings ให้ผู้ที่ไม่ได้รับอนุญาต</li>
            <li>ไม่ควรเปลี่ยน SMTP ในช่วงที่ระบบกำลังส่ง Email แจ้งเตือน</li>
          </ul>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['Test SMTP ล้มเหลว', 'ตรวจสอบ Server, Port, Username, Password ให้ถูกต้อง / ตรวจสอบ Firewall'],
            ['Send Test Email ไม่ได้รับ', 'ตรวจสอบ Email ผู้รับ, ตรวจสอบ Spam folder'],
            ['Test MSSQL ล้มเหลว', 'ตรวจสอบ Server IP, Port, Database Name / ตรวจสอบ Firewall และ Network'],
            ['ไม่สามารถบันทึกได้', 'ตรวจสอบว่ามีการเปลี่ยนแปลงค่าจริง / ตรวจสอบสิทธิ์ Admin/Manager'],
            ['ไม่เห็นเมนู Settings', 'ต้องเป็น Admin หรือ Manager เท่านั้น'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>ติดต่อ:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>System Administrator - สำหรับการตั้งค่า SMTP/MSSQL</li>
          <li>IT Support - สำหรับปัญหา Network/Firewall</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T15_SettingPage;
