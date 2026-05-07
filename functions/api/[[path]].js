export async function onRequestPost({ request, params }) {
  const origin = request.headers.get('Origin') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    
    // 获取动态路径，例如 ['verify-order'] 或 ['export-session']
    const pathStr = Array.isArray(params.path) ? params.path.join('/') : params.path;
    
    // 将请求转发给真实的 Worker
    const resp = await fetch(`https://ev-calc-worker.evcalc.workers.dev/${pathStr}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, msg: `Pages Proxy Error: ${err.message}` }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

