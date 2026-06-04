import { useState } from 'react';
import InputPanel from './components/InputPanel/InputPanel';
import ResultDashboard from './components/ResultDashboard/ResultDashboard';
import { calculate } from './utils/calculator';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('input'); // 'input' | 'result'
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
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-mark">油电</span>
            <span className="logo-text">油换电计算器</span>
          </div>
          <div className="header-right">
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
              <div className="hero-kicker">车主账本工具</div>
              <h1>买电车到底划不划算？</h1>
              <p>输入您的用车信息，精准算出回本年数</p>
              <div className="hero-proof-row" aria-label="计算结果包含">
                <span>回本时间</span>
                <span>年度节省</span>
                <span>十年账本</span>
              </div>
              <div className="free-badge">免费计算，无需登录</div>
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
    </div>
  );
}
