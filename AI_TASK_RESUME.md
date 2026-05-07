# 油换电计算器 — AI 接力文档（下一个对话请先读这个）

> 最后更新：2026-05-07（第四次对话 - 项目主流程已全部打通，现进入维护与拓展阶段）  
> ⚠️ **新对话的 AI：请先完整读完本文件再开始工作，所有上下文都在这里**

---

## 一、项目概览

**项目路径**：`d:\youzhuandian\`  
**技术栈**：React + Vite（前端）+ Cloudflare Workers（后端验证）+ Cloudflare Pages（托管）  
**变现方式**：爱发电赞助，两种方案：
  - ¥5/月 → 月会员（30天无限次计算）
  - ¥2.99 → 次数包（3次计算，永不过期）
**本地运行**：`cd d:\youzhuandian && npm run dev` → 访问 `http://localhost:5173`

---

## 二、已完成的工作 ✅（核心业务流程已闭环）

### 2.1 前端代码

| 文件 | 说明 | 状态 |
|------|------|------|
| `src/App.jsx` | 主应用、状态机、会员/次数包徽章 | ✅ |
| `src/App.css` | 全局样式、月会员金色徽章 + 次数包蓝绿徽章 | ✅ |
| `src/hooks/useUsageTracker.js` | 月会员 + 次数包双模式状态管理 | ✅ |
| `src/components/PaymentModal/PaymentModal.jsx` | 双方案卡片 UI（¥5月会员 + ¥2.99次数包） | ✅ |
| `src/components/PaymentModal/PaymentModal.css` | 弹窗样式，含 plan-card 方案卡片样式 | ✅ |

### 2.2 后端代码

| 文件 | 说明 | 状态 |
|------|------|------|
| `worker/index.js` | 爱发电 API 验证（ifdian.net），按金额区分方案类型 | ✅ 已部署 |
| `worker/wrangler.toml` | Worker 配置 | ✅ |
| `.env.local` | `VITE_WORKER_URL` 已设置 | ✅ |

### 2.3 Cloudflare 基础设施

| 步骤 | 状态 | 详情 |
|------|------|------|
| Worker 部署 | ✅ | Version: `75d55f87-4038-44b3-bfa6-ed9d552a2eca` |
| Pages 部署 | ✅ | `https://youzhuandian.pages.dev` |

### 2.4 核心修复与迭代记录

| # | 修复内容 |
|---|---------|
| 1 | ResultDashboard 充电桩安装费显示 ¥0 的逻辑错误 |
| 2 | calculator.js 死代码块清理及返回值补全 |
| 3 | 会员有效期徽章加入页头 |
| 4 | 爱发电链接最终修正为国内镜像 `ifdian.net/a/bp1532` |
| 5 | Worker API 验证域名曾改为 `ifdian.net` / `afdian.net` 导致被拦截超时 |
| 6 | 将 Worker API 域名改回官方 `afdian.com`，解决后端查询报错问题 |
| 7 | **新增 Pages Proxy 解决国内屏蔽问题**：由于 `.workers.dev` 域名在国内（GFW）常被污染导致前端报“网络错误”，已在项目中增加 `functions/api/verify-order.js`，通过 Pages 同源域名转发请求到 Worker 完美解决此问题！ |
| 8 | 新增双变现方案：¥2.99次数包（3次计算）与 ¥5月会员共存 |

---

## 三、业务逻辑说明

### 计算权限判断（App.jsx handleCalculate）
```
首次计算 → 免费（canCalculateFree）
→ 有月会员 OR 次数包剩余 → 直接计算（canCalculatePaid）
  → 次数包优先消耗（recordCalculation 内部逻辑）
→ 否则 → 弹出支付弹窗
```

### Worker 方案判断（worker/index.js）
```
订单金额 >= ¥5  → plan_type: 'monthly'，expires_at = 30天后，calc_count = null
订单金额 >= ¥2.99 → plan_type: 'count'，expires_at = null，calc_count = 3
订单金额 < ¥2.99  → 拒绝，返回错误
```

### localStorage 存储
- `ev_calc_usage`：总计算次数 + 是否用过首次免费
- `ev_calc_member`：月会员到期时间戳
- `ev_calc_count`：次数包剩余次数 `{ remaining, total, activatedAt }`

### 顶部徽章显示
- 月会员：⭐ 会员至X月X日（金色）
- 次数包（无月会员）：🔢 剩X次（蓝绿色）

---

## 四、关键凭证

| 项目 | 值 |
|------|-----|
| Cloudflare 账号邮箱 | `Bplyc666@gmail.com` |
| Cloudflare 账号 ID | `15e414e884403c823cc0e72196ea425d` |
| Cloudflare API Token | `cfut_Lnh9ticle02B3B22c8JRqzuMZHM42iMt3JXX0Xpt44a6d9ae` |
| Worker URL | `https://ev-calc-worker.evcalc.workers.dev` |
| Pages 生产域名 | `https://youzhuandian.pages.dev` |
| KV 命名空间 ID | `f61ed85f4d084169bc8d2258d853154b` |
| 爱发电 User ID | `ecc168343df711f18e9352540025c377` |
| 爱发电 API Token | `8sFb3nWhSjqKDyvHQR6wEgMYfNp4eUaC` |
| 爱发电创作者主页 | `https://ifdian.net/a/bp1532` |

---

## 五、重新部署命令（快速参考）

```powershell
# 重新部署前端
cd d:\youzhuandian
npm run build
$env:CLOUDFLARE_API_TOKEN = "cfut_Lnh9ticle02B3B22c8JRqzuMZHM42iMt3JXX0Xpt44a6d9ae"
wrangler pages deploy dist --project-name=youzhuandian --branch=main

# 重新部署 Worker
cd d:\youzhuandian\worker
$env:CLOUDFLARE_API_TOKEN = "cfut_Lnh9ticle02B3B22c8JRqzuMZHM42iMt3JXX0Xpt44a6d9ae"
wrangler deploy
```

---

## 六、第五次迭代任务清单与实施计划（等待用户确认）

用户提出了四个具体需求，以下是分析与解决计划：

### 📝 需求 1：网页标题修改
- **问题**：当前标题不够长，且不能突出核心疑问“油车换电车划算吗”。
- **计划**：修改 `index.html` 的 `<title>` 标签，改为 `油车换电车划算吗？— 换车回本计算器`，并同步更新 `og:title` 方便微信分享。

### 📱 需求 2：手机端结果页绿色省钱框超出屏幕
- **问题**：在手机端（特别是小屏手机），ResultDashboard 中展示油电差价的 `.energy-compare` 容器使用了固定单行 flex，导致右侧的绿色省钱 badge 被挤出屏幕。
- **计划**：修改 `src/components/ResultDashboard/ResultDashboard.css`，为 `.energy-compare` 增加 `flex-wrap: wrap;` 和自适应换行，确保小屏下可以优雅折行而不溢出。

### 🔒 需求 3：订单号复用逻辑漏洞
- **问题**：当前无论购买 3 次包还是月度会员，使用后如果换浏览器或重新输入，后端虽然返回了 `already_used: true`，但前端依然会累加次数或刷新有效期。这意味着一个订单号可以被无限次刷。
- **计划**：修改 `worker/index.js` 中的逻辑。如果一个订单已被激活（存在于 KV 中），将直接报错拒绝（`{"ok": false, "msg": "该订单号已被使用，无法重复激活"}`），从根本上堵住“一单多刷”的漏洞。

### 🔗 需求 4：微信浏览器跳转外部浏览器的状态同步问题
- **问题**：因为堵住了订单复用漏洞，当用户在微信浏览器激活后，为了保存截图而跳转到外部浏览器（如 Safari/Chrome）时，由于 localStorage 不互通，用户会丢失状态且**无法再次使用原订单号激活**！
- **计划（无账号体系的最优解）**：开发一套“临时会话转移”功能，并且**无缝融合到“保存截图”流程中**：
  1. **后端扩展**：在 Worker 中新增 `/api/export-session` 和 `/api/import-session` 接口。
  2. **导出机制 (UI 无痕体验)**：当用户在微信内点击“保存截图”时，前端检测到微信环境，自动调用后端将当前的会员/次数包状态暂存到 KV（设置 5 分钟过期时间），并生成一个唯一 Token。
  3. **链接生成**：前端生成带 Token 的 URL（如 `?sync=uuid_xxx`）并复制到剪贴板，同时弹窗提示用户“微信内无法保存截图，已复制无损同步链接，请在外部浏览器打开”。
  4. **导入机制**：用户在外部浏览器打开该链接，前端检测到 `sync` 参数，自动请求后端读取并销毁 Token，将权益状态写入新浏览器的 localStorage 中，用户即可继续截图操作。
  5. **UI 还原**：保留了原有的“分享给朋友”按钮，同步机制只在必要（微信截图）时触发。

---

> **给用户的提示**：我已将计划写入文档。如果您对上述关于【跨浏览器同步状态】和【彻底封死订单复用】的解决方案满意，请回复“确认”，我将立即开始编写和部署代码！
