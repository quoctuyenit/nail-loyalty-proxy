const TARGET_BASE = "https://script.google.com/macros/s/AKfycbz9UlNMVW0C0Ika_0IDXQ9X0F4by_CptjDnUy5v7fhEJdyDKQ4y3e5EuGGNpEEUPBtJ/exec";

function makeCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const targetUrl = TARGET_BASE + url.search;

      // Preflight request (CORS)
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: makeCorsHeaders() });
      }

      // Copy headers except host
      const forwardHeaders = new Headers();
      for (const [k, v] of request.headers) {
        if (k.toLowerCase() === "host") continue;
        forwardHeaders.set(k, v);
      }

      // 🔧 Fix: Đọc body một lần thành buffer hoặc text
      let bodyData;
      if (request.method !== "GET" && request.method !== "HEAD") {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          bodyData = JSON.stringify(await request.json());
        } else {
          bodyData = await request.text(); // fallback
        }
      }

      const init = {
        method: request.method,
        headers: forwardHeaders,
        body: bodyData,
        redirect: "follow",
      };

      console.log("Forwarding to:", targetUrl, "Method:", request.method);

      const upstreamResp = await fetch(targetUrl, init);
      const respBody = await upstreamResp.arrayBuffer();
      const respHeaders = new Headers(upstreamResp.headers);

      const returnedHeaders = new Headers(makeCorsHeaders());
      if (respHeaders.has("content-type")) {
        returnedHeaders.set("Content-Type", respHeaders.get("content-type"));
      } else {
        returnedHeaders.set("Content-Type", "application/json; charset=utf-8");
      }

      return new Response(respBody, {
        status: upstreamResp.status,
        headers: returnedHeaders,
      });

    } catch (err) {
      console.error("Proxy error:", err);
      const body = JSON.stringify({
        ok: false,
        message: "Proxy error",
        error: String(err),
      });
      return new Response(body, {
        status: 500,
        headers: { ...makeCorsHeaders(), "Content-Type": "application/json" },
      });
    }
  },
};
