import React, { useState, useRef, useEffect } from 'react';
import { User, Upload, Camera, X, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadProfileImage();
    }
  }, [user]);

  const loadProfileImage = async () => {
    if (!user) return;

    try {
      // Check if bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError || !buckets?.some(bucket => bucket.name === 'profile-pictures')) {
        return; // Bucket doesn't exist, skip loading
      }

      const { data: files, error } = await supabase.storage
        .from('profile-pictures')
        .list(`${user.id}/`, {
          limit: 10,
          search: 'profile'
        });

      if (error || !files || files.length === 0) {
        return;
      }

      const profileFile = files.find(file => file.name.startsWith('profile.'));
      if (profileFile) {
        const { data } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${user.id}/${profileFile.name}`);
        
        setProfileImageUrl(data.publicUrl);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      // Check if bucket exists before upload
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError || !buckets?.some(bucket => bucket.name === 'profile-pictures')) {
        throw new Error('Profile picture storage is not available. Please contact support.');
      }

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

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfileImageUrl(data.publicUrl);
      setUploadSuccess(true);
      
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your profile picture
          </p>
        </div>

        {/* Profile Picture Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Profile Picture
            </h2>
            
            {/* Rounded Image Preview */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 shadow-lg ring-4 ring-white dark:ring-gray-800">
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

            {/* Centered Upload Button */}
            <div className="space-y-6">
              <button
                onClick={handleFileSelect}
                disabled={uploading}
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3 mx-auto"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Upload Profile Picture</span>
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
                Supported formats: JPG, PNG, GIF, WebP • Max size: 5MB
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
      </div>
    </div>
  );
};

export default ProfilePage;