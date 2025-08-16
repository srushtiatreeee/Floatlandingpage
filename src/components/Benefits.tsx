import React from 'react';
import { CheckCircle, Bell, FileText, Sparkles } from 'lucide-react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: CheckCircle,
      title: 'Stay Organized',
      description: 'Manage all tasks, deadlines, and projects in one streamlined dashboard',
      color: 'text-emerald-500'
    },
    {
      icon: Bell,
      title: 'Never Miss a Client Follow-up',
      description: 'Smart reminders ensure opportunities never slip away',
      color: 'text-blue-500'
    },
    {
      icon: FileText,
      title: 'Simplified Invoicing',
      description: 'Create, send, and track invoices with ease',
      color: 'text-yellow-500'
    },
    {
      icon: Sparkles,
      title: 'Less Admin, More Creation',
      description: 'Free up time to focus on the work you love',
      color: 'text-purple-500'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to run your business
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From task management to client relations, Float handles it all
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="group p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
              <div className={`w-16 h-16 ${benefit.color} mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                <benefit.icon size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;