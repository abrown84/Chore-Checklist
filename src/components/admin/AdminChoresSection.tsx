import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import {
  ClipboardList,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react'

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
}

export const AdminChoresSection: React.FC<AdminChoresSectionProps> = ({
  allChores,
}) => {
  const [editingChoreId, setEditingChoreId] = useState<Id<'chores'> | null>(null)
  const [choreEditData, setChoreEditData] = useState<{
    title?: string
    points?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    category?: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  }>({})

  const updateChore = useMutation(api.chores.updateChore)
  const deleteChore = useMutation(api.chores.deleteChore)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Chore Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allChores && allChores.length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{allChores.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {allChores.filter(c => c.status === 'completed').length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-amber-600">
                  {allChores.filter(c => c.status === 'pending').length}
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allChores.map((chore) => {
                const isEditing = editingChoreId === chore._id

                const handleSaveChore = async () => {
                  if (!chore._id) return

                  try {
                    await updateChore({
                      choreId: chore._id,
                      ...choreEditData,
                    })
                    toast.success('Chore updated successfully')
                    setEditingChoreId(null)
                    setChoreEditData({})
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Failed to update chore')
                  }
                }

                const handleDeleteChore = async () => {
                  if (!chore._id) return
                  if (!window.confirm(`Are you sure you want to delete "${chore.title}"?`)) return

                  try {
                    await deleteChore({ choreId: chore._id })
                    toast.success('Chore deleted successfully')
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Failed to delete chore')
                  }
                }

                const handleStartEdit = () => {
                  setEditingChoreId(chore._id)
                  setChoreEditData({
                    title: chore.title,
                    points: chore.points,
                    difficulty: chore.difficulty || 'medium',
                    category: chore.category || 'daily',
                  })
                }

                return (
                  <div
                    key={chore._id}
                    className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                          <Input
                            value={choreEditData.title || ''}
                            onChange={(e) => setChoreEditData({ ...choreEditData, title: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Points</label>
                            <Input
                              type="number"
                              value={choreEditData.points || ''}
                              onChange={(e) => setChoreEditData({ ...choreEditData, points: parseInt(e.target.value) || 0 })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                            <select
                              value={choreEditData.difficulty || 'medium'}
                              onChange={(e) => setChoreEditData({ ...choreEditData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                              className="w-full border border-border rounded px-3 py-2 bg-background text-sm"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                          <select
                            value={choreEditData.category || 'daily'}
                            onChange={(e) => setChoreEditData({ ...choreEditData, category: e.target.value as 'daily' | 'weekly' | 'monthly' | 'seasonal' })}
                            className="w-full border border-border rounded px-3 py-2 bg-background text-sm"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="seasonal">Seasonal</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveChore}
                            className="flex-1"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingChoreId(null)
                              setChoreEditData({})
                            }}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{chore.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {chore.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {chore.difficulty || 'medium'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {chore.category || 'daily'}
                            </Badge>
                            <span>{chore.points} pts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStartEdit}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteChore}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No chores found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
