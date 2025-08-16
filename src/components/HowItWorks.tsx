import React from 'react';
import { UserPlus, Calendar, MessageCircle, CreditCard } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Sign Up & Set Up',
      description: 'Create your Float account and connect your projects and clients',
      color: 'bg-blue-500'
    },
    {
      number: 2,
      icon: Calendar,
      title: 'Track Tasks & Deadlines',
      description: 'Add tasks or sync with your calendar for seamless tracking',
      color: 'bg-emerald-500'
    },
    {
      number: 3,
      icon: MessageCircle,
      title: 'Automate Follow-ups',
      description: 'Let Float remind you to reconnect with clients and close deals',
      color: 'bg-yellow-500'
    },
    {
      number: 4,
      icon: CreditCard,
      title: 'Manage Invoices',
      description: 'Generate and send invoices directly from the platform',
      color: 'bg-purple-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How Float Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started in minutes, not hours
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 ${step.color} text-white rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                  <step.icon size={32} />
                </div>
                <div className={`w-8 h-8 ${step.color} text-white rounded-full flex items-center justify-center text-sm font-bold absolute -top-4 -left-4 shadow-lg`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"></div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;