export type Sponsor = {
  name: string;
  logo: string;
  url?: string;
  order?: number;
};

// 示例内容：上线前请替换为真实赞助商；清空数组即可隐藏整个区域。
export const sponsors: Sponsor[] = [
  {
    name: 'DEMO · Apex',
    logo: '/sponsors/demo-apex.svg',
    order: 1,
  },
  {
    name: 'DEMO · Circuit',
    logo: '/sponsors/demo-circuit.svg',
    order: 2,
  },
  {
    name: 'DEMO · Grid',
    logo: '/sponsors/demo-grid.svg',
    order: 3,
  },
];
