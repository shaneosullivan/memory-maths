"use client";

import { useEffect } from "react";
import { Achievement } from "@/types";
import { groupAchievementsByOperation } from "@/utils/achievements";
import { Button } from "@/components/ui";
import styles from "./AchievementsDialog.module.css";

interface AchievementsDialogProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementsDialog({
  achievements,
  isOpen,
  onClose,
}: AchievementsDialogProps) {
  // Handle escape key to close dialog
  useEffect(() => {
    if (isOpen) {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groupedAchievements = groupAchievementsByOperation(achievements);

  const renderAchievementGrid = (
    achievements: Achievement[],
    title?: string
  ) => {
    if (achievements.length === 0) return null;

    return (
      <div className={styles.achievementGroup}>
        {title && <h4 className={styles.groupTitle}>{title}</h4>}
        <div className={styles.achievementGrid}>
          {achievements.map((achievement) => (
            <div key={achievement.id} className={styles.achievementItem}>
              <div className={styles.achievementMedal}>
                <img
                  src={`/images/${achievement.type}_medal_small.png`}
                  alt={`${achievement.type} medal`}
                  className={styles.medalImage}
                />
                <div className={styles.achievementNumber}>
                  {achievement.baseNumber}
                </div>
              </div>
              <div className={styles.achievementInfo}>
                <div className={styles.achievementDate}>
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Your Achievements</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {achievements.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No achievements yet!</p>
              <p>
                Complete a test with 100% accuracy to earn your first medal.
              </p>
            </div>
          ) : (
            <div className={styles.achievementsList}>
              {renderAchievementGrid(
                groupedAchievements.rainbow,
                "Master Achievements"
              )}
              {renderAchievementGrid(groupedAchievements.addition, "Addition")}
              {renderAchievementGrid(
                groupedAchievements.subtraction,
                "Subtraction"
              )}
              {renderAchievementGrid(
                groupedAchievements.multiplication,
                "Multiplication"
              )}
              {renderAchievementGrid(groupedAchievements.division, "Division")}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="primary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
