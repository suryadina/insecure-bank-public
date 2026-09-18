/**
 * Test file for phone number utility functions
 * Run with: npm test or node -e "require('./phoneUtils.test')"
 */

import { normalizePhoneNumber, validatePhoneNumber, formatPhoneNumberForDisplay, toLocalFormat } from './phoneUtils';

// Simple test runner
function runTests() {
  console.log('🧪 Testing Phone Number Utilities\n');

  // Test cases for normalization
  const testCases = [
    // Indonesian international format (+62)
    { input: '+628123456789', expected: '+628123456789', description: 'Already normalized +62 format' },
    { input: '+62 812 345 6789', expected: '+628123456789', description: '+62 format with spaces' },
    { input: '+62-812-345-6789', expected: '+628123456789', description: '+62 format with dashes' },
    
    // Local format (08)
    { input: '08123456789', expected: '+628123456789', description: 'Local 08 format' },
    { input: '081 234 567 89', expected: '+628123456789', description: 'Local 08 format with spaces' },
    { input: '081-234-567-89', expected: '+628123456789', description: 'Local 08 format with dashes' },
    
    // International without + (62)
    { input: '628123456789', expected: '+628123456789', description: 'International 62 format without +' },
    { input: '62 812 345 6789', expected: '+628123456789', description: '62 format with spaces' },
    { input: '62-812-345-6789', expected: '+628123456789', description: '62 format with dashes' },
    
    // Edge cases
    { input: '62812345678', expected: '+62812345678', description: 'Minimum length (9 digits after 62)' },
    { input: '628123456789123', expected: null, description: 'Too long (more than 12 digits after 62)' },
    { input: '62712345678', expected: null, description: 'Invalid - not starting with 8' },
    { input: '081234567', expected: null, description: 'Too short local format' },
    { input: 'abcd', expected: null, description: 'Non-numeric input' },
    { input: '', expected: null, description: 'Empty string' },
  ];

  // Run normalization tests
  console.log('📱 Testing normalizePhoneNumber():');
  testCases.forEach((testCase, index) => {
    const result = normalizePhoneNumber(testCase.input);
    const passed = result === testCase.expected;
    console.log(`  ${passed ? '✅' : '❌'} Test ${index + 1}: ${testCase.description}`);
    console.log(`     Input: "${testCase.input}" → Output: "${result}" (Expected: "${testCase.expected}")`);
    if (!passed) {
      console.log(`     ❗ FAILED: Expected "${testCase.expected}", got "${result}"`);
    }
  });

  // Test validation
  console.log('\n🔍 Testing validatePhoneNumber():');
  const validationTests = [
    { input: '+628123456789', expectedValid: true },
    { input: '08123456789', expectedValid: true },
    { input: '628123456789', expectedValid: true },
    { input: 'invalid', expectedValid: false },
    { input: '', expectedValid: false },
  ];

  validationTests.forEach((test, index) => {
    const result = validatePhoneNumber(test.input);
    const passed = result.isValid === test.expectedValid;
    console.log(`  ${passed ? '✅' : '❌'} Validation ${index + 1}: "${test.input}" → Valid: ${result.isValid}`);
    if (!result.isValid) {
      console.log(`     Error: ${result.error}`);
    }
  });

  // Test formatting
  console.log('\n🎨 Testing formatPhoneNumberForDisplay():');
  const formatTests = [
    { input: '+628123456789', description: '10-digit number' },
    { input: '+62812345678', description: '9-digit number' },
    { input: '+6281234567890', description: '11-digit number' },
  ];

  formatTests.forEach((test, index) => {
    const result = formatPhoneNumberForDisplay(test.input);
    console.log(`  ✅ Format ${index + 1}: "${test.input}" → "${result}" (${test.description})`);
  });

  // Test local format conversion
  console.log('\n🏠 Testing toLocalFormat():');
  const localTests = [
    { input: '+628123456789', expected: '08123456789' },
    { input: '+62812345678', expected: '0812345678' },
  ];

  localTests.forEach((test, index) => {
    const result = toLocalFormat(test.input);
    const passed = result === test.expected;
    console.log(`  ${passed ? '✅' : '❌'} Local ${index + 1}: "${test.input}" → "${result}" (Expected: "${test.expected}")`);
  });

  console.log('\n🎉 Phone number utility tests completed!');
}

// Export for potential use in actual test frameworks
export { runTests };

// Auto-run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}