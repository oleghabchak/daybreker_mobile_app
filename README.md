# Daybreaker Portal - React Native Fitness App

<div align="center">
  <img src="assets/daybreaker-logo-1024.png" alt="Daybreaker Health Logo" width="200" height="200">
  
  **It's the dawn of a healthier, happier you**
  
  A comprehensive React Native fitness application designed to support your longevity journey through personalized workout tracking, mesocycle management, and data-driven health optimization.
</div>

## 🌅 About Daybreaker Health

[Daybreaker Health](https://daybreakerhealth.com/) is a virtual longevity service offering advanced diagnostics, precision nutrition, and expert support for lasting energy and long-term health. Our React Native portal app brings this comprehensive approach to your mobile device, enabling continuous health monitoring and personalized fitness programming.

### Our Approach

We know you've tried other approaches—diets that don't stick, fitness routines that feel unsustainable, and memberships that leave you uninspired. Daybreaker Health is different because we take your entire health story – every data point, every goal, every challenge – to awaken a new you through pioneering medical technologies that push the boundaries of what's possible in wellness care.

- **Where traditional clinics offer occasional check-ins, we provide continuous support**
- **Where they follow standard protocols, we pioneer personalized solutions**
- **Where they maintain conventional approaches, we advance the science of wellness**

## 📱 App Features

### 🏋️ Comprehensive Workout Management

- **Mesocycle Programming**: Structured workout cycles with progressive overload
- **Exercise Tracking**: Detailed exercise logging with sets, reps, weight, and RIR (Reps in Reserve)
- **Workout Completion**: Smart completion tracking with visual progress indicators
- **Exercise Library**: Extensive database of exercises with proper form guidance

### 📊 Data-Driven Insights

- **The Daybreaker Graph™**: Visual representation of 100+ biomarkers across four tiers
- **Progress Tracking**: Real-time monitoring of fitness metrics and health markers
- **Performance Analytics**: Detailed insights into workout performance and trends
- **Biometric Integration**: Seamless connection with wearables (WHOOP, Apple Watch, Garmin)

### 🎯 Personalized Experience

- **Adaptive Programming**: AI-driven workout adjustments based on performance data
- **Custom Protocols**: Personalized nutrition, exercise, and recovery protocols
- **Goal Tracking**: Comprehensive goal setting and achievement monitoring
- **Health Coaching**: Integrated coaching support and guidance

### 🔄 Continuous Monitoring

- **Real-time Updates**: Live data synchronization across all devices
- **Progress Visualization**: Clear visual representation of health improvements
- **Monthly Assessments**: Regular health check-ins and protocol adjustments
- **Longevity Tracking**: Monitoring of biological age and health markers

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development)
- **Expo CLI** (for development builds)
- **EAS CLI** (for production builds)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/daybreakerhealth/daybreaker_portal.git
   cd daybreaker_portal
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup:**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup:**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

### Development

#### Start Development Server

```bash
# Start Expo development server
npm start
# or
yarn start

# Run on specific platform
npm run ios
npm run android
# or
yarn ios
yarn android
```

#### EAS Build (Production)

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for development
eas build --profile development --platform all

# Build for preview/testing
eas build --profile preview --platform all

# Build for production
eas build --profile production --platform ios --auto-submit
eas build --profile production --platform all --auto-submit
eas build --profile production --platform android --auto-submit
```

### Environment Setup

The app uses environment-specific configuration files based on `NODE_ENV`:

- `.env.development` - Development environment
- `.env.production` - Production environment

1. **Configure Environment Variables:**

   ```bash
   # For local development with Supabase CLI
   # Create .env.development file (see Supabase Setup section below)
   
   # For other environments
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Firebase Configuration:**
   - Add your Firebase configuration files
   - Configure authentication providers
   - Set up Firestore rules

3. **Supabase Configuration:**
   - Follow the detailed [Supabase Setup](#supabase-setup) section below
   - Configure local development with Supabase CLI
   - Set up database schemas and migrations

## 🏗️ Architecture

### Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **Zustand** - State management
- **Supabase** - Backend-as-a-Service
- **Firebase** - Authentication and analytics
- **React Navigation** - Navigation library
- **React Hook Form** - Form management

### Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
├── navigators/         # Navigation configuration
├── models/             # State management stores
├── services/           # API and external services
├── utils/              # Utility functions
├── constants/          # App constants and themes
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

### Key Features Implementation

- **Mesocycle Management**: Structured workout programming with progressive overload
- **Exercise Tracking**: Comprehensive exercise logging and performance monitoring
- **Real-time Sync**: Live data synchronization with backend services
- **Offline Support**: Local data storage and sync when connection is restored
- **Biometric Integration**: Wearable device data integration
- **Health Monitoring**: Continuous health marker tracking and analysis

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication providers
3. Configure Firestore database
4. Add configuration files to the project

### Supabase Setup

This project uses Supabase for backend services. Follow these steps to set up local development environment.

#### Prerequisites

Before you begin, ensure you have:
- **Docker Desktop** installed and running ([Download here](https://www.docker.com/products/docker-desktop/))
- **Supabase CLI** installed (instructions below)
- **Deno** installed for Edge Functions support (instructions below)

#### Install Supabase CLI

**macOS / Linux:**
```bash
brew install supabase/tap/supabase
```

**Other platforms:**  
See [Supabase CLI documentation](https://supabase.com/docs/guides/local-development/cli/getting-started)

#### Install Deno (for Edge Functions)

Supabase Edge Functions require Deno as the runtime environment.

**macOS / Linux:**
```bash
brew install deno
```

**Other platforms:**  
See [Deno installation documentation](https://deno.land/manual/getting_started/installation)

---

### First-Time Setup

Follow these steps only when setting up the project for the first time:

#### 1. Initialize Supabase (if needed)

**Skip this step** if the `supabase` folder already exists in the project.

```bash
supabase init
```

#### 2. Login to Supabase

```bash
supabase login
```

This opens your browser for authentication.

#### 3. Link to Dev Project

⚠️ **Important:** Always link to the **dev (staging) project**, not production.

```bash
supabase link --project-ref YOUR_DEV_PROJECT_ID
```

Find your project ID at: `https://supabase.com/dashboard/project/<project-id>`

#### 4. Pull Database Schema (if needed)

**Skip this step** if `supabase/migrations` folder contains migration files.

```bash
# Using linked project
supabase db pull

# Or using direct connection
supabase db pull --db-url "postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres" --schema public
```

> Use port `5432` (direct) instead of `6543` (pooler) for better compatibility.

#### 5. Start Local Services

```bash
supabase start
```

This starts all Supabase services in Docker containers.

#### 6. Configure Environment Variables

Get your local credentials:
```bash
supabase status
```

Create `.env.development` file with these values:

```env
# Local Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<get_from_supabase_status>
SUPABASE_SERVICE_ROLE_KEY=<get_from_supabase_status>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
```

**Credential Mapping:**

| Supabase Status | Environment Variable |
|----------------|---------------------|
| `API URL` | `EXPO_PUBLIC_SUPABASE_URL` |
| `Publishable key` | `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| `Secret key` | `SUPABASE_SERVICE_ROLE_KEY` |
| `Database URL` | `DATABASE_URL` |

#### 7. Access Supabase Studio

Open [http://localhost:54323](http://localhost:54323) to manage your local database.

---

### Daily Development Workflow

#### Starting Work

```bash
# Install Deno if not already installed (required for Edge Functions)
brew install deno

# Start Supabase services
supabase start

# Start Supabase Edge Functions locally (in a separate terminal)
supabase functions serve

# Start your app
npm run start:dev
```

#### After Git Pull

When you pull changes that include new migrations:

```bash
# Apply new migrations (preserves data)
supabase migration up --local

# OR reset database (deletes all data, applies all migrations from scratch)
supabase db reset --local
```

#### Making Database Changes

1. Make changes in Supabase Studio or write SQL migrations
2. Generate migration file:
   ```bash
   supabase db diff -f my_changes
   ```
3. Push to remote database:
   ```bash
   supabase db push
   ```

#### Stopping Work

```bash
# Stop services (preserves data)
supabase stop
```

---

### Common Commands

```bash
# View service status and credentials
supabase status

# View logs
supabase logs

# Start Supabase Edge Functions locally
supabase functions serve

# Create new migration manually
supabase migration new your_migration_name

# Reset database (nuclear option)
supabase db reset

# Dump data only from remote database
supabase db dump --data-only --db-url "postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres" --schema public --file <dump_file.sql>

# Import data dump into local database
# First, install psql if not already installed (macOS)
brew install libpq
brew link --force libpq

# Then run the dump using Database URL from 'supabase status'
psql "postgresql://postgres:postgres@127.0.0.1:54322" -f dump_file.sql

# Mark migration as applied without running it (useful when migration was already applied manually)
supabase migration repair <MIGRATION_TIMESTAMP> --local --status applied

# Mark migration as reverted without running it (useful when migration was already reverted manually)
supabase migration repair <MIGRATION_TIMESTAMP> --local --status reverted
```

> **Note**: Replace `<DATABASE_URL>` with the **Database URL** value from `supabase status` output, and `<dump_file.sql>` with your actual dump file name.

---

### Troubleshooting

**Docker not running:**  
Make sure Docker Desktop is open and running before `supabase start`.

**Port conflicts:**  
If ports are in use, stop other services or configure custom ports in `supabase/config.toml`.

**Migration errors:**  
Use `supabase db reset` to start fresh with all migrations.

### EAS Build Configuration

The app uses EAS Build for production builds with the following profiles:

- **Development**: Development client builds
- **Preview**: Internal testing builds
- **Production**: App store ready builds

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+ (Android 5.0+)

## 🤝 Contributing

We welcome contributions to the Daybreaker Portal! Please see our contributing guidelines for more information.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Daybreaker Health. All rights reserved.

## 🆘 Support

For support and questions:

- **Email**: care@daybreakerhealth.com
- **Phone**: (805) 549-4172
- **Website**: [daybreakerhealth.com](https://daybreakerhealth.com/)

## 🏥 Medical Disclaimer

This application is designed to support your health and fitness journey but is not a substitute for professional medical advice. Always consult with healthcare professionals before making significant changes to your exercise or nutrition routine.

<div align="center">
  <p><strong>Medical Director:</strong> Adrian Rawlinson, MD</p>
  <p>© 2025 Daybreaker Health Clinic. All Rights Reserved.</p>
</div>
