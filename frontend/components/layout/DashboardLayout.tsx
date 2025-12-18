'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { languages, Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import ProfilePanel from '@/components/profile/ProfilePanel';
import {
  Leaf,
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  Globe,
  ExternalLink,
  UserCircle
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isLoading, isSuperAdmin, isAdmin } = useAuth();
  const { language, setLanguage, t, translateRole } = useLanguage();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navigation = [
    { name: t.nav.items, href: '/items', icon: LayoutDashboard, show: true },
    { name: t.nav.users, href: '/users', icon: Users, show: isSuperAdmin() || isAdmin() },
    { name: t.nav.companies, href: '/companies', icon: Building2, show: isSuperAdmin() },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold">BioCatalog</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BioCatalog</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.filter(item => item.show).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Public Catalog Link */}
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/catalog"
                target="_blank"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <ExternalLink className="h-5 w-5" />
                <span>{t.nav.publicCatalog}</span>
              </Link>
            </div>
          </nav>

          {/* Language selector */}
          <div className="border-t px-4 py-3">
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{t.nav.language}</span>
                <span className="ml-auto text-gray-500">
                  {languages.find(l => l.code === language)?.flag}
                </span>
              </button>
              {langMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-md shadow-lg py-1">
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
          </div>

          {/* User info & logout */}
          <div className="border-t px-4 py-4">
            <div className="mb-3">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{translateRole(user.role.name)}</p>
              <p className="text-xs text-gray-400">{user.company.name}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setProfilePanelOpen(true);
                  setSidebarOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                {t.nav.profile}
              </button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.nav.logout}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Panel */}
      <ProfilePanel
        isOpen={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
      />
    </div>
  );
}
