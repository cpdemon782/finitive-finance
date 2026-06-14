'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, signOut } from '../../../lib/supabase'

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    lead_id: '',
    due_date: '',
    assigned_to: '',
  })
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const profile = await getUserRole(user.id)
      if (!profile) { router.push('/login'); return }
      if (profile.role === 'affiliate') { router.push('/affiliate'); return }
      setUser({ ...user, ...profile })
      await fetchAll(user.id)
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchAll(userId: string) {
    const [tasksRes, leadsRes, teamRes] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('leads').select('id, company_name').order('company_name'),
      supabase.from('users').select('id, full_name, role').in('role', ['internal', 'admin']),
    ])
    setTasks(tasksRes.data || [])
    setLeads(leadsRes.data || [])
    setTeamMembers(teamRes.data || [])
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await supabase.from('tasks').update({ completed: !completed }).eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
  }

  async function addTask() {
    if (!newTask.title) return
    const { data } = await supabase.from('tasks').insert({
      title: newTask.title,
      lead_id: newTask.lead_id || null,
      due_date: newTask.due_date || null,
      assigned_to: newTask.assigned_to || user.id,
      completed: false,
    }).select().single()
    if (data) {
      setTasks(prev => [data, ...prev])
      setNewTask({ title: '', lead_id: '', due_date: '', assigned_to: '' })
      setShowNewTask(false)
    }
  }

  async function deleteTask(taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#9a9080]">Loading tasks...</p>
        </div>
      </div>
    )
  }

  const overdue = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date())
  const today = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString())
  const upcoming = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) > new Date() && new Date(t.due_date).toDateString() !== new Date().toDateString())
  const noDate = tasks.filter(t => !t.completed && !t.due_date)
  const completed = tasks.filter(t => t.completed)

  const getLead = (id: string) => leads.find(l => l.id === id)
  const getMember = (id: string) => teamMembers.find(m => m.id === id)

  function TaskCard({ task }: { task: any }) {
    const lead = getLead(task.lead_id)
    const member = getMember(task.assigned_to)
    const isOverdue = !task.completed && task.due_date && new Date(task.due_date) < new Date()
    const isToday = !task.completed && task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString()

    return (
      <div className={`flex items-start gap-3 py-3 px-4 border-b border-black/5 last:border-0 hover:bg-[#f5f3ee] transition-all group ${task.completed ? 'opacity-50' : ''}`}>
        <button
          onClick={() => toggleTask(task.id, task.completed)}
          className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${task.completed ? 'bg-[#c9a84c] border-[#c9a84c]' : 'border-black/20 hover:border-[#c9a84c]'}`}
        >
          {task.completed && <span className="text-white text-xs">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium text-[#1a1610] ${task.completed ? 'line-through text-[#9a9080]' : ''}`}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {lead && (
              <span className="text-[10px] bg-[#f5f3ee] text-[#5a5245] px-2 py-0.5 rounded-full border border-black/5">
                {lead.company_name}
              </span>
            )}
            {member && (
              <span className="text-[10px] text-[#9a9080]">{member.full_name}</span>
            )}
            {task.due_date && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isOverdue ? 'bg-red-100 text-red-600' :
                isToday ? 'bg-amber-100 text-amber-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {isOverdue ? 'Overdue · ' : isToday ? 'Today · ' : ''}
                {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => deleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 text-[#9a9080] hover:text-red-500 text-sm transition-all flex-shrink-0"
        >
          ×
        </button>
      </div>
    )
  }

  function Section({ title, tasks, badge, badgeColor }: { title: string, tasks: any[], badge?: string, badgeColor?: string }) {
    if (tasks.length === 0) return null
    return (
      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-black/5 flex items-center gap-2">
          <div className="text-sm font-semibold text-[#1a1610]">{title}</div>
          {badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
          )}
        </div>
        <div>
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">

      {/* Sidebar */}
      <div className="w-52 bg-[#1a1610] flex flex-col flex-shrink-0 fixed h-full">
        <div className="p-4 border-b border-[#c9a84c]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center text-xs font-bold text-[#1a1610]">FF</div>
            <div>
              <div className="text-sm font-semibold text-white">Finitive Finance</div>
              <div className="text-[10px] text-[#c9a84c]/60 font-mono">DEAL PLATFORM</div>
            </div>
          </div>
        </div>
        <nav className="p-2 flex-1">
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MAIN</div>
          <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Dashboard</a>
          <a href="/dashboard/pipeline" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Pipeline</a>
          <a href="/dashboard/leads" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">All Leads</a>
          <a href="/dashboard/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-[#c9a84c]/15 font-medium mb-1">Tasks</a>
          <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">MANAGEMENT</div>
          <a href="/dashboard/affiliates" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Affiliates</a>
          <a href="/dashboard/team" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Team</a>
          <a href="/dashboard/reports" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 mb-1">Reports</a>
        </nav>
        <div className="p-3 border-t border-[#c9a84c]/20">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer" onClick={handleSignOut}>
            <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610]">
              {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'SN'}
            </div>
            <div>
              <div className="text-xs font-medium text-white">{user?.full_name}</div>
              <div className="text-[10px] text-white/40">Sign out</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="bg-white border-b border-black/5 px-6 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-base font-semibold text-[#1a1610]">Tasks</div>
            <div className="text-xs text-[#9a9080]">
              {tasks.filter(t => !t.completed).length} open · {completed.length} completed
            </div>
          </div>
          <button
            onClick={() => setShowNewTask(!showNewTask)}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a] transition-colors"
          >
            + New Task
          </button>
        </div>

        <div className="p-6 max-w-3xl">

          {/* New task form */}
          {showNewTask && (
            <div className="bg-white rounded-xl border border-[#c9a84c]/30 shadow-sm overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-black/5">
                <div className="text-sm font-semibold text-[#1a1610]">New task</div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Task title *"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] placeholder-[#b0a898] focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all"
                  autoFocus
                />
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={newTask.lead_id}
                    onChange={e => setNewTask(p => ({ ...p, lead_id: e.target.value }))}
                    className="px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] transition-all"
                  >
                    <option value="">Link to deal...</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.company_name}</option>)}
                  </select>
                  <select
                    value={newTask.assigned_to}
                    onChange={e => setNewTask(p => ({ ...p, assigned_to: e.target.value }))}
                    className="px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] transition-all"
                  >
                    <option value="">Assign to...</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
                    className="px-3 py-2.5 text-sm rounded-lg border border-black/10 bg-[#f5f3ee] text-[#1a1610] focus:outline-none focus:border-[#c9a84c] transition-all"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowNewTask(false)}
                    className="px-4 py-2 text-sm text-[#5a5245] border border-black/10 rounded-lg hover:bg-[#f5f3ee]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTask}
                    disabled={!newTask.title}
                    className="px-4 py-2 text-sm bg-[#c9a84c] text-white rounded-lg hover:bg-[#a8863a] disabled:opacity-50"
                  >
                    Add task
                  </button>
                </div>
              </div>
            </div>
          )}

          <Section title="Overdue" tasks={overdue} badge={`${overdue.length}`} badgeColor="bg-red-100 text-red-600" />
          <Section title="Due today" tasks={today} badge={`${today.length}`} badgeColor="bg-amber-100 text-amber-600" />
          <Section title="Upcoming" tasks={upcoming} badge={`${upcoming.length}`} badgeColor="bg-blue-100 text-blue-600" />
          <Section title="No due date" tasks={noDate} />

          {tasks.filter(t => !t.completed).length === 0 && !showNewTask && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">✓</div>
              <div className="text-sm font-medium text-[#1a1610] mb-1">All caught up!</div>
              <div className="text-xs text-[#9a9080] mb-4">No open tasks right now</div>
              <button
                onClick={() => setShowNewTask(true)}
                className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#a8863a]"
              >
                + Create a task
              </button>
            </div>
          )}

          {completed.length > 0 && (
            <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-black/5 flex items-center gap-2">
                <div className="text-sm font-semibold text-[#1a1610]">Completed</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-600">{completed.length}</span>
              </div>
              <div>
                {completed.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
