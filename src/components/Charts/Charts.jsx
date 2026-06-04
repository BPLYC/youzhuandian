import ReactECharts from 'echarts-for-react';

/**
 * 折线图：累计成本对比（回本交叉点）
 */
export function BreakEvenChart({ yearlyData, breakEvenYear }) {
  const years = yearlyData.map(d => `${d.year}年`);
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
        coord: [`${yr}年`, Math.round((val.fuelTotal + val.evTotal) / 2)],
        symbol: 'circle',
        symbolSize: 16,
        itemStyle: { color: '#FFD700' },
        label: {
          show: true,
          formatter: '💡回本',
          color: '#FFD700',
          fontSize: 12,
          fontWeight: 'bold',
          position: 'top',
        },
      });
    }
  }

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '2%',
      right: '2%',
      top: '8%',
      bottom: '12%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(14, 20, 40, 0.95)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#F0F4FF', fontSize: 13 },
      formatter: (params) => {
        const year = params[0].name;
        const fuel = params.find(p => p.seriesName === '油车');
        const ev = params.find(p => p.seriesName === '电车');
        const saving = fuel && ev ? fuel.value - ev.value : 0;
        return `
          <div style="padding:4px 0">
            <div style="font-weight:700;margin-bottom:6px">${year}累计花费</div>
            <div style="color:#FF6B35">🔴 油车: ¥${(fuel?.value || 0).toLocaleString()}</div>
            <div style="color:#00D4AA">🟢 电车: ¥${(ev?.value || 0).toLocaleString()}</div>
            <div style="margin-top:6px;font-weight:700;color:${saving >= 0 ? '#00D4AA' : '#FF6B35'}">
              ${saving >= 0 ? `💰 电车省了 ¥${saving.toLocaleString()}` : `⚠️ 电车贵了 ¥${Math.abs(saving).toLocaleString()}`}
            </div>
          </div>
        `;
      },
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#8B9ABE', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: {
        color: '#8B9ABE',
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
        symbol: 'none',
        lineStyle: { color: '#FF6B35', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 53, 0.2)' },
              { offset: 1, color: 'rgba(255, 107, 53, 0)' },
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
        symbol: 'none',
        lineStyle: { color: '#00D4AA', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 170, 0.2)' },
              { offset: 1, color: 'rgba(0, 212, 170, 0)' },
            ],
          },
        },
      },
    ],
    legend: {
      bottom: 0,
      textStyle: { color: '#8B9ABE', fontSize: 12 },
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
  const makeOption = (title, data, color1, color2, color3) => ({
    backgroundColor: 'transparent',
    title: {
      text: title,
      left: 'center',
      top: 4,
      textStyle: { color: '#8B9ABE', fontSize: 12, fontWeight: '500' },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(14, 20, 40, 0.95)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#F0F4FF', fontSize: 12 },
      formatter: p => `${p.name}<br/>¥${p.value.toLocaleString()} (${p.percent}%)`,
    },
    series: [{
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '58%'],
      data: [
        { value: data.energy, name: '能源费', itemStyle: { color: color1 } },
        { value: data.insurance, name: '保险费', itemStyle: { color: color2 } },
        { value: data.maintenance, name: '维保费', itemStyle: { color: color3 } },
      ],
      label: {
        show: true,
        fontSize: 10,
        color: '#8B9ABE',
        formatter: '{b}\n{d}%',
      },
      labelLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      emphasis: { scale: true, scaleSize: 4 },
    }],
  });

  const fuelOpt = makeOption('油车年度成本', fuelBreakdown, '#FF6B35', '#FF9F5A', '#FFCA8A');
  const evOpt = makeOption('电车年度成本', evBreakdown, '#00D4AA', '#4FACFE', '#7C3AED');

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ flex: 1 }}>
        <ReactECharts option={fuelOpt} style={{ height: '180px' }} opts={{ renderer: 'canvas' }} />
      </div>
      <div style={{ flex: 1 }}>
        <ReactECharts option={evOpt} style={{ height: '180px' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
