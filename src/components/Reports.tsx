import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Send, Check, Clock, Download, Plus, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Subtask = Database['public']['Tables']['subtasks']['Row'];

interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [newInvoice, setNewInvoice] = useState({
    client_name: '',
    amount: '',
    due_date: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [invoicesRes, tasksRes, subtasksRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('subtasks').select('*').eq('user_id', user.id)
      ]);

      if (invoicesRes.data) setInvoices(invoicesRes.data);

      if (tasksRes.data && subtasksRes.data) {
        const tasksWithSubtasks: TaskWithSubtasks[] = tasksRes.data.map(task => ({
          ...task,
          subtasks: subtasksRes.data.filter(st => st.parent_task_id === task.id)
        }));
        setTasks(tasksWithSubtasks);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskCost = (task: TaskWithSubtasks, hourlyRate: number = 50) => {
    const taskHours = Number(task.actual_hours) || Number(task.estimated_hours) || 0;
    const subtaskHours = task.subtasks.reduce((sum, st) =>
      sum + (Number(st.actual_hours) || Number(st.estimated_hours) || 0), 0
    );
    return (taskHours + subtaskHours) * hourlyRate;
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newInvoice.client_name || !newInvoice.amount || !newInvoice.due_date) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          task_id: selectedTask || null,
          client_name: newInvoice.client_name,
          amount: parseFloat(newInvoice.amount),
          due_date: newInvoice.due_date,
          notes: newInvoice.notes,
          status: 'draft'
        }])
        .select();

      if (error) throw error;

      if (data) {
        setInvoices([...data, ...invoices]);
        setNewInvoice({ client_name: '', amount: '', due_date: '', notes: '' });
        setSelectedTask('');
        setShowInvoiceForm(false);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleAutoGenerateInvoice = (task: TaskWithSubtasks) => {
    const estimatedCost = calculateTaskCost(task);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    setNewInvoice({
      client_name: '',
      amount: estimatedCost.toFixed(2),
      due_date: dueDate.toISOString().split('T')[0],
      notes: `Invoice for: ${task.title}\n\nTask Hours: ${Number(task.actual_hours) || Number(task.estimated_hours) || 0}h\nSubtasks: ${task.subtasks.length}\nTotal Hours: ${(Number(task.actual_hours) || Number(task.estimated_hours) || 0) + task.subtasks.reduce((sum, st) => sum + (Number(st.actual_hours) || Number(st.estimated_hours) || 0), 0)}h`
    });
    setSelectedTask(task.id);
    setShowInvoiceForm(true);
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const updateData: any = { status };

      if (status === 'sent' && !invoices.find(inv => inv.id === invoiceId)?.sent_date) {
        updateData.sent_date = new Date().toISOString();
      }

      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(invoices.map(inv =>
        inv.id === invoiceId ? { ...inv, ...updateData } : inv
      ));
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <Check size={16} />;
      case 'sent': return <Send size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0);
  const pendingRevenue = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + Number(inv.amount), 0);
  const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={32} />
            <TrendingUp size={24} className="opacity-70" />
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
          <div className="text-green-100">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Send size={32} />
            <Clock size={24} className="opacity-70" />
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(pendingRevenue)}</div>
          <div className="text-blue-100">Pending Payment</div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FileText size={32} />
            <AlertCircle size={24} className="opacity-70" />
          </div>
          <div className="text-3xl font-bold mb-1">{draftInvoices}</div>
          <div className="text-orange-100">Draft Invoices</div>
        </div>
      </div>

      {/* Quick Generate from Tasks */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Generate Invoice</h3>

        {tasks.filter(t => t.status === 'done').length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="mx-auto mb-2 opacity-50" size={40} />
            <p>Complete tasks to generate invoices</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter(t => t.status === 'done').slice(0, 6).map((task) => {
              const estimatedCost = calculateTaskCost(task);
              const totalHours = (Number(task.actual_hours) || Number(task.estimated_hours) || 0) +
                task.subtasks.reduce((sum, st) => sum + (Number(st.actual_hours) || Number(st.estimated_hours) || 0), 0);

              return (
                <button
                  key={task.id}
                  onClick={() => handleAutoGenerateInvoice(task)}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{task.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Hours:</span>
                      <span className="font-medium">{totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Est. Cost:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(estimatedCost)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Form */}
      {showInvoiceForm && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Invoice</h3>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={newInvoice.client_name}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Create Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceForm(false);
                  setNewInvoice({ client_name: '', amount: '', due_date: '', notes: '' });
                  setSelectedTask('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showInvoiceForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowInvoiceForm(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Manual Invoice</span>
          </button>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Invoices</h3>

        {invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="mx-auto mb-4 opacity-50" size={48} />
            <p className="text-lg">No invoices yet</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{invoice.client_name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Due: {formatDate(invoice.due_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(Number(invoice.amount))}</div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg whitespace-pre-line">
                    {invoice.notes}
                  </div>
                )}

                <div className="flex space-x-2">
                  {invoice.status === 'draft' && (
                    <button
                      onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <Send size={16} />
                      <span>Mark as Sent</span>
                    </button>
                  )}
                  {invoice.status === 'sent' && (
                    <button
                      onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <Check size={16} />
                      <span>Mark as Paid</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
