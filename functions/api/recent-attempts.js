export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(10, Number(url.searchParams.get("limit") || 3)));

    if (!env.DB) {
      throw new Error("Database connection not found");
    }

    const sql = `
      SELECT
        a.id AS id,
        u.display_name AS displayName,
        a.mode_key AS modeKey,
        a.score10 AS score10,
        a.created_at AS createdAt
      FROM attempts a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT ?1;
    `;

    const { results } = await env.DB.prepare(sql).bind(limit).all();

    return new Response(JSON.stringify({
      recent: results || [],
      updatedAt: new Date().toISOString()
    }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    console.error("API Error:", err.message);
    return new Response(JSON.stringify({
      recent: [],
      error: err.message,
      debug: "Hãy kiểm tra cấu hình D1 Database trong Dashboard Cloudflare"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }
}
