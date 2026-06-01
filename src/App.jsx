import { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel/InputPanel';
import ResultDashboard from './components/ResultDashboard/ResultDashboard';
import PaymentModal from './components/PaymentModal/PaymentModal';
import { calculate } from './utils/calculator';
import { useUsageTracker } from './hooks/useUsageTracker';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('input'); // 'input' | 'result'
  const [result, setResult] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingParams, setPendingParams] = useState(null);

  const { canCalculateFree, canCalculatePaid, markFreeUsed, recordCalculation, verifyAfdianOrder, isMember, hasCountPack, getMemberExpiry, getCountRemaining, importSession } = useUsageTracker();

  // 检查 URL 中的 sync token 并自动同步
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('sync');
    if (token) {
      importSession(token).then((res) => {
        if (res.ok) {
          alert('跨设备会员/次数状态同步成功！');
        } else {
          alert(`同步失败: ${res.msg}`);
        }
        // 清理 URL，移除 token 参数
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [importSession]);

  const handleCalculate = (params) => {
    if (canCalculateFree()) {
      // 首次免费
      markFreeUsed();
      const res = calculate(params);
      setResult(res);
      setScreen('result');
    } else if (canCalculatePaid()) {
      // 月会员或有副余次数包
      recordCalculation();
      const res = calculate(params);
      setResult(res);
      setScreen('result');
    } else {
      // 需要付费（引导开通会员）
      setPendingParams(params);
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (pendingParams) {
      recordCalculation();
      const res = calculate(pendingParams);
      setResult(res);
      setPendingParams(null);
      setScreen('result');
    }
  };

  const handleRecalculate = () => {
    setScreen('input');
    setResult(null);
  };

  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-mark">EV</span>
            <span className="logo-text">油换电计算器</span>
          </div>
          <div className="header-right">
          {isMember() && (() => {
              const expiry = getMemberExpiry();
              const month = expiry ? `${expiry.getMonth()+1}月${expiry.getDate()}日` : '';
              return (
                <span className="member-badge" title={`会员有效至 ${expiry?.toLocaleDateString('zh-CN')}`}>
                  会员至{month}
                </span>
              );
            })()}
          {!isMember() && hasCountPack() && (
            <span className="member-badge count-badge" title="次数包剩余次数">
              剩{getCountRemaining()}次
            </span>
          )}
            {screen === 'result' && (
              <button
                id="header-recalc-btn"
                type="button"
                className="header-btn"
                onClick={handleRecalculate}
              >
                重算
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="app-main">
        {screen === 'input' && (
          <div className="animate-fade-in-up">
            {/* Hero 标语 */}
            <div className="hero-tagline">
              <div className="hero-kicker">算一笔换车账</div>
              <h1>买电车到底划不划算？</h1>
              <p>输入您的用车信息，精准算出回本年数</p>
              <div className="hero-proof-row" aria-label="计算结果包含">
                <span>回本年数</span>
                <span>年度节省</span>
                <span>十年账本</span>
              </div>
              <div className="free-badge">首次计算免费</div>
            </div>
            <InputPanel onCalculate={handleCalculate} />
          </div>
        )}

        {screen === 'result' && result && (
          <div className="animate-fade-in-up">
            <ResultDashboard
              result={result}
              onRecalculate={handleRecalculate}
            />
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="app-footer">
        <p>数据仅供参考，实际情况因车型、用车习惯而异</p>
      </footer>

      {/* 支付/会员弹窗 */}
      {showPayment && (
        <PaymentModal
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPayment(false);
            setPendingParams(null);
          }}
          verifyOrder={verifyAfdianOrder}
        />
      )}
    </div>
  );
}
