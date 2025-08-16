import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const SocialProof: React.FC = () => {
  const testimonials = [
    {
      title: 'Todoist Direct, Less Clutter.',
      description: 'Todoist helped me organize and prioritize my tasks in a way that made sense to me.',
      gradient: 'from-purple-400 via-purple-500 to-pink-500'
    },
    {
      title: 'Software With Saas',
      description: 'Seamless tracking your time and project management service.',
      gradient: 'from-blue-400 via-blue-500 to-cyan-500'
    },
    {
      title: 'Because Saas Can\'t Drive.',
      description: 'Seamless tracking your time and project management service.',
      gradient: 'from-emerald-400 via-emerald-500 to-teal-500'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left side testimonials */}
          <div className="space-y-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    {testimonial.title}
                    <ArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {testimonial.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Main feature */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
              {/* Large gradient shape */}
              <div className="w-full h-64 bg-gradient-to-br from-purple-300 via-purple-400 to-pink-400 rounded-2xl mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
                {/* Organic flowing shapes */}
                <div className="absolute top-8 left-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-8 right-8 w-24 h-24 bg-white/15 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                I Feel Like Saas Tonight.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Seamless tracking your time and project management service.
              </p>
              
              <div className="flex items-center space-x-4">
                <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-3 bg-gray-900 dark:bg-white rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  <ArrowRight size={20} className="text-white dark:text-gray-900" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 p-16 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white dark:text-gray-900 mb-6">
              Ready to get started?
            </h3>
            <p className="text-xl text-gray-300 dark:text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers who've transformed their productivity with Float
            </p>
            <button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;