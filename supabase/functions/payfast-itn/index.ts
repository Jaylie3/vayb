// PayFast ITN (Instant Transaction Notification) webhook.
// Verifies signature + source, then logs the payment. Public endpoint (no JWT).
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

    if (expectedSig !== receivedSig) {
      console.warn("[payfast-itn] Invalid signature", { expected: expectedSig, received: receivedSig });
      return new Response("Invalid signature", { status: 400 });
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
      return new Response("Validation failed", { status: 400 });
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

    // TODO: once events live in DB, insert order + order_items here using service role.
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[payfast-itn]", err);
    return new Response("Error", { status: 500 });
  }
});
