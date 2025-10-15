export default {
  async fetch(request) {
    const targetBase = 'https://script.google.com/macros/s/AKfycbz9UlNMVW0C0Ika_0IDXQ9X0F4by_CptjDnUy5v7fhEJdyDKQ4y3e5EuGGNpEEUPBtJ/exec';
    const url = new URL(request.url);

    // Giữ nguyên query string khi gọi đến Apps Script
    const targetUrl = targetBase + url.search;

    // Xử lý CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Gửi request thật đến Google Apps Script
    const init = {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
    };

    // Chỉ thêm body nếu là POST
    if (request.method === 'POST') {
      init.body = await request.text();
    }

    const response = await fetch(targetUrl, init);
    const text = await response.text();

    // Trả kết quả về cho Flutter (kèm CORS header)
    return new Response(text, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
    });
  },
};
