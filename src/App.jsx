import { useState } from 'react';
import InputPanel from './components/InputPanel/InputPanel';
import ResultDashboard from './components/ResultDashboard/ResultDashboard';
import { calculate } from './utils/calculator';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('input');
  const [result, setResult] = useState(null);

  const handleCalculate = (params) => {
    const res = calculate(params);
    setResult(res);
    setScreen('result');
  };

  const handleRecalculate = () => {
    setScreen('input');
    setResult(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-mark">EV</span>
            <span className="logo-text">电车省钱计算器</span>
          </div>
          <div className="header-right">
            {screen === 'result' && (
              <button
                id="header-recalc-btn"
                type="button"
                className="header-btn"
                onClick={handleRecalculate}
              >
                重新计算
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {screen === 'input' && (
          <div className="animate-fade-in-up">
            <div className="hero-tagline">
              <div className="hero-kicker">算清长期用车账</div>
              <h1>换电车到底划不划算？</h1>
              <p>把油费、电费、补贴、购车和养车差异放在一起，快速估算回本时间和长期节省。</p>
              <div className="hero-proof-row" aria-label="计算结果">
                <span>回本时间</span>
                <span>年度节省</span>
                <span>10年走势</span>
              </div>
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

      <footer className="app-footer">
        <p>结果仅供规划参考。实际成本会因车型、电价方案、驾驶习惯和补贴资格而变化。</p>
      </footer>
    </div>
  );
}
