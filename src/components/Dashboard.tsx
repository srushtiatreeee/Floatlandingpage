import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Edit3, MapPin, Briefcase, Phone, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, setDarkMode }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Float
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {profile?.first_name || user?.email?.split('@')[0]}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {profile?.first_name || 'there'}! 👋
              </h1>
              <p className="text-orange-100 text-lg">
                Ready to manage your freelance work with Float?
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : user?.email?.split('@')[0]
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile?.profession || 'Freelancer'}
                </p>
              </div>

              <div className="space-y-4">
                {user?.email && (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Mail size={18} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
                
                {profile?.location && (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <MapPin size={18} />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                
                {profile?.company && (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Briefcase size={18} />
                    <span className="text-sm">{profile.company}</span>
                  </div>
                )}
                
                {profile?.phone && (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Phone size={18} />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
              </div>

              <button className="w-full mt-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
                <Edit3 size={18} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Projects</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Projects in progress</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">This Month</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">42</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Hours tracked</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">$</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">$3,240 this month</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">7</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Types */}
        {profile?.project_types && profile.project_types.length > 0 && (
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Expertise</h3>
              <div className="flex flex-wrap gap-3">
                {profile.project_types.map((type, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white p-6 rounded-3xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Start New Project
          </button>
          
          <button className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-6 rounded-3xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Track Time
          </button>
          
          <button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white p-6 rounded-3xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Generate Invoice
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;