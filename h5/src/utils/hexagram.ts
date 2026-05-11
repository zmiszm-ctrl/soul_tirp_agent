/**
 * 六十四卦映射表
 * key: 6位二进制字符串 (从下到上, 1=阳 0=阴)
 * value: { name: 卦名, symbol: 卦符号, meaning: 卦辞 }
 */

export interface HexagramInfo {
  name: string;
  symbol: string;
  meaning: string;
  travelHint: string; // 旅行提示，影响旅行规划
}

// 八卦基础符号
const TRIGRAM_SYMBOLS: Record<string, string> = {
  '111': '☰', // 乾
  '000': '☷', // 坤
  '100': '☳', // 震
  '010': '☵', // 坎
  '001': '☶', // 艮
  '011': '☴', // 巽
  '101': '☲', // 离
  '110': '☱', // 兑
};

// 64卦完整映射表 - key为从下到上的6位阴阳(1=阳,0=阴)
const HEXAGRAM_MAP: Record<string, HexagramInfo> = {
  '111111': { name: '乾', symbol: '☰☰', meaning: '元亨利贞', travelHint: '利在出行，前路光明' },
  '000000': { name: '坤', symbol: '☷☷', meaning: '元亨，利牝马之贞', travelHint: '宜慢行，顺其自然' },
  '100000': { name: '屯', symbol: '☳☷', meaning: '元亨利贞，勿用有攸往', travelHint: '旅途有阻，需耐心等待' },
  '010001': { name: '蒙', symbol: '☵☶', meaning: '亨，匪我求童蒙', travelHint: '迷茫中寻路，需要指引' },
  '111010': { name: '需', symbol: '☰☵', meaning: '有孚，光亨', travelHint: '等待时机，美景在前' },
  '010111': { name: '讼', symbol: '☵☰', meaning: '有孚，窒惕', travelHint: '不宜远行，近处有景' },
  '000010': { name: '师', symbol: '☷☵', meaning: '贞，丈人吉', travelHint: '结伴同行更佳' },
  '010000': { name: '比', symbol: '☵☷', meaning: '吉，原筮元永贞', travelHint: '寻一处静谧之地' },
  '111011': { name: '小畜', symbol: '☰☴', meaning: '亨，密云不雨', travelHint: '小有收获，近郊为宜' },
  '110111': { name: '履', symbol: '☱☰', meaning: '履虎尾，不咥人', travelHint: '虽有险阻，大胆前行' },
  '111000': { name: '泰', symbol: '☰☷', meaning: '小往大来，吉亨', travelHint: '大吉之日，宜远行' },
  '000111': { name: '否', symbol: '☷☰', meaning: '否之匪人', travelHint: '不宜出行，静待其变' },
  '101111': { name: '同人', symbol: '☲☰', meaning: '同人于野，亨', travelHint: '约友同行，共享美景' },
  '111101': { name: '大有', symbol: '☰☲', meaning: '元亨', travelHint: '收获丰盈，宜探索新境' },
  '001000': { name: '谦', symbol: '☶☷', meaning: '亨，君子有终', travelHint: '低调出行，意外之喜' },
  '000100': { name: '豫', symbol: '☷☳', meaning: '利建侯行师', travelHint: '欢乐之旅，宜往山林' },
  '100110': { name: '随', symbol: '☳☱', meaning: '元亨利贞', travelHint: '随性而行，路在脚下' },
  '011001': { name: '蛊', symbol: '☴☶', meaning: '元亨，利涉大川', travelHint: '破旧立新，宜寻古镇' },
  '110000': { name: '临', symbol: '☱☷', meaning: '元亨利贞', travelHint: '亲临其境，近水为佳' },
  '000011': { name: '观', symbol: '☷☴', meaning: '盥而不荐', travelHint: '静观其变，适合登高' },
  '101001': { name: '噬嗑', symbol: '☲☳', meaning: '亨，利用狱', travelHint: '排除障碍，果断出发' },
  '100101': { name: '贲', symbol: '☳☲', meaning: '亨，小利有攸往', travelHint: '文化之旅，宜访古迹' },
  '000001': { name: '剥', symbol: '☷☶', meaning: '不利有攸往', travelHint: '不宜远行，近处休整' },
  '100010': { name: '复', symbol: '☳☷', meaning: '亨，出入无疾', travelHint: '重返旧地，别有新意' },
  '111001': { name: '无妄', symbol: '☰☳', meaning: '元亨利贞', travelHint: '顺天而行，不可强求' },
  '100111': { name: '大畜', symbol: '☶☰', meaning: '利贞，不家食吉', travelHint: '积蓄力量，宜远行' },
  '100001': { name: '颐', symbol: '☶☳', meaning: '贞吉，观颐自求口实', travelHint: '养生之旅，宜往山间' },
  '011110': { name: '大过', symbol: '☴☱', meaning: '栋桡，利有攸往', travelHint: '非常之行，需有魄力' },
  '010010': { name: '坎', symbol: '☵☵', meaning: '有孚，维心亨', travelHint: '险中求胜，宜往水边' },
  '101101': { name: '离', symbol: '☲☲', meaning: '利贞，亨', travelHint: '光明在前，宜向阳而行' },
  '001110': { name: '咸', symbol: '☶☱', meaning: '亨利贞，取女吉', travelHint: '心有所感，情旅为佳' },
  '011100': { name: '恒', symbol: '☴☳', meaning: '亨，无咎，利贞', travelHint: '持之以恒，长线旅行' },
  '001111': { name: '遁', symbol: '☶☰', meaning: '亨，小利贞', travelHint: '退而远行，避世为宜' },
  '111100': { name: '大壮', symbol: '☰☳', meaning: '利贞', travelHint: '气势正旺，宜大胆出行' },
  '000101': { name: '晋', symbol: '☷☲', meaning: '康侯用锡马蕃庶', travelHint: '进取之路，宜向东行' },
  '101000': { name: '明夷', symbol: '☲☷', meaning: '利艰贞', travelHint: '暗夜行路，需谨慎' },
  '101011': { name: '家人', symbol: '☲☴', meaning: '利女贞', travelHint: '家人同行，温馨之旅' },
  '110101': { name: '睽', symbol: '☱☲', meaning: '小事吉', travelHint: '独行亦佳，异路逢景' },
  '001010': { name: '蹇', symbol: '☶☵', meaning: '利西南，不利东北', travelHint: '路途多艰，宜往南方' },
  '010100': { name: '解', symbol: '☵☳', meaning: '利西南', travelHint: '困境已解，宜往西行' },
  '110001': { name: '损', symbol: '☱☶', meaning: '有孚，元吉', travelHint: '简约出行，轻装上路' },
  '100011': { name: '益', symbol: '☳☴', meaning: '利有攸往，利涉大川', travelHint: '增益之旅，大有裨益' },
  '111110': { name: '夬', symbol: '☰☱', meaning: '扬于王庭', travelHint: '果断抉择，择一而行' },
  '011111': { name: '姤', symbol: '☴☰', meaning: '女壮，勿用取女', travelHint: '偶遇之缘，莫错失良机' },
  '000110': { name: '萃', symbol: '☷☱', meaning: '亨，王假有庙', travelHint: '汇聚之地，宜往人烟处' },
  '011000': { name: '升', symbol: '☴☷', meaning: '元亨，用见大人', travelHint: '步步高升，宜登山远眺' },
  '010110': { name: '困', symbol: '☵☱', meaning: '亨贞，大人吉', travelHint: '虽困有路，静待转机' },
  '011010': { name: '井', symbol: '☴☵', meaning: '改邑不改井', travelHint: '深探当地，必有发现' },
  '101110': { name: '革', symbol: '☲☱', meaning: '己日乃孚', travelHint: '改变路线，别有洞天' },
  '011101': { name: '鼎', symbol: '☱☲', meaning: '元吉，亨', travelHint: '稳固前行，美食之旅' },
  '100100': { name: '震', symbol: '☳☳', meaning: '亨，震来虩虩', travelHint: '变数中行，惊喜在前' },
  '001001': { name: '艮', symbol: '☶☶', meaning: '艮其背，不获其身', travelHint: '止步沉思，宜静不宜动' },
  '001011': { name: '渐', symbol: '☴☶', meaning: '女归吉，利贞', travelHint: '循序渐进，慢慢探索' },
  '110110': { name: '归妹', symbol: '☱☳', meaning: '征凶，无攸利', travelHint: '近处为佳，不宜远行' },
  '101100': { name: '丰', symbol: '☲☳', meaning: '亨，王假之', travelHint: '丰盛之旅，大有所获' },
  '001101': { name: '旅', symbol: '☶☲', meaning: '小亨，旅贞吉', travelHint: '旅卦当值，正宜出行' },
  '011011': { name: '巽', symbol: '☴☴', meaning: '小亨，利有攸往', travelHint: '随风而行，宜往水边' },
  '110011': { name: '兑', symbol: '☱☱', meaning: '亨，利贞', travelHint: '愉悦之旅，宜往湖海' },
  '010011': { name: '涣', symbol: '☵☴', meaning: '亨，王假有庙', travelHint: '涣散烦忧，出行散心' },
  '110010': { name: '节', symbol: '☱☵', meaning: '亨，苦节不可贞', travelHint: '适度出行，量力而行' },
  '110100': { name: '中孚', symbol: '☱☶', meaning: '豚鱼吉，利涉大川', travelHint: '诚心出行，路途顺遂' },
  '001100': { name: '小过', symbol: '☶☳', meaning: '亨利贞，可小事', travelHint: '小有超越，短途为宜' },
  '101010': { name: '既济', symbol: '☲☵', meaning: '亨小，利贞', travelHint: '万事俱备，宜速出发' },
  '010101': { name: '未济', symbol: '☵☲', meaning: '亨，小狐汔济', travelHint: '未竟之途，仍有期待' },
};

/**
 * 解读卦象
 * @param lines 从下到上的6个爻，true=阳 false=阴
 */
export function interpretHexagram(lines: boolean[]): HexagramInfo {
  const key = lines.map((l) => (l ? '1' : '0')).join('');
  return (
    HEXAGRAM_MAP[key] || {
      name: '未知卦象',
      symbol: '≟',
      meaning: '卦象未明',
      travelHint: '随缘出行',
    }
  );
}

/**
 * 随机生成6爻
 */
export function generateRandomLines(): boolean[] {
  return Array.from({ length: 6 }, () => Math.random() > 0.5);
}

/**
 * 浙江省目的地城市列表（按方向分组）
 */
export const ZHEJIANG_DESTINATIONS: Record<string, Array<{ name: string; lngLat: [number, number] }>> = {
  east: [
    { name: '嵊泗', lngLat: [122.45, 30.73] },
    { name: '象山', lngLat: [121.87, 29.48] },
    { name: '宁海', lngLat: [121.43, 29.87] },
    { name: '舟山', lngLat: [122.11, 30.01] },
  ],
  south: [
    { name: '丽水', lngLat: [119.92, 28.47] },
    { name: '仙居', lngLat: [120.73, 28.85] },
    { name: '永嘉', lngLat: [120.69, 28.15] },
    { name: '缙云', lngLat: [120.09, 28.97] },
    { name: '温岭', lngLat: [121.36, 28.37] },
  ],
  west: [
    { name: '安吉', lngLat: [119.68, 30.68] },
    { name: '桐庐', lngLat: [119.69, 29.79] },
    { name: '开化', lngLat: [118.41, 29.13] },
    { name: '临安', lngLat: [119.72, 30.24] },
    { name: '千岛湖', lngLat: [119.04, 29.61] },
  ],
  north: [
    { name: '德清', lngLat: [119.97, 30.53] },
    { name: '长兴', lngLat: [119.91, 31.02] },
    { name: '南浔', lngLat: [120.42, 30.89] },
    { name: '莫干山', lngLat: [119.87, 30.60] },
  ],
  any: [
    { name: '诸暨', lngLat: [120.24, 29.72] },
    { name: '磐安', lngLat: [120.44, 29.06] },
    { name: '新昌', lngLat: [120.90, 29.49] },
    { name: '天台', lngLat: [121.01, 29.14] },
  ],
};

/**
 * 根据方向偏好随机选择目的地
 */
export function selectDestination(direction: string): { name: string; lngLat: [number, number] } {
  const allDests = [
    ...(ZHEJIANG_DESTINATIONS[direction] || []),
    ...ZHEJIANG_DESTINATIONS.any,
  ];
  return allDests[Math.floor(Math.random() * allDests.length)];
}
