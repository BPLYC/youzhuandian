import { useState, useEffect } from 'react';
import './PaymentModal.css';

// 爱发电创作者主页
const AFDIAN_PAGE = 'https://ifdian.net/a/bp1532';

export default function PaymentModal({ onSuccess, onClose, verifyOrder }) {
  const [step, setStep] = useState('intro'); // 'intro' | 'verify' | 'verifying' | 'success' | 'error'
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activatedPlan, setActivatedPlan] = useState(null); // { type, expiresAt?, calcCount? }

  // 防止滚动穿透
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleGoAfdian = () => {
    window.open(AFDIAN_PAGE, '_blank');
    // 2秒后自动切到输入步骤
    setTimeout(() => setStep('verify'), 2000);
  };

  const handleVerify = async () => {
    const id = orderId.trim();
    if (!id) {
      setErrorMsg('请输入订单号');
      return;
    }
    setStep('verifying');
    setErrorMsg('');

    const result = await verifyOrder(id);
    if (result.ok) {
      setActivatedPlan({
        type: result.plan_type || 'monthly',
        expiresAt: result.expires_at,
        calcCount: result.calc_count,
      });
      setStep('success');
      setTimeout(() => onSuccess(result.expires_at, result.plan_type, result.calc_count), 1500);
    } else {
      setErrorMsg(result.msg || '验证失败，请检查订单号');
      setStep('verify');
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet animate-fade-in-up">
        <div className="modal-handle" />

        {/* 关闭按钮 */}
        <button id="modal-close" className="modal-close-btn" onClick={onClose}>✕</button>

        {/* ── Step: intro ── */}
        {step === 'intro' && (
          <>
            <div className="modal-header">
              <h3>🎯 解锁更多次计算</h3>
              <p>首次免费已使用，选择一个方案继续</p>
            </div>

            {/* 两个方案卡片 */}
            <div className="plan-cards">
              {/* 月会员 */}
              <div className="plan-card plan-card--monthly">
                <div className="plan-card-badge">推荐</div>
                <div className="plan-card-icon">⭐</div>
                <div className="plan-card-name">月度会员</div>
                <div className="plan-card-price">
                  <span className="plan-price-currency">¥</span>
                  <span className="plan-price-amount">5</span>
                  <span className="plan-price-unit"> / 月</span>
                </div>
                <ul className="plan-card-features">
                  <li>✅ 30天内无限次计算</li>
                  <li>✅ 完整图表 + 15年对比</li>
                  <li>✅ 一键截图分享</li>
                </ul>
              </div>

              {/* 次数包 */}
              <div className="plan-card plan-card--count">
                <div className="plan-card-icon">🔢</div>
                <div className="plan-card-name">次数包</div>
                <div className="plan-card-price">
                  <span className="plan-price-currency">¥</span>
                  <span className="plan-price-amount">2.99</span>
                  <span className="plan-price-unit"> / 3次</span>
                </div>
                <ul className="plan-card-features">
                  <li>✅ 3次完整计算</li>
                  <li>✅ 永不过期</li>
                  <li>✅ 适合偶尔使用</li>
                </ul>
              </div>
            </div>

            <div className="afdian-steps">
              <div className="afdian-step">
                <span className="afdian-step-num">1</span>
                <span>点击下方按钮，在爱发电选择方案完成赞助</span>
              </div>
              <div className="afdian-step">
                <span className="afdian-step-num">2</span>
                <span>赞助成功后，复制订单号回来填写</span>
              </div>
              <div className="afdian-step">
                <span className="afdian-step-num">3</span>
                <span>自动验证，立即解锁对应权益</span>
              </div>
            </div>

            <button id="btn-go-afdian" className="btn-afdian" onClick={handleGoAfdian}>
              <span>前往爱发电选择方案 →</span>
            </button>

            <button
              id="btn-already-paid"
              className="btn-already-paid"
              onClick={() => setStep('verify')}
            >
              我已赞助，输入订单号
            </button>

            <p className="payment-disclaimer">
              · 支持微信 / 支付宝 · 赞助记录在爱发电账单中
            </p>
          </>
        )}

        {/* ── Step: verify ── */}
        {step === 'verify' && (
          <>
            <div className="modal-header">
              <h3>📋 输入爱发电订单号</h3>
              <p>在爱发电「我的订单」中查看订单号</p>
            </div>

            <div className="verify-guide">
              <div className="verify-guide-item">
                <span className="verify-guide-icon">📱</span>
                <span>爱发电 App / 网页 → 右上角头像 → 我的订单</span>
              </div>
              <div className="verify-guide-item">
                <span className="verify-guide-icon">🔢</span>
                <span>复制订单号（格式如：afdian_xxxxxxxx）</span>
              </div>
            </div>

            <div className="order-input-group">
              <input
                id="input-order-id"
                type="text"
                className="order-input"
                placeholder="粘贴爱发电订单号..."
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                autoFocus
              />
              {errorMsg && <p className="error-msg">❌ {errorMsg}</p>}
            </div>

            <button id="btn-verify" className="btn-pay" onClick={handleVerify}>
              验证并激活权益
            </button>

            <button
              className="btn-already-paid"
              onClick={() => { setStep('intro'); setErrorMsg(''); }}
            >
              ← 返回
            </button>

            <p className="payment-disclaimer">
              · 每个订单号只能激活一次 · 激活后记录在浏览器本地
            </p>
          </>
        )}

        {/* ── Step: verifying ── */}
        {step === 'verifying' && (
          <div className="payment-polling">
            <div className="polling-spinner" />
            <p>正在向爱发电验证订单...</p>
            <p className="payment-note">请稍候</p>
          </div>
        )}

        {/* ── Step: success ── */}
        {step === 'success' && (
          <div className="payment-success animate-fade-in">
            <div className="success-icon">🎉</div>
            {activatedPlan?.type === 'monthly' ? (
              <>
                <p>月度会员激活成功！</p>
                <p className="payment-note">30天内无限次计算，正在解锁...</p>
              </>
            ) : (
              <>
                <p>次数包激活成功！</p>
                <p className="payment-note">已获得 {activatedPlan?.calcCount ?? 3} 次计算，正在解锁...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
