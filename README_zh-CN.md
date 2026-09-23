# LeagueHub - iRacing 联赛排行榜

[English](README.md) | **简体中文**

LeagueHub 是一个开箱即用的 iRacing 联赛网站模板。它基于 Astro 构建静态页面：配置站点和赛事、放入 iRacing 比赛结果后，即可生成自己的联赛网站，无需为每场比赛编写页面。

模板已实现：

- **联赛首页**：展示系列赛、最新赛果和接下来的比赛。
- **系列赛页面**：展示赛程、锦标赛积分榜、最新比赛结果及可选的赛事介绍。
- **比赛结果页面**：分别展示正赛、排位赛和练习赛成绩，并统计杆位、最快圈等数据。
- **自动计算积分**：按可配置的积分规则汇总车手成绩，支持名次调整、扣分和取消资格等处罚。
- **多赛事与静态构建**：新增系列赛只需添加配置和数据；构建时自动生成导航及对应页面。

仓库附带已完赛和未开赛两种虚拟示例，安装依赖后即可预览。要用于自己的联赛，请替换示例赛事，并修改站点信息、积分规则和比赛数据。

## 快速开始

需要 Node.js 22.12.0 或更新版本。

```bash
npm install
npm run dev
```

打开终端输出的本地地址，即可查看示例网站。准备自己的联赛时，先修改 `config/site.ts` 中的站点信息，再参照 `series/demo-gt3/` 或 `series/demo-upcoming/` 添加赛事配置和赛程；比赛结束后放入原始 iRacing 结果文件，并在对应轮次关联它。各文件的作用见下文。

运行检查并构建静态网站：

```bash
npm run check
npm run build
```

构建产物位于 `dist/`。可用 `npm run preview` 在本地预览构建结果。`npm run build` 本身也会先执行 Astro 检查。

## 数据与配置放在哪里

| 路径 | 用途 |
| --- | --- |
| `config/site.ts` | 站点名称、Logo、赛季、语言区域、重点色及表格默认展示列 |
| `config/points.ts` | 共享的名次积分、杆位和最快圈奖励规则 |
| `series/<slug>/config.ts` | 系列赛名称、路由、积分规则及可选的展示覆盖和 Logo |
| `series/<slug>/series.json` | 车辆组别 `carClass` 与按顺序排列的赛程 `rounds` |
| `series/<slug>/info.md` | 可选的赛事介绍和规则说明，仅用于展示 |
| `series/<slug>/eventresult-*.json` | 未经修改的 iRacing 比赛结果 API 响应 |
| `series/<slug>/penalties/<roundId>.json` | 可选的该轮赛事仲裁决定 |

系列赛的 `config.ts` 默认导出配置，包含 `id`、`name`、`shortName`、`slug` 和 `pointsSystem`；`slug` 必须与目录名相同，`pointsSystem` 必须引用 `config/points.ts` 中的键。可用 `display` 覆盖全站表格展示选项。比赛结果行不应手工写入配置。

Logo 资源放在 `public/series/`，在系列赛配置中使用站点根路径（如 `logo: '/series/demo-gt3.svg'`）。它会显示在首页赛事列表和系列赛页头；未配置时显示文字。全站顶部导航始终使用文字。

`info.md` 可写联盟宗旨、报名条件、赛制、车辆、奖励、直播和规则。存在该文件时，系列赛页面自动显示“赛事信息”及页内导航。用于计算的积分规则或条件仍须写在结构化配置中，不能只写在介绍文字里。

### 赛程与结果文件

`series.json` 中每轮可通过 `resultFile` 引用同目录下的原始结果文件，填写文件名时**不带 `.json`**。例如：

```json
{
  "carClass": "DEMO GT3 · 虚拟数据",
  "rounds": [
    {
      "id": "round-1",
      "round": 1,
      "name": "DEMO Round 01 · Spa-Francorchamps",
      "track": "Spa-Francorchamps",
      "layout": "Grand Prix",
      "date": "2026-07-05T10:00:00Z",
      "resultFile": "eventresult-demo-01"
    }
  ]
}
```

未举行的轮次不要填写 `resultFile`；赛程中第一轮没有结果的比赛会被视为下一场比赛。替换或增加结果文件后，重新构建即可更新正式成绩、积分榜、赛事进度和首页内容，无需手工整理结果。

### 处罚文件

仲裁决定放在 `series/<slug>/penalties/<roundId>.json`，原始结果文件保持不变。支持名次后退、扣除积分和取消资格；完整 JSON 格式见 [赛事处罚说明](series/penalties.md)。

名次调整及取消资格在计算积分前生效。取消资格的车手该轮得零分（包括杆位和最快圈奖励），其圈速也不参与官方最快圈及相应统计。

## 管理系列赛

### 添加

1. 新建 `series/<slug>/`，参照现有赛事添加默认导出的 `config.ts`，确保 `slug` 与目录名一致。需要 Logo 时，将资源放入 `public/series/` 并在配置中引用。
2. 添加 `series.json`，填写 `carClass` 和 `rounds`；需要介绍时添加 `info.md`。
3. 将已完成比赛的原始 `eventresult-*.json` 放入该目录，并在对应轮次设置 `resultFile`。如有处罚，再添加 `penalties/<roundId>.json`。
4. 运行 `npm run build`，检查生成的页面。

`src/lib/data.ts` 自动发现 `series/*/config.ts`；页面还会读取同目录可选的 `info.md`。导航、首页赛事列表、最新赛果、后续比赛、系列赛页和已有比赛的结果页均随构建生成，无需修改全局配置。

### 删除或归档

删除对应的 `series/<slug>/` 目录，或将其移到 `series/` 之外进行归档。下次构建时，该赛事的页面、首页内容和导航入口不再生成。

### 随仓库提供的示例

- `series/demo-gt3/`：**DEMO / 虚拟数据**，包含 12 轮模拟结果、每轮三个场次及独立处罚文件，用于验证页面、积分与处罚流程，不代表真实赛事。
- `series/demo-upcoming/`：**DEMO / 虚拟数据**，只有 6 轮已公布赛程，没有结果文件。用于验证未开赛时的进度、下一场比赛、空积分榜和“即将举行”赛程；此时不生成结果页或“比赛结果”页内导航。

## 结果如何生成

```text
原始 iRacing JSON → 适配器 → 处罚 → 正式正赛结果 → 积分 → 积分榜
```

`src/lib/iracing-adapter.ts` 解析 Practice（练习赛）、Qualifying（排位赛）和 Race（正赛）。只有正赛参与处罚、锦标赛积分及官方最快圈统计；排位赛数据还用于确定正赛杆位。练习赛和排位赛不会改变当前轮次或下一场比赛的判定。

适配器将 iRacing 的万分之一秒转换为显示文字和毫秒，将从零开始的有效名次转换为从一开始的名次（`-1` 仍表示无有效名次）。正赛保留发车和完赛名次、组别名次、领跑圈数、状态及原始退赛原因；计时场次保留车手、车号、赛车、最快圈和与场次最快圈的差距，无有效圈速显示“—”。车手以 iRacing `cust_id` 标识。

`getStaticPaths()` 根据自动发现的配置和赛程生成页面。默认结果地址 `/racing/<slug>/results/<roundId>` 展示正赛；有相应场次数据时，另生成 `/qualifying` 和 `/practice` 子页面。三个场次共用比赛页头与切换导航，正赛表还显示发车位。

主要实现位于 `src/lib/`：`data.ts` 串联数据加载，`penalties.ts` 处理处罚，`points.ts` 计算积分，`standings.ts` 汇总积分榜。`src/components/` 提供共用的导航、卡片、表格和结果页区块；`src/pages/` 定义首页、系列赛页及结果页路由。页面组件不直接依赖 iRacing API 字段。
