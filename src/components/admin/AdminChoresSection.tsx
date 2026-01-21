import React, { useState, useMemo } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import { Trash, FloppyDisk, X, Check, Clock, Plus, MagnifyingGlass, ListChecks, PencilSimple } from '@phosphor-icons/react'

interface Chore {
  _id: Id<'chores'>
  title: string
  points: number
  status: string
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: 'daily' | 'weekly' | 'monthly' | 'seasonal'
}

interface AdminChoresSectionProps {
  allChores: Chore[] | undefined
  householdId: Id<'households'>
}

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const CATEGORIES = ['daily', 'weekly', 'monthly', 'seasonal'] as const

type Difficulty = typeof DIFFICULTIES[number]
type Category = typeof CATEGORIES[number]
type FilterStatus = 'all' | 'pending' | 'completed'

const DEFAULT_CHORE = {
  title: '',
  points: 10,
  difficulty: 'medium' as Difficulty,
  category: 'daily' as Category,
}

export const AdminChoresSection: React.FC<AdminChoresSectionProps> = ({ allChores, householdId }) => {
  const [editingId, setEditingId] = useState<Id<'chores'> | null>(null)
  const [editData, setEditData] = useState<Partial<Chore>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newChore, setNewChore] = useState(DEFAULT_CHORE)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')

  const addChore = useMutation(api.chores.addChore)
  const updateChore = useMutation(api.chores.updateChore)
  const deleteChore = useMutation(api.chores.deleteChore)

  // Filter and search chores
  const filteredChores = useMemo(() => {
    if (!allChores) return []
    return allChores.filter(chore => {
      const matchesSearch = chore.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || chore.status === filterStatus
      const matchesCategory = filterCategory === 'all' || chore.category === filterCategory
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [allChores, searchQuery, filterStatus, filterCategory])

  const chores = allChores || []
  const completed = chores.filter(c => c.status === 'completed').length
  const pending = chores.length - completed

  const handleCreate = async () => {
    if (!newChore.title.trim()) {
      toast.error('Please enter a chore title')
      return
    }
    try {
      await addChore({
        title: newChore.title.trim(),
        points: newChore.points,
        difficulty: newChore.difficulty,
        category: newChore.category,
        priority: 'medium',
        householdId,
      })
      toast.success('Chore created')
      setIsAdding(false)
      setNewChore(DEFAULT_CHORE)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create chore')
    }
  }

  const handleSave = async () => {
    if (!editingId) return
    try {
      await updateChore({ choreId: editingId, ...editData })
      toast.success('Chore updated')
      setEditingId(null)
      setEditData({})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    }
  }

  const handleDelete = async (chore: Chore) => {
    if (!confirm(`Delete "${chore.title}"?`)) return
    try {
      await deleteChore({ choreId: chore._id })
      toast.success('Chore deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    }
  }

  const startEdit = (chore: Chore) => {
    setEditingId(chore._id)
    setEditData({
      title: chore.title,
      points: chore.points,
      difficulty: chore.difficulty || 'medium',
      category: chore.category || 'daily',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setNewChore(DEFAULT_CHORE)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Chore Management</h3>
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" /> {pending}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-green-600">
              <Check className="w-3 h-3" /> {completed}
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          <div className="flex gap-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="h-8 text-xs border rounded-md px-2 bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
              className="h-8 text-xs border rounded-md px-2 bg-background"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="w-3 h-3" />
            Add Chore
          </Button>
        </div>

        {/* Add New Chore Form */}
        {isAdding && (
          <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Plus className="w-4 h-4" />
              New Chore
            </div>
            <Input
              placeholder="Chore title..."
              value={newChore.title}
              onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
              className="h-9"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[80px]">
                <label className="text-[10px] text-muted-foreground block mb-1">Points</label>
                <Input
                  type="number"
                  value={newChore.points}
                  onChange={(e) => setNewChore({ ...newChore, points: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="text-[10px] text-muted-foreground block mb-1">Difficulty</label>
                <select
                  value={newChore.difficulty}
                  onChange={(e) => setNewChore({ ...newChore, difficulty: e.target.value as Difficulty })}
                  className="w-full h-8 text-xs border rounded-md px-2 bg-background"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="text-[10px] text-muted-foreground block mb-1">Category</label>
                <select
                  value={newChore.category}
                  onChange={(e) => setNewChore({ ...newChore, category: e.target.value as Category })}
                  className="w-full h-8 text-xs border rounded-md px-2 bg-background"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="gap-1" onClick={handleCreate}>
                <FloppyDisk className="w-3 h-3" />
                Create Chore
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelAdd}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Chore List */}
        {filteredChores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {chores.length === 0 ? 'No chores yet' : 'No chores match your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredChores.map((chore) => {
              const isEditing = editingId === chore._id

              if (isEditing) {
                return (
                  <div key={chore._id} className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                    <Input
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="Title"
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Input
                        type="number"
                        value={editData.points || ''}
                        onChange={(e) => setEditData({ ...editData, points: parseInt(e.target.value) || 0 })}
                        placeholder="Points"
                        className="h-8 text-sm w-20"
                      />
                      <select
                        value={editData.difficulty}
                        onChange={(e) => setEditData({ ...editData, difficulty: e.target.value as Difficulty })}
                        className="h-8 text-xs border rounded px-2 bg-background flex-1 min-w-[80px]"
                      >
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value as Category })}
                        className="h-8 text-xs border rounded px-2 bg-background flex-1 min-w-[80px]"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <Button size="sm" className="h-8 px-3" onClick={handleSave}>
                        <FloppyDisk className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={cancelEdit}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={chore._id}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group border border-transparent hover:border-border/50"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${chore.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-sm flex-1 truncate font-medium">{chore.title}</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        chore.difficulty === 'easy' ? 'border-green-500/50 text-green-600' :
                        chore.difficulty === 'hard' ? 'border-red-500/50 text-red-600' :
                        'border-amber-500/50 text-amber-600'
                      }`}
                    >
                      {chore.difficulty || 'medium'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {chore.category || 'daily'}
                    </Badge>
                    <span className="w-14 text-right font-semibold text-foreground">{chore.points} pts</span>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(chore)}>
                      <PencilSimple className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(chore)}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer stats */}
        {filteredChores.length !== chores.length && chores.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center">
            Showing {filteredChores.length} of {chores.length} chores
          </p>
        )}
      </CardContent>
    </Card>
  )
}
