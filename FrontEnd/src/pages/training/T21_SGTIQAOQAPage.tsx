// client/src/pages/training/T21_SGTIQAOQAPage.tsx

import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  HelpBox,
  Subsection,
} from '../../components/training/TrainingComponents';

/**
 * SGT IQA vs NHK OQA Report Training Page
 */
const T21_SGTIQAOQAPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={21}
      totalCards={48}
      title="รายงานเปรียบเทียบ IQA vs OQA"
      subtitle="SGT IQA vs NHK OQA Report"
      icon="⚖️"
      nextLink="/training/overall-oqa-report"
    >
      {/* Overview */}
      <Section title="ภาพรวมของรายงาน">
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎯 วัตถุประสงค์</h4>
          <p style={{ margin: 0 }}>
            เปรียบเทียบผลการตรวจสอบ IQA ของ Seagate กับผลการตรวจสอบ OQA ของ NHK
            เพื่อตรวจสอบความสอดคล้องและระบุจุดที่ต้องปรับปรุง
          </p>
        </div>

        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📍 Path</h4>
          <code style={{ background: '#fff', padding: '8px', borderRadius: '4px', display: 'block' }}>
            /report/sgt-iqa-vs-nhk-oqa
          </code>
        </div>
      </Section>

      {/* How to Generate */}
      <Section title="วิธีการสร้างรายงาน">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'ไปที่ Reports → SGT IQA vs NHK OQA',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือก Fiscal Year (FY) - ต้องระบุ',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'เลือก Work Week (WW) - ต้องระบุ',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'คลิก "Generate Report"',
            },
          ]}
        />
      </Section>

      {/* Understanding the Report */}
      <Section title="การเข้าใจรายงาน">
        <Subsection title="1. กราฟเปรียบเทียบ (Comparison Chart)">
          <ul>
            <li><strong>เส้นสีน้ำเงิน:</strong> Seagate IQA Results</li>
            <li><strong>เส้นสีส้ม:</strong> NHK OQA Results</li>
            <li><strong>Gap:</strong> ความแตกต่างระหว่าง IQA และ OQA</li>
          </ul>
        </Subsection>

        <Subsection title="2. ตัวชี้วัดหลัก">
          <ul>
            <li><strong>LAR Comparison:</strong> เปรียบเทียบอัตราการยอมรับ</li>
            <li><strong>DPPM Comparison:</strong> เปรียบเทียบข้อบกพร่องต่อล้าน</li>
            <li><strong>Trend Lines:</strong> แนวโน้มตามเวลา</li>
          </ul>
        </Subsection>
      </Section>

      {/* Key Metrics */}
      <Section title="ตัวชี้วัด">
        <Table
          headers={['Metric', 'เป้าหมาย', 'การตีความ']}
          rows={[
            [
              'IQA vs OQA Gap',
              '< 2%',
              'ช่องว่างน้อย = ความสอดคล้องสูง',
            ],
            [
              'Trend Direction',
              'มั่นคง / ดีขึ้น',
              'แนวโน้มที่ดีขึ้นหรือคงที่',
            ],
            [
              'DPPM Alignment',
              'ใกล้เคียงกัน',
              'ค่า DPPM ใกล้เคียงกันระหว่าง IQA และ OQA',
            ],
          ]}
        />
      </Section>

      {/* Common Uses */}
      <Section title="การใช้งานทั่วไป">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📊 การตรวจสอบคุณภาพ</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ยืนยันว่าผลการตรวจสอบของเราสอดคล้องกับลูกค้า
            </p>
          </div>

          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>🔍 การระบุปัญหา</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              ค้นหาความแตกต่างและจุดที่ต้องปรับปรุง
            </p>
          </div>

          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>📈 การรายงานลูกค้า</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              แสดงความสอดคล้องให้ลูกค้าเห็น
            </p>
          </div>

          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>⚠️ สถานการณ์แจ้งเตือน</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              เมื่อ Gap &gt; 5% ต้องสอบสวนทันที
            </p>
          </div>
        </div>
      </Section>

      {/* Red Flags */}
      <Section title="สัญญาณเตือน (Red Flags)">
        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', border: '2px solid #f5c6cb' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>🚨 แจ้งเตือนทันที</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>Gap &gt; 5%:</strong> แจ้ง Quality Manager ทันที</li>
            <li><strong>IQA แย่กว่า OQA มาก:</strong> ตรวจสอบกระบวนการ</li>
            <li><strong>แนวโน้มแยกกัน:</strong> ต้องวิเคราะห์รากเหง้าของปัญหา</li>
          </ul>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="การแก้ไขปัญหา">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่มีข้อมูล IQA',
              'ลูกค้าอาจยังไม่ทำการตรวจสอบ, รอข้อมูลจากลูกค้า',
            ],
            [
              'ข้อมูลไม่ตรงกัน',
              'ตรวจสอบว่าใช้ช่วงเวลาเดียวกัน (FY/WW)',
            ],
            [
              'Gap สูงมาก',
              'ตรวจสอบมาตรฐานการตรวจสอบ, เปรียบเทียบ sampling',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p><strong>ติดต่อ:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Quality Manager - สำหรับคำถามเกี่ยวกับความแตกต่าง</li>
          <li>Customer Service - สำหรับข้อมูล IQA จากลูกค้า</li>
          <li>ดู REPORTS_MANUAL.md หน้า "SGT IQA vs NHK OQA"</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T21_SGTIQAOQAPage;
