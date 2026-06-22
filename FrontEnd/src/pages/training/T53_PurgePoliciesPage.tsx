// client/src/pages/training/T53_PurgePoliciesPage.tsx

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
  SuccessBox,
} from '../../components/training/TrainingComponents';

/**
 * Purge Policies Training Page
 *
 * Quick Reference Card #53: นโยบายการลบข้อมูลเก่า
 */
const T53_PurgePoliciesPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={53}
      totalCards={53}
      title="นโยบายการลบข้อมูลเก่า"
      subtitle="Configurable Purge Policies"
      icon="🗑️"
    >
      {/* Overview */}
      <Section title="ภาพรวม">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            หน้านี้ใช้กำหนดว่าข้อมูลแต่ละประเภท (target) จะถูกเก็บไว้กี่วันก่อนถูกลบโดยอัตโนมัติ
            ระบบมี Janitor ที่ทำงานทุกวันเวลา 03:15 น. (Asia/Bangkok) เพื่อลบข้อมูลที่เกินอายุที่กำหนด
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 Path</h4>
          <code style={{ background: '#fff', padding: '8px', borderRadius: '4px', display: 'block' }}>
            Users → Purge Policies  ( /admin/purge )
          </code>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#856404' }}>
            สิทธิ์: Admin เท่านั้น
          </p>
        </div>
      </Section>

      {/* Targets */}
      <Section title="เป้าหมายที่รองรับ (Targets)">
        <Subsection title="ประเภทของ Target">
          <Table
            headers={['ประเภท', 'ความหมาย', 'ลบได้หรือไม่']}
            rows={[
              ['Built-in', 'Target ที่ฝังมากับโค้ดของระบบ (มี 🔒 built-in badge)', 'ไม่ได้ — ลบไม่ได้'],
              ['User-added', 'Target ที่ admin เพิ่มเองผ่านปุ่ม Add Policy', 'ได้ — มีปุ่ม Delete'],
            ]}
          />
        </Subsection>

        <Subsection title="Target Built-in (มาในระบบ)">
          <Table
            headers={['Target Key', 'ประเภท', 'ข้อมูลที่ถูกลบ', 'Default Retention']}
            rows={[
              ['auth_events', 'File', 'ไฟล์ NDJSON ของ login/logout log ที่เก่าเกินกำหนด', '90 วัน'],
              ['log_interface', 'DB Table', 'แถวใน log_interface (audit ของ MSSQL sync) ที่เก่าเกินกำหนด', '90 วัน'],
            ]}
          />
        </Subsection>

        <Subsection title="ตารางที่อนุญาตให้ admin เพิ่มได้ (Whitelist)">
          <p>
            เพื่อความปลอดภัย admin สามารถเพิ่ม policy ได้เฉพาะตารางที่อยู่ใน whitelist เท่านั้น
            (ป้องกันการลบข้อมูลในตารางสำคัญเช่น <code>users</code> หรือ <code>session</code> โดยไม่ตั้งใจ)
          </p>
          <Table
            headers={['Table', 'Timestamp Column', 'Label']}
            rows={[
              ['log_interface', 'import_date', 'MSSQL Sync Audit Log'],
              ['defectdata', 'defect_date', 'Defect Data'],
              ['inspectiondata', 'inspection_date', 'Inspection Data'],
              ['defectdata_customer', 'defect_date', 'Defect Data (Customer)'],
              ['inspectiondata_customer', 'updated_at', 'Inspection Data (Customer)'],
              ['inf_checkin', 'imported_at', 'INF Check-in'],
              ['inf_lotinput', 'inputdate', 'INF Lot Input'],
              ['inf_useroperation', 'imported_at', 'INF User Operation'],
            ]}
          />
          <InfoBox title="💡 ต้องการเพิ่มตารางใหม่?">
            ติดต่อทีมพัฒนาให้เพิ่มเข้า whitelist ใน server code (<code>allowedTables.ts</code>) แล้ว restart server
          </InfoBox>
        </Subsection>
      </Section>

      {/* Scheduler card */}
      <Section title="แผงสถานะ Scheduler">
        <p>ที่ด้านบนของหน้า:</p>
        <Table
          headers={['ฟิลด์', 'ความหมาย']}
          rows={[
            ['Scheduler', 'Enabled = ทำงานอัตโนมัติ / Disabled = หยุด'],
            ['Schedule', '15 3 * * * (cron: 03:15 ทุกวัน) ใน timezone Asia/Bangkok'],
            ['Started At', 'เวลาที่ janitor เริ่มทำงาน (ตอน server boot)'],
            ['Last Full Run', 'รอบล่าสุดที่รันทุก policy พร้อมกัน'],
          ]}
        />
      </Section>

      {/* Edit retention */}
      <Section title="การแก้ไขจำนวนวันเก็บข้อมูล (Retention Days)">
        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'หาแถวของ target ที่ต้องการในตาราง' },
            { label: 'ขั้นตอนที่ 2', description: 'แก้ตัวเลขในช่อง Retention (days) — ค่าน้อยสุดคือ 1' },
            { label: 'ขั้นตอนที่ 3', description: 'หากต้องการปิด/เปิด target คลิกที่ Toggle Switch ในคอลัมน์ Enabled (ดูหัวข้อถัดไป)' },
            { label: 'ขั้นตอนที่ 4', description: 'ปุ่ม "Save" จะปรากฏที่คอลัมน์ Actions เมื่อมีการแก้ค่า' },
            { label: 'ขั้นตอนที่ 5', description: 'คลิก "Save" — การเปลี่ยนแปลงจะมีผลทันที (ไม่ต้องรีสตาร์ท server)' },
          ]}
        />

        <SuccessBox title="✅ ข้อดี">
          <List
            items={[
              'ค่าถูกเก็บใน DB — survives server restart',
              'ปุ่ม Save จะ disable ปุ่ม Dry Run/Run Now ขณะที่ค่าเปลี่ยนแต่ยังไม่ save (ป้องกันความสับสน)',
            ]}
          />
        </SuccessBox>
      </Section>

      {/* Toggle enable */}
      <Section title="การเปิด-ปิด Policy ด้วย Toggle Switch">
        <p>
          คอลัมน์ <strong>Enabled</strong> ใช้ Toggle Switch (ปุ่มสไลด์) เหมือนสวิตช์ไฟ
          เพื่อเปิดหรือปิดการทำงานของ policy นั้นในรอบ scheduled run และปุ่ม "Run All Enabled"
        </p>
        <Table
          headers={['สถานะ', 'หน้าตา', 'ความหมาย']}
          rows={[
            ['On', 'Toggle สีส้ม (primary), หัวสไลด์อยู่ขวา, ป้าย "On" สีเขียว', 'Policy จะรันอัตโนมัติทุกวัน 03:15 และเมื่อกด Run All'],
            ['Off', 'Toggle สีเทา, หัวสไลด์อยู่ซ้าย, ป้าย "Off" สีเทา', 'Policy ถูกข้าม ไม่รันอัตโนมัติ — แต่ยังกด Dry Run / Run Now ได้'],
          ]}
        />

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'คลิกที่ Toggle Switch เพื่อสลับสถานะ — รอวันที่ Save จึงมีผล' },
            { label: 'ขั้นตอนที่ 2', description: 'ปุ่ม "Save" จะปรากฏ' },
            { label: 'ขั้นตอนที่ 3', description: 'คลิก "Save" — สถานะมีผลทันที' },
          ]}
        />

        <InfoBox title="💡 เคล็ดลับ">
          ใช้ Off แทนการตั้ง retention สูงมาก เมื่อต้องการ "หยุดชั่วคราว" — ดีกว่าเพราะไม่ทำให้คนสับสนว่าค่า retention ที่เห็นคือค่าจริง
        </InfoBox>
      </Section>

      {/* Add new policy */}
      <Section title="การเพิ่ม Policy ใหม่ (Add Policy)">
        <p>
          Admin สามารถเพิ่ม policy ใหม่ผ่าน UI ได้ โดยเลือกจากรายการตารางที่อยู่ใน whitelist
          ระบบจะสร้าง SQL DELETE แบบ dynamic ตามตาราง + คอลัมน์ที่เลือก ไม่ต้องเขียนโค้ดเพิ่ม
        </p>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'คลิกปุ่ม "Add Policy" สีเขียวที่มุมขวาบน' },
            { label: 'ขั้นตอนที่ 2', description: 'เลือกตารางจาก dropdown — ตารางที่มี policy แล้วจะถูก disable' },
            { label: 'ขั้นตอนที่ 3', description: 'Target Key จะถูกเติมอัตโนมัติจากชื่อตาราง (แก้ไขได้)' },
            { label: 'ขั้นตอนที่ 4', description: 'กรอก Retention (days) — ค่าเริ่มต้น 90' },
            { label: 'ขั้นตอนที่ 5', description: 'Label จะถูกเติมอัตโนมัติจาก whitelist (แก้ไขได้)' },
            { label: 'ขั้นตอนที่ 6', description: 'คลิก "Create" — policy ใหม่ปรากฏในตารางทันที (Enabled = On)' },
          ]}
        />

        <Subsection title="หลังสร้าง Policy แล้ว">
          <List
            items={[
              'แนะนำให้คลิก Dry Run ก่อนเพื่อตรวจสอบจำนวนที่จะถูกลบ',
              'หากจำนวนสมเหตุสมผล จึงคลิก Run Now หรือรอ scheduler 03:15',
              'หากต้องการยกเลิกใช้ ให้กดปุ่ม Delete (เห็นเฉพาะ policy ที่ admin เพิ่มเอง)',
            ]}
          />
        </Subsection>

        <WarningBox title="⚠️ ข้อจำกัด">
          <List
            items={[
              'Target Key ต้องเป็นตัวพิมพ์เล็ก/ตัวเลข/_ ขึ้นต้นด้วยตัวอักษร ความยาวไม่เกิน 50 ตัว',
              'Target Key ต้องไม่ซ้ำกับ key ที่มีอยู่ และต้องไม่ตรงกับ key ของ built-in target',
              'เลือกได้เฉพาะตารางที่อยู่ใน whitelist เท่านั้น',
            ]}
          />
        </WarningBox>
      </Section>

      {/* Delete policy */}
      <Section title="การลบ Policy (Delete)">
        <p>
          Policy ที่ admin เพิ่มเองสามารถลบได้ — ปุ่ม Delete จะแสดงเฉพาะแถวที่ <strong>ไม่มี</strong> badge 🔒 built-in
          การลบนี้เป็นการลบ <strong>การตั้งค่าเท่านั้น</strong> ไม่ลบข้อมูลจริงในตาราง
        </p>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'หาแถวของ policy ที่ต้องการลบ' },
            { label: 'ขั้นตอนที่ 2', description: 'คลิกปุ่ม "Delete" ที่คอลัมน์ Actions' },
            { label: 'ขั้นตอนที่ 3', description: 'อ่านกล่องยืนยัน ตรวจชื่อให้ถูกต้อง' },
            { label: 'ขั้นตอนที่ 4', description: 'คลิก "Delete" — policy หายจากตาราง' },
          ]}
        />

        <InfoBox title="💡 ทำไมลบ built-in ไม่ได้?">
          built-in target มี code module ฝั่ง server ที่จัดการเอง การลบแถวใน DB จะทำให้ระบบสับสน
          หากต้องการ "ปิดการทำงาน" ของ built-in ใช้ Toggle Off แทน
        </InfoBox>
      </Section>

      {/* Dry run */}
      <Section title="การ Dry Run (พรีวิวก่อนลบจริง)">
        <p>
          Dry Run คือการ <strong>นับ</strong> จำนวนข้อมูลที่จะถูกลบ โดยไม่มีการลบจริง
          เป็นวิธีที่ปลอดภัยที่สุดในการตรวจสอบว่าค่า retention ที่ตั้งไว้ถูกต้องหรือไม่
        </p>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'แก้ค่า Retention ตามต้องการแล้ว Save' },
            { label: 'ขั้นตอนที่ 2', description: 'คลิกปุ่ม "Dry Run" ที่คอลัมน์ Actions' },
            { label: 'ขั้นตอนที่ 3', description: 'ระบบจะแสดง Toast แจ้งจำนวนรายการที่จะลบ และอัปเดตคอลัมน์ Last Dry Run' },
            { label: 'ขั้นตอนที่ 4', description: 'ตรวจสอบจำนวนว่าสมเหตุสมผลก่อนกด Run Now' },
          ]}
        />
      </Section>

      {/* Run now */}
      <Section title="การ Run Now (ลบทันที)">
        <WarningBox title="⚠️ การลบเป็นแบบถาวร">
          ข้อมูลที่ถูกลบไม่สามารถกู้คืนได้ — ควร Dry Run ก่อนเสมอ และตรวจสอบ Last Dry Run ที่กล่องยืนยัน
        </WarningBox>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'ตรวจ Last Dry Run ของ target นั้นว่ามีค่าและเป็นจำนวนที่คาดหวัง' },
            { label: 'ขั้นตอนที่ 2', description: 'คลิกปุ่ม "Run Now" สีแดง' },
            { label: 'ขั้นตอนที่ 3', description: 'อ่านกล่องยืนยัน — ระบบจะแสดงจำนวน Last Dry Run เพื่อช่วยตัดสินใจ' },
            { label: 'ขั้นตอนที่ 4', description: 'คลิก "Run" เพื่อยืนยันการลบ' },
            { label: 'ขั้นตอนที่ 5', description: 'Toast แจ้งผล และคอลัมน์ Last Run จะอัปเดต' },
          ]}
        />

        <Subsection title="หมายเหตุ">
          <List
            items={[
              'ปุ่ม Run Now จะถูก disable หาก target ถูกตั้ง Enabled = Off',
              'ปุ่ม Run Now จะถูก disable หากค่ายังไม่ Save',
              'การ Run Now จะถูกบันทึกใน Login Logs ด้วย type = Force Logout (audit channel)',
            ]}
          />
        </Subsection>
      </Section>

      {/* Run all */}
      <Section title="การ Run All Enabled">
        <p>
          ปุ่ม "Run All Enabled" ที่มุมขวาบนจะรัน <strong>ทุก policy ที่ Enabled</strong> ตามลำดับ
          เป็นวิธีจำลองการทำงานของ scheduler 03:15 ทันที
        </p>

        <StepBox
          steps={[
            { label: 'ขั้นตอนที่ 1', description: 'คลิกปุ่ม "Run All Enabled"' },
            { label: 'ขั้นตอนที่ 2', description: 'ตรวจสอบจำนวน target ที่จะรันในกล่องยืนยัน' },
            { label: 'ขั้นตอนที่ 3', description: 'คลิก "Run All" เพื่อยืนยัน' },
            { label: 'ขั้นตอนที่ 4', description: 'Toast แจ้งจำนวนรวมที่ลบ และตารางจะ refresh ค่า Last Run ของทุกแถว' },
          ]}
        />
      </Section>

      {/* Best Practices */}
      <Section title="แนวปฏิบัติที่ดี (Best Practices)">
        <List
          items={[
            '✅ Dry Run ก่อน Run Now เสมอ — โดยเฉพาะหลังเปลี่ยนค่า retention หรือเพิ่ม policy ใหม่',
            '✅ ตั้งค่า retention ตามข้อกำหนด compliance ขององค์กร (เช่น log security 90 วัน)',
            '✅ ปิด policy ด้วย Toggle Off ดีกว่าตั้ง retention สูงมาก หรือดีกว่าลบทิ้ง',
            '✅ เมื่อเพิ่ม policy ใหม่: เริ่มจาก retention ค่าสูง (เช่น 365 วัน) แล้วค่อยลด หลังจากดู Dry Run แล้วมั่นใจ',
            '✅ ตรวจสอบ Last Run / Last Removed Count เป็นประจำเพื่อยืนยันว่า scheduler ทำงาน',
            '✅ บันทึกการเพิ่ม/ลบ policy และการเปลี่ยนค่า retention ในเอกสารภายในของทีม',
          ]}
        />
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'Last Run ของ target ไม่อัปเดตหลายวัน',
              'ตรวจสอบสถานะ Scheduler ว่า Enabled, ดู log ของ server ว่ามี error',
            ],
            [
              'Dry Run แสดง 0 แต่คาดว่าควรมี',
              'ตรวจสอบ retention_days อีกครั้ง — cutoff คือ "เก่ากว่าวันนี้ลบไป N วัน" (exclusive)',
            ],
            [
              'Run Now ล้มเหลวพร้อม error',
              'อ่านข้อความ error ใน Toast — มักเกิดจากปัญหา DB connection หรือสิทธิ์ไฟล์ใน logs/',
            ],
            [
              'ต้องการเพิ่ม policy ใหม่ที่ไม่อยู่ใน whitelist',
              'ติดต่อทีมพัฒนาเพื่อเพิ่มตารางเข้า whitelist (ใน allowedTables.ts) แล้ว restart server',
            ],
            [
              'Add Policy แล้วเลือกตารางไม่ได้ (disabled)',
              'ตารางนั้นมี policy อยู่แล้ว — กลับไปแก้ที่แถวเดิม หรือลบ policy เก่าก่อนเพิ่มใหม่',
            ],
            [
              'ปุ่ม Delete ไม่มีในแถวที่ต้องการ',
              'นั่นเป็น built-in target ลบไม่ได้ — ใช้ Toggle Off เพื่อปิดการทำงานแทน',
            ],
          ]}
        />
      </Section>
    </TrainingLayout>
  );
};

export default T53_PurgePoliciesPage;
