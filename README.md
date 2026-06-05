# 电车省钱计算器

一个移动端优先的电车与油车成本对比工具，面向美国用车场景，页面已中文化。

当前 MVP 免费、无需登录，并且完全在浏览器端计算。它会估算：

- 电车回本时间
- 年度净节省或净增加
- 5 年与 10 年累计变化
- 油费与电费对比
- 补贴、税收抵免和充电桩安装对前期成本的影响

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

- 这个中文页面仍使用美国市场单位和成本模型，包括美元、英里、MPG 和 kWh。
- 电车补贴由用户手动输入，因为联邦、州、能源公司和车型资格规则经常变化。
- 当前版本不包含登录、会员、付费弹窗或使用次数限制。
