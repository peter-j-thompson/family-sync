'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TaskList, Task, User } from '@/lib/types'
import { Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TasksPage() {
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddList, setShowAddList] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', assignee: '', dueDate: '' })
  const [newListName, setNewListName] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedList) loadTasks()
  }, [selectedList])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('id, family_id')
      .eq('auth_id', user.id)
      .single()

    if (!profile?.family_id) return

    setFamilyId(profile.family_id)
    setUserId(profile.id)

    // Load task lists
    const { data: listsData } = await supabase
      .from('task_lists')
      .select('*')
      .eq('family_id', profile.family_id)
      .order('sort_order')

    setTaskLists(listsData || [])
    if (listsData?.length && !selectedList) {
      setSelectedList(listsData[0].id)
    }

    // Load family members
    const { data: membersData } = await supabase
      .from('users')
      .select('*')
      .eq('family_id', profile.family_id)

    setMembers(membersData || [])
  }

  const loadTasks = async () => {
    if (!selectedList) return

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*, assignee:users!tasks_assigned_to_fkey(*)')
      .eq('list_id', selectedList)
      .order('status')
      .order('sort_order')

    setTasks(tasksData || [])
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId || !userId || !selectedList) return

    setLoading(true)

    const { error } = await supabase
      .from('tasks')
      .insert({
        family_id: familyId,
        list_id: selectedList,
        title: newTask.title,
        assigned_to: newTask.assignee || null,
        due_date: newTask.dueDate || null,
        created_by: userId,
      })

    if (!error) {
      setShowAddTask(false)
      setNewTask({ title: '', assignee: '', dueDate: '' })
      loadTasks()
    }
    setLoading(false)
  }

  const addList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId || !userId) return

    setLoading(true)

    const { data, error } = await supabase
      .from('task_lists')
      .insert({
        family_id: familyId,
        name: newListName,
        created_by: userId,
      })
      .select()
      .single()

    if (!error && data) {
      setShowAddList(false)
      setNewListName('')
      loadData()
      setSelectedList(data.id)
    }
    setLoading(false)
  }

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    
    await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null,
        completed_by: newStatus === 'done' ? userId : null,
      })
      .eq('id', task.id)

    loadTasks()
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()
  
  const currentList = taskLists.find(l => l.id === selectedList)
  const todoTasks = tasks.filter(t => t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">✅ Tasks</h1>
        <div className="flex gap-2">
          <Dialog open={showAddList} onOpenChange={setShowAddList}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" /> List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add List</DialogTitle>
              </DialogHeader>
              <form onSubmit={addList} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="listName">List Name</Label>
                  <Input
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Shopping, Chores"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Adding...' : 'Add List'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={addTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assign to (optional)</Label>
                  <Select value={newTask.assignee} onValueChange={(v) => setNewTask({ ...newTask, assignee: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select family member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due date (optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Task'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* List Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {taskLists.map((list) => (
          <Button
            key={list.id}
            variant={selectedList === list.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedList(list.id)}
            className="shrink-0"
          >
            {list.icon} {list.name}
          </Button>
        ))}
      </div>

      {/* Tasks */}
      {currentList && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {currentList.icon} {currentList.name}
              <span className="text-sm font-normal text-gray-500">
                {todoTasks.length} remaining
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todoTasks.length === 0 && doneTasks.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No tasks yet. Add one to get started!
              </p>
            ) : (
              <div className="space-y-1">
                {/* Todo tasks */}
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Checkbox
                      checked={task.status === 'done'}
                      onCheckedChange={() => toggleTask(task)}
                    />
                    <span className="flex-1 text-gray-900 dark:text-white">
                      {task.title}
                    </span>
                    {task.assignee && (
                      <Avatar className="w-6 h-6">
                        <AvatarFallback 
                          className="text-[10px]" 
                          style={{ backgroundColor: (task.assignee as User).color + '20', color: (task.assignee as User).color }}
                        >
                          {getInitials((task.assignee as User).name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Done tasks */}
                {doneTasks.length > 0 && (
                  <>
                    <div className="py-2 mt-4">
                      <span className="text-xs font-medium text-gray-500">
                        Completed ({doneTasks.length})
                      </span>
                    </div>
                    {doneTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors opacity-60"
                      >
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => toggleTask(task)}
                        />
                        <span className="flex-1 line-through text-gray-400">
                          {task.title}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
