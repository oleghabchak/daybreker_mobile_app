import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';

export const HealthKitScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* <TerraConnectionTest />
      <TerraDataRetrievalTest /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  dataContainer: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  settingsContainer: {
    padding: 16,
  },
  settingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  syncOptions: {
    marginTop: 8,
  },
  syncOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  syncOptionText: {
    fontSize: 16,
    color: '#333',
  },
});
