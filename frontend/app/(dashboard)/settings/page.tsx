'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { settingsApi, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings, Type, Image, Upload, Trash2, Save, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    catalog_title: '',
    catalog_title_en: '',
    favicon_url: '',
    logo_url: '',
  });

  useEffect(() => {
    if (user && !isSuperAdmin() && !isAdmin()) {
      router.push('/items');
      return;
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.get();
      if (response.data.success) {
        setSettings({
          catalog_title: response.data.data.catalog_title || '',
          catalog_title_en: response.data.data.catalog_title_en || '',
          favicon_url: response.data.data.favicon_url || '',
          logo_url: response.data.data.logo_url || '',
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      await settingsApi.update({
        catalog_title: settings.catalog_title,
        catalog_title_en: settings.catalog_title_en,
      });
      setMessage(t.settings.savedSuccessfully);
    } catch (err: any) {
      setError(err.response?.data?.message || t.settings.errorSaving);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'favicon' | 'logo') => {
    setError('');
    setMessage('');

    if (file.size > 2 * 1024 * 1024) {
      setError(t.items.fileTooLarge);
      return;
    }

    try {
      const response = await settingsApi.uploadImage(file, type);
      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          [type === 'favicon' ? 'favicon_url' : 'logo_url']: response.data.data.url,
        }));
        setMessage(t.settings.imageUploaded);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t.settings.errorUploading);
    }
  };

  const handleImageDelete = async (type: 'favicon' | 'logo') => {
    setError('');
    setMessage('');

    try {
      await settingsApi.deleteImage(type);
      setSettings((prev) => ({
        ...prev,
        [type === 'favicon' ? 'favicon_url' : 'logo_url']: '',
      }));
      setMessage(t.settings.imageDeleted);
    } catch (err: any) {
      setError(err.response?.data?.message || t.settings.errorDeleting);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'favicon' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t.common.loading}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t.settings.title}
        </h1>
        <p className="text-gray-500">{t.settings.subtitle}</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catalog Title Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="h-5 w-5" />
              {t.settings.catalogTitle}
            </CardTitle>
            <CardDescription>{t.settings.catalogTitleHint}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Globe className="inline h-4 w-4 mr-1" />
                  {t.settings.catalogTitleEs}
                </label>
                <Input
                  name="catalog_title"
                  value={settings.catalog_title}
                  onChange={handleChange}
                  placeholder="Catálogo de Biodiversidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Globe className="inline h-4 w-4 mr-1" />
                  {t.settings.catalogTitleEn}
                </label>
                <Input
                  name="catalog_title_en"
                  value={settings.catalog_title_en}
                  onChange={handleChange}
                  placeholder="Biodiversity Catalog"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? t.settings.saving : t.settings.saveChanges}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Favicon Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5" />
              {t.settings.favicon}
            </CardTitle>
            <CardDescription>{t.settings.faviconHint}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings.favicon_url ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{t.settings.currentImage}:</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-50">
                      <img
                        src={getImageUrl(settings.favicon_url)}
                        alt="Favicon"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleImageDelete('favicon')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.settings.removeImage}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">{t.settings.noImage}</div>
              )}

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary cursor-pointer transition-colors"
                onClick={() => faviconInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{t.settings.dragOrClick}</p>
                <p className="text-xs text-gray-400 mt-1">{t.settings.imageRequirements}</p>
              </div>
              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.gif,.svg,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'favicon')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5" />
              {t.settings.logo}
            </CardTitle>
            <CardDescription>{t.settings.logoHint}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {settings.logo_url ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{t.settings.currentImage}:</p>
                    <div className="flex items-start gap-4">
                      <div className="w-48 h-32 border rounded-lg flex items-center justify-center bg-gray-50 p-2">
                        <img
                          src={getImageUrl(settings.logo_url)}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleImageDelete('logo')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.settings.removeImage}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{t.settings.noImage}</div>
                )}

                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary cursor-pointer transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">{t.settings.dragOrClick}</p>
                  <p className="text-xs text-gray-400 mt-1">{t.settings.imageRequirements}</p>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.gif,.svg,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'logo')}
                />
              </div>

              {/* Preview */}
              <div className="hidden md:block">
                <p className="text-sm font-medium mb-2">Vista previa en el catálogo:</p>
                <div className="border rounded-lg bg-gray-50 p-4 w-64">
                  {settings.logo_url ? (
                    <img
                      src={getImageUrl(settings.logo_url)}
                      alt="Logo preview"
                      className="w-full h-auto object-contain mb-4"
                    />
                  ) : (
                    <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm mb-4">
                      Logo
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}
