/**
 * 核心计算逻辑 — 油车 vs 电车成本对比
 * 全在浏览器端运行，无需服务器
 */

/**
 * 计算购置税（油车需缴纳，电车免）
 * 购置税 = 车价 / 1.13 * 0.1
 */
export function calcPurchaseTax(price) {
  return (price / 1.13) * 0.1;
}

/**
 * 计算年度能源费用
 */
export function calcAnnualEnergy(mileage, consumptionPer100, pricePerUnit) {
  return (mileage / 100) * consumptionPer100 * pricePerUnit;
}

/**
 * 主计算函数 — 返回完整对比数据
 * @param {Object} params 用户输入参数
 * @returns {Object} 计算结果
 */
export function calculate(params) {
  const {
    annualMileage,
    fuelConsumption,
    fuelPrice,
    elecPrice,
    evConsumption,
    fuelCarPrice,
    evCarPrice,
    chargerInstallCost,
    insuranceDiff,      // 正 = 电车保险贵
    maintenanceDiff,    // 负 = 电车维保省
  } = params;

  // ===== 购车成本 =====
  const fuelPurchaseTax = calcPurchaseTax(fuelCarPrice);
  const fuelTotalPurchase = fuelCarPrice + fuelPurchaseTax;
  const evTotalPurchase = evCarPrice + chargerInstallCost; // 电车免购置税

  const purchaseDiff = evTotalPurchase - fuelTotalPurchase; // 正 = 电车贵

  // ===== 年度运营成本 =====
  const annualFuelCost = calcAnnualEnergy(annualMileage, fuelConsumption, fuelPrice);
  const annualElecCost = calcAnnualEnergy(annualMileage, evConsumption, elecPrice);

  const annualEnergySaving = annualFuelCost - annualElecCost; // 年节省能源费（正=节省）

  // 电车年度运营总变化（相对油车）
  // 上式：节省能源 - 多付保险 - 少付维保（maintenanceDiff是负数，所以减负等于加）
  // 即：能源节省 + 维保节省 - 保险多付

  const annualNetSaving = annualEnergySaving
    + Math.abs(maintenanceDiff) * (maintenanceDiff < 0 ? 1 : -1)
    - insuranceDiff;

  // ===== 回本年数 =====
  // 初始多投入 purchaseDiff 元
  // 每年节省 annualNetSaving 元
  // annualNetSaving <= 0：换车不省钱

  // ===== 多年累计对比（15年） =====
  // 油车累计：购车总价 + y年 * 年油费
  // 电车累计：购车总价 + y年 * (年电费 + 保险差额 + 维保差额)
  // evExtra = insuranceDiff + maintenanceDiff（正=电贵，负=电省）
  const years = 15;
  const yearlyDataClean = [];
  for (let y = 0; y <= years; y++) {
    // 油车累计：购车 + y年能源 + y年保险（基准0）+ y年维保（基准0）
    // 电车累计：购车+充电桩 + y年电费 + y年多付保险 + y年少付维保
    // 修正：maintenanceDiff 负值表示电车省，正值表示电车贵
    // 电车年运营 = 电费 + (保险基础费+insuranceDiff) + (维保基础+maintenanceDiff)
    // 对比油车差值 = insuranceDiff + maintenanceDiff（正=电贵，负=电省）
    const evExtra = insuranceDiff + maintenanceDiff; // 电车相对油车运营额外支出/节省
    const fuelTotalFinal = fuelTotalPurchase + y * annualFuelCost;
    const evTotalFinal = evTotalPurchase + y * (annualElecCost + evExtra);

    yearlyDataClean.push({
      year: y,
      fuelTotal: Math.round(fuelTotalFinal),
      evTotal: Math.round(evTotalFinal),
      saving: Math.round(fuelTotalFinal - evTotalFinal),
    });
  }

  // 精确回本年数（找交叉点）
  let preciseBreakEven = null;
  for (let i = 1; i < yearlyDataClean.length; i++) {
    const prev = yearlyDataClean[i - 1];
    const curr = yearlyDataClean[i];
    if (prev.saving <= 0 && curr.saving > 0) {
      // 线性插值
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

  // ===== 成本构成（年度，电车 vs 油车）=====
  const fuelAnnualBreakdown = {
    energy: Math.round(annualFuelCost),
    insurance: Math.round(8000),    // 假设油车基准保险8000
    maintenance: Math.round(5000),  // 假设油车基准维保5000
  };
  const evAnnualBreakdown = {
    energy: Math.round(annualElecCost),
    insurance: Math.round(8000 + insuranceDiff),
    maintenance: Math.round(5000 + maintenanceDiff),
  };

  return {
    // 购车基础信息（供明细展示用）
    fuelCarPrice,
    evCarPrice,
    chargerInstallCost,
    fuelPurchaseTax: Math.round(fuelPurchaseTax),
    fuelTotalPurchase: Math.round(fuelTotalPurchase),
    evTotalPurchase: Math.round(evTotalPurchase),
    purchaseDiff: Math.round(purchaseDiff),

    // 年度节省
    annualFuelCost: Math.round(annualFuelCost),
    annualElecCost: Math.round(annualElecCost),
    annualEnergySaving: Math.round(annualEnergySaving),
    annualNetSaving: Math.round(annualNetSaving),

    // 回本
    breakEvenYear: preciseBreakEven,

    // 多年数据
    yearlyData: yearlyDataClean,
    saving5yr: Math.round(saving5yr),
    saving10yr: Math.round(saving10yr),

    // 成本构成
    fuelAnnualBreakdown,
    evAnnualBreakdown,

    // 判断是否划算
    isWorthIt: preciseBreakEven !== null && preciseBreakEven <= 8,
  };
}

/**
 * 格式化货币
 */
export function formatMoney(amount, showSign = false) {
  const abs = Math.abs(amount);
  let str;
  if (abs >= 10000) {
    str = (abs / 10000).toFixed(1) + '万';
  } else {
    str = abs.toLocaleString('zh-CN');
  }
  if (showSign) {
    return (amount >= 0 ? '+' : '-') + '¥' + str;
  }
  return '¥' + str;
}

/**
 * 格式化回本年数
 */
export function formatBreakEven(years) {
  if (years === null) return '无法回本';
  if (years === 0) return '立即省钱';
  if (years < 1) return `约${Math.round(years * 12)}个月`;
  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  if (m === 0) return `${y}年`;
  return `${y}年${m}个月`;
}
