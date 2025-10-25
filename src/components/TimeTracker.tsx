import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, Target, ChevronRight, Play, Pause, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type Subtask = Database['public']['Tables']['subtasks']['Row'];

interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

const TimeTracker: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasksWithSubtasks();
    }
  }, [user]);

  const fetchTasksWithSubtasks = async () => {
    if (!user) return;

    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const { data: subtasksData, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (subtasksError) throw subtasksError;

      const tasksWithSubtasks: TaskWithSubtasks[] = (tasksData || []).map(task => ({
        ...task,
        subtasks: (subtasksData || []).filter(st => st.parent_task_id === task.id)
      }));

      setTasks(tasksWithSubtasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskTime = async (taskId: string, field: 'estimated_hours' | 'actual_hours', value: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ [field]: value })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      ));
    } catch (error) {
      console.error('Error updating task time:', error);
    }
  };

  const updateSubtaskTime = async (subtaskId: string, field: 'estimated_hours' | 'actual_hours', value: number) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ [field]: value })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(tasks.map(task => ({
        ...task,
        subtasks: task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, [field]: value } : st
        )
      })));
    } catch (error) {
      console.error('Error updating subtask time:', error);
    }
  };

  const calculateTaskTotals = (task: TaskWithSubtasks) => {
    const subtaskEstimated = task.subtasks.reduce((sum, st) => sum + (Number(st.estimated_hours) || 0), 0);
    const subtaskActual = task.subtasks.reduce((sum, st) => sum + (Number(st.actual_hours) || 0), 0);

    const totalEstimated = (Number(task.estimated_hours) || 0) + subtaskEstimated;
    const totalActual = (Number(task.actual_hours) || 0) + subtaskActual;

    const completedSubtasks = task.subtasks.filter(st => st.status === 'done').length;
    const totalSubtasks = task.subtasks.length;

    return { totalEstimated, totalActual, completedSubtasks, totalSubtasks };
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="text-green-500" size={16} />;
      case 'in_progress': return <Play className="text-blue-500" size={16} />;
      default: return <Pause className="text-gray-400" size={16} />;
    }
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const totalStats = tasks.reduce(
    (acc, task) => {
      const totals = calculateTaskTotals(task);
      return {
        estimatedHours: acc.estimatedHours + totals.totalEstimated,
        actualHours: acc.actualHours + totals.totalActual,
        tasks: acc.tasks + 1,
        completedTasks: acc.completedTasks + (task.status === 'done' ? 1 : 0)
      };
    },
    { estimatedHours: 0, actualHours: 0, tasks: 0, completedTasks: 0 }
  );

  const efficiency = totalStats.estimatedHours > 0
    ? Math.round((totalStats.estimatedHours / Math.max(totalStats.actualHours, 0.1)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="text-blue-500" size={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Estimated</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatHours(totalStats.estimatedHours)}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-orange-500" size={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Actual</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatHours(totalStats.actualHours)}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="text-green-500" size={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {efficiency}%
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="text-purple-500" size={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tasks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalStats.completedTasks}/{totalStats.tasks}
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Task Timeline</h3>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks to track</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Add tasks to start tracking your time</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => {
              const totals = calculateTaskTotals(task);
              const isExpanded = selectedTask === task.id;
              const progress = totals.totalSubtasks > 0
                ? Math.round((totals.completedSubtasks / totals.totalSubtasks) * 100)
                : 0;

              return (
                <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                  <div
                    className="p-4 bg-gray-50/50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70 transition-colors"
                    onClick={() => setSelectedTask(isExpanded ? null : task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <ChevronRight
                          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          size={20}
                        />
                        <div className={`w-3 h-3 rounded-full ${getTimelineColor(task.status)}`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>Est: {formatHours(totals.totalEstimated)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <TrendingUp size={14} />
                              <span>Act: {formatHours(totals.totalActual)}</span>
                            </span>
                            {totals.totalSubtasks > 0 && (
                              <span>{totals.completedSubtasks}/{totals.totalSubtasks} subtasks</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {progress}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">complete</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                      {/* Task Time Inputs */}
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Task Estimated Hours
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={task.estimated_hours || 0}
                            onChange={(e) => updateTaskTime(task.id, 'estimated_hours', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Task Actual Hours
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={task.actual_hours || 0}
                            onChange={(e) => updateTaskTime(task.id, 'actual_hours', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* Subtasks Timeline */}
                      {task.subtasks.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-semibold text-gray-700 dark:text-gray-300">Subtasks</h5>
                          <div className="relative pl-8 space-y-4">
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                            {task.subtasks.map((subtask, index) => (
                              <div key={subtask.id} className="relative">
                                <div className={`absolute left-[-1.5rem] top-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getTimelineColor(subtask.status)}`} />
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 flex-1">
                                      {getStatusIcon(subtask.status)}
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {subtask.title}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Estimated
                                      </label>
                                      <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        value={subtask.estimated_hours || 0}
                                        onChange={(e) => updateSubtaskTime(subtask.id, 'estimated_hours', parseFloat(e.target.value) || 0)}
                                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Actual
                                      </label>
                                      <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        value={subtask.actual_hours || 0}
                                        onChange={(e) => updateSubtaskTime(subtask.id, 'actual_hours', parseFloat(e.target.value) || 0)}
                                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
