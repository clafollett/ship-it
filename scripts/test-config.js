#!/usr/bin/env node

/**
 * Quick test script to verify ShipIt configuration
 * Run: node scripts/test-config.js
 */

require('dotenv').config();

const requiredEnvVars = [
  'ANTHROPIC_API_KEY',
  'SLACK_BOT_TOKEN',
  'SLACK_APP_TOKEN',
  'SLACK_SIGNING_SECRET',
  'GITHUB_TOKEN',
  'GITHUB_OWNER',
  'GITHUB_REPO',
];

console.log('🔍 Checking ShipIt configuration...\n');

let hasErrors = false;

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ Missing: ${envVar}`);
    hasErrors = true;
  } else {
    const maskedValue = value.substring(0, 8) + '***';
    console.log(`✅ ${envVar}: ${maskedValue}`);
  }
}

console.log('\nOptional configuration:');
console.log(`   WORKING_DIRECTORY: ${process.env.WORKING_DIRECTORY || './workspace (default)'}`);
console.log(`   DEFAULT_BRANCH: ${process.env.DEFAULT_BRANCH || 'main (default)'}`);

if (hasErrors) {
  console.log('\n❌ Configuration incomplete. Please check your .env file.');
  process.exit(1);
} else {
  console.log('\n✅ All required configuration is present!');
  console.log('   Run "npm run dev" to start ShipIt');
  process.exit(0);
}
