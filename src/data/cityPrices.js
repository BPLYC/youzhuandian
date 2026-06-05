// US gas and electricity presets for the Chinese-localized MVP.
// Values are practical defaults for comparison, not live market data.

export const CITY_PRICES = [
  {
    label: '加州 California',
    fuelPrice: 4.85,
    homeElectricityPrice: 0.31,
    publicChargingPrice: 0.48,
  },
  {
    label: '德州 Texas',
    fuelPrice: 3.05,
    homeElectricityPrice: 0.15,
    publicChargingPrice: 0.34,
  },
  {
    label: '纽约州 New York',
    fuelPrice: 3.65,
    homeElectricityPrice: 0.24,
    publicChargingPrice: 0.42,
  },
  {
    label: '佛州 Florida',
    fuelPrice: 3.35,
    homeElectricityPrice: 0.16,
    publicChargingPrice: 0.36,
  },
  {
    label: '其他 / 手动填写',
    fuelPrice: 3.50,
    homeElectricityPrice: 0.17,
    publicChargingPrice: 0.38,
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
