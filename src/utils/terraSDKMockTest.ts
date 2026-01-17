import { getActivity, Connections } from 'terra-react';

import { TERRA_CONFIG } from '../config/terraApi';

/**
 * Test Terra Health & Fitness API (getActivity)
 */
export const testTerraSDKWithMockData = async () => {
  try {
    console.log('🧪 Testing Terra Health & Fitness API (getActivity)...');

    // First, let's check if the SDK is properly initialized
    console.log('🔍 Checking Terra SDK status...');
    console.log('🔍 Connections.APPLE_HEALTH:', Connections.APPLE_HEALTH);
    console.log('🔍 Connections type:', typeof Connections);
    console.log('🔍 Available connections:', Object.keys(Connections));

    // Try to import and initialize the SDK
    try {
      const { initTerra, initConnection } = await import('terra-react');
      console.log('🔍 initTerra function available:', typeof initTerra);
      console.log(
        '🔍 initConnection function available:',
        typeof initConnection
      );

      // Try to initialize Terra with the real dev ID
      console.log('🔍 Attempting to initialize Terra...');
      console.log('🔍 Using dev ID:', TERRA_CONFIG.DEV_ID);
      const initResult = await initTerra(TERRA_CONFIG.DEV_ID, 'test-user-123');
      console.log('🔍 Terra initialization result:', initResult);

      if (!initResult.success) {
        console.log('❌ Terra initialization failed:', initResult.error);
        return {
          success: false,
          error: `Terra initialization failed: ${initResult.error}`,
        };
      }

      console.log('✅ Terra initialized successfully!');

      // Try to initialize connection (this might require user interaction)
      console.log('🔍 Attempting to initialize connection...');
      try {
        const connectionResult = await initConnection('test-token-123');
        console.log('🔍 Connection result:', connectionResult);

        if (connectionResult.success) {
          console.log('✅ Terra connection initialized successfully!');
        } else {
          console.log(
            '⚠️ Terra connection failed (expected for test):',
            connectionResult.error
          );
        }
      } catch (connectionError) {
        console.log(
          '⚠️ Connection initialization failed (expected for test):',
          connectionError
        );
      }
    } catch (importError) {
      console.log('❌ Failed to import Terra functions:', importError);
      return {
        success: false,
        error: `Failed to import Terra functions: ${importError}`,
      };
    }

    // Create test dates
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const startTime = new Date(yesterday);
    startTime.setHours(8, 0, 0, 0); // 8 AM start

    const endTime = new Date(yesterday);
    endTime.setHours(18, 0, 0, 0); // 6 PM end

    console.log('🔍 Test dates:');
    console.log('🔍 Start time:', startTime.toISOString());
    console.log('🔍 End time:', endTime.toISOString());

    // Test getActivity with different connection types and date formats
    const connectionTypes = [
      { type: Connections.APPLE_HEALTH, name: 'APPLE_HEALTH' },
      { type: 0, name: 'APPLE_HEALTH (0)' },
      { type: 1, name: 'GOOGLE_FIT (1)' },
    ];

    // Only test with Date objects since that's what the SDK expects
    const dateFormats = [
      { start: startTime, end: endTime, name: 'Date objects' },
    ];

    // Test all combinations
    for (const connectionType of connectionTypes) {
      for (const dateFormat of dateFormats) {
        console.log(
          `📤 Testing getActivity with ${connectionType.name} and ${dateFormat.name}...`
        );
        console.log('📤 Connection type:', connectionType.type);
        console.log('📤 Start date:', dateFormat.start);
        console.log('📤 End date:', dateFormat.end);

        try {
          const response = await getActivity(
            connectionType.type,
            dateFormat.start,
            dateFormat.end,
            false // toWebhook = false
          );

          console.log(
            `📋 Terra SDK response (${connectionType.name} + ${dateFormat.name}):`,
            response
          );

          if (response.success) {
            console.log(
              `✅ Terra SDK getActivity successful with ${connectionType.name} + ${dateFormat.name}!`
            );
            return {
              success: true,
              data: response.data,
              connection: connectionType.name,
              dateFormat: dateFormat.name,
            };
          } else {
            console.log(
              `❌ Terra SDK getActivity failed with ${connectionType.name} + ${dateFormat.name}:`,
              response.error
            );
          }
        } catch (error) {
          console.log(
            `❌ Terra SDK getActivity error with ${connectionType.name} + ${dateFormat.name}:`,
            error
          );
        }
      }
    }

    // If all attempts failed, explain what's needed
    console.log('❌ All getActivity attempts failed');
    console.log('💡 To use getActivity, you need:');
    console.log('   1. User authentication with Terra');
    console.log('   2. Apple HealthKit connection established');
    console.log('   3. Valid authentication token');
    console.log('   4. User must have granted HealthKit permissions');
    console.log(
      '💡 Try using the existing connectDevice flow in the app first!'
    );

    return {
      success: false,
      error:
        'getActivity requires authenticated Apple HealthKit connection. Use connectDevice flow first.',
      needsConnection: true,
    };
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
    return { success: false, error: error };
  }
};
