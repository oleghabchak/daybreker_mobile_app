// deno-lint-ignore-file no-explicit-any
// Type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CreateCompleteMesocycleSchema, type CreateCompleteMesocycleRequest } from "./validation/schemas";

type Json = Record<string, any>;

// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-ignore
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// @ts-ignore
const ALLOW_ORIGIN = Deno.env.get("WEBHOOK_CORS_ORIGIN") || "*";

// CORS headers for cross-origin requests
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}

// Main mesocycle creation function - using SQL transaction
async function createMesocycle(supabase: any, data: CreateCompleteMesocycleRequest) {
  try {
    // Call SQL function that creates mesocycle in a transaction
    const { data: result, error } = await supabase.rpc('create_complete_mesocycle', {
      p_user_id: data.user_id,
      p_name: data.name,
      p_start_date: data.start_date,
      p_num_weeks: data.num_weeks,
      p_goal: data.goal,
      p_status: data.status || "planning",
      p_workout_days: data.workout_days || null,
      p_days_per_week: data.days_per_week || null,
      p_muscle_emphasis: data.muscle_emphasis || null,
      p_length_weeks: data.length_weeks || null,
      p_minutes_per_session: data.minutes_per_session || null,
      p_weight_now: data.weight_now || null,
      p_joint_pain_now: data.joint_pain_now || null,
      p_split_type: data.split_type || null,
      p_exercise_variation: data.exercise_variation || null,
      p_workouts_data: data.workouts_data || null,
      p_exercises_data: data.exercises_data || null,
      p_sets_data: data.sets_data || null,
    });

    if (error) {
      console.error("Error creating mesocycle:", error);
      throw new Error(`Failed to create mesocycle: ${error.message}`);
    }

    // Parse the result
    const mesocycle = result.mesocycle;
    const workouts = result.workouts || null;
    const exercises = result.exercises || null;
    const sets = result.sets || null;

    return {
      mesocycle,
      workouts,
      exercises,
      sets
    };
  } catch (error) {
    console.error("Mesocycle creation error:", error);
    throw error;
  }
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: { ...corsHeaders() } 
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured: missing Supabase environment variables" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  try {
    // Parse request body
    const body = await req.json();

    // Validate request data using Zod schema
    const validationResult = CreateCompleteMesocycleSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Validation failed", 
        details: validationResult.error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    const requestData = validationResult.data;

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "X-Client-Info": "create-mesocycle-function" } },
    });

    // Create the mesocycle
    const result = await createMesocycle(supabase, requestData);

    // Return success response
    const hasWorkouts = result.workouts && result.workouts.length > 0;
    const hasExercises = result.exercises && result.exercises.length > 0;
    const hasSets = result.sets && result.sets.length > 0;
    
    let message = "Mesocycle created successfully";
    if (hasWorkouts && hasExercises && hasSets) {
      message = "Mesocycle with workouts, exercises, and sets created successfully";
    } else if (hasWorkouts && hasExercises) {
      message = "Mesocycle with workouts and exercises created successfully";
    } else if (hasWorkouts) {
      message = "Mesocycle with workouts created successfully";
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      message
    }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });

  } catch (error: any) {
    console.error("Create mesocycle function error:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error?.message || "An unexpected error occurred"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});

