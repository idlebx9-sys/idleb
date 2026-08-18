export async function onRequest(context) {
  const { request, env } = context;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };
  if (request.method === "OPTIONS") return new Response("", {headers:cors});
  if (!env.DB) return Response.json({error:"D1 binding DB is missing"}, {status:500,headers:cors});

  if (request.method === "GET") {
    const rows = await env.DB.prepare("SELECT payload FROM orders WHERE id = 'all'").first();
    let orders = [];
    if (rows?.payload) { try { orders = JSON.parse(rows.payload); } catch (_) {} }
    return Response.json({orders}, {headers:cors});
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch (_) {
      return Response.json({error:"Invalid JSON"}, {status:400,headers:cors});
    }
    if (!Array.isArray(body.orders)) return Response.json({error:"orders must be an array"}, {status:400,headers:cors});

    const oldRow = await env.DB.prepare("SELECT payload FROM orders WHERE id = 'all'").first();
    let oldOrders = [];
    if (oldRow?.payload) { try { oldOrders = JSON.parse(oldRow.payload); } catch (_) {} }

    const oldIds = new Set(oldOrders.map(o => o && o.id));
    const newOrders = body.orders.filter(o => o && o.id && !oldIds.has(o.id));

    await env.DB.prepare(
      "INSERT INTO orders (id,payload,updated_at) VALUES ('all',?1,datetime('now')) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at"
    ).bind(JSON.stringify(body.orders)).run();

    // Telegram notification is server-side; token is never exposed to visitors.
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      for (const order of newOrders.slice(0, 10)) {
        const lines = [
          "🛒 طلب جديد #" + order.id,
          "👤 " + (order.username || "—"),
          "📞 " + (order.whatsapp || "—"),
          "💰 " + (order.total ?? 0),
          "📦 " + ((order.items || []).map(i => (i.name || "خدمة") + " × " + (i.qty || 1)).join("، ") || "—"),
          "📌 الحالة: قيد المراجعة"
        ];
        try {
          await fetch("https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
            method:"POST",
            headers:{"content-type":"application/json"},
            body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:lines.join("\n")})
          });
        } catch (_) {}
      }
    }
    return Response.json({ok:true,orders:body.orders}, {headers:cors});
  }

  return new Response("Method not allowed", {status:405,headers:cors});
}
