"use client";

import React, { useState } from "react";
import {
  AlertCircle, CheckCircle2, ClipboardList, Clock, Plus, Search,
  ArrowRight, Flag, Trash2, Loader2, Calendar, User, XCircle, RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import {
  useTasks,
  useCreateTask,
  useUpdateTaskStatus,
  useDeleteTask,
  type StaffTask,
  type TaskStatus,
  type TaskPriority,
} from "@/hooks/useStaffTasks";
import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/lib/auth-context";

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 border border-red-200",
  high: "bg-rose-100 text-rose-700 border border-rose-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-sky-100 text-sky-700 border border-sky-200",
};

const statusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-600",
};

export default function TasksPage() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: staffData } = useStaff({ clinicId: user?.clinicId, limit: 100 });
  const staffList = Array.isArray(staffData?.data) ? staffData.data : Array.isArray(staffData) ? staffData : [];

  const createTaskMut = useCreateTask();
  const updateStatusMut = useUpdateTaskStatus();
  const deleteTaskMut = useDeleteTask();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Form State
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
    assignedToId: string;
  }>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedToId: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filteredTasks = tasks.filter((t: StaffTask) => {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.assignedTo && `${t.assignedTo.firstName} ${t.assignedTo.lastName}`.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = tasks.filter((t: StaffTask) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t: StaffTask) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t: StaffTask) => t.status === "completed").length;
  const cancelledCount = tasks.filter((t: StaffTask) => t.status === "cancelled").length;

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;

    createTaskMut.mutate(
      {
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        assignedToId: newTask.assignedToId || undefined,
        assignedById: user?.userId,
      },
      {
        onSuccess: () => {
          setNewTask({
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
            assignedToId: "",
          });
          setShowNewTaskModal(false);
          showToast("Task created successfully");
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.message || err?.message || "Failed to create task");
        },
      }
    );
  };

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    updateStatusMut.mutate(
      { id, status },
      {
        onSuccess: (updated) => {
          if (selectedTask && selectedTask.id === id) {
            setSelectedTask({ ...selectedTask, status });
          }
          setShowDetail(false);
          showToast(`Task status updated to ${status.replace("_", " ")}`);
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.message || err?.message || "Failed to update task");
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteTaskMut.mutate(id, {
      onSuccess: () => {
        setShowDetail(false);
        setSelectedTask(null);
        showToast("Task deleted");
      },
      onError: (err: any) => {
        showToast(err?.response?.data?.message || err?.message || "Failed to delete task");
      },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto p-4 md:p-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Staff Tasks</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Assign, track, and manage clinic operational tasks and follow-ups.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Pending", value: String(pendingCount), icon: Clock, filter: "pending", color: "text-amber-600" },
            { label: "In Progress", value: String(inProgressCount), icon: AlertCircle, filter: "in_progress", color: "text-blue-600" },
            { label: "Completed", value: String(completedCount), icon: CheckCircle2, filter: "completed", color: "text-emerald-600" },
            { label: "Cancelled", value: String(cancelledCount), icon: XCircle, filter: "cancelled", color: "text-slate-400" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(statusFilter === stat.filter ? "All" : stat.filter)}
              className={cn(
                "bg-white border rounded-xl sm:rounded-[1.5rem] px-3 sm:px-4 py-3 shadow-sm text-left transition-all hover:shadow-md",
                statusFilter === stat.filter ? "border-emerald-300 bg-emerald-50/50" : "border-slate-100"
              )}
            >
              <stat.icon size={16} className={cn("mb-1 sm:mb-2", stat.color)} />
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-8">
        {/* Task List */}
        <section className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, description, or assigned staff..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-bold text-slate-900 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="p-8 sm:p-12 text-center"><Loader2 className="animate-spin text-slate-400 mx-auto" /></div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-slate-400 space-y-2">
                <ClipboardList size={32} className="mx-auto opacity-40" />
                <p className="text-sm font-bold text-slate-600">No tasks found</p>
                <p className="text-xs text-slate-400">Create a new task from the right panel to get started.</p>
              </div>
            ) : (
              filteredTasks.map((task: StaffTask) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowDetail(true);
                  }}
                  className="w-full p-4 sm:p-6 text-left transition-all hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0",
                        task.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                        task.status === "in_progress" ? "bg-blue-50 text-blue-600" :
                        task.status === "cancelled" ? "bg-rose-50 text-rose-500" :
                        "bg-slate-100 text-slate-500"
                      )}
                    >
                      <ClipboardList size={18} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-black truncate",
                          task.status === "completed" ? "text-slate-400 line-through" :
                          task.status === "cancelled" ? "text-slate-400 line-through" : "text-slate-900"
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">
                        {task.assignedTo ? `Assigned to: ${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "Unassigned"}
                        {task.dueDate ? ` • Due: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider", priorityStyles[task.priority] || priorityStyles.medium)}>
                      {task.priority}
                    </span>
                    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider", statusStyles[task.status] || statusStyles.pending)}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Creation Panel */}
        <aside className="space-y-5 sm:space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl shadow-slate-900/10"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <div>
                <h2 className="text-base font-black">Create Task</h2>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Assign to team members</p>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Title *</label>
                <input
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Sanitize exam room 3"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task details and instructions..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-xs font-bold placeholder:text-white/30 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-xs font-bold text-white"
                  >
                    <option value="low" className="text-slate-900">Low</option>
                    <option value="medium" className="text-slate-900">Medium</option>
                    <option value="high" className="text-slate-900">High</option>
                    <option value="urgent" className="text-slate-900">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Assign Staff</label>
                <select
                  value={newTask.assignedToId}
                  onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-xs font-bold text-white"
                >
                  <option value="" className="text-slate-900">Select Staff (Optional)</option>
                  {staffList.map((s: any) => (
                    <option key={s.id} value={s.id} className="text-slate-900">
                      {s.firstName} {s.lastName} ({s.role || "Staff"})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!newTask.title.trim() || createTaskMut.isPending}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 mt-2"
              >
                {createTaskMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                {createTaskMut.isPending ? "Creating..." : "Create Task"}
              </button>
            </form>
          </motion.section>

          <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Priority Guide</h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span className="font-bold text-slate-800">Urgent:</span>
                <span className="text-slate-500 text-[11px]">Immediate clinical/operational priority</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="font-bold text-slate-800">High:</span>
                <span className="text-slate-500 text-[11px]">Requires attention today</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="font-bold text-slate-800">Medium:</span>
                <span className="text-slate-500 text-[11px]">Standard task within current shift</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="font-bold text-slate-800">Low:</span>
                <span className="text-slate-500 text-[11px]">Routine maintenance or follow-up</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Task Details Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Task Details">
        {selectedTask && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <ClipboardList size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-slate-900 break-words">{selectedTask.title}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", priorityStyles[selectedTask.priority] || priorityStyles.medium)}>
                    {selectedTask.priority}
                  </span>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", statusStyles[selectedTask.status] || statusStyles.pending)}>
                    {selectedTask.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {selectedTask.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</span>
                  <p className="text-slate-800 font-medium whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Assigned To</span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedTask.assignedTo ? `${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}` : "Unassigned"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Due Date</span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "No due date"}
                  </span>
                </div>
              </div>

              {selectedTask.createdAt && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Created On</span>
                  <span className="text-xs font-medium text-slate-600">
                    {new Date(selectedTask.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Update Status</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedTask.status !== "in_progress" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "in_progress")}
                    disabled={updateStatusMut.isPending}
                    className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <ArrowRight size={14} /> Start Task
                  </button>
                )}
                {selectedTask.status !== "completed" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "completed")}
                    disabled={updateStatusMut.isPending}
                    className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Complete
                  </button>
                )}
                {selectedTask.status !== "cancelled" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "cancelled")}
                    disabled={updateStatusMut.isPending}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                )}
                {selectedTask.status !== "pending" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "pending")}
                    disabled={updateStatusMut.isPending}
                    className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={14} /> Reopen
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(selectedTask.id)}
                disabled={deleteTaskMut.isPending}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-1"
              >
                <Trash2 size={14} /> Delete Task
              </button>
            </div>

            <button
              onClick={() => setShowDetail(false)}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
