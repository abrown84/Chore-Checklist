import React, { useState, useEffect } from 'react'
import { Clock, WarningCircle } from '@phosphor-icons/react'
import { normalizeDueDate, getHoursDifference, formatTimeDifference } from '../../utils/dateHelpers'

interface DeadlineCountdownProps {
  dueDate: Date
  completed?: boolean
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({ dueDate, completed }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isOverdue, setIsOverdue] = useState(false)
  const [hoursRemaining, setHoursRemaining] = useState<number>(0)

  useEffect(() => {
    if (completed) {
      setTimeRemaining('Completed')
      return
    }

    const updateCountdown = () => {
      const normalizedDue = normalizeDueDate(dueDate)
      const now = new Date()
      const hours = getHoursDifference(normalizedDue, now)
      
      setHoursRemaining(hours)
      setIsOverdue(hours < 0)

      if (hours < 0) {
        setTimeRemaining(`${formatTimeDifference(Math.abs(hours))} overdue`)
      } else if (hours < 24) {
        setTimeRemaining(`${formatTimeDifference(hours)} remaining`)
      } else {
        const days = Math.floor(hours / 24)
        const remainingHours = Math.floor(hours % 24)
        if (days === 1) {
          setTimeRemaining(`${days} day${remainingHours > 0 ? ` ${remainingHours}h` : ''} remaining`)
        } else {
          setTimeRemaining(`${days} days remaining`)
        }
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [dueDate, completed])

  if (completed) {
    return null
  }

  const getUrgencyColor = () => {
    if (isOverdue) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
    if (hoursRemaining < 6) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 animate-pulse-subtle'
    if (hoursRemaining < 24) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800'
    if (hoursRemaining < 48) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800'
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
  }

  const getUrgencyIcon = () => {
    if (isOverdue || hoursRemaining < 6) return <WarningCircle className="w-3 h-3" />
    return <Clock className="w-3 h-3" />
  }

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-200 ${getUrgencyColor()}`}>
      {getUrgencyIcon()}
      <span>{timeRemaining}</span>
    </div>
  )
}







