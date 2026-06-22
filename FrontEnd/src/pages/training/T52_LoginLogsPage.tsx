// client/src/pages/training/T52_LoginLogsPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  Subsection,
  List,
  InfoBox,
} from '../../components/training/TrainingComponents';

/**
 * Login Logs Training Page
 *
 * Quick Reference Card #52: บันทึกการเข้า-ออกระบบ
 */
const T52_LoginLogsPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={52}
      totalCards={53}
      title="บันทึกการเข้า-ออกระบบ"
      subtitle="Login Logs (Auth Audit Trail)"
      icon="📜"
      nextLink="/training/purge-policies"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            หน้านี้แสดงประวัติเหตุการณ์ทุกการเข้า-ออกระบบ
            ใช้เพื่อตรวจสอบความปลอดภัย, ติดตามผู้ใช้ที่ login ผิด, ตรวจสอบเวลาเข้าทำงาน,
            และตรวจสอบว่าระบบ force logout ทำงานถูกต้องหรือไม่
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 Path</h4>
          <code style={{ background: '#fff', padding: '8px', borderRadius: '4px', display: 'block' }}>
            Users → Login Log  ( /admin/login-logs )
          </code>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#856404' }}>
            สิทธิ์: Admin เท่านั้น
          </p>
        </div>
      </Section>

      {/* Event types */}
      <Section title="ประเภทเหตุการณ์ (Event Types)">
        <Table
          headers={['ประเภท', 'ความหมาย', 'สี Badge']}
          rows={[
            ['Login OK', 'ผู้ใช้ login สำเร็จ', 'เขียว'],
            ['Login Failed', 'login ไม่สำเร็จ (ผิด password / บัญชีถูกปิด)', 'แดง'],
            ['Logout', 'ผู้ใช้กดปุ่ม logout เอง', 'น้ำเงิน'],
            ['Force Logout', 'ระบบบังคับ logout ตามเวลาที่ตั้ง (07:35 / 19:20)', 'ส้ม'],
            ['Expired', 'session หมดอายุตามเวลาของ cookie', 'เทา'],
            ['Kicked', 'admin บังคับ logout ผู้ใช้รายเดียวจากหน้า Active Sessions', 'ม่วง'],
          ]}
        />
      </Section>

      {/* Filters */}
      <Section title="การกรองข้อมูล (Filters)">
        <Subsection title="ช่วงเวลา (From / To)">
          <List
            items={[
              'From: ค่าเริ่มต้นคือเวลา 00:00 ของวันนี้',
              'To: ค่าเริ่มต้นคือเวลาปัจจุบัน',
              'รองรับวินาทีของ datetime-local เพื่อระบุช่วงที่แม่นยำ',
              'หากตั้งช่วงกว้างเกินไป ระบบจะ truncate ผลลัพธ์เพื่อความเร็ว — ลดช่วงให้แคบลง',
            ]}
          />
        </Subsection>

        <Subsection title="Username">
          <p>กรอก username แบบเป๊ะ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) เพื่อดูเฉพาะเหตุการณ์ของผู้ใช้คนนั้น</p>
        </Subsection>

        <Subsection title="Event types">
          <p>คลิกที่ chip ของแต่ละประเภทเพื่อเปิด/ปิด chip ที่ active จะมีสีตามประเภท chip ที่ปิดจะเป็นสีเทา</p>
        </Subsection>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'ตั้งค่าช่วง From / To ที่ต้องการ' },
            { label: 'ขั้นตอนที่ 2', description: '(ทางเลือก) กรอก Username หากต้องการเฉพาะคน' },
            { label: 'ขั้นตอนที่ 3', description: '(ทางเลือก) เลือกประเภทเหตุการณ์โดยคลิก chips' },
            { label: 'ขั้นตอนที่ 4', description: 'คลิกปุ่ม "Apply" เพื่อค้นหา' },
            { label: 'รีเซ็ต', description: 'คลิก "Reset" เพื่อกลับไปยัง default (วันนี้, ทุกประเภท)' },
          ]}
        />
      </Section>

      {/* Columns */}
      <Section title="คอลัมน์ในตารางผลลัพธ์">
        <Table
          headers={['คอลัมน์', 'ความหมาย']}
          rows={[
            ['When', 'เวลาที่เกิดเหตุการณ์ (เวลาท้องถิ่น Asia/Bangkok)'],
            ['Type', 'ประเภทเหตุการณ์ (badge สีตามประเภท)'],
            ['User', 'username ที่เกี่ยวข้อง (system = ระบบทำเอง)'],
            ['IP', 'IP address ของ client'],
            ['Reason', 'รายละเอียดเพิ่มเติม เช่น INVALID_CREDENTIALS, SCHEDULED:07:35, ADMIN_KICK'],
            ['Actor', 'ผู้กระทำหากเป็น action จาก admin (เช่น kicker username)'],
            ['Session', 'session ID ย่อ — hover เพื่อดูเต็ม'],
          ]}
        />
      </Section>

      {/* Export CSV */}
      <Section title="การ Export CSV">
        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'กรองข้อมูลในช่วงเวลาที่ต้องการให้เห็นในตาราง' },
            { label: 'ขั้นตอนที่ 2', description: 'คลิกปุ่ม "Export CSV" ที่มุมขวาบน' },
            { label: 'ขั้นตอนที่ 3', description: 'ไฟล์ auth-events-YYYY-MM-DD.csv จะถูกดาวน์โหลด' },
          ]}
        />
        <InfoBox title="💡 หมายเหตุ">
          ไฟล์ CSV จะมีเฉพาะแถวที่กำลังแสดงอยู่ในหน้านี้ (1 หน้า) — หากต้องการช่วงกว้าง
          ให้ตั้งค่า limit ที่หน้าก่อน หรือ export หลายครั้งสำหรับช่วงต่างๆ
        </InfoBox>
      </Section>

      {/* Data retention */}
      <Section title="ระยะเวลาเก็บข้อมูล (Data Retention)">
        <p>
          ระบบเก็บไฟล์ log ของเหตุการณ์ auth ใน <code>logs/auth-events-YYYY-MM-DD.log</code>
          โดยมี Purge Janitor ทำการลบไฟล์เก่าโดยอัตโนมัติตาม policy ที่ตั้งไว้ในหน้า Purge Policies
        </p>
        <List
          items={[
            'Default: เก็บ 90 วัน',
            'ดูสถานะ retention ที่หน้า Purge Policies — target key: auth_events',
            'ปรับเปลี่ยนค่า retention_days ผ่าน UI ของหน้า Purge Policies ได้ทันที (ไม่ต้องรีสตาร์ท)',
          ]}
        />
      </Section>

      {/* Use cases */}
      <Section title="กรณีการใช้งาน (Use Cases)">
        <Table
          headers={['สถานการณ์', 'วิธีค้นหา']}
          rows={[
            [
              'มีคนพยายาม login ผิดหลายครั้ง',
              'กรอง type = Login Failed และดูแถวซ้ำของ username เดียวกัน',
            ],
            [
              'ตรวจสอบว่า force logout 19:20 ทำงานปกติหรือไม่',
              'ตั้งช่วงเวลาคร่อม 19:20 ของวัน, กรอง type = Force Logout',
            ],
            [
              'ผู้ใช้แจ้งว่าระบบ logout เองตอนกลางดึก',
              'ค้นหาตาม username ดู type = Force Logout / Expired ในช่วงเวลาที่แจ้ง',
            ],
            [
              'ตรวจสอบว่า admin คนใดกด Kick',
              'กรอง type = Kicked และดู Actor',
            ],
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'แสดง "result was truncated"',
              'ลดช่วงเวลา From/To ให้แคบลง หรือกรองตาม username',
            ],
            [
              'ไม่เห็นเหตุการณ์ของวันก่อน',
              'ตรวจสอบว่า retention ที่ Purge Policies ครอบคลุมหรือไม่ — อาจถูก purge ไปแล้ว',
            ],
            [
              'เวลาในคอลัมน์ When ดูผิด',
              'หากเห็นเวลาเก่ากว่าจริง 7 ชั่วโมง อาจเป็น log เก่าก่อนเปลี่ยนเป็น local time format — รอให้ rotate ออก',
            ],
          ]}
        />
      </Section>
    </TrainingLayout>
  );
};

export default T52_LoginLogsPage;
