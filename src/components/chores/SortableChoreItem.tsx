import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Chore } from '../../types/chore'
import { ChoreItem } from './ChoreItem'

interface SortableChoreItemProps {
  chore: Chore
  onComplete: (id: string, event?: React.MouseEvent) => void
  onDelete: (id: string) => void
  onEdit?: (chore: Chore) => void
  isAnimating: boolean
  isCompleting: boolean
  onAnimationComplete: (id: string) => void
  index: number
  isDragEnabled: boolean
}

export const SortableChoreItem: React.FC<SortableChoreItemProps> = ({
  chore,
  onComplete,
  onDelete,
  onEdit,
  isAnimating,
  isCompleting,
  onAnimationComplete,
  index,
  isDragEnabled
}) => {
  // Debug log
  if (import.meta.env.DEV && index === 0) {
    console.log('[SortableChoreItem] isDragEnabled:', isDragEnabled, 'chore.completed:', chore.completed)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chore.id,
    disabled: !isDragEnabled || chore.completed
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  // Make the whole card draggable (not just a handle)
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${!chore.completed ? 'cursor-grab active:cursor-grabbing' : ''} touch-none`}
    >
      <ChoreItem
        chore={chore}
        onComplete={onComplete}
        onDelete={onDelete}
        onEdit={onEdit}
        isAnimating={isAnimating}
        isCompleting={isCompleting}
        onAnimationComplete={onAnimationComplete}
        index={index}
      />
    </div>
  )
}

SortableChoreItem.displayName = 'SortableChoreItem'
