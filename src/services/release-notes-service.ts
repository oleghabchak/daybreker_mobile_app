import { supabase } from '../lib/supabase';

import { Logger } from './logger';

export interface ReleaseNote {
  id: number;
  created_at: string;
  new_features?: string | string[];
  improvements?: string | string[];
  bug_fixes?: string | string[];
  security_updates?: string | string[];
  app_version: string;
}

export class ReleaseNotesService {
  static async getLatestReleaseNotes(): Promise<ReleaseNote | null> {
    try {
      Logger.debug('ReleaseNotesService.getLatestReleaseNotes');

      const { data, error } = await supabase
        .from('release_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        Logger.error('Failed to fetch release notes:', error);
        return null;
      }

      return data;
    } catch (error) {
      Logger.error('Error fetching release notes:', error);
      return null;
    }
  }

  static async getReleaseNotesByVersion(
    version: string
  ): Promise<ReleaseNote | null> {
    try {
      const { data, error } = await supabase
        .from('release_notes')
        .select('*')
        .eq('app_version', version)
        .single();

      if (error) {
        // Logger.error('Failed to fetch release notes for version:', error);
        return null;
      }

      return data;
    } catch (error) {
      // Logger.error('Error fetching release notes for version:', error);
      return null;
    }
  }
}
