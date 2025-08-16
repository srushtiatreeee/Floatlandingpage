import React from 'react';
import { UserPlus, Calendar, MessageCircle, CreditCard } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const categories = [
    { name: 'Hosting', active: false },
    { name: 'Management', active: true },
    { name: 'Results', active: false }
  ];

  const features = [
    {
      title: 'Track time',
      description: 'Create your projects over time tracking flow automatically.',
      gradient: 'from-blue-400 via-blue-500 to-cyan-500'
    },
    {
      title: 'Performance', 
      description: 'Manage your finance your track and increase your efficiency.',
      gradient: 'from-purple-400 via-purple-500 to-pink-500'
    },
    {
      title: 'Reports',
      description: 'Generate all kind of reports on your important projects.',
      gradient: 'from-cyan-400 via-blue-500 to-blue-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-gradient-to-br from-emerald-200 to-blue-300 rounded-full opacity-10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Category Navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  category.active
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Let Your Space Do The Walking.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Effortlessly create an easy project on our work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                {/* Gradient Shape */}
                <div className={`w-full h-32 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl"></div>
                  {/* Organic shapes */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/15 rounded-full blur-lg"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  {feature.title}
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;