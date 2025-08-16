import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              Float
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Explore
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Start organizing your work today with Float—sign up free
          </p>
          
          <button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Get Started Free
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Ready to get started?</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Download</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Services</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Web designing</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Development</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">WordPress</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Online Marketing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">About</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Benefits</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Help</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Terms & Conditions | Privacy Policy
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 md:mt-0">
              © 2024 Float. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;