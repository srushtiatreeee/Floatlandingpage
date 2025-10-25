import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Flame, Calendar, DollarSign, Users, Target, Plus, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type Reminder = Database['public']['Tables']['reminders']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

const Performance: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminder_type: 'general',
    due_date: ''
  });

  const [stats, setStats] = useState({
    tasksCompleted: 0,
    currentStreak: 0,
    totalHours: 0,
    efficiency: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [achievementsRes, remindersRes, tasksRes] = await Promise.all([
        supabase.from('achievements').select('*').eq('user_id', user.id).order('earned_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('user_id', user.id).eq('completed', false).order('due_date', { ascending: true }),
        supabase.from('tasks').select('*').eq('user_id', user.id)
      ]);

      if (achievementsRes.data) setAchievements(achievementsRes.data);
      if (remindersRes.data) setReminders(remindersRes.data);
      if (tasksRes.data) {
        setTasks(tasksRes.data);
        calculateStats(tasksRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasksList: Task[]) => {
    const completedTasks = tasksList.filter(t => t.status === 'done');
    const totalEstimated = tasksList.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
    const totalActual = tasksList.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0);
    const efficiency = totalEstimated > 0 ? Math.round((totalEstimated / Math.max(totalActual, 0.1)) * 100) : 0;

    setStats({
      tasksCompleted: completedTasks.length,
      currentStreak: calculateStreak(completedTasks),
      totalHours: totalActual,
      efficiency
    });

    checkAndAwardAchievements(completedTasks.length, efficiency);
  };

  const calculateStreak = (completedTasks: Task[]) => {
    if (completedTasks.length === 0) return 0;

    const sortedTasks = [...completedTasks].sort((a, b) =>
      new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const task of sortedTasks) {
      const taskDate = new Date(task.updated_at || '');
      taskDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  const checkAndAwardAchievements = async (completedCount: number, efficiency: number) => {
    const newAchievements = [];

    if (completedCount >= 1 && !achievements.find(a => a.type === 'first_task')) {
      newAchievements.push({
        user_id: user!.id,
        type: 'first_task',
        title: 'Getting Started',
        description: 'Completed your first task',
        icon: 'star'
      });
    }

    if (completedCount >= 5 && !achievements.find(a => a.type === 'bronze')) {
      newAchievements.push({
        user_id: user!.id,
        type: 'bronze',
        title: 'Bronze Achiever',
        description: 'Completed 5 tasks',
        icon: 'trophy'
      });
    }

    if (completedCount >= 20 && !achievements.find(a => a.type === 'silver')) {
      newAchievements.push({
        user_id: user!.id,
        type: 'silver',
        title: 'Silver Champion',
        description: 'Completed 20 tasks',
        icon: 'trophy'
      });
    }

    if (completedCount >= 50 && !achievements.find(a => a.type === 'gold')) {
      newAchievements.push({
        user_id: user!.id,
        type: 'gold',
        title: 'Gold Master',
        description: 'Completed 50 tasks',
        icon: 'trophy'
      });
    }

    if (efficiency >= 100 && !achievements.find(a => a.type === 'efficient')) {
      newAchievements.push({
        user_id: user!.id,
        type: 'efficient',
        title: 'Time Master',
        description: 'Achieved 100% efficiency',
        icon: 'target'
      });
    }

    if (newAchievements.length > 0) {
      const { data } = await supabase.from('achievements').insert(newAchievements).select();
      if (data) {
        setAchievements([...data, ...achievements]);
      }
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReminder.title || !newReminder.due_date) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...newReminder, user_id: user.id }])
        .select();

      if (error) throw error;

      if (data) {
        setReminders([...reminders, ...data]);
        setNewReminder({ title: '', description: '', reminder_type: 'general', due_date: '' });
        setShowReminderForm(false);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: true })
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(reminders.filter(r => r.id !== reminderId));
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'client_call': return <Users size={16} />;
      case 'finance_update': return <DollarSign size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Ring - Apple Fitness Style */}
      <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Performance</h3>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#gradient1)"
                  strokeWidth="8"
                  strokeDasharray={`${(stats.tasksCompleted / Math.max(tasks.length, 1)) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Trophy className="text-orange-500 mb-1" size={20} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasksCompleted}</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="font-semibold text-gray-900 dark:text-white">Tasks</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            </div>
          </div>

          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#gradient2)"
                  strokeWidth="8"
                  strokeDasharray={`${(stats.currentStreak / 30) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Flame className="text-red-500 mb-1" size={20} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="font-semibold text-gray-900 dark:text-white">Day Streak</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Keep it up!</div>
            </div>
          </div>

          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#gradient3)"
                  strokeWidth="8"
                  strokeDasharray={`${(stats.totalHours / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Clock className="text-blue-500 mb-1" size={20} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.totalHours)}</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="font-semibold text-gray-900 dark:text-white">Hours</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tracked</div>
            </div>
          </div>

          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#gradient4)"
                  strokeWidth="8"
                  strokeDasharray={`${(stats.efficiency / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Target className="text-green-500 mb-1" size={20} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.efficiency}%</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="font-semibold text-gray-900 dark:text-white">Efficiency</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="mr-2 text-yellow-500" size={24} />
            Achievements
          </h3>

          {achievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy className="mx-auto mb-2 opacity-50" size={40} />
              <p>Complete tasks to earn achievements!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r ${getAchievementColor(achievement.type)} bg-opacity-10`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAchievementColor(achievement.type)} flex items-center justify-center shadow-lg`}>
                    <Trophy className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{achievement.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Calendar className="mr-2 text-blue-500" size={24} />
              Reminders
            </h3>
            <button
              onClick={() => setShowReminderForm(!showReminderForm)}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {showReminderForm && (
            <form onSubmit={handleAddReminder} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <select
                value={newReminder.reminder_type}
                onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="client_call">Client Call</option>
                <option value="finance_update">Finance Update</option>
              </select>
              <input
                type="datetime-local"
                value={newReminder.due_date}
                onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowReminderForm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="mx-auto mb-2 opacity-50" size={40} />
              <p>No upcoming reminders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {getReminderIcon(reminder.reminder_type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{reminder.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(reminder.due_date)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteReminder(reminder.id)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Performance;
