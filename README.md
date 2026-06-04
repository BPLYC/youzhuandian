# EV vs Gas Savings Calculator

A mobile-first calculator for US drivers comparing gasoline vehicle and EV ownership costs.

The MVP is free and browser-only. It estimates:

- EV break-even time
- Annual net savings
- 5-year and 10-year cumulative savings
- Gas vs electricity costs
- Upfront cost impact from incentives and charger installation

## Tech Stack

- React 19
- Vite
- ECharts
- html2canvas
- Cloudflare Pages-ready static build

## Local Development

```powershell
npm install
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

## Verification

```powershell
npm run lint
npm run build
```

## Product Notes

- This English MVP targets US users.
- EV incentives are user-entered because federal, state, utility, and model-specific eligibility rules change frequently.
