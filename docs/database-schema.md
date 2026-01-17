# Database Schema Documentation

## Overview
This document provides live context about our Supabase database structure and relationships.

## Tables

### Core Health Data
- `user_profiles` - User information with HIPAA compliance
- `user_conditions` - Medical conditions (ICD-10 codes)
- `user_medications` - Medications (RxNorm codes)
- `medication_doses` - Individual medication tracking
- `user_metrics` - Health metrics (weight, BP, HR, etc.)
- `user_priorities` - Health goals and priorities
- `health_scores` - Calculated health scores

### Fitness/Exercise Data
- `exercise_library` - Exercise database with movement patterns
- `mesocycle` - Workout programming blocks
- `workouts` - Individual workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets with performance data

### System Tables
- `device_connections` - Health device integrations
- `audit_log` - HIPAA compliance audit trail
- `sync_conflicts` - Offline sync conflict resolution
- `onboarding_progress` - User onboarding tracking

## Key Relationships
- Users → Mesocycles → Workouts → Workout Exercises → Sets
- Users → Conditions/Medications → Doses
- Users → Metrics → Health Scores

## Current Data Insights
*Update this section with current database state when needed*

## Common Queries
*Add frequently used queries here for reference*
