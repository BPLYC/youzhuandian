// US gas and electricity presets for the English MVP.
// Values are practical defaults for comparison, not live market data.

export const US_PRESETS = [
  {
    label: 'California',
    fuelPrice: 4.85,
    homeElectricityPrice: 0.31,
    publicChargingPrice: 0.48,
  },
  {
    label: 'Texas',
    fuelPrice: 3.05,
    homeElectricityPrice: 0.15,
    publicChargingPrice: 0.34,
  },
  {
    label: 'New York',
    fuelPrice: 3.65,
    homeElectricityPrice: 0.24,
    publicChargingPrice: 0.42,
  },
  {
    label: 'Florida',
    fuelPrice: 3.35,
    homeElectricityPrice: 0.16,
    publicChargingPrice: 0.36,
  },
  {
    label: 'Other / manual',
    fuelPrice: 3.50,
    homeElectricityPrice: 0.17,
    publicChargingPrice: 0.38,
  },
];

export const DEFAULT_VALUES = {
  // Driving habits
  annualMileage: 12000,      // miles/year
  fuelEfficiency: 30,        // miles per gallon
  drivingType: 'mixed',      // city/highway/mixed

  // Energy
  presetIndex: 4,            // Other / manual
  fuelPrice: 3.50,           // $/gal
  electricityPrice: 0.17,    // $/kWh
  useHomeCharging: true,
  evConsumption: 30,         // kWh/100 mi

  // Vehicle costs
  gasCarPrice: 32000,
  evCarPrice: 38000,
  evIncentives: 7500,
  chargerInstallCost: 1200,
  insuranceDiff: 300,        // yearly EV insurance difference, positive = EV costs more
  maintenanceDiff: -700,     // yearly EV maintenance difference, negative = EV costs less
};
