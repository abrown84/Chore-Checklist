import { useMemo } from 'react'
import { APP_CONFIG } from '../config/constants'

interface UseAnimationDelaysProps {
  baseDelay?: number
  staggerDelay?: number
  count?: number
}

export const useAnimationDelays = ({ 
  baseDelay = APP_CONFIG.ANIMATION_DELAYS.FADE_IN, 
  staggerDelay = APP_CONFIG.ANIMATION_DELAYS.STAGGERED,
  count = 1 
}: UseAnimationDelaysProps = {}) => {
  const delays = useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      index,
      delay: baseDelay + (index * staggerDelay),
      style: { animationDelay: `${baseDelay + (index * staggerDelay)}s` }
    }))
  }, [baseDelay, staggerDelay, count])

  const getDelay = (index: number) => delays[index]?.delay || 0
  const getDelayStyle = (index: number) => delays[index]?.style || {}

  return {
    delays,
    getDelay,
    getDelayStyle,
    baseDelay,
    staggerDelay,
  }
}
