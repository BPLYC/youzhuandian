/**
 * Cloudflare Worker — 油换电计算器 支付验证服务
 *
 * 环境变量（在 Cloudflare Dashboard 或 wrangler secret put 中设置）：
 *   AFDIAN_TOKEN     : 爱发电 API Token（加密存储，不写代码里）
 *   AFDIAN_USER_ID   : 爱发电 User ID（wrangler.toml 中已配置）
 *   FRONTEND_ORIGIN  : 前端域名（CORS 白名单）
 *   ORDERS_KV        : KV 命名空间绑定（存储已验证订单）
 */

// ============================================================
// 工具：纯 JS MD5 实现（Cloudflare Workers 不支持 SubtleCrypto MD5）
// ============================================================
function md5(input) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  const str = unescape(encodeURIComponent(input));
  const x = [];
  for (let i = 0; i < str.length; i++) {
    x[i >> 2] |= str.charCodeAt(i) << (i % 4 * 8);
  }
  x[str.length >> 2] |= 0x80 << (str.length % 4 * 8);
  x[(((str.length + 8) >> 6) << 4) + 14] = str.length * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936); d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819); b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897); d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063); b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510); d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713); b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691); d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335); b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438); d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961); b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558); d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060); d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632); b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174); d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979); b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487); d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520); b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844); d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523); b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070); d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259); b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
  }
  return [a, b, c, d].map(n =>
    ('00000000' + (n < 0 ? n + 0x100000000 : n).toString(16)).slice(-8)
      .match(/.{2}/g).reverse().join('')
  ).join('');
}

// ============================================================
// CORS 头
// ============================================================
function corsHeaders(origin) {
  const allowed = ['http://localhost:5173', 'https://youzhuandian.pages.dev'];
  const o = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ============================================================
// 爱发电 API：查询订单
// ============================================================
async function queryAfdianOrder(outTradeNo, env) {
  const token = env.AFDIAN_TOKEN;
  const userId = env.AFDIAN_USER_ID;
  const ts = Math.floor(Date.now() / 1000);
  const params = JSON.stringify({ out_trade_no: outTradeNo });

  // 签名规则：md5(token + "params" + params + "ts" + ts + "user_id" + userId)
  const signStr = `${token}params${params}ts${ts}user_id${userId}`;
  const sign = md5(signStr);

  const body = { user_id: userId, params, ts, sign };

  const resp = await fetch('https://afdian.com/api/open/query-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error(`爱发电 API HTTP 错误: ${resp.status}`);
  return await resp.json();
}

// ============================================================
// 主处理器
// ============================================================
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── POST /verify-order ──────────────────────────────────
    // 前端发来用户输入的爱发电订单号，Worker 向爱发电验证
    if (url.pathname === '/verify-order' && request.method === 'POST') {
      try {
        const { order_id } = await request.json();
        if (!order_id || typeof order_id !== 'string') {
          return jsonResponse({ ok: false, msg: '请输入有效的订单号' }, 400, origin);
        }

        const orderId = order_id.trim();

        // 检查是否已验证过（防重复使用同一订单号漏洞）
        const existing = await env.ORDERS_KV.get(`order:${orderId}`);
        if (existing) {
          return jsonResponse({
            ok: false,
            msg: '该订单已被激活使用，为保护您的权益，单个订单号仅限一次激活。若需在其他浏览器使用，请在原设备使用【设备同步】功能。',
          }, 400, origin);
        }

        // 调用爱发电 API 验证
        const afdianResp = await queryAfdianOrder(orderId, env);

        if (afdianResp.ec !== 200) {
          return jsonResponse({
            ok: false,
            msg: `爱发电返回错误: ${afdianResp.em || '未知错误'}`,
          }, 400, origin);
        }

        const orderList = afdianResp.data?.list;
        if (!orderList || orderList.length === 0) {
          return jsonResponse({ ok: false, msg: '未找到该订单，请检查订单号是否正确' }, 400, origin);
        }

        const order = orderList[0];

        // 验证订单金额（最低 ¥2.99）
        const amount = parseFloat(order.total_amount || '0');
        if (amount < 2.99) {
          return jsonResponse({ ok: false, msg: `订单金额不足（¥${amount}），最低需要 ¥2.99` }, 400, origin);
        }

        // 验证订单状态（2 = 交易成功）
        if (order.status !== 2) {
          return jsonResponse({ ok: false, msg: '订单未完成支付，请确认支付状态' }, 400, origin);
        }

        // ── 根据金额判断方案类型 ──
        // ¥5 及以上 → 月会员（30天有效期，无限次计算）
        // ¥2.99 ~ ¥4.99 → 次数包（3次计算，不过期）
        let planType, expiresAt, calcCount;
        if (amount >= 5) {
          planType = 'monthly';          // 月会员
          expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
          calcCount = null;              // 无限次
        } else {
          planType = 'count';            // 次数包
          expiresAt = null;              // 永不过期（用完为止）
          calcCount = 3;                 // ¥2.99 = 3次
        }

        // 写入 KV（标记已使用，防止一个订单号重复激活）
        await env.ORDERS_KV.put(
          `order:${orderId}`,
          JSON.stringify({ orderId, amount, planType, calcCount, activatedAt: Date.now(), expires_at: expiresAt }),
          { expirationTtl: planType === 'monthly' ? 31 * 24 * 60 * 60 : 365 * 24 * 60 * 60 }
        );

        return jsonResponse({
          ok: true,
          plan_type: planType,
          expires_at: expiresAt,
          calc_count: calcCount,
          amount,
        }, 200, origin);

      } catch (err) {
        console.error('verify-order error:', err);
        return jsonResponse({ ok: false, msg: `服务异常: ${err.message || err}` }, 500, origin);
      }
    }

    // ── POST /export-session ──────────────────────────────────
    // 将客户端状态暂存至 KV，返回一个临时 Token
    if (url.pathname === '/export-session' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = 'sync_' + crypto.randomUUID().replace(/-/g, '');
        
        // 保存临时会话状态，5分钟过期
        await env.ORDERS_KV.put(
          token,
          JSON.stringify({ ...body, createdAt: Date.now() }),
          { expirationTtl: 300 } // 300 seconds = 5 minutes
        );

        return jsonResponse({ ok: true, token }, 200, origin);
      } catch (err) {
        console.error('export-session error:', err);
        return jsonResponse({ ok: false, msg: '导出状态失败' }, 500, origin);
      }
    }

    // ── POST /import-session ──────────────────────────────────
    // 根据 Token 获取暂存的状态，并销毁该 Token（阅后即焚）
    if (url.pathname === '/import-session' && request.method === 'POST') {
      try {
        const { token } = await request.json();
        if (!token || typeof token !== 'string') {
          return jsonResponse({ ok: false, msg: '无效的同步 Token' }, 400, origin);
        }

        const dataStr = await env.ORDERS_KV.get(token);
        if (!dataStr) {
          return jsonResponse({ ok: false, msg: '同步链接已过期或失效，请重新生成' }, 400, origin);
        }

        // 读取后立即删除，防止多次同步
        await env.ORDERS_KV.delete(token);

        const data = JSON.parse(dataStr);
        return jsonResponse({ ok: true, data }, 200, origin);
      } catch (err) {
        console.error('import-session error:', err);
        return jsonResponse({ ok: false, msg: '同步失败' }, 500, origin);
      }
    }

    // ── GET /health ──────────────────────────────────────────
    if (url.pathname === '/health') {
      return jsonResponse({ ok: true, service: 'ev-calc-worker', ts: Date.now() }, 200, origin);
    }

    return jsonResponse({ ok: false, msg: 'Not Found' }, 404, origin);
  },
};
