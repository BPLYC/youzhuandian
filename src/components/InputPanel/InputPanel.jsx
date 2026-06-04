import { useState } from 'react';
import { DEFAULT_VALUES, US_PRESETS } from '../../data/cityPrices';
import './InputPanel.css';

const STEPS = ['Driving', 'Energy', 'Vehicle costs'];

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
              <span className="step-icon">Miles</span>
              <div>
                <h2>Your driving pattern</h2>
                <p>Start with how much and how you drive.</p>
              </div>
            </div>

            <SliderField
              label="Annual mileage"
              value={form.annualMileage}
              min={3000}
              max={40000}
              step={500}
              unit="mi/yr"
              onChange={set('annualMileage')}
              hint={`About ${Math.round(form.annualMileage / 365)} miles per day`}
            />

            <SliderField
              label="Current gas mileage"
              value={form.fuelEfficiency}
              min={10}
              max={60}
              step={1}
              unit="MPG"
              onChange={set('fuelEfficiency')}
              hint="Use your real-world average if you know it."
            />

            <ToggleField
              label="Main use case"
              value={form.drivingType}
              onChange={set('drivingType')}
              options={[
                { value: 'city', label: 'City' },
                { value: 'mixed', label: 'Mixed' },
                { value: 'highway', label: 'Highway' },
              ]}
            />
          </div>
        )}

        {step === 1 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">Rates</span>
              <div>
                <h2>Energy prices</h2>
                <p>Pick a preset, then fine-tune the numbers.</p>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">State preset</span>
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
              label="Gas price"
              value={form.fuelPrice}
              min={2}
              max={7}
              step={0.05}
              unit="$/gal"
              onChange={set('fuelPrice')}
            />

            <ToggleField
              label="Charging"
              value={form.useHomeCharging}
              onChange={handleChargingToggle}
              options={[
                { value: true, label: 'Home' },
                { value: false, label: 'Public' },
              ]}
            />

            <SliderField
              label={form.useHomeCharging ? 'Home electricity rate' : 'Public charging rate'}
              value={form.electricityPrice}
              min={0.08}
              max={0.65}
              step={0.01}
              unit="$/kWh"
              onChange={set('electricityPrice')}
              hint={form.useHomeCharging ? 'Use your utility bill or time-of-use rate.' : 'Use your typical fast-charging price.'}
            />

            <SliderField
              label="EV efficiency"
              value={form.evConsumption}
              min={20}
              max={55}
              step={1}
              unit="kWh/100 mi"
              onChange={set('evConsumption')}
              hint="Most modern EVs land around 25-35 kWh per 100 miles."
            />
          </div>
        )}

        {step === 2 && (
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-icon">Cost</span>
              <div>
                <h2>Vehicle costs</h2>
                <p>Include incentives and ownership differences.</p>
              </div>
            </div>

            <SliderField
              label="Gas vehicle price"
              value={form.gasCarPrice}
              min={10000}
              max={90000}
              step={1000}
              unit="$"
              onChange={set('gasCarPrice')}
            />

            <SliderField
              label="EV price"
              value={form.evCarPrice}
              min={10000}
              max={100000}
              step={1000}
              unit="$"
              onChange={set('evCarPrice')}
            />

            <SliderField
              label="EV incentives / credits"
              value={form.evIncentives}
              min={0}
              max={15000}
              step={500}
              unit="$"
              onChange={set('evIncentives')}
              hint="Enter federal, state, utility, or dealer incentives you expect to qualify for."
            />

            <SliderField
              label="Home charger install"
              value={form.chargerInstallCost}
              min={0}
              max={5000}
              step={100}
              unit="$"
              onChange={set('chargerInstallCost')}
              hint="Set to 0 if you will rely on public charging."
            />

            <SliderField
              label="Yearly insurance difference"
              value={form.insuranceDiff}
              min={-1000}
              max={2500}
              step={50}
              unit="$/yr"
              onChange={set('insuranceDiff')}
              hint={form.insuranceDiff >= 0 ? `EV insurance costs about $${form.insuranceDiff} more per year.` : `EV insurance saves about $${Math.abs(form.insuranceDiff)} per year.`}
            />

            <SliderField
              label="Yearly maintenance difference"
              value={form.maintenanceDiff}
              min={-2500}
              max={1500}
              step={50}
              unit="$/yr"
              onChange={set('maintenanceDiff')}
              hint={form.maintenanceDiff <= 0 ? `EV maintenance saves about $${Math.abs(form.maintenanceDiff)} per year.` : `EV maintenance costs about $${form.maintenanceDiff} more per year.`}
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
            Back
          </button>
        )}
        {canNext && (
          <button
            id="btn-next"
            type="button"
            className="btn-primary"
            onClick={() => setStep(s => s + 1)}
          >
            Next
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
            Calculate EV savings
          </button>
        )}
      </div>
    </div>
  );
}
