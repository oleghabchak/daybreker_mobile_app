// deno-lint-ignore-file no-explicit-any
// Type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, any>;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const TERRA_SECRET = Deno.env.get("TERRA_SECRET");
const SIGNATURE_HEADER = (Deno.env.get("TERRA_SIGNATURE_HEADER") || "x-terra-signature").toLowerCase();
const ALLOW_ORIGIN = Deno.env.get("WEBHOOK_CORS_ORIGIN") || "*";

// Naive per-instance, per-IP rate limiter
const RATE_LIMIT_REQUESTS_PER_MINUTE = Number(Deno.env.get("WEBHOOK_RATE_LIMIT_PER_MINUTE") || 120);
const ipWindowCounters = new Map<string, { count: number; windowStartMs: number }>();

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Terra-Signature",
  } as Record<string, string>;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  return "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindowCounters.get(ip);
  if (!entry) {
    ipWindowCounters.set(ip, { count: 1, windowStartMs: now });
    return true;
  }
  const windowMs = 60_000;
  if (now - entry.windowStartMs > windowMs) {
    ipWindowCounters.set(ip, { count: 1, windowStartMs: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_REQUESTS_PER_MINUTE) return false;
  entry.count += 1;
  return true;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
  if (!TERRA_SECRET) return false;
  const headerVal = req.headers.get(SIGNATURE_HEADER) || req.headers.get(SIGNATURE_HEADER.toUpperCase());
  if (!headerVal) return false;
  // Terra commonly uses an HMAC SHA256 of the raw body with the webhook secret
  const expected = await hmacSha256Hex(TERRA_SECRET, rawBody);
  return timingSafeEqual(expected, headerVal.trim());
}

function isDataPayloadType(type: string): boolean {
  const dataTypes = new Set(["activity", "sleep", "daily", "nutrition", "body", "menstruation"]);
  return dataTypes.has(type);
}

function getProviderFromPayload(payload: Json): string | null {
  const p = payload?.user?.provider || payload?.provider;
  return typeof p === "string" ? p.toLowerCase() : null;
}

async function ensureBucketExists(supabase: any, bucket: string) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucket);
    if (data) return;
  } catch (_) {
    // continue to attempt creation
  }
  try {
    const { error } = await supabase.storage.createBucket(bucket, { public: false, allowedMimeTypes: ["application/json"], fileSizeLimit: "50mb" });
    if (error && !String(error.message || "").toLowerCase().includes("already exists")) {
      console.warn("createBucket error", error);
    }
  } catch (err) {
    console.warn("createBucket exception", err);
  }
}

function storagePath(payload: Json, type: string): string {
  const terraUserId = payload?.user?.user_id || payload?.user_id || "unknown";
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const y = ts.slice(0, 4);
  const m = ts.slice(5, 7);
  const d = ts.slice(8, 10);
  return `${y}/${m}/${d}/${type}/${terraUserId}/${ts}.json`;
}

async function handlePayload(supabase: any, payload: Json, rawBody: string) {
  const type = String(payload?.type || payload?.event_type || "unknown").toLowerCase();
  const bucket = "terra-payloads";
  await ensureBucketExists(supabase, bucket);

  const path = storagePath(payload, type);
  const uploadRes = await supabase.storage
    .from(bucket)
    .upload(path, new Blob([rawBody], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (uploadRes.error) {
    console.error("storage.upload error", uploadRes.error);
  }

  const table = isDataPayloadType(type) ? "terra_data_payloads" : "terra_misc_payloads";
  const terraUserId = payload?.user?.user_id || payload?.user_id || null;
  const provider = getProviderFromPayload(payload);
  const referenceId = payload?.user?.reference_id || payload?.reference_id || null;

  // Best-effort DB insert; swallow errors to not block 200 to Terra
  try {
    const { error } = await supabase
      .from(table)
      .insert({
        terra_user_id: terraUserId,
        payload_type: type,
        provider,
        reference_id: referenceId,
        storage_path: path,
        raw_payload: payload,
        received_at: new Date().toISOString(),
      });
    if (error) console.warn(`insert into ${table} error`, error);
  } catch (err) {
    console.warn("insert payload exception", err);
  }

  // Link Terra user to our user via device_connections if we can
  if (terraUserId) {
    try {
      if (referenceId) {
        await supabase
          .from("device_connections")
          .update({
            terra_user_id: terraUserId,
            is_active: true,
            sync_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", referenceId)
          .maybeSingle();
      }
      if (provider) {
        await supabase
          .from("device_connections")
          .update({
            terra_user_id: terraUserId,
            is_active: true,
            sync_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("provider", provider)
          .is("terra_user_id", null);
      }
    } catch (err) {
      console.warn("device_connections link exception", err);
    }
  }

  return { type, terraUserId, provider, path };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsHeaders() } });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured: missing Supabase env" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
  if (!TERRA_SECRET) {
    return new Response(JSON.stringify({ error: "Server misconfigured: missing TERRA_SECRET" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders() },
    });
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error("Failed reading body", err);
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  try {
    const ok = await verifySignature(req, rawBody);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  } catch (err) {
    console.error("Signature verification error", err);
    return new Response(JSON.stringify({ error: "Signature verification failed" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  let payload: Json;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch (err) {
    console.error("JSON parse error", err);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "X-Client-Info": "terra-webhook-handler" } },
  });

  try {
    const result = await handlePayload(supabase, payload, rawBody);
    return new Response(JSON.stringify({ status: "ok", ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (err) {
    console.error("Webhook handler error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});


