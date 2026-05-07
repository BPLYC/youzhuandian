import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { formatMoney, formatBreakEven } from '../../utils/calculator';
import { BreakEvenChart, CostPieChart } from '../Charts/Charts';
import { useUsageTracker } from '../../hooks/useUsageTracker';
import './ResultDashboard.css';

export default function ResultDashboard({ result, onRecalculate }) {
  const dashboardRef = useRef(null);
  const { exportSession } = useUsageTracker();
  const [syncing, setSyncing] = useState(false);

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
    // 微信环境检测
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
    
    if (isWeChat) {
      // 微信环境：需要引导外部打开并同步会话
      setSyncing(true);
      const res = await exportSession();
      setSyncing(false);
      if (res.ok) {
        const syncUrl = `${window.location.origin}${window.location.pathname}?sync=${res.token}`;
        try {
          await navigator.clipboard.writeText(syncUrl);
          alert('⚠️ 微信内无法直接保存高清截图。\n\n✅ 已为您生成并复制了【专属同步链接】！\n\n请在外部浏览器（如 Safari、Chrome）中粘贴访问该链接，即可继续截图并自动同步您的会员状态。');
        } catch (err) {
          alert(`⚠️ 微信内无法直接保存高清截图。\n\n请手动复制以下链接并在外部浏览器打开以完成截图和状态同步：\n\n${syncUrl}`);
        }
      } else {
        alert(`❌ 无法生成同步链接: ${res.msg}`);
      }
      return; // 阻止在微信中继续执行后续截图代码
    }

    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0A0F1E',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = '油车换电车回本计算结果.png';
      link.href = url;
      link.click();
    } catch (err) {
      console.error('截图失败', err);
    }
  };

  const handleShare = async () => {
    const shareText = `我用「油换电计算器」算出：换电车${formatBreakEven(breakEvenYear)}回本，10年省 ${formatMoney(saving10yr)}！快来算算你的👇`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: '油换电回本计算器', text: shareText, url: shareUrl });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
        alert('链接已复制到剪贴板，快去分享给朋友吧！');
      } catch {
        alert('请手动复制：' + shareUrl);
      }
    }
  };

  const breakEvenText = formatBreakEven(breakEvenYear);
  const verdict = breakEvenYear === null
    ? { label: '暂时不划算', color: 'amber', icon: '⚠️' }
    : breakEvenYear === 0
    ? { label: '立即省钱', color: 'green', icon: '🎉' }
    : breakEvenYear <= 4
    ? { label: '非常划算', color: 'green', icon: '🏆' }
    : breakEvenYear <= 7
    ? { label: '比较划算', color: 'blue', icon: '✅' }
    : breakEvenYear <= 10
    ? { label: '勉强回本', color: 'blue', icon: '📊' }
    : { label: '回本时间较长', color: 'amber', icon: '⏳' };

  return (
    <div className="result-wrapper">
      {/* 可截图区域 */}
      <div className="result-dashboard" ref={dashboardRef}>
        <div className="watermark">油车换电车划算吗？ · youzhuandian.app</div>

        <div className={`verdict-banner verdict-${verdict.color}`}>
          <span className="verdict-icon">{verdict.icon}</span>
          <span className="verdict-label">{verdict.label}</span>
          {breakEvenYear !== null && breakEvenYear > 0 && (
            <span className="verdict-sub">· {breakEvenText}开始省钱</span>
          )}
        </div>

        <div className="hero-section">
          <div className="hero-label">换电车后回本时间</div>
          <div className={`hero-number hero-${verdict.color}`} id="break-even-display">
            {breakEvenText}
          </div>
          <div className="hero-sub">
            之后每年净节省
            <span className="hero-saving">{formatMoney(annualNetSaving)}</span>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-label">每年省</div>
            <div className="stat-card-value text-green">{formatMoney(annualNetSaving)}</div>
            <div className="stat-card-sub">净节省</div>
          </div>
          <div className="stat-card stat-card-featured">
            <div className="stat-card-label">5年省</div>
            <div className={`stat-card-value ${saving5yr >= 0 ? 'text-green' : 'text-amber'}`}>
              {saving5yr >= 0 ? formatMoney(saving5yr) : '-' + formatMoney(Math.abs(saving5yr))}
            </div>
            <div className="stat-card-sub">累计</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">10年省</div>
            <div className={`stat-card-value ${saving10yr >= 0 ? 'text-green' : 'text-amber'}`}>
              {saving10yr >= 0 ? formatMoney(saving10yr) : '-' + formatMoney(Math.abs(saving10yr))}
            </div>
            <div className="stat-card-sub">累计</div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-title">
            <span>累计成本对比</span>
            {breakEvenYear !== null && breakEvenYear > 0 && breakEvenYear <= 15 && (
              <span className="chart-breakeven-badge">
                💡 {Math.round(breakEvenYear)}年交叉
              </span>
            )}
          </div>
          <BreakEvenChart yearlyData={yearlyData} breakEvenYear={breakEvenYear} />
        </div>

        <div className="energy-compare">
          <div className="energy-item fuel">
            <span className="energy-icon">⛽</span>
            <div>
              <div className="energy-label">油车年油费</div>
              <div className="energy-value">{formatMoney(annualFuelCost)}</div>
            </div>
          </div>
          <div className="energy-arrow">→</div>
          <div className="energy-item ev">
            <span className="energy-icon">🔋</span>
            <div>
              <div className="energy-label">电车年电费</div>
              <div className="energy-value text-green">{formatMoney(annualElecCost)}</div>
            </div>
          </div>
          <div className="energy-saving">
            <div className="energy-saving-label">省</div>
            <div className="energy-saving-val">{formatMoney(annualFuelCost - annualElecCost)}</div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-title">年度成本构成</div>
          <CostPieChart fuelBreakdown={fuelAnnualBreakdown} evBreakdown={evAnnualBreakdown} />
        </div>

        <div className="detail-section">
          <div className="detail-title" onClick={e => e.currentTarget.parentElement.classList.toggle('open')}>
            <span>购车成本差异明细</span>
            <span className="detail-toggle">▾</span>
          </div>
          <div className="detail-body">
            <div className="detail-row">
              <span>电车免购置税优惠</span>
              <span className="text-green">节省 {formatMoney(result.fuelPurchaseTax)}</span>
            </div>
            <div className="detail-row">
              <span>车价差异（购车初期）</span>
              <span className={purchaseDiff >= 0 ? 'text-amber' : 'text-green'}>
                {purchaseDiff >= 0 ? `多投入 ${formatMoney(purchaseDiff)}` : `少投入 ${formatMoney(Math.abs(purchaseDiff))}`}
              </span>
            </div>
            {result.chargerInstallCost > 0 && (
              <div className="detail-row">
                <span>充电桩安装费</span>
                <span className="text-amber">-{formatMoney(result.chargerInstallCost)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮（不截图） */}
      <div className="result-actions">
        <button id="btn-screenshot" className="action-btn action-screenshot" onClick={handleScreenshot} disabled={syncing}>
          <span>📸</span> {syncing ? '处理中...' : '截图保存'}
        </button>
        <button id="btn-share" className="action-btn action-share" onClick={handleShare}>
          <span>🔗</span> 分享给朋友
        </button>
        <button id="btn-recalculate" className="action-btn action-recalculate" onClick={onRecalculate}>
          <span>🔄</span> 重新计算
        </button>
      </div>
    </div>
  );
}
