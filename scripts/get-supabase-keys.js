#!/usr/bin/env node

/**
 * Helper script to get Supabase anon keys from both DEV and PROD projects
 * Run this script to get the correct anon keys for your environment files
 */

const https = require('https');

const PROJECTS = {
  DEV: 'https://pplrjwartzvsywtcpjjq.supabase.co',
  PROD: 'https://ngyanbicjhvdmwuoxevb.supabase.co',
};

async function getProjectInfo(projectUrl, projectName) {
  return new Promise((resolve, reject) => {
    const url = `${projectUrl}/rest/v1/`;
    const options = {
      method: 'GET',
      headers: {
        apikey: 'dummy', // We'll get a 401 but it will show us the project info
        Authorization: 'Bearer dummy',
      },
    };

    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        // Look for the anon key in the response headers or error message
        const anonKey =
          res.headers['x-supabase-anon-key'] ||
          res.headers['apikey'] ||
          extractAnonKeyFromError(data);

        resolve({
          project: projectName,
          url: projectUrl,
          anonKey: anonKey || 'NOT_FOUND',
          status: res.statusCode,
        });
      });
    });

    req.on('error', error => {
      reject({ project: projectName, error: error.message });
    });

    req.end();
  });
}

function extractAnonKeyFromError(errorData) {
  // Sometimes the anon key is mentioned in error messages
  const match = errorData.match(/anon[_-]?key[:\s]+([a-zA-Z0-9._-]+)/i);
  return match ? match[1] : null;
}

async function main() {
  console.log('🔍 Getting Supabase project information...\n');

  try {
    const results = await Promise.allSettled([
      getProjectInfo(PROJECTS.DEV, 'DEV'),
      getProjectInfo(PROJECTS.PROD, 'PROD'),
    ]);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { project, url, anonKey, status } = result.value;
        console.log(`📋 ${project} Environment:`);
        console.log(`   URL: ${url}`);
        console.log(`   Status: ${status}`);
        console.log(`   Anon Key: ${anonKey}`);
        console.log('');
      } else {
        console.log(
          `❌ Error getting ${['DEV', 'PROD'][index]} info:`,
          result.reason
        );
      }
    });

    console.log('💡 To get the correct anon keys:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Select each project (DEV and PROD)');
    console.log('3. Go to Settings > API');
    console.log('4. Copy the "anon public" key');
    console.log('5. Update your .env.development and .env.production files');
    console.log('');
    console.log('🔧 Current environment files:');
    console.log('   - .env.development (for DEV project)');
    console.log('   - .env.production (for PROD project)');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
