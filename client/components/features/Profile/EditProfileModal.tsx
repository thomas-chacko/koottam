'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useUpdateProfile } from '@/hooks/useUser';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentProfile: {
    full_name: string;
    bio: string;
    location: string;
    website: string;
  };
}

export function EditProfileModal({ isOpen, onClose, onSuccess, currentProfile }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
  });

  const { updateProfile, updating } = useUpdateProfile();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: currentProfile.full_name || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        website: currentProfile.website || '',
      });
    }
  }, [isOpen, currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProfile(formData);
    if (success) {
      onSuccess?.(); // Trigger refetch in parent component
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              disabled={updating}
              className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Edit Profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={updating}
            className="px-6 py-2 bg-[#8B5CF6] text-white font-semibold rounded-full hover:bg-[#7c4ee6] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-[#9ca3af] mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              maxLength={50}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              placeholder="Enter your full name"
            />
            <p className="text-xs text-[#6b7280] mt-1">{formData.full_name.length}/50</p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-[#9ca3af] mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={160}
              rows={4}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
              placeholder="Tell us about yourself"
            />
            <p className="text-xs text-[#6b7280] mt-1">{formData.bio.length}/160</p>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[#9ca3af] mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              maxLength={30}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              placeholder="Where are you from?"
            />
            <p className="text-xs text-[#6b7280] mt-1">{formData.location.length}/30</p>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-[#9ca3af] mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              placeholder="https://yourwebsite.com"
            />
            <p className="text-xs text-[#6b7280] mt-1">{formData.website.length}/100</p>
          </div>
        </form>
      </div>
    </div>
  );
}
