import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { formatMoney, formatBreakEven } from '../../utils/calculator';
import { BreakEvenChart, CostPieChart } from '../Charts/Charts';
import './ResultDashboard.css';

export default function ResultDashboard({ result, onRecalculate }) {
  const dashboardRef = useRef(null);
  const [shareStatus, setShareStatus] = useState('');

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
      link.download = 'ev-savings-result-cn.png';
      link.href = url;
      link.click();
    } catch (err) {
      console.error('截图失败', err);
    }
  };

  const handleShare = async () => {
    const shareText = `我用电车省钱计算器估算了一下：回本时间为 ${formatBreakEven(breakEvenYear)}，10 年累计变化为 ${formatMoney(saving10yr)}。`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: '电车省钱计算器', text: shareText, url: shareUrl });
      } catch {
        return;
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareStatus('已复制');
        window.setTimeout(() => setShareStatus(''), 1800);
      } catch {
        setShareStatus('复制失败');
        window.setTimeout(() => setShareStatus(''), 1800);
      }
    }
  };

  const breakEvenText = formatBreakEven(breakEvenYear);
  const verdict = breakEvenYear === null
    ? { label: '暂未回本', color: 'amber' }
    : breakEvenYear === 0
    ? { label: '第一天就更省', color: 'green' }
    : breakEvenYear <= 4
    ? { label: '电车优势明显', color: 'green' }
    : breakEvenYear <= 7
    ? { label: '大概率值得换', color: 'blue' }
    : breakEvenYear <= 10
    ? { label: '回本周期较长', color: 'blue' }
    : { label: '回本较慢', color: 'amber' };

  return (
    <div className="result-wrapper">
      {/* 可截图区域 */}
      <div className="result-dashboard" ref={dashboardRef}>
        <div className="watermark">电车省钱计算器</div>

        <div className={`verdict-banner verdict-${verdict.color}`}>
          <span className="verdict-dot" aria-hidden="true" />
          <span className="verdict-label">{verdict.label}</span>
          {breakEvenYear !== null && breakEvenYear > 0 && (
            <span className="verdict-sub">{breakEvenText} 后开始累计省钱</span>
          )}
        </div>

        <div className="hero-section">
          <div className="hero-label">预计回本时间</div>
          <div className={`hero-number hero-${verdict.color}`} id="break-even-display">
            {breakEvenText}
          </div>
          <div className="hero-sub">
            换成电车后的年度净变化
            <span className={`hero-saving ${netSavingClass}`}>{formatMoney(annualNetSaving)}</span>
          </div>
        </div>

        <div className="result-summary-note">
          <span className="summary-note-line" />
          <span>
            该估算对比未来 15 年的购车成本、补贴、充电、汽油、保险和保养差异。
          </span>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-label">每年</div>
            <div className={`stat-card-value ${netSavingClass}`}>{formatMoney(annualNetSaving)}</div>
            <div className="stat-card-sub">净变化</div>
          </div>
          <div className="stat-card stat-card-featured">
            <div className="stat-card-label">5 年</div>
            <div className={`stat-card-value ${saving5yr >= 0 ? 'text-green' : 'text-amber'}`}>
              {saving5yr >= 0 ? formatMoney(saving5yr) : '-' + formatMoney(Math.abs(saving5yr))}
            </div>
            <div className="stat-card-sub">累计变化</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">10 年</div>
            <div className={`stat-card-value ${saving10yr >= 0 ? 'text-green' : 'text-amber'}`}>
              {saving10yr >= 0 ? formatMoney(saving10yr) : '-' + formatMoney(Math.abs(saving10yr))}
            </div>
            <div className="stat-card-sub">累计变化</div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-title">
            <span>累计持有成本</span>
            {breakEvenYear !== null && breakEvenYear > 0 && breakEvenYear <= 15 && (
              <span className="chart-breakeven-badge">
                第 {Math.round(breakEvenYear)} 年交叉
              </span>
            )}
          </div>
          <BreakEvenChart yearlyData={yearlyData} breakEvenYear={breakEvenYear} />
        </div>

        <div className="energy-compare">
          <div className="energy-item fuel">
            <span className="energy-icon">油</span>
            <div>
              <div className="energy-label">汽油成本 / 年</div>
              <div className="energy-value">{formatMoney(annualFuelCost)}</div>
            </div>
          </div>
          <div className="energy-arrow">vs</div>
          <div className="energy-item ev">
            <span className="energy-icon">电</span>
            <div>
              <div className="energy-label">充电成本 / 年</div>
              <div className="energy-value text-green">{formatMoney(annualElecCost)}</div>
            </div>
          </div>
          <div className="energy-saving">
            <div className="energy-saving-label">能源成本差异</div>
            <div className={`energy-saving-val ${energySavingsClass}`}>{formatMoney(energySavings)}</div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-title">
            <span>年度成本构成</span>
            <span className="chart-help-text">下方显示金额与占比</span>
          </div>
          <CostPieChart fuelBreakdown={fuelAnnualBreakdown} evBreakdown={evAnnualBreakdown} />
        </div>

        <div className="detail-section">
          <div className="detail-title" onClick={e => e.currentTarget.parentElement.classList.toggle('open')}>
            <span>前期成本明细</span>
            <span className="detail-toggle" aria-hidden="true">v</span>
          </div>
          <div className="detail-body">
            {result.evIncentives > 0 && (
              <div className="detail-row">
                <span>电车补贴 / 税收抵免</span>
                <span className="text-green">-{formatMoney(result.evIncentives)}</span>
              </div>
            )}
            <div className="detail-row">
              <span>购车前期差异</span>
              <span className={purchaseDiff >= 0 ? 'text-amber' : 'text-green'}>
                {purchaseDiff >= 0 ? `前期多花 ${formatMoney(purchaseDiff)}` : `前期少花 ${formatMoney(Math.abs(purchaseDiff))}`}
              </span>
            </div>
            {result.chargerInstallCost > 0 && (
              <div className="detail-row">
                <span>家用充电桩安装</span>
                <span className="text-amber">{formatMoney(result.chargerInstallCost)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮（不截图） */}
      <div className="result-actions">
        <button id="btn-screenshot" type="button" className="action-btn action-screenshot" onClick={handleScreenshot}>
          <span aria-hidden="true">保存</span> 导出图片
        </button>
        <button id="btn-share" type="button" className="action-btn action-share" onClick={handleShare}>
          <span aria-hidden="true">复制</span> {shareStatus || '复制分享文案'}
        </button>
        <button id="btn-recalculate" type="button" className="action-btn action-recalculate" onClick={onRecalculate}>
          <span aria-hidden="true">调整</span> 修改参数
        </button>
      </div>
    </div>
  );
}
