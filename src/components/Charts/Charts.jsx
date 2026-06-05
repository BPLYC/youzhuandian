import ReactECharts from 'echarts-for-react';

const COLORS = {
  ev: '#55F0B4',
  evSoft: '#9AF8D0',
  gas: '#F6B45A',
  gasSoft: '#FFD69A',
  insurance: '#7BA7FF',
  maintenance: '#C5CBD6',
  text: '#F7FAF6',
  muted: '#A9B5AE',
  panel: 'rgba(8, 12, 10, 0.96)',
  grid: 'rgba(206, 232, 218, 0.11)',
};

const formatUsd = (value) => `$${Math.round(value || 0).toLocaleString('en-US')}`;
const calcPercent = (value, total) => `${total > 0 ? Math.round((value / total) * 100) : 0}%`;
const YEAR_PREFIX = '第 ';
const YEAR_SUFFIX = ' 年';

export function BreakEvenChart({ yearlyData, breakEvenYear }) {
  const years = yearlyData.map(d => `${YEAR_PREFIX}${d.year}${YEAR_SUFFIX}`);
  const fuelData = yearlyData.map(d => d.fuelTotal);
  const evData = yearlyData.map(d => d.evTotal);

  // 标注交叉点
  const markPoints = [];
  if (breakEvenYear !== null && breakEvenYear > 0 && breakEvenYear <= 15) {
    const yr = Math.round(breakEvenYear);
    const val = yearlyData[Math.min(yr, yearlyData.length - 1)];
    if (val) {
      markPoints.push({
        name: '回本点',
        coord: [`${YEAR_PREFIX}${yr}${YEAR_SUFFIX}`, Math.round((val.fuelTotal + val.evTotal) / 2)],
        symbol: 'circle',
        symbolSize: 16,
        itemStyle: { color: '#FFFFFF' },
        label: {
          show: true,
          formatter: '回本点',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 'bold',
          position: 'top',
        },
      });
    }
  }

  const option = {
    backgroundColor: 'transparent',
    animationDuration: 900,
    animationEasing: 'cubicOut',
    color: [COLORS.gas, COLORS.ev],
    grid: {
      left: '2%',
      right: '2%',
      top: '10%',
      bottom: '14%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: COLORS.panel,
      borderColor: 'rgba(255, 255, 255, 0.22)',
      borderWidth: 1,
      textStyle: { color: COLORS.text, fontSize: 13 },
      formatter: (params) => {
        const year = params[0].name;
        const fuel = params.find(p => p.seriesName === '油车');
        const ev = params.find(p => p.seriesName === '电车');
        const saving = fuel && ev ? fuel.value - ev.value : 0;
        return `
            <div style="padding:4px 0">
            <div style="font-weight:700;margin-bottom:6px">${year}累计持有成本</div>
            <div style="color:${COLORS.gas}">油车：${formatUsd(fuel?.value)}</div>
            <div style="color:${COLORS.ev}">电车：${formatUsd(ev?.value)}</div>
            <div style="margin-top:6px;font-weight:700;color:${saving >= 0 ? COLORS.ev : COLORS.gas}">
              ${saving >= 0 ? `电车领先 ${formatUsd(saving)}` : `电车落后 ${formatUsd(Math.abs(saving))}`}
            </div>
          </div>
        `;
      },
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
      axisLabel: { color: COLORS.muted, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: COLORS.grid } },
      axisLabel: {
        color: COLORS.muted,
        fontSize: 11,
        formatter: v => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : v,
      },
    },
    series: [
      {
        name: '油车',
        type: 'line',
        data: fuelData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        itemStyle: { color: COLORS.gas },
        lineStyle: { color: COLORS.gas, width: 3, type: 'dashed' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(246, 180, 90, 0.16)' },
              { offset: 1, color: 'rgba(246, 180, 90, 0)' },
            ],
          },
        },
        markPoint: {
          data: markPoints,
        },
      },
      {
        name: '电车',
        type: 'line',
        data: evData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        itemStyle: { color: COLORS.ev },
        lineStyle: {
          color: COLORS.ev,
          width: 3,
          shadowColor: 'rgba(85, 240, 180, 0.36)',
          shadowBlur: 10,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(85, 240, 180, 0.18)' },
              { offset: 1, color: 'rgba(85, 240, 180, 0)' },
            ],
          },
        },
      },
    ],
    legend: {
      bottom: 0,
      textStyle: { color: COLORS.muted, fontSize: 12 },
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 3,
    },
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '220px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

/**
 * 饼图：年度成本构成对比
 */
export function CostPieChart({ fuelBreakdown, evBreakdown }) {
  const buildItems = (data, energyLabel, energyColor) => {
    const items = [
      { value: data.energy, name: energyLabel, color: energyColor },
      { value: data.insurance, name: '保险', color: COLORS.insurance },
      { value: data.maintenance, name: '保养', color: COLORS.maintenance },
    ];
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return { items, total };
  };

  const makeOption = (title, breakdown) => ({
    backgroundColor: 'transparent',
    animationDuration: 950,
    animationEasing: 'cubicOut',
    title: {
      text: title,
      left: 'center',
      top: 4,
      textStyle: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: COLORS.panel,
      borderColor: 'rgba(255, 255, 255, 0.22)',
      borderWidth: 1,
      textStyle: { color: COLORS.text, fontSize: 12 },
      formatter: p => `${p.name}<br/>¥${p.value.toLocaleString()} (${p.percent}%)`,
    },
    series: [{
      type: 'pie',
      radius: ['46%', '74%'],
      center: ['50%', '58%'],
      avoidLabelOverlap: true,
      minAngle: 7,
      data: breakdown.items.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: item.color,
          borderColor: '#0B0F0D',
          borderWidth: 3,
        },
      })),
      label: {
        show: true,
        color: COLORS.text,
        fontSize: 11,
        fontWeight: 700,
        formatter: ({ percent }) => `${Math.round(percent)}%`,
      },
      labelLine: {
        show: true,
        length: 8,
        length2: 4,
        lineStyle: { color: 'rgba(247, 250, 246, 0.42)' },
      },
      emphasis: { scale: true, scaleSize: 5 },
    }],
  });

  const fuel = buildItems(fuelBreakdown, '汽油', COLORS.gas);
  const ev = buildItems(evBreakdown, '电费', COLORS.ev);
  const fuelOpt = makeOption('油车年度成本', fuel);
  const evOpt = makeOption('电车年度成本', ev);

  const renderLegend = (breakdown) => (
    <div className="pie-legend">
      {breakdown.items.map(item => (
        <div className="pie-legend-row" key={item.name}>
          <span className="pie-legend-swatch" style={{ background: item.color }} />
          <span className="pie-legend-name">{item.name}</span>
          <span className="pie-legend-value">{formatUsd(item.value)}</span>
          <span className="pie-legend-percent">{calcPercent(item.value, breakdown.total)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="cost-pie-grid">
      <div className="cost-pie-card">
        <ReactECharts option={fuelOpt} style={{ height: '180px' }} opts={{ renderer: 'canvas' }} />
        {renderLegend(fuel)}
      </div>
      <div className="cost-pie-card">
        <ReactECharts option={evOpt} style={{ height: '180px' }} opts={{ renderer: 'canvas' }} />
        {renderLegend(ev)}
      </div>
    </div>
  );
}
