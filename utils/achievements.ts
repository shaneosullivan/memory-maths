import { Achievement, AchievementType, Operation, Profile, SessionStats } from '../types';

export function getAchievementType(totalQuestions: number): AchievementType | null {
  if (totalQuestions <= 9) {
    return 'bronze';
  }
  if (totalQuestions <= 15) {
    return 'silver';
  }
  if (totalQuestions === 19) {
    return 'gold';
  }
  return null;
}

export function checkForNewAchievements(
  profile: Profile,
  sessionStats: SessionStats
): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  // Only award achievements for test phase with 100% accuracy
  if (sessionStats.phase !== 'test' || sessionStats.mistakes > 0) {
    return newAchievements;
  }

  const achievementType = getAchievementType(sessionStats.totalQuestions);
  if (!achievementType) {
    return newAchievements;
  }

  // Check if user already has this achievement for this operation and base number
  const hasExistingAchievement = profile.achievements.some(
    achievement => 
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
      earnedAt: new Date()
    };
    newAchievements.push(achievement);
  }

  // Check for rainbow achievement (gold in all 4 operations for same base number)
  if (achievementType === 'gold') {
    const operations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
    const hasGoldInAllOperations = operations.every(operation => {
      // Check if user has gold for this operation and base number
      return profile.achievements.some(achievement => 
        achievement.operation === operation &&
        achievement.baseNumber === sessionStats.baseNumber &&
        achievement.type === 'gold'
      ) || (operation === sessionStats.operation); // Include current session
    });

    if (hasGoldInAllOperations) {
      // Check if user already has rainbow for this base number
      const hasRainbow = profile.achievements.some(
        achievement => 
          achievement.type === 'rainbow' &&
          achievement.baseNumber === sessionStats.baseNumber
      );

      if (!hasRainbow) {
        const rainbowAchievement: Achievement = {
          id: `rainbow-${sessionStats.baseNumber}-${Date.now()}`,
          type: 'rainbow',
          operation: 'all',
          baseNumber: sessionStats.baseNumber,
          totalQuestions: 19, // Rainbow is always for maximum questions
          earnedAt: new Date()
        };
        newAchievements.push(rainbowAchievement);
      }
    }
  }

  return newAchievements;
}

export function getAchievementCounts(achievements: Achievement[]) {
  return {
    bronze: achievements.filter(a => a.type === 'bronze').length,
    silver: achievements.filter(a => a.type === 'silver').length,
    gold: achievements.filter(a => a.type === 'gold').length,
    rainbow: achievements.filter(a => a.type === 'rainbow').length
  };
}

export function groupAchievementsByOperation(achievements: Achievement[]) {
  const grouped = {
    rainbow: achievements.filter(a => a.type === 'rainbow'),
    addition: achievements.filter(a => a.operation === 'addition'),
    subtraction: achievements.filter(a => a.operation === 'subtraction'),
    multiplication: achievements.filter(a => a.operation === 'multiplication'),
    division: achievements.filter(a => a.operation === 'division')
  };

  return grouped;
}