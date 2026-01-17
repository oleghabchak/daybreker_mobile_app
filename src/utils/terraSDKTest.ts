import { initTerra, Connections } from 'terra-react';

/**
 * Test Terra SDK initialization
 */
export const testTerraSDK = async (devId: string, referenceId: string) => {
  try {
    console.log('🧪 Testing Terra SDK...');
    console.log(`📱 Dev ID: ${devId}`);
    console.log(`👤 Reference ID: ${referenceId}`);

    // Test basic import
    console.log('📦 Terra SDK imports:');
    console.log('- initTerra:', typeof initTerra);
    console.log('- Connections:', typeof Connections);
    console.log('- Connections.APPLE_HEALTH:', Connections?.APPLE_HEALTH);

    // Test initialization
    console.log('🚀 Attempting Terra SDK initialization...');
    const result = await initTerra(devId, referenceId);

    console.log('📋 Initialization result:', result);
    console.log('📋 Result type:', typeof result);
    console.log('📋 Result keys:', Object.keys(result || {}));

    if (result) {
      console.log('📋 Result.error:', result.error);
      console.log('📋 Result.success:', result.success);
      console.log('📋 Result.data:', result.data);
    }

    return result;
  } catch (error) {
    console.error('❌ Terra SDK test failed:', error);
    console.error('❌ Error type:', typeof error);
    console.error(
      '❌ Error message:',
      error instanceof Error ? error.message : 'No message'
    );
    console.error(
      '❌ Error stack:',
      error instanceof Error ? error.stack : 'No stack'
    );
    return null;
  }
};
