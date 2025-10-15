export default {
  async fetch(request, env, ctx) {
    const targetUrl = 'https://script.google.com/macros/s/AKfycbz9UlNMVW0C0Ika_0IDXQ9X0F4by_CptjDnUy5v7fhEJdyDKQ4y3e5EuGGNpEEUPBtJ/exec';

    // Nếu request là OPTIONS (CORS preflight), trả về ngay để trình duyệt cho phép
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Gửi request gốc đến Google Apps Script
    const init = {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body: request.method !== "GET" ? await request.text() : undefined,
    };

    const response = await fetch(targetUrl, init);
    const text = await response.text();

    // Trả kết quả kèm header CORS
    return new Response(text, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    });
  },
};
