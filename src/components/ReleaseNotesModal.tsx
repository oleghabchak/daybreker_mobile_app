import { Dot } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Space, Typography } from '../constants/theme';
import { ReleaseNote } from '../services/release-notes-service';

import { Modal } from './ui/Modal';

interface ReleaseNotesModalProps {
  isVisible: boolean;
  releaseNotes: ReleaseNote | null;
  onClose: () => void;
  onMarkAsShown: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({
  isVisible,
  releaseNotes,
  onClose,
  onMarkAsShown,
}) => {
  const handleClose = () => {
    onMarkAsShown();
    onClose();
  };

  const renderSection = (title: string, content?: string | string[]) => {
    if (
      !content ||
      (Array.isArray(content) && content.length === 0) ||
      (typeof content === 'string' && content.trim() === '')
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Dot color={Colors.text} size={16} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))
          ) : (
            <View style={styles.listItem}>
              <Dot color={Colors.text} size={16} />
              <Text style={styles.listItemText}>{content}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={handleClose}
      title={`What's New in Version ${releaseNotes?.app_version || ''}`}
      size='large'
      closeOnBackdropPress={false}
      closeOnBackButtonPress={false}
      primaryAction={{
        label: 'Got it!',
        onPress: handleClose,
        variant: 'primary',
      }}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {renderSection('✨ New Features', releaseNotes?.new_features)}
          {renderSection('🚀 Improvements', releaseNotes?.improvements)}
          {renderSection('🐛 Bug Fixes', releaseNotes?.bug_fixes)}
          {renderSection('🔒 Security Updates', releaseNotes?.security_updates)}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 350,
  },
  content: {
    paddingVertical: Space[1],
  },
  section: {
    marginBottom: Space[1],
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[1],
  },
  sectionContent: {
    marginTop: Space[1],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  listItemText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    lineHeight: 22,
    marginLeft: Space[1],
    flex: 1,
  },
});
