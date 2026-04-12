import { useMemo } from "react";
import type { LearningStage } from "../types/tarot";

export function useUnlock(learnedCount: number) {
  const currentStage: LearningStage = useMemo(() => {
    if (learnedCount >= 78) return 4;
    if (learnedCount >= 50) return 3;
    if (learnedCount >= 30) return 2;
    return 1;
  }, [learnedCount]);

  const isStageUnlocked = (stage: LearningStage) => currentStage >= stage;

  const stageInfo = [
    { stage: 1 as LearningStage, name: "牌意是根基", requirement: "初始可用", threshold: 0 },
    { stage: 2 as LearningStage, name: "牌阵是应用", requirement: "掌握 30 张牌", threshold: 30 },
    { stage: 3 as LearningStage, name: "体系是深度", requirement: "掌握 50 张牌", threshold: 50 },
    { stage: 4 as LearningStage, name: "进阶与风格", requirement: "掌握全部 78 张牌", threshold: 78 },
  ];

  const nextUnlock = stageInfo.find((s) => !isStageUnlocked(s.stage));

  return { currentStage, isStageUnlocked, stageInfo, nextUnlock };
}
