import { useState } from 'react';
import { CITY_PRICES, DEFAULT_VALUES } from '../../data/cityPrices';
import './InputPanel.css';

const STEPS = ['用车习惯', '能源价格', '购车参数'];

function SliderField({ label, value, min, max, step, unit, onChange, hint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="field-group">
      <div className="field-header">
        <span className="field-label">{label}</span>
        <div className="field-value-box">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(Number(e.target.value))}
          />
          <span className="field-unit">{unit}</span>
        </div>
      </div>
      <div className="slider-track-wrapper">
        <div
          className="slider-fill"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function ToggleField({ label, value, onChange, options }) {
  return (
    <div className="field-group">
      <span className="field-label">{label}</span>
      <div className="toggle-group">
        {options.map(opt => (
          <button
            key={opt.value}
            id={`toggle-${opt.value}`}
            className={`toggle-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InputPanel({ onCalculate }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_VALUES);

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleCityChange = (idx) => {
    const city = CITY_PRICES[idx];
    setForm(prev => ({
      ...prev,
      cityIndex: idx,
      fuelPrice: city.fuelPrice,
      elecPrice: prev.useHomeCharger ? city.valleyElecPrice : city.avgElecPrice,
    }));
  };

  const handleChargerToggle = (useHome) => {
    const city = CITY_PRICES[form.cityIndex];
    setForm(prev => ({
      ...prev,
      useHomeCharger: useHome,
      elecPrice: useHome ? city.valleyElecPrice : city.avgElecPrice,
    }));
  };

  const canNext = step < STEPS.length - 1;
  const isLast = step === STEPS.length - 1;

  const handleSubmit = () => {
    onCalculate(form);
  };

  return (
    <div className="input-panel">
      {/* 步骤指示器 */}
      <div className="steps-indicator">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => i < step && setStep(i)}
          >
            <div className="step-circle">
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="step-label">{s}</span>
          </div>
        ))}
        <div className="steps-line">
          <div className="steps-line-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* 步骤内容 */}
      <div className="step-content animate-fade-in-up" key={step}>
        {/* Step 0: 用车习惯 */}
        {step === 0 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">🚗</span>
              <div>
                <h2>您的用车习惯</h2>
                <p>告诉我您平时怎么开车</p>
              </div>
            </div>

            <SliderField
              label="年行驶里程"
              value={form.annualMileage}
              min={3000}
              max={60000}
              step={1000}
              unit="km"
              onChange={set('annualMileage')}
              hint={`约每天 ${Math.round(form.annualMileage / 365)} km`}
            />

            <SliderField
              label="当前油耗"
              value={form.fuelConsumption}
              min={4}
              max={18}
              step={0.5}
              unit="L/100km"
              onChange={set('fuelConsumption')}
              hint="不确定可查看行驶证或车辆参数"
            />

            <ToggleField
              label="主要用途"
              value={form.drivingType}
              onChange={set('drivingType')}
              options={[
                { value: 'city', label: '城市通勤' },
                { value: 'mixed', label: '均衡' },
                { value: 'highway', label: '长途为主' },
              ]}
            />
          </div>
        )}

        {/* Step 1: 能源价格 */}
        {step === 1 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">⚡</span>
              <div>
                <h2>能源价格</h2>
                <p>选择城市自动填入参考价格</p>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">所在城市</span>
              <select
                value={form.cityIndex}
                onChange={e => handleCityChange(Number(e.target.value))}
              >
                {CITY_PRICES.map((c, i) => (
                  <option key={i} value={i}>{c.city}</option>
                ))}
              </select>
            </div>

            <SliderField
              label="当前油价（92号）"
              value={form.fuelPrice}
              min={5}
              max={12}
              step={0.01}
              unit="元/升"
              onChange={set('fuelPrice')}
            />

            <ToggleField
              label="充电方式"
              value={form.useHomeCharger}
              onChange={handleChargerToggle}
              options={[
                { value: true, label: '家用充电桩（谷电）' },
                { value: false, label: '公共快充' },
              ]}
            />

            <SliderField
              label={form.useHomeCharger ? '谷电电价' : '综合电价'}
              value={form.elecPrice}
              min={0.2}
              max={1.5}
              step={0.01}
              unit="元/度"
              onChange={set('elecPrice')}
              hint={form.useHomeCharger ? '深夜充电谷电价，省钱最大化' : '公共充电桩综合价格'}
            />

            <SliderField
              label="电车百公里电耗"
              value={form.evConsumption}
              min={8}
              max={30}
              step={0.5}
              unit="度/100km"
              onChange={set('evConsumption')}
              hint="一般家用电车 12-20 度，可查目标车型参数"
            />
          </div>
        )}

        {/* Step 2: 购车参数 */}
        {step === 2 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">💰</span>
              <div>
                <h2>购车参数</h2>
                <p>填入您关注的车型价格</p>
              </div>
            </div>

            <SliderField
              label="当前油车价格"
              value={form.fuelCarPrice}
              min={50000}
              max={500000}
              step={5000}
              unit="元"
              onChange={set('fuelCarPrice')}
              hint={`+购置税 ≈ ${Math.round((form.fuelCarPrice / 1.13) * 0.1 / 100) * 100} 元`}
            />

            <SliderField
              label="目标电车价格（含补贴）"
              value={form.evCarPrice}
              min={50000}
              max={500000}
              step={5000}
              unit="元"
              onChange={set('evCarPrice')}
              hint="电车免购置税"
            />

            <SliderField
              label="充电桩安装费"
              value={form.chargerInstallCost}
              min={0}
              max={10000}
              step={500}
              unit="元"
              onChange={set('chargerInstallCost')}
              hint="公寓无法安装可设为 0"
            />

            <SliderField
              label="年保险差异"
              value={form.insuranceDiff}
              min={-3000}
              max={3000}
              step={100}
              unit="元/年"
              onChange={set('insuranceDiff')}
              hint={form.insuranceDiff >= 0 ? `电车保险每年贵 ${form.insuranceDiff} 元` : `电车保险每年省 ${Math.abs(form.insuranceDiff)} 元`}
            />

            <SliderField
              label="年维保差异"
              value={form.maintenanceDiff}
              min={-8000}
              max={2000}
              step={100}
              unit="元/年"
              onChange={set('maintenanceDiff')}
              hint={form.maintenanceDiff <= 0 ? `电车维保每年省 ${Math.abs(form.maintenanceDiff)} 元（无机油等）` : `电车维保每年贵 ${form.maintenanceDiff} 元`}
            />
          </div>
        )}
      </div>

      {/* 导航按钮 */}
      <div className="nav-buttons">
        {step > 0 && (
          <button
            id="btn-prev"
            className="btn-secondary"
            onClick={() => setStep(s => s - 1)}
          >
            ← 上一步
          </button>
        )}
        {canNext && (
          <button
            id="btn-next"
            className="btn-primary"
            onClick={() => setStep(s => s + 1)}
          >
            下一步 →
          </button>
        )}
        {isLast && (
          <button
            id="btn-calculate"
            className="btn-calculate"
            onClick={handleSubmit}
          >
            <span className="btn-calculate-icon">⚡</span>
            立即计算回本年数
          </button>
        )}
      </div>
    </div>
  );
}
