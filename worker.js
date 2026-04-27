const BACKEND = "https://keygen-signup.gt.tc"; // URL InfinityFree kamu

// Endpoint yang diizinkan
const ALLOWED_PATHS = ["/login-api.php", "/get-user-api.php"];

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Validasi path
    if (!ALLOWED_PATHS.includes(path)) {
      return jsonResponse({ success: false, message: "Endpoint not found." }, 404);
    }

    // Hanya terima POST
    if (request.method !== "POST") {
      return jsonResponse({ success: false, message: "Method not allowed." }, 405);
    }

    // Baca body dari request desktop app
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, message: "Invalid JSON body." }, 400);
    }

    // Forward ke PHP backend (server-to-server, tidak kena bot protection)
    try {
      const backendResp = await fetch(`${BACKEND}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          // Header ini membuat InfinityFree mengira request dari browser biasa
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
          "Referer": `${BACKEND}/`,
          "Origin": BACKEND,
        },
        body: JSON.stringify(body),
      });

      const contentType = backendResp.headers.get("Content-Type") || "";

      // Jika InfinityFree masih return HTML (challenge page), tangani
      if (contentType.includes("text/html")) {
        return jsonResponse(
          { success: false, message: "Something went wrong. Please try again." },
          502
        );
      }

      const data = await backendResp.json();
      return jsonResponse(data, backendResp.status);

    } catch (err) {
      return jsonResponse(
        { success: false, message: `Worker error: ${err.message}` },
        500
      );
    }
  },
};

// ─── Helpers ────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}