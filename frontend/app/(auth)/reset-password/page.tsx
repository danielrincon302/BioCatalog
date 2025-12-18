'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { languages, Language } from '@/lib/i18n';
import { passwordApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Leaf, Globe, ChevronDown, ArrowLeft, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    setIsLoading(true);

    try {
      await passwordApi.resetPassword(email, token, password, passwordConfirmation);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth.resetPasswordError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === language);

  const isValidRequest = token && email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/catalog" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BioCatalog</span>
            </Link>
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700 hidden sm:inline">{currentLang?.flag} {currentLang?.name}</span>
                  <span className="text-sm text-gray-700 sm:hidden">{currentLang?.flag}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[140px] z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          language === lang.code ? 'bg-gray-50 text-primary' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.auth.backToLogin}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Password Form */}
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${success ? 'bg-green-500' : !isValidRequest ? 'bg-red-500' : 'bg-primary'}`}>
                {success ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : !isValidRequest ? (
                  <AlertCircle className="h-8 w-8 text-white" />
                ) : (
                  <KeyRound className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {success ? t.auth.passwordReset : !isValidRequest ? t.auth.invalidResetLink : t.auth.resetPassword}
            </CardTitle>
            <CardDescription>
              {success
                ? t.auth.passwordResetSuccess
                : !isValidRequest
                  ? t.auth.invalidResetLinkDescription
                  : t.auth.resetPasswordDescription}
            </CardDescription>
          </CardHeader>

          {success ? (
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-700 text-sm">
                  {t.auth.canNowLogin}
                </p>
              </div>
            </CardContent>
          ) : !isValidRequest ? (
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-red-700 text-sm">
                  {t.auth.requestNewResetLink}
                </p>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>{t.auth.username}:</strong> {email}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t.auth.newPassword}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="passwordConfirmation" className="text-sm font-medium">
                    {t.auth.confirmPassword}
                  </label>
                  <Input
                    id="passwordConfirmation"
                    type="password"
                    placeholder="********"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t.auth.resetting : t.auth.resetPasswordButton}
                </Button>
              </CardFooter>
            </form>
          )}

          <CardFooter className="pt-0">
            <Link
              href={success ? '/login' : '/forgot-password'}
              className="text-sm text-primary hover:underline text-center w-full"
            >
              {success ? t.auth.goToLogin : t.auth.requestNewLink}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
