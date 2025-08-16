import React from 'react';
import { ArrowRight, Play, Zap, Users, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-40 right-32 w-64 h-64 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-full opacity-15 blur-2xl"></div>
      
      <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh] relative z-10">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              It's The{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Bright
              </span>
              <br />
              One, It's The<br />
              Right One.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              AI-enhanced workstream management that's bringing 
              freelancers to the most efficient way 
              possible.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="group bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
              Get Started
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center space-x-8 pt-8 opacity-60">
            <div className="text-sm text-gray-500 dark:text-gray-400">Already using</div>
            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Dribbble</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Figma</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Framer</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Webflow</div>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative flex justify-center items-center">
          <div className="relative w-80 h-80">
            {/* Main organic shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-full opacity-80 blur-xl transform rotate-12"></div>
            <div className="absolute inset-4 bg-gradient-to-tr from-orange-200 via-orange-300 to-orange-400 rounded-full opacity-90 blur-lg transform -rotate-6"></div>
            <div className="absolute inset-8 bg-gradient-to-bl from-white via-orange-100 to-orange-200 rounded-full shadow-2xl transform rotate-3"></div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-lg transform rotate-12 opacity-80"></div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl shadow-lg transform -rotate-12 opacity-70"></div>
            <div className="absolute top-1/2 -right-8 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg shadow-md transform rotate-45 opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;