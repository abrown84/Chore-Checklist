import { useMemo } from 'react'
import { UserStats } from '../types/user'
import { LEVELS } from '../types/chore'

interface UseUserProgressProps {
  userStats: UserStats | undefined
}

export const useUserProgress = ({ userStats }: UseUserProgressProps) => {
  const progressData = useMemo(() => {
    if (!userStats) {
      return {
        currentLevelData: LEVELS[0],
        nextLevelData: undefined,
        progressToNextLevel: 100,
        pointsToNextLevel: 0,
        isMaxLevel: true,
      }
    }

    const currentLevelData = LEVELS.find((level) => level.level === userStats.currentLevel)
    const nextLevelData = LEVELS.find((level) => level.level === (userStats.currentLevel || 1) + 1)

    if (!nextLevelData) {
      return {
        currentLevelData,
        nextLevelData: undefined,
        progressToNextLevel: 100,
        pointsToNextLevel: 0,
        isMaxLevel: true,
      }
    }

    const progressToNextLevel = nextLevelData
      ? ((userStats.earnedPoints - (currentLevelData?.pointsRequired || 0)) /
          (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) *
        100
      : 100

    const pointsToNextLevel = Math.max(nextLevelData.pointsRequired - userStats.earnedPoints, 0)

    return {
      currentLevelData,
      nextLevelData,
      progressToNextLevel: Math.min(Math.max(progressToNextLevel, 0), 100),
      pointsToNextLevel,
      isMaxLevel: false,
    }
  }, [userStats])

  return progressData
}
