# CLAUDE.md - Daybreaker Health Longevity OS Platform



# Remove any and all mention of "Claude Code" or anything-related, in the git commits. All commits should reflect "lucaschatham" (my github username) as the primary "committer."

Product specs & technical guidance for the Daybreaker Health portal - a mobile-first app tracking 9 longevity domains. Converts data from labs (ApoB, HbA1c, hs-CRP), wearables (Apple Health, Oura, Whoop), fitness tests (VO2max, grip strength) & supplements into a single "Do This Today" task list. Home screen shows Biological-Age dial + top 3 impact factors.

## 🎯 Product Vision

**Core**: Translate labs, wearables & lifestyle inputs into personalized protocols. Calculate biological age across 9 domains, provide daily "do this today" tasks.

**Full Platform**: Bio age dashboard, 9-domain tracking, clinical protocol engine, Quest/Labcorp integration, Apple Health/Oura/Whoop/Garmin sync, Cerbo EHR.

**Hackathon Goals (2025-07-28)**: TestFlight w/ 10+ users, exercise tracking, auth, clean UI.

## 🏗️ Engineering Standards

**Philosophy**: High signal/low noise. Atomic decomposition. Context-driven. Do more with less.

**Principles**: Single responsibility, composition > inheritance, fail fast, immutable by default, type safety.

**Decision Framework**: 1) Why? 2) Define done 3) Identify constraints 4) Simplest solution 5) Test plan

**Code Standards**: Self-documenting, comment complex logic, benchmark critical paths, validate security ops, handle DB edge cases.

**Debt Management**: Fix blockers immediately, incremental refactors, document decisions, monitor health.

## Commands

**Dev**: `npm start`, `npm run ios/android/web`, `npm test`  
**Build**: `eas build --platform ios/android --profile preview`  
**Deploy**: `eas submit --platform ios/android --latest`

## 📱 Product Spec

**Journey**: Welcome → Auth → Profile → Exercise Discovery → Workout Tracking → Progress Analytics → Settings

**Users**: Primary (health-conscious), Secondary (fitness pros), Beta (10: 3 health, 3 fitness, 2 tech, 2 family)

## Architecture

**Stack**: Expo RN v50 + TS, Supabase (PostgreSQL + Auth + Real-time), React Navigation v6, React hooks, SecureStore/AsyncStorage

**Nav Flow**: Welcome → Auth → Permissions → Priorities → Dashboard (with smart initial route detection)

## Design

**Base**: 4px unit system. Spacing: 0/4/8/12/16/24/32/48/64/96px

**Colors**: Primary #E07B39, Secondary #479FC7, Text #2C2926/#6B6B6B, Surface #FFFFFF/#E8F3F8, Status: success #52C41A, warning #FAAD14, error #FF4D4F

**Typography**: SF Pro/Roboto. Sizes: 11/13/15/17/20/24/32/40px. Weights: 400/500/600/700

**Motion**: Durations: 50/100/200/300/600ms. Easing: standard cubic-bezier(0.4,0,0.2,1)

**Components**: iOS toggles (51×31px, #34C759/#E5E5EA). Buttons: 48px height, 24px radius, primary #E07B39, secondary #479FC7

**Spacing**: Related 8px, sections 16px, groups 24px, major 32px, padding 16×24px

## 🗄️ Database Schema (HIPAA-Compliant)

**Principles**: HIPAA compliance, 9-domain tracking, clinical integration, bio age engine, protocol automation, UUIDs, soft deletes, audit trails

**9 Health Domains**: body, fitness, lipids, sugar, inflammation, hormones, cells, organs, recovery

**Data Sources**: quest_diagnostics, labcorp, apple_health, oura_ring, whoop, garmin, manual_*, cerbo_ehr

### Core Tables

**profiles**: UUID PK, email, full_name, DOB, bio_sex, height_cm, practitioner_id, onboarding_completed, consents, soft deletes, audit fields

**practitioners**: UUID PK, full_name, email, license_number, NPI, specialty[], role, permissions, EHR IDs

**biomarkers**: Time-series health data. Domain, code (apob, hba1c), value, unit, ranges, risk_level, data_source, temporal tracking, clinical review flags

**biological_age_snapshots**: Bio age, chrono age, age_delta, domain_ages JSONB (9 domains), algorithm_version, confidence_score

**protocols**: Intervention plans. Name, target_domain, type (supplement/exercise/nutrition), interventions JSONB, duration_weeks, status, adherence_%

**tasks**: Daily actions. Title ("Take 5g creatine"), type, target_domain, due_date/time, recurring_pattern, priority 1-10, parameters JSONB, completion tracking

**exercises**: Library of 30+ exercises. Name, category (strength/cardio/flexibility), muscle_groups[], equipment[], difficulty 1-5, instructions JSONB, videos/images

**workouts**: Session tracking. Name, type (strength/cardio/zone2), started_at, duration, total_sets/reps/weight/volume, status, energy_levels 1-10

**workout_exercises**: Links workouts to exercises. Order_index, prescribed sets/reps/weight, completed_sets, total_volume, status

**exercise_sets**: Individual sets. Set_number, type (warmup/working), reps, weight_kg, RPE 1-10, rest_seconds, volume_kg (calculated), personal_record flag

**nutrition_entries**: Food tracking. Consumed_at, meal_type, food_name, macros (calories/protein/carbs/fat), glycemic_index, fits_protocol flag

**supplement_intake**: Supplement tracking. Name, type (vitamin/peptide/hormone), dose_amount/unit, taken_at, timing_context, adherence_score 0-100

**data_integrations**: External sync. Integration_type, OAuth tokens (encrypted), sync_frequency_minutes, sync_scope[], consent tracking

**audit_logs**: HIPAA tracking. Who (user/practitioner), what (action/resource), when, context (IP/endpoint), data changes JSONB

### 🚨 Platform Gotchas & Solutions

**1. HIPAA Compliance**: Encrypt PHI at app layer, use RLS policies, complete audit logging

**2. 9-Domain Complexity**: Domain-driven design, specific tables/indexes per domain, materialized views for cross-domain

**3. Bio Age Performance**: Event-driven calculations, cache in snapshots table, background jobs

**4. Data Quality**: Multi-layer validation, DB constraints, outlier detection, manual review workflow

### 🎯 Hackathon MVP Strategy

**Day 1**: profiles, practitioners, exercises, audit_logs  
**Day 2**: workouts, workout_exercises, exercise_sets  
**Day 3**: Personal records, workout history, progress charts, TestFlight

**Post-Hackathon**: biomarkers, protocols, tasks, nutrition, supplements, bio_age_snapshots

### 🔒 HIPAA Compliance

**Data Classes**: PHI (DOB/MRN), Sensitive (biomarkers), Non-Sensitive (exercises)

**Security**: E2E encryption, RLS policies, audit logs, short-lived tokens, pentesting

**Access Control**: Users → own data only, Practitioners → assigned patients, Admins → all with audit

## 🚀 Summary

**Built**: Medical-grade HIPAA schema scaling from workout app → 9-domain longevity platform

**3-Day Plan**: Day 1: Auth+Exercises, Day 2: Workout tracking, Day 3: Analytics+TestFlight

**Success Factors**: Over-engineered schema, HIPAA from day 1, domain separation, mobile-first

**Schema Benefits**: Future-proof, 100K+ users, HIPAA compliant, JSONB flexibility, UUID conflict-free

**Post-MVP**: Biomarkers → Protocols → Bio age → Nutrition → Clinical workflow
q
## 🕷️ 9-Axis Longevity Scoring Model

Platform uses 9-axis model capturing >90% modifiable mortality risk via evidence-based biomarker aggregation.

**9 Axes**: 1.Body (fat/muscle), 2.Fitness (cardio/strength) ✅MVP, 3.Lipids, 4.Sugar, 5.Inflammation, 6.Hormones, 7.Cells, 8.Organs, 9.Recovery

**Scoring**: 
- Percentile conversion (NHANES reference)
- Median of ≥3 biomarkers per axis
- Weights: Lipids 0.15, Fitness 0.13, Inflammation 0.13, Body 0.12, Sugar 0.12, Cells 0.10, Organs 0.10, Hormones 0.08, Recovery 0.07
- Tiers: Foundation <40, Optimization 40-59, Regeneration 60-79, Extension ≥80
- Red flag: <20th percentile drops tier

**Spider Graph**: 400×400px mobile, 9 axes clockwise. Colors: Foundation #FECBCB, Optimization #FFE2B8, Regeneration #FFF2B6, Extension #C8F0C8. WCAG 2.2 AA compliant.

## 🚧 Roadmap

**MVP → Full Platform**:
Weekend: WorkoutMetrics (volume, progression, consistency)
Phase 2: FitnessBiomarkers (VO2max, grip strength, HRV)

**Phase 2 Integrations**:
- Labs: Quest/Labcorp PDF parsing, 24h batch
- Wearables: Apple Health, Oura, Whoop, Garmin (24h sync)
- Bio Age Engine: Event-driven, 5min latency, async queue


**Progressive UX**: Week 1 workouts → Week 2 wearable → Month 1 labs → Month 3 full panel

**Tech Decisions**: Real-time workouts (5min), batch labs/wearables (24h), offline support, auto-save, outlier detection, HIPAA compliant, wellness tool (not diagnostic)

**Future Revenue**: Lab partnerships, supplement sales, clinical services, subscription tiers (Phase 3+)
