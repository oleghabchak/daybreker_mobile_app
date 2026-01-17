/**
 * Terra Daily Data Interface
 * Based on the actual Terra API response structure
 */

export interface ITerraDailyData {
  // Metadata
  metadata: {
    end_time: string;
    start_time: string;
    upload_type: number;
  };

  // MET (Metabolic Equivalent) Data
  MET_data: {
    samples: {
      timestamp: string;
      met_value: number;
    }[];
  };

  // Active Durations Data
  active_durations_data: {
    activity_levels_samples: {
      timestamp: string;
      activity_level: string;
    }[];
    activity_seconds: number;
    standing_hours_count: number;
    standing_seconds: number;
  };

  // Calories Data
  calories_data: {
    BMR_calories: number;
    calorie_samples: {
      timestamp: string;
      calories: number;
    }[];
    net_activity_calories: number;
    total_burned_calories: number;
  };

  // Device Data
  device_data: {
    data_provided: string[];
    hardware_version: string;
    manufacturer: string;
    name: string;
    other_devices: {
      name: string;
      hardware_version: string;
      manufacturer: string;
    }[];
    serial_number: string;
    software_version: string;
  };

  // Distance Data
  distance_data: {
    detailed: {
      distance_samples: {
        timestamp: string;
        distance_meters: number;
      }[];
    };
    distance_meters: number;
    elevation: {
      elevation_samples: {
        timestamp: string;
        elevation_meters: number;
      }[];
    };
    floors_climbed: number;
    steps: number;
    swimming: {
      swimming_samples: {
        timestamp: string;
        distance_meters: number;
      }[];
    };
  };

  // Heart Rate Data
  heart_rate_data: {
    detailed: {
      heart_rate_samples: {
        timestamp: string;
        heart_rate_bpm: number;
      }[];
    };
    summary: {
      resting_heart_rate: number;
      max_heart_rate: number;
      avg_heart_rate: number;
    };
  };

  // Oxygen Data
  oxygen_data: {
    saturation_samples: {
      timestamp: string;
      oxygen_saturation: number;
    }[];
    vo2_samples: {
      timestamp: string;
      vo2_max: number;
    }[];
  };

  // Scores (empty in current data)
  scores: Record<string, any>;

  // Strain Data (empty in current data)
  strain_data: Record<string, any>;

  // Stress Data
  stress_data: {
    samples: {
      timestamp: string;
      stress_level: number;
    }[];
  };

  // Tag Data
  tag_data: {
    tags: {
      timestamp: string;
      tag: string;
    }[];
  };
}

/**
 * Processed Terra Daily Data Interface
 * Simplified version for easier consumption
 */
export interface IProcessedTerraDailyData {
  date: string;
  steps: number;
  distance_meters: number;
  floors_climbed: number;
  calories_burned: number;
  BMR_calories: number;
  net_activity_calories: number;
  activity_seconds: number;
  standing_hours: number;
  standing_seconds: number;
  resting_heart_rate?: number;
  max_heart_rate?: number;
  avg_heart_rate?: number;
  oxygen_saturation?: number;
  stress_level?: number;
  device_info: {
    name: string;
    manufacturer: string;
    hardware_version: string;
    software_version: string;
  };
}

/**
 * Terra Data Filters Interface
 */
export interface ITerraDataFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  dataTypes?: string[];
  deviceTypes?: string[];
}

/**
 * Terra Data Search Parameters
 */
export interface ITerraDataSearchParams {
  filters?: ITerraDataFilters;
  limit?: number;
  offset?: number;
}

/**
 * Terra Data Response Interface
 */
export interface ITerraDataResponse {
  data: IProcessedTerraDailyData[];
  total: number;
  hasMore: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}
