# Create Mesocycle Edge Function

Supabase Edge Function for creating a mesocycle with all related data in a single transaction.

## 🔒 Transaction Safety

All operations are performed atomically:
- ✅ **Success**: All data (mesocycle, workouts, exercises, sets) is created
- ❌ **Error**: Nothing is created (automatic rollback)

## 📋 Usage

### Endpoint

```
POST /functions/v1/create-mesocycle
```

### Request Body

```json
{
  "user_id": "uuid (required)",
  "name": "string (required)",
  "start_date": "date (required, YYYY-MM-DD)",
  "num_weeks": "number (required, 4-8)",
  "goal": "string (required)",
  "status": "string (optional)",
  "workout_days": "array of strings (optional)",
  "days_per_week": "number (optional, 1-7)",
  "muscle_emphasis": "array of strings (optional)",
  "length_weeks": "number (optional)",
  "minutes_per_session": "number (optional)",
  "weight_now": "number (optional)",
  "joint_pain_now": "array of strings (optional)",
  "split_type": "string (optional)",
  "exercise_variation": "number (optional)",
  "workouts_data": "array (optional)",
  "exercises_data": "array (optional)",
  "sets_data": "array (optional)"
}
```

### Response

#### Success (201)
```json
{
  "success": true,
  "data": {
    "mesocycle": { ... },
    "workouts": [ ... ],
    "exercises": [ ... ],
    "sets": [ ... ]
  },
  "message": "Mesocycle with workouts, exercises, and sets created successfully"
}
```

#### Error (400/500)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "user_id",
      "message": "user_id must be a valid UUID"
    }
  ]
}
```

## 🎯 Features

- ✅ **Zod Validation**: Comprehensive validation for all fields
- 🔒 **Transaction**: All operations are atomic
- 📦 **Flexibility**: Can create mesocycle only or with all related data
- 🛡️ **Error Handling**: Detailed error messages
- 🌐 **CORS**: Cross-origin request support

## 📝 Usage Example from TypeScript

```typescript
import { MesocycleCreationService } from './services/mesocycle-creation-service';

// Create mesocycle via transaction
const mesocycle = await MesocycleCreationService.createMesocycleInTransaction({
  mesocycleData: {
    user_id: '...',
    name: 'My Mesocycle',
    start_date: '2024-01-15',
    num_weeks: 6,
    goal: 'hypertrophy'
  },
  workoutGenerator: ...,
  exerciseGenerator: ...,
  setsGenerator: ...
});
```

## 🧪 Testing

```bash
curl -X POST https://your-project.supabase.co/functions/v1/create-mesocycle \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @test-example.json
```

## 📋 Validation

All UUID fields are validated:
- `user_id` - required field
- `exercise_id` - required field in exercises_data
- Other IDs can be optional, but if provided must be valid UUIDs

## 🗄️ SQL Function

Uses PostgreSQL function `create_complete_mesocycle()` which:
- Executes all operations in a single transaction
- Automatically rolls back changes on error
- Returns created data with IDs

