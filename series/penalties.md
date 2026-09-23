# 赛事处罚

处罚文件为可选文件，存放在 `series/<slug>/penalties/<roundId>.json`。原始 `series/<slug>/eventresult-*.json` 文件保持不变。

每个处罚文件包含一个 `penalties` 数组。车手通过 iRacing 的 `cust_id` 标识，在处罚文件中以字符串形式填写：

```json
{
  "penalties": [
    {
      "type": "position",
      "driverId": "123456",
      "positions": 2,
      "reason": "Causing a collision"
    },
    {
      "type": "points",
      "driverId": "234567",
      "points": 5,
      "reason": "Post-race penalty"
    },
    {
      "type": "disqualification",
      "driverId": "345678",
      "reason": "Technical infringement"
    }
  ]
}
```

字段含义：

- `position`：车手在正式成绩中后退 `positions` 个名次，然后再计算积分。
- `points`：从该轮的锦标赛积分中扣除 `points` 分。
- `disqualification`：取消该轮比赛资格；该车手排在已分类车手之后，且该轮获得零积分，包括杆位和最快圈奖励积分。
- `reason`：可选的处罚原因。示例中的英文原因仅为演示；页面会原样显示文件中填写的文字。
