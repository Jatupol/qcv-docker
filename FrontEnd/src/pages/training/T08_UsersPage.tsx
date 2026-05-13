// client/src/pages/training/T08_UsersPage.tsx

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
 * Users Management Training Page
 *
 * Quick Reference Card #8: การจัดการผู้ใช้งาน
 */
const T08_UsersPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={8}
      totalCards={48}
      title="การจัดการผู้ใช้งาน"
      subtitle="Users Management"
      icon="👥"
      nextLink="/training/lar-report"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            ระบบการจัดการผู้ใช้งานช่วยให้ผู้ดูแลระบบสามารถเพิ่ม แก้ไข ลบ และจัดการสิทธิ์ของผู้ใช้งานในระบบได้
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 Path</h4>
          <code style={{ background: '#fff', padding: '8px', borderRadius: '4px', display: 'block' }}>
            /settings/users
          </code>
        </div>
      </Section>

      {/* User Roles */}
      <Section title="บทบาทผู้ใช้งาน (User Roles)">
        <Table
          headers={['บทบาท', 'สิทธิ์การเข้าถึง', 'คำอธิบาย']}
          rows={[
            [
              'Admin',
              'เต็มทุกอย่าง',
              'จัดการผู้ใช้, ตั้งค่าระบบ, ดูข้อมูลทั้งหมด',
            ],
            [
              'Manager',
              'ดู + แก้ไข + ลบ',
              'จัดการข้อมูล, อนุมัติ, ดูรายงาน',
            ],
            [
              'User',
              'ดู + บันทึก',
              'บันทึกข้อมูลการตรวจสอบ, ดูรายงานพื้นฐาน',
            ],
            [
              'Viewer',
              'ดูอย่างเดียว',
              'ดูข้อมูลและรายงานเท่านั้น',
            ],
          ]}
        />
      </Section>

      {/* Add New User */}
      <Section title="การเพิ่มผู้ใช้งานใหม่">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Settings → Users Management',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกปุ่ม "+ Add New User" ที่มุมขวาบน',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'กรอกข้อมูลที่จำเป็น: Username, Full Name, Email, Role',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'กำหนดรหัสผ่านเริ่มต้น (ผู้ใช้ควรเปลี่ยนหลังเข้าสู่ระบบครั้งแรก)',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'คลิก "Save" เพื่อสร้างผู้ใช้งาน',
            },
          ]}
        />

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404' }}>
            ⚠️ ข้อควรระวัง:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Username ต้องไม่ซ้ำกับผู้ใช้งานที่มีอยู่</li>
            <li>Email ต้องเป็นรูปแบบที่ถูกต้อง (example@domain.com)</li>
            <li>รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</li>
            <li>เลือก Role ที่เหมาะสมตามหน้าที่ของผู้ใช้</li>
          </ul>
        </div>
      </Section>

      {/* Edit User */}
      <Section title="การแก้ไขข้อมูลผู้ใช้งาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ค้นหาผู้ใช้งานในรายการ (ใช้ช่อง Search)',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกปุ่ม "Edit" (ไอคอนดินสอ) ที่แถวของผู้ใช้งาน',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'แก้ไขข้อมูลที่ต้องการ (ชื่อ, อีเมล, บทบาท, สถานะ)',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิก "Save Changes" เพื่อบันทึก',
            },
          ]}
        />

        <Subsection title="การเปลี่ยนบทบาท (Change Role)">
          <List
            items={[
              'เลือก Role ใหม่จาก dropdown',
              'ระบบจะขอยืนยันก่อนเปลี่ยนบทบาท',
              'การเปลี่ยนบทบาทมีผลทันทีหลังบันทึก',
              'ผู้ใช้งานอาจต้อง logout และ login ใหม่เพื่อให้สิทธิ์อัพเดท',
            ]}
          />
        </Subsection>

        <Subsection title="การรีเซ็ตรหัสผ่าน (Reset Password)">
          <List
            items={[
              'คลิกปุ่ม "Reset Password" ในหน้าแก้ไขผู้ใช้',
              'กำหนดรหัสผ่านชั่วคราวใหม่',
              'แจ้งรหัสผ่านใหม่ให้กับผู้ใช้งานอย่างปลอดภัย',
              'แนะนำให้ผู้ใช้เปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ',
            ]}
          />
        </Subsection>
      </Section>

      {/* Deactivate/Delete User */}
      <Section title="การปิดใช้งาน/ลบผู้ใช้งาน">
        <Subsection title="การปิดใช้งาน (Deactivate) - แนะนำ">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'เลือกผู้ใช้งานที่ต้องการปิดใช้งาน',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Deactivate" หรือเปลี่ยน Status เป็น "Inactive"',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ยืนยันการปิดใช้งาน',
              },
            ]}
          />
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>
            ✅ ข้อดี: เก็บประวัติข้อมูลไว้, สามารถเปิดใช้งานใหม่ได้
          </p>
        </Subsection>

        <Subsection title="การลบผู้ใช้งาน (Delete) - ไม่แนะนำ">
          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', border: '2px solid #f5c6cb' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>⚠️ คำเตือน</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>การลบผู้ใช้จะลบข้อมูลถาวร ไม่สามารถกู้คืนได้</li>
              <li>ประวัติการบันทึกข้อมูลที่ทำโดยผู้ใช้จะยังคงอยู่</li>
              <li>ควรใช้การปิดใช้งานแทนการลบ</li>
            </ul>
          </div>
        </Subsection>
      </Section>

      {/* User Management Features */}
      <Section title="ฟีเจอร์การจัดการผู้ใช้งาน">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>🔍 การค้นหาและกรอง</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ค้นหาตามชื่อ, username, email หรือกรองตาม role และสถานะ
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 การจัดเรียง</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เรียงตามชื่อ, วันที่สร้าง, หรือการเข้าสู่ระบบล่าสุด
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📋 Bulk Actions</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เลือกหลายผู้ใช้พร้อมกันเพื่อเปลี่ยนสถานะหรือส่งอีเมล
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📜 Activity Log</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ดูประวัติการเข้าสู่ระบบและกิจกรรมของผู้ใช้
            </p>
          </div>
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี (Best Practices)">
        <List
          items={[
            '✅ ตรวจสอบและอัพเดทรายการผู้ใช้งานอย่างสม่ำเสมอ',
            '✅ ปิดใช้งานบัญชีที่ไม่ได้ใช้งานแทนการลบ',
            '✅ กำหนด Role ตามหลักการ "Least Privilege" (สิทธิ์ต่ำสุดที่จำเป็น)',
            '✅ บังคับให้เปลี่ยนรหัสผ่านเริ่มต้นหลังเข้าสู่ระบบครั้งแรก',
            '✅ ตรวจสอบ activity log เป็นประจำเพื่อความปลอดภัย',
            '✅ เก็บ log การเปลี่ยนแปลง role และสิทธิ์',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ผู้ใช้ไม่สามารถเข้าสู่ระบบได้',
              'ตรวจสอบสถานะ Active, รีเซ็ตรหัสผ่าน, ตรวจสอบ role',
            ],
            [
              'ผู้ใช้ไม่เห็นเมนูบางอย่าง',
              'ตรวจสอบ role ว่าถูกต้อง, ให้ logout และ login ใหม่',
            ],
            [
              'ไม่สามารถลบผู้ใช้ได้',
              'ใช้การปิดใช้งานแทน หรือตรวจสอบว่ามีข้อมูลที่เชื่อมโยงอยู่',
            ],
            [
              'Username ซ้ำ',
              'เปลี่ยน username ใหม่ที่ไม่ซ้ำกับที่มีอยู่',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>ติดต่อ:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ผู้ดูแลระบบหลัก (System Administrator)</li>
          <li>ฝ่าย IT Support</li>
          <li>ดู USERS_MANUAL.md สำหรับข้อมูลเพิ่มเติม</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T08_UsersPage;
