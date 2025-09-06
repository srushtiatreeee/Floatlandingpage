import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, Clock, AlertCircle, X, Sparkles, Save, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
type Subtask = Database['public']['Tables']['subtasks']['Row'];
type SubtaskInsert = Database['public']['Tables']['subtasks']['Insert'];

const TaskTracker: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [generatingSubtasks, setGeneratingSubtasks] = useState<string | null>(null);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [searching, setSearching] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'in_progress' | 'done'
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSubtasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching subtasks:', error);
        return;
      }

      // Group subtasks by parent task ID
      const groupedSubtasks: Record<string, Subtask[]> = {};
      data?.forEach(subtask => {
        if (!groupedSubtasks[subtask.parent_task_id]) {
          groupedSubtasks[subtask.parent_task_id] = [];
        }
        groupedSubtasks[subtask.parent_task_id].push(subtask);
      });

      setSubtasks(groupedSubtasks);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addTask = async () => {
    if (!user || !newTask.title.trim()) return;

    try {
      const taskData: TaskInsert = {
        user_id: user.id,
        title: newTask.title.trim(),
        priority: newTask.priority,
        status: newTask.status
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      setTasks([data, ...tasks]);
      setNewTask({ title: '', priority: 'medium', status: 'pending' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(tasks.map(task => task.id === taskId ? data : task));
      setEditingTask(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSmartSearch = async () => {
    if (!user || !searchQuery.trim()) return;

    setSearching(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-search`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery.trim(),
          userId: user.id 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error performing smart search:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSmartSearch();
    }
  };

  const generateSubtasks = async (taskId: string, taskTitle: string) => {
    setGeneratingSubtasks(taskId);
    
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subtasks`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskTitle }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestedSubtasks(prev => ({
        ...prev,
        [taskId]: data.subtasks || []
      }));
    } catch (error) {
      console.error('Error generating subtasks:', error);
      // Show user-friendly error
      setSuggestedSubtasks(prev => ({
        ...prev,
        [taskId]: ['Failed to generate subtasks. Please try again.']
      }));
    } finally {
      setGeneratingSubtasks(null);
    }
  };

  const saveSubtask = async (parentTaskId: string, subtaskTitle: string) => {
    if (!user) return;

    try {
      const subtaskData: SubtaskInsert = {
        parent_task_id: parentTaskId,
        user_id: user.id,
        title: subtaskTitle,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('subtasks')
        .insert([subtaskData])
        .select()
        .single();

      if (error) {
        console.error('Error saving subtask:', error);
        return;
      }

      // Update local state
      setSubtasks(prev => ({
        ...prev,
        [parentTaskId]: [...(prev[parentTaskId] || []), data]
      }));

      // Remove from suggestions
      setSuggestedSubtasks(prev => ({
        ...prev,
        [parentTaskId]: prev[parentTaskId]?.filter(s => s !== subtaskTitle) || []
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, status: 'pending' | 'in_progress' | 'done') => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ status })
        .eq('id', subtaskId);

      if (error) {
        console.error('Error updating subtask:', error);
        return;
      }

      // Update local state
      setSubtasks(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(taskId => {
          updated[taskId] = updated[taskId].map(subtask =>
            subtask.id === subtaskId ? { ...subtask, status } : subtask
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-400 to-red-500';
      case 'medium': return 'from-yellow-400 to-yellow-500';
      case 'low': return 'from-green-400 to-green-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="text-green-500" size={20} />;
      case 'in_progress': return <Clock className="text-blue-500" size={20} />;
      case 'pending': return <AlertCircle className="text-gray-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'pending': return 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400';
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">{taskStats.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="text-2xl font-bold text-blue-500">{taskStats.inProgress}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="text-2xl font-bold text-green-500">{taskStats.done}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
      </div>

      {/* Task Tracker */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        {/* Smart Search Section */}
        <div className="mb-8 p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Smart Search</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks by meaning, not just keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-blue-400 dark:placeholder-blue-300"
              />
            </div>
            <button
              onClick={handleSmartSearch}
              disabled={searching || !searchQuery.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                Top {searchResults.length} Similar Tasks:
              </h4>
              <div className="space-y-2">
                {searchResults.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                          {task.title}
                        </h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl">
              <p className="text-blue-600 dark:text-blue-300 text-sm text-center">
                No similar tasks found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Task Tracker</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Task</h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as 'pending' | 'in_progress' | 'done' })}
                  className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addTask}
                  disabled={!newTask.title.trim()}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-gray-400 dark:text-gray-500" size={24} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Add your first task to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <React.Fragment key={task.id}>
                <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => generateSubtasks(task.id, task.title)}
                    disabled={generatingSubtasks === task.id}
                    className="p-2 text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate Subtasks with AI"
                  >
                    <Sparkles size={16} className={generatingSubtasks === task.id ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* AI Subtask Generation */}
              {generatingSubtasks === task.id && (
                <div className="ml-8 mt-3 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                    <Sparkles size={16} className="animate-spin" />
                    <span className="text-sm font-medium">Generating subtasks with AI...</span>
                  </div>
                </div>
              )}

              {/* Suggested Subtasks */}
              {suggestedSubtasks[task.id] && suggestedSubtasks[task.id].length > 0 && (
                <div className="ml-8 mt-3 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <h5 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">AI Suggested Subtasks:</h5>
                  <div className="space-y-2">
                    {suggestedSubtasks[task.id].map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{suggestion}</span>
                        <button
                          onClick={() => saveSubtask(task.id, suggestion)}
                          className="ml-2 p-1 text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          title="Save as subtask"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Subtasks */}
              {subtasks[task.id] && subtasks[task.id].length > 0 && (
                <div className="ml-8 mt-3 space-y-2">
                  <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Subtasks:</h5>
                  {subtasks[task.id].map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-3 p-2 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg">
                      <button
                        onClick={() => {
                          const nextStatus = subtask.status === 'pending' ? 'in_progress' : 
                                           subtask.status === 'in_progress' ? 'done' : 'pending';
                          updateSubtaskStatus(subtask.id, nextStatus);
                        }}
                        className="flex-shrink-0"
                      >
                        {getStatusIcon(subtask.status)}
                      </button>
                      <span className={`text-sm flex-1 ${
                        subtask.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {subtask.title}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subtask.status)}`}>
                        {subtask.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Edit Task</h4>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as 'pending' | 'in_progress' | 'done' })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => updateTask(editingTask.id, {
                    title: editingTask.title,
                    priority: editingTask.priority,
                    status: editingTask.status
                  })}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Update Task
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTracker;