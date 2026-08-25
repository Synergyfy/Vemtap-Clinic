"use client";

import React, { useState } from "react";
import {
  AlertCircle, CheckCircle2, ClipboardList, Clock, Plus, Search, UserPlus,
  ArrowRight, Flag, X, Trash2, CalendarDays, User
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

type Task = {
  id: string;
  title: string;
  patient: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  due: string;
  assignee: string;
};

const initialTasks: Task[] = [
  { id: "TSK-1001", title: "Verify HMO eligibility", patient: "Chidimma Okoro", priority: "high", status: "pending", due: "Today, 11:00 AM", assignee: "Reception Desk" },
  { id: "TSK-1002", title: "Prepare discharge papers", patient: "Babatunde Lawal", priority: "medium", status: "in-progress", due: "Today, 12:30 PM", assignee: "Reception Desk" },
  { id: "TSK-1003", title: "Call insurance provider", patient: "Yuki Tanaka", priority: "high", status: "pending", due: "Today, 02:00 PM", assignee: "Reception Desk" },
  { id: "TSK-1004", title: "Schedule follow-up", patient: "Sarah Mensah", priority: "low", status: "completed", due: "Yesterday", assignee: "Reception Desk" },
  { id: "TSK-1005", title: "Digitize intake forms", patient: "General", priority: "medium", status: "pending", due: "Tomorrow, 09:00 AM", assignee: "Admin" },
];

const priorityStyles: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-sky-100 text-sky-700",
};

const statusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", patient: "", priority: "medium" as Task["priority"] });

  // Detail modal
  const [showDetail, setShowDetail] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = !query.trim() || [t.title, t.patient, t.id, t.assignee].join(" ").toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const overdueCount = tasks.filter((t) => t.status === "pending" && t.due.toLowerCase().includes("today")).length;

  const createTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: `TSK-${1001 + tasks.length}`,
      title: newTask.title,
      patient: newTask.patient || "General",
      priority: newTask.priority,
      status: "pending",
      due: "Today",
      assignee: "Reception Desk",
    };
    setTasks((current) => [task, ...current]);
    setNewTask({ title: "", patient: "", priority: "medium" });
    setShowNewTask(false);
    showToast("Task created");
  };

  const updateTaskStatus = (id: string, status: Task["status"]) => {
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((t) => t.id !== id));
    setShowDetail(false);
    showToast("Task removed");
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Manage daily reception tasks and follow-ups.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Pending", value: String(pendingCount), icon: Clock, filter: "pending" },
            { label: "In Progress", value: String(inProgressCount), icon: AlertCircle, filter: "in-progress" },
            { label: "Due Today", value: String(overdueCount), icon: Flag, filter: "All" },
          ].map((stat) => (
            <button key={stat.label} onClick={() => setStatusFilter(stat.filter)}
              className={cn("bg-white border rounded-xl sm:rounded-[1.5rem] px-3 sm:px-5 py-3 sm:py-4 shadow-sm text-left transition-all hover:shadow-md", statusFilter === stat.filter ? "border-sky-200 bg-sky-50" : "border-slate-100")}>
              <stat.icon size={16} className={cn("mb-1 sm:mb-2", statusFilter === stat.filter ? "text-sky-600" : "text-sky-400")} />
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-8">
        {/* Task List */}
        <section className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks by title, patient, ID..."
                className="w-full pl-11 sm:pl-14 pr-3 sm:pr-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/15 font-bold text-slate-900 text-sm" />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredTasks.map((task) => (
              <button key={task.id} onClick={() => { setSelectedTask(task); setShowDetail(true); }}
                className="w-full p-4 sm:p-6 text-left transition-all hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0",
                    task.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                    task.status === "in-progress" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500")}>
                    <ClipboardList size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-black truncate", task.status === "completed" ? "text-slate-400 line-through" : "text-slate-900")}>
                      {task.title}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                      {task.patient} &bull; {task.id} &bull; {task.due}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className={cn("px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest", priorityStyles[task.priority])}>{task.priority}</span>
                  <span className={cn("px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest", statusStyles[task.status])}>{task.status}</span>
                </div>
              </button>
            ))}
            {filteredTasks.length === 0 && (
              <div className="p-8 sm:p-12 text-center text-slate-400">
                <ClipboardList size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">No tasks match your filter</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5 sm:space-y-8">
          {/* Quick Create */}
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center"><Plus size={18} /></div>
              <div>
                <h2 className="text-base sm:text-lg font-black">Quick Task</h2>
                <p className="text-[9px] sm:text-[10px] text-white/50 font-black uppercase tracking-widest">Create & assign</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30" />
              <input value={newTask.patient} onChange={(e) => setNewTask({ ...newTask, patient: e.target.value })} placeholder="Patient name (optional)"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30" />
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-[10px] sm:text-xs font-bold">
                <option value="low" className="text-slate-900">Low Priority</option>
                <option value="medium" className="text-slate-900">Medium Priority</option>
                <option value="high" className="text-slate-900">High Priority</option>
              </select>
              <button onClick={createTask} disabled={!newTask.title.trim()}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-slate-900 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all disabled:opacity-50">
                Create Task
              </button>
            </div>
          </motion.section>

          {/* Status Legend */}
          <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-sm">
            <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4">Task Legend</h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                { color: "bg-rose-500", label: "High priority", desc: "Needs immediate attention" },
                { color: "bg-amber-500", label: "Medium priority", desc: "Complete within shift" },
                { color: "bg-sky-500", label: "Low priority", desc: "When time permits" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0", item.color)} />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Task Details">
        {selectedTask && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 shrink-0"><ClipboardList size={24} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedTask.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{selectedTask.id} &bull; {selectedTask.due}</p>
                  </div>
                  <span className={cn("px-2 sm:px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0", priorityStyles[selectedTask.priority])}>{selectedTask.priority}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Patient</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{selectedTask.patient}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Assignee</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{selectedTask.assignee}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Status</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", statusStyles[selectedTask.status])}>{selectedTask.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedTask.status !== "completed" && (
                <button onClick={() => { updateTaskStatus(selectedTask.id, "completed"); setShowDetail(false); showToast(`"${selectedTask.title}" completed`); }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Mark Complete
                </button>
              )}
              {selectedTask.status === "pending" && (
                <button onClick={() => { updateTaskStatus(selectedTask.id, "in-progress"); setShowDetail(false); showToast(`"${selectedTask.title}" started`); }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-blue-700 flex items-center justify-center gap-2">
                  <ArrowRight size={14} /> Start Task
                </button>
              )}
              {selectedTask.status === "in-progress" && (
                <button onClick={() => { updateTaskStatus(selectedTask.id, "pending"); setShowDetail(false); showToast(`"${selectedTask.title}" re-opened`); }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-amber-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-amber-700 flex items-center justify-center gap-2">
                  <Clock size={14} /> Re-open
                </button>
              )}
              <button onClick={() => deleteTask(selectedTask.id)}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-rose-200 text-rose-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-rose-50 flex items-center justify-center gap-2">
                <Trash2 size={14} /> Delete Task
              </button>
            </div>
            <button onClick={() => setShowDetail(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
