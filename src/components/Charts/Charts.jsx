import ReactECharts from 'echarts-for-react';

const COLORS = {
  green: '#F4F4EF',
  greenSoft: '#D9D9D2',
  blue: '#BDBDB7',
  amber: '#8F8F8A',
  amberSoft: '#B0B0AA',
  text: '#F4F4EF',
  muted: '#A6A6A0',
  panel: 'rgba(10, 10, 10, 0.97)',
  grid: 'rgba(255, 255, 255, 0.08)',
};

const formatUsd = (value) => `$${Math.round(value || 0).toLocaleString('en-US')}`;

export function BreakEvenChart({ yearlyData, breakEvenYear }) {
  const years = yearlyData.map(d => `Y${d.year}`);
  const fuelData = yearlyData.map(d => d.fuelTotal);
  const evData = yearlyData.map(d => d.evTotal);

  const markPoints = [];
  if (breakEvenYear !== null && breakEvenYear > 0 && breakEvenYear <= 15) {
    const yr = Math.round(breakEvenYear);
    const val = yearlyData[Math.min(yr, yearlyData.length - 1)];
    if (val) {
      markPoints.push({
        name: 'Break-even',
        coord: [`Y${yr}`, Math.round((val.fuelTotal + val.evTotal) / 2)],
        symbol: 'circle',
        symbolSize: 16,
        itemStyle: { color: '#FFFFFF' },
        label: {
          show: true,
          formatter: 'Break-even',
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
    color: [COLORS.amber, COLORS.green],
    grid: {
      left: '2%',
      right: '2%',
      top: '8%',
      bottom: '12%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: COLORS.panel,
      borderColor: 'rgba(255, 255, 255, 0.22)',
      borderWidth: 1,
      textStyle: { color: COLORS.text, fontSize: 13 },
      formatter: (params) => {
        const year = params[0].name.replace('Y', 'Year ');
        const fuel = params.find(p => p.seriesName === 'Gas vehicle');
        const ev = params.find(p => p.seriesName === 'EV');
        const saving = fuel && ev ? fuel.value - ev.value : 0;
        return `
          <div style="padding:4px 0">
            <div style="font-weight:700;margin-bottom:6px">${year} ownership cost</div>
            <div style="color:${COLORS.amber}">Gas: ${formatUsd(fuel?.value)}</div>
            <div style="color:${COLORS.green}">EV: ${formatUsd(ev?.value)}</div>
            <div style="margin-top:6px;font-weight:700;color:${saving >= 0 ? COLORS.green : COLORS.amber}">
              ${saving >= 0 ? `EV ahead by ${formatUsd(saving)}` : `EV behind by ${formatUsd(Math.abs(saving))}`}
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
        formatter: v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`,
      },
    },
    series: [
      {
        name: 'Gas vehicle',
        type: 'line',
        data: fuelData,
        smooth: true,
        symbol: 'none',
        itemStyle: { color: COLORS.amber },
        lineStyle: { color: COLORS.amber, width: 2.5, type: 'dashed' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(180, 180, 180, 0.16)' },
              { offset: 1, color: 'rgba(180, 180, 180, 0)' },
            ],
          },
        },
        markPoint: {
          data: markPoints,
        },
      },
      {
        name: 'EV',
        type: 'line',
        data: evData,
        smooth: true,
        symbol: 'none',
        itemStyle: { color: COLORS.green },
        lineStyle: { color: COLORS.green, width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 255, 255, 0.16)' },
              { offset: 1, color: 'rgba(255, 255, 255, 0)' },
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

export function CostPieChart({ fuelBreakdown, evBreakdown }) {
  const makeOption = (title, data, color1, color2, color3, energyLabel) => ({
    backgroundColor: 'transparent',
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
      formatter: p => `${p.name}<br/>${formatUsd(p.value)} (${p.percent}%)`,
    },
    series: [{
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '58%'],
      data: [
        { value: data.energy, name: energyLabel, itemStyle: { color: color1 } },
        { value: data.insurance, name: 'Insurance', itemStyle: { color: color2 } },
        { value: data.maintenance, name: 'Maintenance', itemStyle: { color: color3 } },
      ],
      label: {
        show: false,
      },
      labelLine: { show: false },
      emphasis: { scale: true, scaleSize: 4 },
    }],
  });

  const fuelOpt = makeOption('Gas yearly cost', fuelBreakdown, COLORS.amber, COLORS.amberSoft, '#D0D0CA', 'Fuel');
  const evOpt = makeOption('EV yearly cost', evBreakdown, COLORS.green, COLORS.blue, COLORS.greenSoft, 'Electricity');

  return (
    <div className="cost-pie-grid">
      <div>
        <ReactECharts option={fuelOpt} style={{ height: '180px' }} opts={{ renderer: 'canvas' }} />
      </div>
      <div>
        <ReactECharts option={evOpt} style={{ height: '180px' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
