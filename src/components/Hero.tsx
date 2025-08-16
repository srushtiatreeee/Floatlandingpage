import React from 'react';
import { ArrowRight, Play, Zap, Users, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              An AI workstream manager built for your{' '}
              <span className="text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                productivity
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Turn chaos into clarity—manage tasks, clients, and invoices effortlessly. 
              Replace your manager, assistant, and accountant with one intelligent AI solution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center">
              Start Your Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center">
              <Play className="mr-2 group-hover:scale-110 transition-transform" size={20} />
              Watch Demo
            </button>
          </div>

          <div className="flex items-center space-x-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">10k+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9★</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">50%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time Saved</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { task: 'Client proposal review', status: 'completed', priority: 'high' },
                  { task: 'Invoice for Project Alpha', status: 'pending', priority: 'medium' },
                  { task: 'Follow up with prospect', status: 'scheduled', priority: 'high' },
                  { task: 'Design mockup delivery', status: 'in-progress', priority: 'low' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'completed' ? 'bg-emerald-500' :
                      item.status === 'in-progress' ? 'bg-blue-500' :
                      item.status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.task}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.status}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {item.priority}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">3 clients active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">+12% this week</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-3xl transform rotate-1 opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl transform -rotate-1 opacity-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;