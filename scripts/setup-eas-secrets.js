#!/usr/bin/env node

/**
 * Helper script to set up EAS secrets for environment variables
 * Run this script to set up the required EAS secrets for DEV and PROD environments
 */

const { execSync } = require('child_process');
const { resolve } = require('path');

const { config } = require('dotenv');

// Load environment files to get the values
const devEnv = config({ path: resolve(process.cwd(), '.env.development') });
const prodEnv = config({ path: resolve(process.cwd(), '.env.production') });

const secrets = [
  {
    name: 'EXPO_PUBLIC_SUPABASE_URL',
    devValue: devEnv.parsed?.EXPO_PUBLIC_SUPABASE_URL,
    prodValue: prodEnv.parsed?.EXPO_PUBLIC_SUPABASE_URL,
    description: 'Supabase URL',
  },
  {
    name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    devValue: devEnv.parsed?.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    prodValue: prodEnv.parsed?.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    description: 'Supabase Anon Key',
  },
  {
    name: 'EXPO_PUBLIC_TERRA_DEV_ID',
    devValue: devEnv.parsed?.EXPO_PUBLIC_TERRA_DEV_ID,
    prodValue: prodEnv.parsed?.EXPO_PUBLIC_TERRA_DEV_ID,
    description: 'Terra Dev ID',
  },
  {
    name: 'EXPO_PUBLIC_TERRA_API_KEY',
    devValue: devEnv.parsed?.EXPO_PUBLIC_TERRA_API_KEY,
    prodValue: prodEnv.parsed?.EXPO_PUBLIC_TERRA_API_KEY,
    description: 'Terra API Key',
  },
];

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`, error);
    return false;
  }
}

function setupSecrets() {
  console.log('🔧 Setting up EAS secrets for environment variables...\n');

  // Check if EAS CLI is installed
  try {
    execSync('eas --version', { stdio: 'pipe' });
  } catch (error) {
    console.error(
      '❌ EAS CLI is not installed. Please install it first:',
      error
    );
    console.error('   npm install -g @expo/eas-cli');
    process.exit(1);
  }

  // Check if logged in to EAS
  try {
    execSync('eas whoami', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not logged in to EAS. Please login first:', error);
    console.error('   eas login');
    process.exit(1);
  }

  console.log('📋 Current environment values:');
  console.log('='.repeat(50));

  secrets.forEach(secret => {
    console.log(`\n🔑 ${secret.description} (${secret.name}):`);
    console.log(`   DEV:  ${secret.devValue || 'NOT SET'}`);
    console.log(`   PROD: ${secret.prodValue || 'NOT SET'}`);
  });

  console.log('\n🚀 Setting up EAS secrets...');
  console.log('='.repeat(50));

  let successCount = 0;
  let totalCount = 0;

  secrets.forEach(secret => {
    // Set DEV value (for development and preview builds)
    if (
      secret.devValue &&
      secret.devValue !== 'daybreakerhealth-prod-s7DuKDUy5C' &&
      secret.devValue !== 'OeNwfeJcWBibOIF7Ic7EvTjFTeGZBoel'
    ) {
      totalCount++;
      console.log(`\n📝 Setting DEV ${secret.description}...`);
      const command = `eas secret:create --scope project --name ${secret.name} --value "${secret.devValue}" --force`;
      if (runCommand(command)) {
        successCount++;
        console.log(`✅ DEV ${secret.description} set successfully`);
      }
    } else {
      console.log(
        `⚠️  Skipping DEV ${secret.description} - value not set or placeholder`
      );
    }

    // Set PROD value (for production builds)
    if (
      secret.prodValue &&
      secret.prodValue !== 'your_prod_terra_dev_id' &&
      secret.prodValue !== 'your_prod_terra_api_key'
    ) {
      totalCount++;
      console.log(`\n📝 Setting PROD ${secret.description}...`);
      const command = `eas secret:create --scope project --name ${secret.name} --value "${secret.prodValue}" --force`;
      if (runCommand(command)) {
        successCount++;
        console.log(`✅ PROD ${secret.description} set successfully`);
      }
    } else {
      console.log(
        `⚠️  Skipping PROD ${secret.description} - value not set or placeholder`
      );
    }
  });

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully set: ${successCount}/${totalCount} secrets`);

  if (successCount === totalCount) {
    console.log('\n🎉 All secrets set successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Test local development: npm run start:dev');
    console.log('2. Test local production: npm run start:prod');
    console.log(
      '3. Test EAS build: eas build --profile development --platform ios --local'
    );
    console.log('4. Check secrets: eas secret:list --scope project');
  } else {
    console.log(
      '\n⚠️  Some secrets were not set. Please check your .env files.'
    );
    console.log('\n📝 Make sure to:');
    console.log('1. Update .env.development with DEV values');
    console.log('2. Update .env.production with PROD values');
    console.log('3. Replace placeholder values with actual keys');
    console.log('4. Run this script again');
  }
}

// Run the setup
setupSecrets();
