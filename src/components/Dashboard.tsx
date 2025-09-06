import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Edit3, MapPin, Briefcase, Phone, Mail, Sun, Moon, CheckSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import TaskTracker from './TaskTracker';
import ProfilePage from './ProfilePage';
import Hero from './Hero';
import Benefits from './Benefits';
import HowItWorks from './HowItWorks';
import SocialProof from './SocialProof';
import FAQ from './FAQ';
import Footer from './Footer';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, setDarkMode }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

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
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        // No profile exists, create one
        const newProfile = {
          id: user.id,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          profession: null,
          company: null,
          location: null,
          phone: null,
          experience: null,
          project_types: []
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(createdProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't throw the error, just log it and continue
      // This prevents the app from breaking if Supabase is temporarily unavailable
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
      {/* Header - Consistent with landing page */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Float
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setShowProfile(false)}
                className={`text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium ${
                  !showProfile ? 'text-orange-500 dark:text-orange-400' : ''
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => setShowProfile(true)}
                className={`text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium ${
                  showProfile ? 'text-orange-500 dark:text-orange-400' : ''
                }`}
              >
                Profile
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
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
                  className="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </nav>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-700 dark:text-gray-300"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showProfile ? (
        /* Profile View */
        <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your profile information and settings
              </p>
            </div>
            <ProfilePage 
              profile={profile} 
              onProfileUpdate={setProfile}
            />
          </div>
        </main>
      ) : (
        /* Landing Page Content */
        <>
          <Hero onGetStartedClick={() => setShowProfile(true)} />
          <Benefits />
          <HowItWorks />
          <SocialProof />
          <FAQ />
          <Footer />
        </>
      )}
    </div>
  );
};

export default Dashboard;