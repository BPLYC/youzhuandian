import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { formatMoney, formatBreakEven } from '../../utils/calculator';
import { BreakEvenChart, CostPieChart } from '../Charts/Charts';
import './ResultDashboard.css';

export default function ResultDashboard({ result, onRecalculate }) {
  const dashboardRef = useRef(null);

  const {
    breakEvenYear,
    annualNetSaving,
    saving5yr,
    saving10yr,
    yearlyData,
    fuelAnnualBreakdown,
    evAnnualBreakdown,
    purchaseDiff,
    annualFuelCost,
    annualElecCost,
  } = result;

  const handleScreenshot = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'ev-vs-gas-savings-result.png';
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Screenshot failed', err);
    }
  };

  const handleShare = async () => {
    const shareText = `I used the EV vs Gas Savings Calculator: break-even is ${formatBreakEven(breakEvenYear)}, with 10-year savings of ${formatMoney(saving10yr)}.`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'EV vs Gas Savings Calculator', text: shareText, url: shareUrl });
      } catch {
        return;
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Share text copied to your clipboard.');
      } catch {
        alert(`Copy this link: ${shareUrl}`);
      }
    }
  };

  const breakEvenText = formatBreakEven(breakEvenYear);
  const netSavingClass = annualNetSaving >= 0 ? 'text-green' : 'text-amber';
  const energySavings = annualFuelCost - annualElecCost;
  const energySavingsClass = energySavings >= 0 ? 'text-green' : 'text-amber';
  const verdict = breakEvenYear === null
    ? { label: 'Not yet cost-positive', color: 'amber' }
    : breakEvenYear === 0
    ? { label: 'Saves from day one', color: 'green' }
    : breakEvenYear <= 4
    ? { label: 'Strong EV case', color: 'green' }
    : breakEvenYear <= 7
    ? { label: 'Likely worth it', color: 'blue' }
    : breakEvenYear <= 10
    ? { label: 'Longer payback', color: 'blue' }
    : { label: 'Slow payback', color: 'amber' };

  return (
    <div className="result-wrapper">
      <div className="result-dashboard" ref={dashboardRef}>
        <div className="watermark">EV vs Gas Savings Calculator</div>

        <div className={`verdict-banner verdict-${verdict.color}`}>
          <span className="verdict-dot" aria-hidden="true" />
          <span className="verdict-label">{verdict.label}</span>
          {breakEvenYear !== null && breakEvenYear > 0 && (
            <span className="verdict-sub">Savings start after {breakEvenText}</span>
          )}
        </div>

        <div className="hero-section">
          <div className="hero-label">Break-even time</div>
          <div className={`hero-number hero-${verdict.color}`} id="break-even-display">
            {breakEvenText}
          </div>
          <div className="hero-sub">
            Yearly net change after switching
            <span className={`hero-saving ${netSavingClass}`}>{formatMoney(annualNetSaving)}</span>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-label">Annual</div>
            <div className={`stat-card-value ${netSavingClass}`}>{formatMoney(annualNetSaving)}</div>
            <div className="stat-card-sub">net change</div>
          </div>
          <div className="stat-card stat-card-featured">
            <div className="stat-card-label">5 years</div>
            <div className={`stat-card-value ${saving5yr >= 0 ? 'text-green' : 'text-amber'}`}>
              {saving5yr >= 0 ? formatMoney(saving5yr) : `-${formatMoney(Math.abs(saving5yr))}`}
            </div>
            <div className="stat-card-sub">cumulative</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">10 years</div>
            <div className={`stat-card-value ${saving10yr >= 0 ? 'text-green' : 'text-amber'}`}>
              {saving10yr >= 0 ? formatMoney(saving10yr) : `-${formatMoney(Math.abs(saving10yr))}`}
            </div>
            <div className="stat-card-sub">cumulative</div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-title">
            <span>Cumulative ownership cost</span>
            {breakEvenYear !== null && breakEvenYear > 0 && breakEvenYear <= 15 && (
              <span className="chart-breakeven-badge">
                Year {Math.round(breakEvenYear)} crossover
              </span>
            )}
          </div>
          <BreakEvenChart yearlyData={yearlyData} breakEvenYear={breakEvenYear} />
        </div>

        <div className="energy-compare">
          <div className="energy-item fuel">
            <span className="energy-icon">G</span>
            <div>
              <div className="energy-label">Gas cost / year</div>
              <div className="energy-value">{formatMoney(annualFuelCost)}</div>
            </div>
          </div>
          <div className="energy-arrow">vs</div>
          <div className="energy-item ev">
            <span className="energy-icon">EV</span>
            <div>
              <div className="energy-label">Electricity / year</div>
              <div className="energy-value text-green">{formatMoney(annualElecCost)}</div>
            </div>
          </div>
          <div className="energy-saving">
            <div className="energy-saving-label">Energy difference</div>
            <div className={`energy-saving-val ${energySavingsClass}`}>{formatMoney(energySavings)}</div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-title">Annual cost breakdown</div>
          <CostPieChart fuelBreakdown={fuelAnnualBreakdown} evBreakdown={evAnnualBreakdown} />
        </div>

        <div className="detail-section">
          <div className="detail-title" onClick={e => e.currentTarget.parentElement.classList.toggle('open')}>
            <span>Upfront cost details</span>
            <span className="detail-toggle">v</span>
          </div>
          <div className="detail-body">
            {result.evIncentives > 0 && (
              <div className="detail-row">
                <span>EV incentives / credits</span>
                <span className="text-green">-{formatMoney(result.evIncentives)}</span>
              </div>
            )}
            <div className="detail-row">
              <span>Purchase price difference</span>
              <span className={purchaseDiff >= 0 ? 'text-amber' : 'text-green'}>
                {purchaseDiff >= 0 ? `${formatMoney(purchaseDiff)} more upfront` : `${formatMoney(Math.abs(purchaseDiff))} less upfront`}
              </span>
            </div>
            {result.chargerInstallCost > 0 && (
              <div className="detail-row">
                <span>Home charger installation</span>
                <span className="text-amber">{formatMoney(result.chargerInstallCost)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button id="btn-screenshot" type="button" className="action-btn action-screenshot" onClick={handleScreenshot}>
          <span>PNG</span> Save result
        </button>
        <button id="btn-share" type="button" className="action-btn action-share" onClick={handleShare}>
          <span>URL</span> Share
        </button>
        <button id="btn-recalculate" type="button" className="action-btn action-recalculate" onClick={onRecalculate}>
          <span>New</span> Recalculate
        </button>
      </div>
    </div>
  );
}
