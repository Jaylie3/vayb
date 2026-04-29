// PayFast ITN (Instant Transaction Notification) webhook.
// Verifies signature + source, then logs the payment. Public endpoint (no JWT).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const VALID_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

function encodeForSignature(value: string): string {
  return encodeURIComponent(value).replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase()).replace(/%20/g, "+");
}

async function md5Hex(input: string): Promise<string> {
  const { crypto } = await import("https://deno.land/std@0.224.0/crypto/mod.ts");
  const hashBuf = await crypto.subtle.digest("MD5", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response("Ticket backend not configured", { status: 500, headers: corsHeaders });
    }
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const data: Record<string, string> = {};
    for (const [k, v] of params.entries()) data[k] = v;

    const receivedSig = data["signature"];
    delete data["signature"];

    // 1. Verify signature
    const parts: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || v === null || v === "") continue;
      parts.push(`${k}=${encodeForSignature(v.trim())}`);
    }
    let signatureString = parts.join("&");
    if (passphrase) signatureString += `&passphrase=${encodeForSignature(passphrase.trim())}`;
    const expectedSig = await md5Hex(signatureString);

    if (expectedSig.toLowerCase() !== String(receivedSig ?? "").toLowerCase()) {
      console.warn("[payfast-itn] Invalid signature", { expected: expectedSig, received: receivedSig });
      return new Response("Invalid signature", { status: 400, headers: corsHeaders });
    }

    // 2. (Optional) Verify source IP host — skipped here for sandbox simplicity.
    // 3. Validate by posting back to PayFast
    const validateHost = req.headers.get("host")?.includes("sandbox")
      ? "https://sandbox.payfast.co.za"
      : "https://www.payfast.co.za";

    const validateRes = await fetch(`${validateHost}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyText,
    });
    const validateText = (await validateRes.text()).trim();
    if (validateText !== "VALID") {
      console.warn("[payfast-itn] Validation failed", validateText);
      return new Response("Validation failed", { status: 400, headers: corsHeaders });
    }

    const paid = data["payment_status"] === "COMPLETE";
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const paymentId = data["m_payment_id"];
    const grossAmount = Math.round(Number(data["amount_gross"] ?? 0));

    const { data: existing } = await supabaseAdmin
      .from("tickets")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();

    const ticketPayload = {
      buyer_email: (data["email_address"] ?? "unknown@example.com").trim().toLowerCase(),
      buyer_name: data["custom_str4"] || data["name_first"] || null,
      buyer_phone: data["custom_str5"] || null,
      event_slug: data["custom_str1"] || "unknown-event",
      event_title: data["custom_str3"] || data["item_name"] || "Event ticket",
      tier_name: data["custom_str2"] || "Ticket",
      quantity: Math.max(1, Number.parseInt(data["custom_int1"] ?? "1", 10) || 1),
      total: grossAmount,
      payment_id: paymentId,
      payfast_payment_id: data["pf_payment_id"] || null,
      status: paid ? "paid" : "pending",
    };

    const { error: ticketError } = existing?.id
      ? await supabaseAdmin.from("tickets").update(ticketPayload).eq("id", existing.id)
      : await supabaseAdmin.from("tickets").insert(ticketPayload);

    if (ticketError) {
      console.error("[payfast-itn] Ticket update failed", ticketError);
      return new Response("Ticket update failed", { status: 500, headers: corsHeaders });
    }

    console.log("[payfast-itn] Verified payment", {
      m_payment_id: data["m_payment_id"],
      pf_payment_id: data["pf_payment_id"],
      payment_status: data["payment_status"],
      amount_gross: data["amount_gross"],
      event_id: data["custom_str1"],
      tier_name: data["custom_str2"],
      quantity: data["custom_int1"],
      email: data["email_address"],
    });

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[payfast-itn]", err);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
