// 主要城市电价 & 油价预设数据（2024年参考值）
// 油价：92号汽油（元/升）
// 电价：普通居民峰电 / 谷电（元/度）

export const CITY_PRICES = [
  {
    city: '北京',
    fuelPrice: 7.62,
    peakElecPrice: 0.83,
    valleyElecPrice: 0.35,
    avgElecPrice: 0.59,
  },
  {
    city: '上海',
    fuelPrice: 7.65,
    peakElecPrice: 0.77,
    valleyElecPrice: 0.32,
    avgElecPrice: 0.55,
  },
  {
    city: '广州',
    fuelPrice: 7.58,
    peakElecPrice: 0.88,
    valleyElecPrice: 0.38,
    avgElecPrice: 0.63,
  },
  {
    city: '深圳',
    fuelPrice: 7.60,
    peakElecPrice: 0.68,
    valleyElecPrice: 0.28,
    avgElecPrice: 0.48,
  },
  {
    city: '成都',
    fuelPrice: 7.56,
    peakElecPrice: 0.72,
    valleyElecPrice: 0.35,
    avgElecPrice: 0.54,
  },
  {
    city: '杭州',
    fuelPrice: 7.63,
    peakElecPrice: 0.75,
    valleyElecPrice: 0.30,
    avgElecPrice: 0.53,
  },
  {
    city: '武汉',
    fuelPrice: 7.55,
    peakElecPrice: 0.78,
    valleyElecPrice: 0.38,
    avgElecPrice: 0.58,
  },
  {
    city: '西安',
    fuelPrice: 7.52,
    peakElecPrice: 0.70,
    valleyElecPrice: 0.33,
    avgElecPrice: 0.52,
  },
  {
    city: '南京',
    fuelPrice: 7.64,
    peakElecPrice: 0.74,
    valleyElecPrice: 0.32,
    avgElecPrice: 0.53,
  },
  {
    city: '重庆',
    fuelPrice: 7.54,
    peakElecPrice: 0.80,
    valleyElecPrice: 0.40,
    avgElecPrice: 0.60,
  },
  {
    city: '天津',
    fuelPrice: 7.61,
    peakElecPrice: 0.80,
    valleyElecPrice: 0.34,
    avgElecPrice: 0.57,
  },
  {
    city: '郑州',
    fuelPrice: 7.53,
    peakElecPrice: 0.76,
    valleyElecPrice: 0.36,
    avgElecPrice: 0.56,
  },
  {
    city: '长沙',
    fuelPrice: 7.57,
    peakElecPrice: 0.74,
    valleyElecPrice: 0.37,
    avgElecPrice: 0.56,
  },
  {
    city: '沈阳',
    fuelPrice: 7.50,
    peakElecPrice: 0.78,
    valleyElecPrice: 0.36,
    avgElecPrice: 0.57,
  },
  {
    city: '其他/手动填写',
    fuelPrice: 7.58,
    peakElecPrice: 0.75,
    valleyElecPrice: 0.35,
    avgElecPrice: 0.55,
  },
];

export const DEFAULT_VALUES = {
  // 用车习惯
  annualMileage: 15000,        // km/年
  fuelConsumption: 8,          // L/100km
  drivingType: 'mixed',        // city/highway/mixed

  // 能源
  cityIndex: 14,               // 其他/手动
  fuelPrice: 7.58,             // 元/升
  elecPrice: 0.55,             // 元/度
  useHomeCharger: true,        // 家用充电桩
  evConsumption: 15,           // 度/100km

  // 购车参数
  fuelCarPrice: 150000,        // 油车价格（元）
  evCarPrice: 150000,          // 电车价格（元，含补贴）
  chargerInstallCost: 3000,    // 充电桩安装费（元）
  insuranceDiff: 500,          // 年保险差异（电车-油车，正=电贵）
  maintenanceDiff: -2000,      // 年维保差异（电车-油车，负=电省）
};
