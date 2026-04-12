// 阶段三：知识体系数据

export interface ElementInfo {
  id: string;
  name: string;
  nameEn: string;
  suit: string;
  suitName: string;
  traits: string[];
  theme: string;
  color: string;
  description: string;
}

export interface NumberMeaning {
  number: number;
  name: string;
  theme: string;
  description: string;
  suits: {
    wands: string;
    cups: string;
    swords: string;
    pentacles: string;
  };
}

export interface CourtRole {
  rank: string;
  rankEn: string;
  maturity: string;
  description: string;
  traits: string[];
}

export const elements: ElementInfo[] = [
  {
    id: "fire",
    name: "火",
    nameEn: "Fire",
    suit: "wands",
    suitName: "权杖",
    traits: ["行动", "热情", "创造力", "意志力", "灵感"],
    theme: "权杖牌组关注的是行动、创造和激情。它代表着我们的动力、雄心和创意火花。",
    color: "#e85d3a",
    description:
      "火元素代表着生命的原始能量——热情、冲动、创造力和行动力。火能温暖人心，也能焚毁一切。在塔罗中，火元素通过权杖花色来表现。权杖牌关注的主题包括事业、创意项目、冒险和个人成长。火元素的人通常充满活力、有领导力，但也可能冲动和急躁。",
  },
  {
    id: "water",
    name: "水",
    nameEn: "Water",
    suit: "cups",
    suitName: "圣杯",
    traits: ["情感", "直觉", "关系", "潜意识", "疗愈"],
    theme: "圣杯牌组关注的是情感、关系和内心世界。它代表着我们的感受、爱和直觉。",
    color: "#4a90d9",
    description:
      "水元素代表着情感的深度和流动——爱、直觉、潜意识和疗愈。水能滋润万物，也能淹没一切。在塔罗中，水元素通过圣杯花色来表现。圣杯牌关注的主题包括爱情、友情、家庭关系和情感成长。水元素的人通常富有同理心和直觉力，但也可能过度敏感。",
  },
  {
    id: "air",
    name: "风",
    nameEn: "Air",
    suit: "swords",
    suitName: "宝剑",
    traits: ["思维", "沟通", "真相", "理性", "分析"],
    theme: "宝剑牌组关注的是思维、沟通和真相。它代表着我们的思想、判断和决策。",
    color: "#f0d85c",
    description:
      "风元素代表着思维的力量——理性分析、清晰沟通、真相追求和智慧决策。风能带来清新，也能制造风暴。在塔罗中，风元素通过宝剑花色来表现。宝剑牌关注的主题包括冲突、决策、真相和精神挑战。风元素的人通常思维敏捷、善于分析，但也可能过于冷酷或焦虑。",
  },
  {
    id: "earth",
    name: "土",
    nameEn: "Earth",
    suit: "pentacles",
    suitName: "星币",
    traits: ["物质", "稳定", "实际", "财富", "健康"],
    theme: "星币牌组关注的是物质世界、工作和财务。它代表着我们的身体、金钱和实际事务。",
    color: "#5daa68",
    description:
      "土元素代表着物质世界的稳定力量——金钱、健康、工作和实际事务。土地能承载万物，也能束缚脚步。在塔罗中，土元素通过星币花色来表现。星币牌关注的主题包括财务、职业、教育和身体健康。土元素的人通常务实可靠，但也可能过于保守或物质主义。",
  },
];

export const numberMeanings: NumberMeaning[] = [
  {
    number: 1,
    name: "王牌 / Ace",
    theme: "开始 · 潜力 · 种子",
    description: "1 是一切的起点，代表纯粹的潜力和新的开始。每个花色的王牌都是那个元素能量最纯净的形式。",
    suits: {
      wands: "创意的火花，新项目的灵感",
      cups: "新的感情，爱的种子",
      swords: "清晰的新想法，突破性的洞见",
      pentacles: "新的机会，物质层面的开始",
    },
  },
  {
    number: 2,
    name: "二",
    theme: "选择 · 平衡 · 二元性",
    description: "2 代表二元对立和选择。当单一的能量分成两个方向，你需要做出选择或找到平衡。",
    suits: {
      wands: "规划和做决策，展望未来",
      cups: "伙伴关系，两人之间的连接",
      swords: "两难困境，僵持和回避",
      pentacles: "多任务平衡，灵活应对",
    },
  },
  {
    number: 3,
    name: "三",
    theme: "成长 · 创造 · 表达",
    description: "3 代表创造和扩展。两个元素的结合产生了第三个——成果开始显现，社群开始形成。",
    suits: {
      wands: "拓展和领导，前景光明",
      cups: "友谊和庆祝，社交欢聚",
      swords: "心碎和悲伤，痛苦的真相",
      pentacles: "团队合作，技艺的精进",
    },
  },
  {
    number: 4,
    name: "四",
    theme: "稳定 · 基础 · 休整",
    description: "4 代表稳定和结构。就像四条腿的桌子，提供坚实的基础。但过度的稳定也可能变成停滞。",
    suits: {
      wands: "庆祝里程碑，家庭和谐",
      cups: "情感倦怠，忽视机会",
      swords: "必要的休息，恢复精力",
      pentacles: "守财和安全感，控制欲",
    },
  },
  {
    number: 5,
    name: "五",
    theme: "挑战 · 冲突 · 变化",
    description: "5 打破了 4 的稳定，带来了不可避免的挑战和变化。虽然不舒适，但冲突是成长的催化剂。",
    suits: {
      wands: "竞争和冲突，多方角力",
      cups: "悲伤和失去，聚焦负面",
      swords: "胜之不武，关系破裂",
      pentacles: "困难和贫困，寻求帮助",
    },
  },
  {
    number: 6,
    name: "六",
    theme: "和谐 · 恢复 · 给予",
    description: "6 是在 5 的冲突之后找到的和谐与平衡。它代表着恢复、慷慨和人际间的互助。",
    suits: {
      wands: "胜利和荣耀，获得认可",
      cups: "怀旧和童心，纯真的记忆",
      swords: "过渡和离开，走向平静",
      pentacles: "慷慨给予，公平分配",
    },
  },
  {
    number: 7,
    name: "七",
    theme: "反思 · 考验 · 内在力量",
    description: "7 是精神层面的数字，代表着内在的考验和深层的反思。真正的力量在这里被考验和锻造。",
    suits: {
      wands: "坚守立场，面对挑战",
      cups: "幻想和诱惑，选择过多",
      swords: "欺骗和策略，独自行动",
      pentacles: "等待收获，评估投入",
    },
  },
  {
    number: 8,
    name: "八",
    theme: "力量 · 行动 · 掌控",
    description: "8 代表着掌控和力量的运用。是主动出击还是被动受困？关键在于你如何运用自己的力量。",
    suits: {
      wands: "快速行动，势如破竹",
      cups: "主动离开，寻找意义",
      swords: "自我限制，思维陷阱",
      pentacles: "精进技艺，匠心打磨",
    },
  },
  {
    number: 9,
    name: "九",
    theme: "接近完成 · 高峰 · 最后考验",
    description: "9 是个位数的最后一个，代表着即将完成和最后的高峰。成功或失败都在最后一刻。",
    suits: {
      wands: "坚韧不拔，最后的考验",
      cups: "心想事成，许愿成真",
      swords: "焦虑和恐惧，深夜噩梦",
      pentacles: "丰收和独立，自给自足",
    },
  },
  {
    number: 10,
    name: "十",
    theme: "完成 · 极限 · 新周期",
    description: "10 是一个周期的终结。能量达到了顶峰和极限，旧的循环即将结束，为新的开始铺路。",
    suits: {
      wands: "重担和责任，承受极限",
      cups: "家庭幸福，情感圆满",
      swords: "彻底终结，触底反弹",
      pentacles: "传承和基业，世代积累",
    },
  },
];

export const courtRoles: CourtRole[] = [
  {
    rank: "侍从",
    rankEn: "Page",
    maturity: "学生 / 初学者",
    description:
      "侍从代表着学习和探索的开始阶段。他们充满好奇心、热情和初学者的能量。也可能代表一个消息或新的开始。",
    traits: ["好奇心", "学习热情", "初生之犊", "带来消息"],
  },
  {
    rank: "骑士",
    rankEn: "Knight",
    maturity: "行动者 / 追求者",
    description:
      "骑士代表着积极的行动和追求。他们充满干劲和理想，但有时可能过于冲动或走极端。代表着该元素最活跃的能量。",
    traits: ["行动力", "追求理想", "勇敢冲锋", "可能极端"],
  },
  {
    rank: "王后",
    rankEn: "Queen",
    maturity: "内在掌握 / 滋养者",
    description:
      "王后代表着对该元素能量的内在掌握和成熟运用。她们以温柔而有力的方式运用自己的力量，滋养自己和他人。",
    traits: ["内在力量", "成熟智慧", "滋养他人", "直觉引导"],
  },
  {
    rank: "国王",
    rankEn: "King",
    maturity: "外在掌控 / 领导者",
    description:
      "国王代表着对该元素能量的完全掌控和外在表达。他们是经验丰富的领导者，以权威和远见运用力量。但也可能过度运用而走向负面。",
    traits: ["完全掌控", "领导权威", "经验丰富", "外在表达"],
  },
];

export const majorArcanaAstrology: Record<string, { zodiac?: string; planet?: string }> = {
  "major-00": { planet: "天王星" },
  "major-01": { planet: "水星" },
  "major-02": { planet: "月亮" },
  "major-03": { zodiac: "金牛座", planet: "金星" },
  "major-04": { zodiac: "白羊座" },
  "major-05": { zodiac: "金牛座" },
  "major-06": { zodiac: "双子座" },
  "major-07": { zodiac: "巨蟹座" },
  "major-08": { zodiac: "狮子座" },
  "major-09": { zodiac: "处女座" },
  "major-10": { planet: "木星" },
  "major-11": { zodiac: "天秤座" },
  "major-12": { planet: "海王星" },
  "major-13": { zodiac: "天蝎座" },
  "major-14": { zodiac: "射手座" },
  "major-15": { zodiac: "摩羯座" },
  "major-16": { planet: "火星" },
  "major-17": { zodiac: "水瓶座" },
  "major-18": { zodiac: "双鱼座" },
  "major-19": { planet: "太阳" },
  "major-20": { planet: "冥王星" },
  "major-21": { planet: "土星" },
};
