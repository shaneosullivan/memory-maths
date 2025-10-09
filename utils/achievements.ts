import { Achievement, AchievementType, Operation, Profile, SessionStats } from "../types";

export function getAchievementType(totalQuestions: number): AchievementType | null {
  if (totalQuestions <= 9) {
    return "bronze";
  }
  if (totalQuestions <= 15) {
    return "silver";
  }
  if (totalQuestions === 19) {
    return "gold";
  }
  return null;
}

export function checkForNewAchievements(
  profile: Profile,
  sessionStats: SessionStats
): Achievement[] {
  const newAchievements: Achievement[] = [];

  // Only award achievements for test phase with 100% accuracy
  if (sessionStats.phase !== "test" || sessionStats.mistakes > 0) {
    return newAchievements;
  }

  const achievementType = getAchievementType(sessionStats.totalQuestions);
  if (!achievementType) {
    return newAchievements;
  }

  // Check if user already has this achievement for this operation and base number
  const hasExistingAchievement = profile.achievements.some(
    (achievement) =>
      achievement.operation === sessionStats.operation &&
      achievement.baseNumber === sessionStats.baseNumber &&
      achievement.totalQuestions === sessionStats.totalQuestions
  );

  if (!hasExistingAchievement) {
    const achievement: Achievement = {
      id: `${sessionStats.operation}-${sessionStats.baseNumber}-${sessionStats.totalQuestions}-${Date.now()}`,
      type: achievementType,
      operation: sessionStats.operation,
      baseNumber: sessionStats.baseNumber,
      totalQuestions: sessionStats.totalQuestions,
      earnedAt: new Date(),
    };
    newAchievements.push(achievement);
  }

  // Check for rainbow achievement (100% accuracy on all 19 questions with time limit)
  // Rainbow can only be earned if user already has a gold achievement for this base number
  if (sessionStats.totalQuestions === 19) {
    // Check if user already has a gold achievement for this base number (any operation)
    const hasGoldForThisNumber = profile.achievements.some(
      (achievement) =>
        achievement.baseNumber === sessionStats.baseNumber && achievement.type === "gold"
    );

    if (hasGoldForThisNumber) {
      // Check if user already has rainbow for this base number
      const hasRainbow = profile.achievements.some(
        (achievement) =>
          achievement.type === "rainbow" && achievement.baseNumber === sessionStats.baseNumber
      );

      if (!hasRainbow) {
        const rainbowAchievement: Achievement = {
          id: `rainbow-${sessionStats.baseNumber}-${Date.now()}`,
          type: "rainbow",
          operation: "all",
          baseNumber: sessionStats.baseNumber,
          totalQuestions: 19,
          earnedAt: new Date(),
        };
        newAchievements.push(rainbowAchievement);
      }
    }
  }

  return newAchievements;
}

export function getAchievementCounts(achievements: Achievement[]) {
  return {
    bronze: achievements.filter((a) => a.type === "bronze").length,
    silver: achievements.filter((a) => a.type === "silver").length,
    gold: achievements.filter((a) => a.type === "gold").length,
    rainbow: achievements.filter((a) => a.type === "rainbow").length,
  };
}

export function groupAchievementsByOperation(achievements: Achievement[]) {
  const grouped = {
    rainbow: achievements.filter((a) => a.type === "rainbow"),
    addition: achievements.filter((a) => a.operation === "addition"),
    subtraction: achievements.filter((a) => a.operation === "subtraction"),
    multiplication: achievements.filter((a) => a.operation === "multiplication"),
    division: achievements.filter((a) => a.operation === "division"),
  };

  return grouped;
}

/**
 * Check if the rainbow timer should be shown for this test session
 * Timer is only shown if:
 * 1. User has a gold achievement for this base number
 * 2. Test has all 19 questions
 * 3. User doesn't already have a rainbow for this base number
 */
export function shouldShowRainbowTimer(
  profile: Profile | null,
  baseNumber: number,
  totalQuestions: number
): boolean {
  if (!profile || totalQuestions !== 19) {
    return false;
  }

  // Check if user has gold for this base number
  const hasGold = profile.achievements.some(
    (achievement) => achievement.baseNumber === baseNumber && achievement.type === "gold"
  );

  if (!hasGold) {
    return false;
  }

  // Check if user already has rainbow for this base number
  const hasRainbow = profile.achievements.some(
    (achievement) => achievement.type === "rainbow" && achievement.baseNumber === baseNumber
  );

  return !hasRainbow;
}
