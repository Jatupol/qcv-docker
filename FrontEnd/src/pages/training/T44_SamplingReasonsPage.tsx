// client/src/pages/training/T44_SamplingReasonsPage.tsx

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
 * Sampling Reasons Master Data Training Page
 *
 * Quick Reference Card #44: Sampling Reasons Management
 */
const T44_SamplingReasonsPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={44}
      totalCards={48}
      title="Sampling Reasons"
      subtitle="การจัดการข้อมูลเหตุผลการสุ่มตัวอย่าง"
      icon="📋"
      nextLink="/training/t12"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมของ Sampling Reasons">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            Sampling Reasons ใช้สำหรับจัดการเหตุผลการสุ่มตัวอย่าง ซึ่งจะถูกใช้ในขั้นตอนที่ 1 ของการบันทึก
            Inspection (OQA, OBA, SIV) เมื่อผู้ใช้เลือก "Select Sampling Reason"
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Master Data → Sampling Reasons &nbsp; | &nbsp; /master-data/samplingResons
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#856404' }}>
            <strong>สิทธิ์การเข้าถึง:</strong> Admin, Manager เท่านั้น
          </p>
        </div>
      </Section>

      {/* Section 2: Data Fields */}
      <Section title="ข้อมูลในระบบ">
        <Table
          headers={['ฟิลด์', 'รายละเอียด', 'ข้อกำหนด']}
          rows={[
            ['ID', 'รหัสอัตโนมัติ (Auto-generated SERIAL)', 'อ่านอย่างเดียว, สร้างโดยระบบ'],
            ['Name', 'ชื่อเหตุผลการสุ่มตัวอย่าง', 'ต้องกรอก, 3-100 ตัวอักษร, ตัวอักษร ตัวเลข และเครื่องหมายวรรคตอนเท่านั้น'],
            ['Description', 'รายละเอียดเพิ่มเติม', 'ไม่บังคับ, สูงสุด 1,000 ตัวอักษร'],
            ['Status', 'สถานะ Active/Inactive', 'ค่าเริ่มต้น: Active'],
          ]}
        />

        <div style={{ marginTop: '15px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 ตัวอย่างเหตุผล:</strong> Regular Inspection, Customer Complaint, Process Change,
            Re-inspection, Engineering Request, Random Audit เป็นต้น
          </p>
        </div>
      </Section>

      {/* Section 3: How to Use */}
      <Section title="วิธีการใช้งาน">
        <Subsection title="การเพิ่ม Sampling Reason ใหม่">
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ไปที่เมนู "Master Data" → เลือก "Sampling Reasons"',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Create New" เพื่อเปิดฟอร์มสร้างรายการใหม่',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'กรอก Name (ชื่อเหตุผล) และ Description (รายละเอียด) ถ้ามี',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิก "Save" เพื่อบันทึก - ระบบจะสร้าง ID อัตโนมัติ',
              },
            ]}
          />
        </Subsection>

        <Subsection title="การแก้ไขและลบ">
          <Table
            headers={['การดำเนินการ', 'วิธีการ']}
            rows={[
              ['แก้ไข (Edit)', 'คลิกปุ่ม Edit ที่แถวรายการ → แก้ไขข้อมูล → คลิก Save'],
              ['ลบ (Delete)', 'คลิกปุ่ม Delete ที่แถวรายการ → ยืนยันการลบ'],
              ['เปลี่ยนสถานะ (Toggle)', 'คลิกปุ่ม Toggle Status เพื่อเปลี่ยนระหว่าง Active/Inactive'],
            ]}
          />
        </Subsection>

        <Subsection title="การค้นหาและกรอง">
          <List
            items={[
              'ค้นหาตามชื่อหรือรายละเอียด ผ่านช่องค้นหา',
              'กรองตามสถานะ: All / Active / Inactive',
              'ดูสถิติจำนวน Total, Active, Inactive ที่ Dashboard ด้านบน',
            ]}
          />
        </Subsection>
      </Section>

      {/* Section 4: Validation Rules */}
      <Section title="กฎการตรวจสอบ (Validation)">
        <Table
          headers={['ฟิลด์', 'กฎ', 'ตัวอย่าง']}
          rows={[
            ['Name', 'ต้องมี 3-100 ตัวอักษร, รองรับ A-Z, a-z, 0-9, -, _, ., เว้นวรรค, ()', 'Regular Inspection'],
            ['Name', 'ไม่รองรับอักขระพิเศษ เช่น @, #, $, %, &', '❌ Test@123'],
            ['Description', 'ไม่บังคับ, สูงสุด 1,000 ตัวอักษร', 'ตรวจสอบตามปกติ'],
          ]}
        />
      </Section>

      {/* Section 5: Connection to Inspection */}
      <Section title="ความเชื่อมโยงกับ Inspection">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>📋 การใช้ Sampling Reason ใน Inspection</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>เมื่อเริ่มบันทึกการตรวจสอบ (OQA, OBA, SIV) ขั้นตอนที่ 1 คือการเลือก Sampling Reason</li>
            <li>รายการที่แสดงใน Popup จะเป็นเฉพาะรายการที่มีสถานะ <strong>Active</strong> เท่านั้น</li>
            <li>หากตั้งเป็น Inactive จะไม่แสดงในรายการเลือกของ Inspection แต่ข้อมูลเก่าที่เคยใช้จะยังคงอยู่</li>
          </ul>
        </div>
      </Section>

      {/* Section 6: Best Practices */}
      <Section title="แนวปฏิบัติที่ดี">
        <List
          items={[
            'ใช้ชื่อที่ชัดเจนและเข้าใจง่าย เช่น "Regular Inspection" แทน "RI"',
            'เพิ่ม Description เพื่ออธิบายรายละเอียดเพิ่มเติม',
            'ใช้ Inactive แทนการลบ เพื่อเก็บประวัติข้อมูลเดิม',
            'ตรวจสอบว่ามีรายการซ้ำหรือไม่ก่อนสร้างใหม่',
            'ทบทวนรายการเป็นประจำเพื่อให้ข้อมูลเป็นปัจจุบัน',
          ]}
        />
      </Section>

      {/* Section 7: Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            ['ไม่พบเหตุผลใน Inspection', 'ตรวจสอบว่า Sampling Reason มีสถานะ Active'],
            ['บันทึกไม่สำเร็จ', 'ตรวจสอบชื่อว่ามี 3-100 ตัวอักษร และไม่มีอักขระพิเศษ'],
            ['ชื่อซ้ำ', 'ตรวจสอบรายการที่มีอยู่แล้ว ใช้ชื่อที่แตกต่าง'],
            ['ไม่สามารถลบได้', 'อาจมี Inspection ที่อ้างอิงอยู่ ใช้ Inactive แทน'],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>สำหรับคำถามเกี่ยวกับ Sampling Reasons:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ Quality Manager</li>
          <li>ติดต่อ IT Support</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T44_SamplingReasonsPage;
