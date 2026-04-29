// PayFast checkout form generator.
// Builds signed form fields and creates a pending ticket record before redirecting.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const PAYFAST_HOST = "https://www.payfast.co.za";
const PAYFAST_PROCESS_URL = `${PAYFAST_HOST}/eng/process`;

interface PaymentPayload {
  eventId: string;
  eventTitle: string;
  tierName: string;
  quantity: number;
  amount: number; // ZAR rands (number, may include cents)
  buyer: { name: string; email: string; whatsapp?: string };
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

function encodeForSignature(value: string): string {
  // Match PHP urlencode() exactly: spaces => '+', uppercase hex,
  // and encode characters encodeURIComponent leaves alone (! ' ( ) *).
  return encodeURIComponent(value)
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase())
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

async function md5Hex(input: string): Promise<string> {
  // Deno doesn't ship MD5 in SubtleCrypto. Use std hash.
  const { crypto } = await import("https://deno.land/std@0.224.0/crypto/mod.ts");
  const hashBuf = await crypto.subtle.digest("MD5", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateSignature(data: Record<string, string>, passphrase?: string): Promise<string> {
  // Order MUST match the order fields are POSTed in. We build it in insertion order.
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${k}=${encodeForSignature(String(v).trim())}`);
  }
  let str = parts.join("&");
  if (passphrase && passphrase.length > 0) {
    str += `&passphrase=${encodeForSignature(passphrase.trim())}`;
  }
  return await md5Hex(str);
}

function appendQuery(url: string, values: Record<string, string>): string {
  const next = new URL(url);
  for (const [key, value] of Object.entries(values)) next.searchParams.set(key, value);
  return next.toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID");
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY");
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!merchantId || !merchantKey || !supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "PayFast credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as PaymentPayload;
    if (!payload?.eventId || !payload?.amount || !payload?.buyer?.email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: authData } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } };

    const m_payment_id = `pf-${crypto.randomUUID()}`;
    const amountStr = payload.amount.toFixed(2);
    const returnUrl = appendQuery(payload.returnUrl, { payment_id: m_payment_id });
    const cancelUrl = appendQuery(payload.cancelUrl, { payment_id: m_payment_id });

    const { error: ticketError } = await supabaseAdmin.from("tickets").upsert({
      user_id: authData.user?.id ?? null,
      buyer_email: payload.buyer.email.trim().toLowerCase(),
      buyer_name: payload.buyer.name.trim(),
      buyer_phone: payload.buyer.whatsapp?.trim() || null,
      event_slug: payload.eventId,
      event_title: payload.eventTitle,
      tier_name: payload.tierName,
      quantity: Math.max(1, Math.floor(payload.quantity)),
      total: Math.round(payload.amount),
      payment_id: m_payment_id,
      status: "pending",
    }, { onConflict: "payment_id" });

    if (ticketError) throw ticketError;

    // Order matters for the signature.
    const data: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: payload.notifyUrl,
      name_first: payload.buyer.name.split(" ")[0] ?? payload.buyer.name,
      name_last: payload.buyer.name.split(" ").slice(1).join(" ") || "Customer",
      email_address: payload.buyer.email,
      cell_number: payload.buyer.whatsapp ?? "",
      m_payment_id,
      amount: amountStr,
      item_name: `${payload.eventTitle} - ${payload.quantity} x ${payload.tierName}`.replace(/[^\x20-\x7E]/g, "").slice(0, 100),
      item_description: `Tickets for ${payload.eventTitle}`.replace(/[^\x20-\x7E]/g, "").slice(0, 255),
      custom_int1: String(payload.quantity),
      custom_str1: payload.eventId,
      custom_str2: payload.tierName,
      custom_str3: payload.eventTitle,
      custom_str4: payload.buyer.name,
      custom_str5: payload.buyer.whatsapp ?? "",
    };

    // Drop empty optional fields so signature & submitted params match exactly.
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null && String(v).trim() !== "") cleaned[k] = String(v).trim();
    }

    const signature = await generateSignature(cleaned, passphrase.trim());

    // Return form fields so the client POSTs to PayFast (avoids URL re-encoding mismatches).
    const formFields = { ...cleaned, signature };

    return new Response(
      JSON.stringify({
        actionUrl: PAYFAST_PROCESS_URL,
        fields: formFields,
        paymentId: m_payment_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("[create-payfast-payment]", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
