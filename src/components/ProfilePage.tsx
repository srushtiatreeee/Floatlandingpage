import React, { useState, useRef } from 'react';
import { User, Upload, Camera, X, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfilePageProps {
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onProfileUpdate }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get profile image URL from Supabase Storage
  React.useEffect(() => {
    if (profile?.id) {
      checkStorageAndGetImage();
    }
  }, [profile?.id]);

  const checkStorageAndGetImage = async () => {
    if (!profile?.id) return;

    try {
      // First check if the bucket exists by trying to list it
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log('Storage not accessible:', listError.message);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'profile-pictures');
      
      if (!bucketExists) {
        console.log('Profile pictures bucket does not exist');
        return;
      }

      setStorageAvailable(true);

      // Now try to get the profile image
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`${profile.id}/profile.jpg`);
      
      // Check if image is accessible
      const response = await fetch(data.publicUrl);
      if (response.ok && response.status !== 404) {
        setProfileImageUrl(data.publicUrl);
      }
    } catch (error) {
      console.log('Storage check failed:', error);
    }
  };

  const handleFileSelect = () => {
    if (!storageAvailable) {
      setUploadError('Profile picture storage is not available. Please contact support.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !storageAvailable) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfileImageUrl(data.publicUrl);
      setUploadSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture Upload Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Profile Picture
          </h2>
          
          {/* Profile Image Preview */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 shadow-lg">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImageUrl(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Camera overlay on hover */}
              <button
                onClick={handleFileSelect}
                disabled={uploading}
                className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center group disabled:cursor-not-allowed"
              >
                <Camera className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Upload Button */}
          <div className="space-y-4">
            <button
              onClick={handleFileSelect}
              disabled={uploading || !storageAvailable}
              className={`group ${
                storageAvailable 
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600' 
                  : 'bg-gray-400'
              } disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto`}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{storageAvailable ? 'Upload Profile Picture' : 'Storage Not Available'}</span>
                </>
              )}
            </button>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Guidelines */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {storageAvailable 
                ? 'Supported formats: JPG, PNG, GIF • Max size: 5MB'
                : 'Profile picture storage needs to be configured'
              }
            </p>
          </div>

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Profile picture updated successfully!</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
                <X className="w-5 h-5" />
                <span className="font-medium">{uploadError}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Profile Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
              {profile?.first_name || 'Not set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
              {profile?.last_name || 'Not set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Profession
            </label>
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
              {profile?.profession || 'Not set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
              {profile?.company || 'Not set'}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
              {profile?.location || 'Not set'}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Experience Level
            </label>
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
              {profile?.experience || 'Not set'}
            </div>
          </div>

          {profile?.project_types && profile.project_types.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Project Types
              </label>
              <div className="flex flex-wrap gap-2">
                {profile.project_types.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;