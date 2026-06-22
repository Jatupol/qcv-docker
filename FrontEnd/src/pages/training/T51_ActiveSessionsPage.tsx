// client/src/pages/training/T51_ActiveSessionsPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  Subsection,
  List,
  WarningBox,
  InfoBox,
} from '../../components/training/TrainingComponents';

/**
 * Active Sessions Training Page
 *
 * Quick Reference Card #51: การตรวจสอบ Session ที่ใช้งานอยู่
 */
const T51_ActiveSessionsPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={51}
      totalCards={53}
      title="การตรวจสอบ Session ที่ใช้งานอยู่"
      subtitle="Active Sessions Monitoring"
      icon="🌐"
      nextLink="/training/login-logs"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            หน้านี้ช่วยให้ผู้ดูแลระบบเห็น session ของผู้ใช้งานที่กำลัง login อยู่แบบ real-time
            สามารถบังคับ logout ผู้ใช้รายเดียว หรือสั่ง force logout ทุกคนพร้อมกัน
            เหมาะกับการตรวจสอบเมื่อสงสัยว่ามี session ค้าง หรือเมื่อต้องการเคลียร์ session ทั้งหมด
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 Path</h4>
          <code style={{ background: '#fff', padding: '8px', borderRadius: '4px', display: 'block' }}>
            Users → Active Sessions  ( /admin/sessions )
          </code>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#856404' }}>
            สิทธิ์: Admin เท่านั้น
          </p>
        </div>
      </Section>

      {/* Columns */}
      <Section title="คอลัมน์ที่แสดงในตาราง">
        <Table
          headers={['คอลัมน์', 'ความหมาย']}
          rows={[
            ['User', 'ชื่อผู้ใช้งานที่ login (มี badge "you" หากเป็นตัวเอง)'],
            ['Role', 'บทบาท: admin / manager / user / viewer'],
            ['Login Time', 'เวลาที่ผู้ใช้ login เข้าระบบ (เวลาท้องถิ่น Asia/Bangkok)'],
            ['Last Activity', 'เวลาล่าสุดที่ session มี activity'],
            ['Expires', 'เวลาที่ cookie ของ session จะหมดอายุ (default 6 ชั่วโมง)'],
            ['IP', 'IP address ของเครื่องผู้ใช้'],
            ['Session ID', 'รหัส session (ย่อให้อ่านง่าย — hover เพื่อดูเต็ม)'],
            ['Actions', 'ปุ่ม Kick เพื่อสิ้นสุด session ของผู้ใช้คนนั้น'],
          ]}
        />
      </Section>

      {/* Scheduler card */}
      <Section title="แผงสถานะ Force Logout Scheduler">
        <p>ที่ด้านบนของหน้าจะแสดงสถานะของ scheduler ที่ทำการ force logout อัตโนมัติ:</p>
        <Table
          headers={['ฟิลด์', 'ความหมาย']}
          rows={[
            ['Scheduler', 'Enabled = ทำงานปกติ / Disabled = หยุดอยู่'],
            ['Configured Times', 'เวลา force logout อัตโนมัติ (default 07:35 และ 19:20 Asia/Bangkok)'],
            ['Last Run', 'เวลาที่ scheduler ทำงานล่าสุด'],
            ['Last Killed', 'จำนวน session ที่ถูกล้างในรอบล่าสุด'],
          ]}
        />
        <InfoBox title="💡 หมายเหตุ">
          เวลา force logout ถูกตั้งค่าผ่าน environment variable <code>FORCE_LOGOUT_TIMES</code> บน server
          (รูปแบบ HH:MM คั่นด้วยจุลภาค เช่น <code>07:35,19:20</code>) ต้องรีสตาร์ท server หลังเปลี่ยนค่า
        </InfoBox>
      </Section>

      {/* Kick a single user */}
      <Section title="การบังคับ Logout ผู้ใช้รายเดียว (Kick Session)">
        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'ค้นหาผู้ใช้ที่ต้องการในตาราง (ใช้ช่อง Search ด้านบน)' },
            { label: 'ขั้นตอนที่ 2', description: 'คลิกปุ่ม "Kick" สีแดงที่คอลัมน์ Actions' },
            { label: 'ขั้นตอนที่ 3', description: 'ในกล่องยืนยัน อ่านชื่อผู้ใช้ที่จะถูก logout ให้ละเอียด' },
            { label: 'ขั้นตอนที่ 4', description: 'คลิก "Terminate" เพื่อสิ้นสุด session ทันที' },
            { label: 'ขั้นตอนที่ 5', description: 'ตารางจะ refresh อัตโนมัติ ผู้ใช้คนนั้นจะหายจากรายการ' },
          ]}
        />

        <Subsection title="ผลลัพธ์ที่ผู้ใช้จะเห็น">
          <List
            items={[
              'หน้าจอจะถูกพาไปหน้า Login ในการ request API ครั้งถัดไป (เมื่อ session ตรวจพบว่าไม่ valid)',
              'ผู้ใช้ต้อง login ใหม่หากต้องการกลับเข้าระบบ',
              'งานที่ยังไม่บันทึกในหน้าจอจะหายไป — แจ้งผู้ใช้ให้บันทึกก่อนถ้าเป็นไปได้',
            ]}
          />
        </Subsection>
      </Section>

      {/* Force logout all */}
      <Section title="การ Force Logout ทุกผู้ใช้พร้อมกัน">
        <WarningBox title="⚠️ คำเตือน">
          ปุ่ม "Force Logout All" จะ logout <strong>ทุกคนรวมตัวคุณเอง</strong> ใช้เมื่อจำเป็นเท่านั้น เช่น:
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>ทดสอบว่า scheduler ทำงานถูกต้อง</li>
            <li>มีเหตุการณ์ความปลอดภัยต้องเคลียร์ session ทั้งหมด</li>
            <li>เคลียร์ session ค้างหลังเปลี่ยนการตั้งค่าระบบ</li>
          </ul>
        </WarningBox>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'คลิกปุ่ม "Force Logout All" สีแดงที่มุมขวาบน' },
            { label: 'ขั้นตอนที่ 2', description: 'อ่านคำเตือนในกล่องยืนยัน' },
            { label: 'ขั้นตอนที่ 3', description: 'คลิก "Force Logout All" เพื่อยืนยัน' },
            { label: 'ขั้นตอนที่ 4', description: 'ทุก session ถูกล้าง — คุณจะถูกพาไปหน้า Login' },
          ]}
        />
      </Section>

      {/* Auto refresh */}
      <Section title="Auto-refresh">
        <p>
          ตารางมี checkbox <strong>"Auto-refresh every 30s"</strong> เปิดอยู่โดย default
          ระบบจะดึงข้อมูล session ใหม่ทุก 30 วินาทีโดยอัตโนมัติ ทำให้เห็นรายการ session ปัจจุบันเสมอ
        </p>
        <List
          items={[
            'หากไม่ต้องการให้ rotate ข้อมูล ปิด checkbox นี้',
            'กดปุ่ม "Refresh" เพื่อดึงข้อมูลทันที',
          ]}
        />
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี (Best Practices)">
        <List
          items={[
            '✅ ใช้ Kick กับ session ที่ค้างหรือไม่ตรงกับการใช้งานจริงเท่านั้น',
            '✅ ตรวจสอบเวลา Last Activity เพื่อหา session เก่าที่อาจไม่ได้ใช้แล้ว',
            '✅ ก่อน Force Logout All ให้แจ้งผู้ใช้งานล่วงหน้าหากเป็นไปได้',
            '✅ ใช้คู่กับหน้า Login Logs เพื่อยืนยันว่าผู้ใช้ login กลับเข้าระบบได้สำเร็จ',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ผู้ใช้แจ้งว่ายังไม่ถูก logout ตามเวลา 07:35 / 19:20',
              'ตรวจสอบสถานะ Scheduler ในหน้านี้ว่าเป็น Enabled, ดูค่า Last Run ว่าทำงานตรงเวลา',
            ],
            [
              'Kick แล้วผู้ใช้ยังเห็นหน้าจอเดิม',
              'ผู้ใช้จะถูกพาออกในการ request API ครั้งถัดไป — ปกติภายในไม่กี่วินาที',
            ],
            [
              'จำนวน session ในตารางมากผิดปกติ',
              'อาจมีบัญชีที่ login ค้างหลายอุปกรณ์ — เปรียบเทียบกับ Login Logs',
            ],
          ]}
        />
      </Section>
    </TrainingLayout>
  );
};

export default T51_ActiveSessionsPage;
