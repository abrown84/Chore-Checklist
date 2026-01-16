import React, { useEffect, useMemo } from 'react'
import {
  Surface,
  createMessageProcessor,
  ProcessorProvider,
  card,
  row,
  column,
  divider,
  h2,
  body,
  caption,
  createSurface,
  updateComponents,
  resetIdCounter,
} from '@zhama/a2ui'

/**
 * A2UI Demo Component
 *
 * Demonstrates how to use Google's A2UI protocol to render agent-generated UIs.
 * A2UI uses a flat component structure where components are identified by IDs
 * and containers reference child components by their IDs.
 */

const SURFACE_ID = 'demo-surface'

// Helper to build components with the A2UI flat structure
const createDemoMessages = () => {
  resetIdCounter()

  // Create individual components with IDs
  const titleText = h2('Welcome to A2UI', { id: 'title' })
  const descText = body(
    'This UI was generated from declarative JSON - the same format AI agents use to create dynamic interfaces.',
    { id: 'desc' }
  )
  const div1 = divider({ id: 'div1' })

  // Stats components
  const pointsLabel = caption('Points Earned', { id: 'points-label' })
  const pointsValue = h2('1,250', { id: 'points-value' })
  const pointsCol = column(['points-label', 'points-value'], { id: 'points-col' })

  const choresLabel = caption('Chores Completed', { id: 'chores-label' })
  const choresValue = h2('47', { id: 'chores-value' })
  const choresCol = column(['chores-label', 'chores-value'], { id: 'chores-col' })

  const streakLabel = caption('Current Streak', { id: 'streak-label' })
  const streakValue = h2('5 days', { id: 'streak-value' })
  const streakCol = column(['streak-label', 'streak-value'], { id: 'streak-col' })

  const statsRow = row(['points-col', 'chores-col', 'streak-col'], { id: 'stats-row' })
  const statsCard = card('stats-row', { id: 'stats-card' })

  // Main column containing all components
  const mainCol = column(
    ['title', 'desc', 'div1', 'stats-card'],
    { id: 'main' }
  )

  // All components in flat list
  const allComponents = [
    titleText,
    descText,
    div1,
    pointsLabel,
    pointsValue,
    pointsCol,
    choresLabel,
    choresValue,
    choresCol,
    streakLabel,
    streakValue,
    streakCol,
    statsRow,
    statsCard,
    mainCol,
  ]

  return [
    createSurface(SURFACE_ID),
    updateComponents(SURFACE_ID, allComponents),
  ]
}

export const A2UIDemo: React.FC = () => {
  // Create a message processor
  const processor = useMemo(() => createMessageProcessor(), [])

  // Process messages on mount
  useEffect(() => {
    const messages = createDemoMessages()
    processor.processMessages(messages)
  }, [processor])

  // Get the surface from the processor
  const surface = processor.getSurfaces().get(SURFACE_ID) ?? null

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          A2UI Demo
        </h3>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
          This component demonstrates Google's A2UI protocol for agent-generated UIs.
        </p>
      </div>

      <ProcessorProvider processor={processor} surfaceId={SURFACE_ID}>
        <div className="a2ui-root">
          <Surface
            surfaceId={SURFACE_ID}
            surface={surface}
            processor={processor}
          />
        </div>
      </ProcessorProvider>
    </div>
  )
}

A2UIDemo.displayName = 'A2UIDemo'

export default A2UIDemo
