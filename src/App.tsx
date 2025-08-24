import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import SocialProof from './components/SocialProof';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Login from './components/Login';
import SignUp from './components/SignUp';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (showSignUp) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
      }`}>
        <SignUp onBackToHome={() => setShowSignUp(false)} />
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
      }`}>
        <Login onBackToHome={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onLoginClick={() => setShowLogin(true)}
        onSignUpClick={() => setShowSignUp(true)}
      />
      <Hero />
      <Benefits />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;