'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { profileApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Phone, MessageCircle, Image, Lock, Save, Building2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t, translateRole } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      setMessage(t.profile.profileUpdated);
      if (refreshUser) {
        await refreshUser();
      }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.profile.title}</h1>
        <p className="text-gray-500">{t.profile.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t.profile.accountInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{t.profile.zone}:</span>
                <span className="ml-auto font-medium">{user?.company?.name || '-'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{t.profile.role}:</span>
                <span className="ml-auto font-medium">{user?.role ? translateRole(user.role.name) : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t.profile.editProfile}</CardTitle>
            <CardDescription>{t.profile.editProfileDescription}</CardDescription>
          </CardHeader>
          <CardContent>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? t.common.loading : t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              {t.profile.changePassword}
            </CardTitle>
            <CardDescription>{t.profile.changePasswordDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
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
                <Button type="submit" variant="outline" disabled={isPasswordLoading}>
                  <Lock className="h-4 w-4 mr-2" />
                  {isPasswordLoading ? t.common.loading : t.profile.updatePassword}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
