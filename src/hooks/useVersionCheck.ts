import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

import { Logger } from '../services/logger';
import {
  ReleaseNote,
  ReleaseNotesService,
} from '../services/release-notes-service';

const LAST_VERSION_KEY = 'last_shown_version';

export const useVersionCheck = () => {
  const [shouldShowReleaseNotes, setShouldShowReleaseNotes] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkVersionAndFetchReleaseNotes();
  }, []);

  const checkVersionAndFetchReleaseNotes = async () => {
    try {
      setIsLoading(true);

      // Get current app version directly from iOS build configuration using Expo Constants
      let currentVersion: string | null = null;
      try {
        // Get version from iOS Info.plist via Expo Constants (most reliable for TestFlight)
        currentVersion =
          Constants.expoConfig?.version || (Constants.manifest as any)?.version;

        // Also get build number for additional context
        const buildNumber =
          Constants.expoConfig?.ios?.buildNumber ||
          (Constants.manifest as any)?.ios?.buildNumber;

        // Combine version and build for more specific tracking if available
        if (buildNumber) {
          const fullVersion = `${currentVersion} (${buildNumber})`;
          Logger.debug('Full version string:', fullVersion);
        }
      } catch (versionError) {
        Logger.error('Failed to get current version:', versionError);
        // Fallback to package.json version or a default
        currentVersion = '1.0.0'; // Default fallback
      }

      if (!currentVersion) {
        Logger.warn(
          'Could not determine app version, skipping release notes check'
        );
        return;
      }

      //   Logger.debug('Current app version:', currentVersion);

      // Get last shown version from AsyncStorage
      const lastShownVersion = await AsyncStorage.getItem(LAST_VERSION_KEY);
      //   Logger.debug('Last shown version:', lastShownVersion);

      // Check if this is a new version
      const isNewVersion = lastShownVersion !== currentVersion;

      if (isNewVersion) {
        // Fetch release notes for the current version specifically
        const notes =
          await ReleaseNotesService.getReleaseNotesByVersion(currentVersion);
        // Logger.debug('Release notes for version', currentVersion, ':', notes);

        if (notes && notes.app_version === currentVersion) {
          setReleaseNotes(notes);
          setShouldShowReleaseNotes(true);
          Logger.debug(
            'Release notes ready to show for version:',
            currentVersion
          );
        }
      } else {
        // Logger.debug('Same version, no release notes to show');
      }
    } catch (error) {
      Logger.error('Error checking version and fetching release notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markVersionAsShown = async () => {
    try {
      let currentVersion: string | null = null;
      try {
        // Get version from iOS Info.plist via Expo Constants (most reliable for TestFlight)
        currentVersion =
          Constants.expoConfig?.version || (Constants.manifest as any)?.version;
      } catch (versionError) {
        Logger.error(
          'Failed to get current version for marking:',
          versionError
        );
        currentVersion = '1.0.0'; // Default fallback
      }

      if (currentVersion) {
        await AsyncStorage.setItem(LAST_VERSION_KEY, currentVersion);
        setShouldShowReleaseNotes(false);
        Logger.debug('Version marked as shown:', currentVersion);
      }
    } catch (error) {
      Logger.error('Error marking version as shown:', error);
    }
  };

  const dismissReleaseNotes = () => {
    setShouldShowReleaseNotes(false);
  };

  return {
    shouldShowReleaseNotes,
    releaseNotes,
    isLoading,
    markVersionAsShown,
    dismissReleaseNotes,
  };
};
