import { useState } from 'react';
import { DEFAULT_VALUES, US_PRESETS } from '../../data/cityPrices';
import './InputPanel.css';

const STEPS = ['驾驶情况', '能源价格', '车辆成本'];

function SliderField({ label, value, min, max, step, unit, onChange, hint }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
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
            key={String(opt.value)}
            type="button"
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

  const handlePresetChange = (idx) => {
    const preset = US_PRESETS[idx];
    setForm(prev => ({
      ...prev,
      presetIndex: idx,
      fuelPrice: preset.fuelPrice,
      electricityPrice: prev.useHomeCharging ? preset.homeElectricityPrice : preset.publicChargingPrice,
    }));
  };

  const handleChargingToggle = (useHome) => {
    const preset = US_PRESETS[form.presetIndex];
    setForm(prev => ({
      ...prev,
      useHomeCharging: useHome,
      electricityPrice: useHome ? preset.homeElectricityPrice : preset.publicChargingPrice,
    }));
  };

  const canNext = step < STEPS.length - 1;
  const isLast = step === STEPS.length - 1;

  const handleSubmit = () => {
    onCalculate(form);
  };

  return (
    <div className="input-panel">
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

      <div className="step-content animate-fade-in-up" key={step}>
        {step === 0 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">里程</span>
              <div>
                <h2>你的驾驶情况</h2>
                <p>先输入每年开多少，以及现在车辆的油耗表现。</p>
              </div>
            </div>

            <SliderField
              label="年度行驶里程"
              value={form.annualMileage}
              min={3000}
              max={40000}
              step={500}
              unit="英里/年"
              onChange={set('annualMileage')}
              hint={`约每天 ${Math.round(form.annualMileage / 365)} 英里`}
            />

            <SliderField
              label="当前油车油耗"
              value={form.fuelEfficiency}
              min={10}
              max={60}
              step={1}
              unit="MPG"
              onChange={set('fuelEfficiency')}
              hint="如果知道真实平均油耗，请优先填写真实数据。"
            />

            <ToggleField
              label="主要驾驶场景"
              value={form.drivingType}
              onChange={set('drivingType')}
              options={[
                { value: 'city', label: '城市' },
                { value: 'mixed', label: '混合' },
                { value: 'highway', label: '高速' },
              ]}
            />
          </div>
        )}

        {step === 1 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">费率</span>
              <div>
                <h2>能源价格</h2>
                <p>选择一个地区预设，再按你的实际账单微调。</p>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">地区预设</span>
              <select
                value={form.presetIndex}
                onChange={e => handlePresetChange(Number(e.target.value))}
              >
                {US_PRESETS.map((preset, i) => (
                  <option key={preset.label} value={i}>{preset.label}</option>
                ))}
              </select>
            </div>

            <SliderField
              label="汽油价格"
              value={form.fuelPrice}
              min={2}
              max={7}
              step={0.05}
              unit="$/gal"
              onChange={set('fuelPrice')}
            />

            <ToggleField
              label="充电方式"
              value={form.useHomeCharging}
              onChange={handleChargingToggle}
              options={[
                { value: true, label: '家充' },
                { value: false, label: '公共快充' },
              ]}
            />

            <SliderField
              label={form.useHomeCharging ? '家用电价' : '公共充电价格'}
              value={form.electricityPrice}
              min={0.08}
              max={0.65}
              step={0.01}
              unit="$/kWh"
              onChange={set('electricityPrice')}
              hint={form.useHomeCharging ? '可参考电费账单或分时电价。' : '可填写你常用快充站的平均价格。'}
            />

            <SliderField
              label="电车能耗"
              value={form.evConsumption}
              min={20}
              max={55}
              step={1}
              unit="kWh/100 mi"
              onChange={set('evConsumption')}
              hint="多数现代电车约为每 100 英里 25-35 kWh。"
            />
          </div>
        )}

        {step === 2 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">成本</span>
              <div>
                <h2>车辆与持有成本</h2>
                <p>把购车差价、补贴、保险和保养差异一并算进去。</p>
              </div>
            </div>

            <SliderField
              label="油车购车价格"
              value={form.gasCarPrice}
              min={10000}
              max={90000}
              step={1000}
              unit="$"
              onChange={set('gasCarPrice')}
            />

            <SliderField
              label="电车购车价格"
              value={form.evCarPrice}
              min={10000}
              max={100000}
              step={1000}
              unit="$"
              onChange={set('evCarPrice')}
            />

            <SliderField
              label="电车补贴 / 税收抵免"
              value={form.evIncentives}
              min={0}
              max={15000}
              step={500}
              unit="$"
              onChange={set('evIncentives')}
              hint="填写你预计可获得的联邦、州、能源公司或经销商补贴。"
            />

            <SliderField
              label="家用充电桩安装"
              value={form.chargerInstallCost}
              min={0}
              max={5000}
              step={100}
              unit="$"
              onChange={set('chargerInstallCost')}
              hint="如果主要依赖公共充电，可设为 0。"
            />

            <SliderField
              label="年度保险差异"
              value={form.insuranceDiff}
              min={-1000}
              max={2500}
              step={50}
              unit="$/yr"
              onChange={set('insuranceDiff')}
              hint={form.insuranceDiff >= 0 ? `电车保险每年约多 $${form.insuranceDiff}。` : `电车保险每年约省 $${Math.abs(form.insuranceDiff)}。`}
            />

            <SliderField
              label="年度保养差异"
              value={form.maintenanceDiff}
              min={-2500}
              max={1500}
              step={50}
              unit="$/yr"
              onChange={set('maintenanceDiff')}
              hint={form.maintenanceDiff <= 0 ? `电车保养每年约省 $${Math.abs(form.maintenanceDiff)}。` : `电车保养每年约多 $${form.maintenanceDiff}。`}
            />
          </div>
        )}
      </div>

      <div className="nav-buttons">
        {step > 0 && (
          <button
            id="btn-prev"
            type="button"
            className="btn-secondary"
            onClick={() => setStep(s => s - 1)}
          >
            上一步
          </button>
        )}
        {canNext && (
          <button
            id="btn-next"
            type="button"
            className="btn-primary"
            onClick={() => setStep(s => s + 1)}
          >
            下一步
          </button>
        )}
        {isLast && (
          <button
            id="btn-calculate"
            type="button"
            className="btn-calculate"
            onClick={handleSubmit}
          >
            <span className="btn-calculate-icon">$</span>
            计算电车节省
          </button>
        )}
      </div>
    </div>
  );
}
