export async function onRequest(context) {
  const { request, env } = context;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  if (request.method === "OPTIONS") {
    return new Response("", { headers: cors });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  }

  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID || !env.EMAILJS_PUBLIC_KEY) {
    return Response.json(
      { error: "EmailJS is not configured. Add EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY." },
      { status: 500, headers: cors }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim();
  const code = String(body.code || "").trim();

  if (!email || !username || !/^\d{6}$/.test(code)) {
    return Response.json({ error: "Invalid verification data" }, { status: 400, headers: cors });
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: env.EMAILJS_SERVICE_ID,
        template_id: env.EMAILJS_TEMPLATE_ID,
        user_id: env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          email,
          to_name: username,
          username,
          code,
          verification_code: code
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: "EmailJS rejected the message", details: text.slice(0, 500) },
        { status: 502, headers: cors }
      );
    }

    return Response.json({ ok: true }, { headers: cors });
  } catch (_) {
    return Response.json({ error: "Unable to contact EmailJS" }, { status: 502, headers: cors });
  }
}
