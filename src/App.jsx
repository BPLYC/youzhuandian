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
            <span className="logo-text">EV Savings</span>
          </div>
          <div className="header-right">
            {screen === 'result' && (
              <button
                id="header-recalc-btn"
                type="button"
                className="header-btn"
                onClick={handleRecalculate}
              >
                Recalculate
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {screen === 'input' && (
          <div className="animate-fade-in-up">
            <div className="hero-tagline">
              <div className="hero-kicker">Run the ownership math</div>
              <h1>Is switching to an EV worth it?</h1>
              <p>Compare gas, electricity, incentives, and ownership costs in one clear break-even estimate.</p>
              <div className="hero-proof-row" aria-label="Calculator outputs">
                <span>Break-even time</span>
                <span>Annual savings</span>
                <span>10-year outlook</span>
              </div>
              <div className="free-badge">Free MVP calculator</div>
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
        <p>Estimates are for planning only. Actual costs vary by vehicle, utility plan, driving style, and incentives.</p>
      </footer>
    </div>
  );
}
