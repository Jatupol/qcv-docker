/**
 * Test script for Fiscal Week functions
 * Run: node packages/shared/test-fiscal-week.js
 */

const {
  calculateFiscalWeekNumber,
  getFiscalYear,
  getFiscalWeekRange,
  formatFiscalWeek,
  getCurrentFiscalWeek,
  getCurrentFiscalYear,
  getMonthName,
  getMonthTrendName,
  fiscalWeekToYearMonth
} = require('./dist/cjs/index.js');

console.log('='.repeat(60));
console.log('FISCAL WEEK UTILITIES TEST');
console.log('='.repeat(60));

// Test current date
console.log('\n--- CURRENT DATE ---');
const today = new Date();
console.log(`Today: ${today.toISOString().split('T')[0]}`);
console.log(`Current FY: ${getCurrentFiscalYear()}`);
console.log(`Current WW: ${getCurrentFiscalWeek()}`);
console.log(`Formatted: ${formatFiscalWeek(today)}`);

// Test specific dates
console.log('\n--- TEST SPECIFIC DATES ---');
const testDates = [
  '2024-06-28',  // Friday before last Saturday of June 2024 (FY2024 WW52)
  '2024-06-29',  // Last Saturday of June 2024 (FY2024 WW53)
  '2024-06-30',  // June 30, 2024 (FY2024 WW53)
  '2024-07-01',  // Start of FY2025 (WW01)
  '2025-06-27',  // Friday before last Saturday (FY2025 WW52)
  '2025-06-28',  // Last Saturday of June 2025 (FY2025 WW53)
  '2025-06-30',  // June 30, 2025 (FY2025 WW53)
  '2025-07-01',  // Start of FY2026 (WW01)
  '2026-01-28',  // Today's date
];

console.log('\nDate           | FY   | WW | Formatted');
console.log('-'.repeat(45));
testDates.forEach(dateStr => {
  const date = new Date(dateStr);
  const fy = getFiscalYear(date);
  const ww = calculateFiscalWeekNumber(date);
  const formatted = formatFiscalWeek(date);
  console.log(`${dateStr}    | ${fy} | ${String(ww).padStart(2)} | ${formatted}`);
});

// Helper to format local date as YYYY-MM-DD
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Test fiscal week ranges
console.log('\n--- FISCAL WEEK RANGES (FY2024) ---');
console.log('Week | Start      | End        | Days');
console.log('-'.repeat(45));
[1, 2, 10, 26, 52, 53].forEach(week => {
  const range = getFiscalWeekRange(2024, week);
  const start = formatLocalDate(range.start);
  const end = formatLocalDate(range.end);
  const startDay = range.start.toLocaleDateString('en-US', { weekday: 'short' });
  const endDay = range.end.toLocaleDateString('en-US', { weekday: 'short' });
  console.log(`WW${String(week).padStart(2, '0')} | ${start} | ${end} | ${startDay}-${endDay}`);
});

// Test month name conversion
console.log('\n--- MONTH NAME CONVERSION ---');
const monthTests = ['2401', '2406', '2407', '2412', '2501'];
console.log('YYMM | Month Name');
console.log('-'.repeat(20));
monthTests.forEach(ym => {
  console.log(`${ym} | ${getMonthName(ym)}`);
});

// Test fiscal week to year month
console.log('\n--- FISCAL WEEK TO YEAR MONTH ---');
const fwTests = ['202601', '202610', '202626', '202652'];
console.log('FYWW   | YYMM');
console.log('-'.repeat(20));
fwTests.forEach(fw => {
  try {
    console.log(`${fw} | ${fiscalWeekToYearMonth(fw)}`);
  } catch (e) {
    console.log(`${fw} | Error: ${e.message}`);
  }
});

// Test month trend name
console.log('\n--- MONTH TREND NAME ---');
const trendTests = ['240699', '250112', '250199'];
console.log('Input  | Output');
console.log('-'.repeat(25));
trendTests.forEach(t => {
  console.log(`${t} | ${getMonthTrendName(t)}`);
});

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
