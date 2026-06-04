/**
 * Core cost model for the US English EV vs gas calculator.
 * Runs entirely in the browser.
 */

export function calcAnnualFuelCost(miles, mpg, pricePerGallon) {
  if (!mpg || mpg <= 0) return 0;
  return (miles / mpg) * pricePerGallon;
}

export function calcAnnualElectricityCost(miles, kwhPer100Miles, pricePerKwh) {
  return (miles / 100) * kwhPer100Miles * pricePerKwh;
}

export function calculate(params) {
  const {
    annualMileage,
    fuelEfficiency,
    fuelPrice,
    electricityPrice,
    evConsumption,
    gasCarPrice,
    evCarPrice,
    evIncentives,
    chargerInstallCost,
    insuranceDiff,
    maintenanceDiff,
  } = params;

  const fuelTotalPurchase = gasCarPrice;
  const evTotalPurchase = evCarPrice + chargerInstallCost - evIncentives;
  const purchaseDiff = evTotalPurchase - fuelTotalPurchase;

  const annualFuelCost = calcAnnualFuelCost(annualMileage, fuelEfficiency, fuelPrice);
  const annualElecCost = calcAnnualElectricityCost(annualMileage, evConsumption, electricityPrice);
  const annualEnergySaving = annualFuelCost - annualElecCost;
  const annualNetSaving = annualEnergySaving - insuranceDiff - maintenanceDiff;

  const yearlyDataClean = [];
  const years = 15;
  for (let y = 0; y <= years; y++) {
    const evExtra = insuranceDiff + maintenanceDiff;
    const fuelTotalFinal = fuelTotalPurchase + y * annualFuelCost;
    const evTotalFinal = evTotalPurchase + y * (annualElecCost + evExtra);

    yearlyDataClean.push({
      year: y,
      fuelTotal: Math.round(fuelTotalFinal),
      evTotal: Math.round(evTotalFinal),
      saving: Math.round(fuelTotalFinal - evTotalFinal),
    });
  }

  let preciseBreakEven = null;
  for (let i = 1; i < yearlyDataClean.length; i++) {
    const prev = yearlyDataClean[i - 1];
    const curr = yearlyDataClean[i];

    if (prev.saving <= 0 && curr.saving > 0) {
      const t = -prev.saving / (curr.saving - prev.saving);
      preciseBreakEven = (i - 1) + t;
      break;
    }

    if (curr.saving > 0 && i === 1 && prev.saving > 0) {
      preciseBreakEven = 0;
      break;
    }
  }

  const saving5yr = yearlyDataClean[5]?.saving || 0;
  const saving10yr = yearlyDataClean[10]?.saving || 0;

  const fuelAnnualBreakdown = {
    energy: Math.round(annualFuelCost),
    insurance: 1500,
    maintenance: 1200,
  };
  const evAnnualBreakdown = {
    energy: Math.round(annualElecCost),
    insurance: Math.max(0, Math.round(1500 + insuranceDiff)),
    maintenance: Math.max(0, Math.round(1200 + maintenanceDiff)),
  };

  return {
    gasCarPrice,
    evCarPrice,
    evIncentives,
    chargerInstallCost,
    fuelTotalPurchase: Math.round(fuelTotalPurchase),
    evTotalPurchase: Math.round(evTotalPurchase),
    purchaseDiff: Math.round(purchaseDiff),
    annualFuelCost: Math.round(annualFuelCost),
    annualElecCost: Math.round(annualElecCost),
    annualEnergySaving: Math.round(annualEnergySaving),
    annualNetSaving: Math.round(annualNetSaving),
    breakEvenYear: preciseBreakEven,
    yearlyData: yearlyDataClean,
    saving5yr: Math.round(saving5yr),
    saving10yr: Math.round(saving10yr),
    fuelAnnualBreakdown,
    evAnnualBreakdown,
    isWorthIt: preciseBreakEven !== null && preciseBreakEven <= 8,
  };
}

export function formatMoney(amount, showSign = false) {
  const value = Math.round(Math.abs(amount));
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

  if (showSign) {
    return `${amount >= 0 ? '+' : '-'}${formatted}`;
  }

  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatBreakEven(years) {
  if (years === null) return 'No break-even';
  if (years === 0) return 'Day one';
  if (years < 1) return `About ${Math.max(1, Math.round(years * 12))} mo`;

  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  const yearLabel = y === 1 ? 'year' : 'years';

  if (m === 0) return `${y} ${yearLabel}`;
  return `${y} ${yearLabel} ${m} mo`;
}
