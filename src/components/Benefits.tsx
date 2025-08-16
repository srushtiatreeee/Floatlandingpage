import React from 'react';
import { CheckCircle, Bell, FileText, Sparkles } from 'lucide-react';

const Benefits: React.FC = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Let Your Space Do The Walking.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Effortlessly create an easy project on our work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Track time',
              description: 'Create your projects over time tracking flow automatically.',
              gradient: 'from-blue-400 via-blue-500 to-cyan-500',
              icon: CheckCircle
            },
            {
              title: 'Performance',
              description: 'Manage your finance your track and increase your efficiency.',
              gradient: 'from-purple-400 via-purple-500 to-pink-500',
              icon: Bell
            },
            {
              title: 'Reports',
              description: 'Generate all kind of reports on your important projects.',
              gradient: 'from-cyan-400 via-blue-500 to-blue-600',
              icon: FileText
            }
          ].map((benefit, index) => (
            <div key={index} className="group relative">
              {/* Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                {/* Gradient Shape */}
                <div className={`w-full h-32 bg-gradient-to-br ${benefit.gradient} rounded-2xl mb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl"></div>
                  <div className="absolute bottom-4 right-4">
                    <benefit.icon className="text-white/80" size={24} />
                  </div>
                  {/* Organic shapes */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/15 rounded-full blur-lg"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  {benefit.title}
                  <ArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;