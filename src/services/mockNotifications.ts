// Mock notifications service to avoid native module errors during development
export const Notifications = {
  requestPermissionsAsync: async () => {
    // Mock permission request
    console.log('Mock: Requesting notification permissions');
    return { status: 'granted' };
  },

  getPermissionsAsync: async () => {
    return { status: 'undetermined' };
  },

  setNotificationHandler: (handler: any) => {
    console.log('Mock: Setting notification handler');
  },

  scheduleNotificationAsync: async (config: any) => {
    console.log('Mock: Scheduling notification', config);
    return 'mock-notification-id';
  },
};

export const Location = {
  requestForegroundPermissionsAsync: async () => {
    console.log('Mock: Requesting location permissions');
    return { status: 'granted' };
  },

  getCurrentPositionAsync: async (options?: any) => {
    console.log('Mock: Getting current position');
    return {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        accuracy: 5,
        altitudeAccuracy: 5,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    };
  },
};
