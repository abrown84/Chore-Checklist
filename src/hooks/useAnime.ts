/**
 * Simple animation utility using Web Animations API
 * Replaces anime.js for basic animations
 */

interface AnimationOptions {
  opacity?: number | number[]
  scale?: number | number[]
  translateY?: number | number[]
  duration?: number
  ease?: string
  complete?: () => void
}

// Map ease names to CSS easing functions
const easeMap: Record<string, string> = {
  outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  inOutQuad: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
  linear: 'linear',
}

/**
 * Animate an element using Web Animations API
 */
export function animateElement(
  element: HTMLElement,
  options: AnimationOptions
): Animation | null {
  if (!element) return null

  const {
    opacity,
    scale,
    translateY,
    duration = 300,
    ease = 'outQuart',
    complete,
  } = options

  // Build keyframes
  const keyframes: Keyframe[] = []

  // Handle array values (from -> to) or single values
  const getFromTo = (val: number | number[] | undefined): [number | undefined, number | undefined] => {
    if (val === undefined) return [undefined, undefined]
    if (Array.isArray(val)) return [val[0], val[1]]
    return [undefined, val]
  }

  const [opacityFrom, opacityTo] = getFromTo(opacity)
  const [scaleFrom, scaleTo] = getFromTo(scale)
  const [translateYFrom, translateYTo] = getFromTo(translateY)

  // Build transform strings
  const buildTransform = (s?: number, ty?: number): string => {
    const parts: string[] = []
    if (s !== undefined) parts.push(`scale(${s})`)
    if (ty !== undefined) parts.push(`translateY(${ty}px)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }

  // Create from keyframe
  const fromKeyframe: Keyframe = {}
  if (opacityFrom !== undefined) fromKeyframe.opacity = opacityFrom
  const fromTransform = buildTransform(scaleFrom, translateYFrom)
  if (fromTransform !== 'none') fromKeyframe.transform = fromTransform

  // Create to keyframe
  const toKeyframe: Keyframe = {}
  if (opacityTo !== undefined) toKeyframe.opacity = opacityTo
  const toTransform = buildTransform(scaleTo, translateYTo)
  if (toTransform !== 'none') toKeyframe.transform = toTransform

  // Only animate if we have keyframes
  if (Object.keys(fromKeyframe).length === 0 && Object.keys(toKeyframe).length === 0) {
    complete?.()
    return null
  }

  // If only "to" values, animate from current
  if (Object.keys(fromKeyframe).length === 0) {
    keyframes.push(toKeyframe)
  } else {
    keyframes.push(fromKeyframe, toKeyframe)
  }

  try {
    const animation = element.animate(keyframes, {
      duration,
      easing: easeMap[ease] || easeMap.outQuart,
      fill: 'forwards',
    })

    if (complete) {
      animation.onfinish = complete
    }

    return animation
  } catch {
    // Fallback: just call complete
    complete?.()
    return null
  }
}
