// client/src/pages/training/T39_OverviewOQACustomerPage.tsx

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
 * Overview OQA Customer Report Training Page
 *
 * Quick Reference Card #39: Overview OQA Customer
 */
const T39_OverviewOQACustomerPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={39}
      totalCards={48}
      title="Overview OQA Customer"
      subtitle="ภาพรวม OQA สำหรับลูกค้า"
      icon="📊"
      nextLink="/training/t02"
    >

      {/* ─── Section 1: Overview ─── */}
      <Section title="ภาพรวมของรายงาน Overview OQA Customer">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์ของรายงาน</h4>
          <p style={{ margin: 0 }}>
            <strong>Overview OQA Customer</strong> เป็นรายงานแบบ Pivot Table ที่แสดงข้อมูลคุณภาพ OQA จัดกลุ่มตาม
            Customer Product Model ในสัปดาห์ที่เลือก โดยแสดง DPPM, LAR%, จำนวน Lot และ NG Quantity
            ของแต่ละ Defect Group เป็นคอลัมน์ พร้อมระบบ Conditional Formatting (สีเขียว/แดง/เหลือง)
            และค่า Target ที่ปรับแต่งได้อย่างยืดหยุ่น
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>📍 เส้นทางการเข้าถึง</h4>
          <p style={{ margin: 0, fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px' }}>
            Customer Format → Overview OQA &nbsp;|&nbsp; /customer-data/overview-oqa
          </p>
        </div>

        <Subsection title="ประโยชน์หลัก" />
        <List
          items={[
            { description: 'ดูภาพรวมคุณภาพ OQA ของทุก Model พร้อมกันในหน้าจอเดียว' },
            { description: 'เปรียบเทียบ DPPM และ LAR% กับค่า Target ที่กำหนด ด้วยระบบสีอัตโนมัติ' },
            { description: 'ตรวจสอบความสอดคล้องระหว่าง Lot Fail กับ NG ผ่านคอลัมน์ Times Fail' },
            { description: 'ระบุ Defect Group ที่มีปัญหาสูงในแต่ละ Model ได้ทันที' },
            { description: 'Drill-down ดูรายละเอียดระดับ Lot Number ของ Defect Group ที่ต้องการ' },
            { description: 'ติดตามแนวโน้มรายสัปดาห์ และส่งรายงาน OQA Overview ให้ลูกค้า' },
          ]}
        />
      </Section>

      {/* ─── Section 2: Step-by-step Usage ─── */}
      <Section title="วิธีการใช้งานทีละขั้นตอน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description:
                'เข้าเมนู "Customer Format" → คลิก "Overview OQA" ระบบจะโหลดข้อมูล FY และ WW ปัจจุบันอัตโนมัติ',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description:
                'เลือก Fiscal Year (FY) — รายการ Work Week จะโหลดอัตโนมัติตาม FY ที่เลือก',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Work Week (WW) ที่ต้องการดูข้อมูล',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description:
                '(ไม่บังคับ) เลือก Model เพื่อกรองเฉพาะรุ่นที่ต้องการ — สามารถเลือกได้หลายรุ่น หรือเว้นว่างเพื่อดูทุก Model',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description:
                'ปรับค่า Target ทางด้านขวา (Overall DPPM, Overall LAR%, Product DPPM, Product LAR%) ตามที่ต้องการ จากนั้นคลิก "Apply Target" — ปุ่มจะเปลี่ยนเป็นสีส้มเมื่อมีค่าที่ยังไม่ได้ Apply',
            },
            {
              label: 'ขั้นตอนที่ 6',
              description:
                'คลิก "Search" เพื่อโหลดข้อมูล ตารางจะแสดง Conditional Formatting อัตโนมัติตาม Target ที่ Apply ไว้',
            },
            {
              label: 'ขั้นตอนที่ 7',
              description:
                '(ไม่บังคับ) คลิกตัวเลขในแถว Qty ของ Defect Group เพื่อดูรายละเอียดระดับ Lot Number',
            },
          ]}
        />

        <div style={{ marginTop: '12px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 ปุ่ม Reset:</strong> ล้างตัวกรอง Model แล้ว Search ใหม่ทันที (FY และ WW ไม่เปลี่ยนแปลง)
          </p>
        </div>
      </Section>

      {/* ─── Section 3: Filters ─── */}
      <Section title="ตัวกรอง (Filters)">
        <Table
          headers={['ตัวกรอง', 'ประเภท', 'ค่าเริ่มต้น', 'รายละเอียด']}
          rows={[
            [
              'Fiscal Year (FY)',
              'Dropdown',
              'FY ปัจจุบัน',
              'ปีงบประมาณ — โหลดรายการจากฐานข้อมูลที่มีข้อมูล OQA',
            ],
            [
              'Work Week (WW)',
              'Dropdown',
              'WW ปัจจุบัน',
              'สัปดาห์ทำงาน — รายการจะอัปเดตตาม FY ที่เลือก แสดงเฉพาะ WW ที่มีข้อมูล',
            ],
            [
              'Model',
              'Multi-select',
              'ทั้งหมด (ว่าง)',
              'รุ่นผลิตภัณฑ์ — เลือกได้หลายรุ่น แสดง Tag สูงสุด 2 รุ่น หรือเว้นว่างเพื่อดูทุก Model',
            ],
          ]}
        />

        <div style={{ marginTop: '12px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>⚠️ สำคัญ:</strong> เมื่อเปลี่ยน FY ค่า WW จะถูก Reset — ต้องเลือก WW ใหม่แล้วจึงกด Search
          </p>
        </div>
      </Section>

      {/* ─── Section 4: Target Values ─── */}
      <Section title="ค่าเป้าหมาย (Target)">
        <p>
          ระบบมีค่า Target 4 ประเภท แบ่งเป็น 2 ระดับ ใช้ในการกำหนดสี Conditional Formatting:
        </p>

        <Subsection title="ระดับ Overall — ใช้กับแถว Summary Footer (Overall)" />
        <Table
          headers={['Target', 'ค่าเริ่มต้น', 'คำอธิบาย', 'เงื่อนไขสี']}
          rows={[
            [
              'Overall DPPM Target',
              '180',
              'ค่า DPPM รวมสูงสุดที่ยอมรับได้ในระดับ Overall',
              'พื้นหลังแดง = DPPM ≥ Target',
            ],
            [
              'Overall LAR% Target',
              '98.4%',
              'ค่า LAR% รวมต่ำสุดที่ยอมรับได้ในระดับ Overall',
              'เขียว = LAR ≥ Target | แดง = LAR < Target',
            ],
          ]}
        />

        <Subsection title="ระดับ Product — ใช้กับแถวข้อมูลแต่ละ Model" />
        <Table
          headers={['Target', 'ค่าเริ่มต้น', 'คำอธิบาย', 'เงื่อนไขสี']}
          rows={[
            [
              'Product DPPM Target',
              '220',
              'ค่า DPPM สูงสุดที่ยอมรับได้ต่อ Model',
              'พื้นหลังแดง = DPPM ≥ Target',
            ],
            [
              'Product LAR% Target',
              '98.0%',
              'ค่า LAR% ต่ำสุดที่ยอมรับได้ต่อ Model',
              'เขียว = LAR ≥ Target | แดง = LAR < Target',
            ],
          ]}
        />

        <div style={{ marginTop: '12px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>💡 Apply Target:</strong> หลังแก้ไขค่า Target ปุ่มจะเปลี่ยนเป็นสีส้ม — ต้องคลิก "Apply Target"
            เพื่อให้สี Conditional Formatting ในตารางอัปเดต ก่อน Apply จะแสดงค่าเก่า
          </p>
        </div>
      </Section>

      {/* ─── Section 5: Table Structure ─── */}
      <Section title="โครงสร้างตาราง Pivot">

        <Subsection title="รูปแบบ 2 แถวต่อ Model" />
        <p>แต่ละ Model จะแสดง <strong>2 แถว</strong> ติดกัน:</p>
        <Table
          headers={['แถว', 'ชื่อ', 'แสดงข้อมูล', 'พื้นหลัง']}
          rows={[
            [
              'แถวที่ 1',
              'DPPM Row',
              'ค่า DPPM ของแต่ละ Defect Group และ Overall DPPM',
              'ขาว',
            ],
            [
              'แถวที่ 2',
              'Qty Row',
              'จำนวน NG (ชิ้น) ของแต่ละ Defect Group และ Total NG',
              'เทาอ่อน (#f0f0f0)',
            ],
          ]}
        />
        <p style={{ fontSize: '14px', color: '#555', marginTop: '8px' }}>
          คอลัมน์ด้านซ้าย (Model, Lot Inspec., Lot Pass, Lot Fail, Times Fail, LAR%, Sampling, NG, DPPM)
          จะ Merge 2 แถวเป็น 1 เซลล์ — คอลัมน์ Defect Group แสดงค่าแยกต่างหากในแต่ละแถว
        </p>

        <Subsection title="คำอธิบายคอลัมน์ทั้งหมด" />
        <Table
          headers={['คอลัมน์', 'สูตร / ที่มา', 'รายละเอียด']}
          rows={[
            [
              'Model',
              'ฐานข้อมูล OQA',
              'Customer Part Number / รุ่นผลิตภัณฑ์',
            ],
            [
              'Lot Inspec.',
              'ฐานข้อมูล OQA',
              'จำนวน Lot ทั้งหมดที่ส่งตรวจใน WW นั้น',
            ],
            [
              'Lot Pass',
              'ฐานข้อมูล OQA',
              'จำนวน Lot ที่ผ่านการตรวจสอบ (Pass)',
            ],
            [
              'Lot Fail',
              'ฐานข้อมูล OQA',
              'จำนวน Lot ที่ไม่ผ่านการตรวจสอบ (Reject)',
            ],
            [
              'Times Fail',
              '⌈Lot Fail ÷ 2⌉ (ceiling)',
              'จำนวนครั้งที่ Fail — ปัดขึ้นเสมอ ไม่มีทศนิยม ใช้เปรียบเทียบกับ NG เพื่อตรวจความสอดคล้องของข้อมูล',
            ],
            [
              'LAR%',
              '(Lot Pass ÷ Lot Inspec.) × 100',
              'Lot Acceptance Rate แสดงทศนิยม 2 ตำแหน่ง เช่น 98.50%',
            ],
            [
              'Sampling',
              'ฐานข้อมูล OQA',
              'จำนวนชิ้นรวมที่สุ่มตรวจทั้งหมดใน WW นั้น',
            ],
            [
              'NG',
              'รวม NG ทุก Defect Group',
              'จำนวนชิ้น Non-conforming รวมทุกประเภท Defect',
            ],
            [
              'DPPM',
              '(NG ÷ Sampling) × 1,000,000',
              'Defects Per Million Parts ปัดเป็นจำนวนเต็ม',
            ],
            [
              'DPPM by Defect Group',
              '(NG ของ Group นั้น ÷ Sampling) × 1,000,000',
              'คอลัมน์ Dynamic — สร้างอัตโนมัติจาก Defect Group ที่มีข้อมูลใน WW ที่เลือก (ยกเว้น "No Defect")',
            ],
            [
              'Overall DPPM',
              '(Total NG ÷ Sampling) × 1,000,000',
              'DPPM รวมทุก Defect Group (คิดจาก Total NG ดิบ ไม่ใช่ผลรวมของ DPPM แต่ละ Group)',
            ],
          ]}
        />

        <div style={{ marginTop: '12px', padding: '12px', background: '#e8f4f8', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '14px' }}>
            <strong>📌 สูตร Times Fail ตัวอย่าง:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Lot Fail = 0 → Times Fail = ⌈0⌉ = <strong>0</strong></li>
            <li>Lot Fail = 1 → Times Fail = ⌈0.5⌉ = <strong>1</strong></li>
            <li>Lot Fail = 3 → Times Fail = ⌈1.5⌉ = <strong>2</strong></li>
            <li>Lot Fail = 4 → Times Fail = ⌈2.0⌉ = <strong>2</strong></li>
            <li>Lot Fail = 5 → Times Fail = ⌈2.5⌉ = <strong>3</strong></li>
          </ul>
        </div>
      </Section>

      {/* ─── Section 6: Conditional Formatting ─── */}
      <Section title="Conditional Formatting (ระบบสี)">
        <p>ระบบแสดงสีอัตโนมัติ 3 รูปแบบ ตามสถานะของข้อมูล:</p>

        <Subsection title="1. สีเขียว / สีแดง — คอลัมน์ LAR%" />
        <Table
          headers={['สี', 'เงื่อนไข', 'ความหมาย']}
          rows={[
            [
              '🟢 พื้นหลังเขียว ตัวอักษรขาว',
              'LAR% ≥ Product LAR Target (หรือ Overall LAR Target ในแถว Summary)',
              'คุณภาพผ่านเกณฑ์ — ยอมรับได้',
            ],
            [
              '🔴 พื้นหลังแดง ตัวอักษรขาว',
              'LAR% < Target',
              'คุณภาพต่ำกว่าเกณฑ์ — ต้องปรับปรุงทันที',
            ],
          ]}
        />

        <Subsection title="2. พื้นหลังแดง — คอลัมน์ DPPM และ Overall DPPM" />
        <Table
          headers={['สี', 'เงื่อนไข', 'ความหมาย']}
          rows={[
            [
              '🔴 พื้นหลังแดง ตัวอักษรขาว',
              'DPPM ≥ Product DPPM Target (หรือ Overall DPPM Target ในแถว Summary)',
              'ค่า DPPM เกินเกณฑ์ที่กำหนด — ต้องตรวจสอบ',
            ],
            [
              '⬜ ขาว',
              'DPPM < Target',
              'ค่า DPPM อยู่ในเกณฑ์ปกติ',
            ],
          ]}
        />

        <Subsection title="3. พื้นหลังเหลือง ตัวอักษรแดง — คอลัมน์ Times Fail และ NG" />
        <p>
          คอลัมน์ <strong>Times Fail</strong> และ <strong>NG</strong> จะแสดงสีเตือนพร้อมกัน
          เมื่อเข้าเงื่อนไขใดเงื่อนไขหนึ่งต่อไปนี้:
        </p>
        <Table
          headers={['เงื่อนไข', 'สูตร', 'ความหมาย', 'ตัวอย่าง']}
          rows={[
            [
              'เงื่อนไขที่ 1',
              'Times Fail = 0 และ NG > 0',
              'ไม่มี Lot ที่ Fail แต่กลับพบ NG — ข้อมูล Lot Fail และ NG ไม่สอดคล้องกัน ควรตรวจสอบ',
              'Lot Fail=0, Times Fail=0, NG=3 → แสดงสีเตือน',
            ],
            [
              'เงื่อนไขที่ 2',
              'Times Fail > NG',
              'จำนวนครั้ง Fail มากกว่าจำนวน NG ที่บันทึก — อาจมีข้อมูลที่บันทึก NG ไม่ครบ',
              'Lot Fail=6, Times Fail=3, NG=1 → แสดงสีเตือน',
            ],
          ]}
        />

        <div style={{ marginTop: '12px', padding: '12px', background: '#d4edda', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '14px' }}>
            <strong>✅ สถานะปกติ (ไม่มีสีเตือน):</strong> Times Fail ≤ NG หรือทั้งคู่เป็น 0
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Lot Fail=4, Times Fail=2, NG=5 → Times Fail (2) ≤ NG (5) → ปกติ ไม่มีสีเตือน</li>
            <li>Lot Fail=0, Times Fail=0, NG=0 → ทั้งคู่เป็น 0 → ปกติ ไม่มีสีเตือน</li>
          </ul>
        </div>

        <div style={{ marginTop: '12px', padding: '12px', background: '#fff3cd', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '14px' }}>
            <strong>⚠️ ตัวอย่างสถานะที่ต้องตรวจสอบ:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Lot Fail=0, Times Fail=0, NG=5 → <strong>เงื่อนไข 1</strong>: ไม่มี Fail แต่มี NG → สีเหลือง/แดง</li>
            <li>Lot Fail=4, Times Fail=2, NG=1 → <strong>เงื่อนไข 2</strong>: Times Fail (2) &gt; NG (1) → สีเหลือง/แดง</li>
          </ul>
        </div>
      </Section>

      {/* ─── Section 7: Summary Footer ─── */}
      <Section title="แถว Summary Overall (Footer)">
        <p>
          ด้านล่างสุดของตารางมีแถว <strong>Overall</strong> 2 แถว แสดงผลรวมของทุก Model:
        </p>
        <Table
          headers={['แถว', 'ข้อมูลที่แสดง', 'การ Format']}
          rows={[
            [
              'Overall DPPM Row',
              'Lot Inspec., Lot Pass, Lot Fail, Times Fail, LAR%, Sampling, NG, DPPM, DPPM ทุก Defect Group, Overall DPPM',
              'ใช้ Overall Target สำหรับสีทุกคอลัมน์',
            ],
            [
              'Overall Qty Row',
              '"จำนวนชิ้น" (label), NG Quantity รวมของแต่ละ Defect Group, Total NG',
              'พื้นหลังเทาอ่อน (#f0f0f0)',
            ],
          ]}
        />
        <p style={{ fontSize: '14px', color: '#555', marginTop: '8px' }}>
          แถว Overall ใช้ <strong>Overall DPPM Target</strong> และ <strong>Overall LAR% Target</strong>
          ในการตัดสินสี (ไม่ใช่ Product Target)
        </p>
      </Section>

      {/* ─── Section 8: Lot Detail Modal ─── */}
      <Section title="การดูรายละเอียด Lot (Lot Detail Modal)">
        <Subsection title="วิธีเปิด Lot Detail" />
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description:
                'มองหาตัวเลข NG > 0 ในแถว Qty (แถวล่าง พื้นหลังเทา) ของคอลัมน์ Defect Group ใดก็ได้',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description:
                'คลิกที่ตัวเลขนั้น (ตัวเลขจะขีดเส้นใต้เมื่อ hover เมาส์) — หน้าต่าง Lot Detail จะเปิดขึ้น',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description:
                'ดูรายละเอียด Lot ในหน้าต่าง — แถวสีแดงอ่อน = มี NG, แถวสีเขียวอ่อน = ไม่มี NG',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description:
                'คลิก Lot No (ลิงก์สีฟ้า) เพื่อเปิดหน้า OQA Inspection ของ Lot นั้นในแท็บใหม่',
            },
          ]}
        />

        <Subsection title="ข้อมูลใน Lot Detail Modal" />
        <Table
          headers={['คอลัมน์', 'รายละเอียด']}
          rows={[
            ['No', 'ลำดับที่ของ Lot'],
            ['Lot No', 'หมายเลข Lot — คลิกเพื่อเปิดหน้า OQA Inspection รายงานเต็มใน Tab ใหม่'],
            ['NG Qty', 'จำนวนชิ้น NG ใน Lot นั้น (สีแดง = มี NG, สีเขียว = 0)'],
            ['Footer', 'แสดงจำนวน Lot ทั้งหมดและ Total NG รวมของ Defect Group นั้น'],
          ]}
        />

        <div style={{ marginTop: '12px', padding: '12px', background: '#e8f4f8', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>📌 หมายเหตุ:</strong> ตัวเลข 0 ในแถว Qty จะไม่มีลิงก์ — คลิกได้เฉพาะตัวเลขที่มีขีดเส้นใต้เท่านั้น
          </p>
        </div>
      </Section>

      {/* ─── Section 9: Common Uses ─── */}
      <Section title="การใช้งานทั่วไป">
        <List
          items={[
            {
              label: 'Weekly QA Review',
              description: 'เปิดรายงาน WW ปัจจุบัน ตรวจสอบ Model ที่มี LAR% หรือ DPPM สีแดงทันที',
            },
            {
              label: 'Customer Report',
              description: 'ใช้ภาพหน้าจอหรือ Print เพื่อส่งข้อมูลคุณภาพ OQA ให้ลูกค้า',
            },
            {
              label: 'Defect Analysis',
              description: 'ดูคอลัมน์ Defect Group เพื่อระบุประเภท Defect ที่มี DPPM สูง และ Drill-down ระดับ Lot',
            },
            {
              label: 'Data Consistency Check',
              description: 'ตรวจสอบ Times Fail กับ NG — หากเซลล์เป็นสีเหลือง/แดง ต้องตรวจสอบความถูกต้องของข้อมูล',
            },
            {
              label: 'Target Adjustment',
              description: 'ปรับ Target DPPM/LAR ตามข้อกำหนดของลูกค้าแต่ละราย แล้วคลิก Apply Target',
            },
            {
              label: 'Trend Monitoring',
              description: 'เปลี่ยน WW เพื่อเปรียบเทียบผลคุณภาพข้ามสัปดาห์หรือเทียบกับ FY ก่อนหน้า',
            },
          ]}
        />
      </Section>

      {/* ─── Section 10: Troubleshooting ─── */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['อาการ', 'สาเหตุที่เป็นไปได้', 'วิธีแก้ไข']}
          rows={[
            [
              'ตารางว่าง ไม่มีข้อมูล',
              'ไม่มีข้อมูล OQA ใน FY/WW ที่เลือก',
              'ตรวจสอบว่า Import ข้อมูล OQA เรียบร้อยแล้ว หรือลองเลือก WW อื่น',
            ],
            [
              'สีไม่เปลี่ยนหลังแก้ Target',
              'ยังไม่ได้คลิก "Apply Target"',
              'มองหาปุ่ม "Apply Target" ที่เปลี่ยนเป็นสีส้ม แล้วคลิก',
            ],
            [
              'Lot Detail ไม่เปิดเมื่อคลิก',
              'คลิกที่ตัวเลข 0 หรือคลิกในแถว DPPM',
              'คลิกตัวเลขที่มีขีดเส้นใต้ในแถว Qty (แถวล่าง พื้นเทา) เฉพาะค่า > 0 เท่านั้น',
            ],
            [
              'WW Dropdown ว่างไม่มีตัวเลือก',
              'ยังไม่ได้เลือก FY หรือ FY ที่เลือกไม่มีข้อมูล',
              'เลือก Fiscal Year ก่อน รายการ WW จะโหลดอัตโนมัติ',
            ],
            [
              'Defect Group Column ไม่แสดง',
              'ไม่มี Defect Group ในข้อมูลสัปดาห์นั้น',
              'Defect Group เป็น Dynamic Column — จะแสดงเฉพาะ Group ที่มีข้อมูลใน WW ที่เลือก',
            ],
            [
              'Times Fail / NG แสดงสีเหลือง/แดง',
              'Times Fail > NG หรือ Times Fail=0 แต่ NG>0',
              'ตรวจสอบความถูกต้องของข้อมูล Lot Fail และ NG Quantity ที่ Import มา',
            ],
            [
              'ข้อมูลไม่ครบหรือ Model หายไป',
              'ข้อมูลยังไม่ได้ Import หรือ Import ไม่สำเร็จ',
              'ตรวจสอบ Import Log และติดต่อ IT Support',
            ],
          ]}
        />
      </Section>

      {/* ─── Help Box ─── */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>หากพบปัญหาหรือข้อสงสัยเกี่ยวกับ Overview OQA Customer:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ติดต่อ <strong>Quality Manager</strong> สำหรับคำถามด้านการตีความข้อมูล ค่า Target และ Defect Group</li>
          <li>ติดต่อ <strong>IT Support</strong> สำหรับปัญหาทางเทคนิค เช่น ข้อมูลไม่ครบ ระบบไม่ตอบสนอง หรือ Import ล้มเหลว</li>
        </ul>
      </HelpBox>

    </TrainingLayout>
  );
};

export default T39_OverviewOQACustomerPage;
