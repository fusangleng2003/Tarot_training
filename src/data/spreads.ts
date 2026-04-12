import type { SpreadLayout } from "../types/tarot";

export const spreadLayouts: SpreadLayout[] = [
  {
    id: "single",
    name: "单牌占卜",
    description: "最简单的牌阵，抽一张牌获取今日指引或对一个问题的核心回答。适合每日练习和快速解答。",
    positions: [
      {
        index: 0,
        label: "核心指引",
        description: "这张牌代表了当前最需要关注的核心信息和能量。",
        x: 50,
        y: 50,
      },
    ],
  },
  {
    id: "three-card",
    name: "三张牌阵",
    description:
      "最经典的入门牌阵，用三张牌分别代表过去、现在和未来。练习如何将多张牌的含义串联成一个连贯的故事。",
    positions: [
      {
        index: 0,
        label: "过去",
        description: "影响你当前处境的过去事件、经历或能量。它是如何把你带到现在的？",
        x: 20,
        y: 50,
      },
      {
        index: 1,
        label: "现在",
        description: "你当前所处的核心状态和面临的主要能量。你现在正在经历什么？",
        x: 50,
        y: 50,
      },
      {
        index: 2,
        label: "未来",
        description: "如果继续当前的道路，可能的发展方向和结果。",
        x: 80,
        y: 50,
      },
    ],
  },
  {
    id: "celtic-cross",
    name: "凯尔特十字",
    description:
      "最全面的经典牌阵，用10张牌从多个维度深入分析一个复杂的问题。包括核心、挑战、潜意识、过去、可能性、未来、自我认知、环境、希望与恐惧、最终结果。",
    positions: [
      {
        index: 0,
        label: "核心",
        description: "当前处境的核心——你问的问题或面临的根本主题。",
        x: 30,
        y: 50,
      },
      {
        index: 1,
        label: "挑战",
        description: "横跨核心的力量——当前最大的挑战或需要克服的障碍。",
        x: 30,
        y: 50,
      },
      {
        index: 2,
        label: "潜意识",
        description: "潜意识中影响你的深层因素，你可能没有意识到的根源。",
        x: 30,
        y: 80,
      },
      {
        index: 3,
        label: "过去",
        description: "最近的过去——刚刚发生或正在消退的影响力量。",
        x: 10,
        y: 50,
      },
      {
        index: 4,
        label: "可能性",
        description: "最好的可能结果——如果一切顺利，你能达到的最高点。",
        x: 30,
        y: 20,
      },
      {
        index: 5,
        label: "近未来",
        description: "即将发生的事情——在接下来的短期内会影响你的能量。",
        x: 50,
        y: 50,
      },
      {
        index: 6,
        label: "自我认知",
        description: "你如何看待自己在这个情况中的角色和态度。",
        x: 70,
        y: 80,
      },
      {
        index: 7,
        label: "外部环境",
        description: "周围环境和他人对你的影响，外部的能量和态度。",
        x: 70,
        y: 60,
      },
      {
        index: 8,
        label: "希望与恐惧",
        description: "你内心最深处的希望或恐惧——它们往往是一体两面。",
        x: 70,
        y: 40,
      },
      {
        index: 9,
        label: "最终结果",
        description: "综合所有因素后，事情最可能的发展方向和结果。",
        x: 70,
        y: 20,
      },
    ],
  },
];

export const getSpreadById = (id: string) => spreadLayouts.find((s) => s.id === id);
