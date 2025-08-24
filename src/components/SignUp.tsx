import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, MapPin, Phone, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface SignUpProps {
  onBackToHome: () => void;
  onSignUpSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBackToHome, onSignUpSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { signUp } = useAuth();

  const professions = [
    'UI/UX Designer',
    'Web Developer',
    'Mobile Developer',
    'Graphic Designer',
    'Content Writer',
    'Digital Marketer',
    'Photographer',
    'Video Editor',
    'Consultant',
    'Other'
  ];

  const experienceLevels = [
    'Just starting out (0-1 years)',
    'Getting established (1-3 years)',
    'Experienced (3-5 years)',
    'Seasoned professional (5+ years)'
  ];

  const projectTypeOptions = [
    'Web Design',
    'Mobile Apps',
    'Branding',
    'E-commerce',
    'Content Creation',
    'Marketing',
    'Consulting',
    'Development'
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
    { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
    { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
    { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48' }
  ];

  const popularCities = [
    'New York, NY, USA',
    'Los Angeles, CA, USA',
    'London, UK',
    'Toronto, ON, Canada',
    'Sydney, NSW, Australia',
    'Berlin, Germany',
    'Paris, France',
    'Amsterdam, Netherlands',
    'Barcelona, Spain',
    'Milan, Italy',
    'Stockholm, Sweden',
    'Copenhagen, Denmark',
    'Zurich, Switzerland',
    'Dublin, Ireland',
    'Singapore',
    'Tokyo, Japan',
    'Seoul, South Korea',
    'Mumbai, India',
    'São Paulo, Brazil',
    'Mexico City, Mexico',
    'Cape Town, South Africa',
    'Dubai, UAE',
    'Tel Aviv, Israel',
    'Warsaw, Poland',
    'Remote/Worldwide'
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: '',
    company: '',
    location: '',
    countryCode: '+1',
    phone: '',
    experience: '',
    projectTypes: [] as string[],
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectTypeToggle = (type: string) => {
    const updatedTypes = formData.projectTypes.includes(type)
      ? formData.projectTypes.filter(t => t !== type)
      : [...formData.projectTypes, type];
    handleInputChange('projectTypes', updatedTypes);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          profession: formData.profession,
          company: formData.company,
          location: formData.location,
          phone: formData.phone,
          experience: formData.experience,
          project_types: formData.projectTypes,
          subscribe_newsletter: formData.subscribeNewsletter
        }
      );

      if (signUpError) {
        // Handle rate limit error specifically
        if (signUpError.message.includes('over_email_send_rate_limit')) {
          setError('Too many signup attempts. Please wait a few moments before trying again.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            profession: formData.profession,
            company: formData.company,
            location: formData.location,
            phone: formData.phone,
            experience: formData.experience,
            project_types: formData.projectTypes
          });

        if (profileError) {
          // Handle RLS policy violation specifically
          if (profileError.message.includes('row-level security policy')) {
            setError('Account created successfully, but profile setup encountered an issue. Please try logging in.');
          } else {
            console.error('Profile creation error:', profileError);
          }
        } else {
          // Only call success if both auth and profile creation succeeded
          setShowEmailConfirmation(true);
          setLoading(false);
          return;
        }
      }

      // If we reach here, auth succeeded but profile creation failed
      // Still consider it a partial success
      setShowEmailConfirmation(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (errorMessage.includes('over_email_send_rate_limit')) {
        setError('Too many signup attempts. Please wait a few moments before trying again.');
      } else {
        setError(errorMessage);
      }
    }

    setLoading(false);
  };
  const renderStepIndicator = () => (
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-40 left-20 w-64 h-64 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-20 right-32 w-80 h-80 bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 rounded-full opacity-10 blur-3xl"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Float Logo */}
            <div className="text-center">
              <button 
                onClick={onBackToHome}
                className="inline-flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  Float
                </div>
              </button>
            </div>

            {/* Email Confirmation Message */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Check Your Email
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We've sent a confirmation link to <strong>{formData.email}</strong>. 
                Please check your email and click the link to verify your account before signing in.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  <strong>Don't see the email?</strong> Check your spam folder or wait a few minutes for it to arrive.
                </p>
              </div>
              
              <button
                onClick={onBackToHome}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
            step <= currentStep
              ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            {step < currentStep ? <Check size={20} /> : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
              step < currentStep
                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create your account
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Let's get started with your basic information
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
              placeholder="Enter your first name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
              placeholder="Enter your last name"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
            placeholder="Enter your email address"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Professional Details
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us about your freelance work
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Profession
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-300"
          >
            <option value="">Select your profession</option>
            {professions.map((prof) => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Company/Business Name (Optional)
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
            placeholder="Your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-300"
          >
            <option value="">Select your location</option>
            {popularCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Phone Number (Optional)
        </label>
        <div className="flex space-x-2">
          <select
            value={formData.countryCode}
            onChange={(e) => handleInputChange('countryCode', e.target.value)}
            className="w-32 px-3 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-300"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.dialCode}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
              placeholder="123-456-7890"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Experience Level
        </label>
        <select
          value={formData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-300"
        >
          <option value="">Select your experience level</option>
          {experienceLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Project Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          What types of projects do you work on?
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Select Project Types (Choose all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {projectTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleProjectTypeToggle(type)}
              className={`p-3 rounded-2xl border-2 transition-all duration-300 text-sm font-medium ${
                formData.projectTypes.includes(type)
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="agree-terms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
          />
          <label htmlFor="agree-terms" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <a href="#" className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="subscribe-newsletter"
            type="checkbox"
            checked={formData.subscribeNewsletter}
            onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
          />
          <label htmlFor="subscribe-newsletter" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            Subscribe to our newsletter for tips and updates
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-40 left-20 w-64 h-64 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-full opacity-15 blur-2xl"></div>
      <div className="absolute bottom-20 right-32 w-80 h-80 bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 rounded-full opacity-10 blur-3xl"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Float Logo */}
          <div className="text-center">
            <button 
              onClick={onBackToHome}
              className="inline-flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                Float
              </div>
            </button>
          </div>

          {/* Sign Up Form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
            {renderStepIndicator()}

            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Previous
                  </button>
                )}
                
                <div className="flex-1 flex justify-end">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="group bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                    >
                      Next Step
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!formData.agreeToTerms}
                      className="group bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center disabled:transform-none"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a href="#" className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;