import { useEffect, useState, useRef } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { CheckCircle, Star, Zap } from 'lucide-react'

export const ChoreCelebration: React.FC = () => {
  const { state } = useChores()
  const [currentCelebration, setCurrentCelebration] = useState<{
    points: number
    choreTitle: string
  } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const lastCompletedChoreId = useRef<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Find the chore that was just completed by looking for the most recent completedAt timestamp
    const completedChores = state.chores.filter(chore => chore.completed && chore.completedAt)
    
    if (completedChores.length === 0) return
    
    // Find the most recently completed chore
    const mostRecentCompleted = completedChores.reduce((latest, current) => {
      if (!latest.completedAt) return current
      if (!current.completedAt) return latest
      return new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest
    })
    
    // Check if this is a newly completed chore (different from last one we showed)
    if (mostRecentCompleted.id !== lastCompletedChoreId.current) {
      lastCompletedChoreId.current = mostRecentCompleted.id
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Set the new celebration
      setCurrentCelebration({
        points: mostRecentCompleted.points,
        choreTitle: mostRecentCompleted.title
      })
      setIsVisible(true)
      
      // Hide after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setCurrentCelebration(null)
      }, 2000)
    }
  }, [state.chores])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!isVisible || !currentCelebration) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform animate-bounce pointer-events-auto">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chore Completed!</h2>
        <p className="text-gray-600 mb-4">{currentCelebration.choreTitle}</p>
        
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Star className="w-5 h-5" />
            <span className="text-xl font-bold">+{currentCelebration.points} Points!</span>
            <Zap className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Great job! Keep it up!
        </div>
      </div>
    </div>
  )
}
