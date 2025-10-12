#!/usr/bin/env node

/**
 * Quick Schema Verification for ChefPax
 * Verifies key schema elements are present and correct
 */

const fs = require('fs');
const path = require('path');

function verifySchema() {
  console.log('🔍 Verifying ChefPax Schema Elements...\n');
  
  const schemaPath = path.join(__dirname, '../src/app/_components/Schema.tsx');
  const content = fs.readFileSync(schemaPath, 'utf8');
  
  const tests = [
    {
      name: 'Austin in areaServed',
      test: () => content.includes('"name": "Austin"'),
      required: true
    },
    {
      name: 'Travis County in areaServed',
      test: () => content.includes('"name": "Travis County"'),
      required: true
    },
    {
      name: 'Williamson County in areaServed',
      test: () => content.includes('"name": "Williamson County"'),
      required: true
    },
    {
      name: 'Austin coordinates (30.2672, -97.7431)',
      test: () => content.includes('30.2672') && content.includes('-97.7431'),
      required: true
    },
    {
      name: '40km radius',
      test: () => content.includes('"geoRadius": 40000'),
      required: true
    },
    {
      name: 'Delivery-only messaging',
      test: () => content.includes('Delivery Only') || content.includes('publicAccess": false'),
      required: true
    },
    {
      name: 'AI/Automation keywords',
      test: () => content.includes('LLM') || content.includes('computer vision'),
      required: true
    },
    {
      name: 'Uber Direct delivery methods',
      test: () => content.includes('DeliveryModeOnDemand'),
      required: true
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    const result = test.test();
    const status = result ? '✅' : '❌';
    const required = test.required ? '(Required)' : '(Optional)';
    
    console.log(`${status} ${test.name} ${required}`);
    
    if (result) {
      passed++;
    } else if (test.required) {
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All required schema elements are present!');
    console.log('\n🚀 Ready for SEO testing:');
    console.log('• Google Rich Results Test: https://search.google.com/test/rich-results');
    console.log('• Schema.org Validator: https://validator.schema.org/');
    console.log('• Test page: http://localhost:3000/test-schema');
  } else {
    console.log('⚠️  Some required elements are missing. Please review the schema.');
    process.exit(1);
  }
}

verifySchema();
