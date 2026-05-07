import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ev_calc_usage';
const MEMBER_KEY  = 'ev_calc_member';   // 月会员（时间有效期）
const COUNT_KEY   = 'ev_calc_count';    // 次数包（剩余次数）

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

/**
 * 管理计算次数 & 会员状态
 *
 * 规则：
 *  - 首次计算：免费（完整结果含图表）
 *  - 月会员（¥5）：30 天内无限次计算
 *  - 次数包（¥2.99）：3 次计算，永不过期直到用完
 *  - 两者共存时，优先消耗次数包
 */
export function useUsageTracker() {

  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  // ── 免费次数 ────────────────────────────────────────────────
  const getUsageData = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { count: 0, freeUsed: false };
    } catch {
      return { count: 0, freeUsed: false };
    }
  }, []);

  const canCalculateFree = useCallback(() => {
    return !getUsageData().freeUsed;
  }, [getUsageData]);

  const markFreeUsed = useCallback(() => {
    const data = getUsageData();
    data.freeUsed = true;
    data.count = (data.count || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    refresh();
  }, [getUsageData]);

  // ── 月会员状态（时间有效期） ────────────────────────────────
  const getMemberData = useCallback(() => {
    try {
      const raw = localStorage.getItem(MEMBER_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() > data.expires_at) {
        localStorage.removeItem(MEMBER_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, []);

  const isMember = useCallback(() => {
    return getMemberData() !== null;
  }, [getMemberData]);

  const getMemberExpiry = useCallback(() => {
    const data = getMemberData();
    if (!data) return null;
    return new Date(data.expires_at);
  }, [getMemberData]);

  // ── 次数包状态（剩余次数） ───────────────────────────────────
  const getCountData = useCallback(() => {
    try {
      const raw = localStorage.getItem(COUNT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.remaining <= 0) {
        localStorage.removeItem(COUNT_KEY);
        return null;
      }
      return data; // { remaining, total, activatedAt }
    } catch {
      return null;
    }
  }, []);

  const hasCountPack = useCallback(() => {
    return getCountData() !== null;
  }, [getCountData]);

  const getCountRemaining = useCallback(() => {
    return getCountData()?.remaining ?? 0;
  }, [getCountData]);

  /** 消耗一次次数包（计算后调用） */
  const consumeCount = useCallback(() => {
    const data = getCountData();
    if (!data) return;
    data.remaining = Math.max(0, data.remaining - 1);
    if (data.remaining <= 0) {
      localStorage.removeItem(COUNT_KEY);
    } else {
      localStorage.setItem(COUNT_KEY, JSON.stringify(data));
    }
    refresh();
  }, [getCountData]);

  // ── 验证爱发电订单号 ─────────────────────────────────────────
  /**
   * @returns {{ ok, msg?, plan_type?, expires_at?, calc_count? }}
   */
  const verifyAfdianOrder = useCallback(async (orderId) => {
    try {
      const resp = await fetch(`${WORKER_URL}/verify-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await resp.json();

      if (data.ok) {
        if (data.plan_type === 'monthly') {
          // 月会员：写入时间有效期
          localStorage.setItem(MEMBER_KEY, JSON.stringify({
            orderId,
            activatedAt: Date.now(),
            expires_at: data.expires_at,
          }));
        } else if (data.plan_type === 'count') {
          // 次数包：写入剩余次数（累加已有次数）
          const existing = getCountData();
          const newRemaining = (existing?.remaining ?? 0) + (data.calc_count ?? 3);
          localStorage.setItem(COUNT_KEY, JSON.stringify({
            orderId,
            activatedAt: Date.now(),
            remaining: newRemaining,
            total: newRemaining,
          }));
        } else {
          // 兼容旧版本 Worker（没有 plan_type 时默认月会员）
          localStorage.setItem(MEMBER_KEY, JSON.stringify({
            orderId,
            activatedAt: Date.now(),
            expires_at: data.expires_at,
          }));
        }
        refresh();
        return {
          ok: true,
          plan_type: data.plan_type || 'monthly',
          expires_at: data.expires_at,
          calc_count: data.calc_count,
        };
      }
      return { ok: false, msg: data.msg || '验证失败' };
    } catch (err) {
      console.error('verifyAfdianOrder error:', err);
      return { ok: false, msg: '网络错误，请检查连接后重试' };
    }
  }, [getCountData]);

  // ── 综合判断 ─────────────────────────────────────────────────
  /** 是否可以免费计算（首次） */
  // canCalculateFree 已定义

  /** 是否可以计算（有月会员或次数包） */
  const canCalculatePaid = useCallback(() => {
    return isMember() || hasCountPack();
  }, [isMember, hasCountPack]);

  /** 是否需要付费引导 */
  const needsPayment = useCallback(() => {
    return !canCalculateFree() && !canCalculatePaid();
  }, [canCalculateFree, canCalculatePaid]);

  /**
   * 记录一次计算
   *  - 首次：markFreeUsed 已处理，这里只记录总次数
   *  - 次数包：消耗一次
   *  - 月会员：不消耗，只记录
   */
  const recordCalculation = useCallback(() => {
    // 优先消耗次数包（如果有）
    if (hasCountPack() && !isMember()) {
      consumeCount();
    }
    // 记录总次数
    const data = getUsageData();
    data.count = (data.count || 0) + 1;
    if (!data.freeUsed) data.freeUsed = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    refresh();
  }, [hasCountPack, isMember, consumeCount, getUsageData]);

  // ── 跨浏览器同步会话 ─────────────────────────────────────────
  const exportSession = useCallback(async () => {
    try {
      const payload = {};
      const member = localStorage.getItem(MEMBER_KEY);
      const count = localStorage.getItem(COUNT_KEY);
      if (member) payload.member = JSON.parse(member);
      if (count) payload.count = JSON.parse(count);

      if (!payload.member && !payload.count) {
        return { ok: false, msg: '没有可以同步的会员状态' };
      }

      const resp = await fetch(`${WORKER_URL}/export-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.ok && data.token) {
        return { ok: true, token: data.token };
      }
      return { ok: false, msg: data.msg || '导出失败' };
    } catch (err) {
      console.error('exportSession error:', err);
      return { ok: false, msg: '网络错误，请稍后重试' };
    }
  }, []);

  const importSession = useCallback(async (token) => {
    try {
      const resp = await fetch(`${WORKER_URL}/import-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const resData = await resp.json();
      
      if (resData.ok && resData.data) {
        if (resData.data.member) {
          localStorage.setItem(MEMBER_KEY, JSON.stringify(resData.data.member));
        }
        if (resData.data.count) {
          localStorage.setItem(COUNT_KEY, JSON.stringify(resData.data.count));
        }
        refresh();
        return { ok: true };
      }
      return { ok: false, msg: resData.msg || '同步失败或链接已过期' };
    } catch (err) {
      console.error('importSession error:', err);
      return { ok: false, msg: '网络错误，无法完成同步' };
    }
  }, []);

  return {
    canCalculateFree,
    canCalculatePaid,
    isMember,
    hasCountPack,
    getMemberExpiry,
    getCountRemaining,
    needsPayment,
    markFreeUsed,
    recordCalculation,
    verifyAfdianOrder,
    exportSession,
    importSession,
    currentCount: getUsageData().count,
  };
}
