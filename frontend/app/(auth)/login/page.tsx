'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { languages, Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Leaf, Globe, ChevronDown, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/items');
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === language);

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
              <Link href="/catalog">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.nav.backToCatalog}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t.auth.loginTitle}</CardTitle>
          <CardDescription>
            {t.auth.loginSubtitle}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t.auth.username}
              </label>
              <Input
                id="email"
                type="text"
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t.auth.password}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t.auth.loggingIn : t.auth.loginButton}
            </Button>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline text-center"
            >
              {t.auth.forgotPassword}
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              {t.auth.defaultCredentials}
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
