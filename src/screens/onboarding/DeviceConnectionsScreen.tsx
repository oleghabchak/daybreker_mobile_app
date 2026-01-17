// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Linking,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// import { ScrollViewWithIndicator } from '../../components/ScrollViewWithIndicator';
// import {
//   generateTerraAuthUrl,
//   SUPPORTED_PROVIDERS,
//   TERRA_CONFIG,
// } from '../../config/terraApi';
// import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
// import { supabase } from '../../lib/supabase';

// interface Props {
//   navigation: any;
// }

// interface ConnectedDevice {
//   provider: string;
//   connected_at: string;
//   last_sync?: string;
//   sync_status: string;
// }

// export const DeviceConnectionsScreen = ({ navigation }: Props) => {
//   const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
//     []
//   );
//   const [connectingProvider, setConnectingProvider] = useState<string | null>(
//     null
//   );
//   const [loading, setLoading] = useState(false);
//   const [screenStartTime] = useState(Date.now());

//   useEffect(() => {
//     loadConnectedDevices();
//     return () => {
//       trackScreenTime().catch(console.warn);
//     };
//   }, []);

//   const loadConnectedDevices = async () => {
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (user) {
//         const { data: connections } = await supabase
//           .from('device_connections')
//           .select('provider, connected_at, last_sync, sync_status')
//           .eq('user_id', user.id)
//           .eq('is_active', true);

//         if (connections) {
//           setConnectedDevices(connections);
//         }
//       }
//     } catch (error) {
//       console.warn('Error loading connected devices:', error);
//     }
//   };

//   const trackScreenTime = async () => {
//     const timeSpent = Math.round((Date.now() - screenStartTime) / 1000);
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (user) {
//         await supabase.from('screen_analytics').insert({
//           user_id: user.id,
//           screen_name: 'DeviceConnections',
//           time_spent_seconds: timeSpent,
//           interactions: connectedDevices.length,
//         });

//         await supabase.from('onboarding_progress').upsert({
//           user_id: user.id,
//           screen_name: 'DeviceConnections',
//           completed: true,
//           completed_at: new Date().toISOString(),
//           time_spent_seconds: timeSpent,
//           data_collected: {
//             connected_devices: connectedDevices.map(d => d.provider),
//           },
//         });
//       }
//     } catch (error) {
//       console.warn('Error tracking screen time:', error);
//     }
//   };

//   const connectDevice = async (provider: string) => {
//     if (!TERRA_CONFIG.DEV_ID || TERRA_CONFIG.DEV_ID === 'your-dev-id') {
//       Alert.alert(
//         'Setup Required',
//         'Terra API configuration is needed. Please contact support to enable device connections.',
//         [{ text: 'OK' }]
//       );
//       return;
//     }

//     setConnectingProvider(provider);

//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;

//       // Generate Terra auth URL
//       const redirectUrl = 'daybreaker://device-connected'; // Deep link back to app
//       const authUrl = generateTerraAuthUrl(user.id, provider, redirectUrl);

//       // Open Terra OAuth flow
//       const canOpen = await Linking.canOpenURL(authUrl);
//       if (canOpen) {
//         await Linking.openURL(authUrl);

//         // Save pending connection (will be completed by webhook)
//         await supabase.from('device_connections').upsert({
//           user_id: user.id,
//           provider: provider,
//           sync_status: 'connecting',
//           version: 1,
//         });

//         // Refresh the list after a delay
//         setTimeout(() => {
//           loadConnectedDevices();
//         }, 3000);
//       } else {
//         Alert.alert('Error', 'Unable to open device connection flow.');
//       }
//     } catch (error: any) {
//       Alert.alert(
//         'Connection Error',
//         'Failed to connect device. Please try again.'
//       );
//       console.error('Error connecting device:', error);
//     } finally {
//       setConnectingProvider(null);
//     }
//   };

//   const disconnectDevice = async (provider: string) => {
//     Alert.alert(
//       'Disconnect Device',
//       `Are you sure you want to disconnect ${provider}? This will stop syncing health data.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Disconnect',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const {
//                 data: { user },
//               } = await supabase.auth.getUser();
//               if (user) {
//                 await supabase
//                   .from('device_connections')
//                   .update({
//                     is_active: false,
//                     sync_status: 'disconnected',
//                     updated_at: new Date().toISOString(),
//                   })
//                   .eq('user_id', user.id)
//                   .eq('provider', provider);

//                 loadConnectedDevices();
//               }
//             } catch (error) {
//               Alert.alert('Error', 'Failed to disconnect device.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleContinue = async () => {
//     setLoading(true);
//     try {
//       navigation.navigate('Consent');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     Alert.alert(
//       'Skip Device Connections?',
//       'You can always connect devices later from your profile settings.',
//       [
//         { text: 'Go Back', style: 'cancel' },
//         { text: 'Skip for Now', onPress: handleContinue },
//       ]
//     );
//   };

//   const isDeviceConnected = (providerId: string) => {
//     return connectedDevices.some(device => device.provider === providerId);
//   };

//   const getConnectionStatus = (providerId: string) => {
//     const device = connectedDevices.find(d => d.provider === providerId);
//     if (!device) return null;

//     if (device.sync_status === 'connecting') return 'Connecting...';
//     if (device.sync_status === 'active') return 'Connected';
//     if (device.sync_status === 'error') return 'Sync Error';
//     return device.sync_status;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollViewWithIndicator contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//           >
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Connect Your Devices</Text>
//           <Text style={styles.headerSubtitle}>
//             Sync your health data automatically from wearables and apps for more
//             accurate insights.
//           </Text>
//           <View style={styles.progressBar}>
//             <View style={[styles.progressFill, { width: '71%' }]} />
//           </View>
//           <Text style={styles.progressText}>10 of 14</Text>
//         </View>

//         <View style={styles.content}>
//           {/* Benefits */}
//           <View style={styles.benefitsContainer}>
//             <Text style={styles.benefitsTitle}>Why Connect Devices?</Text>
//             <View style={styles.benefitsList}>
//               <View style={styles.benefitItem}>
//                 <Text style={styles.benefitIcon}>🔄</Text>
//                 <Text style={styles.benefitText}>
//                   Automatic data sync - no manual logging
//                 </Text>
//               </View>
//               <View style={styles.benefitItem}>
//                 <Text style={styles.benefitIcon}>📊</Text>
//                 <Text style={styles.benefitText}>
//                   More accurate health scores and insights
//                 </Text>
//               </View>
//               <View style={styles.benefitItem}>
//                 <Text style={styles.benefitIcon}>⏱️</Text>
//                 <Text style={styles.benefitText}>
//                   Real-time health monitoring
//                 </Text>
//               </View>
//               <View style={styles.benefitItem}>
//                 <Text style={styles.benefitIcon}>🎯</Text>
//                 <Text style={styles.benefitText}>
//                   Personalized recommendations
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Device List */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Available Devices & Apps</Text>
//             {SUPPORTED_PROVIDERS.slice(0, 6).map(provider => (
//               <View key={provider.id} style={styles.providerCard}>
//                 <View style={styles.providerHeader}>
//                   <View
//                     style={[
//                       styles.providerIcon,
//                       { backgroundColor: provider.color + '20' },
//                     ]}
//                   >
//                     <Text style={styles.providerIconText}>{provider.icon}</Text>
//                   </View>
//                   <View style={styles.providerInfo}>
//                     <Text style={styles.providerName}>{provider.name}</Text>
//                     <Text style={styles.providerDescription}>
//                       {provider.description}
//                     </Text>
//                     <View style={styles.featuresContainer}>
//                       {provider.features.slice(0, 3).map((feature, index) => (
//                         <View key={index} style={styles.featureTag}>
//                           <Text style={styles.featureText}>{feature}</Text>
//                         </View>
//                       ))}
//                     </View>
//                   </View>
//                   <View style={styles.connectContainer}>
//                     {isDeviceConnected(provider.id) ? (
//                       <TouchableOpacity
//                         style={[styles.connectButton, styles.connectedButton]}
//                         onPress={() => disconnectDevice(provider.id)}
//                       >
//                         <Text style={styles.connectedButtonText}>
//                           {getConnectionStatus(provider.id)}
//                         </Text>
//                         <Text style={styles.disconnectText}>
//                           Tap to disconnect
//                         </Text>
//                       </TouchableOpacity>
//                     ) : (
//                       <TouchableOpacity
//                         style={[
//                           styles.connectButton,
//                           connectingProvider === provider.id &&
//                             styles.connectingButton,
//                         ]}
//                         onPress={() => connectDevice(provider.id)}
//                         disabled={connectingProvider === provider.id}
//                       >
//                         {connectingProvider === provider.id ? (
//                           <ActivityIndicator
//                             color={Colors.background}
//                             size='small'
//                           />
//                         ) : (
//                           <Text style={styles.connectButtonText}>Connect</Text>
//                         )}
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             ))}
//           </View>

//           {/* Connected Summary */}
//           {connectedDevices.length > 0 && (
//             <View style={styles.summaryContainer}>
//               <Text style={styles.summaryTitle}>
//                 🎉 {connectedDevices.length} Device
//                 {connectedDevices.length !== 1 ? 's' : ''} Connected
//               </Text>
//               <Text style={styles.summaryText}>
//                 Your health data will sync automatically and improve your
//                 digital twin accuracy.
//               </Text>
//             </View>
//           )}

//           {/* Privacy Note */}
//           <View style={styles.privacyNote}>
//             <Text style={styles.privacyIcon}>🔒</Text>
//             <View style={styles.privacyContent}>
//               <Text style={styles.privacyTitle}>Your Data is Secure</Text>
//               <Text style={styles.privacyText}>
//                 All health data is encrypted and stored securely. You can
//                 disconnect any device at any time from your profile settings.
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.footer}>
//           <View style={styles.footerButtons}>
//             <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
//               <Text style={styles.skipButtonText}>Skip for Now</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.continueButton, loading && styles.buttonDisabled]}
//               onPress={handleContinue}
//               disabled={loading}
//             >
//               <Text style={styles.continueButtonText}>
//                 {loading ? 'Loading...' : 'Continue'}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.footerNote}>
//             You can always connect more devices later from Settings
//           </Text>
//         </View>
//       </ScrollViewWithIndicator>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   header: {
//     paddingHorizontal: Space[6],
//     paddingTop: Space[6],
//     paddingBottom: Space[8],
//   },
//   backButton: {
//     marginBottom: Space[6],
//   },
//   backText: {
//     fontSize: 24,
//     color: Colors.textPrimary,
//   },
//   headerTitle: {
//     ...Typography.h1,
//     color: Colors.textPrimary,
//     marginBottom: Space[2],
//   },
//   headerSubtitle: {
//     ...Typography.body,
//     color: Colors.textDisabled,
//     marginBottom: Space[6],
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: Colors.border,
//     borderRadius: 2,
//     marginBottom: Space[2],
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: Colors.primary,
//     borderRadius: 2,
//   },
//   progressText: {
//     ...Typography.caption,
//     color: Colors.textDisabled,
//     textAlign: 'center',
//   },
//   content: {
//     paddingHorizontal: Space[6],
//     flex: 1,
//   },
//   benefitsContainer: {
//     backgroundColor: Colors.primary + '10',
//     borderRadius: BorderRadius.lg,
//     padding: Space[6],
//     marginBottom: Space[8],
//   },
//   benefitsTitle: {
//     ...Typography.h3,
//     color: Colors.textPrimary,
//     marginBottom: Space[4],
//   },
//   benefitsList: {
//     gap: Space[4],
//   },
//   benefitItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   benefitIcon: {
//     fontSize: 20,
//     marginRight: Space[4],
//     width: 24,
//   },
//   benefitText: {
//     ...Typography.body,
//     color: Colors.textDisabled,
//     flex: 1,
//   },
//   section: {
//     marginBottom: Space[8],
//   },
//   sectionTitle: {
//     ...Typography.h3,
//     color: Colors.textPrimary,
//     marginBottom: Space[4],
//   },
//   providerCard: {
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: BorderRadius.lg,
//     padding: Space[6],
//     marginBottom: Space[4],
//     backgroundColor: '#F8F9FA',
//   },
//   providerHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   providerIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: Space[4],
//   },
//   providerIconText: {
//     fontSize: 24,
//   },
//   providerInfo: {
//     flex: 1,
//     marginRight: Space[4],
//   },
//   providerName: {
//     ...Typography.bodyMedium,
//     color: Colors.textPrimary,
//     marginBottom: Space[1],
//   },
//   providerDescription: {
//     ...Typography.caption,
//     color: Colors.textDisabled,
//     marginBottom: Space[2],
//   },
//   featuresContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: Space[1],
//   },
//   featureTag: {
//     backgroundColor: Colors.border,
//     paddingHorizontal: Space[2],
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   featureText: {
//     ...Typography.caption,
//     color: Colors.textDisabled,
//     fontSize: 10,
//   },
//   connectContainer: {
//     alignItems: 'center',
//   },
//   connectButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: Space[4],
//     paddingVertical: Space[2],
//     borderRadius: BorderRadius.md,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   connectingButton: {
//     opacity: 0.7,
//   },
//   connectedButton: {
//     backgroundColor: Colors.success,
//   },
//   connectButtonText: {
//     ...Typography.caption,
//     color: Colors.background,
//     fontWeight: '600',
//   },
//   connectedButtonText: {
//     ...Typography.caption,
//     color: Colors.background,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   disconnectText: {
//     ...Typography.caption,
//     color: Colors.background,
//     fontSize: 9,
//     opacity: 0.8,
//   },
//   summaryContainer: {
//     backgroundColor: Colors.success + '15',
//     borderRadius: BorderRadius.lg,
//     padding: Space[6],
//     marginBottom: Space[6],
//     alignItems: 'center',
//   },
//   summaryTitle: {
//     ...Typography.bodyMedium,
//     color: Colors.success,
//     marginBottom: Space[2],
//     textAlign: 'center',
//   },
//   summaryText: {
//     ...Typography.caption,
//     color: Colors.textDisabled,
//     textAlign: 'center',
//   },
//   privacyNote: {
//     flexDirection: 'row',
//     backgroundColor: '#F8F9FA',
//     borderRadius: BorderRadius.lg,
//     padding: Space[6],
//   },
//   privacyIcon: {
//     fontSize: 24,
//     marginRight: Space[4],
//   },
//   privacyContent: {
//     flex: 1,
//   },
//   privacyTitle: {
//     ...Typography.bodyMedium,
//     color: Colors.textPrimary,
//     marginBottom: Space[1],
//   },
//   privacyText: {
//     ...Typography.caption,
//     color: Colors.textDisabled,
//     lineHeight: 18,
//   },
//   footer: {
//     paddingHorizontal: Space[6],
//     paddingBottom: Space[6],
//     paddingTop: Space[4],
//   },
//   footerButtons: {
//     flexDirection: 'row',
//     gap: Space[4],
//     marginBottom: Space[4],
//   },
//   skipButton: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: BorderRadius.full,
//     paddingVertical: Space[4],
//     alignItems: 'center',
//   },
//   skipButtonText: {
//     ...Typography.bodyMedium,
//     color: Colors.textDisabled,
//   },
//   continueButton: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//     borderRadius: BorderRadius.full,
//     paddingVertical: Space[4],
//     alignItems: 'center',
//   },
//   continueButtonText: {
//     ...Typography.bodyMedium,
//     color: Colors.background,
//     fontSize: 16,
//   },
//   buttonDisabled: {
//     opacity: 0.7,
//   },
//   footerNote: {
//     ...Typography.caption,
//     color: Colors.textDisabled,
//     textAlign: 'center',
//   },
// });
