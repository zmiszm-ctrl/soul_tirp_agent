import type { TripPreferences, TravelPlan, TravelDirection, TravelStyle } from '@/types';

interface DestinationData {
  name: string;
  subtitle: string;
  description: string;
  image: string;
  direction: TravelDirection;
  moments: Array<{
    time: string;
    title: string;
    description: string;
    image: string;
  }>;
  atmosphere: string;
  bgm: { title: string; artist: string; description: string };
}

const DIRECTION_LABELS: Record<TravelDirection, string> = {
  east: '利在东行',
  south: '利向南下',
  west: '利往西去',
  north: '利往北走',
  any: '四方皆宜',
};

const DESTINATIONS: DestinationData[] = [
  {
    name: '安吉',
    subtitle: '一个适合慢下来的地方',
    description: '你会在三小时后抵达。那里没有人等你，也没有人催你。只有风，和刚刚好的时间。',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    direction: 'west',
    moments: [
      { time: '清晨 6:40', title: '在空无一人的竹林里散步', description: '晨雾还未散尽，竹叶上的露珠偶尔坠落', image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&q=80' },
      { time: '午后', title: '一家没有菜单的咖啡店', description: '老板只做他想做的那一杯，你只管慢慢喝', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
      { time: '傍晚 18:30', title: '在湖边看日落发呆', description: '太阳落得很慢，像你此刻的心情', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
    ],
    atmosphere: '竹林清风，慢下来的勇气',
    bgm: { title: 'Mystery of Love', artist: 'Sufjan Stevens', description: '像夏日午后的一场白日梦' },
  },
  {
    name: '桐庐',
    subtitle: '富春山水的另一面',
    description: '沿着富春江一直开，直到手机没信号。那时候，你就到了。',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    direction: 'west',
    moments: [
      { time: '上午 9:00', title: '在老桥上看雾气升起', description: '江水很慢，慢到能看见时间', image: 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=400&q=80' },
      { time: '中午', title: '村里唯一的面馆', description: '老板娘记得每一个客人的口味', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' },
      { time: '夜晚', title: '没有路灯的村口', description: '抬头就是银河，像小时候那样', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80' },
    ],
    atmosphere: '山水画卷，隐居者的诗',
    bgm: { title: 'River Flows in You', artist: 'Yiruma', description: '如江水般温柔的钢琴曲' },
  },
  {
    name: '丽水',
    subtitle: '云深不知处',
    description: '缙云仙都的雾还没散，古堰画乡的船已经靠岸。有人在等风，有人在等你。',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    direction: 'south',
    moments: [
      { time: '清晨', title: '梯田上的云海', description: '站在高处，看云从脚下流过', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80' },
      { time: '下午', title: '画乡的老樟树下', description: '当地的老人说，这棵树有三百年了', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80' },
      { time: '黄昏', title: '溪边的石板路', description: '赤脚行走，感受来自山里的凉意', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=80' },
    ],
    atmosphere: '云海仙境，遗世独立的宁静',
    bgm: { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', description: '像云一样自由的旋律' },
  },
  {
    name: '嵊泗',
    subtitle: '东海尽头的小岛',
    description: '坐船四十分钟，把手机调成飞行模式。海风吹过的时候，所有的烦恼都会掉海里。',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
    direction: 'east',
    moments: [
      { time: '凌晨 5:30', title: '在灯塔旁等日出', description: '海平面从墨蓝变成橘红，只要十分钟', image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80' },
      { time: '中午', title: '渔村里的海鲜面', description: '刚上岸的小海鲜，只需白灼', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80' },
      { time: '傍晚', title: '沿着环岛路散步', description: '左侧是悬崖，右侧是太平洋', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
    ],
    atmosphere: '海风咸湿，自由的尽头',
    bgm: { title: 'Ocean Eyes', artist: 'Billie Eilish', description: '深海蓝调，适合听海的时候' },
  },
  {
    name: '德清',
    subtitle: '莫干山的清晨与黄昏',
    description: '有人说莫干山太有名了。但清晨六点的竹林小径，只属于醒得最早的那个人。',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    direction: 'north',
    moments: [
      { time: '清晨 6:00', title: '竹林里的瑜伽', description: '不需要垫子，落叶就是大自然的地毯', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80' },
      { time: '午后', title: '民国老别墅的下午茶', description: '百年前，这里住过徐志摩的朋友', image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&q=80' },
      { time: '夜晚', title: '民宿天台看星星', description: '没有霓虹灯的地方，星星特别亮', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80' },
    ],
    atmosphere: '竹海清风，民国旧梦',
    bgm: { title: 'La La Land', artist: 'Justin Hurwitz', description: '适合在山间公路开车时听' },
  },
  {
    name: '仙居',
    subtitle: '神仙居住的地方',
    description: '神仙居的雾散了又聚。你站在玻璃栈道上，下面是万丈深渊，心里却出奇地平静。',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    direction: 'south',
    moments: [
      { time: '上午', title: '乘缆车穿越云海', description: '山在脚下，云在腰间', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
      { time: '中午', title: '杨梅树下野餐', description: '如果是六月，杨梅刚好熟透', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
      { time: '傍晚', title: '淡竹原始森林', description: '溪水很浅，可以赤脚走完全程', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=80' },
    ],
    atmosphere: '云中漫步，与山对话',
    bgm: { title: 'Experience', artist: 'Ludovico Einaudi', description: '宏大而宁静，适合面对大山时听' },
  },
  {
    name: '开化',
    subtitle: '钱江源的源头',
    description: '浙江的母亲河从这里出发。你溯流而上，直到找到那条最清的小溪。',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    direction: 'west',
    moments: [
      { time: '清晨', title: '源头第一缕阳光', description: '水是甜的，空气也是', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80' },
      { time: '午后', title: '古田山自然保护区', description: '千年古杉树下，时间静止了', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&q=80' },
      { time: '夜晚', title: '农家院的萤火虫', description: '七八月的夜晚，它们会点亮整条溪谷', image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80' },
    ],
    atmosphere: '源头活水，回归本真',
    bgm: { title: 'Spring Day', artist: 'BTS', description: '像春天一样充满希望的声音' },
  },
  {
    name: '象山',
    subtitle: '渔港的黄昏与晨曦',
    description: '中国渔村不只是一个名字。凌晨四点的鱼市，有一百种你叫不上名字的海鲜。',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    direction: 'east',
    moments: [
      { time: '凌晨 4:30', title: '石浦渔港的鱼市', description: '渔民刚刚归来，鱼还带着海水的味道', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80' },
      { time: '午后', title: '松兰山沙滩', description: '不是三亚，但沙子同样细', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
      { time: '傍晚', title: '渔火点点的港湾', description: '渔船归港，灯火像星星落在海面', image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80' },
    ],
    atmosphere: '渔火晚唱，海的味道',
    bgm: { title: 'Señorita', artist: 'Shawn Mendes', description: '轻松的海风旋律' },
  },
  {
    name: '永嘉',
    subtitle: '楠溪江边的古村落',
    description: '楠溪江流了上千年，芙蓉村、苍坡村还保持着宋代的格局。时间是这里最不值钱的东西。',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    direction: 'south',
    moments: [
      { time: '上午', title: '竹筏漂流', description: '艄公不说话，只有竹篙划破水面的声音', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=80' },
      { time: '中午', title: '古村落的麦饼', description: '当地老奶奶用柴火灶烤的', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' },
      { time: '下午', title: '丽水街的老茶馆', description: '一壶茶，一下午，一条老街', image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&q=80' },
    ],
    atmosphere: '古村悠悠，时光倒流',
    bgm: { title: 'Canon in D', artist: 'Pachelbel', description: '经典的旋律，永恒的村落' },
  },
  {
    name: '缙云',
    subtitle: '仙都的云雾与烧饼',
    description: '鼎湖峰的倒影在水里，老农牵着牛从桥上走过。这不是画，这是缙云的早晨。',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    direction: 'south',
    moments: [
      { time: '清晨', title: '鼎湖峰的晨雾', description: '摄影师称之为"天然的山水大片"', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80' },
      { time: '中午', title: '缙云烧饼', description: '梅干菜肉的香气，能飘三条街', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' },
      { time: '傍晚', title: '朱潭山的晚霞', description: '夕阳把水面染成金色', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
    ],
    atmosphere: '仙气缭绕，人间烟火',
    bgm: { title: 'Clair de Lune', artist: 'Debussy', description: '月光般的温柔，适合仙都的夜晚' },
  },
];

const DISTANCE_RANGES = ['198km', '220km', '256km', '178km', '289km', '234km', '312km', '267km', '245km', '198km'];
const DURATION_RANGES = ['2小时40分钟', '3小时12分钟', '2小时55分钟', '3小时45分钟', '2小时18分钟', '3小时30分钟', '4小时10分钟', '3小时05分钟', '2小时50分钟', '2小时35分钟'];
const TIME_RANGES = ['周六 06:30', '明天 08:00', '午后 13:00', '清晨 05:30', '周日 07:00', '周六 14:00', '明天 06:00', '周日 09:30', '周六 11:00', '明天 15:00'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function filterByDirection(destinations: DestinationData[], direction: TravelDirection): DestinationData[] {
  if (direction === 'any') return destinations;
  const filtered = destinations.filter((d) => d.direction === direction);
  return filtered.length > 0 ? filtered : destinations;
}

function filterByHistory(destinations: DestinationData[], history: TravelPlan[]): DestinationData[] {
  const historyNames = new Set(history.map((h) => h.destination.name));
  const filtered = destinations.filter((d) => !historyNames.has(d.name));
  return filtered.length > 0 ? filtered : destinations;
}

export function generateMockPlan(
  preferences: TripPreferences,
  history: TravelPlan[] = []
): TravelPlan {
  const filteredByDir = filterByDirection(DESTINATIONS, preferences.direction);
  const available = filterByHistory(filteredByDir, history);

  const dest = getRandomItem(available);
  const idx = DESTINATIONS.findIndex((d) => d.name === dest.name);

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    destination: {
      id: `dest_${dest.name}`,
      name: dest.name,
      subtitle: dest.subtitle,
      description: dest.description,
      distance: DISTANCE_RANGES[idx % DISTANCE_RANGES.length],
      duration: DURATION_RANGES[idx % DURATION_RANGES.length],
      suggestedTime: TIME_RANGES[idx % TIME_RANGES.length],
      image: dest.image,
      directionLabel: DIRECTION_LABELS[preferences.direction],
    },
    moments: dest.moments.map((m, i) => ({
      id: `moment_${dest.name}_${i}`,
      time: m.time,
      title: m.title,
      description: m.description,
      image: m.image,
    })),
    bgm: dest.bgm,
    atmosphere: dest.atmosphere,
    createdAt: Date.now(),
  };
}
