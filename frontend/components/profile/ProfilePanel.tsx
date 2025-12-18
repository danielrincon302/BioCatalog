'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { profileApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Phone, MessageCircle, Image, Lock, Save, Building2, Shield, X } from 'lucide-react';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, refreshUser } = useAuth();
  const { t, translateRole } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    whatsapp: '',
    avatar_url: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        whatsapp: user.whatsapp || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setError('');
      setPasswordMessage('');
      setPasswordError('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await profileApi.update(formData);
      await refreshUser();
      setMessage(t.profile.profileUpdated);
    } catch (err: any) {
      setError(err.response?.data?.message || t.messages.errorSaving);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError(t.auth.passwordsDoNotMatch);
      return;
    }

    if (passwordData.password.length < 6) {
      setPasswordError(t.auth.passwordTooShort);
      return;
    }

    setIsPasswordLoading(true);

    try {
      await profileApi.updatePassword(passwordData);
      setPasswordMessage(t.profile.passwordUpdated);
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || t.profile.currentPasswordIncorrect);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">{t.profile.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info Header */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-4">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user?.company?.name || '-'}
                  </span>
                  <span className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role ? translateRole(user.role.name) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.profile.editProfile}
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.profile.changePassword}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <User className="inline h-4 w-4 mr-1" />
                    {t.profile.name} *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    {t.profile.mobile}
                  </label>
                  <Input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <MessageCircle className="inline h-4 w-4 mr-1" />
                    {t.profile.whatsapp}
                  </label>
                  <Input
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Image className="inline h-4 w-4 mr-1" />
                    {t.profile.avatarUrl}
                  </label>
                  <Input
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.profile.avatarUrlHint}</p>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? t.common.loading : t.profile.saveChanges}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordMessage && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                    {passwordMessage}
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {passwordError}
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-4">
                  {t.profile.changePasswordDescription}
                </p>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.profile.currentPassword} *
                  </label>
                  <Input
                    name="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.auth.newPassword} *
                  </label>
                  <Input
                    name="password"
                    type="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.auth.confirmPassword} *
                  </label>
                  <Input
                    name="password_confirmation"
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" variant="outline" disabled={isPasswordLoading}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isPasswordLoading ? t.common.loading : t.profile.updatePassword}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
